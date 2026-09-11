package upload

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"io"
	"math"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/nvnrchmn/smarthub-v2/internal/middleware"
)

const (
	maxSize       = 8 << 20 // 8 MB
	maxImageWidth = 1200    // lebar maksimum gambar setelah dikompres
	jpegQuality   = 80      // kualitas JPEG hasil kompresi
)

var allowExt = map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true}

// RegisterRoute — POST /upload (butuh login). File disimpan ke UploadDir,
// URL relatif "/uploads/<hex><ext>" dikembalikan untuk dipakai sebagai foto_url.
// Gambar JPEG/PNG yang lebih lebar dari maxImageWidth diperkecil lalu disimpan
// ulang terkompresi (JPEG q80 / PNG BestCompression); selain itu apa adanya.
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

		// Sumber final: file asli (bukan JPEG/PNG atau sudah muat) atau versi
		// terkompresi untuk JPEG/PNG yang lebih lebar dari maxImageWidth.
		compressed, err := compressUpload(src, ext)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

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
		if _, err := io.Copy(dst, compressed); err != nil {
			dst.Close()
			os.Remove(filepath.Join(dir, name))
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		dst.Close()
		return c.Status(201).JSON(fiber.Map{"url": "/uploads/" + name})
	})
}

// compressUpload — untuk jpg/jpeg/png: bila lebar > maxImageWidth, gambar
// diperkecil proporsional (area-average) lalu di-encode ulang — JPEG kualitas 80,
// PNG BestCompression (teks/tranparansi tidak dirusak). Format lain (webp, gif)
// dan gambar yang sudah muat disalin apa adanya.
func compressUpload(src io.ReadSeeker, ext string) (io.Reader, error) {
	rewind := func() (io.Reader, error) {
		if _, err := src.Seek(0, io.SeekStart); err != nil {
			return nil, err
		}
		return src, nil
	}
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return rewind()
	}
	cfg, _, err := image.DecodeConfig(src)
	if err != nil {
		return nil, errors.New("file gambar tidak valid")
	}
	// Sudah muat: simpan asli, jangan turunkan kualitas tanpa keperluan.
	if cfg.Width <= maxImageWidth {
		return rewind()
	}
	if _, err := src.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}
	img, _, err := image.Decode(src)
	if err != nil {
		return nil, errors.New("file gambar tidak valid")
	}
	img = resizeMaxWidth(img, maxImageWidth)

	var buf bytes.Buffer
	if ext == ".png" {
		enc := png.Encoder{CompressionLevel: png.BestCompression}
		if err := enc.Encode(&buf, img); err != nil {
			return nil, errors.New("gagal mengompres gambar")
		}
	} else {
		if err := jpeg.Encode(&buf, img, &jpeg.Options{Quality: jpegQuality}); err != nil {
			return nil, errors.New("gagal mengompres gambar")
		}
	}
	return bytes.NewReader(buf.Bytes()), nil
}

// resizeMaxWidth memperkecil gambar agar lebarnya <= maxW px dengan filter
// area-average (box): tiap piksel hasil adalah rata-rata terbobot area sumber
// yang dipetakannya — lebih halus daripada nearest-neighbor untuk foto.
func resizeMaxWidth(src image.Image, maxW int) image.Image {
	b := src.Bounds()
	srcW, srcH := b.Dx(), b.Dy()
	if srcW <= maxW {
		return src
	}
	dstH := int(math.Round(float64(srcH) * float64(maxW) / float64(srcW)))
	if dstH < 1 {
		dstH = 1
	}
	dst := image.NewNRGBA(image.Rect(0, 0, maxW, dstH))
	xScale := float64(srcW) / float64(maxW)
	yScale := float64(srcH) / float64(dstH)
	for dy := 0; dy < dstH; dy++ {
		yTop, yBot := float64(dy)*yScale, float64(dy+1)*yScale
		sy0 := clamp(int(math.Floor(yTop)), 0, srcH)
		sy1 := clamp(int(math.Ceil(yBot)), 0, srcH)
		for dx := 0; dx < maxW; dx++ {
			xLeft, xRight := float64(dx)*xScale, float64(dx+1)*xScale
			sx0 := clamp(int(math.Floor(xLeft)), 0, srcW)
			sx1 := clamp(int(math.Ceil(xRight)), 0, srcW)
			var r, g, bl, a, total float64
			for sy := sy0; sy < sy1; sy++ {
				rowW := segOverlap(float64(sy), float64(sy)+1, yTop, yBot)
				if rowW <= 0 {
					continue
				}
				for sx := sx0; sx < sx1; sx++ {
					colW := segOverlap(float64(sx), float64(sx)+1, xLeft, xRight)
					if colW <= 0 {
						continue
					}
					p := color.NRGBAModel.Convert(src.At(b.Min.X+sx, b.Min.Y+sy)).(color.NRGBA)
					w := colW * rowW
					r += float64(p.R) * w
					g += float64(p.G) * w
					bl += float64(p.B) * w
					a += float64(p.A) * w
					total += w
				}
			}
			if total > 0 {
				dst.SetNRGBA(dx, dy, color.NRGBA{
					R: uint8(r / total),
					G: uint8(g / total),
					B: uint8(bl / total),
					A: uint8(a / total),
				})
			}
		}
	}
	return dst
}

// segOverlap — panjang irisan segmen [s0,s1) dengan [o0,o1).
func segOverlap(s0, s1, o0, o1 float64) float64 {
	lo := math.Max(s0, o0)
	hi := math.Min(s1, o1)
	if hi <= lo {
		return 0
	}
	return hi - lo
}

func clamp(v, lo, hi int) int {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}
