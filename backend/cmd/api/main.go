package main

import (
	"errors"
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/nvnrchmn/smarthub-v2/config"
	"github.com/nvnrchmn/smarthub-v2/internal/admin"
	"github.com/nvnrchmn/smarthub-v2/internal/auth"
	"github.com/nvnrchmn/smarthub-v2/internal/cms"
	"github.com/nvnrchmn/smarthub-v2/internal/cron"
	"github.com/nvnrchmn/smarthub-v2/internal/forum"
	"github.com/nvnrchmn/smarthub-v2/internal/keuangan"
	"github.com/nvnrchmn/smarthub-v2/internal/lapak"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"github.com/nvnrchmn/smarthub-v2/internal/notifikasi"
	"github.com/nvnrchmn/smarthub-v2/internal/settlement"
	"github.com/nvnrchmn/smarthub-v2/internal/subscription"
	"github.com/nvnrchmn/smarthub-v2/internal/upload"
	"github.com/nvnrchmn/smarthub-v2/internal/warga"
	"github.com/nvnrchmn/smarthub-v2/internal/wilayah"
	"github.com/nvnrchmn/smarthub-v2/pkg/database"
	"github.com/nvnrchmn/smarthub-v2/pkg/encryption"
	"github.com/nvnrchmn/smarthub-v2/pkg/jwt"
	"github.com/nvnrchmn/smarthub-v2/pkg/settings"
)

func main() {
	cfg := config.Load()
	db := database.New(cfg)

	j := jwt.NewJWT()
	enc := encryption.NewAES()
	settingsStore := settings.New(db.SQL, enc)

	// Subscription
	subscriptionService := subscription.NewService(db.SQL)

	// Cron (auto-generate invoice)
	cron.StartInvoiceCron(subscriptionService)

	// Auth
	authRepo := auth.NewRepository(db.SQL)
	authService := auth.NewService(authRepo, j, enc)
	authService.SetSubscriptionService(subscriptionService)
	authHandler := auth.NewHandler(authService)

	wilayahRepo := wilayah.NewRepository(db.SQL)
	wilayahService := wilayah.NewService(wilayahRepo)
	wilayahHandler := wilayah.NewHandler(wilayahService)

	wargaRepo := warga.NewRepository(db.SQL)
	wargaService := warga.NewService(wargaRepo, enc)
	wargaHandler := warga.NewHandler(wargaService)

	app := fiber.New(fiber.Config{
		BodyLimit: 15 << 20,
		// TrustProxy (audit 2026-09-05): trust nginx (loopback) supaya c.IP()
		// membaca IP asli client dari X-Forwarded-For. Sebelumnya semua user
		// terlihat 127.0.0.1 → rate limiter in-memory jadi 1 bucket global.
		TrustProxy: true,
		TrustProxyConfig: fiber.TrustProxyConfig{
			Loopback: true,
		},
		// X-Real-IP ditimpa nginx ($remote_addr) — tidak bisa di-spoof client,
		// tidak seperti X-Forwarded-For yang hanya ditambah (bisa dirotasi utk
		// bypass rate limit).
		ProxyHeader: "X-Real-IP",
		// Audit 2026-09-05: ErrorHandler lama memaksa SEMUA error jadi 500
		// (route tak dikenal → 500, harusnya 404) dan membocorkan err.Error()
		// (detail internal/DB) ke client. Sekarang hormati kode error Fiber
		// (404/405/401/...); error >=500 dicatat server-side, client dapat pesan generik.
		ErrorHandler: func(c fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			var fe *fiber.Error
			if errors.As(err, &fe) {
				code = fe.Code
			}
			if code >= fiber.StatusInternalServerError {
				log.Printf("ERR %s %s → %v", c.Method(), c.Path(), err)
				return c.Status(code).JSON(fiber.Map{"error": "internal server error"})
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	// Panic recovery — wajib sebelum middleware lain (audit 2026-09-05)
	app.Use(recover.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://smarthub.logikraf.id", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
	}))

	// Rate limiting — 100 request per menit per IP asli (TrustProxy aktif)
	app.Use(middleware.RateLimiter.Limit(100))

	app.Get("/healthz", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "db": "connected"})
	})

	// Public routes
	app.Post("/auth/login", authHandler.Login)
	app.Post("/auth/register", authHandler.Register)
	app.Post("/auth/register-pengurus", authHandler.RegisterPengurus)
	app.Post("/auth/register-invite", authHandler.RegisterWithInvite)

	// Protected routes
	mw := middleware.NewAuthMiddleware(j, db.SQL)

	// Invite code management
	app.Post("/auth/invite-codes", mw.AuthRequired, authHandler.GenerateInviteCode)
	app.Get("/auth/invite-codes", mw.AuthRequired, authHandler.ListInviteCodes)
	app.Delete("/auth/invite-codes/:id", mw.AuthRequired, authHandler.DeactivateInviteCode)
	app.Post("/auth/warga-approve/:id", mw.AuthRequired, mw.RoleRequired("ketua_rt", "super_admin"), authHandler.ApproveWarga)
	app.Post("/auth/warga-reject/:id", mw.AuthRequired, mw.RoleRequired("ketua_rt", "super_admin"), authHandler.RejectWarga)
	app.Get("/auth/warga-pending", mw.AuthRequired, mw.RoleRequired("ketua_rt", "super_admin"), authHandler.ListWargaPending)
	app.Get("/me", mw.AuthRequired, func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"user_id":   c.Locals("user_id"),
			"tenant_id": c.Locals("tenant_id"),
			"role":      c.Locals("role"),
		})
	})

	// Wilayah
	wilayahHandler.RegisterRoute(app, mw)

	// Warga
	wargaHandler.RegisterRoute(app, mw)

	// Keuangan
	keuanganRepo := keuangan.NewRepository(db.SQL)
	keuanganService := keuangan.NewService(keuanganRepo, settingsStore)
	keuanganHandler := keuangan.NewHandler(keuanganService)
	keuanganHandler.RegisterRoute(app, mw)

	// Forum
	forumRepo := forum.NewRepository(db.SQL)
	forumService := forum.NewService(forumRepo)
	forumHandler := forum.NewHandler(forumService)
	forumHandler.RegisterRoute(app, mw)

	// Lapak
	lapakRepo := lapak.NewRepository(db.SQL)
	lapakService := lapak.NewService(lapakRepo)
	lapakHandler := lapak.NewHandler(lapakService)
	lapakHandler.RegisterRoute(app, mw)

	// Admin (super_admin only)
	adminRepo := admin.NewRepository(db.SQL)
	adminHandler := admin.NewHandler(adminRepo, settingsStore)
	adminHandler.RegisterRoute(app, mw)

	// Settlement
	settlementService := settlement.NewService(db.SQL)
	settlementHandler := settlement.NewHandler(settlementService)
	settlementHandler.RegisterRoute(app, mw)

	// CMS Landing
	cmsService := cms.NewService(db.SQL)
	cmsHandler := cms.NewHandler(cmsService)
	cmsHandler.RegisterRoute(app, mw)

	// Subscription
	subscriptionHandler := subscription.NewHandler(subscriptionService)
	subscriptionHandler.RegisterRoute(app, mw)

	// Notifikasi @mention
	notifService := notifikasi.NewService(db.SQL)
	notifHandler := notifikasi.NewHandler(notifService)
	notifHandler.RegisterRoute(app, mw)

	// Upload foto produk (tersimpan di webroot /uploads)
	upload.RegisterRoute(app, mw, cfg.UploadDir)

	log.Printf("Smarthub v2 listening on :%s", cfg.ServerPort)
	log.Fatal(app.Listen(":" + cfg.ServerPort))
}