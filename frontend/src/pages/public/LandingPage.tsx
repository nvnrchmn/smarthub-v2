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

/* Dekorasi titik (dot grid) tematik — mengikuti token warna agar adaptif terang/gelap */
const dotGrid = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-primary) 22%, transparent) 1px, transparent 0)',
  backgroundSize: '26px 26px',
}

const dotGridWhite = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.18) 1px, transparent 0)',
  backgroundSize: '26px 26px',
}

const fadeMaskBottom = {
  WebkitMaskImage: 'radial-gradient(ellipse 80% 65% at 50% 0%, black 25%, transparent 78%)',
  maskImage: 'radial-gradient(ellipse 80% 65% at 50% 0%, black 25%, transparent 78%)',
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
      {children}
    </span>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-surface text-text-primary">
      {/* ===== NAV — glass sticky ===== */}
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-surface/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
              <Icon name="home" size={18} />
            </span>
            <span className="text-lg font-bold tracking-tight text-text-primary">
              Smart<span className="text-primary">Hub</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#fitur" className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-primary/5 hover:text-text-primary">Fitur</a>
            <a href="#harga" className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-primary/5 hover:text-text-primary">Harga</a>
            <a href="#faq" className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-primary/5 hover:text-text-primary">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-primary/5 hover:text-primary sm:px-4">
              Masuk
            </Link>
            <Link to="/register-pengurus" className="rounded-lg bg-gradient-to-r from-primary to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110 active:scale-95">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO — gradient + dekorasi ===== */}
      <section className="relative overflow-hidden">
        {/* glow & gradasi latar */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" aria-hidden="true" />
        <div className="absolute -top-40 left-1/2 h-[26rem] w-[44rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-32 top-1/2 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
        {/* pola titik memudar ke bawah */}
        <div className="absolute inset-0" style={{ ...dotGrid, ...fadeMaskBottom }} aria-hidden="true" />

        {/* chip melayang (dekorasi layar lebar) */}
        <div className="pointer-events-none absolute inset-0 hidden 2xl:block" aria-hidden="true">
          <div className="absolute left-8 top-44 flex animate-[shFloat_7s_ease-in-out_infinite] items-center gap-2.5 rounded-2xl border border-border/70 bg-surface-card/70 px-3.5 py-2.5 shadow-lg shadow-primary/10 backdrop-blur-xl">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-status-paid-bg text-status-paid">
              <Icon name="check" size={16} />
            </span>
            <span className="text-xs font-semibold text-text-primary">Iuran Lunas</span>
          </div>
          <div className="absolute right-8 top-56 flex animate-[shFloat_9s_ease-in-out_infinite] items-center gap-2.5 rounded-2xl border border-border/70 bg-surface-card/70 px-3.5 py-2.5 shadow-lg shadow-primary/10 backdrop-blur-xl">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name="bell" size={16} />
            </span>
            <span className="text-xs font-semibold text-text-primary">Pengumuman Baru</span>
          </div>
          <div className="absolute bottom-24 right-40 flex animate-[shFloat_11s_ease-in-out_infinite] items-center gap-2.5 rounded-2xl border border-border/70 bg-surface-card/70 px-3.5 py-2.5 shadow-lg shadow-primary/10 backdrop-blur-xl">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name="wallet" size={16} />
            </span>
            <span className="text-xs font-semibold text-text-primary">QRIS Aktif</span>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center md:pb-24 md:pt-24">
          {/* badge */}
          <div className="mx-auto mb-7 inline-flex rounded-full bg-gradient-to-r from-primary/25 via-emerald-500/25 to-primary/25 p-px">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface/90 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur">
              <Icon name="zap" size={13} />
              Platform Manajemen Warga #1 di Indonesia
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-text-primary sm:text-5xl md:text-6xl lg:text-7xl">
            Kelola RT/RW Lebih Mudah dengan{' '}
            <span className="relative whitespace-nowrap bg-gradient-to-r from-primary via-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Teknologi Digital
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg md:text-xl">
            Iuran otomatis via QRIS, forum warga real-time, lapak internal, dan dashboard analitik — semua dalam satu aplikasi ringan.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register-pengurus"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/35 hover:brightness-110 active:scale-[0.98] sm:w-auto"
            >
              <Icon name="rocket" size={16} />
              Mulai Gratis — 14 Hari
              <Icon name="arrow" size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#fitur"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-card/70 px-8 py-3.5 text-sm font-semibold text-text-primary shadow-sm backdrop-blur transition-all hover:border-primary/30 hover:bg-surface-card active:scale-[0.98] sm:w-auto"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon name="play" size={11} />
              </span>
              Lihat Demo
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-status-paid" /> Tanpa kartu kredit</span>
            <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-status-paid" /> Setup 5 menit</span>
            <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-status-paid" /> Batal kapan saja</span>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF — dipercaya & metode pembayaran ===== */}
      <section className="border-y border-border/60 bg-surface-card/50 py-10" aria-label="Bukti sosial">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-text-disabled">
            Didukung pembayaran &amp; platform terpercaya
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {['QRIS', 'DANA', 'OVO', 'GoPay', 'ShopeePay', 'Xendit'].map((m) => (
              <span key={m} className="text-lg font-extrabold tracking-tight text-text-disabled/70 transition-colors hover:text-text-secondary">
                {m}
              </span>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" size={14} className="text-status-pending" />
              ))}
            </span>
            <span className="text-xs font-medium text-text-secondary">
              Dipercaya pengurus di ratusan RT/RW seluruh Indonesia
            </span>
          </div>
        </div>
      </section>

      {/* ===== FITUR — kartu glass ===== */}
      <section id="fitur" className="relative overflow-hidden bg-surface-card py-20 md:py-28">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-48 -left-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Fitur</Eyebrow>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              Semua yang Butuh untuk Kelola RT/RW
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
              Fitur lengkap yang dirancang khusus untuk kebutuhan warga Indonesia.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-md shadow-primary/20 ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon name={f.icon} size={22} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HARGA ===== */}
      <section id="harga" className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Harga</Eyebrow>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              Harga Jelas, Tanpa Biaya Tersembunyi
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
              Bayar per rumah, bukan per pengurus. Semua fitur aktif.
            </p>
          </div>
          <div className="mx-auto mt-14 max-w-lg">
            {pricing.map((p, i) => (
              <div key={i} className={`relative rounded-3xl bg-gradient-to-b from-primary/40 via-emerald-500/30 to-primary/40 p-px shadow-xl shadow-primary/15 ${p.highlight ? 'shadow-2xl shadow-primary/25' : ''}`}>
                <div className="relative flex flex-col rounded-[calc(1.5rem-1px)] bg-surface-card p-7 sm:p-8">
                  {p.highlight && (
                    <div className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-emerald-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-md shadow-primary/30">
                      <Icon name="zap" size={11} />
                      Paling Populer
                    </div>
                  )}
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">{p.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-5xl font-extrabold tracking-tight text-text-primary">{p.price}</span>
                    {p.period && <span className="text-sm font-medium text-text-secondary">{p.period}</span>}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{p.description}</p>
                  <ul className="mt-7 space-y-3.5 border-t border-border pt-7">
                    {p.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-text-primary">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                          <Icon name="check" size={12} />
                        </span>
                        <span className="text-text-secondary">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register-pengurus"
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98]"
                  >
                    {p.cta}
                    <Icon name="arrow" size={15} />
                  </Link>
                  <p className="mt-4 text-center text-xs text-text-disabled">Tanpa kartu kredit · Batalkan kapan saja</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-9 gap-y-4 text-xs font-medium text-text-secondary sm:text-sm">
            <span className="flex items-center gap-2"><Icon name="shield" size={16} className="text-primary" /> Data terenkripsi AES-256</span>
            <span className="flex items-center gap-2"><Icon name="wallet" size={16} className="text-primary" /> Bayar via QRIS e-wallet</span>
            <span className="flex items-center gap-2"><Icon name="bell" size={16} className="text-primary" /> Notifikasi otomatis</span>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="relative overflow-hidden border-t border-border bg-surface-card py-20 md:py-28">
        <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-text-secondary sm:text-lg">
              Tidak menemukan jawaban? Mulai gratis dan rasakan sendiri kemudahan mengelola warga dengan SmartHub.
            </p>
            <Link
              to="/register-pengurus"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white active:scale-[0.98]"
            >
              Coba Gratis 14 Hari
              <Icon name="arrow" size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 open:border-primary/25 open:shadow-lg open:shadow-primary/5 hover:border-primary/30 sm:p-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-text-primary sm:text-base">
                  <span>{faq.q}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-surface-card text-text-secondary transition-all duration-300 group-open:rotate-180 group-open:border-primary/30 group-open:bg-primary group-open:text-white">
                    <Icon name="chevron-down" size={14} />
                  </span>
                </summary>
                <p className="mt-4 border-t border-border/70 pt-4 text-sm leading-relaxed text-text-secondary">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA AKHIR — panel gradasi ===== */}
      <section className="px-4 py-20 md:py-28">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-emerald-600 to-emerald-700 px-6 py-16 text-center shadow-2xl shadow-primary/25 sm:px-12 md:py-24">
          {/* dekorasi panel */}
          <div className="absolute inset-0" style={dotGridWhite} aria-hidden="true" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
              <Icon name="zap" size={12} />
              Gratis 14 Hari · Tanpa Kartu Kredit
            </div>
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              Siap Digitalisasi RT/RW Anda?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Bergabung dengan ratusan RT/RW yang sudah menggunakan SmartHub.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register-pengurus"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-primary shadow-lg shadow-emerald-900/30 transition-all hover:bg-white/90 hover:shadow-xl active:scale-[0.98] sm:w-auto"
              >
                <Icon name="rocket" size={16} />
                Mulai Sekarang — Gratis
                <Icon name="arrow" size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white/50 hover:bg-white/20 active:scale-[0.98] sm:w-auto"
              >
                Masuk ke Dashboard
              </Link>
            </div>
            <p className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/75">
              <span className="flex items-center gap-1.5"><Icon name="shield" size={14} /> Data terenkripsi AES-256</span>
              <span className="flex items-center gap-1.5"><Icon name="check" size={14} /> Tanpa kartu kredit</span>
              <span className="flex items-center gap-1.5"><Icon name="check" size={14} /> Batal kapan saja</span>
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1.1fr]">
            {/* brand */}
            <div className="max-w-sm">
              <Link to="/" className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-md shadow-primary/25">
                  <Icon name="home" size={18} />
                </span>
                <span className="text-lg font-bold tracking-tight text-text-primary">
                  Smart<span className="text-primary">Hub</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Platform manajemen RT/RW: iuran QRIS otomatis, forum warga, lapak internal, dan dashboard analitik — semua dalam satu PWA ringan.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['QRIS', 'DANA', 'OVO', 'GoPay', 'ShopeePay'].map((m) => (
                  <span key={m} className="rounded-lg border border-border bg-surface-card px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* navigasi produk */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-text-disabled">Produk</h3>
              <ul className="mt-4 space-y-3">
                <li><a href="#fitur" className="text-sm text-text-secondary transition-colors hover:text-primary">Fitur</a></li>
                <li><a href="#harga" className="text-sm text-text-secondary transition-colors hover:text-primary">Harga</a></li>
                <li><a href="#faq" className="text-sm text-text-secondary transition-colors hover:text-primary">FAQ</a></li>
              </ul>
            </div>

            {/* akun */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-text-disabled">Mulai</h3>
              <ul className="mt-4 space-y-3">
                <li><Link to="/register-pengurus" className="text-sm text-text-secondary transition-colors hover:text-primary">Daftar Gratis</Link></li>
                <li><Link to="/login" className="text-sm text-text-secondary transition-colors hover:text-primary">Masuk</Link></li>
              </ul>
            </div>

            {/* keamanan & info */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-text-disabled">Keamanan &amp; Info</h3>
              <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                <li className="flex items-start gap-2"><Icon name="shield" size={16} className="mt-0.5 shrink-0 text-primary" /> Enkripsi AES-256-GCM untuk data sensitif (NIK, KK)</li>
                <li className="flex items-start gap-2"><Icon name="users" size={16} className="mt-0.5 shrink-0 text-primary" /> Akses berbasis role (RBAC)</li>
                <li className="flex items-start gap-2"><Icon name="bank" size={16} className="mt-0.5 shrink-0 text-primary" /> Settlement QRIS ke rekening RT</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
            <p className="text-xs text-text-disabled">© 2026 SmartHub · Logikraf. All rights reserved.</p>
            <p className="flex items-center gap-1.5 text-xs text-text-disabled">
              <Icon name="check" size={13} className="text-status-paid" />
              Dibangun untuk lingkungan yang lebih rukun &amp; transparan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
