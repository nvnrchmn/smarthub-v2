package keuangan

import (
	"time"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type CronJob struct {
	db *gorm.DB
}

func NewCronJob(db *gorm.DB) *CronJob {
	return &CronJob{db: db}
}

// GenerateTagihanBulanIni — generate otomatis tiap awal bulan untuk tenant AKTIF.
// (Belum di-wire di main.go; dipersiapkan untuk scheduler.)
func (c *CronJob) GenerateTagihanBulanIni() error {
	var tenants []model.Tenant
	if err := c.db.Where("status_berlangganan = ?", "AKTIF").Find(&tenants).Error; err != nil {
		return err
	}

	now := time.Now()
	periode := now.Format("2006-01")

	for _, t := range tenants {
		var masters []model.MasterIuran
		if err := c.db.Where("id_tenant = ? AND is_wajib = ?", t.ID, true).Find(&masters).Error; err != nil {
			continue
		}

		var rumahs []model.Rumah
		if err := c.db.Where("id_tenant = ?", t.ID).Find(&rumahs).Error; err != nil {
			continue
		}

		for i := range rumahs {
			var n int64
			c.db.Model(&model.TagihanIuran{}).
				Where("id_rumah = ? AND periode_bulan_tahun = ?", rumahs[i].ID, periode).
				Count(&n)
			if n > 0 {
				continue // sudah ada tagihan periode ini
			}

			details := make([]model.DetailTagihan, 0, len(masters))
			var total float64
			for _, m := range masters {
				total += m.Nominal
				details = append(details, model.DetailTagihan{
					NamaIuran: m.NamaIuran,
					Nominal:   m.Nominal,
				})
			}

			tagihan := &model.TagihanIuran{
				TenantID:     t.ID,
				RumahID:      rumahs[i].ID,
				Periode:      periode,
				TotalNominal: total,
				StatusBayar:  "PENDING",
				CreatedAt:    now,
			}
			if err := c.db.Create(tagihan).Error; err != nil {
				continue
			}
			// Link detail ke tagihan setelah id_tagihan diketahui
			for j := range details {
				details[j].IDTagihan = tagihan.IDTagihan
			}
			if len(details) > 0 {
				if err := c.db.Create(&details).Error; err != nil {
					// Gagal menyimpan detail → rollback tagihan induk agar konsisten
					c.db.Delete(&model.TagihanIuran{}, tagihan.IDTagihan)
				}
			}
		}
	}
	return nil
}
