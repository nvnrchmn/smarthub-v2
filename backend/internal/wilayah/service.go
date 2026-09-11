package wilayah

import (
	"github.com/nvnrchmn/smarthub-v2/internal/model"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateRumah(rumah *model.Rumah) error {
	return s.repo.CreateRumah(rumah)
}

func (s *Service) GetRumahByTenant(tenantID int) ([]model.Rumah, error) {
	return s.repo.GetRumahByTenant(tenantID)
}

func (s *Service) GetRumahByID(id int) (*model.Rumah, error) {
	return s.repo.GetRumahByID(id)
}

func (s *Service) UpdateRumah(rumah *model.Rumah) error {
	return s.repo.UpdateRumah(rumah)
}

func (s *Service) DeleteRumah(id int) error {
	return s.repo.DeleteRumah(id)
}

func (s *Service) EnrichRumahWithCount(rumahs []model.Rumah) ([]map[string]interface{}, error) {
	result := make([]map[string]interface{}, len(rumahs))
	for i, r := range rumahs {
		count, _ := s.repo.CountWargaByRumah(r.ID)
		result[i] = map[string]interface{}{
			"id_rumah":          r.ID,
			"id_tenant":       r.TenantID,
			"nama_jalan_gang": r.NamaJalanGang,
			"nomor_rumah":     r.NomorRumah,
			"status_hunian":   r.StatusHunian,
			"created_at":      r.CreatedAt,
			"updated_at":      r.UpdatedAt,
			"total_penghuni":  count,
		}
	}
	return result, nil
}
