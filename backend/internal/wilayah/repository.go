package wilayah

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

func (r *Repository) CreateRumah(rumah *model.Rumah) error {
	return r.db.Create(rumah).Error
}

func (r *Repository) GetRumahByTenant(tenantID int) ([]model.Rumah, error) {
	var rumahs []model.Rumah
	err := r.db.Where("id_tenant = ?", tenantID).Order("nama_jalan_gang, nomor_rumah").Find(&rumahs).Error
	return rumahs, err
}

func (r *Repository) GetRumahByID(id int) (*model.Rumah, error) {
	var rumah model.Rumah
	if err := r.db.First(&rumah, id).Error; err != nil {
		return nil, err
	}
	return &rumah, nil
}

func (r *Repository) UpdateRumah(rumah *model.Rumah) error {
	updates := map[string]interface{}{
		"nama_jalan_gang": rumah.NamaJalanGang,
		"nomor_rumah":    rumah.NomorRumah,
		"status_hunian":  rumah.StatusHunian,
	}
	return r.db.Model(rumah).Where("id_rumah = ?", rumah.ID).Updates(updates).Error
}

func (r *Repository) DeleteRumah(id int) error {
	return r.db.Delete(&model.Rumah{}, id).Error
}
