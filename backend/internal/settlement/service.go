package settlement

import (
	"time"

	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/gorm"
)

// SettlementRequest merepresentasikan permintaan pencairan dana tagihan lunas
// oleh ketua/bendahara RT ke rekening bank mereka.
type SettlementRequest struct {
	ID            int        `gorm:"column:id_settlement;primaryKey;autoIncrement" json:"id_settlement"`
	TenantID      int        `gorm:"column:id_tenant;not null;index" json:"id_tenant"`
	RequesterID   int        `gorm:"column:requested_by;not null" json:"requested_by"`
	TotalNominal  int64      `gorm:"column:total_nominal;not null" json:"total_nominal"`
	BankCode      string     `gorm:"column:bank_code;size:20;not null" json:"bank_code"`
	AccountNumber string     `gorm:"column:account_number;size:50;not null" json:"account_number"`
	AccountName   string     `gorm:"column:account_name;size:155;not null" json:"account_name"`
	Status        string     `gorm:"column:status;size:20;not null;default:PENDING" json:"status"`
	Note          string     `gorm:"column:note" json:"note"`
	CompletedAt   *time.Time `gorm:"column:completed_at" json:"completed_at"`
	CompletedBy   *int       `gorm:"column:completed_by" json:"completed_by"`
	RejectReason  string     `gorm:"column:reject_reason" json:"reject_reason"`
	CreatedAt     time.Time  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time  `gorm:"column:updated_at" json:"updated_at"`
}

func (SettlementRequest) TableName() string { return "settlement_requests" }

// SettlementTagihan link tagihan PAID ke settlement
type SettlementTagihan struct {
	ID           int    `gorm:"primaryKey;autoIncrement" json:"id"`
	IDSettlement int    `gorm:"column:id_settlement;not null;index" json:"id_settlement"`
	IDTagihan    int    `gorm:"column:id_tagihan;not null;uniqueIndex" json:"id_tagihan"`
	Nominal      int64  `gorm:"column:nominal;not null" json:"nominal"`
}

func (SettlementTagihan) TableName() string { return "settlement_tagihan" }

// SettlementTagihanView untuk response
type SettlementTagihanView struct {
	IDTagihan   int    `json:"id_tagihan"`
	IDRumah     int    `json:"id_rumah"`
	Periode     string `json:"periode_bulan_tahun"`
	Nominal     int64  `json:"total_nominal"`
	NamaWarga   string `json:"nama_warga"`
}

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// GetSettlementBalance menghitung total tagihan PAID yang siap disettlement
// (belum di-settle atau sedang diproses)
func (s *Service) GetSettlementBalance(tenantID int) (int64, []SettlementTagihanView, error) {
	var tagihan []SettlementTagihanView
	err := s.db.Raw(`
		SELECT t.id_tagihan, t.id_rumah, t.periode_bulan_tahun, t.total_nominal,
		       COALESCE(w.nama_lengkap, '-') AS nama_warga
		FROM tagihan_iuran t
		JOIN rumah r ON r.id_rumah = t.id_rumah
		LEFT JOIN warga w ON w.id_rumah = t.id_rumah
		WHERE r.id_tenant = ? AND t.status_pembayaran = 'PAID'
		  AND t.id_tagihan NOT IN (
		    SELECT st.id_tagihan FROM settlement_tagihan st
		    JOIN settlement_requests sr ON sr.id_settlement = st.id_settlement
		    WHERE sr.status IN ('PENDING','PROCESSING','COMPLETED')
		  )
		ORDER BY t.created_at DESC
	`, tenantID).Scan(&tagihan).Error
	if err != nil {
		return 0, nil, err
	}

	var total int64
	for _, t := range tagihan {
		total += t.Nominal
	}
	return total, tagihan, nil
}

// RequestSettlement membuat permintaan pencairan dana
func (s *Service) RequestSettlement(sr *SettlementRequest) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(sr).Error; err != nil {
			return err
		}
		// Link available paid tagihan to settlement
		var tagihan []struct {
			IDTagihan int   `gorm:"column:id_tagihan"`
			Nominal   int64 `gorm:"column:total_nominal"`
		}
		err := tx.Raw(`
			SELECT t.id_tagihan, t.total_nominal
			FROM tagihan_iuran t
			JOIN rumah r ON r.id_rumah = t.id_rumah
			WHERE r.id_tenant = ? AND t.status_pembayaran = 'PAID'
			  AND t.id_tagihan NOT IN (
			    SELECT st.id_tagihan FROM settlement_tagihan st2
			    JOIN settlement_requests sr2 ON sr2.id_settlement = st2.id_settlement
			    WHERE sr2.status IN ('PENDING','PROCESSING','COMPLETED')
			  )
		`, sr.TenantID).Scan(&tagihan).Error
		if err != nil {
			return err
		}

		var calculatedTotal int64
		for _, t := range tagihan {
			st := &SettlementTagihan{
				IDSettlement: sr.ID,
				IDTagihan:    t.IDTagihan,
				Nominal:      t.Nominal,
			}
			if err := tx.Create(st).Error; err != nil {
				return err
			}
			calculatedTotal += t.Nominal
		}

		// Update total nominal yang di-request
		if calculatedTotal > 0 {
			sr.TotalNominal = calculatedTotal
			if err := tx.Save(sr).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// ListSettlements list settlement per-tenant atau semua (super_admin)
func (s *Service) ListSettlements(tenantID *int, status string) ([]SettlementRequest, error) {
	var results []SettlementRequest
	q := s.db.Model(&SettlementRequest{})
	if tenantID != nil {
		q = q.Where("id_tenant = ?", *tenantID)
	}
	if status != "" {
		q = q.Where("status = ?", status)
	}
	err := q.Order("created_at DESC").Find(&results).Error
	return results, err
}

// CompleteSettlement menandai settlement selesai
func (s *Service) CompleteSettlement(id int, completedBy int) error {
	now := time.Now()
	return s.db.Model(&SettlementRequest{}).Where("id_settlement = ?", id).Updates(map[string]interface{}{
		"status":       "COMPLETED",
		"completed_at": &now,
		"completed_by": completedBy,
	}).Error
}

// RejectSettlement menolak settlement dan release tagihan
func (s *Service) RejectSettlement(id int, reason string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Delete settlement_tagihan records (release tagihan)
		if err := tx.Where("id_settlement = ?", id).Delete(&SettlementTagihan{}).Error; err != nil {
			return err
		}
		// Update status to REJECTED
		return tx.Model(&SettlementRequest{}).Where("id_settlement = ?", id).Updates(map[string]interface{}{
			"status":        "REJECTED",
			"reject_reason": reason,
		}).Error
	})
}

type SettlementSummary struct {
	TotalTenants     int64 `json:"total_tenants"`
	PendingCount     int64 `json:"pending_count"`
	CompletedCount   int64 `json:"completed_count"`
	RejectedCount    int64 `json:"rejected_count"`
	PendingNominal   int64 `json:"pending_nominal"`
	CompletedNominal int64 `json:"completed_nominal"`
	TotalPaidTagihan int64 `json:"total_paid_tagihan"`
}

// SettlementSummary ringkasan untuk dashboard super_admin
func (s *Service) SettlementSummary() (*SettlementSummary, error) {
	var summary SettlementSummary
	s.db.Model(&model.Tenant{}).Count(&summary.TotalTenants)
	s.db.Model(&SettlementRequest{}).Where("status = ?", "PENDING").Count(&summary.PendingCount)
	s.db.Model(&SettlementRequest{}).Where("status = ?", "COMPLETED").Count(&summary.CompletedCount)
	s.db.Model(&SettlementRequest{}).Where("status = ?", "REJECTED").Count(&summary.RejectedCount)

	s.db.Model(&SettlementRequest{}).Where("status = ?", "PENDING").Select("COALESCE(SUM(total_nominal), 0)").Scan(&summary.PendingNominal)
	s.db.Model(&SettlementRequest{}).Where("status = ?", "COMPLETED").Select("COALESCE(SUM(total_nominal), 0)").Scan(&summary.CompletedNominal)

	// Total PAID tagihan yang belum di-settle
	s.db.Raw(`
		SELECT COALESCE(SUM(t.total_nominal), 0) 
		FROM tagihan_iuran t
		JOIN rumah r ON r.id_rumah = t.id_rumah
		WHERE t.status_pembayaran = 'PAID'
		  AND t.id_tagihan NOT IN (
		    SELECT st.id_tagihan FROM settlement_tagihan st
		    JOIN settlement_requests sr ON sr.id_settlement = st.id_settlement
		    WHERE sr.status IN ('PENDING','PROCESSING','COMPLETED')
		  )
	`).Scan(&summary.TotalPaidTagihan)

	return &summary, nil
}
