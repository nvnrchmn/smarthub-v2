package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"regexp"
	"strings"
	"time"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"github.com/nvnrchmn/smarthub-v2/internal/subscription"
	"github.com/nvnrchmn/smarthub-v2/pkg/encryption"
	"github.com/nvnrchmn/smarthub-v2/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo   *Repository
	jwt    *jwt.JWT
	aes    *encryption.AES
	sub    *subscription.Service
}

func NewService(repo *Repository, j *jwt.JWT, a *encryption.AES) *Service {
	return &Service{repo: repo, jwt: j, aes: a}
}

func (s *Service) SetSubscriptionService(sub *subscription.Service) {
	s.sub = sub
}

type LoginInput struct {
	NomorWA  string `json:"nomor_wa"`
	Password string `json:"password"`
}

type RegisterInput struct {
	NomorWA     string `json:"nomor_wa"`
	Password    string `json:"password"`
	NamaLengkap string `json:"nama_lengkap"`
}

type RegisterPengurusInput struct {
	NomorWA       string `json:"nomor_wa"`
	Password      string `json:"password"`
	NamaLengkap   string `json:"nama_lengkap"`
	NamaRT        string `json:"nama_rt"`
	DesaKelurahan string `json:"desa_kelurahan"`
	Kecamatan     string `json:"kecamatan"`
	KabupatenKota string `json:"kabupaten_kota"`
	Provinsi      string `json:"provinsi"`
}

type LoginResponse struct {
	Token      string `json:"token"`
	Role       string `json:"role"`
	TenantID   int    `json:"tenant_id"`
	UserID     int    `json:"user_id"`
	InviteCode string `json:"invite_code,omitempty"`
}

func generateRandomCode(length int) string {
	b := make([]byte, length)
	rand.Read(b)
	return strings.ToUpper(hex.EncodeToString(b))[:length]
}

func (s *Service) Login(input LoginInput) (*LoginResponse, error) {
	if matched, _ := regexp.MatchString(`^08\d{8,13}$`, input.NomorWA); !matched {
		return nil, errors.New("nomor WA tidak valid")
	}
	if len(input.Password) < 6 {
		return nil, errors.New("password minimal 6 karakter")
	}

	user, err := s.repo.GetUserByNomorWA(input.NomorWA)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("akun tidak ditemukan")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		return nil, errors.New("password salah")
	}

	token, err := s.jwt.Generate(user.ID, user.TenantID, user.Role)
	if err != nil {
		return nil, err
	}

	resp := &LoginResponse{
		Token:    token,
		Role:     user.Role,
		TenantID: user.TenantID,
		UserID:   user.ID,
	}

	if user.Role == "ketua_rt" {
		codes, err := s.repo.ListInviteCodesByTenant(user.TenantID)
		if err == nil && len(codes) > 0 {
			resp.InviteCode = codes[0].Code
		} else {
			code := generateRandomCode(8)
			expiresAt := time.Now().Add(30 * 24 * time.Hour)
			_ = s.repo.CreateInviteCode(&model.InviteCode{
				Code:      code,
				TenantID:  user.TenantID,
				CreatedBy: user.ID,
				RoleFor:   "warga",
				ExpiresAt: &expiresAt,
			})
			resp.InviteCode = code
		}
	}

	return resp, nil
}

func (s *Service) Register(input RegisterInput) (*LoginResponse, error) {
	return s.RegisterWithInvite(input, "")
}

func (s *Service) RegisterPengurus(input RegisterPengurusInput) (*LoginResponse, error) {
	if matched, _ := regexp.MatchString(`^08\d{8,13}$`, input.NomorWA); !matched {
		return nil, errors.New("nomor WA tidak valid")
	}
	if len(input.Password) < 6 {
		return nil, errors.New("password minimal 6 karakter")
	}
	if input.NamaRT == "" {
		return nil, errors.New("nama RT/RW wajib diisi")
	}

	existing, err := s.repo.GetUserByNomorWA(input.NomorWA)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("nomor WA sudah terdaftar")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	tenant := &model.Tenant{
		NamaRTRW:         input.NamaRT,
		DesaKelurahan:    input.DesaKelurahan,
		Kecamatan:        input.Kecamatan,
		KabupatenKota:    input.KabupatenKota,
		Provinsi:         input.Provinsi,
		StatusBerlanggan: "AKTIF",
	}

	var userID int
	err = s.repo.RegisterPengurusWithTenant(tenant, string(hash), input.NomorWA, input.NamaLengkap, &userID)
	if err != nil {
		return nil, err
	}

	// Create subscription for tenant (per-rumah Rp 3.000, default 1 rumah)
	if s.sub != nil {
		_, _ = s.sub.CreateLayanan(tenant.ID, 1, 3000)
	}

	inviteCode := generateRandomCode(8)
	expiresAt := time.Now().Add(30 * 24 * time.Hour)
	_ = s.repo.CreateInviteCode(&model.InviteCode{
		Code:      inviteCode,
		TenantID:  tenant.ID,
		CreatedBy: userID,
		RoleFor:   "warga",
		ExpiresAt: &expiresAt,
	})

	token, err := s.jwt.Generate(userID, tenant.ID, "ketua_rt")
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token:      token,
		Role:       "ketua_rt",
		TenantID:   tenant.ID,
		UserID:     userID,
		InviteCode: inviteCode,
	}, nil
}

func (s *Service) RegisterWithInvite(input RegisterInput, inviteCode string) (*LoginResponse, error) {
	if matched, _ := regexp.MatchString(`^08\d{8,13}$`, input.NomorWA); !matched {
		return nil, errors.New("nomor WA tidak valid")
	}
	if len(input.Password) < 6 {
		return nil, errors.New("password minimal 6 karakter")
	}

	existing, err := s.repo.GetUserByNomorWA(input.NomorWA)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("nomor WA sudah terdaftar")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	var tenantID int
	role := "warga"

	if inviteCode != "" {
		code, err := s.repo.GetInviteCode(inviteCode)
		if err != nil {
			return nil, errors.New("kode undangan tidak valid atau sudah kadaluarsa")
		}
		if code.UsedAt != nil {
			return nil, errors.New("kode undangan sudah pernah digunakan")
		}
		if code.ExpiresAt != nil && code.ExpiresAt.Before(time.Now()) {
			return nil, errors.New("kode undangan sudah kadaluarsa")
		}

		tenantID = code.TenantID
		role = code.RoleFor

		// Whitelist (audit 2026-09-05): kode legacy yang dibuat SEBELUM fix
		// (role_for="super_admin" dll) ditolak saat ditukar — defense in depth.
		if role != "warga" && role != "ketua_rt" {
			return nil, errors.New("kode undangan tidak valid")
		}

		now := time.Now()
		code.UsedAt = &now
		_ = s.repo.UpdateInviteCode(code)
	} else {
		tenant := &model.Tenant{
			NamaRTRW:         "RT Baru",
			StatusBerlanggan: "AKTIF",
		}
		if err := s.repo.CreateTenant(tenant); err != nil {
			return nil, err
		}
		tenantID = tenant.ID
	}

	var userID int
	err = s.repo.RegisterUserWithTenant(tenantID, string(hash), input.NomorWA, input.NamaLengkap, role, "pending_verifikasi", &userID)
	if err != nil {
		return nil, err
	}

	token, err := s.jwt.Generate(userID, tenantID, role)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token:    token,
		Role:     role,
		TenantID: tenantID,
		UserID:   userID,
	}, nil
}

func (s *Service) GenerateInviteCode(tenantID int, createdBy int, roleFor string, maxUses *int, expiresAt *time.Time) (string, error) {
	code := generateRandomCode(8)

	invite := &model.InviteCode{
		Code:      code,
		TenantID:  tenantID,
		CreatedBy: createdBy,
		RoleFor:   roleFor,
		MaxUses:   maxUses,
		ExpiresAt: expiresAt,
	}

	if err := s.repo.CreateInviteCode(invite); err != nil {
		return "", err
	}

	return code, nil
}

func (s *Service) ApproveWarga(tenantID int, userID int) error {
	return s.repo.ApproveWarga(tenantID, userID)
}

func (s *Service) RejectWarga(tenantID int, userID int) error {
	return s.repo.RejectWarga(tenantID, userID)
}

func (s *Service) ListWargaPending(tenantID int) ([]model.User, error) {
	return s.repo.ListWargaPending(tenantID)
}
