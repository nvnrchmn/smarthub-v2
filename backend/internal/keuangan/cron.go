package keuangan

import (
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
	"time"
)

type CronJob struct {
	db *gorm.DB
}

func NewCronJob(db *gorm.DB) *CronJob {
	return &CronJob{db: db}
}

func (c *CronJob) GenerateTagihanBulanIni() error {
	var tenants []model.Tenant
	if err := c.db.Where("status_berlangganan = ?", "AKTIF").Find(&tenants).Error; err != nil {
		return err
	}

	now := time.Now()
	periode := now.Format("2006-01")

	for _, t := range tenants {
		var count int64
		c.db.Model(&model.TagihanIuran{}).Where("id_tenant = ? AND periode_bulan_tahun = ?", t.ID, periode).Count(&count)
		if count > 0 {
			continue
		}

		var masters []model.MasterIuran
		c.db.Where("id_tenant = ?", t.ID).Find(&masters)

		var rumahs []model.Rumah
		c.db.Where("id_tenant = ?", t.ID).Find(&rumahs)

		for i := range rumahs {
			var total float64
			for _, m := range masters {
				total += m.Nominal
				c.db.Create(&model.DetailTagihan{
					NamaIuran: m.NamaIuran,
					Nominal:   m.Nominal,
				})
			}
			c.db.Create(&model.TagihanIuran{
				TenantID:     t.ID,
				RumahID:      rumahs[i].ID,
				Periode:      periode,
				TotalNominal: total,
				StatusBayar:  "PENDING",
			})
		}
	}
	return nil
}
