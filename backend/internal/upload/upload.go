package upload

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
)

const maxSize = 8 << 20 // 8 MB

var allowExt = map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true}

// RegisterRoute — POST /upload (butuh login). File disimpan ke UploadDir,
// URL relatif "/uploads/<hex><ext>" dikembalikan untuk dipakai sebagai foto_url.
func RegisterRoute(app fiber.Router, mw *middleware.AuthMiddleware, dir string) {
	r := app.Group("/upload")
	r.Use(mw.AuthRequired)
	r.Post("/", func(c fiber.Ctx) error {
		if dir == "" {
			return c.Status(500).JSON(fiber.Map{"error": "UPLOAD_DIR belum dikonfigurasi"})
		}
		fh, err := c.FormFile("file")
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "file tidak ditemukan"})
		}
		if fh.Size > maxSize {
			return c.Status(413).JSON(fiber.Map{"error": "file maksimal 8 MB"})
		}
		ext := strings.ToLower(filepath.Ext(fh.Filename))
		if !allowExt[ext] {
			return c.Status(400).JSON(fiber.Map{"error": "hanya jpg/png/webp/gif"})
		}
		src, err := fh.Open()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		defer src.Close()

		if err := os.MkdirAll(dir, 0o755); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		randBytes := make([]byte, 8)
		if _, err := rand.Read(randBytes); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		name := hex.EncodeToString(randBytes) + ext
		dst, err := os.OpenFile(filepath.Join(dir, name), os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0o644)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		if _, err := io.Copy(dst, src); err != nil {
			dst.Close()
			os.Remove(filepath.Join(dir, name))
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		dst.Close()
		return c.Status(201).JSON(fiber.Map{"url": "/uploads/" + name})
	})
}
