package settings

import (
	"errors"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"github.com/nvnrchmn/smarthub-v2/pkg/encryption"
	"gorm.io/gorm"
)

// Store — akses key/value global; secret disimpan terenkripsi AES-GCM
// (prefix "enc:"). Dipakai modul admin (menulis) & keuangan (membaca Xendit).
const encPrefix = "enc:"

type Store struct {
	db  *gorm.DB
	enc *encryption.AES
}

func New(db *gorm.DB, enc *encryption.AES) *Store {
	return &Store{db: db, enc: enc}
}

// SetSecret menyimpan nilai terenkripsi.
func (s *Store) SetSecret(key, value string) error {
	ct, err := s.enc.Encrypt(value)
	if err != nil {
		return err
	}
	return s.upsert(key, encPrefix+ct)
}

// GetSecret mengambil & mendekripsi nilai secret. Return "" bila belum di-set.
func (s *Store) GetSecret(key string) string {
	raw, ok := s.Get(key)
	if !ok || raw == "" {
		return ""
	}
	if len(raw) > len(encPrefix) && raw[:len(encPrefix)] == encPrefix {
		plain, err := s.enc.Decrypt(raw[len(encPrefix):])
		if err != nil {
			return ""
		}
		return plain
	}
	return raw // kompatibilitas: nilai lama tanpa enkripsi
}

func (s *Store) Get(key string) (string, bool) {
	var st model.Setting
	if err := s.db.Where("setting_key = ?", key).First(&st).Error; err != nil {
		return "", false
	}
	return st.SettingValue, true
}

func (s *Store) upsert(key, value string) error {
	if key == "" {
		return errors.New("setting key tidak boleh kosong")
	}
	return s.db.Exec(
		"INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
		key, value,
	).Error
}
