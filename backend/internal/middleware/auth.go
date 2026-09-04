package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/pkg/jwt"
)

func AuthRequired(j *jwt.JWT) fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{"error": "token tidak ditemukan"})
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return c.Status(401).JSON(fiber.Map{"error": "format token salah. Gunakan: Bearer <token>"})
		}
		claims, err := j.Validate(parts[1])
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "token tidak valid atau sudah kadaluarsa"})
		}
		c.Locals("user_id", claims.UserID)
		c.Locals("tenant_id", claims.TenantID)
		c.Locals("role", claims.Role)
		return c.Next()
	}
}

func RoleRequired(roles ...string) fiber.Handler {
	return func(c fiber.Ctx) error {
		userRole := c.Locals("role")
		for _, r := range roles {
			if userRole == r {
				return c.Next()
			}
		}
		return c.Status(403).JSON(fiber.Map{"error": "akses ditolak"})
	}
}
