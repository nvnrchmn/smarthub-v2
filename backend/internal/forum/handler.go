package forum

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
	r := app.Group("/forum")
	r.Use(mw.AuthRequired)
	r.Get("/", h.GetThreads)
	r.Post("/", h.CreateThread)
	r.Get("/:id", h.GetThread)
	r.Post("/:id/komentar", h.CreateKomentar)
}

func (h *Handler) GetThreads(c fiber.Ctx) error {
	// Tenant diambil dari JWT, bukan query param
	tenantID := c.Locals("tenant_id").(int)
	threads, err := h.service.repo.GetThreadsByTenant(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(threads)
}

func (h *Handler) CreateThread(c fiber.Ctx) error {
	var t model.Thread
	if err := c.Bind().JSON(&t); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	t.IDTenant = c.Locals("tenant_id").(int)
	t.IDUser = c.Locals("user_id").(int)
	role := c.Locals("role").(string)
	if err := h.service.CreateThread(&t, role); err != nil {
		return c.Status(403).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(t)
}

func (h *Handler) GetThread(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	thread, err := h.service.repo.GetThreadByID(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "thread tidak ditemukan"})
	}
	// Cross-tenant tidak boleh diakses
	if thread.IDTenant != c.Locals("tenant_id").(int) {
		return c.Status(404).JSON(fiber.Map{"error": "thread tidak ditemukan"})
	}
	komentar, _ := h.service.repo.GetKomentarByThread(id)
	return c.JSON(fiber.Map{"thread": thread, "komentar": komentar})
}

func (h *Handler) CreateKomentar(c fiber.Ctx) error {
	threadID, _ := strconv.Atoi(c.Params("id"))
	// Thread harus milik tenant yang sama
	thread, err := h.service.repo.GetThreadByID(threadID)
	if err != nil || thread.IDTenant != c.Locals("tenant_id").(int) {
		return c.Status(404).JSON(fiber.Map{"error": "thread tidak ditemukan"})
	}
	var k model.Komentar
	if err := c.Bind().JSON(&k); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	k.IDThread = threadID
	k.IDUser = c.Locals("user_id").(int)
	if k.Komentar == "" {
		return c.Status(400).JSON(fiber.Map{"error": "komentar tidak boleh kosong"})
	}
	if err := h.service.CreateKomentar(&k); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(k)
}
