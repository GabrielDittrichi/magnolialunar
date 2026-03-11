"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const headerBgClass = isHome 
    ? (isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5")
    : "bg-white/90 backdrop-blur-md shadow-sm py-3"

  const isDarkIcon = (isHome && (isScrolled || isOpen)) || !isHome
  const iconColorClass = isDarkIcon ? "text-slate-900" : "text-white"

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          headerBgClass
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Menu Button */}
          <Link href="/" className="relative z-100">
            <Image
              src="/logo.jpg"
              alt="Magnolia Lunar"
              width={50}
              height={50}
              className="relative z-50 bg-white rounded-full"
            />
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-50 p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className={cn("h-8 w-8 transition-colors duration-300", iconColorClass)} />
            ) : (
              <Menu className={cn("h-8 w-8 transition-colors duration-300", iconColorClass)} />
            )}
          </button>
        </div>
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white flex flex-col justify-center items-center transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col items-center space-y-8 text-center">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-3xl font-philosopher text-slate-900 hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/massagens" onClick={() => setIsOpen(false)} className="text-3xl font-philosopher text-slate-900 hover:text-primary transition-colors">
            Massagens
          </Link>
          <Link href="/terapeutas" onClick={() => setIsOpen(false)} className="text-3xl font-philosopher text-slate-900 hover:text-primary transition-colors">
            Terapeutas
          </Link>
          <Link href="/sobre" onClick={() => setIsOpen(false)} className="text-3xl font-philosopher text-slate-900 hover:text-primary transition-colors">
            Sobre Nós
          </Link>
          <Link href="/contato" onClick={() => setIsOpen(false)} className="text-3xl font-philosopher text-slate-900 hover:text-primary transition-colors">
            Contato
          </Link>
        </nav>
      </div>
    </>
  )
}
