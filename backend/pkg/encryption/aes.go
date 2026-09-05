package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"os"
)

type AES struct {
	key []byte
}

func NewAES() *AES {
	key := os.Getenv("AES_KEY")
	if key == "" {
		key = "default-aes-key-32bytes-long-key!" // fallback dev
	}
	if len(key) != 32 {
		panic("AES_KEY must be exactly 32 bytes")
	}
	return &AES{key: []byte(key)}
}

// SealedValue mengembalikan *string (pointer ke ciphertext base64)
func (a *AES) SealedValue(plaintext string) (*string, error) {
	c, err := a.Encrypt(plaintext)
	return &c, err
}

// OpenSealedValue mengembalikan *string (pointer ke plaintext)
func (a *AES) OpenSealedValue(ciphertext string) (*string, error) {
	p, err := a.Decrypt(ciphertext)
	return &p, err
}

// DefaultAESSealedValue digunakan saat key kosong (di-service langsung)
func DefaultAESSealedValue() []byte {
	key := "default-aes-key-32bytes!"
	return []byte(key)
}

// Encrypt plaintext → base64 ciphertext
func (a *AES) Encrypt(plaintext string) (string, error) {
	block, err := aes.NewCipher(a.key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt base64 ciphertext → plaintext
func (a *AES) Decrypt(ciphertext string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(a.key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}
	nonce, ct := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ct, nil)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}
