package model

import "time"

// Notifikasi — pemberitahuan antar warga satu tenant (mis. @mention di forum).
type Notifikasi struct {
	IDNotifikasi int       `gorm:"column:id_notifikasi;primaryKey;autoIncrement" json:"id_notifikasi"`
	IDUser       int       `gorm:"column:id_user;not null" json:"id_user"`
	IDTenant     int       `gorm:"column:id_tenant;not null" json:"id_tenant"`
	Tipe         string    `gorm:"column:tipe;size:20" json:"tipe"`
	Judul        string    `gorm:"column:judul;size:255" json:"judul"`
	IDRef        *int      `gorm:"column:id_ref" json:"id_ref"`
	Pesan        string    `gorm:"column:pesan;not null" json:"pesan"`
	IsRead       bool      `gorm:"column:is_read" json:"is_read"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
}

func (Notifikasi) TableName() string { return "notifikasi" }
