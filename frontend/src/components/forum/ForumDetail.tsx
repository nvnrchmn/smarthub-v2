import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Icon } from '../ui/Icon'

import { MentionArea, renderRich, timeAgo, inisial, warnaInisial } from './mention'

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
  parent_komentar_id?: number | null
  foto_url?: string | null
}

export function ForumDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [thread, setThread] = useState<Thread | null>(null)
  const [komentar, setKomentar] = useState<Komentar[]>([])
  const [teks, setTeks] = useState('')
  const [busy, setBusy] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<Komentar | null>(null)

  const load = useCallback(() => {
    if (!id) return
    api<{ thread: Thread; komentar: Komentar[] }>(`/forum/${id}`)
      .then(d => { setThread(d.thread); setKomentar(d.komentar) })
      .catch(() => toast('Gagal memuat thread', 'error'))
  }, [id])

  const loadWarga = useCallback(() => {
  }, [])

  useEffect(() => { load(); loadWarga() }, [load, loadWarga])

  const submit = async () => {
    if (!teks.trim() || busy || !id) return
    setBusy(true)
    try {
      const payload: any = { komentar: teks }
      if (replyTo) payload.parent_komentar_id = replyTo.id_komentar
      await api(`/forum/${id}/komentar`, { method: 'POST', body: JSON.stringify(payload) })
      setTeks('')
      setReplyTo(null)
      load()
      toast('Komentar terkirim')
    } catch {
      toast('Gagal mengirim komentar', 'error')
    } finally { setBusy(false) }
  }

  const hapusKomentar = async (idKomentar: number) => {
    if (!id) return
    try {
      await api(`/forum/${id}/komentar/${idKomentar}`, { method: 'DELETE' })
      load()
      toast('Komentar dihapus')
    } catch { toast('Gagal menghapus', 'error') }
  }

  // Build tree for nested replies
  const tree = useMemo(() => {
    const map = new Map<number, Komentar & { children: Komentar[] }>()
    const roots: (Komentar & { children: Komentar[] })[] = []
    for (const k of komentar) map.set(k.id_komentar, { ...k, children: [] })
    for (const k of komentar) {
      const node = map.get(k.id_komentar)!
      if (k.parent_komentar_id && map.has(k.parent_komentar_id)) {
        map.get(k.parent_komentar_id)!.children.push(node)
      } else {
        roots.push(node)
      }
    }
    return roots
  }, [komentar])

  const renderKomentar = (k: Komentar & { children: Komentar[] }, depth: number = 0) => {
    const isOwner = user?.id === k.id_user
    return (
      <li key={k.id_komentar} className={cn('relative', depth > 0 && 'ml-8')}>
        {depth > 0 && <span className="absolute -left-4 top-0 bottom-0 w-[2px] bg-border/40" />}
        <div className="flex items-start gap-3 py-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: warnaInisial(k.nama_penulis || '') }}>{inisial(k.nama_penulis || '')}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">{k.nama_penulis || 'Warga'}</span>
              <span className="text-[11px] text-text-secondary">{timeAgo(k.created_at)}</span>
            </div>
            <p className="mt-0.5 text-sm text-text-primary whitespace-pre-wrap">{renderRich(k.komentar)}</p>
            {k.foto_url && <img src={k.foto_url} alt="Foto" className="mt-2 max-h-48 rounded-xl object-cover cursor-pointer" onClick={() => setLightbox(k.foto_url!)} />}
            <div className="mt-1 flex items-center gap-3">
              <button onClick={() => setReplyTo(k)} className="text-[11px] text-text-secondary hover:text-primary">Balas</button>
              {isOwner && <button onClick={() => hapusKomentar(k.id_komentar)} className="text-[11px] text-danger hover:text-red-700">Hapus</button>}
            </div>
          </div>
        </div>
        {k.children.length > 0 && (
          <ul className="ml-6 border-l-2 border-border/30 pl-3">
            {(k as any).children?.map((child: any) => renderKomentar(child, depth + 1)) || []}
          </ul>
        )}
      </li>
    )
  }

  if (!thread) return <div className="p-4"><div className="h-40 rounded-2xl bg-text-disabled/10 animate-pulse" /></div>

  return (
    <div className="mx-auto max-w-xl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => nav(-1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-text-disabled/10"><Icon name="arrow" size={18} /></button>
        <h1 className="text-lg font-bold text-text-primary truncate">Forum</h1>
      </div>

      <div className="px-4 pb-24">
        {/* Thread */}
        <div className="py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: warnaInisial(thread.nama_penulis || '') }}>{inisial(thread.nama_penulis || '')}</div>
            <div>
              <p className="font-semibold text-text-primary">{thread.nama_penulis || 'Warga'}</p>
              <p className="text-[11px] text-text-secondary">{timeAgo(thread.created_at)}</p>
            </div>
            {thread.tipe_thread === 'Pengumuman' && <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Pengumuman</span>}
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">{thread.judul}</h2>
          <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{renderRich(thread.konten)}</p>
          {thread.foto_url && <img src={thread.foto_url} alt="Foto" className="mt-3 max-h-64 w-full rounded-xl object-cover cursor-pointer" onClick={() => setLightbox(thread.foto_url!)} />}
        </div>

        <div className="border-t border-border/50 pt-2 mb-4">
          <p className="text-xs text-text-secondary font-medium">{komentar.length} komentar</p>
        </div>

        {/* Komentar */}
        <ul className="divide-y divide-border/30">
          {tree.map(k => renderKomentar(k))}
        </ul>
        {komentar.length === 0 && <p className="py-8 text-center text-sm text-text-secondary">Belum ada komentar</p>}
      </div>

      {/* Input fixed di bawah */}
      <div className="fixed bottom-20 left-0 right-0 z-20 border-t border-border bg-surface px-4 py-3">
        {replyTo && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1.5 text-xs text-text-secondary">
            <Icon name="chat" size={12} className="text-primary" />
            <span>Membalas <b>{replyTo.nama_penulis || 'Warga'}</b></span>
            <button onClick={() => setReplyTo(null)} className="ml-auto text-danger"><Icon name="x" size={14} /></button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MentionArea value={teks} onChange={setTeks} namaWarga={[]} placeholder={replyTo ? `Balas ${replyTo.nama_penulis}...` : 'Tulis komentar...'} rows={1} className="min-h-[36px] flex-1 resize-none rounded-full border border-border bg-surface-card px-4 py-2 text-sm" />
          <button onClick={submit} disabled={!teks.trim() || busy} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white disabled:opacity-40"><Icon name="send" size={16} /></button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white"><Icon name="x" size={24} /></button>
          <img src={lightbox} alt="Foto" className="max-h-[90vh] max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  )
}
