package middleware

import (
	"errors"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/pkg/jwt"
	"gorm.io/gorm"
)

type AuthMiddleware struct {
	j  *jwt.JWT
	db *gorm.DB
}

func NewAuthMiddleware(j *jwt.JWT, db *gorm.DB) *AuthMiddleware {
	return &AuthMiddleware{j: j, db: db}
}

var (
	errNoToken    = errors.New("token tidak ditemukan")
	errBadFormat  = errors.New("format token tidak valid")
	errBadToken   = errors.New("token tidak valid")
)

// parseBearer mengekstrak token dari header "Authorization: Bearer <token>";
// mengembalikan "" jika format salah. Dipakai BlacklistCheck (blacklist.go).
func parseBearer(auth string) string {
	parts := strings.Split(auth, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}
	return parts[1]
}

// resolve memvalidasi token & mengisi locals. TANPA c.Next() — aman dipanggil
// dari middleware lain (mencegah double-Next & race di role check).
// Mengembalikan error SENTINEL saat gagal; caller (AuthRequired/RoleRequired)
// yang menuliskan respons 401 agar error JSON tidak bocor ke ErrorHandler.
func (m *AuthMiddleware) resolve(c fiber.Ctx) error {
	// Satu resolve per request: route yang memakai AuthRequired + RoleRequired
	// berantai akan memanggil resolve() 2× — hindari parse JWT & query DB ganda.
	if c.Locals("auth_checked") == true {
		return nil
	}
	auth := c.Get("Authorization")
	if auth == "" {
		return errNoToken
	}
	parts := strings.Split(auth, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return errBadFormat
	}
	claims, err := m.j.Validate(parts[1])
	if err != nil {
		return errBadToken
	}
	c.Locals("user_id", claims.UserID)
	c.Locals("tenant_id", claims.TenantID)
	c.Locals("role", claims.Role)

	// Audit 2026-09-05: klaim JWT tidak lagi dipercaya penuh — validasi ke DB:
	// user harus masih ada, status tidak diblokir, dan ROLE diambil dari DB
	// (bukan klaim). Cegah: user dihapus/di-suspend tetap pakai token 72 jam,
	// dan token forged/role stale (mis. role=super_admin hasil eksploit lama).
	var u struct {
		Role       string
		UserStatus string
	}
	if err := m.db.Table("users").Select("role, user_status").Where("id_user = ?", claims.UserID).First(&u).Error; err != nil {
		return errBadToken // user tidak ditemukan / DB error → tolak (no auth-bypass)
	}
	switch u.UserStatus {
	case "rejected", "banned", "suspend", "nonaktif":
		return errBadToken // akun diblokir → sesi dicabut
	}
	c.Locals("role", u.Role)
	c.Locals("auth_checked", true)
	return nil
}

func (m *AuthMiddleware) AuthRequired(c fiber.Ctx) error {
	if err := m.resolve(c); err != nil {
		// return error SENTINEL langsung → ErrorHandler global akan mengubahnya
		// jadi 500; karena itu tulis 401 di sini & hentikan rantai (return nil).
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Next()
}

func (m *AuthMiddleware) RoleRequired(roles ...string) fiber.Handler {
	return func(c fiber.Ctx) error {
		if err := m.resolve(c); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
		}
		role, _ := c.Locals("role").(string)
		for _, r := range roles {
			if role == r {
				return c.Next()
			}
		}
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "akses ditolak"})
	}
}
