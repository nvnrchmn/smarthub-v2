package settlement

import (
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type rekeningRequest struct {
	TotalNominal  int64  `json:"total_nominal"`
	BankCode      string `json:"bank_code"`
	AccountNumber string `json:"account_number"`
	AccountName   string `json:"account_name"`
	Note          string `json:"note"`
}

// RequestSettlement handles settlement request from tenant
func (h *Handler) RequestSettlement(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	userID := c.Locals("user_id").(int)

	var req rekeningRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}

	if req.TotalNominal <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "nominal harus lebih dari 0"})
	}
	if req.BankCode == "" || req.AccountNumber == "" || req.AccountName == "" {
		return c.Status(400).JSON(fiber.Map{"error": "data rekening wajib diisi"})
	}

	settlement := &SettlementRequest{
		TenantID:      tenantID,
		RequesterID:   userID,
		TotalNominal:  req.TotalNominal,
		BankCode:      req.BankCode,
		AccountNumber: req.AccountNumber,
		AccountName:   req.AccountName,
		Status:        "PENDING",
		Note:          req.Note,
	}

	if err := h.service.RequestSettlement(settlement); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal membuat permintaan settlement"})
	}

	return c.JSON(fiber.Map{
		"message": "permintaan settlement berhasil dibuat",
		"id":      settlement.ID,
	})
}

// GetSettlementBalance returns balance and paid invoices available for settlement
func (h *Handler) GetSettlementBalance(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)

	total, tagihan, err := h.service.GetSettlementBalance(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat data settlement"})
	}

	return c.JSON(fiber.Map{
		"total_balance":    total,
		"paid_tagihan":     tagihan,
		"paid_tagihan_cnt": len(tagihan),
	})
}

// ListSettlements list settlements (tenant scoped or all for super_admin)
func (h *Handler) ListSettlements(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	role := c.Locals("role").(string)
	status := c.Query("status")

	var tid *int
	if role != "super_admin" {
		tid = &tenantID
	}

	settlements, err := h.service.ListSettlements(tid, status)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat data settlement"})
	}

	return c.JSON(fiber.Map{"data": settlements})
}

// CompleteSettlement marks settlement as completed (super_admin only)
func (h *Handler) CompleteSettlement(c fiber.Ctx) error {
	userID := c.Locals("user_id").(int)

	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tidak valid"})
	}

	if err := h.service.CompleteSettlement(id, userID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyelesaikan settlement"})
	}

	return c.JSON(fiber.Map{"message": "settlement berhasil diselesaikan"})
}

// RejectSettlement rejects a settlement request (super_admin only)
func (h *Handler) RejectSettlement(c fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tidak valid"})
	}

	var req struct {
		Reason string `json:"reason"`
	}
	c.Bind().JSON(&req)

	if err := h.service.RejectSettlement(id, req.Reason); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menolak settlement"})
	}

	return c.JSON(fiber.Map{"message": "settlement berhasil ditolak"})
}

// SettlementSummary returns summary for super_admin dashboard
func (h *Handler) SettlementSummary(c fiber.Ctx) error {
	summary, err := h.service.SettlementSummary()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat ringkasan"})
	}
	return c.JSON(summary)
}

// RegisterRoute registers all settlement routes
func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	// Tenant routes (ketua_rt / bendahara)
	app.Get("/settlement/balance", mw.AuthRequired, h.GetSettlementBalance)
	app.Post("/settlement/request", mw.AuthRequired, h.RequestSettlement)
	app.Get("/settlements", mw.AuthRequired, h.ListSettlements)

	// Super admin routes
	app.Get("/admin/settlements/summary", mw.AuthRequired, mw.RoleRequired("super_admin"), h.SettlementSummary)
	app.Post("/admin/settlements/:id/complete", mw.AuthRequired, mw.RoleRequired("super_admin"), h.CompleteSettlement)
	app.Post("/admin/settlements/:id/reject", mw.AuthRequired, mw.RoleRequired("super_admin"), h.RejectSettlement)
}
