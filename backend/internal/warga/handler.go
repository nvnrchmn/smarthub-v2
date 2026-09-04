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
	r.Get("/", mw.AuthRequired, h.GetWargaByTenant)
	r.Get("/rumah/:rumah_id", mw.AuthRequired, h.GetWargaByRumah)

	// Mutasi data warga hanya untuk pengurus RT (ketua_rt / super_admin)
	m := app.Group("/warga")
	m.Use(mw.RoleRequired("ketua_rt", "super_admin"))
	m.Post("/", h.CreateWarga)
	m.Put("/:id", h.UpdateWarga)
	m.Delete("/:id", h.DeleteWarga)
}

type wargaRequest struct {
	ID             int    `json:"id_warga,omitempty"`
	TenantID       int    `json:"id_tenant"`
	RumahID        int    `json:"id_rumah"`
	IDUser         int    `json:"id_user"`
	NamaLengkap    string `json:"nama_lengkap"`
	NIK            string `json:"nik"`
	NoKK           string `json:"no_kk"`
	StatusHubungan string `json:"status_hubungan"`
	StatusWarga    string `json:"status_warga"`
}

func (h *Handler) GetWargaByTenant(c fiber.Ctx) error {
	// Tenant diambil dari JWT, bukan query param
	tenantID := c.Locals("tenant_id").(int)
	wargas, err := h.service.GetWargaByTenant(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(wargas)
}

func (h *Handler) GetWargaByRumah(c fiber.Ctx) error {
	rumahID, _ := strconv.Atoi(c.Params("rumah_id"))
	tenantID := c.Locals("tenant_id").(int)
	wargas, err := h.service.GetWargaByRumah(rumahID, tenantID)
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
	tenantID := c.Locals("tenant_id").(int)
	if req.NamaLengkap == "" {
		return c.Status(400).JSON(fiber.Map{"error": "nama lengkap wajib diisi"})
	}
	// Default sesuai enum DB bila tidak dikirim
	if req.StatusHubungan == "" {
		req.StatusHubungan = "Lainnya"
	}
	if req.StatusWarga == "" {
		req.StatusWarga = "Aktif"
	}
	if req.RumahID > 0 && !h.service.RumahExists(req.RumahID, tenantID) {
		return c.Status(400).JSON(fiber.Map{"error": "rumah tidak ditemukan di RT ini"})
	}
	var idUser *int
	if req.IDUser > 0 {
		v := req.IDUser
		idUser = &v
	}
	var rumahID *int
	if req.RumahID > 0 {
		v := req.RumahID
		rumahID = &v
	}
	warga := &model.Warga{
		TenantID:       tenantID,
		RumahID:        rumahID,
		IDUser:         idUser,
		NamaLengkap:    req.NamaLengkap,
		NIK:            req.NIK,
		NoKK:           req.NoKK,
		StatusHubungan: req.StatusHubungan,
		StatusWarga:    req.StatusWarga,
	}
	if err := h.service.CreateWarga(warga); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(warga)
}

func (h *Handler) UpdateWarga(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	tenantID := c.Locals("tenant_id").(int)

	existing, err := h.service.GetWargaByID(id)
	if err != nil || existing.TenantID != tenantID {
		return c.Status(404).JSON(fiber.Map{"error": "warga tidak ditemukan"})
	}

	var req wargaRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	// Overlay: hanya field yang dikirim yang diubah; sisanya pertahankan nilai
	// existing (cek status_hubungan dll adalah enum — string kosong = data truncated)
	if req.NamaLengkap != "" {
		existing.NamaLengkap = req.NamaLengkap
	}
	if req.NIK != "" {
		existing.NIK = req.NIK
	}
	if req.NoKK != "" {
		existing.NoKK = req.NoKK
	}
	if req.StatusHubungan != "" {
		existing.StatusHubungan = req.StatusHubungan
	}
	if req.StatusWarga != "" {
		existing.StatusWarga = req.StatusWarga
	}
	if err := h.service.UpdateWarga(existing); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(existing)
}

func (h *Handler) DeleteWarga(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	tenantID := c.Locals("tenant_id").(int)

	existing, err := h.service.GetWargaByID(id)
	if err != nil || existing.TenantID != tenantID {
		return c.Status(404).JSON(fiber.Map{"error": "warga tidak ditemukan"})
	}
	if err := h.service.DeleteWarga(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "warga berhasil dihapus"})
}
