package lapak

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
	r := app.Group("/lapak")
	r.Use(mw.AuthRequired)
	r.Get("/", h.GetAll)
	r.Get("/:id", h.GetByID)
	r.Post("/", h.Create)
	r.Put("/:id/status", h.SetStatus)
	r.Delete("/:id", h.Delete)
}

func (h *Handler) GetAll(c fiber.Ctx) error {
	// Scope per tenant dari JWT
	tenantID := c.Locals("tenant_id").(int)
	produk, err := h.service.repo.GetAll(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(produk)
}

func (h *Handler) GetByID(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	tenantID := c.Locals("tenant_id").(int)
	p, err := h.service.repo.GetByID(id)
	if err != nil || p.IDTenant != tenantID {
		return c.Status(404).JSON(fiber.Map{"error": "produk tidak ditemukan"})
	}
	return c.JSON(p)
}

func (h *Handler) Create(c fiber.Ctx) error {
	var p model.Produk
	if err := c.Bind().JSON(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	// Tenant & penjual dipaksa dari JWT
	p.IDTenant = c.Locals("tenant_id").(int)
	p.IDUser = c.Locals("user_id").(int)
	role := c.Locals("role").(string)
	if p.NamaProduk == "" {
		return c.Status(400).JSON(fiber.Map{"error": "nama produk wajib diisi"})
	}
	// Produk warga perlu persetujuan pengurus RT; produk pengurus langsung tayang.
	if role != "ketua_rt" && role != "super_admin" {
		p.IsApproved = false
	} else {
		p.IsApproved = true
	}
	if err := h.service.Create(&p); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(p)
}

// SetStatus — moderasi oleh pengurus RT / super_admin (setujui / sembunyikan).
func (h *Handler) SetStatus(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	tenantID := c.Locals("tenant_id").(int)
	role := c.Locals("role").(string)
	if role != "ketua_rt" && role != "super_admin" {
		return c.Status(403).JSON(fiber.Map{"error": "hanya pengurus RT yang bisa memoderasi"})
	}
	var req struct {
		IsApproved bool `json:"is_approved"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	p, err := h.service.repo.GetByID(id)
	if err != nil || p.IDTenant != tenantID {
		return c.Status(404).JSON(fiber.Map{"error": "produk tidak ditemukan"})
	}
	if err := h.service.repo.SetApproved(id, req.IsApproved); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "status produk diperbarui", "is_approved": req.IsApproved})
}

func (h *Handler) Delete(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	userID := c.Locals("user_id").(int)
	tenantID := c.Locals("tenant_id").(int)
	role := c.Locals("role").(string)

	p, err := h.service.repo.GetByID(id)
	if err != nil || p.IDTenant != tenantID {
		return c.Status(404).JSON(fiber.Map{"error": "produk tidak ditemukan"})
	}
	// Hanya pemilik, ketua_rt, atau super_admin yang boleh hapus
	if p.IDUser != userID && role != "ketua_rt" && role != "super_admin" {
		return c.Status(403).JSON(fiber.Map{"error": "bukan pemilik produk"})
	}
	if err := h.service.repo.Delete(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "produk berhasil dihapus"})
}
