import Link from "next/link"
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react"
import { FadeIn } from "@/components/ui/motion"

export function Contact() {
  return (
    <section className="relative py-24 bg-slate-900 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-700 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Text Content */}
          <FadeIn className="space-y-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gold mb-4">
                Entre em Contato
              </p>
              <h2 className="text-4xl md:text-5xl font-philosopher leading-tight mb-6">
                Agende seu momento de <span className="text-gold italic">paz</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                Estamos prontos para recebê-lo em nosso santuário. Tire suas dúvidas ou agende sua visita pelo WhatsApp ou telefone.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-sm hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                <div className="bg-gold/10 p-3 rounded-full text-gold">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-philosopher text-xl mb-1">Localização</h4>
                  <p className="text-slate-400">Lisboa, Portugal</p>
                  <p className="text-xs text-slate-500 mt-1">Endereço completo enviado após confirmação</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-sm hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                <div className="bg-gold/10 p-3 rounded-full text-gold">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-philosopher text-xl mb-1">Telefone / WhatsApp</h4>
                  <p className="text-slate-400">+351 962 252 659</p>
                  <p className="text-xs text-slate-500 mt-1">Atendimento das 10h às 22h</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-sm hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                <div className="bg-gold/10 p-3 rounded-full text-gold">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-philosopher text-xl mb-1">Email</h4>
                  <p className="text-slate-400">contato@magnolialunar.pt</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* CTA Box / Map Placeholder */}
          <FadeIn delay={0.2} className="relative">
             <div className="bg-white text-slate-900 p-8 md:p-12 rounded-sm shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDFBF7] rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150" />
                
                <h3 className="text-3xl font-philosopher mb-6 relative z-10">Pronto para relaxar?</h3>
                <p className="text-slate-600 mb-8 leading-relaxed relative z-10">
                  Clique no botão abaixo para iniciar uma conversa direta pelo WhatsApp. Nossa equipe responderá o mais breve possível para confirmar sua reserva.
                </p>
                
                <a 
                  href="https://wa.me/351962252659" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full bg-slate-900 text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gold transition-colors duration-300 relative z-10"
                >
                  Agendar pelo WhatsApp
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>

                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center relative z-10">
                   <div>
                     <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Disponibilidade Hoje</span>
                     <span className="flex items-center text-green-600 font-medium text-sm">
                       <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                       Poucas vagas restantes
                     </span>
                   </div>
                   <div className="text-right">
                      <Clock className="h-5 w-5 text-slate-300 ml-auto mb-1" />
                   </div>
                </div>
             </div>
          </FadeIn>

        </div>
      </div>
    </section>
  )
}
