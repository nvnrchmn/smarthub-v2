package forum

import (
	"errors"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateThread(t *model.Thread, userRole string) error {
	if t.TipeThread == "Pengumuman" && userRole != "ketua_rt" && userRole != "super_admin" {
		return errors.New("hanya pengurus yang bisa membuat pengumuman")
	}
	return s.repo.CreateThread(t)
}

func (s *Service) CreateKomentar(k *model.Komentar) error {
	return s.repo.CreateKomentar(k)
}
