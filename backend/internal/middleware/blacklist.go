package middleware

import (
	"sync"
	"time"

	"github.com/gofiber/fiber/v3"
)

type blacklist struct {
	tokens map[string]time.Time
	mu     sync.RWMutex
}

var tokenBlacklist = &blacklist{tokens: make(map[string]time.Time)}

// BlacklistToken adds a token to blacklist (on logout)
func BlacklistToken(token string, expiry time.Duration) {
	tokenBlacklist.mu.Lock()
	tokenBlacklist.tokens[token] = time.Now().Add(expiry)
	tokenBlacklist.mu.Unlock()
}

// IsBlacklisted checks if a token is blacklisted
func IsBlacklisted(token string) bool {
	tokenBlacklist.mu.RLock()
	expiry, exists := tokenBlacklist.tokens[token]
	tokenBlacklist.mu.RUnlock()

	if !exists {
		return false
	}

	// Remove if expired
	if time.Now().After(expiry) {
		tokenBlacklist.mu.Lock()
		delete(tokenBlacklist.tokens, token)
		tokenBlacklist.mu.Unlock()
		return false
	}

	return true
}

// BlacklistMiddleware checks if token is blacklisted
func (m *AuthMiddleware) BlacklistCheck(c fiber.Ctx) error {
	auth := c.Get("Authorization")
	if auth == "" {
		return c.Next()
	}
	parts := parseBearer(auth)
	if parts == "" {
		return c.Next()
	}
	if IsBlacklisted(parts) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "token telah dicabut, silakan login kembali",
		})
	}
	return c.Next()
}