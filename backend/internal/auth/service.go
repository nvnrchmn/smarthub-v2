package auth

import (
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"github.com/nvnrchmn/smarthub-v2/pkg/encryption"
	"github.com/nvnrchmn/smarthub-v2/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo      *Repository
	jwt       *jwt.JWT
	encryptor *encryption.AES
}

func NewService(repo *Repository, j *jwt.JWT, e *encryption.AES) *Service {
	return &Service{repo: repo, jwt: j, encryptor: e}
}

type LoginInput struct {
	NomorWA  string `json:"nomor_wa"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token    string `json:"token"`
	Role     string `json:"role"`
	TenantID int    `json:"tenant_id"`
	UserID   int    `json:"user_id"`
}

func (s *Service) Login(input LoginInput) (*LoginResponse, error) {
	user, err := s.repo.GetUserByNomorWA(input.NomorWA)
	if err != nil {
		return nil, fmt.Errorf("repo error: %w", err)
	}
	if user == nil {
		return nil, errors.New("nomor WA atau password salah")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, errors.New("nomor WA atau password salah")
	}
	if !user.IsActive {
		return nil, errors.New("akun dinonaktifkan, hubungi pengurus RT")
	}
	token, err := s.jwt.Generate(user.ID, user.TenantID, user.Role)
	if err != nil {
		return nil, err
	}
	return &LoginResponse{
		Token:    token,
		Role:     user.Role,
		TenantID: user.TenantID,
		UserID:   user.ID,
	}, nil
}

type RegisterInput struct {
	NomorWA     string `json:"nomor_wa"`
	Password    string `json:"password"`
	Role        string `json:"role"`
	TenantID    int    `json:"tenant_id"`
	NamaLengkap string `json:"nama_lengkap"`
}

func (s *Service) Register(input RegisterInput) (*LoginResponse, error) {
	if matched, _ := regexp.MatchString(`^08\d{8,13}$`, input.NomorWA); !matched {
		return nil, errors.New("format nomor WA tidak valid (harus 08xxxxxxxxxx)")
	}
	if len(input.Password) < 6 {
		return nil, errors.New("password minimal 6 karakter")
	}
	if strings.TrimSpace(input.NamaLengkap) == "" {
		return nil, errors.New("nama lengkap wajib diisi")
	}
	// Registrasi publik HANYA untuk warga — cegah self-register jadi super_admin/ketua_rt
	if input.Role != "" && input.Role != "warga" {
		return nil, errors.New("registrasi publik hanya untuk role warga")
	}
	if input.TenantID <= 0 || !s.repo.TenantExists(input.TenantID) {
		return nil, errors.New("RT tidak ditemukan")
	}
	existing, _ := s.repo.GetUserByNomorWA(input.NomorWA)
	if existing != nil {
		return nil, errors.New("nomor WA sudah terdaftar")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	user := &model.User{
		NomorWA:      input.NomorWA,
		PasswordHash: string(hash),
		Role:         "warga",
		TenantID:     input.TenantID,
	}
	// User + profil warga dibuat atomik (rollback jika salah satu gagal)
	wargaProfile := &model.Warga{
		TenantID:    user.TenantID,
		NamaLengkap: strings.TrimSpace(input.NamaLengkap),
	}
	if err := s.repo.RegisterUserWithProfile(user, wargaProfile); err != nil {
		return nil, err
	}
	// Auto-login: langsung terbitkan token agar pendaftar tidak perlu login ulang
	token, err := s.jwt.Generate(user.ID, user.TenantID, user.Role)
	if err != nil {
		return nil, err
	}
	return &LoginResponse{
		Token:    token,
		Role:     user.Role,
		TenantID: user.TenantID,
		UserID:   user.ID,
	}, nil
}
