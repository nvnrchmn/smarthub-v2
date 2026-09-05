package forum

import (
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
