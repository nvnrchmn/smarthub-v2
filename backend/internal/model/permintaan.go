package model

import "time"

type PermintaanPerbaikan struct {
	ID              int        `gorm:"column:id_permintaan;primaryKey;autoIncrement" json:"id_permintaan"`
	IDWarga         int        `gorm:"column:id_warga;not null" json:"id_warga"`
	IDTenant        int        `gorm:"column:id_tenant;not null" json:"id_tenant"`
	IDUserPengaju   int        `gorm:"column:id_user_pengaju;not null" json:"id_user_pengaju"`
	FieldYangDiubah string     `gorm:"column:field_yang_diubah;size:50;not null" json:"field_yang_diubah"`
	NilaiLama       *string    `gorm:"column:nilai_lama" json:"nilai_lama"`
	NilaiBaru       string     `gorm:"column:nilai_baru;not null" json:"nilai_baru"`
	Keterangan      *string    `gorm:"column:keterangan" json:"keterangan"`
	Status          string     `gorm:"column:status;size:20;default:pending" json:"status"`
	DitinjauOleh    *int       `gorm:"column:ditinjau_oleh" json:"ditinjau_oleh"`
	CatatanPengurus *string    `gorm:"column:catatan_pengurus" json:"catatan_pengurus"`
	CreatedAt       time.Time  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"column:updated_at" json:"updated_at"`
	NamaPengaju     string     `gorm:"-" json:"nama_pengaju"`
	NamaWarga       string     `gorm:"-" json:"nama_warga"`
}

func (PermintaanPerbaikan) TableName() string { return "permintaan_perbaikan" }
