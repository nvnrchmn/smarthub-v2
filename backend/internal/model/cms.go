package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

type Layanan struct {
	IDLayanan      int       `gorm:"column:id_layanan;primaryKey;autoIncrement" json:"id_layanan"`
	IDTenant       int       `gorm:"column:id_tenant;not null" json:"id_tenant"`
	IDRumah        int       `gorm:"column:id_rumah;not null" json:"id_rumah"`
	Status         string    `gorm:"column:status;size:20;default:AKTIF" json:"status"`
	HargaPerBulan  float64   `gorm:"column:harga_per_bulan;type:decimal(12,2);default:3000" json:"harga_per_bulan"`
	TanggalMulai   string    `gorm:"column:tanggal_mulai;type:date" json:"tanggal_mulai"`
	TanggalExpire  string    `gorm:"column:tanggal_expire;type:date" json:"tanggal_expire"`
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Layanan) TableName() string { return "layanan" }

type Invoice struct {
	IDInvoice         int        `gorm:"column:id_invoice;primaryKey;autoIncrement" json:"id_invoice"`
	IDLayanan         int        `gorm:"column:id_layanan;not null" json:"id_layanan"`
	NomorInvoice      string     `gorm:"column:nomor_invoice;size:50;not null;unique" json:"nomor_invoice"`
	BulanTagihan      string     `gorm:"column:bulan_tagihan;size:7;not null" json:"bulan_tagihan"`
	JumlahRumah       int        `gorm:"column:jumlah_rumah;not null" json:"jumlah_rumah"`
	HargaPerRumah     float64    `gorm:"column:harga_per_rumah;type:decimal(12,2);default:3000" json:"harga_per_rumah"`
	TotalNominal      float64    `gorm:"column:total_nominal;type:decimal(12,2);not null" json:"total_nominal"`
	Status            string     `gorm:"column:status;size:20;default:PENDING" json:"status"`
	TanggalJatuhTempo string     `gorm:"column:tanggal_jatuh_tempo;type:date" json:"tanggal_jatuh_tempo"`
	TanggalBayar      *time.Time `gorm:"column:tanggal_bayar;type:date" json:"tanggal_bayar"`
	MetodeBayar       string     `gorm:"column:metode_bayar;size:50" json:"metode_bayar"`
	CreatedAt         time.Time  `gorm:"column:created_at" json:"created_at"`
}

func (Invoice) TableName() string { return "invoice" }

// JSON type for GORM
type JSON json.RawMessage

func (j *JSON) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	*j = append((*j)[0:0], bytes...)
	return nil
}

func (j JSON) Value() (driver.Value, error) {
	if len(j) == 0 {
		return nil, nil
	}
	return string(j), nil
}

type CMSLanding struct {
	ID        int       `gorm:"column:id_cms;primaryKey;autoIncrement" json:"id_cms"`
	Section   string    `gorm:"column:section;size:50;not null;unique" json:"section"`
	Data      JSON      `gorm:"column:data;type:json;not null" json:"data"`
	UpdatedBy *int      `gorm:"column:updated_by" json:"updated_by"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (CMSLanding) TableName() string { return "cms_landing" }
