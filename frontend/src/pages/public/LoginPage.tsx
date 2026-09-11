import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [form, setForm] = useState({ nomor_wa: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login gagal')
      setAuth({ id: data.user_id, role: data.role, tenant_id: data.tenant_id }, data.token)
      if (data.role === 'super_admin') navigate('/admin')
      else if (data.role === 'ketua_rt') navigate('/rt')
      else navigate('/app')
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    'w-full h-12 rounded-xl border border-border bg-surface pl-11 pr-4 text-base text-text-primary transition-colors placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25'

  return (
    <div className="relative h-dvh overflow-y-auto bg-surface">
      {/* Latar dekoratif — murni visual, tanpa konten */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--sh-border)_1px,transparent_0)] bg-[size:22px_22px] opacity-60 [mask-image:radial-gradient(ellipse_65%_45%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="relative flex min-h-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <svg
                className="h-7 w-7 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
                <path d="M10 21v-6h4v6" />
              </svg>
            </div>
            <p className="text-xl font-extrabold tracking-tight text-text-primary">SmartHub</p>
          </div>

          {/* Kartu form */}
          <div className="rounded-2xl border border-border bg-surface-card p-6 shadow-[0_10px_40px_-12px_rgb(0_0_0/0.14)] sm:p-7">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Masuk</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
              Selamat datang kembali. Kelola iuran, forum, dan informasi lingkungan Anda dari satu
              tempat.
            </p>

            {err && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="flex-1">{err}</span>
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="nomor_wa" className="mb-1.5 block text-sm font-medium text-text-primary">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-text-disabled"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input
                    id="nomor_wa"
                    name="nomor_wa"
                    type="tel"
                    placeholder="cth: 08123456789"
                    required
                    value={form.nomor_wa}
                    onChange={(e) => setForm({ ...form, nomor_wa: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-primary">
                  Password
                </label>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-text-disabled"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Masukkan password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                aria-busy={busy}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden="true"
                    />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>
          </div>

          {/* Ajakan daftar */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
