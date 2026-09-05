package warga

import (
	"errors"
	"fmt"
	"sync"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"github.com/nvnrchmn/smarthub-v2/pkg/encryption"
	"gorm.io/gorm"
)

type Service struct {
	repo     *Repository
	aesKey   []byte
	initOnce sync.Once
}

func NewService(repo *Repository, aesKey []byte) *Service {
	return &Service{repo: repo, aesKey: aesKey}
}

func (s *Service) setUp() {
	s.initOnce.Do(func() {
		if len(s.aesKey) == 0 {
			s.aesKey = encryption.DefaultAESSealedValue() // objek encryption dibungkus key-nya sendir
		}
	})
}

func (s *Service) EncryptNIkNoKK(nik, noKK string) (string, string, error) {
	s.setUp()
	var err error

	// Enkripsi NIK
	encNik, err := s.aesKey.SealedValue(nik)
	if err != nil {
		return "", "", fmt.Errorf("gagal mengenkripsi NIK: %w", err)
	}

	// Enkripsi No_KK
	encNoKK, err := s.aesKey.SealedValue(noKK)
	if err != nil {
		return "", "", fmt.Errorf("gagal mengenkripsi No_KK: %w", err)
	}

	return *encNik, *encNoKK, nil
}

func (s *Service) DecryptNIkNoKK(encNik, encNoKK string) (string, string, error) {
	s.setUp()
	var err error

	decNik, err := s.aesKey.OpenSealedValue(encNik)
	if err != nil {
		return "", "", fmt.Errorf("gagal mendekripsi NIK: %w", err)
	}

	decNoKK, err := s.aesKey.OpenSealedValue(encNoKK)
	if err != nil {
		return "", "", fmt.Errorf("gagal mendekripsi No_KK: %w", err)
	}

	return *decNik, *decNoKK, nil
}

func (s *Service) CreateWarga(w *model.Warga) error {
	s.setUp()
	if w.Nik == nil || *w.Nik == "" {
		return errors.New("NIK wajib diisi")
	}
	if w.NoKK == nil || *w.NoKK == "" {
		return errors.New("No_KK wajib diisi")
	}

	encNik, encNoKK, err := s.EncryptNIkNoKK(*w.Nik, *w.NoKK)
	if err != nil {
		return err
	}

	w.Nik = &encNik
	w.NoKK = &encNoKK
	w.UserStatus = "active"
	return s.repo.CreateWarga(w)
}

func (s *Service) GetWargaByID(id int, userID int, role string) (*model.Warga, error) {
	w, err := s.repo.GetWargaByID(id)
	if err != nil {
		return nil, err
	}
	if role != "ketua_rt" && role != "super_admin" {
		w.Nik = nil
		w.NoKK = nil
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
			wargas[i].Nik = nil
			wargas[i].NoKK = nil
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

func (s *Service) RumahBelongsToTenant(rumahID, tenantID int) bool {
	return s.repo.RumahBelongsToTenant(rumahID, tenantID)
}

func (s *Service) GetWargaByNikNoKk(tenantID int) (map[string]string, error) {
	s.setUp()
	wargas, err := s.repo.GetWargaByTenant(tenantID)
	if err != nil {
		return nil, err
	}
	result := map[string]string{}
	for _, w := range wargas {
		if w.Nik != nil && *w.Nik != "" {
			result[*w.Nik] = w.NoKK
		}
	}
	return result, nil
}

func (s *Service) GetWargaByNikNoKkSealed(tenantID int) (map[string][]byte, error) {
	return s.repo.GetWargaByNikNoKkSealed(tenantID)
}

func (s *Service) UpdateWarga(w *model.Warga) error {
	return s.repo.UpdateWarga(w)
}

func (s *Service) DeleteWarga(id int) error {
	return s.repo.DeleteWarga(id)
}
