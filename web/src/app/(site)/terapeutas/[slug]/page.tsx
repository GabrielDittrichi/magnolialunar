import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/ui/motion"
import { FALLBACK_THERAPISTS } from "@/data/fallback-data"
import { getTherapistBySlug } from "@/lib/db"
import { Metadata } from "next"

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const therapist = await getTherapistBySlug(slug)

  if (!therapist) {
    return {
      title: "Terapeuta não encontrada | Magnolia Lunar",
      description: "Terapeuta não encontrada."
    }
  }

  return {
    title: `${therapist.name} | Magnolia Lunar`,
    description: therapist.bio ? therapist.bio.slice(0, 160) : `Conheça ${therapist.name}, especialista em ${therapist.specialties?.join(", ")}.`,
    openGraph: {
      title: `${therapist.name} | Magnolia Lunar`,
      description: therapist.bio ? therapist.bio.slice(0, 160) : `Conheça ${therapist.name}, especialista em ${therapist.specialties?.join(", ")}.`,
      images: therapist.image ? [therapist.image] : [],
    }
  }
}

// Dynamic route renders at request time; no static params needed

export default async function TherapistDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const therapist = await getTherapistBySlug(slug)

  if (!therapist) {
    // Check fallback
    const fallback = FALLBACK_THERAPISTS.find(t => t.slug.current === slug)
    if (fallback) {
      return <TherapistDetailView therapist={fallback} />
    }
     return notFound()
  }

  return <TherapistDetailView therapist={therapist} />
}

function TherapistDetailView({ therapist }: { therapist: any }) {
  const imageUrl = therapist.image || therapist.fallbackImage || null

  return (
    <main className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <Link 
          href="/terapeutas" 
          className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-gold transition-colors mb-12"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Terapeutas
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden rounded-sm shadow-xl">
            {imageUrl && (
                <Image
                src={imageUrl}
                alt={therapist.name}
                fill
                className="object-cover"
                />
            )}
          </div>

          <div className="flex flex-col justify-center h-full pt-8 md:pt-0">
            <h1 className="text-4xl md:text-6xl font-serif text-slate-900 mb-4">
              {therapist.name}
            </h1>
            
            <p className="text-xs font-medium uppercase tracking-luxury text-gold mb-8">
              {therapist.specialties ? therapist.specialties.join(" • ") : ""}
            </p>

            <div className="prose prose-slate max-w-none mb-10">
              <h3 className="text-xl font-serif text-slate-900 mb-4">Sobre</h3>
              <p className="text-slate-700 text-lg leading-relaxed">
                {therapist.bio || "Uma terapeuta dedicada e profissional, pronta para lhe proporcionar momentos de puro relaxamento e bem-estar."}
              </p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-100 rounded-sm">
                <h4 className="font-philosopher text-slate-900 mb-4">Agende com {therapist.name}</h4>
                <a 
                  href={`https://wa.me/${therapist.phone?.replace(/\D/g, '') || '351962252659'}?text=${encodeURIComponent(`Olá, gostaria de saber a disponibilidade de ${therapist.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-slate-900 text-white px-6 py-4 uppercase tracking-widest text-xs font-bold hover:bg-gold transition-colors duration-300"
                >
                  Solicitar Disponibilidade
                </a>
            </div>
          </div>
        </div>

        {therapist.gallery && therapist.gallery.length > 0 && (
          <div className="mt-24">
            <h3 className="text-2xl font-serif text-slate-900 mb-8 text-center">Galeria de Fotos</h3>
            <FadeInStagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {therapist.gallery.map((imgUrl: string, index: number) => {
                if (!imgUrl || typeof imgUrl !== "string") return null
                return (
                <FadeInItem key={index} className="relative h-[300px] w-full overflow-hidden rounded-sm group cursor-pointer">
                  <Image
                    src={imgUrl}
                    alt={`${therapist.name} gallery ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </FadeInItem>
              )})}
            </FadeInStagger>
          </div>
        )}
      </div>
    </main>
  )
}
