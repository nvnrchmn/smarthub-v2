package keuangan

import (
	"time"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateMasterIuran(m *model.MasterIuran) error {
	return r.db.Create(m).Error
}

func (r *Repository) GetMasterIuranByTenant(tenantID int) ([]model.MasterIuran, error) {
	var list []model.MasterIuran
	err := r.db.Where("id_tenant = ?", tenantID).Order("nama_iuran").Find(&list).Error
	return list, err
}

func (r *Repository) CreateTagihanBulk(tagihan *model.TagihanIuran, details []model.DetailTagihan) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(tagihan).Error; err != nil {
			return err
		}
		for i := range details {
			details[i].IDTagihan = tagihan.IDTagihan
		}
		return tx.Create(&details).Error
	})
}

func (r *Repository) RumahBelongsToTenant(rumahID, tenantID int) bool {
	var n int64
	r.db.Table("rumah").Where("id_rumah = ? AND id_tenant = ?", rumahID, tenantID).Count(&n)
	return n > 0
}

func (r *Repository) GetTagihanByRumah(rumahID int) ([]model.TagihanIuran, error) {
	var list []model.TagihanIuran
	err := r.db.Where("id_rumah = ?", rumahID).Order("periode_bulan_tahun DESC").Find(&list).Error
	return list, err
}

func (r *Repository) GetTagihanByTenant(tenantID int, status string) ([]model.TagihanIuran, error) {
	var list []model.TagihanIuran
	q := r.db.Where("id_tenant = ?", tenantID)
	if status != "" {
		q = q.Where("status_pembayaran = ?", status)
	}
	err := q.Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *Repository) UpdateStatusTagihan(id int, status string, paidAt *time.Time) error {
	return r.db.Model(&model.TagihanIuran{}).Where("id_tagihan = ?", id).Updates(map[string]interface{}{
		"status_pembayaran": status,
		"paid_at":           paidAt,
	}).Error
}

func (r *Repository) UpdateXenditInfo(id int, invID, payURL string) error {
	return r.db.Model(&model.TagihanIuran{}).Where("id_tagihan = ?", id).Updates(map[string]interface{}{
		"xendit_invoice_id":  invID,
		"xendit_payment_url": payURL,
	}).Error
}
