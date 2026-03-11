import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FadeIn } from "@/components/ui/motion"

export function About() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[#FDFBF7]">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Coluna de Imagem (7 colunas) */}
          <div className="lg:col-span-7 relative">
             <FadeIn delay={0.2} duration={0.8} className="relative h-[600px] w-full">
                <div className="absolute inset-0 bg-slate-200 overflow-hidden rounded-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1620733723572-11c52f7c2d82?q=80&w=1974&auto=format&fit=crop"
                    alt="Interior do Magnolia Lunar"
                    fill
                    className="object-cover transition-transform duration-[2s] hover:scale-105"
                  />
                </div>
                
                {/* Imagem sobreposta flutuante */}
                <div className="absolute -bottom-12 -right-12 w-64 h-80 bg-white p-2 shadow-2xl hidden md:block rounded-sm">
                   <div className="relative w-full h-full overflow-hidden bg-slate-100">
                    <Image
                        src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop"
                        alt="Detalhe massagem"
                        fill
                        className="object-cover"
                    />
                   </div>
                </div>
             </FadeIn>
          </div>

          {/* Coluna de Texto (5 colunas) */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.4} duration={0.8} className="space-y-8">
              <div>
                <span className="inline-block w-12 h-[1px] bg-gold mb-4 align-middle mr-4"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Nossa Essência
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-philosopher text-slate-900 leading-[1.1]">
                Onde o tempo <br/> <span className="text-gold italic">desacelera</span>
              </h2>
              
              <p className="text-slate-600 text-lg leading-relaxed font-light">
                O Magnolia Lunar não é apenas um spa, é um refúgio sensorial no coração de Lisboa. Criamos um santuário onde a elegância encontra o relaxamento profundo, longe do ruído da cidade.
              </p>

              <p className="text-slate-600 leading-relaxed">
                Cada terapia é uma obra de arte executada por terapeutas selecionadas, combinando técnicas milenares com um toque contemporâneo e intuitivo. Aqui, o luxo reside na privacidade e na atenção aos detalhes.
              </p>

              <div className="pt-4 grid grid-cols-2 gap-6">
                 <div>
                    <h4 className="font-philosopher text-xl text-slate-900 mb-1">Privacidade</h4>
                    <p className="text-sm text-slate-500">Suites acústicas e discretas</p>
                 </div>
                 <div>
                    <h4 className="font-philosopher text-xl text-slate-900 mb-1">Conforto</h4>
                    <p className="text-sm text-slate-500">Duche privativo premium</p>
                 </div>
              </div>

              <div className="pt-6">
                <Link 
                  href="/sobre" 
                  className="group inline-flex items-center text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1 hover:text-gold hover:border-gold transition-colors duration-300"
                >
                  Conheça o Espaço 
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
      
      {/* Elemento Decorativo de Fundo */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-[#f8f5f0] rounded-full blur-3xl -z-10 opacity-60" />
    </section>
  )
}
