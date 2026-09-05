package cms

import (
	"encoding/json"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// Get returns a section by name
func (s *Service) Get(section string) (*model.CMSLanding, error) {
	var cms model.CMSLanding
	if err := s.db.Where("section = ?", section).First(&cms).Error; err != nil {
		return nil, err
	}
	return &cms, nil
}

// GetAll returns all sections
func (s *Service) GetAll() (map[string]json.RawMessage, error) {
	var list []model.CMSLanding
	if err := s.db.Find(&list).Error; err != nil {
		return nil, err
	}
	result := make(map[string]json.RawMessage)
	for _, cms := range list {
		result[cms.Section] = json.RawMessage(cms.Data)
	}
	return result, nil
}

// Update updates a section
func (s *Service) Update(section string, data json.RawMessage, userID int) error {
	var cms model.CMSLanding
	err := s.db.Where("section = ?", section).First(&cms).Error
	if err != nil {
		// Create new
		cms = model.CMSLanding{Section: section, Data: model.JSON(data), UpdatedBy: &userID}
		return s.db.Create(&cms).Error
	}
	cms.Data = model.JSON(data)
	cms.UpdatedBy = &userID
	return s.db.Save(&cms).Error
}

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Public endpoint - no auth required
func (h *Handler) Get(c fiber.Ctx) error {
	section := c.Query("section")
	if section == "" {
		data, err := h.service.GetAll()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(data)
	}
	cms, err := h.service.Get(section)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "section tidak ditemukan"})
	}
	return c.JSON(cms.Data)
}

// Admin endpoints
func (h *Handler) Update(c fiber.Ctx) error {
	section := c.Params("section")
	var req struct {
		Data json.RawMessage `json:"data"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "data tidak valid"})
	}
	userID := c.Locals("user_id").(int)
	if err := h.service.Update(section, req.Data, userID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan"})
	}
	return c.JSON(fiber.Map{"message": "tersimpan"})
}

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	app.Get("/cms/landing", h.Get)
	app.Put("/admin/cms/:section", mw.AuthRequired, mw.RoleRequired("super_admin"), h.Update)
}
