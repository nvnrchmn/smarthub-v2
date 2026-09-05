// Unggah file (multipart) ke endpoint /upload — token dari localStorage.
export async function uploadFoto(file: File): Promise<string> {
  const token = localStorage.getItem('token')
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Gagal mengunggah foto')
  return data.url as string
}
