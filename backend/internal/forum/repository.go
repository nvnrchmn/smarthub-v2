package forum

import (
	"strings"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateThread(t *model.Thread) error {
	return r.db.Create(t).Error
}

func (r *Repository) GetThreadsByTenant(tenantID int) ([]model.Thread, error) {
	var threads []model.Thread
	err := r.db.Where("id_tenant = ?", tenantID).Order("created_at DESC").Find(&threads).Error
	return threads, err
}

func (r *Repository) GetThreadByID(id int) (*model.Thread, error) {
	var t model.Thread
	err := r.db.First(&t, id).Error
	return &t, err
}

func (r *Repository) CreateKomentar(k *model.Komentar) error {
	return r.db.Create(k).Error
}

func (r *Repository) GetKomentarByThread(threadID int) ([]model.Komentar, error) {
	var komentar []model.Komentar
	err := r.db.Where("id_thread = ?", threadID).Order("created_at ASC").Find(&komentar).Error
	return komentar, err
}

// ListWargaMention — daftar warga satu tenant yang punya akun (id_user terisi),
// untuk mencocokkan @Nama di teks forum.
func (r *Repository) ListWargaMention(tenantID int) ([]model.WargaMention, error) {
	var rows []model.WargaMention
	err := r.db.Table("warga").
		Select("id_user, nama_lengkap").
		Where("id_tenant = ? AND id_user IS NOT NULL", tenantID).
		Scan(&rows).Error
	return rows, err
}

// InsertNotifs menyisipkan notifikasi @mention secara batch.
func (r *Repository) InsertNotifs(items []model.Notifikasi) error {
	if len(items) == 0 {
		return nil
	}
	return r.db.Create(&items).Error
}

// MentionedUsers — deteksi @Nama Lengkap yang disebut (case-insensitive, batas kata).
func MentionedUsers(teks string, warga []model.WargaMention, excludeUser int) []model.WargaMention {
	lower := strings.ToLower(teks)
	var out []model.WargaMention
	for _, w := range warga {
		if w.IDUser == excludeUser || w.NamaLengkap == "" {
			continue
		}
		target := "@" + strings.ToLower(w.NamaLengkap)
		idx := strings.Index(lower, target)
		for idx >= 0 {
			after := idx + len(target)
			ok := after >= len(lower) || !isWordChar(lower[after])
			if ok {
				out = append(out, w)
				break
			}
			idx = strings.Index(lower[after:], target)
			if idx >= 0 {
				idx += after
			}
		}
	}
	return out
}

func isWordChar(b byte) bool {
	return (b >= 'a' && b <= 'z') || (b >= '0' && b <= '9') || b == '_'
}

// GetWargaNames memetakan id_user → nama_lengkap untuk penampilan "oleh …".
func (r *Repository) GetWargaNames(userIDs []int) (map[int]string, error) {
	names := map[int]string{}
	if len(userIDs) == 0 {
		return names, nil
	}
	var rows []struct {
		IDUser      int
		NamaLengkap string
	}
	if err := r.db.Table("warga").Select("id_user, nama_lengkap").Where("id_user IN ?", userIDs).Scan(&rows).Error; err != nil {
		return names, err
	}
	for _, row := range rows {
		names[row.IDUser] = row.NamaLengkap
	}
	return names, nil
}

// CountKomentarByThreads menghitung jumlah komentar per id_thread dalam satu query.
func (r *Repository) CountKomentarByThreads(threadIDs []int) (map[int]int, error) {
	counts := map[int]int{}
	if len(threadIDs) == 0 {
		return counts, nil
	}
	var rows []struct {
		IDThread int
		Total    int
	}
	if err := r.db.Table("forum_komentar").Select("id_thread, COUNT(*) AS total").Where("id_thread IN ?", threadIDs).Group("id_thread").Scan(&rows).Error; err != nil {
		return counts, err
	}
	for _, row := range rows {
		counts[row.IDThread] = row.Total
	}
	return counts, nil
}
