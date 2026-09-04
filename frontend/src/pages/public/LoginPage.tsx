import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from '../../components/ui/ThemeToggle'

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

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <ThemeToggle />
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Masuk</h1>
          <p className="text-sm text-text-secondary mt-1">Masuk ke akun SmartHub Anda</p>
        </div>
        {err && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input type="tel" placeholder="Nomor WA (08xxxx)" required value={form.nomor_wa} onChange={(e) => setForm({ ...form, nomor_wa: e.target.value })} className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">{busy ? 'Memproses...' : 'Masuk'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-text-secondary">Belum punya akun? <Link to="/register" className="font-medium text-primary">Daftar</Link></p>
      </div>
    </div>
  )
}
