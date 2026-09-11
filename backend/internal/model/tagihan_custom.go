package model

import "time"

type TagihanCustom struct {
	ID              int        `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	TenantID        int        `gorm:"column:id_tenant" json:"id_tenant"`
	RumahID         int        `gorm:"column:id_rumah" json:"id_rumah"`
	Deskripsi       string     `gorm:"column:deskripsi;size:255;not null" json:"deskripsi"`
	Nominal         float64    `gorm:"column:nominal;type:decimal(12,2);not null" json:"nominal"`
	Periode         string     `gorm:"column:periode;size:7;not null" json:"periode"`
	StatusBayar     string     `gorm:"column:status_pembayaran;size:20;default:PENDING" json:"status_pembayaran"`
	IDUserBayar     *int       `gorm:"column:id_user_pembayar" json:"id_user_pembayar"`
	PaidAt          *time.Time `gorm:"column:paid_at" json:"paid_at"`
	XenditInvID     *string    `gorm:"column:xendit_invoice_id;size:100" json:"xendit_invoice_id"`
	XenditPayURL    *string    `gorm:"column:xendit_payment_url" json:"xendit_payment_url"`
	CreatedAt       time.Time  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"column:updated_at" json:"updated_at"`
	NamaRumah       string     `gorm:"-" json:"nama_rumah,omitempty"`
	NamaJalanGang   string     `gorm:"-" json:"nama_jalan_gang,omitempty"`
	NomorRumah      string     `gorm:"-" json:"nomor_rumah,omitempty"`
}

func (TagihanCustom) TableName() string { return "tagihan_custom" }
