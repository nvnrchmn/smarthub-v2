package tagihan_custom

import (
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"github.com/nvnrchmn/smarthub-v2/internal/model"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	r := app.Group("/keuangan/tagihan-custom", mw.AuthRequired)
	r.Get("", h.List)
	r.Get("/:id", h.GetByID)

	// Admin endpoints
	g := app.Group("/keuangan/tagihan-custom", mw.AuthRequired, mw.RoleRequired("ketua_rt", "super_admin"))
	g.Post("", h.Create)
	g.Put("/:id", h.Update)
	g.Delete("/:id", h.Delete)
	g.Post("/:id/verifikasi", h.Verifikasi)
}

type createRequest struct {
	RumahIDs []int   `json:"rumah_ids"`
	Deskripsi string `json:"deskripsi"`
	Nominal   float64 `json:"nominal"`
	Periode   string `json:"periode"`
}

func (h *Handler) Create(c fiber.Ctx) error {
	var req createRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	if len(req.RumahIDs) == 0 || req.Deskripsi == "" || req.Nominal <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "rumah, deskripsi, dan nominal wajib diisi"})
	}

	tenantID := c.Locals("tenant_id").(int)
	var tagihans []model.TagihanCustom
	for _, rumahID := range req.RumahIDs {
		tagihans = append(tagihans, model.TagihanCustom{
			TenantID:  tenantID,
			RumahID:   rumahID,
			Deskripsi: req.Deskripsi,
			Nominal:   req.Nominal,
			Periode:   req.Periode,
			StatusBayar: "PENDING",
		})
	}

	if err := h.repo.Create(tagihans); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"message": fmt.Sprintf("%d tagihan custom dibuat", len(tagihans))})
}

func (h *Handler) List(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	role := c.Locals("role").(string)

	var tagihans []model.TagihanCustom
	var err error

	if role == "ketua_rt" || role == "super_admin" {
		tagihans, err = h.repo.GetByTenant(tenantID)
	} else {
		// Warga biasa: lihat tagihan milik rumahnya saja
		userID := c.Locals("user_id").(int)
		// Ambil id_rumah dari warga table
		// Simplifikasi: query warga where id_user = user_id
		var warga model.Warga
		if err2 := h.repo.db.Where("id_user = ? AND id_tenant = ?", userID, tenantID).First(&warga).Error; err2 != nil {
			return c.JSON([]model.TagihanCustom{})
		}
		if warga.RumahID != nil {
		tagihans, err = h.repo.GetByRumah(*warga.RumahID, tenantID)
	}
	}

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(tagihans)
}

func (h *Handler) GetByID(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	t, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "tagihan tidak ditemukan"})
	}
	return c.JSON(t)
}

type updateRequest struct {
	Deskripsi string  `json:"deskripsi"`
	Nominal   float64 `json:"nominal"`
	Periode   string  `json:"periode"`
}

func (h *Handler) Update(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	t, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "tagihan tidak ditemukan"})
	}

	var req updateRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	if req.Deskripsi != "" { t.Deskripsi = req.Deskripsi }
	if req.Nominal > 0 { t.Nominal = req.Nominal }
	if req.Periode != "" { t.Periode = req.Periode }

	if err := h.repo.Update(t); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "tagihan diperbarui"})
}

func (h *Handler) Delete(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	if err := h.repo.Delete(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "tagihan dihapus"})
}

func (h *Handler) Verifikasi(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	t, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "tagihan tidak ditemukan"})
	}
	if t.StatusBayar == "LUNAS" {
		return c.Status(400).JSON(fiber.Map{"error": "tagihan sudah lunas"})
	}

	t.StatusBayar = "LUNAS"
	userID := c.Locals("user_id").(int)
	t.IDUserBayar = &userID
	if err := h.repo.Update(t); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "tagihan diverifikasi sebagai lunas"})
}
