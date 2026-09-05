package keuangan

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// xenditSecret — secret dari DB setting (dikelola Super Admin), fallback env.
func (s *Service) xenditSecret() string {
	if s.settings != nil {
		if v := s.settings.GetSecret("xendit_secret_key"); v != "" {
			return v
		}
	}
	return os.Getenv("XENDIT_SECRET_KEY")
}

// WebhookToken — token callback Xendit dari DB setting, fallback env.
func (s *Service) WebhookToken() string {
	if s.settings != nil {
		if v := s.settings.GetSecret("xendit_webhook_token"); v != "" {
			return v
		}
	}
	return os.Getenv("XENDIT_WEBHOOK_TOKEN")
}

// GetXenditInvoiceStatus — cek status invoice di Xendit (untuk verifikasi on-return).
func (s *Service) GetXenditInvoiceStatus(invoiceID string) (string, error) {
	secret := s.xenditSecret()
	if secret == "" {
		return "", fmt.Errorf("Xendit secret key belum di-set — isi di Pengaturan (Super Admin)")
	}
	req, _ := http.NewRequest(http.MethodGet, fmt.Sprintf("https://api.xendit.co/v2/invoices/%s", invoiceID), nil)
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(secret+":")))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("xendit: %v", err)
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		hint := string(raw)
		if len(hint) > 300 {
			hint = hint[:300]
		}
		return "", fmt.Errorf("xendit: HTTP %d — %s", resp.StatusCode, hint)
	}
	var out struct {
		Status string `json:"status"`
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return "", fmt.Errorf("xendit: decode gagal: %v", err)
	}
	return out.Status, nil
}

const xenditAPI = "https://api.xendit.co/v2/invoices"

type XenditInvoiceReq struct {
	ExternalID           string `json:"external_id"`
	Amount               int64  `json:"amount"`
	Description          string `json:"description"`
	PayerEmail           string `json:"payer_email,omitempty"`
	Currency            string `json:"currency"`
	SuccessRedirectURL  string `json:"success_redirect_url,omitempty"`
	FailureRedirectURL  string `json:"failure_redirect_url,omitempty"`
	InvoiceDuration        int  `json:"invoice_duration"`
	CustomerNotification bool `json:"customer_notification_preference,omitempty"`
	PaymentMethods        []string `json:"payment_methods,omitempty"`
}

type XenditInvoiceRes struct {
	ID         string `json:"id"`
	InvoiceURL string `json:"invoice_url"`
	Status     string `json:"status"`
	ExternalID string `json:"external_id"`
}

// CreateXenditInvoice membuat invoice Xendit untuk tagihan.
// Jika tenant punya xendit_sub_account_id (XenPlatform), dana masuk sub-account
// tenant (bukan custody Logikraf); jika kosong, invoice atas nama akun utama.
func (s *Service) CreateXenditInvoice(tenantID, tagihanID int, nominal float64, desc, payerEmail, successURL string, forUserID string) (*XenditInvoiceRes, error) {
	secret := s.xenditSecret()
	if secret == "" {
		return nil, fmt.Errorf("Xendit secret key belum di-set — isi di Pengaturan (Super Admin)")
	}

	extID := fmt.Sprintf("SHV2-%d-%d", tenantID, tagihanID)
	reqBody := XenditInvoiceReq{
		ExternalID:         extID,
		Amount:             int64(nominal),
		Description:        desc,
		PayerEmail:         payerEmail,
		Currency:           "IDR",
		SuccessRedirectURL: successURL,
		InvoiceDuration:    24 * 3600, // 24 jam
		PaymentMethods:     []string{"QR_CODE"}, // kebijakan: bayar hanya via QRIS
	}

	body, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("POST", xenditAPI, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	auth := base64.StdEncoding.EncodeToString([]byte(secret + ":"))
	req.Header.Set("Authorization", "Basic "+auth)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Idempotency-Key", extID)
	if forUserID != "" {
		req.Header.Set("for-user-id", forUserID)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var out XenditInvoiceRes
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		hint := string(raw)
		if len(hint) > 500 {
			hint = hint[:500]
		}
		return nil, fmt.Errorf("xendit: HTTP %d — %s", resp.StatusCode, hint)
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return nil, fmt.Errorf("xendit: decode response gagal: %v", err)
	}
	return &out, nil
}
