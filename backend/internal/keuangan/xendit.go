package keuangan

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

const xenditAPI = "https://api.xendit.co/v2/invoices"

type XenditInvoiceReq struct {
	ExternalID          string `json:"external_id"`
	Amount              int64  `json:"amount"`
	Description         string `json:"description"`
	PayerEmail          string `json:"payer_email,omitempty"`
	Currency            string `json:"currency"`
	SuccessRedirectURL  string `json:"success_redirect_url,omitempty"`
	FailureRedirectURL  string `json:"failure_redirect_url,omitempty"`
	InvoiceDuration     int    `json:"invoice_duration"`
	CustomerNotification bool  `json:"customer_notification_preference"`
}

type XenditInvoiceRes struct {
	ID          string `json:"id"`
	InvoiceURL  string `json:"invoice_url"`
	Status      string `json:"status"`
	ExternalID  string `json:"external_id"`
}

// CreateXenditInvoice membuat invoice Xendit untuk tagihan.
// Jika tenant punya xendit_sub_account_id (XenPlatform), dana masuk sub-account
// tenant (bukan custody Logikraf); jika kosong, invoice atas nama akun utama.
func (s *Service) CreateXenditInvoice(tenantID, tagihanID int, nominal float64, desc, payerEmail, successURL string, forUserID string) (*XenditInvoiceRes, error) {
	secret := os.Getenv("XENDIT_SECRET_KEY")
	if secret == "" {
		return nil, fmt.Errorf("XENDIT_SECRET_KEY belum di-set")
	}

	extID := fmt.Sprintf("SHV2-%d-%d", tenantID, tagihanID)
	reqBody := XenditInvoiceReq{
		ExternalID:     extID,
		Amount:         int64(nominal),
		Description:    desc,
		PayerEmail:     payerEmail,
		Currency:       "IDR",
		SuccessRedirectURL: successURL,
		InvoiceDuration: 24 * 3600, // 24 jam
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
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, fmt.Errorf("xendit: decode response gagal: %v", err)
	}
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("xendit: HTTP %d — %+v", resp.StatusCode, out)
	}
	return &out, nil
}
