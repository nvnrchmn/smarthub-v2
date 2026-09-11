package tagihan_custom

import (
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(tagihan []model.TagihanCustom) error {
	return r.db.Create(&tagihan).Error
}

func (r *Repository) GetByTenant(tenantID int) ([]model.TagihanCustom, error) {
	var tagihans []model.TagihanCustom
	err := r.db.Where("id_tenant = ?", tenantID).Order("created_at DESC").Find(&tagihans).Error
	return tagihans, err
}

func (r *Repository) GetByRumah(rumahID, tenantID int) ([]model.TagihanCustom, error) {
	var tagihans []model.TagihanCustom
	err := r.db.Where("id_rumah = ? AND id_tenant = ?", rumahID, tenantID).Order("created_at DESC").Find(&tagihans).Error
	return tagihans, err
}

func (r *Repository) GetByID(id int) (*model.TagihanCustom, error) {
	var t model.TagihanCustom
	if err := r.db.First(&t, id).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *Repository) Update(t *model.TagihanCustom) error {
	return r.db.Save(t).Error
}

func (r *Repository) Delete(id int) error {
	return r.db.Delete(&model.TagihanCustom{}, id).Error
}
