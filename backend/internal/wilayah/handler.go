package wilayah

import (
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"github.com/nvnrchmn/smarthub-v2/internal/model"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	r := app.Group("/wilayah")
	r.Get("/rumah", mw.AuthRequired, h.GetRumahByTenant)

	// Mutasi data rumah hanya untuk pengurus RT (ketua_rt / super_admin)
	m := app.Group("/wilayah")
	m.Use(mw.RoleRequired("ketua_rt", "super_admin"))
	m.Post("/rumah", h.CreateRumah)
	m.Put("/rumah/:id", h.UpdateRumah)
	m.Delete("/rumah/:id", h.DeleteRumah)
}

func (h *Handler) GetRumahByTenant(c fiber.Ctx) error {
	// Tenant diambil dari JWT, bukan query param
	tenantID := c.Locals("tenant_id").(int)
	rumahs, err := h.service.GetRumahByTenant(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(rumahs)
}

type rumahRequest struct {
	ID             int    `json:"id_rumah,omitempty"`
	TenantID       int    `json:"id_tenant"`
	NamaJalanGang  string `json:"nama_jalan_gang"`
	NomorRumah     string `json:"nomor_rumah"`
	StatusHunian   string `json:"status_hunian"`
}

func (h *Handler) CreateRumah(c fiber.Ctx) error {
	var req rumahRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	rumah := &model.Rumah{
		TenantID:      c.Locals("tenant_id").(int), // dipaksa dari JWT, bukan body
		NamaJalanGang: req.NamaJalanGang,
		NomorRumah:    req.NomorRumah,
		StatusHunian:  req.StatusHunian,
	}
	if rumah.StatusHunian == "" {
		rumah.StatusHunian = "Dihuni"
	}
	if err := h.service.CreateRumah(rumah); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(rumah)
}

func (h *Handler) UpdateRumah(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	tenantID := c.Locals("tenant_id").(int)

	existing, err := h.service.GetRumahByID(id)
	if err != nil || existing.TenantID != tenantID {
		return c.Status(404).JSON(fiber.Map{"error": "rumah tidak ditemukan"})
	}

	var req rumahRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	if req.NamaJalanGang != "" {
		existing.NamaJalanGang = req.NamaJalanGang
	}
	if req.NomorRumah != "" {
		existing.NomorRumah = req.NomorRumah
	}
	if req.StatusHunian != "" {
		existing.StatusHunian = req.StatusHunian
	}
	if err := h.service.UpdateRumah(existing); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(existing)
}

func (h *Handler) DeleteRumah(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	tenantID := c.Locals("tenant_id").(int)

	existing, err := h.service.GetRumahByID(id)
	if err != nil || existing.TenantID != tenantID {
		return c.Status(404).JSON(fiber.Map{"error": "rumah tidak ditemukan"})
	}
	if err := h.service.DeleteRumah(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "rumah berhasil dihapus"})
}
