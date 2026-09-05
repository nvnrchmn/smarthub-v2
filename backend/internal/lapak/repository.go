package lapak

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

func (r *Repository) Create(p *model.Produk) error {
	return r.db.Create(p).Error
}

func (r *Repository) GetAll(tenantID int) ([]model.Produk, error) {
	var produk []model.Produk
	err := r.db.Where("id_tenant = ?", tenantID).Order("created_at DESC").Find(&produk).Error
	return produk, err
}

func (r *Repository) GetByID(id int) (*model.Produk, error) {
	var p model.Produk
	err := r.db.First(&p, id).Error
	return &p, err
}

func (r *Repository) Delete(id int) error {
	return r.db.Delete(&model.Produk{}, id).Error
}

func (r *Repository) SetApproved(id int, approved bool) error {
	return r.db.Model(&model.Produk{}).Where("id_produk = ?", id).Update("is_approved", approved).Error
}

func (r *Repository) GetWargaNames(userIDs []int) (map[int]string, error) {
	names := map[int]string{}
	if len(userIDs) == 0 {
		return names, nil
	}
	var rows []struct {
		IDUser      int
		NamaLengkap string
	}
	if err := r.db.Table("warga").Select("id_user, nama_lengkap").Where("id_user IN ?", userIDs).Scan(&rows).Error; err != nil {
		return names, err
	}
	for _, row := range rows {
		names[row.IDUser] = row.NamaLengkap
	}
	return names, nil
}
