package database

import (
	"github.com/redis/go-redis/v9"
	"github.com/nvnrchmn/smarthub-v2/config"
	"github.com/nvnrchmn/smarthub-v2/internal/model"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DB struct {
	SQL   *gorm.DB
	Redis *redis.Client
}

func New(cfg *config.Config) *DB {
	db, err := gorm.Open(mysql.Open(cfg.DBUser+":"+cfg.DBPassword+"@tcp("+cfg.DBHost+":"+cfg.DBPort+")/"+cfg.DBName+"?charset=utf8mb4&parseTime=true"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		panic("failed to connect MySQL: " + err.Error())
	}
	// Auto-migrate models
	db.AutoMigrate(&model.User{}, &model.Tenant{})

	rdb := redis.NewClient(&redis.Options{
		Addr: cfg.RedisAddr,
	})

	return &DB{SQL: db, Redis: rdb}
}
