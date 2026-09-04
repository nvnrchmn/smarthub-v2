import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-surface">
      <section className="mx-auto max-w-lg px-4 pb-16 pt-20 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white text-2xl">🏠</div>
        <h1 className="text-3xl font-extrabold text-text-primary leading-tight">Sistem Manajemen<br />Warga Digital</h1>
        <p className="mt-3 text-sm text-text-secondary">Kelola iuran, forum warga, dan lapak RT/RW dalam satu aplikasi ringan.</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link to="/login" className="block w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-white hover:bg-primary/90">Masuk</Link>
          <Link to="/register" className="block w-full rounded-xl border border-border bg-white px-4 py-3 text-center text-sm font-medium text-text-primary hover:bg-muted">Daftar Baru</Link>
        </div>
      </section>
      <section className="mx-auto max-w-lg px-4 pb-16">
        <h2 className="text-lg font-bold text-text-primary mb-4">Fitur Unggulan</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white p-4 shadow-sm"><div className="text-2xl">💰</div><p className="mt-2 text-sm font-medium text-text-primary">Iuran Digital</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm"><div className="text-2xl">💬</div><p className="mt-2 text-sm font-medium text-text-primary">Forum Warga</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm"><div className="text-2xl">🛒</div><p className="mt-2 text-sm font-medium text-text-primary">Lapak Warga</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm"><div className="text-2xl">🔔</div><p className="mt-2 text-sm font-medium text-text-primary">Notifikasi</p></div>
        </div>
      </section>
      <footer className="border-t border-border bg-white py-6 text-center"><p className="text-xs text-text-secondary">© 2026 SmartHub · Logikraf</p></footer>
    </div>
  )
}
