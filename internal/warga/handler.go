package warga

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
	r := app.Group("/warga")
	r.Use(mw.AuthRequired)
	r.Get("/", h.GetWargaByTenant)
	r.Get("/rumah/:rumah_id", h.GetWargaByRumah)
	r.Post("/", h.CreateWarga)
	r.Put("/:id", h.UpdateWarga)
	r.Delete("/:id", h.DeleteWarga)
}

type wargaRequest struct {
	ID             int    `json:"id_warga,omitempty"`
	TenantID       int    `json:"id_tenant"`
	RumahID        int    `json:"id_rumah"`
	IDUser         *int   `json:"id_user"`
	NamaLengkap    string `json:"nama_lengkap"`
	NIK            string `json:"nik"`
	NoKK           string `json:"no_kk"`
	StatusHubungan string `json:"status_hubungan"`
	StatusWarga    string `json:"status_warga"`
}

func (h *Handler) GetWargaByTenant(c fiber.Ctx) error {
	tenantID, _ := strconv.Atoi(c.Query("tenant_id", "1"))
	wargas, err := h.service.GetWargaByTenant(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(wargas)
}

func (h *Handler) GetWargaByRumah(c fiber.Ctx) error {
	rumahID, _ := strconv.Atoi(c.Params("rumah_id"))
	wargas, err := h.service.GetWargaByRumah(rumahID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(wargas)
}

func (h *Handler) CreateWarga(c fiber.Ctx) error {
	var req wargaRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	warga := &model.Warga{
		TenantID:       req.TenantID,
		RumahID:        req.RumahID,
		NamaLengkap:    req.NamaLengkap,
		NIK:            req.NIK,
		NoKK:           req.NoKK,
		StatusHubungan: req.StatusHubungan,
		StatusWarga:    req.StatusWarga,
	}
	if req.IDUser != nil && *req.IDUser > 0 {
		warga.IDUser = req.IDUser
	}
	if err := h.service.CreateWarga(warga); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(warga)
}

func (h *Handler) UpdateWarga(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var req wargaRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	warga := &model.Warga{
		ID:             id,
		TenantID:       req.TenantID,
		RumahID:        req.RumahID,
		NamaLengkap:    req.NamaLengkap,
		NIK:            req.NIK,
		NoKK:           req.NoKK,
		StatusHubungan: req.StatusHubungan,
		StatusWarga:    req.StatusWarga,
	}
	if err := h.service.UpdateWarga(warga); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(warga)
}

func (h *Handler) DeleteWarga(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	if err := h.service.DeleteWarga(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "warga berhasil dihapus"})
}
