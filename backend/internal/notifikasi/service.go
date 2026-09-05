package notifikasi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) Create(userID int, title, message, tipe string) error {
	n := &model.Notifikasi{
		IDUser:    userID,
		Judul:     title,
		Pesan:     message,
		Tipe:      tipe,
		IsRead:    false,
		CreatedAt: time.Now(),
	}
	return s.db.Create(n).Error
}

func (s *Service) SendSettlementNotification(userID int, nama, nominal, status string) error {
	var title, msg string
	switch status {
	case "PENDING":
		title = "Settlement Diajukan"
		msg = fmt.Sprintf("Pengajuan settlement senilai %s berhasil dikirim dan sedang menunggu verifikasi.", nominal)
	case "COMPLETED":
		title = "Settlement Diterima"
		msg = fmt.Sprintf("Pengajuan settlement senilai %s telah diterima dan dana sedang diproses ke rekening Anda.", nominal)
	case "REJECTED":
		title = "Settlement Ditolak"
		msg = fmt.Sprintf("Pengajuan settlement senilai %s ditolak. Silakan hubungi admin untuk info lebih lanjut.", nominal)
	}
	return s.Create(userID, title, msg, "settlement")
}

func (s *Service) SendApprovalNotification(userID int, nama, status string) error {
	var title, msg string
	if status == "active" {
		title = "Akun Diaktifkan"
		msg = fmt.Sprintf("Selamat! Akun Anda telah diaktifkan oleh pengurus. Sekarang Anda bisa mengakses semua fitur.")
	} else {
		title = "Akun Ditolak"
		msg = fmt.Sprintf("Mohon maaf, pendaftaran Anda ditolak oleh pengurus. Silakan hubungi pengurus RT untuk info lebih lanjut.")
	}
	return s.Create(userID, title, msg, "approval")
}

func (s *Service) ListByUser(userID int) ([]model.Notifikasi, error) {
	var list []model.Notifikasi
	err := s.db.Where("id_user = ?", userID).Order("created_at DESC").Limit(50).Find(&list).Error
	return list, err
}

func (s *Service) CountUnread(userID int) (int, error) {
	var n int64
	err := s.db.Model(&model.Notifikasi{}).Where("id_user = ? AND is_read = ?", userID, false).Count(&n).Error
	return int(n), err
}

func (s *Service) MarkAllRead(userID int) error {
	return s.db.Model(&model.Notifikasi{}).Where("id_user = ?", userID).Update("is_read", true).Error
}

func (s *Service) MarkRead(id int) error {
	return s.db.Model(&model.Notifikasi{}).Where("id_notifikasi = ?", id).Update("is_read", true).Error
}

// SendWhatsApp mengirim pesan WhatsApp via API (Fonnte/Whapi)
func (s *Service) SendWhatsApp(noWA, message string) error {
	apiKey := os.Getenv("WA_API_KEY")
	if apiKey == "" {
		// Tidak ada API key, skip
		return nil
	}
	url := os.Getenv("WA_API_URL")
	if url == "" {
		url = "https://api.wa.my.id/api/v1/message/text"
	}
	
	// Format nomor: hapus + jika ada, pastikan 62
	noWA = strings.TrimPrefix(noWA, "+")
	noWA = strings.TrimPrefix(noWA, "0")
	if !strings.HasPrefix(noWA, "62") {
		noWA = "62" + noWA
	}

	payload := map[string]string{
		"to":   noWA,
		"text": message,
	}
	body, _ := json.Marshal(payload)
	
	req, err := http.NewRequest("POST", url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", apiKey)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return fmt.Errorf("WA API error: %d - %s", resp.StatusCode, string(respBody))
	}
	return nil
}

// UploadKTP menyimpan file KTP ke uploads/ktp/
func UploadKTP(fileHeader *multipart.FileHeader, tenantID int) (string, error) {
	if fileHeader == nil {
		return "", fmt.Errorf("file tidak ditemukan")
	}
	
	// Validasi: hanya image/jpeg, image/png, image/webp, max 5MB
	if fileHeader.Size > 5*1024*1024 {
		return "", fmt.Errorf("ukuran file maksimal 5MB")
	}
	
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		return "", fmt.Errorf("format file harus JPG/PNG/WebP")
	}
	
	// Buka file
	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()
	
	// Buat direktori jika belum ada
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "/www/wwwroot/smarthub.logikraf.id/uploads"
	}
	ktpDir := filepath.Join(uploadDir, "ktp")
	if err := os.MkdirAll(ktpDir, 0755); err != nil {
		return "", err
	}
	
	// Generate nama file unik
	filename := fmt.Sprintf("ktp_tenant_%d_%d%s", tenantID, time.Now().Unix(), ext)
	destPath := filepath.Join(ktpDir, filename)
	
	// Simpan
	dest, err := os.Create(destPath)
	if err != nil {
		return "", err
	}
	defer dest.Close()
	
	if _, err := io.Copy(dest, file); err != nil {
		return "", err
	}
	
	// Return URL relatif
	return "/uploads/ktp/" + filename, nil
}
