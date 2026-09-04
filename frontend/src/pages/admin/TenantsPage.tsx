import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { EmptyState, Skeleton } from '../../components/ui/bento'

interface Tenant {
  ID: number
  NamaRTRW: string
  DesaKelurahan: string
  Kecamatan: string
  KabupatenKota: string
  Provinsi: string
  StatusBerlanggan: string
}

export function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/admin/tenants')
      .then((d) => setTenants(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Tenants</h1>
        <p className="text-xs text-text-secondary">Daftar RT/RW yang berlangganan</p>
      </header>
      {loading && <div className="space-y-2.5"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>}
      {!loading && tenants.length === 0 && (
        <EmptyState icon="building" title="Belum ada tenant" desc="RT/RW yang berlangganan akan muncul di sini." />
      )}
      <div className="space-y-3">
        {tenants.map((t) => (
          <div key={t.ID} className="rounded-2xl bg-surface-card p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-text-primary">{t.NamaRTRW}</p>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${t.StatusBerlanggan === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.StatusBerlanggan}</span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">{t.DesaKelurahan}, {t.Kecamatan}, {t.KabupatenKota}, {t.Provinsi}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
