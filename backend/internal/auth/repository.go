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

// RegisterUserWithProfile membuat user + profil warga secara atomik —
// jika salah satu gagal, semuanya di-rollback (hindari user yatim).
func (r *Repository) RegisterUserWithProfile(user *model.User, warga *model.Warga) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(user).Error; err != nil {
			return err
		}
		// kaitkan profil warga ke user yang barusan dibuat
		idUser := user.ID
		warga.IDUser = &idUser
		if err := tx.Create(warga).Error; err != nil {
			return err
		}
		return nil
	})
}
