package model

import "time"

type AuditLog struct {
	ID         int       `gorm:"column:id_log;primaryKey;autoIncrement" json:"id_log"`
	IDUser     int       `gorm:"column:id_user;not null;index" json:"id_user"`
	IDTenant   int       `gorm:"column:id_tenant;index" json:"id_tenant"`
	Action     string    `gorm:"column:action;size:100;not null" json:"action"`
	Resource   string    `gorm:"column:resource;size:100" json:"resource"`
	Detail     string    `gorm:"column:detail;type:text" json:"detail"`
	IPAddress  string    `gorm:"column:ip_address;size:45" json:"ip_address"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"created_at"`
}

func (AuditLog) TableName() string { return "audit_log" }

type Broadcast struct {
	ID        int       `gorm:"column:id_broadcast;primaryKey;autoIncrement" json:"id_broadcast"`
	IDUser    int       `gorm:"column:id_user;not null" json:"id_user"`
	Judul     string    `gorm:"column:judul;size:255;not null" json:"judul"`
	Pesan     string    `gorm:"column:pesan;type:text;not null" json:"pesan"`
	Tipe      string    `gorm:"column:tipe;size:20;default:all" json:"tipe"` // all, tenant, role
	TargetID  *int      `gorm:"column:id_target" json:"id_target"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
}

func (Broadcast) TableName() string { return "broadcast" }
