import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../../components/ui/Icon'

interface Feature {
  icon: IconName
  title: string
  description: string
}

const features: Feature[] = [
  { icon: 'wallet', title: 'Iuran Digital', description: 'Kelola iuran warga secara transparen dengan pembayaran QRIS otomatis.' },
  { icon: 'chat', title: 'Forum Warga', description: 'Diskusi real-time dengan @mention, pengumuman, dan notifikasi push.' },
  { icon: 'store', title: 'Lapak Warga', description: 'Marketplace internal RT/RW dengan moderasi pengurus.' },
  { icon: 'users', title: 'Manajemen Data', description: 'Data warga terenkripsi AES-256, akses berbasis role (RBAC).' },
  { icon: 'chart', title: 'Dashboard Analitik', description: 'Kepatuhan pembayaran, statistik hunian, & laporan otomatis.' },
  { icon: 'bell', title: 'Notifikasi PWA', description: 'Push notification via Service Worker, tanpa perlu install app store.' },
]

const pricing = [
  {
    name: 'Berlangganan',
    price: 'Rp 3.000',
    period: '/rumah/bulan',
    description: 'Semua fitur aktif. Bayar per rumah, bukan per pengurus.',
    features: ['Iuran QRIS otomatis', 'Forum warga + @mention', 'Lapak warga internal', 'Data warga terenkripsi AES-256', 'Dashboard analitik', 'Settlement ke rekening RT', 'Notifikasi WhatsApp', 'Support 24/7'],
    cta: 'Mulai — 14 Hari Gratis',
    highlight: true,
  },
]

const faqs = [
  { q: 'Apa bedanya SmartHub dengan aplikasi RT lain?', a: 'SmartHub dibangun khusus untuk konteks Indonesia (RT/RW), dengan integrasi QRIS untuk iuran, forum dengan @mention, dan lapak warga internal — semua dalam satu PWA ringan yang bisa diakses tanpa install.' },
  { q: 'Bagaimana keamanan data warga?', a: 'Data sensitif (NIK, No. KK) dienkripsi AES-256-GCM. Akses berbasis role (RBAC) — warga hanya bisa lihat data sendiri, pengurus lihat data tenant, super admin kelola semua tenant.' },
  { q: 'Apakah bisa coba dulu sebelum bayar?', a: 'Ya! Semua tenant baru mendapat 14 hari gratis. Tidak perlu kartu kredit — daftar langsung pakai nomor WA.' },
  { q: 'Bagaimana sistem pembayaran iuran?', a: 'Menggunakan Xendit QRIS — warga scan QR bayar via DANA, OVO, GoPay, atau ShopeePay. Dana masuk ke rekening Logikraf, kemudian bisa di-settlement ke rekening RT.' },
  { q: 'Apakah data bisa di-export?', a: 'Ya, pengurus bisa export data warga dan tagihan ke CSV/Excel kapan saja dari dashboard.' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
              <Icon name="home" size={18} />
            </span>
            <span className="text-lg font-bold text-text-primary">SmartHub</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#fitur" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Fitur</a>
            <a href="#harga" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Harga</a>
            <a href="#faq" className="text-sm text-text-secondary transition-colors hover:text-text-primary">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-text-disabled/10 hover:text-text-primary">Masuk</Link>
            <Link to="/register-pengurus" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/90 active:scale-95">Daftar Gratis</Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center md:pb-28 md:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <Icon name="zap" size={14} />
            <span>Platform Manajemen Warga #1 di Indonesia</span>
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-text-primary md:text-6xl">
            Kelola RT/RW Lebih Mudah dengan
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent"> Teknologi Digital</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary md:text-xl">
            Iuran otomatis via QRIS, forum warga real-time, lapak internal, dan dashboard analitik — semua dalam satu aplikasi ringan.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register-pengurus" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] sm:w-auto">
              <Icon name="rocket" size={16} />
              Mulai Gratis — 14 Hari
            </Link>
            <a href="#fitur" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-card px-8 py-3.5 text-sm font-semibold text-text-primary transition-all hover:bg-text-disabled/5 active:scale-[0.98] sm:w-auto">
              <Icon name="play" size={16} />
              Lihat Demo
            </a>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-emerald-500" /> Tanpa kartu kredit</span>
            <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-emerald-500" /> Setup 5 menit</span>
            <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-emerald-500" /> Batal kapan saja</span>
          </div>
        </div>
      </section>

      <section id="fitur" className="border-t border-border bg-surface-card py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-primary md:text-4xl">Semua yang Butuh untuk Kelola RT/RW</h2>
            <p className="mt-4 text-lg text-text-secondary">Fitur lengkap yang dirancang khusus untuk kebutuhan warga Indonesia.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={i} className="group rounded-2xl border border-border bg-surface p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon name={f.icon} size={22} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="harga" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-primary md:text-4xl">Harga Jelas, Tanpa Biaya Tersembunyi</h2>
            <p className="mt-4 text-lg text-text-secondary">Bayar per rumah, bukan per pengurus. Semua fitur aktif.</p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-1 max-w-lg mx-auto">
            {pricing.map((p, i) => (
              <div key={i} className={`relative rounded-2xl border p-6 transition-all ${p.highlight ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02]' : 'border-border bg-surface hover:border-primary/30 hover:shadow-lg'}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">Paling Populer</div>
                )}
                <h3 className="text-lg font-semibold text-text-primary">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-text-primary">{p.price}</span>
                  {p.period && <span className="text-sm text-text-secondary">{p.period}</span>}
                </div>
                <p className="mt-2 text-sm text-text-secondary">{p.description}</p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Icon name="check" size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register-pengurus" className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all active:scale-[0.98] ${p.highlight ? 'bg-primary text-white hover:bg-primary/90' : 'border border-border bg-surface-card text-text-primary hover:bg-text-disabled/5'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-border bg-surface-card py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold text-text-primary md:text-4xl">Pertanyaan yang Sering Diajukan</h2>
          <div className="mt-14 space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-medium text-text-primary">
                  <span>{faq.q}</span>
                  <Icon name="chevron-down" size={18} className="shrink-0 text-text-secondary transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-text-primary md:text-4xl">Siap Digitalisasi RT/RW Anda?</h2>
          <p className="mt-4 text-lg text-text-secondary">Bergabung dengan ratusan RT/RW yang sudah menggunakan SmartHub.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register-pengurus" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] sm:w-auto">
              <Icon name="rocket" size={16} />
              Mulai Sekarang — Gratis
            </Link>
            <Link to="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-card px-8 py-3.5 text-sm font-semibold text-text-primary transition-all hover:bg-text-disabled/5 active:scale-[0.98] sm:w-auto">
              Masuk ke Dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
                <Icon name="home" size={16} />
              </span>
              <span className="text-sm font-semibold text-text-primary">SmartHub</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary">
              <a href="#fitur" className="transition-colors hover:text-text-primary">Fitur</a>
              <a href="#harga" className="transition-colors hover:text-text-primary">Harga</a>
              <a href="#faq" className="transition-colors hover:text-text-primary">FAQ</a>
              <Link to="/login" className="transition-colors hover:text-text-primary">Masuk</Link>
              <Link to="/register-pengurus" className="transition-colors hover:text-text-primary">Daftar</Link>
            </div>
            <p className="text-xs text-text-secondary">© 2026 SmartHub · Logikraf. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}