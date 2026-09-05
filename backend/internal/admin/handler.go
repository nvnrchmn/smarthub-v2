package admin

import (
	"fmt"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"github.com/nvnrchmn/smarthub-v2/pkg/settings"
)

type Handler struct {
	repo *Repository
	st   *settings.Store
}

func NewHandler(repo *Repository, st *settings.Store) *Handler {
	return &Handler{repo: repo, st: st}
}

func mask(secret string) string {
	if secret == "" {
		return ""
	}
	if len(secret) <= 4 {
		return "••••"
	}
	return "••••" + secret[len(secret)-4:]
}

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	r := app.Group("/admin")
	r.Use(mw.RoleRequired("super_admin"))
	r.Get("/summary", h.Summary)
	r.Get("/tenants", h.ListTenants)
	r.Get("/users", h.ListUsers)
	r.Get("/settings", h.GetSettings)
	r.Post("/settings", h.SaveSettings)
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

// GetSettings — status key Xendit (hanya masked, tidak pernah bocorkan isi).
func (h *Handler) GetSettings(c fiber.Ctx) error {
	secret := h.st.GetSecret("xendit_secret_key")
	token := h.st.GetSecret("xendit_webhook_token")
	return c.JSON(fiber.Map{
		"xendit_secret_key_set":     secret != "",
		"xendit_secret_key_masked":  mask(secret),
		"xendit_webhook_token_set":  token != "",
		"xendit_webhook_token_masked": mask(token),
	})
}

func (h *Handler) SaveSettings(c fiber.Ctx) error {
	var req struct {
		XenditSecretKey  string `json:"xendit_secret_key"`
		XenditWebhookToken string `json:"xendit_webhook_token"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	saved := 0
	if req.XenditSecretKey != "" {
		if err := h.st.SetSecret("xendit_secret_key", req.XenditSecretKey); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan key: " + err.Error()})
		}
		saved++
	}
	if req.XenditWebhookToken != "" {
		if err := h.st.SetSecret("xendit_webhook_token", req.XenditWebhookToken); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan token: " + err.Error()})
		}
		saved++
	}
	return c.JSON(fiber.Map{"message": fmt.Sprintf("%d kredensial disimpan", saved), "saved": saved})
}
