package jwt

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   int    `json:"user_id"`
	TenantID int    `json:"tenant_id"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

type JWT struct {
	secret []byte
}

// Fail-fast (audit 2026-09-05): JWT_SECRET tidak boleh kosong, memakai nilai
// default yang pernah publik, atau terlalu pendek. Sebelumnya ada fallback
// hardcoded ("default-jwt-secret-change-me-in-prod" / config.go
// "change-me-in-production") sehingga siapa pun bisa forge token super_admin.
func NewJWT() *JWT {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("JWT_SECRET wajib di-set — menolak start dengan secret kosong (generate: openssl rand -hex 32)")
	}
	if secret == "default-jwt-secret-change-me-in-prod" || secret == "change-me-in-production" {
		log.Fatal("JWT_SECRET masih memakai nilai default publik — generate baru: openssl rand -hex 32")
	}
	if len(secret) < 32 {
		log.Fatal("JWT_SECRET terlalu pendek (< 32 karakter) — generate baru: openssl rand -hex 32")
	}
	return &JWT{secret: []byte(secret)}
}

func (j *JWT) Generate(userID, tenantID int, role string) (string, error) {
	claims := Claims{
		UserID:   userID,
		TenantID: tenantID,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(72 * time.Hour)), // 3 hari
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "smarthub-v2",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.secret)
}

func (j *JWT) Validate(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return j.secret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token")
}
