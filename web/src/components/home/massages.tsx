import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/ui/motion"
import { getMassages } from "@/lib/db"

interface Massage {
  id: string
  title: string
  slug: string
  description: string
  image?: string | null
  fallbackImage?: string
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop"

export async function Massages() {
  const massages = await getMassages() as Massage[]

  return (
    <section className="py-8 bg-[#ffffff]">
      <div className="container mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <p className="text-xs font-medium uppercase tracking-luxury text-gold mb-3">
            NOSSOS SERVIÇOS
          </p>
          <h2 className="text-4xl md:text-5xl font-philosopher text-white">
            Experiências Sensoriais
          </h2>
        </FadeIn>

        <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {massages.map((massage: Massage) => {
             const imageUrl = massage.image || massage.fallbackImage || PLACEHOLDER_IMAGE
             
             return (
              <FadeInItem key={massage.id} className="group relative overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={massage.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
                
                <div className="p-10">
                  <h3 className="text-3xl font-philosopher text-slate-900 mb-4 group-hover:text-gold transition-colors duration-300">
                    {massage.title}
                  </h3>
                  <p className="text-slate-700 mb-8 leading-relaxed text-lg">
                    {massage.description}
                  </p>
                  <Link 
                    href={`/massagens/${massage.slug}`}
                    className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gold hover:text-primary-hover transition-colors group-hover:translate-x-2 duration-300"
                  >
                    Saiba Mais <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </FadeInItem>
            )
          })}
        </FadeInStagger>
        
        <FadeIn className="text-center mt-16" delay={0.4}>
           <Link
            href="/massagens"
            className="inline-flex items-center justify-center border border-slate-900 px-10 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 hover:shadow-lg"
           >
             Ver Todas as Massagens
           </Link>
        </FadeIn>
      </div>
    </section>
  )
}
