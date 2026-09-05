package model

// Setting — pasangan key/value global (mis. konfigurasi Xendit dari Super Admin).
// Nilai secret disimpan terenkripsi AES-GCM dengan prefix "enc:" (lihat pkg/settings).
type Setting struct {
	SettingKey   string `gorm:"column:setting_key;primaryKey;size:100" json:"setting_key"`
	SettingValue string `gorm:"column:setting_value;type:text;not null" json:"-"`
}

func (Setting) TableName() string { return "settings" }
