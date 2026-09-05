import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../ui/Icon'
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

interface Komentar {
  id_komentar: number
  id_thread: number
  id_user: number
  komentar: string
  created_at: string
  nama_penulis?: string
}

export function ForumDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()

  const [thread, setThread] = useState<Thread | null>(null)
  const [komentar, setKomentar] = useState<Komentar[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [namaWarga, setNamaWarga] = useState<NamaWarga[]>([])
  const [teks, setTeks] = useState('')
  const [kirim, setKirim] = useState(false)

  const muat = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const d = await api<{ thread: Thread; komentar: Komentar[] }>(`/forum/${id}`)
      setThread(d.thread)
      setKomentar(d.komentar)
      setErr('')
    } catch {
      setErr('Postingan tidak ditemukan atau gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    muat()
    api<Array<{ id_user: number | null; nama_lengkap: string }>>('/warga')
      .then((rows) => setNamaWarga(rows.filter((r) => r.id_user && r.nama_lengkap).map((r) => ({ id_user: Number(r.id_user), nama_lengkap: r.nama_lengkap }))))
      .catch(() => {})
  }, [muat])

  const balas = async () => {
    if (!thread || !teks.trim() || !id) return
    setKirim(true)
    try {
      await api(`/forum/${id}/komentar`, { method: 'POST', body: JSON.stringify({ komentar: teks.trim() }) })
      setTeks('')
      const d = await api<{ thread: Thread; komentar: Komentar[] }>(`/forum/${id}`)
      setThread(d.thread)
      setKomentar(d.komentar)
    } catch {
      setErr('Gagal mengirim komentar.')
    } finally {
      setKirim(false)
    }
  }

  const roleLabel = user?.role === 'ketua_rt' ? 'Pengurus RT' : user?.role === 'super_admin' ? 'Administrator' : 'Warga'
  const penulis = thread?.nama_penulis || (thread && thread.id_user_pembuat === user?.id ? roleLabel : thread ? 'Warga' : '')

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pt-3">
      <header className="sticky top-0 z-10 -mx-4 mb-2 flex items-center gap-2 bg-surface px-4 py-2">
        <button
          type="button"
          onClick={() => nav(-1)}
          aria-label="Kembali"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-card text-text-secondary active:scale-95"
        >
          <Icon name="chevron" size={18} className="-rotate-90" />
        </button>
        <h1 className="text-base font-bold text-text-primary">Forum</h1>
      </header>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-16 rounded-2xl" />
          <div className="skeleton h-44 rounded-2xl" />
        </div>
      ) : err || !thread ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-danger">{err || 'Tidak ditemukan.'}</div>
      ) : (
        <>
          <div className={cn('rounded-2xl border border-border bg-surface-card p-4', thread.tipe_thread === 'Pengumuman' && 'border-l-4 border-l-primary')}>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ background: warnaInisial(penulis) }}>
                {inisial(penulis)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{penulis}</p>
                <p className="text-xs text-text-secondary">{timeAgo(thread.created_at)}</p>
              </div>
              {thread.tipe_thread === 'Pengumuman' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <Icon name="megaphone" size={12} /> Pengumuman
                </span>
              )}
            </div>
            <h2 className="mt-3 text-lg font-bold leading-snug text-text-primary">{thread.judul}</h2>
            <div className="mt-2 text-[15px] leading-relaxed text-text-secondary">{renderRich(thread.konten)}</div>
            {thread.foto_url && /^(https?:\/\/|\/)/.test(thread.foto_url) && (
              <img src={thread.foto_url} alt={thread.judul} className="mt-3 max-h-[28rem] w-full rounded-xl border border-border object-cover" />
            )}
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Icon name="chat" size={14} /> {komentar.length} komentar
            </p>
          </div>

          {komentar.length > 0 ? (
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface-card px-4">
              {komentar.map((k) => {
                const nama = k.nama_penulis || 'Warga'
                return (
                  <li key={k.id_komentar} className="flex gap-3 py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: warnaInisial(nama) }}>
                      {inisial(nama)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-secondary">
                        <span className="font-semibold text-text-primary">{nama}</span> · {timeAgo(k.created_at)}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-text-primary">{renderRich(k.komentar)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-text-secondary">
              Belum ada komentar — jadi yang pertama menanggapi.
            </div>
          )}

          <div className="sticky bottom-24 z-10 mt-4 flex items-end gap-2 rounded-2xl border border-border bg-surface-card p-2 shadow-lg">
            <div className="min-w-0 flex-1 rounded-xl bg-surface px-1">
              <MentionArea value={teks} onChange={setTeks} namaWarga={namaWarga} rows={1} placeholder="Tulis komentar… ketik @ untuk menyebut" />
            </div>
            <button
              type="button"
              onClick={balas}
              disabled={kirim || !teks.trim()}
              aria-label="Kirim komentar"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white transition active:scale-95 disabled:opacity-40"
            >
              <Icon name="send" size={17} />
            </button>
          </div>
          <div className="h-4" />
        </>
      )}
    </div>
  )
}
