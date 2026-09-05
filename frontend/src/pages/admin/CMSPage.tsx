import { useState } from 'react'
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

  useState(() => { load() })

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
    hero: 'Hero Section',
    features: 'Fitur',
    pricing: 'Harga',
    faq: 'FAQ',
    testimonials: 'Testimoni',
    footer: 'Footer'
  }

  const renderField = (label: string, path: string, type: 'text' | 'textarea' | 'html' = 'text') => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], sections[activeSection]) || ''
    
    if (type === 'textarea') {
      return (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
          <textarea
            value={value}
            onChange={(e) => updateField(path, e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      )
    }
    
    if (type === 'html') {
      return (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex gap-1 p-2 bg-surface-card border-b border-border">
              <button type="button" className="px-2 py-1 text-xs rounded hover:bg-text-disabled/10 font-bold">B</button>
              <button type="button" className="px-2 py-1 text-xs rounded hover:bg-text-disabled/10 italic">I</button>
              <button type="button" className="px-2 py-1 text-xs rounded hover:bg-text-disabled/10 underline">U</button>
              <button type="button" className="px-2 py-1 text-xs rounded hover:bg-text-disabled/10">H1</button>
              <button type="button" className="px-2 py-1 text-xs rounded hover:bg-text-disabled/10">H2</button>
              <button type="button" className="px-2 py-1 text-xs rounded hover:bg-text-disabled/10">•</button>
            </div>
            <textarea
              value={value}
              onChange={(e) => updateField(path, e.target.value)}
              rows={4}
              className="w-full bg-surface px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>
      )
    }
    
    return (
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => updateField(path, e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    )
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">CMS Landing Page</h1>
        <p className="text-sm text-text-secondary">Edit konten halaman publik</p>
      </header>

      {error && <div className="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-success/10 p-3 text-sm text-success">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-surface-card p-2">
            {Object.keys(sectionNames).map((key) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === key ? 'bg-primary text-white' : 'text-text-secondary hover:bg-text-disabled/10'
                }`}
              >
                {sectionNames[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-surface-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">{sectionNames[activeSection]}</h2>

            {activeSection === 'hero' && (
              <div className="space-y-4">
                {renderField('Badge', 'badge')}
                {renderField('Judul', 'title', 'html')}
                {renderField('Sub Judul', 'subtitle', 'textarea')}
                {renderField('CTA Primary Text', 'cta_primary')}
                {renderField('CTA Primary URL', 'cta_primary_url')}
                {renderField('CTA Secondary Text', 'cta_second')}
                {renderField('CTA Secondary URL', 'cta_second_url')}
              </div>
            )}

            {activeSection === 'features' && (
              <div className="space-y-4">
                {renderField('Judul Section', 'title')}
                {renderField('Sub Judul', 'subtitle', 'textarea')}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Items</label>
                  {(sections.features?.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="mb-3 p-3 rounded-lg border border-border bg-surface">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          placeholder="Icon"
                          value={item.icon}
                          onChange={(e) => {
                            const newItems = [...sections.features.items]
                            newItems[idx] = { ...newItems[idx], icon: e.target.value }
                            updateField('items', newItems)
                          }}
                          className="rounded border border-border bg-surface px-2 py-1 text-sm"
                        />
                        <input
                          placeholder="Judul"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...sections.features.items]
                            newItems[idx] = { ...newItems[idx], title: e.target.value }
                            updateField('items', newItems)
                          }}
                          className="rounded border border-border bg-surface px-2 py-1 text-sm"
                        />
                        <input
                          placeholder="Deskripsi"
                          value={item.desc}
                          onChange={(e) => {
                            const newItems = [...sections.features.items]
                            newItems[idx] = { ...newItems[idx], desc: e.target.value }
                            updateField('items', newItems)
                          }}
                          className="rounded border border-border bg-surface px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'pricing' && (
              <div className="space-y-4">
                {renderField('Judul Section', 'title')}
                {renderField('Sub Judul', 'subtitle', 'textarea')}
                {(sections.pricing?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-surface space-y-2">
                    <input
                      placeholder="Nama Paket"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...sections.pricing.items]
                        newItems[idx] = { ...newItems[idx], name: e.target.value }
                        updateField('items', newItems)
                      }}
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
                    />
                    <input
                      placeholder="Harga"
                      value={item.price}
                      onChange={(e) => {
                        const newItems = [...sections.pricing.items]
                        newItems[idx] = { ...newItems[idx], price: e.target.value }
                        updateField('items', newItems)
                      }}
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'faq' && (
              <div className="space-y-4">
                {renderField('Judul Section', 'title')}
                {(sections.faq?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-surface space-y-2">
                    <input
                      placeholder="Pertanyaan"
                      value={item.q}
                      onChange={(e) => {
                        const newItems = [...sections.faq.items]
                        newItems[idx] = { ...newItems[idx], q: e.target.value }
                        updateField('items', newItems)
                      }}
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
                    />
                    <textarea
                      placeholder="Jawaban"
                      value={item.a}
                      onChange={(e) => {
                        const newItems = [...sections.faq.items]
                        newItems[idx] = { ...newItems[idx], a: e.target.value }
                        updateField('items', newItems)
                      }}
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'testimonials' && (
              <div className="space-y-4">
                {renderField('Judul Section', 'title')}
                {(sections.testimonials?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-surface space-y-2">
                    <input
                      placeholder="Nama"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...sections.testimonials.items]
                        newItems[idx] = { ...newItems[idx], name: e.target.value }
                        updateField('items', newItems)
                      }}
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
                    />
                    <input
                      placeholder="Role"
                      value={item.role}
                      onChange={(e) => {
                        const newItems = [...sections.testimonials.items]
                        newItems[idx] = { ...newItems[idx], role: e.target.value }
                        updateField('items', newItems)
                      }}
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
                    />
                    <textarea
                      placeholder="Testimoni"
                      value={item.text}
                      onChange={(e) => {
                        const newItems = [...sections.testimonials.items]
                        newItems[idx] = { ...newItems[idx], text: e.target.value }
                        updateField('items', newItems)
                      }}
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'footer' && (
              <div className="space-y-4">
                {renderField('Copyright', 'copyright', 'textarea')}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
