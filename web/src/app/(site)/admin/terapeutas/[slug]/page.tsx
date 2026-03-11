import Link from "next/link"
import TherapistEditForm from "../_edit-form"

async function getTherapists() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const res = await fetch(`${base}/api/therapists`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

export default async function AdminEditTherapistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const therapists = await getTherapists()
  const therapist = therapists.find((t: any) => t.slug === slug)
  return (
    <main className="min-h-screen pt-32 pb-24 bg-white">
      <div className="container mx-auto px-6">
        <Link href="/admin/terapeutas" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 inline-block">Voltar</Link>
        <h1 className="text-4xl font-serif text-slate-900 mb-4">Editar Terapeuta</h1>
        {therapist ? (
          <TherapistEditForm initial={therapist} />
        ) : (
          <p className="text-slate-600">Terapeuta não encontrada.</p>
        )}
      </div>
    </main>
  )
}
