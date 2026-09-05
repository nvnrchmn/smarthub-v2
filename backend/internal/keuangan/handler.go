package keuangan

import (
	"fmt"
	"log"
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
	// Webhook Xendit WAJIB publik — callback dari server Xendit (tanpa Bearer token).
	// Sebelumnya terdaftar di bawah grup /keuangan yang pakai AuthRequired → selalu 401.
	app.Post("/keuangan/webhook/xendit", h.WebhookXendit)

	r := app.Group("/keuangan", mw.AuthRequired)
	r.Get("/tagihan", h.GetTagihan)
	r.Post("/tagihan/:id/bayar", h.BayarTagihan)
	r.Post("/tagihan/:id/verifikasi", h.VerifikasiTagihan)

	// Generate tagihan hanya untuk pengurus RT / super admin
	g := app.Group("/keuangan", mw.RoleRequired("ketua_rt", "super_admin"))
	g.Post("/tagihan/generate", h.GenerateTagihan)
	g.Post("/tagihan/generate-rumah", h.GenerateTagihanRumah)
}

func (h *Handler) BayarTagihan(c fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tagihan tidak valid"})
	}
	userID := c.Locals("user_id").(int)
	tenantID := c.Locals("tenant_id").(int)

	// Opsional: email pembayar dari body (tidak wajib)
	var req struct {
		PayerEmail string `json:"payer_email"`
	}

	_ = c.Bind().JSON(&req)

	successURL := os.Getenv("FRONTEND_URL")
	if successURL == "" {
		successURL = "https://smarthub.logikraf.id"
	}
	successURL = successURL + "/app/tagihan?status=success&id=" + strconv.Itoa(id)

	payURL, err := h.service.BayarTagihan(id, userID, tenantID, req.PayerEmail, successURL)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"payment_url": payURL})
}

// VerifikasiTagihan — cek status invoice di Xendit lalu catat lunas bila PAID.
// Dipakai saat user kembali dari halaman bayar (cadangan bila webhook telat/tidak terpasang).
func (h *Handler) VerifikasiTagihan(c fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tagihan tidak valid"})
	}
	tenantID := c.Locals("tenant_id").(int)
	status, err := h.service.VerifikasiTagihan(id, tenantID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"status": status})
}

func (h *Handler) GetTagihan(c fiber.Ctx) error {
	// Tenant diambil dari JWT, bukan query param
	tenantID := c.Locals("tenant_id").(int)
	status := c.Query("status", "")
	data, err := h.service.GetTagihanByTenant(tenantID, status)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(data)
}

type generateReq struct {
	Periode string `json:"periode"`
}

func (h *Handler) GenerateTagihan(c fiber.Ctx) error {
	var req generateReq
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	if req.Periode == "" {
		return c.Status(400).JSON(fiber.Map{"error": "periode wajib diisi (YYYY-MM)"})
	}
	// Tenant dari JWT — jangan percaya body
	tenantID := c.Locals("tenant_id").(int)
	created, err := h.service.GenerateTagihanBulk(tenantID, req.Periode)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": fmt.Sprintf("%d tagihan di-generate", created)})
}

type generateRumahReq struct {
	RumahID int    `json:"id_rumah"`
	Periode string `json:"periode"`
}

func (h *Handler) GenerateTagihanRumah(c fiber.Ctx) error {
	var req generateRumahReq
	if err := c.Bind().JSON(&req); err != nil || req.RumahID <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	if req.Periode == "" {
		return c.Status(400).JSON(fiber.Map{"error": "periode wajib diisi"})
	}
	tagihan, err := h.service.GenerateTagihanPerRumah(c.Locals("tenant_id").(int), req.RumahID, req.Periode)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(tagihan)
}

func (h *Handler) WebhookXendit(c fiber.Ctx) error {
	// Validate X-Callback-Token (setting DB dikelola Super Admin, fallback env)
	token := h.service.WebhookToken()
	if token != "" && c.Get("X-Callback-Token") != token {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}

	var payload struct {
		ID         string `json:"id"`
		Status     string `json:"status"`
		ExternalID string `json:"external_id"`
	}
	if err := c.Bind().JSON(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}

	if err := h.service.HandleWebhook(payload.ID, payload.Status); err != nil {
		log.Printf("[webhook-xendit] invoice=%s status=%s err=%v", payload.ID, payload.Status, err)
		// Tetap 200 agar Xendit berhenti retry; masalah dicatat di log.
		return c.JSON(fiber.Map{"status": "ok", "note": "received"})
	}
	log.Printf("[webhook-xendit] invoice=%s status=%s → diproses", payload.ID, payload.Status)
	return c.JSON(fiber.Map{"status": "ok"})
}
