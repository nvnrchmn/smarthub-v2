import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Icon } from '../../components/ui/Icon'

export function GabungRTPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'code' | 'data' | 'success'>('code')
  const [inviteCode, setInviteCode] = useState('')
  const [form, setForm] = useState({
    nomor_wa: '',
    password: '',
    nama_lengkap: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) {
      setError('Kode undangan wajib diisi')
      return
    }
    setError('')
    setStep('data')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.nomor_wa || !form.password || !form.nama_lengkap) {
      setError('Semua field wajib diisi')
      setLoading(false)
      return
    }

    if (!/^08\d{8,13}$/.test(form.nomor_wa)) {
      setError('Format nomor WA tidak valid (harus 08xxxxxxxxxx)')
      setLoading(false)
      return
    }

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter')
      setLoading(false)
      return
    }

    try {
      const res = await api('/auth/register-invite', {
        method: 'POST',
        body: JSON.stringify({
          nomor_wa: form.nomor_wa,
          password: form.password,
          nama_lengkap: form.nama_lengkap,
          invite_code: inviteCode,
        }),
      })
      localStorage.setItem('access_token', res.token)
      localStorage.setItem('role', res.role)
      localStorage.setItem('tenant_id', res.tenant_id)
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Icon name="home" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Gabung ke RT/RW</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Masukkan kode undangan dari pengurus RT untuk bergabung
          </p>
        </div>

        {/* Step 1: Input Kode Undangan */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label htmlFor="invite-code" className="mb-2 block text-sm font-medium text-text-secondary">
                Kode Undangan
              </label>
              <input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Masukkan kode 8 karakter"
                className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-center text-lg font-mono uppercase tracking-wider text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                maxLength={12}
                autoFocus
              />
              <p className="mt-2 text-xs text-text-secondary text-center">
                Kode diberikan oleh pengurus RT/RW Anda
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-danger/10 p-3 text-center">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              Lanjutkan
            </button>

            <p className="text-center text-sm text-text-secondary">
              Belum punya akun warga?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Daftar di sini
              </Link>
            </p>
          </form>
        )}

        {/* Step 2: Input Data Pribadi */}
        {step === 'data' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="rounded-xl bg-primary/5 p-3 text-center">
              <p className="text-xs text-text-secondary">Kode undangan</p>
              <p className="font-mono text-lg font-bold text-primary">{inviteCode}</p>
            </div>

            <div>
              <label htmlFor="nama-lengkap" className="mb-2 block text-sm font-medium text-text-secondary">
                Nama Lengkap
              </label>
              <input
                id="nama-lengkap"
                type="text"
                value={form.nama_lengkap}
                onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
                placeholder="Nama lengkap Anda"
                className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="nomor-wa" className="mb-2 block text-sm font-medium text-text-secondary">
                Nomor WhatsApp
              </label>
              <input
                id="nomor-wa"
                type="tel"
                value={form.nomor_wa}
                onChange={(e) => setForm({ ...form, nomor_wa: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-danger/10 p-3 text-center">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('code')}
                className="h-12 flex-1 rounded-xl border border-border bg-surface-card text-sm font-semibold text-text-primary transition-all hover:bg-text-disabled/10"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-12 flex-1 rounded-xl bg-primary text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Mendaftar...' : 'Daftar'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Icon name="check" size={32} className="text-success" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Pendaftaran Berhasil!</h2>
            <p className="text-sm text-text-secondary">
              Akun Anda sedang menunggu verifikasi dari pengurus RT. Anda akan bisa login setelah di-approve.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
