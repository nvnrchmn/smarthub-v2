package warga

import (
	"github.com/nvnrchmn/smarthub-v2/internal/model"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateWarga(warga *model.Warga) error {
	return s.repo.CreateWarga(warga)
}

func (s *Service) GetWargaByRumah(rumahID, tenantID int) ([]model.Warga, error) {
	return s.repo.GetWargaByRumah(rumahID, tenantID)
}

func (s *Service) RumahExists(rumahID, tenantID int) bool {
	return s.repo.RumahExists(rumahID, tenantID)
}

func (s *Service) GetWargaByTenant(tenantID int) ([]model.Warga, error) {
	return s.repo.GetWargaByTenant(tenantID)
}

func (s *Service) GetWargaByID(id int) (*model.Warga, error) {
	return s.repo.GetWargaByID(id)
}

func (s *Service) UpdateWarga(warga *model.Warga) error {
	return s.repo.UpdateWarga(warga)
}

func (s *Service) DeleteWarga(id int) error {
	return s.repo.DeleteWarga(id)
}
