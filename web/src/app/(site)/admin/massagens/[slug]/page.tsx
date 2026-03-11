import Link from "next/link"
import MassageEditForm from "../_edit-form"

async function getMassages() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const res = await fetch(`${base}/api/massages`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

export default async function AdminEditMassagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const massages = await getMassages()
  const massage = massages.find((m: any) => m.slug === slug)
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
