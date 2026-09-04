import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Drawer } from '../../components/ui/Drawer'
import { EmptyState, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'

interface Rumah {
  id_rumah: number
  nama_jalan_gang: string
  nomor_rumah: string
  status_hunian: string
}

const emptyForm = { nama_jalan_gang: '', nomor_rumah: '', status_hunian: 'Dihuni' }

export function RTRumahPage() {
  const [rumahs, setRumahs] = useState<Rumah[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    try {
      const d = await api('/wilayah/rumah')
      setRumahs(Array.isArray(d) ? d : [])
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message || 'Gagal memuat data rumah' })
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
      await api('/wilayah/rumah', { method: 'POST', body: JSON.stringify(form) })
      setForm(emptyForm)
      setOpen(false)
      setNotice({ type: 'ok', text: 'Rumah berhasil ditambahkan.' })
      load()
    } catch (err: any) {
      setNotice({ type: 'err', text: err.message || 'Gagal menambahkan rumah' })
    } finally {
      setSaving(false)
    }
  }

  // Kelompokkan per gang agar warga mudah menemukan nomornya
  const gangs = new Map<string, Rumah[]>()
  for (const r of rumahs) {
    const g = gangs.get(r.nama_jalan_gang) || []
    g.push(r)
    gangs.set(r.nama_jalan_gang, g)
  }

  const inputCls = 'w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30'
  const labelCls = 'mb-1 block text-xs font-medium text-text-secondary'

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-16">
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Kelola Rumah</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Data rumah di lingkungan RT</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
        >
          <Icon name="plus" size={18} aria-hidden />
          <span className="hidden sm:inline">Tambah Rumah</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </header>

      {notice && (
        <p role="status" className={`mb-4 rounded-xl border px-4 py-3 text-sm ${notice.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.text}
        </p>
      )}

      {loading && <div className="space-y-2.5"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>}

      {!loading && rumahs.length === 0 && (
        <EmptyState icon="home" title="Belum ada rumah" desc="Mulai dengan menambahkan rumah pertama di lingkungan RT." />
      )}

      {!loading && rumahs.length > 0 && (
        <div className="space-y-5">
          {[...gangs.entries()].map(([gang, list]) => (
            <section key={gang}>
              <h2 className="sticky top-2 z-10 mb-2 flex items-center gap-2 rounded-lg bg-surface/90 px-1 py-1.5 text-sm font-semibold text-text-primary backdrop-blur">
                <Icon name="mapPin" size={15} className="text-primary" aria-hidden />
                {gang}
                <span className="text-xs font-normal text-text-secondary">{list.length} rumah</span>
              </h2>
              <div className="space-y-2.5">
                {list.map((r) => (
                  <div key={r.id_rumah} className="flex items-center gap-3 rounded-xl border border-border bg-surface-card p-4">
                    <span
                      aria-hidden
                      className={`h-10 w-1.5 rounded-full ${r.status_hunian === 'Dihuni' ? 'bg-status-paid' : 'bg-status-empty'}`}
                    />
                    <span className={`grid h-10 w-10 place-items-center rounded-full ${r.status_hunian === 'Dihuni' ? 'bg-status-paid-bg text-status-paid' : 'bg-status-empty-bg text-status-empty'}`}>
                      <Icon name="home" size={18} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">{gang} No. {r.nomor_rumah}</p>
                      <p className="text-xs text-text-secondary">{r.status_hunian}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Drawer open={open} onClose={() => setOpen(false)} title="Tambah Rumah" subtitle="Rumah baru akan tampil di daftar lingkungan RT">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="gang" className={labelCls}>Nama jalan / gang</label>
            <input
              id="gang"
              placeholder="cth: Gang Melati"
              required
              autoComplete="off"
              value={form.nama_jalan_gang}
              onChange={(e) => setForm({ ...form, nama_jalan_gang: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="nomor" className={labelCls}>Nomor rumah</label>
            <input
              id="nomor"
              placeholder="cth: A10"
              required
              autoComplete="off"
              value={form.nomor_rumah}
              onChange={(e) => setForm({ ...form, nomor_rumah: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="hunian" className={labelCls}>Status hunian</label>
            <select id="hunian" value={form.status_hunian} onChange={(e) => setForm({ ...form, status_hunian: e.target.value })} className={inputCls}>
              <option value="Dihuni">Dihuni</option>
              <option value="Kosong">Kosong</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Menyimpan…' : 'Simpan Rumah'}
          </button>
        </form>
      </Drawer>
    </div>
  )
}
