import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { fmt, cn } from '../../lib/utils'
import { Icon } from '../../components/ui/Icon'
import { Drawer } from '../../components/ui/Drawer'
import { timeAgo } from '../../components/forum/mention'

interface Produk {
  id_produk: number
  id_user_penjual: number
  nama_produk_jasa: string
  deskripsi: string
  harga: number
  foto_url?: string
  is_approved: boolean
  created_at: string
}

type Filter = 'semua' | 'menunggu' | 'tayang'

export function LapakRT() {
  const [produk, setProduk] = useState<Produk[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState<Filter>('menunggu')
  const [cari, setCari] = useState('')
  const [penjual, setPenjual] = useState<Record<number, string>>({})
  const [busy, setBusy] = useState<number | null>(null)

  const [openTambah, setOpenTambah] = useState(false)
  const [form, setForm] = useState({ nama: '', deskripsi: '', harga: '', foto: '' })
  const [kirim, setKirim] = useState(false)
  const [pesan, setPesan] = useState('')

  const muat = useCallback(async () => {
    try {
      setLoading(true)
      const rows: Produk[] = await api('/lapak')
      setProduk(rows)
      const ids = [...new Set(rows.map((p) => p.id_user_penjual))]
      const warga: Array<{ id_user: number | null; nama_lengkap: string }> = await api('/warga').catch(() => [])
      const m: Record<number, string> = {}
      warga.forEach((w) => {
        if (w.id_user) m[w.id_user] = w.nama_lengkap
      })
      ids.forEach((id) => {
        if (!m[id]) m[id] = 'Warga'
      })
      setPenjual(m)
      setErr('')
    } catch {
      setErr('Gagal memuat lapak.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muat()
  }, [muat])

  const daftar = useMemo(() => {
    let rows = [...produk]
    if (filter === 'menunggu') rows = rows.filter((p) => !p.is_approved)
    if (filter === 'tayang') rows = rows.filter((p) => p.is_approved)
    const q = cari.trim().toLowerCase()
    if (q) rows = rows.filter((p) => p.nama_produk_jasa.toLowerCase().includes(q))
    return rows
  }, [produk, filter, cari])

  const jml = (f: Filter) => (f === 'semua' ? produk.length : f === 'menunggu' ? produk.filter((p) => !p.is_approved).length : produk.filter((p) => p.is_approved).length)

  const setStatus = async (p: Produk, val: boolean) => {
    setBusy(p.id_produk)
    try {
      await api(`/lapak/${p.id_produk}/status`, { method: 'PUT', body: JSON.stringify({ is_approved: val }) })
      muat()
    } finally {
      setBusy(null)
    }
  }

  const hapus = async (id: number) => {
    if (!window.confirm('Hapus produk ini dari lapak?')) return
    setBusy(id)
    try {
      await api(`/lapak/${id}`, { method: 'DELETE' })
      muat()
    } finally {
      setBusy(null)
    }
  }

  const tambah = async () => {
    if (!form.nama.trim()) return setPesan('Nama wajib diisi.')
    setKirim(true)
    setPesan('')
    try {
      await api('/lapak', {
        method: 'POST',
        body: JSON.stringify({
          nama_produk_jasa: form.nama.trim(),
          deskripsi: form.deskripsi.trim(),
          harga: Number(form.harga) || 0,
          foto_url: form.foto.trim() || '',
        }),
      })
      setOpenTambah(false)
      setForm({ nama: '', deskripsi: '', harga: '', foto: '' })
      muat()
    } catch {
      setPesan('Gagal menyimpan.')
    } finally {
      setKirim(false)
    }
  }

  return (
    <div className="page-enter mx-auto max-w-lg">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Lapak — Moderasi</h1>
          <p className="text-sm text-text-secondary">Setujui produk warga sebelum tayang</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setPesan('')
            setOpenTambah(true)
          }}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-transform active:scale-95"
        >
          <Icon name="plus" size={16} /> Jual
        </button>
      </header>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['semua', 'menunggu', 'tayang'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-all',
              filter === f ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'border border-border bg-surface-card text-text-secondary'
            )}
          >
            {f === 'menunggu' ? <Icon name="clock" size={13} /> : f === 'tayang' ? <Icon name="check" size={13} /> : null}{' '}
            {f.charAt(0).toUpperCase() + f.slice(1)} ({jml(f)})
          </button>
        ))}
      </div>
      <div className="relative mt-3">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
          <Icon name="search" size={15} />
        </span>
        <input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari produk…"
          className="h-11 w-full rounded-xl border border-border bg-surface-card pl-9 pr-3 text-sm text-text-primary outline-none transition-colors focus:border-primary/60"
        />
      </div>

      {err && (
        <p className="mt-3 rounded-xl bg-danger/5 p-3 text-sm text-danger">
          {err}{' '}
          <button type="button" onClick={muat} className="font-semibold underline">
            Ulangi
          </button>
        </p>
      )}

      <div className="mt-3 space-y-2.5 pb-28">
        {loading ? (
          [0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-text-disabled/10" />)
        ) : daftar.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-semibold text-text-primary">Tidak ada produk</p>
            <p className="mt-1 text-sm text-text-secondary">{filter === 'menunggu' ? 'Semua produk sudah disetujui.' : 'Belum ada produk di kategori ini.'}</p>
          </div>
        ) : (
          daftar.map((p) => (
            <article key={p.id_produk} className="rounded-2xl border border-border bg-surface-card p-3.5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-text-primary">{p.nama_produk_jasa}</p>
                    {!p.is_approved ? (
                      <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600">MENUNGGU</span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">TAYANG</span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                    oleh {penjual[p.id_user_penjual] || 'Warga'} · {timeAgo(p.created_at)}
                  </p>
                  <p className="mt-1 text-[15px] font-bold text-primary">{p.harga > 0 ? fmt(p.harga) : 'Gratis'}</p>
                </div>
              </div>
              {!p.is_approved ? (
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    disabled={busy === p.id_produk}
                    onClick={() => setStatus(p, true)}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
                  >
                    <Icon name="check" size={15} /> Setujui
                  </button>
                  <button
                    type="button"
                    disabled={busy === p.id_produk}
                    onClick={() => hapus(p.id_produk)}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-danger/30 text-sm font-semibold text-danger transition-colors active:scale-[0.98] disabled:opacity-50"
                  >
                    <Icon name="trash" size={15} /> Tolak
                  </button>
                </div>
              ) : (
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    disabled={busy === p.id_produk}
                    onClick={() => setStatus(p, false)}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-semibold text-text-secondary transition-colors active:scale-[0.98] disabled:opacity-50"
                  >
                    <Icon name="x" size={15} /> Sembunyikan
                  </button>
                  <button
                    type="button"
                    disabled={busy === p.id_produk}
                    onClick={() => hapus(p.id_produk)}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-danger/30 text-danger transition-colors disabled:opacity-50"
                    aria-label="Hapus"
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <Drawer open={openTambah} onClose={() => setOpenTambah(false)} title="Jual produk RT" subtitle="Produk pengurus langsung tayang">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">NAMA PRODUK / JASA *</label>
            <input
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">DESKRIPSI</label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">HARGA (Rp)</label>
              <input
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: e.target.value.replace(/[^\d]/g, '') })}
                inputMode="numeric"
                className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">FOTO (URL)</label>
              <input
                value={form.foto}
                onChange={(e) => setForm({ ...form, foto: e.target.value })}
                placeholder="https://…"
                className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          {pesan && <p className="text-sm text-danger">{pesan}</p>}
          <button
            type="button"
            disabled={kirim}
            onClick={tambah}
            className="h-12 w-full rounded-2xl bg-primary text-[15px] font-semibold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {kirim ? 'Menyimpan…' : 'Tayangkan'}
          </button>
        </div>
      </Drawer>
    </div>
  )
}
