import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface Rumah {
  id_rumah: number
  nama_jalan_gang: string
  nomor_rumah: string
  status_hunian: string
}

export function WargaDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [rumahs, setRumahs] = useState<Rumah[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/wilayah/rumah?tenant_id=${user?.tenant_id ?? 1}`)
      .then((r) => r.json())
      .then((d) => setRumahs(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const doLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Halo, Warga 👋</h1>
          <p className="text-xs text-text-secondary">RT 01 / RW 01 — Kelurahan Kejajar</p>
        </div>
        <button
          onClick={doLogout}
          className="rounded-xl border border-border bg-surface-card px-3 py-2 text-xs font-medium text-text-secondary min-h-[44px]"
        >
          Keluar
        </button>
      </header>

      {/* Ringkasan */}
      <section className="mb-5 rounded-2xl bg-primary p-5 text-white">
        <p className="text-sm text-white/80">Iuran bulan ini</p>
        <p className="mt-1 text-3xl font-bold">Rp 150.000</p>
        <Link
          to="/app/tagihan"
          className="mt-3 inline-block rounded-xl bg-white/20 px-4 py-2 text-sm font-medium min-h-[44px] leading-6"
        >
          Lihat tagihan →
        </Link>
      </section>

      {/* Daftar rumah */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-text-primary">Rumah di lingkungan</h2>
        {loading && <p className="text-sm text-text-secondary">Memuat…</p>}
        <div className="space-y-2.5">
          {rumahs.map((r) => (
            <div key={r.id_rumah} className="rounded-xl border border-border bg-surface-card p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`h-10 w-1 rounded-full ${r.status_hunian === 'Dihuni' ? 'bg-green-600' : 'bg-gray-400'}`}
                />
                <div className="flex-1">
                  <p className="text-base font-semibold text-text-primary">
                    {r.nama_jalan_gang} {r.nomor_rumah}
                  </p>
                  <p className="text-xs text-text-secondary">{r.status_hunian}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
