package subscription

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

func (h *Handler) GetLayanan(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	list, err := h.service.GetLayananByTenant(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) GetInvoices(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	list, err := h.service.GetInvoices(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) PayInvoice(c fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tidak valid"})
	}
	var req struct {
		Metode string `json:"metode"`
	}
	c.Bind().JSON(&req)
	if err := h.service.PayInvoice(id, req.Metode); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal bayar"})
	}
	return c.JSON(fiber.Map{"message": "pembayaran berhasil"})
}

func (h *Handler) ListAll(c fiber.Ctx) error {
	list, err := h.service.ListAll()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *Handler) Summary(c fiber.Ctx) error {
	s, err := h.service.Summary()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(s)
}

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	app.Get("/subscription/layanan", mw.AuthRequired, h.GetLayanan)
	app.Get("/subscription/invoices", mw.AuthRequired, h.GetInvoices)
	app.Post("/subscription/invoices/:id/pay", mw.AuthRequired, h.PayInvoice)
	app.Get("/admin/subscription/layanan", mw.AuthRequired, mw.RoleRequired("super_admin"), h.ListAll)
	app.Get("/admin/subscription/summary", mw.AuthRequired, mw.RoleRequired("super_admin"), h.Summary)
}
