package cron

import (
	"time"

	"github.com/nvnrchmn/smarthub-v2/internal/subscription"
)

// StartInvoiceCron starts cron job for auto-generating subscription invoices
// Runs daily at midnight
func StartInvoiceCron(service *subscription.Service) {
	go func() {
		for now := range time.Tick(time.Hour) {
			if now.Hour() == 0 {
				_, _ = service.GenerateMonthlyInvoices()
			}
		}
	}()
}