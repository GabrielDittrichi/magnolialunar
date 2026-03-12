import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/ui/motion"
import { Calendar, Sparkles, UserCheck, ArrowRight } from "lucide-react"

import { FALLBACK_THERAPISTS } from "@/data/fallback-data"
import { getTherapists } from "@/lib/db"

import { VideoPlayer } from "@/components/ui/video-player"

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sobre Nós | Magnolia Lunar",
  description: "Conheça a história e a filosofia do Magnolia Lunar.",
}

interface Therapist {
  name: string
  specialties: string[]
  image?: string | null
  slug: string
  fallbackImage?: string
}

const spaceImages = [
  {
    src: "https://pub-b0c6576fd7ce4550917b484175556894.r2.dev/space/magnolia-lunar-1773339421593-WhatsAppImage2026-03-11at12.04.03.jpeg",
    alt: "Recepção Magnolia Lunar",
    colSpan: "md:col-span-2",
    height: "h-64 md:h-96"
  },
  {
    src: "https://pub-b0c6576fd7ce4550917b484175556894.r2.dev/space/magnolia-lunar-1773339420841-WhatsAppImage2026-03-11at12.04.02.jpeg",
    alt: "Sala de Massagem",
    colSpan: "md:col-span-1",
    height: "h-64 md:h-96"
  },
  {
    src: "https://pub-b0c6576fd7ce4550917b484175556894.r2.dev/space/magnolia-lunar-1773339418935-WhatsAppImage2026-03-11at12.04.021.jpeg",
    alt: "Detalhes do Espaço",
    colSpan: "md:col-span-1",
    height: "h-64"
  },
  {
    src: "https://pub-b0c6576fd7ce4550917b484175556894.r2.dev/space/magnolia-lunar-1773339420841-WhatsAppImage2026-03-11at12.04.02.jpeg",
    alt: "Ambiente Relaxante",
    colSpan: "md:col-span-2",
    height: "h-64"
  }
]

const steps = [
  {
    icon: UserCheck,
    title: "Escolha sua Experiência",
    description: "Navegue por nossas massagens e conheça nossas terapeutas para encontrar a combinação perfeita para o seu momento."
  },
  {
    icon: Calendar,
    title: "Agende com Discrição",
    description: "Entre em contato via WhatsApp. Nossa equipe confirmará a disponibilidade e fornecerá todos os detalhes necessários."
  },
  {
    icon: Sparkles,
    title: "Relaxe Profundamente",
    description: "Ao chegar, desconecte-se do mundo exterior. Desfrute de um ambiente seguro, limpo e preparado para o seu bem-estar."
  }
]

export default async function AboutPage() {
  const sanityTherapists = await getTherapists()
  const therapists = (sanityTherapists && sanityTherapists.length > 0) ? sanityTherapists : FALLBACK_THERAPISTS.slice(0, 3)

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16">
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 mb-20 text-center">
        <FadeIn>
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-4 block">
            Nosso Santuário
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-philosopher text-slate-900 mb-6">
            Conheça o Espaço
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Um refúgio desenhado para proporcionar privacidade, conforto e uma imersão sensorial completa. Cada detalhe foi pensado para o seu relaxamento.
          </p>
        </FadeIn>
      </section>

      {/* Gallery Section */}
      <section className="container mx-auto px-6 mb-24">
        <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {spaceImages.map((img, idx) => (
            <FadeInItem key={idx} className={`${img.colSpan} relative rounded-sm overflow-hidden group`}>
              <div className={`relative w-full ${img.height}`}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </section>

      {/* Video Section */}
      <section className="container mx-auto px-6 mb-24 flex justify-center">
        <FadeIn className="w-full max-w-md">
          <VideoPlayer 
            src="https://pub-b0c6576fd7ce4550917b484175556894.r2.dev/space/magnolia-lunar-1773339422917-WhatsAppVideo2026-03-11at12.04.02.mp4"
            className="w-full aspect-[9/16] shadow-2xl bg-black"
          />
        </FadeIn>
      </section>

      {/* How it Works Section */}
      <section className="bg-white py-20 mb-24 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-philosopher text-slate-900 mb-4">Como Funciona</h2>
             <div className="w-16 h-0.5 bg-gold mx-auto" />
          </div>

          <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, idx) => (
              <FadeInItem key={idx} className="text-center relative">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gold shadow-sm">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-philosopher text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm px-4">{step.description}</p>
                
                {/* Connector Line (Desktop only) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-[1px] bg-slate-100 -z-10" 
                       style={{ left: '50%', width: '100%' }} />
                )}
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* Choose Your Model Section */}
      <section className="container mx-auto px-6 mb-12">
        <FadeIn className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-4 block">
            Nossa Equipa
          </span>
          <h2 className="text-4xl md:text-5xl font-philosopher text-slate-900 mb-6">
            Escolha sua Terapeuta
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Conheça algumas de nossas terapeutas disponíveis para tornar sua experiência inesquecível.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {therapists.map((therapist: Therapist) => {
            const imageUrl = therapist.image || therapist.fallbackImage || ''
            return (
              <FadeIn key={therapist.slug} className="group cursor-pointer">
                <Link href={`/terapeutas/${therapist.slug}`}>
                  <div className="relative h-[500px] w-full overflow-hidden mb-6 bg-slate-200 rounded-sm">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={therapist.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity" />
                    
                    <div className="absolute bottom-6 left-6 text-white transform transition-transform duration-300 group-hover:-translate-y-2">
                      <h3 className="text-2xl font-philosopher mb-1">{therapist.name}</h3>
                      <p className="text-xs uppercase tracking-widest text-gold">
                        {therapist.specialties ? therapist.specialties[0] : "Terapeuta"}
                      </p>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            )
          })}
        </div>

        <FadeIn className="text-center">
          <Link 
            href="/terapeutas" 
            className="inline-flex items-center justify-center bg-slate-900 text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gold transition-colors duration-300 group"
          >
            Ver Todas as Terapeutas
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </FadeIn>
      </section>
    </main>
  )
}
