package forum

import (
	"fmt"
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
	r.Get("", h.GetThreads)
	r.Post("", h.CreateThread)
	r.Get("/:id", h.GetThread)
	r.Post("/:id/komentar", h.CreateKomentar)
	r.Delete("/:id/komentar/:idKomentar", h.DeleteKomentar)
}

func (h *Handler) GetThreads(c fiber.Ctx) error {
	// Tenant diambil dari JWT, bukan query param
	tenantID := c.Locals("tenant_id").(int)
	threads, err := h.service.repo.GetThreadsByTenant(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// Enrich: nama penulis + jumlah komentar (sekali query masing-masing)
	ids := make([]int, 0, len(threads))
	for _, t := range threads {
		ids = append(ids, t.IDUser)
	}
	names, _ := h.service.repo.GetWargaNames(ids)
	threadIDs := make([]int, 0, len(threads))
	for _, t := range threads {
		threadIDs = append(threadIDs, t.IDThread)
	}
	counts, _ := h.service.repo.CountKomentarByThreads(threadIDs)
	for i := range threads {
		threads[i].NamaPenulis = names[threads[i].IDUser]
		threads[i].KomentarCount = counts[threads[i].IDThread]
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
	h.notifyMentions(t.IDTenant, t.IDUser, t.Konten, "post", &t.IDThread, fmt.Sprintf("Anda disebut di postingan %q", t.Judul))
	return c.Status(201).JSON(t)
}

// notifyMentions — deteksi @Nama di teks lalu buat notifikasi per warga yang disebut.
// Best-effort: kegagalan tak mengganggu alur utama.
func (h *Handler) notifyMentions(tenantID, authorID int, teks, tipe string, refID *int, pesan string) {
	warga, err := h.service.repo.ListWargaMention(tenantID)
	if err != nil {
		return
	}
	terkena := MentionedUsers(teks, warga, authorID)
	if len(terkena) == 0 {
		return
	}
	items := make([]model.Notifikasi, 0, len(terkena))
	for _, w := range terkena {
		items = append(items, model.Notifikasi{
			IDUser:   w.IDUser,
			IDTenant: tenantID,
			Tipe:     tipe,
			IDRef:    refID,
			Pesan:    pesan,
		})
	}
	_ = h.service.repo.InsertNotifs(items)
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
	// Nama penulis thread + komentar
	ids := []int{thread.IDUser}
	for _, k := range komentar {
		ids = append(ids, k.IDUser)
	}
	names, _ := h.service.repo.GetWargaNames(ids)
	thread.NamaPenulis = names[thread.IDUser]
	for i := range komentar {
		komentar[i].NamaPenulis = names[komentar[i].IDUser]
	}
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
	// Balasan boleh berisi teks dan/atau foto, minimal salah satu wajib ada.
	if k.Komentar == "" && k.FotoURL == "" {
		return c.Status(400).JSON(fiber.Map{"error": "komentar atau foto tidak boleh kosong"})
	}
	// parent_komentar_id (dibaca dari body) wajib merujuk komentar di thread yang sama.
	if k.ParentID != nil {
		parent, err := h.service.repo.GetKomentarByID(*k.ParentID)
		if err != nil || parent.IDThread != threadID {
			return c.Status(400).JSON(fiber.Map{"error": "parent_komentar_id tidak valid"})
		}
	}
	if err := h.service.CreateKomentar(&k); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	if k.Komentar != "" {
		h.notifyMentions(thread.IDTenant, k.IDUser, k.Komentar, "komentar", &thread.IDThread, fmt.Sprintf("Anda disebut di komentar %q", thread.Judul))
	}
	return c.Status(201).JSON(k)
}

func (h *Handler) DeleteKomentar(c fiber.Ctx) error {
	threadID, _ := strconv.Atoi(c.Params("id"))
	komentarID, _ := strconv.Atoi(c.Params("idKomentar"))
	userID := c.Locals("user_id").(int)
	tenantID := c.Locals("tenant_id").(int)

	// Verifikasi thread milik tenant yang sama
	thread, err := h.service.repo.GetThreadByID(threadID)
	if err != nil || thread.IDTenant != tenantID {
		return c.Status(404).JSON(fiber.Map{"error": "thread tidak ditemukan"})
	}

	// Cek komentar
	k, err := h.service.repo.GetKomentarByID(komentarID)
	if err != nil || k.IDThread != threadID {
		return c.Status(404).JSON(fiber.Map{"error": "komentar tidak ditemukan"})
	}

	// Hanya penulis komentar atau admin yang boleh hapus
	role := c.Locals("role").(string)
	if k.IDUser != userID && role != "super_admin" {
		return c.Status(403).JSON(fiber.Map{"error": "tidak punya akses"})
	}

	if err := h.service.repo.DeleteKomentar(komentarID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "komentar dihapus"})
}
