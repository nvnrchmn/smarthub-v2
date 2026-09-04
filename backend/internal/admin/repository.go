package admin

import (
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type Summary struct {
	TotalTenants    int64   `json:"total_tenants"`
	TotalUsers      int64   `json:"total_users"`
	TotalRumah      int64   `json:"total_rumah"`
	TotalWarga      int64   `json:"total_warga"`
	TotalTagihan    int64   `json:"total_tagihan"`
	TotalLunas      int64   `json:"total_lunas"`
	TotalBelumBayar int64   `json:"total_belum_bayar"`
	TotalNominal    float64 `json:"total_nominal"`
}

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Summary() (*Summary, error) {
	s := &Summary{}
	if err := r.db.Model(&model.Tenant{}).Count(&s.TotalTenants).Error; err != nil {
		return nil, err
	}
	if err := r.db.Model(&model.User{}).Count(&s.TotalUsers).Error; err != nil {
		return nil, err
	}
	if err := r.db.Table("rumah").Count(&s.TotalRumah).Error; err != nil {
		return nil, err
	}
	if err := r.db.Table("warga").Count(&s.TotalWarga).Error; err != nil {
		return nil, err
	}
	if err := r.db.Table("tagihan_iuran").Count(&s.TotalTagihan).Error; err != nil {
		return nil, err
	}
	if err := r.db.Table("tagihan_iuran").Where("status_pembayaran = ?", "PAID").Count(&s.TotalLunas).Error; err != nil {
		return nil, err
	}
	if err := r.db.Table("tagihan_iuran").Where("status_pembayaran IN ?", []string{"PENDING", "OVERDUE"}).Count(&s.TotalBelumBayar).Error; err != nil {
		return nil, err
	}
	var total float64
	if err := r.db.Table("tagihan_iuran").Select("COALESCE(SUM(total_nominal),0)").Scan(&total).Error; err != nil {
		return nil, err
	}
	s.TotalNominal = total
	return s, nil
}

func (r *Repository) ListTenants() ([]model.Tenant, error) {
	var tenants []model.Tenant
	if err := r.db.Order("id_tenant").Find(&tenants).Error; err != nil {
		return nil, err
	}
	return tenants, nil
}
