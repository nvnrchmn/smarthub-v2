import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { Drawer } from '../../components/ui/Drawer'
import { Icon } from '../../components/ui/Icon'
import { warnaInisial, inisial } from '../../components/forum/mention'
import { cn } from '../../lib/utils'

interface Produk {
  id_produk: number
  id_tenant: number
  id_user_penjual: number
  nama_produk_jasa: string
  deskripsi: string
  harga: number
  foto_url?: string
  is_approved: boolean
  created_at: string
}

function Foto({ foto, nama }: { foto?: string; nama: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
      <div
        className="absolute inset-0 grid place-items-center text-white/90"
        style={{ background: `linear-gradient(135deg, ${warnaInisial(nama)} 0%, #0F1A14 140%)` }}
      >
        <span className="text-2xl font-bold drop-shadow">{inisial(nama || 'Jual')}</span>
      </div>
      {foto && /^https?:\/\//.test(foto) && (
        <img
          src={foto}
          alt={nama}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
    </div>
  )
}

export function LapakWargaPage() {
  const { user } = useAuth()
  const [produk, setProduk] = useState<Produk[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [cari, setCari] = useState('')

  const [openTambah, setOpenTambah] = useState(false)
  const [form, setForm] = useState({ nama: '', deskripsi: '', harga: '', foto: '' })
  const [kirim, setKirim] = useState(false)
  const [pesan, setPesan] = useState('')
  const [hapusId, setHapusId] = useState<number | null>(null)

  const muat = useCallback(async () => {
    try {
      setLoading(true)
      setProduk(await api('/lapak'))
      setErr('')
    } catch {
      setErr('Gagal memuat lapak. Muat ulang untuk mencoba lagi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muat()
  }, [muat])

  const tayang = useMemo(() => produk.filter((p) => p.is_approved), [produk])
  const punyaku = useMemo(
    () => produk.filter((p) => !p.is_approved && p.id_user_penjual === user?.id),
    [produk, user?.id]
  )
  const hasilCari = useMemo(() => {
    const q = cari.trim().toLowerCase()
    if (!q) return tayang
    return tayang.filter((p) => p.nama_produk_jasa.toLowerCase().includes(q) || p.deskripsi.toLowerCase().includes(q))
  }, [tayang, cari])

  const tambah = async () => {
    if (!form.nama.trim()) return setPesan('Nama produk/jasa wajib diisi.')
    const harga = Number(form.harga.replace(/[^\d]/g, '')) || 0
    setKirim(true)
    setPesan('')
    try {
      await api('/lapak', {
        method: 'POST',
        body: JSON.stringify({
          nama_produk_jasa: form.nama.trim(),
          deskripsi: form.deskripsi.trim(),
          harga,
          foto_url: form.foto.trim() || '',
        }),
      })
      setOpenTambah(false)
      setForm({ nama: '', deskripsi: '', harga: '', foto: '' })
      muat()
    } catch {
      setPesan('Gagal menyimpan produk. Coba lagi.')
    } finally {
      setKirim(false)
    }
  }

  const hapus = async (id: number) => {
    if (!window.confirm('Hapus produk ini?')) return
    setHapusId(id)
    try {
      await api(`/lapak/${id}`, { method: 'DELETE' })
      muat()
    } finally {
      setHapusId(null)
    }
  }

  return (
    <div className="page-enter mx-auto max-w-md px-4 pt-4">
      <header className="mb-1 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Lapak Warga</h1>
          <p className="text-sm text-text-secondary">Jual & cari kebutuhan antar tetangga</p>
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

      {/* Cari */}
      <div className="relative mt-3">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
          <Icon name="search" size={16} />
        </span>
        <input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari produk atau jasa…"
          className="h-12 w-full rounded-2xl border border-border bg-surface-card pl-10 pr-4 text-[15px] text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          {err}{' '}
          <button type="button" onClick={muat} className="font-semibold underline">
            Muat ulang
          </button>
        </div>
      )}

      {/* Produk saya yang belum disetujui */}
      {punyaku.length > 0 && (
        <section className="mt-5">
          <h2 className="text-sm font-bold text-text-primary">Menunggu persetujuan</h2>
          <p className="text-xs text-text-secondary">Produk tampil setelah disetujui pengurus RT</p>
          <div className="mt-2.5 space-y-2">
            {punyaku.map((p) => (
              <div key={p.id_produk} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-card p-3">
                <div className="w-14 shrink-0">
                  <Foto foto={p.foto_url} nama={p.nama_produk_jasa} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{p.nama_produk_jasa}</p>
                  <p className="text-xs text-text-secondary">{fmt(p.harga)}</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                    <Icon name="clock" size={11} /> Menunggu
                  </span>
                </div>
                <button
                  type="button"
                  disabled={hapusId === p.id_produk}
                  onClick={() => hapus(p.id_produk)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Hapus"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Marketplace */}
      <section className="mt-5 pb-24">
        <h2 className="text-sm font-bold text-text-primary">{hasilCari.length} produk & jasa</h2>
        {loading ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-text-disabled/10">
                <div className="aspect-[4/3] rounded-xl" />
                <div className="space-y-2 p-3">
                  <div className="h-3 rounded bg-text-disabled/10" />
                  <div className="h-3 w-2/3 rounded bg-text-disabled/10" />
                </div>
              </div>
            ))}
          </div>
        ) : hasilCari.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
            <Icon name="store" size={28} className="mx-auto text-text-secondary" />
            <p className="mt-2 font-semibold text-text-primary">{cari ? 'Tidak ditemukan' : 'Lapak masih kosong'}</p>
            <p className="mt-1 text-sm text-text-secondary">{cari ? 'Coba kata kunci lain.' : 'Jadilah penjual pertama di RT ini.'}</p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {hasilCari.map((p) => (
              <article key={p.id_produk} className="overflow-hidden rounded-2xl border border-border bg-surface-card transition-all active:scale-[0.98]">
                <Foto foto={p.foto_url} nama={p.nama_produk_jasa} />
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-semibold text-text-primary">{p.nama_produk_jasa}</p>
                  <p className="mt-0.5 line-clamp-2 min-h-[2rem] text-xs leading-relaxed text-text-secondary">{p.deskripsi || '—'}</p>
                  <p className={cn('mt-1.5 text-[15px] font-bold', p.harga > 0 ? 'text-primary' : 'text-text-secondary')}>
                    {p.harga > 0 ? fmt(p.harga) : 'Gratis'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Drawer tambah produk */}
      <Drawer open={openTambah} onClose={() => setOpenTambah(false)} title="Jual di Lapak" subtitle="Produk tampil setelah disetujui pengurus RT">
        <div className="space-y-4">
          <div>
            <label htmlFor="lp-nama" className="mb-1.5 block text-xs font-semibold text-text-secondary">
              NAMA PRODUK / JASA *
            </label>
            <input
              id="lp-nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              maxLength={150}
              placeholder="mis. Jasa cuci motor, keripik singkong"
              className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="lp-desk" className="mb-1.5 block text-xs font-semibold text-text-secondary">
              DESKRIPSI
            </label>
            <textarea
              id="lp-desk"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              rows={3}
              placeholder="Harga satuan, cara pemesanan, kontak…"
              className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="lp-harga" className="mb-1.5 block text-xs font-semibold text-text-secondary">
                HARGA (Rp)
              </label>
              <input
                id="lp-harga"
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: e.target.value.replace(/[^\d]/g, '') })}
                inputMode="numeric"
                placeholder="25000"
                className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="lp-foto" className="mb-1.5 block text-xs font-semibold text-text-secondary">
                FOTO (URL)
              </label>
              <input
                id="lp-foto"
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
            {kirim ? 'Menyimpan…' : 'Tayangkan di Lapak'}
          </button>
        </div>
      </Drawer>
    </div>
  )
}
