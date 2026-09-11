package perbaikan

import (
	"strconv"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"github.com/gofiber/fiber/v3"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware) {
	r := app.Group("/perbaikan-data")
	r.Use(mw.AuthRequired)

	// User bisa ajukan permintaan
	r.Post("", h.CreatePermintaan)
	// User lihat permintaan sendiri
	r.Get("/saya", h.GetByUser)
	// Pengurus lihat semua permintaan di tenant
	r.Get("", mw.RoleRequired("ketua_rt", "super_admin"), h.GetByTenant)
	// Pengurus setujui/tolak
	r.Put("/:id", mw.RoleRequired("ketua_rt", "super_admin"), h.UpdateStatus)
}

func (h *Handler) CreatePermintaan(c fiber.Ctx) error {
	userID := c.Locals("user_id").(int)
	tenantID := c.Locals("tenant_id").(int)

	var req struct {
		IDWarga         int    `json:"id_warga"`
		FieldYangDiubah string `json:"field_yang_diubah"`
		NilaiBaru       string `json:"nilai_baru"`
		Keterangan      string `json:"keterangan"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "data tidak valid"})
	}
	if req.NilaiBaru == "" {
		return c.Status(400).JSON(fiber.Map{"error": "nilai baru wajib diisi"})
	}

	// Ambil nilai lama
	var w model.Warga
	h.repo.db.Where("id_warga = ?", req.IDWarga).First(&w)
	var nilaiLama *string
	if w.ID > 0 {
		var val string
		switch req.FieldYangDiubah {
		case "nama_lengkap": val = w.NamaLengkap
		case "nik": val = w.NIK
		case "no_kk": val = w.NoKK
		case "status_hubungan": val = w.StatusHubungan
		case "no_hp": val = "" // no_hp not in model, skip
		}
		if val != "" { nilaiLama = &val }
	}

	p := &model.PermintaanPerbaikan{
		IDWarga:         req.IDWarga,
		IDTenant:        tenantID,
		IDUserPengaju:   userID,
		FieldYangDiubah: req.FieldYangDiubah,
		NilaiLama:       nilaiLama,
		NilaiBaru:       req.NilaiBaru,
		Keterangan:      &req.Keterangan,
		Status:          "pending",
	}
	if err := h.repo.Create(p); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(p)
}

func (h *Handler) GetByUser(c fiber.Ctx) error {
	userID := c.Locals("user_id").(int)
	items, err := h.repo.GetByUser(userID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(h.repo.EnrichNames(items))
}

func (h *Handler) GetByTenant(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	items, err := h.repo.GetByTenant(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(h.repo.EnrichNames(items))
}

func (h *Handler) UpdateStatus(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	reviewerID := c.Locals("user_id").(int)

	var req struct {
		Status     string `json:"status"`
		Catatan    string `json:"catatan"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "data tidak valid"})
	}
	if req.Status != "disetujui" && req.Status != "ditolak" {
		return c.Status(400).JSON(fiber.Map{"error": "status harus disetujui atau ditolak"})
	}

	if err := h.repo.UpdateStatus(id, req.Status, reviewerID, &req.Catatan); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "permintaan diperbarui"})
}
