package auth

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v3"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type loginRequest struct {
	NomorWA  string `json:"nomor_wa"`
	Password string `json:"password"`
}

func (h *Handler) Login(c fiber.Ctx) error {
	var req LoginInput
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	res, err := h.service.Login(req)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}

func (h *Handler) Register(c fiber.Ctx) error {
	var req RegisterInput
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}
	res, err := h.service.Register(req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{
		"message":   "registrasi berhasil",
		"token":     res.Token,
		"user_id":   res.UserID,
		"role":      res.Role,
		"tenant_id": res.TenantID,
		"tenant_status": res.TenantStatus,
	})
}

// RegisterPengurus handles registration for pengurus (ketua_rt)
// with automatic tenant creation
type registerPengurusRequest struct {
	NomorWA       string `json:"nomor_wa"`
	Password      string `json:"password"`
	NamaLengkap   string `json:"nama_lengkap"`
	NamaRT        string `json:"nama_rt"`
	DesaKelurahan string `json:"desa_kelurahan"`
	Kecamatan     string `json:"kecamatan"`
	KabupatenKota string `json:"kabupaten_kota"`
	Provinsi      string `json:"provinsi"`
}

func (h *Handler) RegisterPengurus(c fiber.Ctx) error {
	var req registerPengurusRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}

	input := RegisterPengurusInput{
		NomorWA:       req.NomorWA,
		Password:      req.Password,
		NamaLengkap:   req.NamaLengkap,
		NamaRT:        req.NamaRT,
		DesaKelurahan: req.DesaKelurahan,
		Kecamatan:     req.Kecamatan,
		KabupatenKota: req.KabupatenKota,
		Provinsi:      req.Provinsi,
	}

	res, err := h.service.RegisterPengurus(input)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message":     "registrasi pengurus berhasil",
		"token":       res.Token,
		"user_id":     res.UserID,
		"role":        res.Role,
		"tenant_id":   res.TenantID,
		"tenant_status": res.TenantStatus,
		"invite_code": res.InviteCode,
	})
}

// RegisterWithInvite handles registration using invite code
type registerWithInviteRequest struct {
	NomorWA     string `json:"nomor_wa"`
	Password    string `json:"password"`
	NamaLengkap string `json:"nama_lengkap"`
	InviteCode  string `json:"invite_code"`
}

func (h *Handler) RegisterWithInvite(c fiber.Ctx) error {
	var req registerWithInviteRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}

	input := RegisterInput{
		NomorWA:     req.NomorWA,
		Password:    req.Password,
		NamaLengkap: req.NamaLengkap,
	}

	res, err := h.service.RegisterWithInvite(input, req.InviteCode)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message":   "registrasi berhasil via undangan",
		"token":     res.Token,
		"user_id":   res.UserID,
		"role":      res.Role,
		"tenant_id": res.TenantID,
		"tenant_status": res.TenantStatus,
	})
}

// GenerateInviteCode handles creating new invite codes
type generateInviteRequest struct {
	RoleFor   string     `json:"role_for"`
	MaxUses   *int       `json:"max_uses"`
	ExpiresAt *time.Time `json:"expires_at"`
}

func (h *Handler) GenerateInviteCode(c fiber.Ctx) error {
	var req generateInviteRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}

	// Get tenant_id, user_id, dan role dari JWT
	tenantID := c.Locals("tenant_id").(int)
	userID := c.Locals("user_id").(int)
	callerRole, _ := c.Locals("role").(string)

	// RBAC whitelist (audit 2026-09-05): sebelumnya siapa pun yang login
	// (termasuk warga) bisa membuat kode dengan role_for bebas → eskalasi ke
	// super_admin. Sekarang: warga tidak boleh membuat kode sama sekali;
	// ketua_rt hanya warga; super_admin hanya warga/ketua_rt (BUKAN super_admin).
	switch callerRole {
	case "ketua_rt":
		if req.RoleFor != "warga" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "ketua_rt hanya bisa mengundang warga"})
		}
	case "super_admin":
		if req.RoleFor != "warga" && req.RoleFor != "ketua_rt" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "role_for tidak diizinkan"})
		}
	default:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "tidak diizinkan membuat kode undangan"})
	}

	code, err := h.service.GenerateInviteCode(tenantID, userID, req.RoleFor, req.MaxUses, req.ExpiresAt)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "kode undangan berhasil dibuat",
		"code":    code,
	})
}

// ListInviteCodes lists all invite codes for the tenant
func (h *Handler) ListInviteCodes(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)

	codes, err := h.service.repo.ListInviteCodesByTenant(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat kode undangan"})
	}

	return c.JSON(fiber.Map{"data": codes})
}

// DeactivateInviteCode deactivates an invite code
func (h *Handler) DeactivateInviteCode(c fiber.Ctx) error {
	codeID := c.Params("id")
	if codeID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "id kode undangan wajib diisi"})
	}

	var id int
	if _, err := fmt.Sscanf(codeID, "%d", &id); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tidak valid"})
	}

	if err := h.service.repo.DeactivateInviteCode(id); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menonaktifkan kode undangan"})
	}

	return c.JSON(fiber.Map{"message": "kode undangan berhasil dinonaktifkan"})
}

// ApproveWarga mengaktifkan user yang statusnya pending_verifikasi
func (h *Handler) ApproveWarga(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	userID := c.Params("id")

	var targetID int
	if _, err := fmt.Sscanf(userID, "%d", &targetID); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tidak valid"})
	}

	if err := h.service.ApproveWarga(tenantID, targetID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal mengaktifkan warga"})
	}

	return c.JSON(fiber.Map{"message": "warga berhasil diaktifkan"})
}

// RejectWarga menolak dan mensuspend user
func (h *Handler) RejectWarga(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)
	userID := c.Params("id")

	var targetID int
	if _, err := fmt.Sscanf(userID, "%d", &targetID); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "id tidak valid"})
	}

	if err := h.service.RejectWarga(tenantID, targetID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menolak warga"})
	}

	return c.JSON(fiber.Map{"message": "warga berhasil ditolak"})
}

// ListWargaPending mengambil list user yg statusnya pending_verifikasi
func (h *Handler) ListWargaPending(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(int)

	users, err := h.service.ListWargaPending(tenantID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat data warga pending"})
	}

	return c.JSON(fiber.Map{"data": users})
}
