package model

import "time"

type Thread struct {
	IDThread    int       `gorm:"column:id_thread;primaryKey;autoIncrement" json:"id_thread"`
	IDTenant    int       `gorm:"column:id_tenant" json:"id_tenant"`
	IDUser      int       `gorm:"column:id_user_pembuat" json:"id_user_pembuat"`
	TipeThread  string    `gorm:"column:tipe_thread;size:20;default:Diskusi" json:"tipe_thread"`
	Judul       string    `gorm:"column:judul;size:255;not null" json:"judul"`
	Konten      string    `gorm:"column:konten;not null" json:"konten"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Thread) TableName() string { return "forum_threads" }

type Komentar struct {
	IDKomentar  int       `gorm:"column:id_komentar;primaryKey;autoIncrement" json:"id_komentar"`
	IDThread    int       `gorm:"column:id_thread" json:"id_thread"`
	IDUser      int       `gorm:"column:id_user" json:"id_user"`
	Komentar    string    `gorm:"column:komentar;not null" json:"komentar"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`
}

func (Komentar) TableName() string { return "forum_komentar" }

type Produk struct {
	IDProduk     int       `gorm:"column:id_produk;primaryKey;autoIncrement" json:"id_produk"`
	IDTenant     int       `gorm:"column:id_tenant" json:"id_tenant"`
	IDUser       int       `gorm:"column:id_user_penjual" json:"id_user_penjual"`
	NamaProduk   string    `gorm:"column:nama_produk_jasa;size:150;not null" json:"nama_produk_jasa"`
	Deskripsi    string    `gorm:"column:deskripsi;not null" json:"deskripsi"`
	Harga        float64   `gorm:"column:harga;type:decimal(12,2);default:0" json:"harga"`
	FotoURL      string    `gorm:"column:foto_url" json:"foto_url"`
	IsApproved   bool      `gorm:"column:is_approved;default:true" json:"is_approved"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Produk) TableName() string { return "lapak_warga" }
