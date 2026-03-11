import Image from "next/image"
import Link from "next/link"
import MassageForm from "./_form"
import DeleteMassageButton from "./_delete-button"

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const res = await fetch(`${base}/api/massages`, { cache: "no-store" })
  return res.json()
}

export default async function AdminMassagesPage() {
  const massages = await getData()
  return (
    <main className="min-h-screen pt-32 pb-24 bg-white">
      <div className="container mx-auto px-6">
        <Link href="/admin" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 inline-block">Voltar</Link>
        <h1 className="text-4xl font-serif text-slate-900 mb-8">Massagens</h1>
        <MassageForm />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {massages.map((m: any) => (
            <div key={m.slug} className="border border-slate-200 rounded-sm overflow-hidden">
              <div className="relative h-64">
                {m.image && (
                  <Image src={m.image} alt={m.title} fill className="object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="font-serif text-xl">{m.title}</div>
                <div className="text-xs text-slate-500">{m.description}</div>
                <div className="mt-4 flex gap-3">
                  <Link href={`/admin/massagens/${m.slug}`} className="text-xs border border-slate-900 text-slate-900 px-3 py-2 tracking-widest uppercase rounded-sm hover:bg-slate-900 hover:text-white transition-colors">
                    Editar
                  </Link>
                  <DeleteMassageButton slug={m.slug} />
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
