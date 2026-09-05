package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	RedisAddr  string
	RedisPass  string
	JWTSecret  string
	ServerPort string
	UploadDir  string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠ .env tidak ditemukan, pakai env system")
	}
	return &Config{
		DBHost:     getEnv("DB_HOST", "127.0.0.1"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "smarthub"),
		DBPassword: getEnv("DB_PASSWORD", "smarthub_pass"),
		DBName:     getEnv("DB_NAME", "smarthub_v2"),
		RedisAddr:  getEnv("REDIS_ADDR", "127.0.0.1:6379"),
		RedisPass:  getEnv("REDIS_PASS", ""),
		JWTSecret:  getEnv("JWT_SECRET", ""), // audit 2026-09-05: fallback publik dihapus — jwt.go fail-fast jika kosong
		ServerPort: getEnv("PORT", "8082"),
		UploadDir:  getEnv("UPLOAD_DIR", ""),
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}
