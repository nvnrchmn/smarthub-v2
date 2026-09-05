package model

import (
	"time"
)

type InviteCode struct {
	ID           int        `gorm:"column:id_invite;primaryKey;autoIncrement" json:"id_invite"`
	Code         string     `gorm:"column:code;size:50;not null;uniqueIndex" json:"code"`
	TenantID     int        `gorm:"column:id_tenant;not null;index" json:"tenant_id"`
	CreatedBy    int        `gorm:"column:created_by;not null;index" json:"created_by"`
	RoleFor      string     `gorm:"column:role_for;size:20;not null;default:'warga'" json:"role_for"`
	ExpiresAt    *time.Time `gorm:"column:expires_at" json:"expires_at"`
	MaxUses      *int       `gorm:"column:max_uses" json:"max_uses"`
	UsedAt       *time.Time `gorm:"column:used_at" json:"used_at"`
	UsedCount    int        `gorm:"column:used_count;default:0" json:"used_count"`
	IsActive     bool       `gorm:"column:is_active;default:true" json:"is_active"`
	CreatedAt    time.Time  `gorm:"column:created_at" json:"created_at"`
}

func (InviteCode) TableName() string {
	return "invite_codes"
}

// IsValid returns true if code is still valid (not expired, not maxed out, active)
func (ic *InviteCode) IsValid() bool {
	if !ic.IsActive {
		return false
	}
	if ic.ExpiresAt != nil && time.Now().After(*ic.ExpiresAt) {
		return false
	}
	if ic.MaxUses != nil && ic.UsedCount >= *ic.MaxUses {
		return false
	}
	return true
}
