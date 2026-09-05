package notifikasi

import (
	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"mime/multipart"
	"strconv"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	r := app.Group("/notifikasi")
	r.Use(mw.AuthRequired)
	r.Get("/", h.List)
	r.Put("/read-all", h.ReadAll)
	r.Put("/:id/read", h.MarkRead)
	r.Post("/upload-ktp", h.UploadKTP)
}

func (h *Handler) List(c fiber.Ctx) error {
	userID := c.Locals("user_id").(int)
	list, err := h.service.ListByUser(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat notifikasi"})
	}
	unread, _ := h.service.CountUnread(userID)
	return c.JSON(fiber.Map{"list": list, "unread": unread})
}

func (h *Handler) ReadAll(c fiber.Ctx) error {
	userID := c.Locals("user_id").(int)
	if err := h.service.MarkAllRead(userID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menandai dibaca"})
	}
	return c.JSON(fiber.Map{"message": "semua notifikasi ditandai dibaca"})
}

func (h *Handler) MarkRead(c fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tidak valid"})
	}
	if err := h.service.MarkRead(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menandai dibaca"})
	}
	return c.JSON(fiber.Map{"message": "notifikasi ditandai dibaca"})
}

func (h *Handler) UploadKTP(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	
	file, err := c.FormFile("ktp")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "file KTP wajib diupload"})
	}
	
	url, err := UploadKTP(file, tenantID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	
	return c.JSON(fiber.Map{"message": "KTP berhasil diupload", "url": url})
}

var _ = (*multipart.FileHeader)(nil)
