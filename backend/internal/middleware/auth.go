package middleware

import (
	"errors"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/pkg/jwt"
)

type AuthMiddleware struct {
	j *jwt.JWT
}

func NewAuthMiddleware(j *jwt.JWT) *AuthMiddleware {
	return &AuthMiddleware{j: j}
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
