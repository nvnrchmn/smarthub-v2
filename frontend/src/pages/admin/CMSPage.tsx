import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Skeleton } from '../../components/ui/bento'

export function AdminCMSPage() {
  const [sections, setSections] = useState<Record<string, any>>({})
  const [activeSection, setActiveSection] = useState<string>('hero')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api('/cms/landing')
      setSections(res)
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data CMS')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateField = (path: string, value: any) => {
    const newSections = { ...sections }
    const keys = path.split('.')
    let current = newSections[activeSection]
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    setSections(newSections)
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api(`/cms/landing/${activeSection}`, {
        method: 'PUT',
        body: JSON.stringify(sections[activeSection])
      })
      setSuccess('Perubahan berhasil disimpan')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const sectionNames: Record<string, string> = {
    hero: 'Hero',
    features: 'Fitur',
    pricing: 'Harga',
    faq: 'FAQ',
    testimonials: 'Testimoni',
    footer: 'Footer'
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">CMS Landing Page</h1>
        <p className="text-sm text-text-secondary">Edit konten landing page</p>
      </header>

      {error && (
        <div className="mb-4 rounded-xl bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl bg-success/10 p-4 text-sm text-success">
          {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <div className="space-y-1">
          {Object.keys(sectionNames).map(key => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeSection === key
                  ? 'bg-primary font-medium text-white'
                  : 'text-text-secondary hover:bg-text-disabled/10'
              }`}
            >
              {sectionNames[key]}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="rounded-2xl border border-border bg-surface-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {sectionNames[activeSection]}
          </h2>

          {activeSection === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Badge</label>
                <input
                  type="text"
                  value={sections.hero?.badge || ''}
                  onChange={e => updateField('badge', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Title</label>
                <input
                  type="text"
                  value={sections.hero?.title || ''}
                  onChange={e => updateField('title', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Subtitle</label>
                <textarea
                  value={sections.hero?.subtitle || ''}
                  onChange={e => updateField('subtitle', e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">CTA Primary</label>
                  <input
                    type="text"
                    value={sections.hero?.cta_primary || ''}
                    onChange={e => updateField('cta_primary', e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">CTA Secondary</label>
                  <input
                    type="text"
                    value={sections.hero?.cta_second || ''}
                    onChange={e => updateField('cta_second', e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'features' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Section Title</label>
                <input
                  type="text"
                  value={sections.features?.title || ''}
                  onChange={e => updateField('title', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Section Subtitle</label>
                <input
                  type="text"
                  value={sections.features?.subtitle || ''}
                  onChange={e => updateField('subtitle', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              {(sections.features?.items || []).map((item: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-border p-4">
                  <p className="mb-2 text-sm font-medium">Feature {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.icon || ''}
                      onChange={e => {
                        const newItems = [...sections.features.items]
                        newItems[idx] = { ...newItems[idx], icon: e.target.value }
                        updateField('items', newItems)
                      }}
                      placeholder="Icon"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={e => {
                        const newItems = [...sections.features.items]
                        newItems[idx] = { ...newItems[idx], title: e.target.value }
                        updateField('items', newItems)
                      }}
                      placeholder="Title"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    />
                  </div>
                  <textarea
                    value={item.desc || ''}
                    onChange={e => {
                      const newItems = [...sections.features.items]
                      newItems[idx] = { ...newItems[idx], desc: e.target.value }
                      updateField('items', newItems)
                    }}
                    placeholder="Description"
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 'pricing' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Section Title</label>
                <input
                  type="text"
                  value={sections.pricing?.title || ''}
                  onChange={e => updateField('title', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Section Subtitle</label>
                <input
                  type="text"
                  value={sections.pricing?.subtitle || ''}
                  onChange={e => updateField('subtitle', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              {(sections.pricing?.items || []).map((item: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-border p-4">
                  <p className="mb-2 text-sm font-medium">Paket {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.name || ''}
                      onChange={e => {
                        const newItems = [...sections.pricing.items]
                        newItems[idx] = { ...newItems[idx], name: e.target.value }
                        updateField('items', newItems)
                      }}
                      placeholder="Nama Paket"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={item.price || ''}
                      onChange={e => {
                        const newItems = [...sections.pricing.items]
                        newItems[idx] = { ...newItems[idx], price: e.target.value }
                        updateField('items', newItems)
                      }}
                      placeholder="Harga"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    value={item.unit || ''}
                    onChange={e => {
                      const newItems = [...sections.pricing.items]
                      newItems[idx] = { ...newItems[idx], unit: e.target.value }
                      updateField('items', newItems)
                    }}
                    placeholder="Unit (per rumah/bulan)"
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                  <textarea
                    value={(item.features || []).join(', ')}
                    onChange={e => {
                      const newItems = [...sections.pricing.items]
                      newItems[idx] = { ...newItems[idx], features: e.target.value.split(',').map((s: string) => s.trim()) }
                      updateField('items', newItems)
                    }}
                    placeholder="Features (comma separated)"
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                  <label className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.highlighted || false}
                      onChange={e => {
                        const newItems = [...sections.pricing.items]
                        newItems[idx] = { ...newItems[idx], highlighted: e.target.checked }
                        updateField('items', newItems)
                      }}
                    />
                    <span className="text-sm">Highlighted</span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'faq' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Section Title</label>
                <input
                  type="text"
                  value={sections.faq?.title || ''}
                  onChange={e => updateField('title', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              {(sections.faq?.items || []).map((item: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-border p-4">
                  <p className="mb-2 text-sm font-medium">FAQ {idx + 1}</p>
                  <input
                    type="text"
                    value={item.q || ''}
                    onChange={e => {
                      const newItems = [...sections.faq.items]
                      newItems[idx] = { ...newItems[idx], q: e.target.value }
                      updateField('items', newItems)
                    }}
                    placeholder="Question"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                  <textarea
                    value={item.a || ''}
                    onChange={e => {
                      const newItems = [...sections.faq.items]
                      newItems[idx] = { ...newItems[idx], a: e.target.value }
                      updateField('items', newItems)
                    }}
                    placeholder="Answer"
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 'testimonials' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Section Title</label>
                <input
                  type="text"
                  value={sections.testimonials?.title || ''}
                  onChange={e => updateField('title', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              {(sections.testimonials?.items || []).map((item: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-border p-4">
                  <p className="mb-2 text-sm font-medium">Testimoni {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.name || ''}
                      onChange={e => {
                        const newItems = [...sections.testimonials.items]
                        newItems[idx] = { ...newItems[idx], name: e.target.value }
                        updateField('items', newItems)
                      }}
                      placeholder="Name"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={item.role || ''}
                      onChange={e => {
                        const newItems = [...sections.testimonials.items]
                        newItems[idx] = { ...newItems[idx], role: e.target.value }
                        updateField('items', newItems)
                      }}
                      placeholder="Role"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    />
                  </div>
                  <textarea
                    value={item.text || ''}
                    onChange={e => {
                      const newItems = [...sections.testimonials.items]
                      newItems[idx] = { ...newItems[idx], text: e.target.value }
                      updateField('items', newItems)
                    }}
                    placeholder="Testimonial text"
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 'footer' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Copyright</label>
                <input
                  type="text"
                  value={sections.footer?.copyright || ''}
                  onChange={e => updateField('copyright', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Links (JSON)</label>
                <textarea
                  value={JSON.stringify(sections.footer?.links || [], null, 2)}
                  onChange={e => {
                    try {
                      updateField('links', JSON.parse(e.target.value))
                    } catch {}
                  }}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}