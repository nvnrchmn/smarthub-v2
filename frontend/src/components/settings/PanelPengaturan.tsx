import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme, type ThemeMode } from '../../context/ThemeContext'
import { cn } from '../../lib/utils'
import { Icon, type IconName } from '../ui/Icon'

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  ketua_rt: 'Ketua RT',
  warga: 'Warga',
}

const themeOpts: { m: ThemeMode; label: string; icon: IconName; desc: string }[] = [
  { m: 'light', label: 'Terang', icon: 'sun', desc: 'Latar cerah sepanjang waktu' },
  { m: 'dark', label: 'Gelap', icon: 'moon', desc: 'Nyaman di malam hari' },
  { m: 'auto', label: 'Ikut sistem', icon: 'refresh', desc: 'Mengikuti tema HP (default)' },
]

export function PanelPengaturan() {
  const { user, logout } = useAuth()
  const { mode, setMode } = useTheme()
  const nav = useNavigate()

  const keluar = () => {
    logout()
    nav('/', { replace: true })
  }

  return (
    <div className="space-y-5">
      <section aria-labelledby="pg-tema">
        <h2 id="pg-tema" className="mb-2 text-sm font-semibold text-text-primary">Tampilan</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
          {themeOpts.map((o, i) => {
            const on = mode === o.m
            return (
              <button
                key={o.m}
                type="button"
                onClick={() => setMode(o.m)}
                aria-pressed={on}
                className={cn('flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-text-disabled/10', i > 0 && 'border-t border-border', on && 'bg-primary-50')}
              >
                <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', on ? 'bg-primary text-white' : 'bg-text-disabled/10 text-text-secondary')}>
                  <Icon name={o.icon} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-sm font-medium', on ? 'text-primary' : 'text-text-primary')}>{o.label}</span>
                  <span className="block text-xs text-text-secondary">{o.desc}</span>
                </span>
                {on && <Icon name="check" size={16} className="shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="pg-akun">
        <h2 id="pg-akun" className="mb-2 text-sm font-semibold text-text-primary">Akun</h2>
        <div className="rounded-2xl border border-border bg-surface-card p-4">
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-primary">
              <Icon name="shield" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{roleLabel[user?.role || 'warga'] || user?.role}</p>
              <p className="text-xs text-text-secondary">Tenant #{user?.tenant_id ?? '-'}</p>
            </div>
          </div>
          <button type="button" onClick={keluar} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 active:scale-[0.98]">
            <Icon name="logout" size={16} />
            Keluar
          </button>
        </div>
      </section>

      <p className="text-center text-xs text-text-secondary">SmartHub v2 — portal warga digital RT/RW</p>
    </div>
  )
}