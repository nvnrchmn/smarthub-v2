import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Icon } from '../../components/ui/Icon'
import { BentoCard, ErrorState, Skeleton } from '../../components/ui/bento'

interface SettlementInfo {
  nama_pemilik_rekening: string
  bank_code: string
  nomor_rekening: string
  ktp_url: string
  ktp_verified: boolean
  xendit_kyc_status: string
  nama_rt_rw: string
  alamat: string
}

const BANK_OPTIONS = [
  { value: 'BCA', label: 'BCA' },
  { value: 'BRI', label: 'BRI' },
  { value: 'BNI', label: 'BNI' },
  { value: 'MANDIRI', label: 'Mandiri' },
  { value: 'CIMB', label: 'CIMB Niaga' },
  { value: 'DANAMON', label: 'Danamon' },
]

export function SettlementPage() {
  const [info, setInfo] = useState<SettlementInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ nama_pemilik: '', bank_code: '', nomor_rekening: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api<any>('/settlement/info')
      setInfo(res)
      setForm({
        nama_pemilik: res.nama_pemilik_rekening || '',
        bank_code: res.bank_code || '',
        nomor_rekening: res.nomor_rekening || ''
      })
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data settlement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveRekening = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api('/settlement/rekening', {
        method: 'POST',
        body: JSON.stringify({
          nama_pemilik: form.nama_pemilik,
          bank_code: form.bank_code,
          nomor_rekening: form.nomor_rekening
        })
      })
      setSuccess('Data rekening berhasil disimpan')
      load()
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan data rekening')
    } finally {
      setSaving(false)
    }
  }

  const statusKYC = info?.xendit_kyc_status || 'PENDING'
  const statusLabel = statusKYC === 'LIVE' ? 'Terverifikasi' : statusKYC === 'REJECTED' ? 'Ditolak' : 'Menunggu Verifikasi'
  const statusColor = statusKYC === 'LIVE' ? 'text-emerald-500' : statusKYC === 'REJECTED' ? 'text-red-500' : 'text-amber-500'

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Settlement & Rekening</h1>
        <p className="mt-1 text-sm text-text-secondary">Kelola data rekening untuk penerimaan dana iuran</p>
      </header>

      {error && <ErrorState message={error} />}
      {success && <div className="mb-4 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-500">{success}</div>}

      <div className="space-y-4">
        {/* Status KYC */}
        <BentoCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text-primary">Status Verifikasi</h2>
              <p className="mt-1 text-sm text-text-secondary">{info?.nama_rt_rw || 'Tenant'}</p>
            </div>
            <span className={`text-sm font-semibold ${statusColor}`}>{statusLabel}</span>
          </div>
        </BentoCard>

        {/* Form Rekening */}
        <BentoCard className="p-5">
          <h2 className="font-semibold text-text-primary mb-4">Data Rekening</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Nama Pemilik Rekening</label>
              <input
                type="text"
                value={form.nama_pemilik}
                onChange={(e) => setForm({ ...form, nama_pemilik: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                placeholder="Nama sesuai buku tabungan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Bank</label>
              <select
                value={form.bank_code}
                onChange={(e) => setForm({ ...form, bank_code: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Pilih Bank</option>
                {BANK_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Nomor Rekening</label>
              <input
                type="text"
                value={form.nomor_rekening}
                onChange={(e) => setForm({ ...form, nomor_rekening: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                placeholder="Masukkan nomor rekening"
              />
            </div>

            <button
              onClick={saveRekening}
              disabled={saving || !form.nama_pemilik || !form.bank_code || !form.nomor_rekening}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan Data Rekening'}
            </button>
          </div>
        </BentoCard>

        {/* Info */}
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <div className="flex items-start gap-3">
            <Icon name="info" size={18} className="text-text-secondary mt-0.5" />
            <div className="text-sm text-text-secondary">
              <p className="font-medium text-text-primary mb-1">Proses Settlement</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Isi data rekening dan upload KTP di sini</li>
                <li>Super Admin akan memverifikasi data Anda</li>
                <li>Setelah terverifikasi, dana iuran masuk ke rekening Anda</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
