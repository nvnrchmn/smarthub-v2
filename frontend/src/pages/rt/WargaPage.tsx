import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { Drawer } from '../../components/ui/Drawer'
import { Avatar, EmptyState, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'

interface Warga {
  id_warga: number
  id_rumah: number | null
  nama_lengkap: string
  status_hubungan: string
  status_warga: string
}

interface Rumah {
  id_rumah: number
  nama_jalan_gang: string
  nomor_rumah: string
}

const emptyForm = { id_rumah: '', nama_lengkap: '', nik: '', no_kk: '', status_hubungan: 'Kepala Keluarga', status_warga: 'Aktif' }

export function RTWargaPage() {
  const [wargas, setWargas] = useState<Warga[]>([])
  const [rumahs, setRumahs] = useState<Rumah[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const rumahLabel = useMemo(() => {
    const m = new Map<number, string>()
    for (const r of rumahs) m.set(r.id_rumah, `${r.nama_jalan_gang} No. ${r.nomor_rumah}`)
    return m
  }, [rumahs])

  const load = async () => {
    try {
      const [d, dRumah] = await Promise.all([api('/warga'), api('/wilayah/rumah')])
      setWargas(Array.isArray(d) ? d : [])
      setRumahs(Array.isArray(dRumah) ? dRumah : [])
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal memuat data warga' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      await api('/warga', {
        method: 'POST',
        body: JSON.stringify({ ...form, id_rumah: Number(form.id_rumah) }),
      })
      setForm(emptyForm)
      setOpen(false)
      setNotice({ type: 'ok', text: 'Warga berhasil ditambahkan.' })
      load()
    } catch (err: any) {
      setNotice({ type: 'err', text: err.message || 'Gagal menambahkan warga' })
    } finally {
      setSaving(false)
    }
  }

  const hapus = async (w: Warga) => {
    if (!window.confirm(`Hapus ${w.nama_lengkap} dari daftar warga?`)) return
    try {
      await api(`/warga/${w.id_warga}`, { method: 'DELETE' })
      setNotice({ type: 'ok', text: `${w.nama_lengkap} dihapus.` })
      load()
    } catch (err: any) {
      setNotice({ type: 'err', text: err.message || 'Gagal menghapus warga' })
    }
  }

  const inputCls = 'w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30'
  const labelCls = 'mb-1 block text-xs font-medium text-text-secondary'

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-16">
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Data Warga</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{wargas.length} warga terdaftar</p>
        </div>
        <button
          type="button"
          disabled={rumahs.length === 0}
          onClick={() => setOpen(true)}
          className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-40"
        >
          <Icon name="plus" size={18} aria-hidden />
          <span className="hidden sm:inline">Tambah Warga</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </header>

      {notice && (
        <p role="status" className={`mb-4 rounded-xl border px-4 py-3 text-sm ${notice.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.text}
        </p>
      )}

      {loading && <div className="space-y-2.5"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>}

      {!loading && wargas.length === 0 && (
        <EmptyState icon="users" title="Belum ada warga" desc={rumahs.length === 0 ? 'Tambahkan rumah dulu sebelum mendaftarkan warga.' : 'Daftarkan warga pertama penghuni RT.'} />
      )}

      {!loading && wargas.length > 0 && (
        <div className="space-y-2.5">
          {wargas.map((w) => (
            <div key={w.id_warga} className="flex items-center gap-3 rounded-xl border border-border bg-surface-card p-3.5">
              <Avatar name={w.nama_lengkap} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{w.nama_lengkap}</p>
                <p className="truncate text-xs text-text-secondary">
                  {w.id_rumah ? rumahLabel.get(w.id_rumah) || `Rumah #${w.id_rumah}` : 'Belum punya rumah'}
                  {' · '}{w.status_hubungan}{w.status_warga && w.status_warga !== 'Aktif' ? ` · ${w.status_warga}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => hapus(w)}
                aria-label={`Hapus ${w.nama_lengkap}`}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-text-secondary hover:bg-red-50 hover:text-red-600"
              >
                <Icon name="trash" size={18} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      <Drawer open={open} onClose={() => setOpen(false)} title="Tambah Warga" subtitle="Data penghuni rumah di RT">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="w-nama" className={labelCls}>Nama lengkap</label>
            <input id="w-nama" required autoComplete="off" placeholder="cth: Budi Santoso" value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="w-rumah" className={labelCls}>Rumah</label>
            <select id="w-rumah" required value={form.id_rumah} onChange={(e) => setForm({ ...form, id_rumah: e.target.value })} className={inputCls}>
              <option value="" disabled>Pilih rumah…</option>
              {rumahs.map((r) => (
                <option key={r.id_rumah} value={r.id_rumah}>{r.nama_jalan_gang} No. {r.nomor_rumah}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="w-nik" className={labelCls}>NIK</label>
              <input id="w-nik" inputMode="numeric" autoComplete="off" placeholder="16 digit" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label htmlFor="w-kk" className={labelCls}>No. KK</label>
              <input id="w-kk" inputMode="numeric" autoComplete="off" placeholder="16 digit" value={form.no_kk} onChange={(e) => setForm({ ...form, no_kk: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label htmlFor="w-hub" className={labelCls}>Status hubungan</label>
            <select id="w-hub" value={form.status_hubungan} onChange={(e) => setForm({ ...form, status_hubungan: e.target.value })} className={inputCls}>
              <option>Kepala Keluarga</option>
              <option>Istri</option>
              <option>Anak</option>
              <option>Penyewa</option>
              <option>Lainnya</option>
            </select>
          </div>
          <div>
            <label htmlFor="w-status" className={labelCls}>Status warga</label>
            <select id="w-status" value={form.status_warga} onChange={(e) => setForm({ ...form, status_warga: e.target.value })} className={inputCls}>
              <option>Aktif</option>
              <option>Tetap</option>
              <option>Pindah</option>
              <option>Meninggal</option>
            </select>
          </div>
          <button type="submit" disabled={saving || rumahs.length === 0} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Menyimpan…' : 'Simpan Warga'}
          </button>
        </form>
      </Drawer>
    </div>
  )
}
