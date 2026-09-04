export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-text-secondary">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      </div>
    </div>
  )
}
