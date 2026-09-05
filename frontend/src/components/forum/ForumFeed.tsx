import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../ui/Icon'
import { Drawer } from '../ui/Drawer'
import { FotoField } from '../ui/FotoField'
import { MentionArea, renderRich, timeAgo, inisial, warnaInisial, type NamaWarga } from './mention'

interface Thread {
  id_thread: number
  id_user_pembuat: number
  tipe_thread: string
  judul: string
  konten: string
  foto_url?: string | null
  created_at: string
  nama_penulis?: string
  komentar_count?: number
}

interface Notif {
  id_notifikasi: number
  tipe: string
  id_ref: number | null
  pesan: string
  created_at: string
}

interface Props {
  canAnnounce: boolean
  basePath: string
}

export function ForumFeed({ canAnnounce, basePath }: Props) {
  const nav = useNavigate()
  const { user } = useAuth()

  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [namaWarga, setNamaWarga] = useState<NamaWarga[]>([])

  const [openBuat, setOpenBuat] = useState(false)
  const [tipe, setTipe] = useState('Diskusi')
  const [judul, setJudul] = useState('')
  const [konten, setKonten] = useState('')
  const [foto, setFoto] = useState('')
  const [kirim, setKirim] = useState(false)
  const [pesan, setPesan] = useState('')

  const [notifList, setNotifList] = useState<Notif[]>([])
  const [notifUnread, setNotifUnread] = useState(0)
  const [openNotif, setOpenNotif] = useState(false)

  const muat = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api<Thread[]>('/forum')
      setThreads(data)
      setErr('')
    } catch {
      setErr('Gagal memuat forum.')
    } finally {
      setLoading(false)
    }
  }, [])

  const muatNotif = useCallback(async () => {
    try {
      const d = await api<{ list: Notif[]; unread: number }>('/notifikasi')
      setNotifList(d.list)
      setNotifUnread(d.unread)
    } catch {
      /* abaikan */
    }
  }, [])

  useEffect(() => {
    muat()
    muatNotif()
    api<Array<{ id_user: number | null; nama_lengkap: string }>>('/warga')
      .then((rows) =>
        setNamaWarga(rows.filter((r) => r.id_user && r.nama_lengkap).map((r) => ({ id_user: Number(r.id_user), nama_lengkap: r.nama_lengkap })))
      )
      .catch(() => {})
  }, [muat, muatNotif])

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

  const kirimThread = async () => {
    if (!judul.trim() || !konten.trim()) {
      setPesan('Judul dan isi harus diisi.')
      return
    }
    setKirim(true)
    setPesan('')
    try {
      await api('/forum', {
        method: 'POST',
        body: JSON.stringify({ judul: judul.trim(), konten: konten.trim(), tipe_thread: tipe, foto_url: foto || '' }),
      })
      setOpenBuat(false)
      setJudul('')
      setKonten('')
      setTipe('Diskusi')
      setFoto('')
      muat()
      muatNotif()
    } catch {
      setPesan('Gagal mengirim. Coba lagi.')
    } finally {
      setKirim(false)
    }
  }

  const bukaNotif = async () => {
    setOpenNotif(true)
    try {
      const d = await api<{ list: Notif[]; unread: number }>('/notifikasi')
      setNotifList(d.list)
      if (d.unread > 0) {
        await api('/notifikasi/read-all', { method: 'PUT' })
        setNotifUnread(0)
      }
    } catch {
      /* abaikan */
    }
  }

  const bukaDariNotif = (n: Notif) => {
    setOpenNotif(false)
    if (n.id_ref) nav(`${basePath}/${n.id_ref}`)
  }

  return (
    <>
      <div className="flex items-center justify-between pb-1">
        <p className="text-sm text-text-secondary">Ayo ngobrol &amp; berbagi info dengan tetangga</p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={bukaNotif}
            aria-label="Notifikasi"
            className="relative grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface-card text-text-secondary transition-transform active:scale-95"
          >
            <Icon name="bell" size={19} />
            {notifUnread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {notifUnread > 9 ? '9+' : notifUnread}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setPesan('')
              setOpenBuat(true)
            }}
            className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25 transition-transform active:scale-95"
            aria-label="Buat thread"
          >
            <Icon name="plus" size={20} />
          </button>
        </div>
      </div>

      {err && (
        <div className="mt-3 rounded-2xl border border-border bg-surface-card p-4 text-sm text-danger">
          {err}
          <button type="button" onClick={() => void muat()} className="ml-2 font-semibold underline">
            Muat ulang
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : daftar.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold text-text-primary">Belum ada diskusi</p>
          <p className="mt-1 text-sm text-text-secondary">Jadilah yang pertama mengobrol dengan tetangga.</p>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {daftar.map((t) => (
            <li key={t.id_thread}>
              <button
                type="button"
                onClick={() => nav(`${basePath}/${t.id_thread}`)}
                className={cn(
                  'w-full rounded-2xl border border-border bg-surface-card p-4 text-left shadow-sm transition-transform active:scale-[0.99]',
                  t.tipe_thread === 'Pengumuman' && 'border-l-4 border-l-primary'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ background: warnaInisial(t._penulis) }}
                  >
                    {inisial(t._penulis)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text-primary">{t._penulis}</span>
                    <span className="block text-xs text-text-secondary">{timeAgo(t.created_at)}</span>
                  </span>
                  {t.tipe_thread === 'Pengumuman' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      <Icon name="megaphone" size={12} /> Pengumuman
                    </span>
                  )}
                </div>
                <h2 className="mt-2.5 text-[15px] font-bold text-text-primary">{t.judul}</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">{renderRich(t.konten)}</p>
                {t.foto_url && /^(https?:\/\/|\/)/.test(t.foto_url) && (
                  <img src={t.foto_url} alt={t.judul} loading="lazy" className="mt-3 aspect-[4/3] w-full rounded-xl border border-border object-cover" />
                )}
                <span className="mt-3 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <Icon name="chat" size={14} /> {t.komentar_count ?? 0} komentar
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Compose */}
      <Drawer open={openBuat} onClose={() => setOpenBuat(false)} title="Buat postingan" subtitle="Bagikan kabar, tanya, atau info ke warga">
        <div className="space-y-4">
          {canAnnounce && (
            <div className="flex gap-2">
              {['Diskusi', 'Pengumuman'].map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setTipe(o)}
                  className={cn(
                    'h-11 flex-1 rounded-xl text-sm font-semibold transition-colors',
                    tipe === o ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'border border-border bg-surface text-text-secondary'
                  )}
                >
                  {o === 'Pengumuman' ? (
                    <span className="inline-flex items-center justify-center gap-1.5">
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
            <label htmlFor="fd-judul" className="mb-2 block text-[13px] font-semibold text-text-secondary">
              JUDUL
            </label>
            <input
              id="fd-judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Ringkasan singkat…"
              maxLength={120}
              className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-text-primary outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="fd-konten" className="mb-2 block text-[13px] font-semibold text-text-secondary">
              ISI
            </label>
            <div className="rounded-2xl border border-border bg-surface p-3 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
              <MentionArea value={konten} onChange={setKonten} namaWarga={namaWarga} rows={4} placeholder="Tulis… ketik @ untuk menyebut warga" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-text-secondary">FOTO</label>
            <FotoField value={foto} onChange={setFoto} />
          </div>
          {pesan && <p className="text-sm text-danger">{pesan}</p>}
          <button
            type="button"
            disabled={kirim}
            onClick={kirimThread}
            className="h-12 w-full rounded-2xl bg-primary font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            {kirim ? 'Mengirim…' : 'Kirim'}
          </button>
        </div>
      </Drawer>

      {/* Notifikasi */}
      <Drawer open={openNotif} onClose={() => setOpenNotif(false)} title="Notifikasi" subtitle="Sebutan @ di forum">
        {notifList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-semibold text-text-primary">Belum ada notifikasi</p>
            <p className="mt-1 text-sm text-text-secondary">Warga yang menyebut @Anda akan muncul di sini.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifList.map((n) => (
              <li key={n.id_notifikasi}>
                <button
                  type="button"
                  onClick={() => bukaDariNotif(n)}
                  className="flex w-full items-start gap-3 px-1 py-3 text-left transition-colors active:bg-text-disabled/8"
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon name={n.tipe === 'post' ? 'megaphone' : 'chat'} size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text-primary">{n.pesan}</span>
                    <span className="mt-0.5 block text-xs text-text-secondary">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </>
  )
}
