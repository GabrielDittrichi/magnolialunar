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

export default function MassageEditForm({ initial }: { initial: any }) {
  const router = useRouter()
  const [therapists, setTherapists] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(initial?.title || "")
  const [slug] = useState(initial?.slug || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [duration, setDuration] = useState(initial?.duration || "60 min")
  const [price, setPrice] = useState<number>(initial?.price || 120)
  const [image, setImage] = useState(initial?.image || "")
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>(initial?.therapists || [])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/therapists", { cache: "no-store" })
      .then(r => r.json())
      .then(setTherapists)
      .catch(() => setTherapists([]))
  }, [])

  function toggleTherapist(slug: string) {
    setSelectedTherapists(prev =>
      prev.includes(slug) ? prev.filter(t => t !== slug) : [...prev, slug]
    )
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
      const url = await uploadFile(f, `massages/${slug}/cover-${Date.now()}`)
      setImage(url)
    } catch {
      setError("Falha ao enviar imagem")
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title || !slug) {
      setError("Título é obrigatório")
      return
    }
    const payload = {
      id: slug,
      title,
      slug,
      description,
      duration,
      price,
      image,
      therapists: selectedTherapists,
    }
    setLoading(true)
    const res = await fetch("/api/massages", {
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
    router.push("/admin/massagens")
  }

  return (
    <form onSubmit={onSubmit} className="border border-slate-200 p-6 rounded-sm mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Título">
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-200 p-3 rounded-sm" />
        </FormField>
        <FormField label="Slug (auto)">
          <input value={slug} readOnly className="w-full border border-slate-200 p-3 rounded-sm bg-slate-50" />
        </FormField>
        <FormField label="Descrição">
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-200 p-3 rounded-sm min-h-32" />
        </FormField>
        <FormField label="Duração">
          <input value={duration} onChange={e => setDuration(e.target.value)} className="w-full border border-slate-200 p-3 rounded-sm" />
        </FormField>
        <FormField label="Preço">
          <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full border border-slate-200 p-3 rounded-sm" />
        </FormField>
        <FormField label="Imagem (Upload)">
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
      </div>

      <div className="mt-6">
        <span className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">Terapeutas que realizam</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {therapists.map(t => (
            <label key={t.slug} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectedTherapists.includes(t.slug)} onChange={() => toggleTherapist(t.slug)} />
              <span>{t.name}</span>
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
