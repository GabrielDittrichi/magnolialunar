import Link from "next/link"
import MassageEditForm from "../_edit-form"
import { getMassageBySlug } from "@/lib/db"

export default async function AdminEditMassagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const massage = await getMassageBySlug(slug)
  return (
    <main className="min-h-screen pt-32 pb-24 bg-white">
      <div className="container mx-auto px-6">
        <Link href="/admin/massagens" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 inline-block">Voltar</Link>
        <h1 className="text-4xl font-serif text-slate-900 mb-4">Editar Massagem</h1>
        {massage ? (
          <MassageEditForm initial={massage} />
        ) : (
          <p className="text-slate-600">Massagem não encontrada.</p>
        )}
      </div>
    </main>
  )
}
