import Image from "next/image"
import Link from "next/link"
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/ui/motion"
import { FALLBACK_THERAPISTS } from "@/data/fallback-data"
import { getTherapists } from "@/lib/db"

interface Therapist {
  name: string
  specialties: string[]
  image?: string | null
  slug: string
  fallbackImage?: string
}

export async function Therapists() {
  const sanityTherapists = await getTherapists()
  const therapists = (sanityTherapists && sanityTherapists.length > 0) ? sanityTherapists : FALLBACK_THERAPISTS
  
  if (!therapists || therapists.length === 0) {
    return null
  }

  return (
    <section className="py-8 bg-white text-slate-900 overflow-hidden">
      <FadeIn className="container mx-auto px-6 mb-16 text-center">
        <p className="text-xs font-medium uppercase tracking-luxury text-gold mb-3">
            EQUIPA
        </p>
        <h2 className="text-4xl md:text-5xl font-philosopher mb-6 text-slate-900">
          Nossas Terapeutas
        </h2>
        <p className="text-slate-700 text-lg max-w-2xl mx-auto leading-relaxed">
          Profissionais dedicadas a proporcionar uma experiência única de relaxamento e conexão.
        </p>
      </FadeIn>

      {/* Carousel Container */}
      <FadeInStagger className="flex overflow-x-auto pb-12 px-6 gap-8 snap-x snap-mandatory -mx-6 md:mx-0 md:justify-center scroll-smooth scrollbar-hide">
        {therapists.map((therapist: Therapist) => {
          const imageUrl = therapist.image || therapist.fallbackImage || ''

          return (
            <FadeInItem 
              key={therapist.slug} 
              className="flex-none w-[300px] snap-center group cursor-pointer"
            >
              <Link href={`/terapeutas/${therapist.slug}`}>
                <div className="relative h-[420px] w-full overflow-hidden mb-6 bg-slate-100 shadow-lg">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={therapist.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>
                <div className="text-center transform transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-3xl font-philosopher text-slate-900 mb-2">{therapist.name}</h3>
                    <p className="text-xs uppercase tracking-luxury text-[#dabe65] font-medium">
                      {therapist.specialties ? therapist.specialties.join(" • ") : ""}
                    </p>
                </div>
              </Link>
            </FadeInItem>
          )
        })}
        
        {/* Spacer for right padding on mobile */}
        <div className="w-6 flex-none md:hidden" />
      </FadeInStagger>
      
      <FadeIn className="text-center mt-4 md:hidden animate-pulse">
        <p className="text-[10px] text-slate-400 uppercase tracking-luxury">Deslize para ver mais</p>
      </FadeIn>

      <div className="text-center mt-12">
           <Link
            href="/terapeutas"
            className="inline-flex items-center justify-center border border-slate-900 px-10 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 hover:shadow-lg"
           >
             Conhecer Toda a Equipa
           </Link>
      </div>
    </section>
  )
}
