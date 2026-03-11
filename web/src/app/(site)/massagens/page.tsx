import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { getMassages, getTherapists } from "@/lib/db"

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Nossas Massagens | Magnolia Lunar",
  description: "Explore o nosso menu de massagens exclusivas para relaxamento e bem-estar.",
}

interface Massage {
  id: string
  title: string
  slug: string
  description: string
  duration?: string
  price?: number
  image?: string | null
  fallbackImage?: string
  therapists?: string[]
}

interface Therapist {
  id: string
  name: string
  slug: string
  image?: string
}

export default async function MassagesPage() {
  const massages = await getMassages() as Massage[]
  const therapists = await getTherapists() as Therapist[]

  return (
    <main className="pt-32 bg-[#ffd7f042] min-h-screen">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium uppercase tracking-luxury text-gold mb-3">
            NOSSOS SERVIÇOS
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900">
            Menu de Massagens
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {massages.map((massage: Massage) => {
            const massageTherapists = Array.isArray(massage.therapists)
              ? (therapists as Therapist[]).filter((t) => (massage.therapists as string[]).includes(t.slug)).slice(0, 6)
              : []
            return (
            <div key={massage.id} className="group relative overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={massage.image || massage.fallbackImage}
                  alt={massage.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font- serif text-slate-900 mb-3 group-hover:text-gold transition-colors duration-300">
                  {massage.title}
                </h3>
                <p className="text-slate-700 mb-6 leading-relaxed text-sm line-clamp-3">
                  {massage.description}
                </p>
                <Link 
                  href={`/massagens/${massage.slug}`}
                  className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gold hover:text-primary-hover transition-colors group-hover:translate-x-2 duration-300"
                >
                  Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                {massageTherapists.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-2">Disponível com:</p>
                    <div className="flex -space-x-2">
                      {massageTherapists.slice(0, 4).map((therapist: Therapist) => (
                        <div key={therapist.slug} className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden" title={therapist.name}>
                          {therapist.image ? (
                            <Image 
                              src={therapist.image} 
                              alt={therapist.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {therapist.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      ))}
                      {massageTherapists.length > 4 && (
                        <div className="relative w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          +{massageTherapists.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>
      </div>
    </main>
  )
}
