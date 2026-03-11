import Image from "next/image"
import Link from "next/link"
import TherapistForm from "./_form"
import DeleteButton from "./_delete-button"

async function getTherapists() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const res = await fetch(`${base}/api/therapists`, { cache: "no-store" })
  return res.json()
}

function ImageCell({ src, alt }: { src?: string, alt: string }) {
  return (
    <div className="relative h-64 bg-slate-100">
      {src && <Image src={src} alt={alt} fill className="object-cover" />}
    </div>
  )
}

function SpecialtiesCell({ specialties }: { specialties?: string[] }) {
  return <div className="text-xs text-slate-500">{specialties?.join(" • ")}</div>
}

export default async function AdminTherapistsPage() {
  const therapists = await getTherapists()
  return (
    <main className="min-h-screen pt-32 pb-24 bg-white">
      <div className="container mx-auto px-6">
        <Link href="/admin" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 inline-block">Voltar</Link>
        <h1 className="text-4xl font-serif text-slate-900 mb-4">Terapeutas</h1>
        <p className="text-slate-600 mb-8">Adicione novas terapeutas e defina as massagens que elas realizam, descrição e fotos.</p>

        <TherapistForm />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {therapists.map((t: any) => (
            <div key={t.slug} className="border border-slate-200 rounded-sm overflow-hidden">
              <ImageCell src={t.image} alt={t.name} />
              <div className="p-4">
                <div className="font-serif text-xl">{t.name}</div>
                <SpecialtiesCell specialties={t.specialties} />
                <div className="mt-4 flex gap-3">
                  <Link href={`/admin/terapeutas/${t.slug}`} className="text-xs border border-slate-900 text-slate-900 px-3 py-2 tracking-widest uppercase rounded-sm hover:bg-slate-900 hover:text-white transition-colors">
                    Editar
                  </Link>
                  <DeleteButton slug={t.slug} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
