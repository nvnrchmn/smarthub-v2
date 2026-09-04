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
