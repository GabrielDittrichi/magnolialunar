import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react"
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/ui/motion"

export function Footer() {
  return (
    <footer className="bg-white text-slate-900 py-16 border-t border-slate-900">
      <div className="container mx-auto px-6">
        <FadeInStagger className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <FadeInItem className="space-y-4">
            <Link href="/" className="block">
              <Image src="/logo.jpg" alt="Magnolia Lunar" width={150} height={50} 
              className="h-12 w-auto rounded-full" />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Um refúgio sensorial em Lisboa. Massagens exclusivas para revitalizar corpo e mente.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-gold-light transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-gold-light transition-colors"><Facebook className="h-5 w-5" /></a>
            </div>
          </FadeInItem>

          {/* Links */}
          <FadeInItem>
            <h4 className="text-slate-900 font-philosopher text-lg mb-6">Navegação</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-gold-light transition-colors">Home</Link></li>
              <li><Link href="/massagens" className="hover:text-gold-light transition-colors">Massagens</Link></li>
              <li><Link href="/terapeutas" className="hover:text-gold-light transition-colors">Terapeutas</Link></li>
              <li><Link href="/sobre" className="hover:text-gold-light transition-colors">O Espaço</Link></li>
            </ul>
          </FadeInItem>

          {/* Hours */}
          <FadeInItem>
            <h4 className="text-slate-900 font-philosopher text-lg mb-6">Horário</h4> 
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Segunda - Sexta</span>
                <span className="text-slate-900">10:00 - 22:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sábado</span>
                <span className="text-slate-900">11:00 - 20:00</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo</span>
                <span className="text-slate-900">Sob Consulta</span>
              </li>
            </ul>
          </FadeInItem>
        </FadeInStagger>

        <FadeIn className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500" delay={0.4}>
          <p>&copy; {new Date().getFullYear()} Magnolia Lunar. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/privacidade" className="hover:text-slate-400">Política de Privacidade</Link>
            <Link href="/termos" className="hover:text-slate-400">Termos de Uso</Link>
          </div>
        </FadeIn>
      </div>
    </footer>
  )
}
