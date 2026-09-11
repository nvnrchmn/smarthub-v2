import { useToast } from '../../context/ToastContext'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { EmptyState, Skeleton } from '../../components/ui/bento'


interface Permintaan {
  id_permintaan: number
  id_warga: number
  id_user_pengaju: number
  field_yang_diubah: string
  nilai_lama: string | null
  nilai_baru: string
  keterangan: string | null
  status: 'pending' | 'disetujui' | 'ditolak'
  catatan_pengurus: string | null
  created_at: string
  nama_pengaju: string
  nama_warga: string
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  disetujui: 'bg-green-100 text-green-700',
  ditolak: 'bg-red-100 text-red-700',
}

export function PerbaikanDataRTPage() {
  const { toast } = useToast()
  const [data, setData] = useState<Permintaan[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  const load = async () => {
    try {
      const d = await api<Permintaan[]>('/perbaikan-data')
      setData(Array.isArray(d) ? d : [])
    } catch (e: any) {
      setErr(e.message || 'Gagal memuat')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleReview = async (id: number, status: 'disetujui' | 'ditolak', catatan: string) => {
    setUpdating(id)
    try {
      await api(`/perbaikan-data/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, catatan }),
      })
      load()
    } catch (e: any) {
      toast(e.message || 'Gagal', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const pending = data.filter(d => d.status === 'pending')
  const processed = data.filter(d => d.status !== 'pending')

  if (loading) return <div className="px-4 pt-4 space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
  if (err) return <div className="px-4 pt-4 text-sm text-danger">{err}</div>

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 space-y-6">
      <header>
        <h1 className="text-xl font-bold text-text-primary">Perbaikan Data</h1>
        <p className="text-xs text-text-secondary">{pending.length} permintaan menunggu review</p>
      </header>

      {pending.length === 0 && processed.length === 0 && (
        <EmptyState icon="file" title="Belum ada permintaan" desc="Permintaan perbaikan data dari warga akan muncul di sini." />
      )}

      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Menunggu Review</h2>
          <div className="space-y-3">
            {pending.map(p => (
              <PermintaanCard key={p.id_permintaan} item={p} onReview={handleReview} updating={updating === p.id_permintaan} />
            ))}
          </div>
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3">Sudah Diproses</h2>
          <div className="space-y-2">
            {processed.map(p => (
              <div key={p.id_permintaan} className="rounded-xl border border-border bg-surface-card p-3 text-sm opacity-70">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">{p.nama_warga || p.nama_pengaju} — <span className="capitalize">{p.field_yang_diubah.replace('_', ' ')}</span></span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                </div>
                {p.catatan_pengurus && <p className="mt-1 text-xs text-text-secondary italic">Catatan: {p.catatan_pengurus}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PermintaanCard({ item, onReview, updating }: { item: Permintaan; onReview: (id: number, status: 'disetujui' | 'ditolak', catatan: string) => void; updating: boolean }) {
  const [catatan, setCatatan] = useState('')
  const [showCatatan, setShowCatatan] = useState<'setujui' | 'tolak' | null>(null)

  return (
    <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-text-primary">{item.nama_warga || item.nama_pengaju}</p>
          <p className="text-xs text-text-secondary">{new Date(item.created_at).toLocaleDateString('id-ID')}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[item.status]}`}>{item.status}</span>
      </div>

      <div className="rounded-lg bg-surface p-3 text-sm space-y-1">
        <p className="text-text-secondary">Field: <span className="capitalize font-medium text-text-primary">{item.field_yang_diubah.replace('_', ' ')}</span></p>
        {item.nilai_lama && <p className="text-text-secondary">Sebelumnya: <span className="line-through">{item.nilai_lama}</span></p>}
        <p className="text-text-primary">Menjadi: <span className="font-semibold">{item.nilai_baru}</span></p>
        {item.keterangan && <p className="text-text-secondary italic mt-2">Keterangan: {item.keterangan}</p>}
      </div>

      {showCatatan === null ? (
        <div className="flex gap-2">
          <button onClick={() => setShowCatatan('setujui')} disabled={updating} className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-600 disabled:opacity-50">
            Setujui
          </button>
          <button onClick={() => setShowCatatan('tolak')} disabled={updating} className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50">
            Tolak
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan pengurus (opsional)" rows={2} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button onClick={() => { setShowCatatan(null); setCatatan('') }} className="flex-1 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-text-disabled/10">Batal</button>
            <button onClick={() => { onReview(item.id_permintaan, showCatatan === 'setujui' ? 'disetujui' : 'ditolak', catatan); setShowCatatan(null); setCatatan('') }} disabled={updating} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium text-white ${showCatatan === 'setujui' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
              {updating ? '...' : 'Konfirmasi'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}