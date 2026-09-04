package warga

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

func (r *Repository) CreateWarga(warga *model.Warga) error {
	return r.db.Create(warga).Error
}

func (r *Repository) GetWargaByRumah(rumahID int) ([]model.Warga, error) {
	var wargas []model.Warga
	err := r.db.Where("id_rumah = ?", rumahID).Order("nama_lengkap").Find(&wargas).Error
	return wargas, err
}

func (r *Repository) GetWargaByTenant(tenantID int) ([]model.Warga, error) {
	var wargas []model.Warga
	err := r.db.Where("id_tenant = ?", tenantID).Order("nama_lengkap").Find(&wargas).Error
	return wargas, err
}

func (r *Repository) GetWargaByID(id int) (*model.Warga, error) {
	var warga model.Warga
	if err := r.db.First(&warga, id).Error; err != nil {
		return nil, err
	}
	return &warga, nil
}

func (r *Repository) UpdateWarga(warga *model.Warga) error {
	updates := map[string]interface{}{
		"nama_lengkap":     warga.NamaLengkap,
		"nik":              warga.NIK,
		"no_kk":            warga.NoKK,
		"status_hubungan":  warga.StatusHubungan,
		"status_warga":     warga.StatusWarga,
		"tanggal_mutasi":   warga.TanggalMutasi,
	}
	return r.db.Model(warga).Where("id_warga = ?", warga.ID).Updates(updates).Error
}

func (r *Repository) DeleteWarga(id int) error {
	return r.db.Delete(&model.Warga{}, id).Error
}
