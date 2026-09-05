import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { Drawer } from '../ui/Drawer'
import { Icon } from '../ui/Icon'
import { MentionArea, NamaWarga, renderRich, timeAgo, warnaInisial, inisial } from './mention'

interface Thread {
  id_thread: number
  id_user_pembuat: number
  tipe_thread: string
  judul: string
  konten: string
  created_at: string
  nama_penulis?: string
  komentar_count?: number
}

interface KomentarRow {
  id_komentar: number
  id_user: number
  komentar: string
  created_at: string
  nama_penulis?: string
}

function AvatarWarga({ nama, size = 9 }: { nama: string; size?: number }) {
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-full font-bold text-white', size === 9 ? 'h-9 w-9 text-xs' : 'h-8 w-8 text-[11px]')}
      style={{ backgroundColor: warnaInisial(nama || '?') }}
    >
      {inisial(nama || '?')}
    </span>
  )
}

interface Props {
  canAnnounce: boolean
}

/* Feed forum ala Instagram: kartu thread → drawer detail berisi komentar,
   @Mention warga satu tenant saat menulis thread maupun komentar. */
export function ForumFeed({ canAnnounce }: Props) {
  const { user } = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [namaWarga, setNamaWarga] = useState<NamaWarga[]>([])

  const [openDetail, setOpenDetail] = useState<Thread | null>(null)
  const [detail, setDetail] = useState<{ thread: Thread; komentar: KomentarRow[] } | null>(null)
  const [detLoading, setDetLoading] = useState(false)

  const [openBuat, setOpenBuat] = useState(false)
  const [judul, setJudul] = useState('')
  const [konten, setKonten] = useState('')
  const [tipe, setTipe] = useState<'Diskusi' | 'Pengumuman'>('Diskusi')
  const [kirim, setKirim] = useState(false)
  const [pesan, setPesan] = useState('')

  const [komentar, setKomentar] = useState('')
  const [komenLoading, setKomenLoading] = useState(false)

  const muat = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api('/forum')
      setThreads(data)
      setErr('')
    } catch {
      setErr('Gagal memuat forum. Tarik ke bawah untuk coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muat()
    api('/warga')
      .then((rows: Array<{ id_user: number | null; nama_lengkap: string }>) =>
        setNamaWarga(
          rows
            .filter((r) => r.id_user && r.nama_lengkap)
            .map((r) => ({ id_user: Number(r.id_user), nama_lengkap: r.nama_lengkap }))
        )
      )
      .catch(() => {})
  }, [muat])

  const roleLabel = user?.role === 'ketua_rt' ? 'Pengurus RT' : user?.role === 'super_admin' ? 'Administrator' : 'Warga'
  const saya = user?.id ?? 0
  const daftar = useMemo(
    () =>
      threads.map((t) => ({
        ...t,
        _penulis: t.nama_penulis || (t.id_user_pembuat === saya ? roleLabel : 'Warga'),
      })),
    [threads, saya, roleLabel]
  )

  const bukaDetail = async (t: Thread) => {
    setOpenDetail(t)
    setDetLoading(true)
    setKomentar('')
    try {
      const d = await api(`/forum/${t.id_thread}`)
      setDetail(d)
    } catch {
      setDetail({ thread: t, komentar: [] })
    } finally {
      setDetLoading(false)
    }
  }

  const kirimThread = async () => {
    if (!judul.trim() || !konten.trim()) {
      setPesan('Judul dan isi harus diisi.')
      return
    }
    setKirim(true)
    setPesan('')
    try {
      await api('/forum', { method: 'POST', body: JSON.stringify({ judul: judul.trim(), konten: konten.trim(), tipe_thread: tipe }) })
      setOpenBuat(false)
      setJudul('')
      setKonten('')
      setTipe('Diskusi')
      muat()
    } catch {
      setPesan('Gagal mengirim. Coba lagi.')
    } finally {
      setKirim(false)
    }
  }

  const kirimKomentar = async () => {
    if (!openDetail || !komentar.trim()) return
    setKomenLoading(true)
    try {
      await api(`/forum/${openDetail.id_thread}/komentar`, { method: 'POST', body: JSON.stringify({ komentar: komentar.trim() }) })
      setKomentar('')
      const d = await api(`/forum/${openDetail.id_thread}`)
      setDetail(d)
      muat()
    } catch {
      /* abaikan — tetap tampilkan drawer */
    } finally {
      setKomenLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between pb-1">
        <p className="text-sm text-text-secondary">Ayo ngobrol & berbagi info dengan tetangga</p>
        <button
          type="button"
          onClick={() => {
            setPesan('')
            setOpenBuat(true)
          }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25 transition-transform active:scale-95"
          aria-label="Buat thread"
        >
          <Icon name="plus" size={20} />
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          {err}
          <button type="button" onClick={muat} className="ml-2 font-semibold underline">
            Muat ulang
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-text-disabled/10" />
          ))}
        </div>
      ) : daftar.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold text-text-primary">Belum ada diskusi</p>
          <p className="mt-1 text-sm text-text-secondary">Mulai dengan thread pertama Anda.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-3 pb-24">
          {daftar.map((t) => (
            <button
              key={t.id_thread}
              type="button"
              onClick={() => bukaDetail(t)}
              className={cn(
                'block w-full rounded-2xl border p-4 text-left transition-all active:scale-[0.99]',
                t.tipe_thread === 'Pengumuman' ? 'border-primary/25 bg-primary/5' : 'border-border bg-surface-card'
              )}
            >
              <div className="flex items-center gap-2.5">
                <AvatarWarga nama={t._penulis} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{t._penulis}</p>
                  <p className="text-[11px] text-text-secondary">
                    {timeAgo(t.created_at)}
                    {t.tipe_thread === 'Pengumuman' && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">PENGUMUMAN</span>
                    )}
                  </p>
                </div>
              </div>
              <p className="mt-2.5 font-semibold text-text-primary">{t.judul}</p>
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{t.konten}</p>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                <Icon name="chat" size={14} />
                <span>{t.komentar_count ?? 0} komentar</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Drawer detail thread + komentar */}
      <Drawer open={!!openDetail} onClose={() => setOpenDetail(null)} title={openDetail?.judul ?? ''}>
        {openDetail && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <AvatarWarga nama={detail?.thread.nama_penulis || openDetail.nama_penulis || roleLabel} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">{detail?.thread.nama_penulis || roleLabel}</p>
                <p className="text-[11px] text-text-secondary">{timeAgo(openDetail.created_at)}</p>
              </div>
            </div>
            <div className="mt-3 text-[15px] leading-relaxed text-text-primary">{renderRich(openDetail.konten)}</div>

            <div className="my-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <Icon name="chat" size={14} />
              Komentar ({detail?.komentar.length ?? 0})
            </div>

            {detLoading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-text-disabled/10" />
                ))}
              </div>
            ) : (detail?.komentar ?? []).length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-text-secondary">
                Belum ada komentar. Jadilah yang pertama!
              </p>
            ) : (
              <div className="space-y-3">
                {(detail?.komentar ?? []).map((k) => (
                  <div key={k.id_komentar} className="flex gap-2.5">
                    <AvatarWarga nama={k.nama_penulis || '?'} size={8} />
                    <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-text-disabled/8 px-3.5 py-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-text-primary">{k.nama_penulis || 'Warga'}</p>
                        <span className="shrink-0 text-[10px] text-text-secondary">{timeAgo(k.created_at)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-text-primary">{renderRich(k.komentar)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-end gap-2 border-t border-border pt-4">
              <div className="min-w-0 flex-1">
                <MentionArea
                  value={komentar}
                  onChange={setKomentar}
                  namaWarga={namaWarga}
                  placeholder="@sebut atau balas…"
                  rows={1}
                />
              </div>
              <button
                type="button"
                disabled={!komentar.trim() || komenLoading}
                onClick={kirimKomentar}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25 transition-transform active:scale-95 disabled:opacity-40"
                aria-label="Kirim komentar"
              >
                <Icon name="send" size={18} />
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Drawer buat thread */}
      <Drawer open={openBuat} onClose={() => setOpenBuat(false)} title="Buat thread baru" subtitle="Tulis pertanyaan atau kabar untuk warga satu RT">
        <div className="space-y-4">
          {canAnnounce && (
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-text-disabled/8 p-1">
              {(['Diskusi', 'Pengumuman'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setTipe(o)}
                  className={cn(
                    'h-11 rounded-xl text-sm font-semibold transition-all',
                    tipe === o ? 'bg-surface-card text-primary shadow' : 'text-text-secondary'
                  )}
                >
                  {o === 'Pengumuman' ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="megaphone" size={14} /> Pengumuman
                    </span>
                  ) : (
                    o
                  )}
                </button>
              ))}
            </div>
          )}
          <div>
            <label htmlFor="judul-thread" className="mb-1.5 block text-xs font-semibold text-text-secondary">
              JUDUL
            </label>
            <input
              id="judul-thread"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              maxLength={120}
              placeholder="Ringkas topiknya…"
              className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">
              ISI — ketik <span className="text-primary">@</span> untuk menyebut warga
            </label>
            <MentionArea value={konten} onChange={setKonten} namaWarga={namaWarga} placeholder="Ceritakan detailnya…" rows={5} />
          </div>
          {pesan && <p className="text-sm text-danger">{pesan}</p>}
          <button
            type="button"
            disabled={kirim}
            onClick={kirimThread}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-semibold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {kirim ? 'Mengirim…' : 'Kirim ke Forum'}
            <Icon name="send" size={16} />
          </button>
        </div>
      </Drawer>
    </>
  )
}
