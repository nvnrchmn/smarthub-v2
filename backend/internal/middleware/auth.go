package middleware

import (
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

func (m *AuthMiddleware) AuthRequired(c fiber.Ctx) error {
	auth := c.Get("Authorization")
	if auth == "" {
		return c.Status(401).JSON(fiber.Map{"error": "token tidak ditemukan"})
	}
	parts := strings.Split(auth, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(401).JSON(fiber.Map{"error": "format token tidak valid"})
	}
	claims, err := m.j.Validate(parts[1])
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "token tidak valid"})
	}
	c.Locals("user_id", claims.UserID)
	c.Locals("tenant_id", claims.TenantID)
	c.Locals("role", claims.Role)
	return c.Next()
}

func (m *AuthMiddleware) RoleRequired(roles ...string) fiber.Handler {
	return func(c fiber.Ctx) error {
		if err := m.AuthRequired(c); err != nil {
			return err
		}
		role := c.Locals("role").(string)
		for _, r := range roles {
			if role == r {
				return c.Next()
			}
		}
		return c.Status(403).JSON(fiber.Map{"error": "akses ditolak"})
	}
}
