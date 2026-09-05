import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'

export function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 mb-6">
          <Icon name="clock" size={32} className="text-warning" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Menunggu Verifikasi</h1>
        <p className="mt-3 text-sm text-text-secondary">
          Akun Anda berhasil daftar dan sedang menunggu verifikasi dari pengurus RT/RW.
          Anda akan bisa login setelah akun di-approve.
        </p>
        <div className="mt-6 rounded-xl bg-surface-card border border-border p-4">
          <p className="text-xs text-text-secondary">
            Jika sudah lama belum di-approve, hubungi pengurus RT/RW Anda.
          </p>
        </div>
        <Link
          to="/login"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
        >
          Kembali ke Login
        </Link>
      </div>
    </div>
  )
}
