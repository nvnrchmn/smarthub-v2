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
