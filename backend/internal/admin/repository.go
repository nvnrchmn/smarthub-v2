package admin

import (
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type Summary struct {
	TotalTenants    int64   `json:"total_tenants"`
	TotalUsers      int64   `json:"total_users"`
	TotalRumah      int64   `json:"total_rumah"`
	TotalWarga      int64   `json:"total_warga"`
	TotalTagihan    int64   `json:"total_tagihan"`
	TotalLunas      int64   `json:"total_lunas"`
	TotalBelumBayar int64   `json:"total_belum_bayar"`
	TotalNominal    float64 `json:"total_nominal"`
}

type TenantDetail struct {
	TenantID      int     `json:"tenant_id"`
	NamaRTRW      string  `json:"nama_rt_rw"`
	DesaKelurahan string  `json:"desa_kelurahan"`
	Kecamatan     string  `json:"kecamatan"`
	KabupatenKota string  `json:"kabupaten_kota"`
	Provinsi      string  `json:"provinsi"`
	TotalUsers    int64   `json:"total_users"`
	TotalRumah    int64   `json:"total_rumah"`
	TotalWarga    int64   `json:"total_warga"`
	TotalTagihan  int64   `json:"total_tagihan"`
	TotalLunas    int64   `json:"total_lunas"`
	TotalPending  int64   `json:"total_pending"`
	TotalNominal  float64 `json:"total_nominal"`
}

type Analytics struct {
	Labels  []string  `json:"labels"`
	Revenue []float64 `json:"revenue"`
	Tenants []int64   `json:"tenants"`
}

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Summary() (*Summary, error) {
	s := &Summary{}
	r.db.Model(&model.Tenant{}).Count(&s.TotalTenants)
	r.db.Model(&model.User{}).Count(&s.TotalUsers)
	r.db.Table("rumah").Count(&s.TotalRumah)
	r.db.Table("warga").Count(&s.TotalWarga)
	r.db.Table("tagihan_iuran").Count(&s.TotalTagihan)
	r.db.Table("tagihan_iuran").Where("status_pembayaran = ?", "PAID").Count(&s.TotalLunas)
	r.db.Table("tagihan_iuran").Where("status_pembayaran IN ?", []string{"PENDING", "OVERDUE"}).Count(&s.TotalBelumBayar)
	var total float64
	r.db.Table("tagihan_iuran").Select("COALESCE(SUM(total_nominal),0)").Scan(&total)
	s.TotalNominal = total
	return s, nil
}

func (r *Repository) ListTenants() ([]model.Tenant, error) {
	var tenants []model.Tenant
	err := r.db.Order("id_tenant").Find(&tenants).Error
	return tenants, err
}

func (r *Repository) ListUsers() ([]model.User, error) {
	var users []model.User
	err := r.db.Order("id_user").Find(&users).Error
	return users, err
}

func (r *Repository) GetTenantDetail(tenantID int) (*TenantDetail, error) {
	d := &TenantDetail{TenantID: tenantID}
	var t model.Tenant
	if err := r.db.First(&t, tenantID).Error; err != nil {
		return nil, err
	}
	d.NamaRTRW = t.NamaRTRW
	d.DesaKelurahan = t.DesaKelurahan
	d.Kecamatan = t.Kecamatan
	d.KabupatenKota = t.KabupatenKota
	d.Provinsi = t.Provinsi
	r.db.Model(&model.User{}).Where("id_tenant = ?", tenantID).Count(&d.TotalUsers)
	r.db.Table("rumah").Where("id_tenant = ?", tenantID).Count(&d.TotalRumah)
	r.db.Table("warga").Where("id_tenant = ?", tenantID).Count(&d.TotalWarga)
	r.db.Table("tagihan_iuran").Where("id_tenant = ?", tenantID).Count(&d.TotalTagihan)
	r.db.Table("tagihan_iuran").Where("id_tenant = ? AND status_pembayaran = ?", tenantID, "PAID").Count(&d.TotalLunas)
	r.db.Table("tagihan_iuran").Where("id_tenant = ? AND status_pembayaran IN ?", tenantID, []string{"PENDING", "OVERDUE"}).Count(&d.TotalPending)
	var total float64
	r.db.Table("tagihan_iuran").Where("id_tenant = ?", tenantID).Select("COALESCE(SUM(total_nominal),0)").Scan(&total)
	d.TotalNominal = total
	return d, nil
}

func (r *Repository) Analytics() (*Analytics, error) {
	return &Analytics{
		Labels:  []string{"Mar", "Apr", "Mei", "Jun", "Jul", "Agu"},
		Revenue: []float64{0, 0, 0, 0, 0, 0},
		Tenants: []int64{0, 0, 0, 0, 0, 0},
	}, nil
}

func (r *Repository) CreateAuditLog(log *model.AuditLog) error {
	return r.db.Create(log).Error
}

func (r *Repository) ListAuditLogs(limit int) ([]model.AuditLog, error) {
	var logs []model.AuditLog
	err := r.db.Order("created_at DESC").Limit(limit).Find(&logs).Error
	return logs, err
}

func (r *Repository) CreateBroadcast(userID int, title, message, tipe string) error {
	b := &model.Broadcast{
		IDUser:  userID,
		Judul:   title,
		Pesan:   message,
		Tipe:    tipe,
	}
	return r.db.Create(b).Error
}

func (r *Repository) ListBroadcasts(limit int) ([]model.Broadcast, error) {
	var broadcasts []model.Broadcast
	err := r.db.Order("created_at DESC").Limit(limit).Find(&broadcasts).Error
	return broadcasts, err
}
