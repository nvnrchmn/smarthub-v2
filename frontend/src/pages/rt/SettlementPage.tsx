import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { fmt } from '../../lib/utils'
import { ErrorState, KPI, Skeleton } from '../../components/ui/bento'
import { Icon } from '../../components/ui/Icon'
import { Drawer } from '../../components/ui/Drawer'

interface SettlementRow {
  id_settlement: number
  requested_by: number
  total_nominal: number
  status: string
  created_at: string
}

interface SettlementTagihan {
  id_tagihan: number
  id_rumah: number
  periode_bulan_tahun: string
  total_nominal: number
  nama_warga: string
}

export function RTSettlementPage() {
  const [balance, setBalance] = useState(0)
  const [tagihan, setTagihan] = useState<SettlementTagihan[]>([])
  const [settlements, setSettlements] = useState<SettlementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRequest, setShowRequest] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api<{ total_balance: number; paid_tagihan: SettlementTagihan[] }>('/settlement/balance'),
      api<{ data: SettlementRow[] }>('/settlements')
    ])
      .then(([bal, list]) => {
        setBalance(bal.total_balance)
        setTagihan(bal.paid_tagihan || [])
        setSettlements(list.data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-xl font-bold text-text-primary">Settlement</h1>
        <p className="text-sm text-text-secondary">Cairkan dana tagihan warga yang sudah dibayar via QRIS</p>
      </header>

      {error && <ErrorState message={error} />}
      {loading ? <Skeleton className="h-32" /> : (
        <div className="grid grid-cols-2 gap-3">
          <KPI icon="wallet" label="Saldo Tersedia" value={fmt(balance)} tone="success" />
          <KPI icon="receipt" label="Tagihan Lunas" value={String(tagihan.length)} />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Tagihan Siap Cair</h2>
          <button
            onClick={() => setShowRequest(true)}
            disabled={balance === 0}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ajukan Settlement
          </button>
        </div>
        {tagihan.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
            <Icon name="inbox" size={24} className="mx-auto text-text-disabled" />
            <p className="mt-2 text-sm text-text-secondary">Belum ada tagihan lunas yang siap dicairkan</p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {tagihan.slice(0, 5).map(t => (
              <div key={t.id_tagihan} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-text-primary">{t.nama_warga}</p>
                  <p className="text-xs text-text-secondary">{t.periode_bulan_tahun}</p>
                </div>
                <span className="text-sm font-semibold text-status-paid">{fmt(t.total_nominal)}</span>
              </div>
            ))}
            {tagihan.length > 5 && <p className="text-center text-xs text-text-disabled">+{tagihan.length - 5} tagihan lainnya</p>}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-text-primary">Riwayat Settlement</h2>
        {settlements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-text-secondary">Belum ada riwayat settlement</p>
          </div>
        ) : (
          <div className="space-y-2">
            {settlements.map(s => (
              <div key={s.id_settlement} className="flex items-center justify-between rounded-xl border border-border bg-surface-card px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">Settlement #{s.id_settlement}</p>
                  <p className="text-xs text-text-secondary">{new Date(s.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">{fmt(s.total_nominal)}</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    s.status === 'COMPLETED' ? 'bg-status-paid-bg text-status-paid' :
                    s.status === 'REJECTED' ? 'bg-status-overdue-bg text-status-overdue' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer open={showRequest} onClose={() => setShowRequest(false)} title="Ajukan Settlement">
        <SettlementForm balance={tagihan.reduce((s, t) => s + Number(t.total_nominal), 0)} onSuccess={() => { setShowRequest(false); load() }} />
      </Drawer>
    </div>
  )
}

function SettlementForm({ balance, onSuccess }: { balance: number; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nama_pemilik: '', bank_code: '', nomor_rekening: '', note: '' })

  const submit = async () => {
    if (!form.nama_pemilik || !form.bank_code || !form.nomor_rekening) {
      setError('Semua field wajib diisi')
      return
    }
    setSubmitting(true)
    try {
      await api('/settlement/request', {
        method: 'POST',
        body: JSON.stringify({
          total_nominal: balance,
          bank_code: form.bank_code,
          account_number: form.nomor_rekening,
          account_name: form.nama_pemilik,
          note: form.note
        })
      })
      onSuccess()
    } catch (e: any) {
      setError(e.message || 'Gagal mengajukan settlement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-status-paid-bg/20 p-4 text-center">
        <p className="text-xs text-text-secondary">Total yang akan dicairkan</p>
        <p className="text-2xl font-bold text-status-paid">{fmt(balance)}</p>
      </div>

      {error && <p className="rounded-xl bg-status-overdue-bg p-3 text-sm text-status-overdue">{error}</p>}

      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Nama Pemilik Rekening</label>
        <input
          type="text"
          value={form.nama_pemilik}
          onChange={e => setForm({ ...form, nama_pemilik: e.target.value })}
          placeholder="Nama sesuai rekening"
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Bank</label>
        <select
          value={form.bank_code}
          onChange={e => setForm({ ...form, bank_code: e.target.value })}
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm"
        >
          <option value="">Pilih bank</option>
          <option value="BCA">BCA</option>
          <option value="BNI">BNI</option>
          <option value="BRI">BRI</option>
          <option value="MANDIRI">Mandiri</option>
          <option value="BRI">BRI</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Nomor Rekening</label>
        <input
          type="text"
          value={form.nomor_rekening}
          onChange={e => setForm({ ...form, nomor_rekening: e.target.value })}
          placeholder="1234567890"
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Catatan (opsional)</label>
        <input
          type="text"
          value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })}
          placeholder="Catatan untuk admin"
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm"
        />
      </div>

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? 'Mengajukan...' : 'Ajukan Settlement'}
      </button>
    </div>
  )
}
