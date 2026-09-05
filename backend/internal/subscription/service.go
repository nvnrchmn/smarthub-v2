package subscription

import (
	"strconv"
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

// GetLayananByTenant returns all layanan for a tenant
func (s *Service) GetLayananByTenant(tenantID int) ([]model.Layanan, error) {
	var list []model.Layanan
	err := s.db.Where("id_tenant = ?", tenantID).Find(&list).Error
	return list, err
}

// GetLayananByRumah returns layanan for a specific rumah
func (s *Service) GetLayananByRumah(tenantID, rumahID int) (*model.Layanan, error) {
	var l model.Layanan
	err := s.db.Where("id_tenant = ? AND id_rumah = ?", tenantID, rumahID).First(&l).Error
	return &l, err
}

// CreateLayanan creates a new layanan for a rumah
func (s *Service) CreateLayanan(tenantID, rumahID int, harga float64) (*model.Layanan, error) {
	l := &model.Layanan{
		IDTenant:      tenantID,
		IDRumah:       rumahID,
		Status:        "AKTIF",
		HargaPerBulan: harga,
		TanggalMulai:  time.Now().Format("2006-01-02"),
		TanggalExpire: time.Now().AddDate(0, 1, 0).Format("2006-01-02"),
	}
	err := s.db.Create(l).Error
	return l, err
}

// GetInvoices returns invoices for a tenant
func (s *Service) GetInvoices(tenantID int) ([]model.Invoice, error) {
	var list []model.Invoice
	err := s.db.Joins("JOIN layanan ON layanan.id_layanan = invoice.id_layanan").
		Where("layanan.id_tenant = ?", tenantID).
		Order("invoice.created_at DESC").
		Find(&list).Error
	return list, err
}

// CreateInvoice creates a new invoice
func (s *Service) CreateInvoice(idLayanan int, bulanTagihan string, jumlahRumah int) (*model.Invoice, error) {
	var l model.Layanan
	if err := s.db.First(&l, idLayanan).Error; err != nil {
		return nil, err
	}
	
	total := float64(jumlahRumah) * l.HargaPerBulan
	inv := &model.Invoice{
		IDLayanan:     idLayanan,
		NomorInvoice:  "INV-" + time.Now().Format("20060102") + "-" + strconv.Itoa(idLayanan),
		BulanTagihan:  bulanTagihan,
		JumlahRumah:   jumlahRumah,
		HargaPerRumah: l.HargaPerBulan,
		TotalNominal:  total,
		Status:        "PENDING",
		TanggalJatuhTempo: time.Now().AddDate(0, 0, 7).Format("2006-01-02"),
	}
	err := s.db.Create(inv).Error
	return inv, err
}

// PayInvoice marks an invoice as paid
func (s *Service) PayInvoice(id int, metode string) error {
	now := time.Now()
	return s.db.Model(&model.Invoice{}).Where("id_invoice = ?", id).Updates(map[string]interface{}{
		"status":         "PAID",
		"tanggal_bayar":  now.Format("2006-01-02"),
		"metode_bayar":   metode,
	}).Error
}

// ListAll returns all layanan (super admin)
func (s *Service) ListAll() ([]model.Layanan, error) {
	var list []model.Layanan
	err := s.db.Find(&list).Error
	return list, err
}

// ListAllInvoices returns all invoices (super admin)
func (s *Service) ListAllInvoices() ([]model.Invoice, error) {
	var list []model.Invoice
	err := s.db.Order("created_at DESC").Find(&list).Error
	return list, err
}

// Summary returns super admin summary
func (s *Service) Summary() (map[string]interface{}, error) {
	var totalLayanan, aktif, suspended int64
	s.db.Model(&model.Layanan{}).Count(&totalLayanan)
	s.db.Model(&model.Layanan{}).Where("status = ?", "AKTIF").Count(&aktif)
	s.db.Model(&model.Layanan{}).Where("status = ?", "SUSPENDED").Count(&suspended)
	
	var totalRevenue float64
	s.db.Model(&model.Invoice{}).Where("status = ?", "PAID").Select("COALESCE(SUM(total_nominal),0)").Scan(&totalRevenue)
	
	return map[string]interface{}{
		"total_layanan":   totalLayanan,
		"aktif":           aktif,
		"suspended":       suspended,
		"total_revenue":   totalRevenue,
	}, nil
}
