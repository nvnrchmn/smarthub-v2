package model

import "time"

type User struct {
	ID           int       `gorm:"column:id_user;type:int;primaryKey;autoIncrement"`
	TenantID     int       `gorm:"column:id_tenant;type:int;not null"`
	NomorWA      string    `gorm:"column:nomor_wa;size:20;not null;uniqueIndex"`
	PasswordHash string    `gorm:"column:password_hash;not null"`
	Role         string    `gorm:"column:role;size:30;not null;default:warga"`
	TokenFCM     string    `gorm:"column:fcm_token_pwa;size:255"`
	IsActive     bool      `gorm:"column:is_active;default:true"`
	CreatedAt    time.Time `gorm:"column:created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at"`
}

type Tenant struct {
	ID               int       `gorm:"column:id_tenant;type:int;primaryKey;autoIncrement"`
	NamaRTRW         string    `gorm:"column:nama_rt_rw;size:100;not null"`
	DesaKelurahan    string    `gorm:"column:desa_kelurahan;size:100"`
	Kecamatan        string    `gorm:"column:kecamatan;size:100"`
	KabupatenKota    string    `gorm:"column:kabupaten_kota;size:100"`
	Provinsi         string    `gorm:"column:provinsi;size:100"`
	XenditSubID      string    `gorm:"column:xendit_sub_account_id;size:100"`
	XenditKYCStatus  string    `gorm:"column:xendit_kyc_status;size:30"`
	StatusBerlanggan string    `gorm:"column:status_berlangganan;size:20;default:AKTIF"`
	CreatedAt        time.Time `gorm:"column:created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at"`
}
