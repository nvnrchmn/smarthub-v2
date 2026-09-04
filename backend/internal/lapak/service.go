package lapak

import (
	"github.com/nvnrchmn/smarthub-v2/internal/model"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(p *model.Produk) error {
	return s.repo.Create(p)
}

func (s *Service) GetAll(tenantID int) ([]model.Produk, error) {
	return s.repo.GetAll(tenantID)
}
