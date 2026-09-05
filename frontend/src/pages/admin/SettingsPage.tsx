import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { PanelPengaturan } from '../../components/settings/PanelPengaturan'
import { Icon } from '../../components/ui/Icon'

interface XenditStatus {
  xendit_secret_key_set: boolean
  xendit_secret_key_masked: string
  xendit_webhook_token_set: boolean
  xendit_webhook_token_masked: string
}

export function SettingsPage() {
  const [st, setSt] = useState<XenditStatus | null>(null)
  const [secret, setSecret] = useState('')
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = async () => {
    try {
      const r = await api<XenditStatus>('/admin/settings')
      setSt(r)
    } catch { /* server belum punya endpoint? abaikan */ }
  }

  useEffect(() => { void load() }, [])

  const save = async () => {
    if (!secret && !token) return
    setBusy(true)
    setMsg(null)
    try {
      const j = await api<{ message?: string; saved?: number }>('/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xendit_secret_key: secret, xendit_webhook_token: token }),
      })
      setMsg({ ok: true, text: j.message ?? 'Kredensial disimpan.' })
      setSecret('')
      setToken('')
      await load()
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Gagal menyimpan kredensial.' })
    } finally {
      setBusy(false)
    }
  }

  const field = 'h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-text-primary placeholder:text-ph focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none'

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Pengaturan</h1>
        <p className="text-sm text-text-secondary">Konfigurasi aplikasi &amp; preferensi akun.</p>
      </header>

      {/* Pembayaran Xendit */}
      <section className="rounded-2xl border border-border bg-surface-card p-5">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="wallet" size={18} />
          <h2 className="font-semibold text-text-primary">Pembayaran — Xendit</h2>
        </div>
        <p className="mb-4 text-xs text-text-secondary">
          Kunci server &amp; token callback disimpan terenkripsi dan dipakai saat membuat invoice
          iuran. Ambil dari Dashboard Xendit → Pengaturan → Kunci API.
        </p>

        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-text-secondary">
            <span className={'h-1.5 w-1.5 rounded-full ' + (st?.xendit_secret_key_set ? 'bg-emerald-500' : 'bg-amber-500')} />
            Server Key {st?.xendit_secret_key_set ? '· ' + st.xendit_secret_key_masked : '· belum di-set'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-text-secondary">
            <span className={'h-1.5 w-1.5 rounded-full ' + (st?.xendit_webhook_token_set ? 'bg-emerald-500' : 'bg-amber-500')} />
            Callback Token {st?.xendit_webhook_token_set ? '· ' + st.xendit_webhook_token_masked : '· belum di-set'}
          </span>
        </div>

        <label className="mb-1 mt-3 block text-xs font-medium text-text-secondary">Xendit Secret Key</label>
        <input
          type="password"
          className={field}
          placeholder={st?.xendit_secret_key_set ? 'Ketik untuk mengganti key tersimpan…' : 'xnd_development_…'}
          value={secret}
          autoComplete="new-password"
          onChange={(e) => setSecret(e.target.value)}
        />

        <label className="mb-1 mt-3 block text-xs font-medium text-text-secondary">Xendit Callback Token (X-Callback-Token)</label>
        <input
          type="password"
          className={field}
          placeholder={st?.xendit_webhook_token_set ? 'Ketik untuk mengganti token tersimpan…' : 'Token verifikasi webhook'}
          value={token}
          autoComplete="new-password"
          onChange={(e) => setToken(e.target.value)}
        />

        {msg && (
          <p className={'mt-3 rounded-xl px-3 py-2 text-sm ' + (msg.ok ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600')}>
            {msg.text}
          </p>
        )}

        <button
          onClick={save}
          disabled={busy || (!secret && !token)}
          className="mt-4 h-12 w-full rounded-xl bg-primary text-white font-semibold transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? 'Menyimpan…' : 'Simpan Kredensial Xendit'}
        </button>
      </section>

      <div className="h-4" />
      <PanelPengaturan />
    </div>
  )
}