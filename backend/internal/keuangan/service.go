package keuangan

import (
	"errors"
	"fmt"
	"time"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// GenerateTagihanBulk generates tagihan for all rumah in a tenant for a given period
func (s *Service) GenerateTagihanBulk(tenantID int, periode string) (int, error) {
	var masters []model.MasterIuran
	if err := s.repo.db.Where("id_tenant = ? AND is_wajib = ?", tenantID, true).Find(&masters).Error; err != nil {
		return 0, err
	}
	if len(masters) == 0 {
		return 0, errors.New("tidak ada master iuran")
	}

	var rumahs []struct{ ID int }
	if err := s.repo.db.Table("rumah").Select("id_rumah as id").Where("id_tenant = ?", tenantID).Find(&rumahs).Error; err != nil {
		return 0, err
	}

	created := 0
	now := time.Now()
	for _, r := range rumahs {
		// Idempotency check
		var existing model.TagihanIuran
		if err := s.repo.db.Where("id_rumah = ? AND periode_bulan_tahun = ?", r.ID, periode).First(&existing).Error; err == nil {
			continue
		}

		total := 0.0
		details := []model.DetailTagihan{}
		for _, m := range masters {
			total += m.Nominal
			details = append(details, model.DetailTagihan{
				NamaIuran: m.NamaIuran,
				Nominal:   m.Nominal,
			})
		}

		tagihan := &model.TagihanIuran{
			TenantID:     tenantID,
			RumahID:      r.ID,
			Periode:      periode,
			TotalNominal: total,
			StatusBayar:  "PENDING",
			CreatedAt:    now,
		}
		if err := s.repo.CreateTagihanBulk(tagihan, details); err != nil {
			return created, err
		}
		created++
	}
	return created, nil
}

func (s *Service) GetTagihanByRumah(rumahID int) ([]model.TagihanIuran, error) {
	return s.repo.GetTagihanByRumah(rumahID)
}

func (s *Service) GetTagihanByTenant(tenantID int, status string) ([]model.TagihanIuran, error) {
	return s.repo.GetTagihanByTenant(tenantID, status)
}

func (s *Service) HandleWebhook(invID, status string) error {
	var tagihan model.TagihanIuran
	if err := s.repo.db.Where("xendit_invoice_id = ?", invID).First(&tagihan).Error; err != nil {
		return fmt.Errorf("tagihan tidak ditemukan: %s", invID)
	}
	if status == "PAID" {
		now := time.Now()
		return s.repo.UpdateStatusTagihan(tagihan.IDTagihan, "PAID", &now)
	}
	return nil
}
