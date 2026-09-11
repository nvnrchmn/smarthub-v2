package middleware

import (
	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type AuditMiddleware struct {
	db *gorm.DB
}

func NewAuditMiddleware(db *gorm.DB) *AuditMiddleware {
	return &AuditMiddleware{db: db}
}

// Log records audit log for mutating operations (POST, PUT, DELETE, PATCH)
func (m *AuditMiddleware) Log(action, resource string) fiber.Handler {
	return func(c fiber.Ctx) error {
		// Only log mutating methods
		method := c.Method()
		if method != "POST" && method != "PUT" && method != "DELETE" && method != "PATCH" {
			return c.Next()
		}

		// Get user info from JWT
		userID, _ := c.Locals("user_id").(int)
		tenantID, _ := c.Locals("tenant_id").(int)

		// Log after request completes
		err := c.Next()

		go func() {
			detail := method + " " + c.Path()
			m.db.Create(&model.AuditLog{
				IDUser:   userID,
				IDTenant: tenantID,
				Action:   action,
				Resource: resource,
				Detail:   detail,
				IPAddress: c.IP(),
			})
		}()

		return err
	}
}