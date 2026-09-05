import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [form, setForm] = useState({ nama_lengkap: '', nomor_wa: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'warga', tenant_id: 1 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registrasi gagal')
      // Auto-login: backend menerbitkan token langsung
      setAuth({ id: data.user_id, role: data.role, tenant_id: data.tenant_id, nama: form.nama_lengkap }, data.token)
      navigate(data.role === 'super_admin' ? '/admin' : data.role === 'ketua_rt' ? '/rt' : '/app')
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/30'
  const errBox = err ? 'mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700' : ''

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Daftar</h1>
          <p className="mt-1 text-sm text-text-secondary">Buat akun SmartHub baru — langsung masuk setelah daftar</p>
        </div>
        {err && <div className={errBox} role="alert">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input type="text" placeholder="Nama Lengkap" required autoComplete="name" value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} className={inputCls} />
          <input type="tel" placeholder="Nomor WA (08xxxx)" required autoComplete="tel" value={form.nomor_wa} onChange={(e) => setForm({ ...form, nomor_wa: e.target.value })} className={inputCls} />
          <input type="password" placeholder="Password (min 8 karakter)" required autoComplete="new-password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
          <button type="submit" disabled={busy} className="w-full min-h-[48px] rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
            {busy ? 'Membuat akun…' : 'Daftar & Masuk'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-text-secondary">Sudah punya akun? <Link to="/login" className="font-medium text-primary">Masuk</Link></p>
      </div>
    </div>
  )
}
