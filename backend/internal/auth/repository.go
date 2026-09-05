package auth

import (
	"errors"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetUserByNomorWA(nomorWA string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("nomor_wa = ?", nomorWA).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *Repository) CreateTenant(tenant *model.Tenant) error {
	return r.db.Create(tenant).Error
}

func (r *Repository) TenantExists(tenantID int) bool {
	var n int64
	r.db.Table("tenants").Where("id_tenant = ?", tenantID).Count(&n)
	return n > 0
}

func (r *Repository) CreateUser(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *Repository) CreateWargaProfile(w *model.Warga) error {
	return r.db.Create(w).Error
}

// RegisterUserWithProfile membuat user + profil warga secara atomik
func (r *Repository) RegisterUserWithProfile(user *model.User, warga *model.Warga) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(user).Error; err != nil {
			return err
		}
		idUser := user.ID
		warga.IDUser = &idUser
		if err := tx.Create(warga).Error; err != nil {
			return err
		}
		return nil
	})
}

// RegisterPengurusWithTenant membuat tenant + user ketua_rt secara atomik
func (r *Repository) RegisterPengurusWithTenant(tenant *model.Tenant, passwordHash string, nomorWA string, namaLengkap string, userID *int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(tenant).Error; err != nil {
			return err
		}

		user := &model.User{
			TenantID:     tenant.ID,
			NomorWA:      nomorWA,
			PasswordHash: passwordHash,
			NamaLengkap:  namaLengkap,
			Role:         "ketua_rt",
			IsActive:     true,
		}
		if err := tx.Create(user).Error; err != nil {
			return err
		}

		*userID = user.ID
		return nil
	})
}

// RegisterUserWithTenant membuat user dengan tenant tertentu
func (r *Repository) RegisterUserWithTenant(tenantID int, passwordHash string, nomorWA string, namaLengkap string, role string, userID *int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		user := &model.User{
			TenantID:     tenantID,
			NomorWA:      nomorWA,
			PasswordHash: passwordHash,
			NamaLengkap:  namaLengkap,
			Role:         role,
			IsActive:     true,
		}
		if err := tx.Create(user).Error; err != nil {
			return err
		}

		*userID = user.ID
		return nil
	})
}

// CreateInviteCode menyimpan kode undangan baru
func (r *Repository) CreateInviteCode(code *model.InviteCode) error {
	return r.db.Create(code).Error
}

// GetInviteCode mengambil kode undangan berdasarkan kode
func (r *Repository) GetInviteCode(code string) (*model.InviteCode, error) {
	var invite model.InviteCode
	if err := r.db.Where("code = ? AND is_active = true", code).First(&invite).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("kode undangan tidak ditemukan")
		}
		return nil, err
	}
	return &invite, nil
}

// UpdateInviteCode memperbarui kode undangan
func (r *Repository) UpdateInviteCode(code *model.InviteCode) error {
	return r.db.Save(code).Error
}

// ListInviteCodesByTenant mengambil semua kode undangan tenant
func (r *Repository) ListInviteCodesByTenant(tenantID int) ([]model.InviteCode, error) {
	var codes []model.InviteCode
	if err := r.db.Where("id_tenant = ?", tenantID).Order("created_at DESC").Find(&codes).Error; err != nil {
		return nil, err
	}
	return codes, nil
}

// DeactivateInviteCode menonaktifkan kode undangan
func (r *Repository) DeactivateInviteCode(id int) error {
	return r.db.Model(&model.InviteCode{}).Where("id_invite = ?", id).Update("is_active", false).Error
}
