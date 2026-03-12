import Link from "next/link"
import TherapistEditForm from "../_edit-form"
import { getTherapistBySlug } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminEditTherapistPage({ params }: { params: Promise<{ slug: string }> }) {
  const isAuthenticated = await getSession()
  if (!isAuthenticated) redirect("/admin/login")

  const { slug } = await params
  const therapist = await getTherapistBySlug(slug)
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
