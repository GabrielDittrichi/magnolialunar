"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

function FormField({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{label}</span>
      {children}
    </label>
  )
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center justify-center bg-slate-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors disabled:opacity-50"
    >
      {loading ? "Salvando..." : "Salvar Alterações"}
    </button>
  )
}

export default function TherapistEditForm({ initial }: { initial: any }) {
  const router = useRouter()
  const [massages, setMassages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initial?.name || "")
  const [slug] = useState(initial?.slug || "")
  const [bio, setBio] = useState(initial?.bio || "")
  const [phone, setPhone] = useState(initial?.phone || "")
  const [image, setImage] = useState(initial?.image || "")
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initial?.gallery || [])
  const [selectedTitles, setSelectedTitles] = useState<string[]>(initial?.specialties || [])
  const [error, setError] = useState<string | null>(null)
  const gallery = galleryUrls

  useEffect(() => {
    fetch("/api/massages", { cache: "no-store" })
      .then(r => r.json())
      .then(setMassages)
      .catch(() => setMassages([]))
  }, [])

  function toggleTitle(title: string) {
    setSelectedTitles(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name || !slug) {
      setError("Nome é obrigatório")
      return
    }
    const payload = {
      id: slug,
      name,
      slug,
      specialties: selectedTitles,
      image,
      bio,
      phone,
      gallery,
    }
    setLoading(true)
    const res = await fetch("/api/therapists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error || "Erro ao salvar")
      return
    }
    router.push("/admin/terapeutas")
  }

  async function uploadFile(file: File, key: string) {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("key", key)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    if (!res.ok) throw new Error("upload_failed")
    const data = await res.json()
    return data.url as string
  }

  async function onImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f || !slug) return
    setLoading(true)
    try {
      const url = await uploadFile(f, `therapists/${slug}/profile-${Date.now()}`)
      setImage(url)
    } catch {
      setError("Falha ao enviar imagem")
    } finally {
      setLoading(false)
    }
  }

  async function onGallerySelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || !slug) return
    setLoading(true)
    try {
      const uploads = Array.from(files).map((f, i) => uploadFile(f, `therapists/${slug}/gallery-${Date.now()}-${i}`))
      const urls = await Promise.all(uploads)
      const next = [...gallery, ...urls]
      setGalleryUrls(next)
    } catch {
      setError("Falha ao enviar galeria")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="border border-slate-200 p-6 rounded-sm mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nome">
          <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-200 p-3 rounded-sm" />
        </FormField>
        <FormField label="Slug">
          <input value={slug} readOnly className="w-full border border-slate-200 p-3 rounded-sm bg-slate-50" />
        </FormField>
        <FormField label="Telefone (WhatsApp)">
          <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-slate-200 p-3 rounded-sm" />
        </FormField>
        <FormField label="Foto (Upload)">
          <input type="file" accept="image/*" onChange={onImageSelect} className="w-full border border-slate-200 p-3 rounded-sm" />
          {image && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2 break-all">{image}</p>
              <div className="relative w-full h-48 bg-slate-100 rounded overflow-hidden">
                <img src={image} alt="Preview" className="object-cover w-full h-full" />
              </div>
            </div>
          )}
        </FormField>
        <FormField label="Descrição / Bio">
          <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full border border-slate-200 p-3 rounded-sm min-h-32" />
        </FormField>
        <FormField label="Galeria (Upload múltiplo)">
          <input type="file" accept="image/*" multiple onChange={onGallerySelect} className="w-full border border-slate-200 p-3 rounded-sm" />
          {gallery.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {gallery.map((u, i) => (
                <div key={i} className="relative h-24 bg-slate-100 rounded overflow-hidden">
                  <img src={u} alt={`Gallery ${i}`} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          )}
        </FormField>
      </div>

      <div className="mt-6">
        <span className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">Massagens que realiza</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {massages.map(m => (
            <label key={m.slug} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectedTitles.includes(m.title)} onChange={() => toggleTitle(m.title)} />
              <span>{m.title}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      <div className="mt-6">
        <SubmitButton loading={loading} />
      </div>
    </form>
  )
}
