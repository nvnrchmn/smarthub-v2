package notifikasi

import (
	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) ListByUser(userID int) ([]model.Notifikasi, error) {
	var list []model.Notifikasi
	err := r.db.Where("id_user = ?", userID).Order("created_at DESC").Limit(50).Find(&list).Error
	return list, err
}

func (r *Repository) CountUnread(userID int) (int, error) {
	var n int64
	err := r.db.Model(&model.Notifikasi{}).Where("id_user = ? AND is_read = 0", userID).Count(&n).Error
	return int(n), err
}

func (r *Repository) MarkAllRead(userID int) error {
	return r.db.Model(&model.Notifikasi{}).Where("id_user = ?", userID).Update("is_read", true).Error
}

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler { return &Handler{repo: repo} }

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	r := app.Group("/notifikasi")
	r.Use(mw.AuthRequired)
	r.Get("/", h.List)
	r.Put("/read-all", h.ReadAll)
}

func (h *Handler) List(c fiber.Ctx) error {
	userID := c.Locals("user_id").(int)
	list, err := h.repo.ListByUser(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	unread, _ := h.repo.CountUnread(userID)
	return c.JSON(fiber.Map{"list": list, "unread": unread})
}

func (h *Handler) ReadAll(c fiber.Ctx) error {
	userID := c.Locals("user_id").(int)
	if err := h.repo.MarkAllRead(userID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "dibaca"})
}

// var _ = strings.TrimSpace
