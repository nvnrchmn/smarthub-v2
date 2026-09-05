package warga

import (
	"errors"
	"fmt"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"github.com/nvnrchmn/smarthub-v2/pkg/encryption"
)

type Service struct {
	repo *Repository
	aes  *encryption.AES
}

func NewService(repo *Repository, aes *encryption.AES) *Service {
	return &Service{repo: repo, aes: aes}
}

func (s *Service) EncryptNIkNoKK(nik, noKK string) (string, string, error) {
	encNik, err := s.aes.SealedValue(nik)
	if err != nil {
		return "", "", fmt.Errorf("gagal mengenkripsi NIK: %w", err)
	}

	encNoKK, err := s.aes.SealedValue(noKK)
	if err != nil {
		return "", "", fmt.Errorf("gagal mengenkripsi No_KK: %w", err)
	}

	return *encNik, *encNoKK, nil
}

func (s *Service) DecryptNIkNoKK(encNik, encNoKK string) (string, string, error) {
	decNik, err := s.aes.OpenSealedValue(encNik)
	if err != nil {
		return "", "", fmt.Errorf("gagal mendekripsi NIK: %w", err)
	}

	decNoKK, err := s.aes.OpenSealedValue(encNoKK)
	if err != nil {
		return "", "", fmt.Errorf("gagal mendekripsi No_KK: %w", err)
	}

	return *decNik, *decNoKK, nil
}

func (s *Service) CreateWarga(w *model.Warga) error {
	if w.NIK == "" {
		return errors.New("NIK wajib diisi")
	}
	if w.NoKK == "" {
		return errors.New("No_KK wajib diisi")
	}

	encNik, encNoKK, err := s.EncryptNIkNoKK(w.NIK, w.NoKK)
	if err != nil {
		return err
	}

	w.NIK = encNik
	w.NoKK = encNoKK
	w.StatusWarga = "Aktif"
	return s.repo.CreateWarga(w)
}

func (s *Service) GetWargaByID(id int, userID int, role string) (*model.Warga, error) {
	w, err := s.repo.GetWargaByID(id)
	if err != nil {
		return nil, err
	}
	if role != "ketua_rt" && role != "super_admin" {
		w.NIK = ""
		w.NoKK = ""
	}
	return w, nil
}

func (s *Service) GetWargaByTenant(tenantID int, userID int, role string) ([]model.Warga, error) {
	wargas, err := s.repo.GetWargaByTenant(tenantID)
	if err != nil {
		return nil, err
	}
	if role != "ketua_rt" && role != "super_admin" {
		for i := range wargas {
			wargas[i].NIK = ""
			wargas[i].NoKK = ""
		}
	}
	return wargas, nil
}

func (s *Service) GetWargaByRumah(rumahID, tenantID int) ([]model.Warga, error) {
	return s.repo.GetWargaByRumah(rumahID, tenantID)
}

func (s *Service) RumahExists(rumahID, tenantID int) bool {
	return s.repo.RumahExists(rumahID, tenantID)
}

func (s *Service) UpdateWarga(w *model.Warga) error {
	return s.repo.UpdateWarga(w)
}

func (s *Service) DeleteWarga(id int) error {
	return s.repo.DeleteWarga(id)
}
