package auth

import (
	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/auth"
)

type Handler struct {
	service *auth.Service
}

func NewHandler(service *auth.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Login(c fiber.Ctx) error {
	var input auth.LoginInput
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "input tidak valid"})
	}
	resp, err := h.service.Login(input)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}

func (h *Handler) Register(c fiber.Ctx) error {
	var input auth.RegisterInput
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "input tidak valid"})
	}
	user, err := h.service.Register(input)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{
		"id":       user.ID,
		"nomor_wa": user.NomorWA,
		"role":     user.Role,
	})
}
