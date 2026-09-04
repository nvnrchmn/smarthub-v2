package admin

import (
	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	r := app.Group("/admin")
	r.Use(mw.RoleRequired("super_admin"))
	r.Get("/summary", h.Summary)
	r.Get("/tenants", h.ListTenants)
}

func (h *Handler) Summary(c fiber.Ctx) error {
	data, err := h.repo.Summary()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(data)
}

func (h *Handler) ListTenants(c fiber.Ctx) error {
	data, err := h.repo.ListTenants()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(data)
}
