package admin

import (
	"fmt"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"github.com/nvnrchmn/smarthub-v2/pkg/settings"
)

type Handler struct {
	repo *Repository
	st   *settings.Store
}

func NewHandler(repo *Repository, st *settings.Store) *Handler {
	return &Handler{repo: repo, st: st}
}

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	r := app.Group("/admin")
	r.Use(mw.RoleRequired("super_admin"))
	r.Get("/summary", h.Summary)
	r.Get("/tenants", h.ListTenants)
	r.Get("/tenants/:id", h.GetTenantDetail)
	r.Get("/users", h.ListUsers)
	r.Get("/settings", h.GetSettings)
	r.Post("/settings", h.SaveSettings)
	r.Get("/analytics", h.Analytics)
	r.Get("/audit-logs", h.ListAuditLogs)
	r.Post("/audit-log", h.CreateAuditLog)
	r.Get("/broadcasts", h.ListBroadcasts)
	r.Post("/broadcasts", h.CreateBroadcast)
}

func (h *Handler) Summary(c fiber.Ctx) error {
	s, err := h.repo.Summary()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(s)
}

func (h *Handler) ListTenants(c fiber.Ctx) error {
	tenants, err := h.repo.ListTenants()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(tenants)
}

func (h *Handler) GetTenantDetail(c fiber.Ctx) error {
	id := c.Params("id")
	var tenantID int
	fmt.Sscanf(id, "%d", &tenantID)
	d, err := h.repo.GetTenantDetail(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(d)
}

func (h *Handler) ListUsers(c fiber.Ctx) error {
	users, err := h.repo.ListUsers()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(users)
}

func (h *Handler) GetSettings(c fiber.Ctx) error {
	key := c.Query("key")
	if key == "" {
		return c.JSON(fiber.Map{"error": "key wajib"})
	}
	val, _ := h.st.Get(key)
	return c.JSON(fiber.Map{"key": key, "value": val})
}

func (h *Handler) SaveSettings(c fiber.Ctx) error {
	var req struct {
		XenditSecretKey    string `json:"xendit_secret_key"`
		XenditWebhookToken string `json:"xendit_webhook_token"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	saved := 0
	if req.XenditSecretKey != "" {
		if err := h.st.SetSecret("xendit_secret_key", req.XenditSecretKey); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan key"})
		}
		saved++
	}
	if req.XenditWebhookToken != "" {
		if err := h.st.SetSecret("xendit_webhook_token", req.XenditWebhookToken); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan token"})
		}
		saved++
	}
	return c.JSON(fiber.Map{"message": fmt.Sprintf("%d kredensial disimpan", saved)})
}

func (h *Handler) CreateAuditLog(c fiber.Ctx) error {
	var req struct {
		Action   string `json:"action"`
		Resource string `json:"resource"`
		Detail   string `json:"detail"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	if req.Action == "" {
		return c.Status(400).JSON(fiber.Map{"error": "action wajib diisi"})
	}
	log := &model.AuditLog{
		IDUser:    c.Locals("user_id").(int),
		IDTenant:  c.Locals("tenant_id").(int),
		Action:    req.Action,
		Resource:  req.Resource,
		Detail:    req.Detail,
		IPAddress: c.IP(),
	}
	if err := h.repo.CreateAuditLog(log); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal mencatat log"})
	}
	return c.JSON(fiber.Map{"message": "log tercatat"})
}

func (h *Handler) ListAuditLogs(c fiber.Ctx) error {
	data, err := h.repo.ListAuditLogs(50)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat audit logs"})
	}
	return c.JSON(data)
}

func (h *Handler) CreateBroadcast(c fiber.Ctx) error {
	var req struct {
		Title   string `json:"title"`
		Message string `json:"message"`
		Tipe    string `json:"tipe"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	userID := c.Locals("user_id").(int)
	if err := h.repo.CreateBroadcast(userID, req.Title, req.Message, req.Tipe); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal mengirim broadcast"})
	}
	return c.JSON(fiber.Map{"message": "broadcast terkirim"})
}

func (h *Handler) ListBroadcasts(c fiber.Ctx) error {
	data, err := h.repo.ListBroadcasts(20)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat broadcasts"})
	}
	return c.JSON(data)
}

func (h *Handler) Analytics(c fiber.Ctx) error {
	data, err := h.repo.Analytics()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat analytics"})
	}
	return c.JSON(data)
}
