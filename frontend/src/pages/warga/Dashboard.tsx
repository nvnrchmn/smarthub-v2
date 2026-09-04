import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { KartuRumah } from '../../components/rumah/KartuRumah'
import { KartuTagihan } from '../../components/tagihan/KartuTagihan'

export function WargaDashboard() {
  const { user } = useAuth()
  const [rumah, setRumah] = useState<any[]>([])
  const [tagihan, setTagihan] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const [r, t] = await Promise.all([
          api(`/wilayah/rumah?tenant_id=${user?.tenant_id}`),
          api(`/keuangan/tagihan?tenant_id=${user?.tenant_id}`),
        ])
        setRumah(r)
        setTagihan(t)
      } catch (e: any) {
        setErr(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  if (loading) return <div className="p-6 text-center text-text-secondary">Memuat…</div>
  if (err) return <div className="p-6 text-center text-red-600">{err}</div>

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Beranda</h1>
        <p className="text-sm text-text-secondary">Selamat datang di SmartHub.</p>
      </header>
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-text-secondary">Rumah</h2>
        <div className="space-y-2">
          {rumah.map((r) => (
            <KartuRumah key={r.id_rumah} namaJalanGang={r.nama_jalan_gang} nomorRumah={r.nomor_rumah} statusHunian={r.status_hunian} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-text-secondary">Tagihan Terkini</h2>
        <div className="space-y-2">
          {tagihan.slice(0, 5).map((t) => (
            <KartuTagihan key={t.id_tagihan} periode={t.periode_bulan_tahun} totalNominal={t.total_nominal} statusPembayaran={t.status_pembayaran} />
          ))}
        </div>
      </section>
    </div>
  )
}
