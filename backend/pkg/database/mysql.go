package database

import (
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/nvnrchmn/smarthub-v2/config"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DB struct {
	*gorm.DB
	Redis *redis.Client
}

func New(cfg *config.Config) *DB {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=true&loc=Asia%%2FJakarta",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	gdb, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
		NowFunc: func() time.Time {
			return time.Now().In(time.FixedZone("WIB", 7*3600))
		},
	})
	if err != nil {
		log.Fatalf("❌ gagal konek MySQL: %v", err)
	}

	sqlDB, _ := gdb.DB()
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(time.Hour)

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPass,
		DB:       0,
	})

	return &DB{DB: gdb, Redis: rdb}
}
