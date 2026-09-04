package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/nvnrchmn/smarthub-v2/config"
	"github.com/nvnrchmn/smarthub-v2/internal/auth"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
	"github.com/nvnrchmn/smarthub-v2/internal/warga"
	"github.com/nvnrchmn/smarthub-v2/internal/wilayah"
	"github.com/nvnrchmn/smarthub-v2/pkg/database"
	"github.com/nvnrchmn/smarthub-v2/pkg/encryption"
	"github.com/nvnrchmn/smarthub-v2/pkg/jwt"
)

func main() {
	cfg := config.Load()
	db := database.New(cfg)

	j := jwt.NewJWT()
	enc := encryption.NewAES()

	// Auth
	authRepo := auth.NewRepository(db.SQL)
	authService := auth.NewService(authRepo, j, enc)
	authHandler := auth.NewHandler(authService)

	// Wilayah
	wilayahRepo := wilayah.NewRepository(db.SQL)
	wilayahService := wilayah.NewService(wilayahRepo)
	wilayahHandler := wilayah.NewHandler(wilayahService)

	// Warga
	wargaRepo := warga.NewRepository(db.SQL)
	wargaService := warga.NewService(wargaRepo)
	wargaHandler := warga.NewHandler(wargaService)

	// Middleware
	mw := middleware.NewAuthMiddleware(j)

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c fiber.Ctx, err error) error {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		},
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
	}))

	app.Get("/healthz", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "db": "connected"})
	})

	api := app.Group("/api")

	// Public routes
	api.Post("/auth/login", authHandler.Login)
	api.Post("/auth/register", authHandler.Register)

	// Protected routes
	api.Get("/me", mw.AuthRequired, func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"user_id":   c.Locals("user_id"),
			"tenant_id": c.Locals("tenant_id"),
			"role":      c.Locals("role"),
		})
	})

	// Wilayah
	wilayahHandler.RegisterRoute(api, mw)

	// Warga
	wargaHandler.RegisterRoute(api, mw)

	log.Printf("Smarthub v2 listening on :%s", cfg.ServerPort)
	log.Fatal(app.Listen(":" + cfg.ServerPort))
}
