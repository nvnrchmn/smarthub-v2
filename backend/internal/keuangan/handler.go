package keuangan

import (
	"fmt"
	"os"
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

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	r := app.Group("/keuangan")
	r.Use(mw.AuthRequired)

	r.Get("/tagihan", h.GetTagihan)
	r.Post("/tagihan/generate", h.GenerateTagihan)
	r.Post("/webhook/xendit", h.WebhookXendit)
}

func (h *Handler) GetTagihan(c fiber.Ctx) error {
	tenantID, _ := strconv.Atoi(c.Query("tenant_id", "1"))
	status := c.Query("status", "")
	data, err := h.service.GetTagihanByTenant(tenantID, status)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(data)
}

type generateReq struct {
	TenantID int    `json:"tenant_id"`
	Periode  string `json:"periode"`
}

func (h *Handler) GenerateTagihan(c fiber.Ctx) error {
	var req generateReq
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	created, err := h.service.GenerateTagihanBulk(req.TenantID, req.Periode)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": fmt.Sprintf("%d tagihan di-generate", created)})
}

func (h *Handler) WebhookXendit(c fiber.Ctx) error {
	// Validate X-Callback-Token
	token := os.Getenv("XENDIT_WEBHOOK_TOKEN")
	if token != "" && c.Get("X-Callback-Token") != token {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}

	var payload struct {
		ID          string `json:"id"`
		Status      string `json:"status"`
		ExternalID  string `json:"external_id"`
	}
	if err := c.Bind().JSON(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}

	if err := h.service.HandleWebhook(payload.ID, payload.Status); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"status": "ok"})
}
