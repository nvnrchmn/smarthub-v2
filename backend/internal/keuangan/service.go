package keuangan

import (
	"errors"
	"fmt"
	"time"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"github.com/nvnrchmn/smarthub-v2/pkg/settings"
)

type Service struct {
	repo     *Repository
	settings *settings.Store
}

func NewService(repo *Repository, st *settings.Store) *Service {
	return &Service{repo: repo, settings: st}
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

// GenerateTagihanPerRumah membuat tagihan satu rumah untuk periode tertentu
// (manual oleh pengurus RT). Idempoten: bila sudah ada → error dengan pesan jelas.
func (s *Service) GenerateTagihanPerRumah(tenantID, rumahID int, periode string) (*model.TagihanIuran, error) {
	if !s.repo.RumahBelongsToTenant(rumahID, tenantID) {
		return nil, errors.New("rumah tidak ditemukan di RT ini")
	}
	var existing model.TagihanIuran
	if err := s.repo.db.Where("id_rumah = ? AND periode_bulan_tahun = ?", rumahID, periode).First(&existing).Error; err == nil {
		return nil, fmt.Errorf("tagihan periode %s untuk rumah ini sudah ada", periode)
	}
	var masters []model.MasterIuran
	if err := s.repo.db.Where("id_tenant = ? AND is_wajib = ?", tenantID, true).Find(&masters).Error; err != nil {
		return nil, err
	}
	if len(masters) == 0 {
		return nil, errors.New("tidak ada master iuran — atur master dulu")
	}
	total := 0.0
	details := []model.DetailTagihan{}
	for _, m := range masters {
		total += m.Nominal
		details = append(details, model.DetailTagihan{NamaIuran: m.NamaIuran, Nominal: m.Nominal})
	}
	tagihan := &model.TagihanIuran{
		TenantID:     tenantID,
		RumahID:      rumahID,
		Periode:      periode,
		TotalNominal: total,
		StatusBayar:  "PENDING",
		CreatedAt:    time.Now(),
	}
	if err := s.repo.CreateTagihanBulk(tagihan, details); err != nil {
		return nil, err
	}
	return tagihan, nil
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
	if status == "EXPIRED" {
		return s.repo.UpdateStatusTagihan(tagihan.IDTagihan, "EXPIRED", nil)
	}
	return nil
}

// BayarTagihan membuat invoice Xendit untuk sebuah tagihan (idempotent: invoice
// aktif yang sudah ada akan dikembalikan, bukan dibuat baru).
func (s *Service) BayarTagihan(tagihanID, userID, tenantID int, payerEmail, successURL string) (string, error) {
	var tagihan model.TagihanIuran
	if err := s.repo.db.Where("id_tagihan = ? AND id_tenant = ?", tagihanID, tenantID).First(&tagihan).Error; err != nil {
		return "", errors.New("tagihan tidak ditemukan")
	}
	if tagihan.StatusBayar == "PAID" {
		return "", errors.New("tagihan sudah lunas")
	}
	if tagihan.XenditInvID != nil && tagihan.XenditPayURL != nil && *tagihan.XenditPayURL != "" {
		return *tagihan.XenditPayURL, nil // invoice sudah dibuat sebelumnya
	}

	// Ambil info tenant untuk deskripsi & sub-account (XenPlatform)
	var tenant model.Tenant
	_ = s.repo.db.First(&tenant, tenantID).Error

	desc := fmt.Sprintf("Iuran %s — periode %s", tenant.NamaRTRW, tagihan.Periode)
	inv, err := s.CreateXenditInvoice(tenantID, tagihan.IDTagihan, tagihan.TotalNominal, desc, payerEmail, successURL, tenant.XenditSubID)
	if err != nil {
		return "", fmt.Errorf("gagal membuat invoice: %w", err)
	}
	if err := s.repo.UpdateXenditInfo(tagihan.IDTagihan, inv.ID, inv.InvoiceURL); err != nil {
		return "", err
	}
	if err := s.repo.db.Model(&model.TagihanIuran{}).Where("id_tagihan = ?", tagihan.IDTagihan).Update("id_user_pembayar", userID).Error; err != nil {
		return "", err
	}
	return inv.InvoiceURL, nil
}
