package settlement

import (
	"fmt"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// UpdateRekening update data rekening tenant
func (h *Handler) UpdateRekening(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	
	var req RekeningRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	
	if req.NamaPemilik == "" || req.BankCode == "" || req.NomorRekening == "" {
		return c.Status(400).JSON(fiber.Map{"error": "semua field wajib diisi"})
	}
	
	if err := h.service.UpdateRekening(tenantID, req); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan data rekening"})
	}
	
	return c.JSON(fiber.Map{"message": "data rekening berhasil disimpan"})
}

// UploadKTP update URL KTP tenant
func (h *Handler) UploadKTP(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	
	var req struct {
		KTPUrl string `json:"ktp_url"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	
	if req.KTPUrl == "" {
		return c.Status(400).JSON(fiber.Map{"error": "URL KTP wajib diisi"})
	}
	
	if err := h.service.UploadKTP(tenantID, req.KTPUrl); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan KTP"})
	}
	
	return c.JSON(fiber.Map{"message": "KTP berhasil diunggah"})
}

// GetSettlementInfo ambil data settlement tenant
func (h *Handler) GetSettlementInfo(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	
	tenant, err := h.service.GetSettlementInfo(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat data settlement"})
	}
	
	return c.JSON(tenant)
}

// ListSettlements list semua tenant (super admin)
func (h *Handler) ListSettlements(c fiber.Ctx) error {
	status := c.Query("status", "all")
	
	tenants, err := h.service.ListSettlements(status)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat data settlement"})
	}
	
	return c.JSON(fiber.Map{"data": tenants})
}

// VerifyKTP verifikasi KTP tenant (super admin)
func (h *Handler) VerifyKTP(c fiber.Ctx) error {
	tenantID := c.Params("id")
	
	var id int
	if _, err := fmt.Sscanf(tenantID, "%d", &id); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tidak valid"})
	}
	
	if err := h.service.VerifyKTP(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memverifikasi KTP"})
	}
	
	return c.JSON(fiber.Map{"message": "KTP berhasil diverifikasi"})
}

// RejectKTP tolak KTP tenant (super admin)
func (h *Handler) RejectKTP(c fiber.Ctx) error {
	tenantID := c.Params("id")
	
	var id int
	if _, err := fmt.Sscanf(tenantID, "%d", &id); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tidak valid"})
	}
	
	if err := h.service.RejectKTP(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menolak KTP"})
	}
	
	return c.JSON(fiber.Map{"message": "KTP berhasil ditolak"})
}

// GetSummary ringkasan settlement (super admin)
func (h *Handler) GetSummary(c fiber.Ctx) error {
	summary, err := h.service.GetSummary()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat ringkasan"})
	}
	
	return c.JSON(summary)
}

// RegisterRoute daftarkan semua route settlement
func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	// Tenant routes
	app.Post("/settlement/rekening", mw.AuthRequired, h.UpdateRekening)
	app.Post("/settlement/ktp", mw.AuthRequired, h.UploadKTP)
	app.Get("/settlement/info", mw.AuthRequired, h.GetSettlementInfo)
	
	// Super admin routes
	app.Get("/admin/settlements", mw.AuthRequired, mw.RoleRequired("super_admin"), h.ListSettlements)
	app.Get("/admin/settlements/summary", mw.AuthRequired, mw.RoleRequired("super_admin"), h.GetSummary)
	app.Post("/admin/settlements/:id/verify", mw.AuthRequired, mw.RoleRequired("super_admin"), h.VerifyKTP)
	app.Post("/admin/settlements/:id/reject", mw.AuthRequired, mw.RoleRequired("super_admin"), h.RejectKTP)
}
