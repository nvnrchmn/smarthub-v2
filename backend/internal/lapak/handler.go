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
	if p.NamaProduk == "" {
		return c.Status(400).JSON(fiber.Map{"error": "nama produk wajib diisi"})
	}
	if err := h.service.Create(&p); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(p)
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
