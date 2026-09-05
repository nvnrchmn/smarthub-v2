package settlement

import (
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

type RekeningRequest struct {
	NamaPemilik   string `json:"nama_pemilik"`
	BankCode      string `json:"bank_code"`
	NomorRekening string `json:"nomor_rekening"`
}

// UpdateRekening update data rekening tenant
func (s *Service) UpdateRekening(tenantID int, req RekeningRequest) error {
	return s.db.Model(&model.Tenant{}).Where("id_tenant = ?", tenantID).Updates(map[string]interface{}{
		"nama_pemilik_rekening": req.NamaPemilik,
		"bank_code":             req.BankCode,
		"nomor_rekening":        req.NomorRekening,
		"xendit_kyc_status":     "PENDING",
	}).Error
}

// UploadKTP update URL KTP tenant
func (s *Service) UploadKTP(tenantID int, ktpURL string) error {
	return s.db.Model(&model.Tenant{}).Where("id_tenant = ?", tenantID).Update("ktp_url", ktpURL).Error
}

// VerifyKTP tandai KTP sudah diverifikasi oleh super admin
func (s *Service) VerifyKTP(tenantID int) error {
	return s.db.Model(&model.Tenant{}).Where("id_tenant = ?", tenantID).Updates(map[string]interface{}{
		"ktp_verified":      true,
		"xendit_kyc_status": "LIVE",
	}).Error
}

// RejectKTP tolak KTP
func (s *Service) RejectKTP(tenantID int) error {
	return s.db.Model(&model.Tenant{}).Where("id_tenant = ?", tenantID).Updates(map[string]interface{}{
		"ktp_verified":      false,
		"xendit_kyc_status": "REJECTED",
	}).Error
}

// GetSettlementInfo ambil data settlement tenant
func (s *Service) GetSettlementInfo(tenantID int) (*model.Tenant, error) {
	var tenant model.Tenant
	if err := s.db.Where("id_tenant = ?", tenantID).First(&tenant).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

// ListSettlements ambil semua tenant yang butuh verifikasi (super admin)
func (s *Service) ListSettlements(status string) ([]model.Tenant, error) {
	var tenants []model.Tenant
	query := s.db.Order("created_at DESC")

	if status != "" && status != "all" {
		query = query.Where("xendit_kyc_status = ?", status)
	}

	if err := query.Find(&tenants).Error; err != nil {
		return nil, err
	}
	return tenants, nil
}

type SettlementReport struct {
	TotalTenants      int     `json:"total_tenants"`
	KYCPending        int     `json:"kyc_pending"`
	KYCLive           int     `json:"kyc_live"`
	KYCRejected       int     `json:"kyc_rejected"`
	TotalIuranPending float64 `json:"total_iuran_pending"`
}

// GetSummary ambil ringkasan settlement untuk dashboard super admin
func (s *Service) GetSummary() (*SettlementReport, error) {
	var report SettlementReport

	var total, pending, live, rejected int64
	s.db.Model(&model.Tenant{}).Count(&total)
	s.db.Model(&model.Tenant{}).Where("xendit_kyc_status = ?", "PENDING").Count(&pending)
	s.db.Model(&model.Tenant{}).Where("xendit_kyc_status = ?", "LIVE").Count(&live)
	s.db.Model(&model.Tenant{}).Where("xendit_kyc_status = ?", "REJECTED").Count(&rejected)

	report.TotalTenants = int(total)
	report.KYCPending = int(pending)
	report.KYCLive = int(live)
	report.KYCRejected = int(rejected)

	return &report, nil
}
