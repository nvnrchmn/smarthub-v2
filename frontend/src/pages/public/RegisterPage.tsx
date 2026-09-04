import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nomor_wa: '', password: '', nama_lengkap: '' })
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
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ id: data.user_id, role: 'warga', tenant_id: 1 }))
      navigate('/app')
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Daftar</h1>
          <p className="text-sm text-text-secondary mt-1">Buat akun SmartHub baru</p>
        </div>
        {err && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input type="text" placeholder="Nama Lengkap" required value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="tel" placeholder="Nomor WA (08xxxx)" required value={form.nomor_wa} onChange={(e) => setForm({ ...form, nomor_wa: e.target.value })} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="password" placeholder="Password (min 6 karakter)" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">{busy ? 'Memproses...' : 'Daftar'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-text-secondary">Sudah punya akun? <Link to="/login" className="text-primary font-medium">Masuk</Link></p>
      </div>
    </div>
  )
}
