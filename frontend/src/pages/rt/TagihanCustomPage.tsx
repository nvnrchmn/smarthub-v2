import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Drawer } from '../../components/ui/Drawer'
import { EmptyState, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'
import { cn } from '../../lib/utils'

interface Rumah {
  id_rumah: number
  nama_jalan_gang: string
  nomor_rumah: string
}

interface TagihanCustom {
  id: number
  id_rumah: number
  deskripsi: string
  nominal: number
  periode: string
  status_pembayaran: string
  nama_rumah?: string
  nama_jalan_gang?: string
  nomor_rumah?: string
  created_at: string
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  LUNAS: 'bg-green-100 text-green-700',
  DIBATALKAN: 'bg-gray-100 text-gray-500',
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export function RTTagihanPage() {
  const [tagihans, setTagihans] = useState<TagihanCustom[]>([])
  const [rumahs, setRumahs] = useState<Rumah[]>([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedRumah, setSelectedRumah] = useState<number[]>([])
  const [deskripsi, setDeskripsi] = useState('')
  const [nominal, setNominal] = useState('')
  const [periode, setPeriode] = useState('')
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [d, dRumah] = await Promise.all([
        api('/keuangan/tagihan-custom'),
        api('/wilayah/rumah'),
      ])
      setTagihans(Array.isArray(d) ? d : [])
      setRumahs(Array.isArray(dRumah) ? dRumah : [])
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal memuat data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleRumah = (id: number) => {
    setSelectedRumah(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleAll = () => {
    if (selectedRumah.length === rumahs.length) setSelectedRumah([])
    else setSelectedRumah(rumahs.map(r => r.id_rumah))
  }

  const submit = async () => {
    if (!deskripsi || !nominal || !periode || selectedRumah.length === 0) return
    setSaving(true)
    try {
      await api('/keuangan/tagihan-custom', {
        method: 'POST',
        body: JSON.stringify({
          deskripsi,
          nominal: parseFloat(nominal),
          periode,
          rumah_ids: selectedRumah,
        }),
      })
      setNotice({ type: 'ok', text: `${selectedRumah.length} tagihan custom berhasil dibuat` })
      setOpenForm(false)
      setDeskripsi('')
      setNominal('')
      setPeriode('')
      setSelectedRumah([])
      load()
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal membuat tagihan' })
    } finally {
      setSaving(false)
      setTimeout(() => setNotice(null), 3000)
    }
  }

  const verifikasi = async (id: number) => {
    if (!confirm('Verifikasi tagihan ini sebagai lunas?')) return
    try {
      await api(`/keuangan/tagihan-custom/${id}/verifikasi`, { method: 'POST' })
      setNotice({ type: 'ok', text: 'Tagihan diverifikasi' })
      load()
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal verifikasi' })
    }
    setTimeout(() => setNotice(null), 3000)
  }

  const hapus = async (id: number) => {
    if (!confirm('Hapus tagihan ini?')) return
    try {
      await api(`/keuangan/tagihan-custom/${id}`, { method: 'DELETE' })
      setNotice({ type: 'ok', text: 'Tagihan dihapus' })
      load()
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal menghapus' })
    }
    setTimeout(() => setNotice(null), 3000)
  }

  const totalPending = tagihans.filter(t => t.status_pembayaran === 'PENDING').reduce((s, t) => s + t.nominal, 0)
  const totalLunas = tagihans.filter(t => t.status_pembayaran === 'LUNAS').reduce((s, t) => s + t.nominal, 0)

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Tagihan Custom</h1>
          <p className="text-xs text-text-secondary">Buat tagihan dengan deskripsi & nominal bebas</p>
        </div>
        <button onClick={() => setOpenForm(true)} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95">
          <Icon name="plus" size={16} /> Buat
        </button>
      </header>

      {notice && (
        <div className={cn('mb-3 rounded-xl px-3.5 py-2.5 text-sm', notice.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
          {notice.text}
        </div>
      )}

      {/* Ringkasan */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface-card p-3">
          <p className="text-[11px] text-text-secondary">Total Pending</p>
          <p className="text-lg font-bold text-amber-600">{formatRp(totalPending)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-3">
          <p className="text-[11px] text-text-secondary">Total Lunas</p>
          <p className="text-lg font-bold text-green-600">{formatRp(totalLunas)}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : tagihans.length === 0 ? (
        <EmptyState icon="file" title="Belum ada tagihan custom" desc="Buat tagihan baru dengan tombol di atas." />
      ) : (
        <div className="space-y-2">
          {tagihans.map(t => (
            <div key={t.id} className="rounded-xl border border-border bg-surface-card p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary truncate">{t.deskripsi}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{t.nama_jalan_gang} No. {t.nomor_rumah} &middot; {t.periode}</p>
                </div>
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_COLOR[t.status_pembayaran])}>{t.status_pembayaran}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-base font-bold text-primary">{formatRp(t.nominal)}</p>
                <div className="flex gap-2">
                  {t.status_pembayaran === 'PENDING' && (
                    <button onClick={() => verifikasi(t.id)} className="rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700 hover:bg-green-100">
                      <Icon name="check" size={12} className="inline" /> Lunas
                    </button>
                  )}
                  <button onClick={() => hapus(t.id)} className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100">
                    <Icon name="trash" size={12} className="inline" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Buat Tagihan Custom */}
      <Drawer open={openForm} onClose={() => setOpenForm(false)} title="Buat Tagihan Custom">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Deskripsi</label>
            <input value={deskripsi} onChange={e => setDeskripsi(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm" placeholder="Contoh: Iuran Renovasi Gapura" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Nominal (Rp)</label>
            <input type="number" value={nominal} onChange={e => setNominal(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm" placeholder="50000" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Periode (MM-YYYY)</label>
            <input value={periode} onChange={e => setPeriode(e.target.value)} className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm" placeholder="09-2026" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-text-secondary">Pilih Rumah ({selectedRumah.length}/{rumahs.length})</label>
              <button type="button" onClick={toggleAll} className="text-[11px] font-medium text-primary hover:underline">
                {selectedRumah.length === rumahs.length ? 'Batal Pilih' : 'Pilih Semua'}
              </button>
            </div>
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-border p-2">
              {rumahs.map(r => (
                <label key={r.id_rumah} className={cn('flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-colors', selectedRumah.includes(r.id_rumah) ? 'bg-primary/10' : 'hover:bg-text-disabled/10')}>
                  <input type="checkbox" checked={selectedRumah.includes(r.id_rumah)} onChange={() => toggleRumah(r.id_rumah)} className="rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-text-primary">{r.nama_jalan_gang} No. {r.nomor_rumah}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={submit} disabled={saving || !deskripsi || !nominal || !periode || selectedRumah.length === 0} className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Menyimpan...' : `Buat ${selectedRumah.length} Tagihan`}
          </button>
        </div>
      </Drawer>
    </div>
  )
}
