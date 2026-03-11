import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, Tag } from "lucide-react"
import { getMassageBySlug, getTherapists } from "@/lib/db"
import { Metadata } from "next"

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const massage = await getMassageBySlug(slug) as Massage | null

  if (!massage) {
     return {
       title: "Massagem não encontrada | Magnolia Lunar",
       description: "Massagem não encontrada."
     }
  }

  return {
    title: `${massage.title} | Magnolia Lunar`,
    description: massage.description ? massage.description.slice(0, 160) : `Conheça a ${massage.title} no Magnolia Lunar.`,
    openGraph: {
      title: `${massage.title} | Magnolia Lunar`,
      description: massage.description ? massage.description.slice(0, 160) : `Conheça a ${massage.title} no Magnolia Lunar.`,
      images: massage.image ? [massage.image] : [],
    }
  }
}

interface Massage {
  id?: string
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
  id?: string
  name: string
  slug: string
  image?: string
}

// Dynamic rendering; no static params

export default async function MassageDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const massage = await getMassageBySlug(slug) as Massage | null
  const therapistsList = await getTherapists() as Therapist[]

  // Fallback for static demo content if not found in Sanity (optional, but good for dev)
  // For now, if not found, we show 404
  if (!massage) {
     // Check if it matches fallback slugs or common variations
     // Map simple slugs to Sanity slugs
     const slugMap: Record<string, string> = {
       "tantrica": "massagem-tantrica",
       "nuru": "massagem-nuru", 
       "lingam": "massagem-lingam",
       "relaxante": "massagem-relaxante",
       "terapeutica": "massagem-terapeutica",
       "sensual": "massagem-sensual",
       "4-maos": "massagem-4-maos"
     };

     if (slugMap[slug]) {
       // Redirect or fetch with mapped slug
       // Since this is a server component, we can just fetch again
       const mappedSlug = slugMap[slug];
       const reFetch = await getMassageBySlug(mappedSlug) as Massage | null;
       if (reFetch) {
         return <MassageDetailView massage={reFetch} />
       }
     }

     // Check if it matches fallback slugs for static data (legacy)
     const fallback = [
        {
          slug: "tantrica",
          title: "Massagem Tântrica",
          description: "Uma jornada de autoconhecimento e despertar sensorial, expandindo a sua capacidade de sentir prazer. A massagem tântrica é uma arte milenar que busca conectar o ser humano com sua essência vital através do toque consciente e da respiração.",
          image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop",
          duration: "60 min",
          price: 150
        },
        {
          slug: "nuru",
          title: "Massagem Nuru",
          description: "Técnica japonesa corpo a corpo com gel especial, proporcionando um contato íntimo e deslizante. O gel Nuru é feito à base de algas marinhas, incolor e inodoro, permitindo um deslizamento perfeito entre os corpos.",
          image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2574&auto=format&fit=crop",
          duration: "60 min",
          price: 200
        },
        {
          slug: "lingam",
          title: "Massagem Lingam",
          description: "Focada na saúde masculina e vitalidade, utilizando toques precisos para desbloquear energias.",
          image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
          duration: "60 min",
          price: 180
        },
        {
          slug: "relaxante",
          title: "Massagem Relaxante",
          description: "Movimentos suaves e rítmicos para aliviar tensões musculares e promover relaxamento profundo.",
          image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop",
          duration: "60 min",
          price: 120
        }
     ].find(m => m.slug === slug)

     if (fallback) {
        return <MassageDetailView massage={{...fallback, image: null, fallbackImage: fallback.image}} />
     }

     return notFound()
  }

  const massageTherapists: Therapist[] = Array.isArray(massage.therapists)
    ? therapistsList.filter((t) => (massage.therapists as string[]).includes(t.slug))
    : []
  return <MassageDetailView massage={massage as Massage} therapists={massageTherapists} />
}

function MassageDetailView({ massage, therapists }: { massage: Massage, therapists: Therapist[] }) {
  const imageUrl = massage.image || massage.fallbackImage

  return (
    <main className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <Link 
          href="/massagens" 
          className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-gold transition-colors mb-12"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Massagens
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative h-[400px] lg:h-[600px] w-full overflow-hidden rounded-sm shadow-xl">
            {imageUrl && (
                <Image
                src={imageUrl}
                alt={massage.title}
                fill
                className="object-cover"
                />
            )}
          </div>

          <div className="flex flex-col justify-center h-full">
            <p className="text-xs font-medium uppercase tracking-luxury text-gold mb-4">
              EXPERIÊNCIA EXCLUSIVA
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-slate-900 mb-8">
              {massage.title}
            </h1>

            <div className="flex items-center gap-6 mb-8 text-slate-700">
               {massage.duration && (
                   <div className="flex items-center gap-2">
                       <Clock className="h-5 w-5 text-gold" />
                       <span className="text-sm uppercase tracking-wider">{massage.duration}</span>
                   </div>
               )}
               {massage.price && (
                   <div className="flex items-center gap-2">
                       <Tag className="h-5 w-5 text-gold" />
                       <span className="text-sm uppercase tracking-wider">{typeof massage.price === 'number' ? `€${massage.price}` : massage.price}</span>
                   </div>
               )}
            </div>

            <div className="prose prose-slate max-w-none mb-10">
              <p className="text-slate-700 text-lg leading-relaxed">
                {massage.description}
              </p>
            </div>

            <button className="bg-slate-900 text-white px-10 py-4 uppercase tracking-widest text-xs font-bold hover:bg-gold transition-colors duration-300 w-fit">
              Agendar Agora
            </button>
          </div>
        </div>

        {therapists && therapists.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-serif text-slate-900 mb-12 text-center">Terapeutas Especializadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {therapists.map((therapist) => (
                <Link key={therapist.slug} href={`/terapeutas/${therapist.slug}`} className="group block">
                  <div className="relative h-[400px] w-full overflow-hidden rounded-sm mb-4">
                    {therapist.image && (
                      <Image
                        src={therapist.image}
                        alt={therapist.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl font-serif text-slate-900 group-hover:text-gold transition-colors text-center">
                    {therapist.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
