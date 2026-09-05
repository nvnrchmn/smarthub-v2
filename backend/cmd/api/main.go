package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/nvnrchmn/smarthub-v2/config"
	"github.com/nvnrchmn/smarthub-v2/internal/admin"
	"github.com/nvnrchmn/smarthub-v2/internal/auth"
	"github.com/nvnrchmn/smarthub-v2/internal/forum"
	"github.com/nvnrchmn/smarthub-v2/internal/keuangan"
	"github.com/nvnrchmn/smarthub-v2/internal/lapak"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"github.com/nvnrchmn/smarthub-v2/internal/notifikasi"
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

	authRepo := auth.NewRepository(db.SQL)
	authService := auth.NewService(authRepo, j, enc)
	authHandler := auth.NewHandler(authService)

	wilayahRepo := wilayah.NewRepository(db.SQL)
	wilayahService := wilayah.NewService(wilayahRepo)
	wilayahHandler := wilayah.NewHandler(wilayahService)

	wargaRepo := warga.NewRepository(db.SQL)
	wargaService := warga.NewService(wargaRepo, enc)
	wargaHandler := warga.NewHandler(wargaService)

	app := fiber.New(fiber.Config{
		BodyLimit: 15 << 20, // izinkan upload foto s/d ~8MB + multipart overhead
		ErrorHandler: func(c fiber.Ctx, err error) error {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		},
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://smarthub.logikraf.id", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
	}))

	app.Get("/healthz", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "db": "connected"})
	})

	// Public routes
	app.Post("/auth/login", authHandler.Login)
	app.Post("/auth/register", authHandler.Register)
	app.Post("/auth/register-pengurus", authHandler.RegisterPengurus)
	app.Post("/auth/register-invite", authHandler.RegisterWithInvite)

	// Protected routes
	mw := middleware.NewAuthMiddleware(j)

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

	// Notifikasi @mention
	notifRepo := notifikasi.NewRepository(db.SQL)
	notifHandler := notifikasi.NewHandler(notifRepo)
	notifHandler.RegisterRoute(app, mw)

	// Upload foto produk (tersimpan di webroot /uploads)
	upload.RegisterRoute(app, mw, cfg.UploadDir)

	log.Printf("Smarthub v2 listening on :%s", cfg.ServerPort)
	log.Fatal(app.Listen(":" + cfg.ServerPort))
}
