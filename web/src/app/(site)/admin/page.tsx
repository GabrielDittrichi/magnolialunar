import Link from "next/link"
import { getTherapists, getMassages } from "@/lib/db"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [therapists, massages] = await Promise.all([
    getTherapists(),
    getMassages(),
  ])

  const counts = {
    therapists: therapists ? therapists.length : 0,
    massages: massages ? massages.length : 0,
  }

  return (
    <main className="min-h-screen pt-32 pb-24 bg-white">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-serif text-slate-900 mb-8">Admin</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-slate-200 p-6 rounded-sm">
            <h2 className="text-2xl font-serif mb-2">Terapeutas</h2>
            <p className="text-slate-600 mb-6">Total: {counts.therapists}</p>
            <Link href="/admin/terapeutas" className="inline-block bg-slate-900 text-white px-6 py-3 text-sm font-bold uppercase tracking-widest">
              Gerir Terapeutas
            </Link>
          </div>
          <div className="border border-slate-200 p-6 rounded-sm">
            <h2 className="text-2xl font-serif mb-2">Massagens</h2>
            <p className="text-slate-600 mb-6">Total: {counts.massages}</p>
            <Link href="/admin/massagens" className="inline-block bg-slate-900 text-white px-6 py-3 text-sm font-bold uppercase tracking-widest">
              Gerir Massagens
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
