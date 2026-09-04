import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'

export function RTDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ rumah: 0, warga: 0, tagihan_belum: 0, total_iuran: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [rumah, warga, tagihan] = await Promise.all([
          api(`/wilayah/rumah?tenant_id=${user?.tenant_id}`),
          api(`/warga?tenant_id=${user?.tenant_id}`),
          api(`/keuangan/tagihan?tenant_id=${user?.tenant_id}&status=PENDING`),
        ])
        setStats({
          rumah: rumah.length,
          warga: warga.length,
          tagihan_belum: tagihan.length,
          total_iuran: tagihan.reduce((s: number, t: any) => s + t.total_nominal, 0),
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  if (loading) return <div className="p-6 text-center text-text-secondary">Memuat…</div>

  return (
    <div className="mx-auto max-w-4xl px-4 pt-4">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Dashboard Ketua RT</h1>
        <p className="text-sm text-text-secondary">Kelola data warga dan iuran</p>
      </header>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Total Rumah</p>
          <p className="text-2xl font-bold text-primary">{stats.rumah}</p>
        </div>
        <div className="rounded-xl bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Total Warga</p>
          <p className="text-2xl font-bold text-primary">{stats.warga}</p>
        </div>
        <div className="rounded-xl bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Tagihan Pending</p>
          <p className="text-2xl font-bold text-status-pending">{stats.tagihan_belum}</p>
        </div>
        <div className="rounded-xl bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Total Tunggakan</p>
          <p className="text-2xl font-bold text-status-overdue">{fmt(stats.total_iuran)}</p>
        </div>
      </div>
    </div>
  )
}
