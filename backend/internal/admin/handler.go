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
	r.Get("/users", h.ListUsers)
}

func (h *Handler) ListUsers(c fiber.Ctx) error {
	data, err := h.repo.ListUsers()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// Jangan bocorkan password_hash
	safe := make([]fiber.Map, 0, len(data))
	for _, u := range data {
		safe = append(safe, fiber.Map{
			"id_user":   u.ID,
			"id_tenant": u.TenantID,
			"nomor_wa":  u.NomorWA,
			"role":      u.Role,
			"is_active": u.IsActive,
		})
	}
	return c.JSON(safe)
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
