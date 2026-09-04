package model

import "time"

type Warga struct {
	ID             int       `gorm:"column:id_warga;primaryKey;autoIncrement" json:"id_warga"`
	TenantID       int       `gorm:"column:id_tenant" json:"id_tenant"`
	RumahID        *int      `gorm:"column:id_rumah" json:"id_rumah"`
	IDUser         *int      `gorm:"column:id_user" json:"id_user"`
	NamaLengkap    string    `gorm:"column:nama_lengkap;size:155;not null" json:"nama_lengkap"`
	NIK            string    `gorm:"column:nik;size:20" json:"nik"`
	NoKK           string    `gorm:"column:no_kk;size:20" json:"no_kk"`
	StatusHubungan string    `gorm:"column:status_hubungan;size:30;default:Kepala Keluarga" json:"status_hubungan"`
	StatusWarga    string    `gorm:"column:status_warga;size:30;default:Aktif" json:"status_warga"`
	TanggalMutasi  *time.Time `gorm:"column:tanggal_mutasi" json:"tanggal_mutasi"`
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Warga) TableName() string {
	return "warga"
}
