package perbaikan

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

func (r *Repository) Create(p *model.PermintaanPerbaikan) error {
	return r.db.Create(p).Error
}

func (r *Repository) GetByTenant(tenantID int) ([]model.PermintaanPerbaikan, error) {
	var items []model.PermintaanPerbaikan
	err := r.db.Where("id_tenant = ?", tenantID).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *Repository) GetByUser(userID int) ([]model.PermintaanPerbaikan, error) {
	var items []model.PermintaanPerbaikan
	err := r.db.Where("id_user_pengaju = ?", userID).Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *Repository) GetByID(id int) (*model.PermintaanPerbaikan, error) {
	var p model.PermintaanPerbaikan
	if err := r.db.First(&p, id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *Repository) UpdateStatus(id int, status string, reviewerID int, catatan *string) error {
	return r.db.Model(&model.PermintaanPerbaikan{}).Where("id_permintaan = ?", id).Updates(map[string]interface{}{
		"status":           status,
		"ditinjau_oleh":    reviewerID,
		"catatan_pengurus": catatan,
	}).Error
}

func (r *Repository) EnrichNames(items []model.PermintaanPerbaikan) []model.PermintaanPerbaikan {
	for i := range items {
		var nama string
		r.db.Table("warga").Select("nama_lengkap").Where("id_user = ?", items[i].IDUserPengaju).Scan(&nama)
		items[i].NamaPengaju = nama
		var namaWarga string
		r.db.Table("warga").Select("nama_lengkap").Where("id_warga = ?", items[i].IDWarga).Scan(&namaWarga)
		items[i].NamaWarga = namaWarga
	}
	return items
}
