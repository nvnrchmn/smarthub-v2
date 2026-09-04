import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const keluar = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Pengaturan</h1>
      </header>
      <div className="rounded-2xl bg-surface-card p-4">
        <p className="text-sm text-text-secondary">Masuk sebagai: <span className="font-medium text-text-primary">{user?.role}</span> (tenant {user?.tenant_id})</p>
        <button onClick={keluar} className="mt-4 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 min-h-[44px]">
          Keluar
        </button>
      </div>
    </div>
  )
}
