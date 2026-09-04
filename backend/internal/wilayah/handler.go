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
	r.Use(mw.AuthRequired)
	r.Get("/rumah", h.GetRumahByTenant)
	r.Post("/rumah", h.CreateRumah)
	r.Put("/rumah/:id", h.UpdateRumah)
	r.Delete("/rumah/:id", h.DeleteRumah)
}

func (h *Handler) GetRumahByTenant(c fiber.Ctx) error {
	tenantID, _ := strconv.Atoi(c.Query("tenant_id", "1"))
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
		TenantID:      req.TenantID,
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
	var req rumahRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	existing, err := h.service.GetRumahByID(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "rumah tidak ditemukan"})
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
	if err := h.service.DeleteRumah(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "rumah berhasil dihapus"})
}
