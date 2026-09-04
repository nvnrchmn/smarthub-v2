package model

import "time"

type Rumah struct {
	ID             int       `gorm:"column:id_rumah;primaryKey;autoIncrement" json:"id_rumah"`
	TenantID       int       `gorm:"column:id_tenant" json:"id_tenant"`
	NamaJalanGang  string    `gorm:"column:nama_jalan_gang;size:100;not null" json:"nama_jalan_gang"`
	NomorRumah     string    `gorm:"column:nomor_rumah;size:20;not null" json:"nomor_rumah"`
	StatusHunian   string    `gorm:"column:status_hunian;size:20;default:Dihuni" json:"status_hunian"`
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Rumah) TableName() string {
	return "rumah"
}
