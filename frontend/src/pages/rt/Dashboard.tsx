import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'

interface Stat {
  totalRumah: number
  dihuni: number
  totalWarga: number
  totalTagihan: number
  lunas: number
  belumBayar: number
  totalNominal: number
}

export function RTDashboard() {
  const [stats, setStats] = useState<Stat | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [rumah, warga, tagihan] = await Promise.all([
          api('/api/wilayah/rumah?tenant_id=1'),
          api('/api/warga?tenant_id=1'),
          api('/api/keuangan/tagihan?tenant_id=1'),
        ])
        const r = Array.isArray(rumah) ? rumah : []
        const w = Array.isArray(warga) ? warga : []
        const t = Array.isArray(tagihan) ? tagihan : []
        setStats({
          totalRumah: r.length,
          dihuni: r.filter((x: any) => x.status_hunian === 'Dihuni').length,
          totalWarga: w.length,
          totalTagihan: t.length,
          lunas: t.filter((x: any) => x.status_pembayaran === 'PAID').length,
          belumBayar: t.filter((x: any) => x.status_pembayaran !== 'PAID').length,
          totalNominal: t.reduce((s: number, x: any) => s + Number(x.total_nominal || 0), 0),
        })
      } catch {
        // biarkan null
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="p-6 text-sm text-text-secondary">Memuat…</div>

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard RT 01</h1>
        <p className="text-sm text-text-secondary">Ringkasan lingkungan warga</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Total Rumah</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{stats?.totalRumah ?? 0}</p>
          <p className="text-xs text-green-700">{stats?.dihuni ?? 0} dihuni</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Warga</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{stats?.totalWarga ?? 0}</p>
          <p className="text-xs text-text-secondary">terdaftar</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Tagihan</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{stats?.totalTagihan ?? 0}</p>
          <p className="text-xs text-green-700">{stats?.lunas ?? 0} lunas</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-card p-4">
          <p className="text-xs text-text-secondary">Belum Bayar</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats?.belumBayar ?? 0}</p>
          <p className="text-xs text-text-secondary">{fmt(stats?.totalNominal ?? 0)}</p>
        </div>
      </div>

      {/* Quick actions */}
      <section className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-text-primary">Kelola</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link to="/rt/rumah" className="rounded-2xl bg-primary p-4 text-white min-h-[44px]">
            🏠 Kelola Rumah
          </Link>
          <Link to="/rt/warga" className="rounded-2xl bg-primary/90 p-4 text-white min-h-[44px]">
            👥 Kelola Warga
          </Link>
          <Link to="/rt/tagihan" className="rounded-2xl bg-primary/80 p-4 text-white min-h-[44px]">
            📋 Kelola Tagihan
          </Link>
        </div>
      </section>
    </div>
  )
}
