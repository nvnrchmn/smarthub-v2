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
