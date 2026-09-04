package model

import "time"

type MasterIuran struct {
	IDMasterIuran int       `gorm:"column:id_master_iuran;primaryKey;autoIncrement" json:"id_master_iuran"`
	TenantID      int       `gorm:"column:id_tenant" json:"id_tenant"`
	NamaIuran     string    `gorm:"column:nama_iuran;size:100;not null" json:"nama_iuran"`
	Nominal       float64   `gorm:"column:nominal;type:decimal(12,2);not null" json:"nominal"`
	IsWajib       bool      `gorm:"column:is_wajib;default:true" json:"is_wajib"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"created_at"`
}

func (MasterIuran) TableName() string { return "master_iuran" }

type TagihanIuran struct {
	IDTagihan      int        `gorm:"column:id_tagihan;primaryKey;autoIncrement" json:"id_tagihan"`
	TenantID      int        `gorm:"column:id_tenant" json:"id_tenant"`
	RumahID       int        `gorm:"column:id_rumah" json:"id_rumah"`
	Periode       string     `gorm:"column:periode_bulan_tahun;size:7;not null" json:"periode_bulan_tahun"`
	TotalNominal  float64    `gorm:"column:total_nominal;type:decimal(12,2);not null" json:"total_nominal"`
	StatusBayar   string     `gorm:"column:status_pembayaran;size:20;default:PENDING" json:"status_pembayaran"`
	XenditInvID   *string    `gorm:"column:xendit_invoice_id;size:100" json:"xendit_invoice_id"`
	XenditPayURL  *string    `gorm:"column:xendit_payment_url" json:"xendit_payment_url"`
	IDUserBayar   *int       `gorm:"column:id_user_pembayar" json:"id_user_pembayar"`
	PaidAt        *time.Time `gorm:"column:paid_at" json:"paid_at"`
	CreatedAt     time.Time  `gorm:"column:created_at" json:"created_at"`
}

func (TagihanIuran) TableName() string { return "tagihan_iuran" }

type DetailTagihan struct {
	IDDetail   int     `gorm:"column:id_detail;primaryKey;autoIncrement" json:"id_detail"`
	IDTagihan  int     `gorm:"column:id_tagihan" json:"id_tagihan"`
	NamaIuran  string  `gorm:"column:nama_iuran;size:100;not null" json:"nama_iuran"`
	Nominal    float64 `gorm:"column:nominal;type:decimal(12,2);not null" json:"nominal"`
}

func (DetailTagihan) TableName() string { return "detail_tagihan_iuran" }
