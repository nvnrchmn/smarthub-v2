import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { EmptyState, Skeleton } from '../../components/ui/bento'

interface UserRow {
  id_user: number
  id_tenant: number
  nomor_wa: string
  role: string
  is_active: boolean
}

const roleBadge: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  ketua_rt: 'bg-blue-100 text-blue-700',
  warga: 'bg-gray-100 text-gray-700',
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/admin/users')
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-text-primary">Users</h1>
        <p className="text-xs text-text-secondary">Semua akun pengguna</p>
      </header>
      {loading && <div className="space-y-2.5"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>}
      {!loading && users.length === 0 && (
        <EmptyState icon="users" title="Belum ada pengguna" desc="Akun pengguna akan tampil di sini." />
      )}
      {!loading && users.length > 0 && (
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
        <table className="w-full text-sm">
          <thead className="bg-text-disabled/10 text-left text-xs text-text-secondary">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nomor WA</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Tenant</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id_user} className="border-t border-border">
                <td className="px-4 py-2">{u.id_user}</td>
                <td className="px-4 py-2">{u.nomor_wa}</td>
                <td className="px-4 py-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${roleBadge[u.role] || 'bg-gray-100'}`}>{u.role}</span></td>
                <td className="px-4 py-2">{u.id_tenant}</td>
                <td className="px-4 py-2">{u.is_active ? 'Aktif' : 'Nonaktif'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
