import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Avatar, EmptyState, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'

interface Warga {
  id_warga: number
  id_rumah: number | null
  nama_lengkap: string
  status_hubungan: string
  status_warga: string
  no_hp?: string
}

interface Permintaan {
  id_permintaan: number
  id_warga: number
  field_yang_diubah: string
  nilai_lama: string | null
  nilai_baru: string
  keterangan: string | null
  status: 'pending' | 'disetujui' | 'ditolak'
  catatan_pengurus: string | null
  created_at: string
  nama_warga: string
}

const FIELDS = [
  { value: 'nama_lengkap', label: 'Nama Lengkap' },
  { value: 'nik', label: 'NIK' },
  { value: 'no_kk', label: 'No. KK' },
  { value: 'status_hubungan', label: 'Status Hubungan' },
]

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  disetujui: 'bg-green-100 text-green-700',
  ditolak: 'bg-red-100 text-red-700',
}

export function WargaSayaPage() {
  const [me, setMe] = useState<Warga | null>(null)
  const [housemates, setHousemates] = useState<Warga[]>([])
  const [permintaan, setPermintaan] = useState<Permintaan[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formField, setFormField] = useState('nama_lengkap')
  const [formValue, setFormValue] = useState('')
  const [formNote, setFormNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    try {
      const [wargas, perms] = await Promise.all([
        api<Warga[]>('/warga/me'),
        api<Permintaan[]>('/perbaikan-data/saya').catch(() => []),
      ])
      if (Array.isArray(wargas) && wargas.length > 0) {
        setMe(wargas[0])
        setHousemates(wargas.slice(1))
      }
      if (Array.isArray(perms)) setPermintaan(perms)
    } catch (e: any) {
      setErr(e.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submitPermintaan = async () => {
    if (!me || !formValue.trim()) return
    setSaving(true)
    setNotice(null)
    try {
      await api('/perbaikan-data', {
        method: 'POST',
        body: JSON.stringify({
          id_warga: me.id_warga,
          field_yang_diubah: formField,
          nilai_baru: formValue,
          keterangan: formNote || undefined,
        }),
      })
      setNotice({ type: 'ok', text: 'Permintaan perbaikan berhasil diajukan' })
      setShowForm(false)
      setFormValue('')
      setFormNote('')
      load()
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal mengajukan' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="px-4 pt-4 space-y-3"><Skeleton className="h-24" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
  if (err) return <div className="px-4 pt-4 text-sm text-danger">{err}</div>
  if (!me) return <div className="px-4 pt-4"><EmptyState icon="users" title="Data tidak ditemukan" desc="Hubungi pengurus RT untuk mendaftarkan data Anda." /></div>

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Data Warga</h1>
          <p className="text-xs text-text-secondary">Informasi kependudukan Anda</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20">
          <Icon name="plus" size={14} /> Perbaikan Data
        </button>
      </header>

      {notice && (
        <div className={`rounded-xl px-3 py-2 text-sm ${notice.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {notice.text}
        </div>
      )}

      {/* Form Ajukan Perbaikan */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Ajukan Perbaikan Data</h3>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Field yang ingin diperbaiki</label>
            <select value={formField} onChange={e => setFormField(e.target.value)} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm">
              {FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Nilai yang benar</label>
            <input type="text" value={formValue} onChange={e => setFormValue(e.target.value)} placeholder="Masukkan nilai yang benar" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Keterangan (opsional)</label>
            <textarea value={formNote} onChange={e => setFormNote(e.target.value)} placeholder="Alasan perubahan..." rows={2} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-text-disabled/10">Batal</button>
            <button onClick={submitPermintaan} disabled={saving || !formValue.trim()} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </div>
      )}

      {/* Data Saya */}
      <div className="rounded-2xl border border-border bg-surface-card p-4">
        <div className="flex items-center gap-3">
          <Avatar name={me.nama_lengkap} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary truncate">{me.nama_lengkap}</p>
            <p className="text-xs text-text-secondary">{me.status_hubungan}</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${me.status_warga === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {me.status_warga}
          </span>
        </div>
      </div>

      {/* Penghuni Satu Rumah */}
      {housemates.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Icon name="users" size={16} /> Penghuni Sama Rumah
          </h2>
          <div className="space-y-2">
            {housemates.map(w => (
              <div key={w.id_warga} className="flex items-center gap-3 rounded-xl border border-border bg-surface-card p-3">
                <Avatar name={w.nama_lengkap} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">{w.nama_lengkap}</p>
                  <p className="text-[11px] text-text-secondary">{w.status_hubungan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat Permintaan */}
      {permintaan.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Icon name="file" size={16} /> Riwayat Permintaan Perbaikan
          </h2>
          <div className="space-y-2">
            {permintaan.map(p => (
              <div key={p.id_permintaan} className="rounded-xl border border-border bg-surface-card p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-text-primary capitalize">{p.field_yang_diubah.replace('_', ' ')}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                </div>
                {p.nilai_lama && <p className="text-xs text-text-secondary">Sebelumnya: <span className="line-through">{p.nilai_lama}</span></p>}
                <p className="text-xs text-text-primary">Menjadi: <span className="font-medium">{p.nilai_baru}</span></p>
                {p.catatan_pengurus && <p className="mt-1 text-xs text-text-secondary italic">Catatan: {p.catatan_pengurus}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}