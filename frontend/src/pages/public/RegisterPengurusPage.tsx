import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function RegisterPengurusPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [form, setForm] = useState({
    nama_lengkap: '',
    nomor_wa: '',
    password: '',
    nama_rt: '',
    desa_kelurahan: '',
    kecamatan: '',
    kabupaten_kota: '',
    provinsi: '',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/register-pengurus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registrasi gagal')
      setAuth(
        { id: data.user_id, role: data.role, tenant_id: data.tenant_id, nama: form.nama_lengkap },
        data.token
      )
      setShowSuccess(true)
      setTimeout(() => navigate('/rt'), 2500)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50'

  if (showSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-8">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 grid h-16 w-16 mx-auto place-items-center rounded-full bg-primary/10">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Berhasil Daftar!</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Akun pengurus RT berhasil dibuat. Selamat datang di SmartHub.
          </p>
          <p className="mt-1 text-xs text-text-disabled">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Daftar Pengurus</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Buat akun pengurus RT — Anda akan langsung menjadi ketua RT di wilayah Anda
          </p>
        </div>

        {err && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {/* Data Pribadi */}
          <div className="space-y-3 rounded-xl border border-border bg-surface-card p-4">
            <h2 className="text-sm font-semibold text-text-primary">Data Pribadi</h2>
            <input
              type="text"
              placeholder="Nama Lengkap"
              required
              autoComplete="name"
              value={form.nama_lengkap}
              onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              className={inputCls}
            />
            <input
              type="tel"
              placeholder="Nomor WA (08xxxx)"
              required
              autoComplete="tel"
              value={form.nomor_wa}
              onChange={(e) => setForm({ ...form, nomor_wa: e.target.value })}
              className={inputCls}
            />
            <input
              type="password"
              placeholder="Password (min 6 karakter)"
              required
              autoComplete="new-password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputCls}
            />
          </div>

          {/* Data Wilayah */}
          <div className="space-y-3 rounded-xl border border-border bg-surface-card p-4">
            <h2 className="text-sm font-semibold text-text-primary">Data Wilayah RT/RW</h2>
            <input
              type="text"
              placeholder="Nama RT/RW (mis. RT 01 / RW 02)"
              required
              value={form.nama_rt}
              onChange={(e) => setForm({ ...form, nama_rt: e.target.value })}
              className={inputCls}
            />
            <input
              type="text"
              placeholder="Desa / Kelurahan"
              required
              value={form.desa_kelurahan}
              onChange={(e) => setForm({ ...form, desa_kelurahan: e.target.value })}
              className={inputCls}
            />
            <input
              type="text"
              placeholder="Kecamatan"
              required
              value={form.kecamatan}
              onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
              className={inputCls}
            />
            <input
              type="text"
              placeholder="Kabupaten / Kota"
              required
              value={form.kabupaten_kota}
              onChange={(e) => setForm({ ...form, kabupaten_kota: e.target.value })}
              className={inputCls}
            />
            <input
              type="text"
              placeholder="Provinsi"
              required
              value={form.provinsi}
              onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[48px] rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? 'Membuat akun…' : 'Daftar & Masuk'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Sudah punya akun? <Link to="/login" className="font-medium text-primary">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
