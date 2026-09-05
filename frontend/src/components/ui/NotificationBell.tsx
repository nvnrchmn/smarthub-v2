import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Icon } from './Icon'

interface Notification {
  id_notifikasi: number
  id_user: number
  id_tenant: number
  tipe: string
  judul: string
  pesan: string
  id_ref?: number
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const load = async () => {
    try {
      const res = await api<{ list: Notification[]; unread: number }>('/notifikasi')
      setNotifs(res.list)
      setUnread(res.unread)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000) // refresh setiap 30 detik
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    await api('/notifikasi/read-all', { method: 'PUT' })
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnread(0)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-text-disabled/10"
        aria-label="Notifikasi"
        aria-expanded={open}
      >
        <Icon name="bell" size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-surface-card shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold text-text-primary">Notifikasi</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-primary hover:text-primary/80"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto overscroll-contain">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Icon name="bell" size={32} className="mx-auto text-text-disabled" />
                <p className="mt-2 text-sm text-text-secondary">Belum ada notifikasi</p>
              </div>
            ) : (
              notifs.map((n) => (
                <button
                  type="button"
                  key={n.id_notifikasi}
                  onClick={() => {
                    setOpen(false)
                    if (n.tipe === 'settlement') navigate('/rt/settlement')
                    if (n.tipe === 'forum') navigate(`/app/forum/${n.id_ref}`)
                  }}
                  className="flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-text-disabled/5"
                >
                  <span
                    className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                      n.is_read ? 'bg-text-disabled/10 text-text-secondary' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Icon
                      name={
                        n.tipe === 'settlement'
                          ? 'wallet'
                          : n.tipe === 'forum'
                            ? 'chat'
                            : 'bell'
                      }
                      size={14}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    {!n.is_read && (
                      <span className="mb-0.5 block h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    <span
                      className={`block truncate text-sm ${
                        n.is_read ? 'text-text-secondary' : 'font-medium text-text-primary'
                      }`}
                    >
                      {n.judul}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
                      {n.pesan}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
