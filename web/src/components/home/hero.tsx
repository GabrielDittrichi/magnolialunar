import { FadeIn } from "@/components/ui/motion"

export function Hero() {
  return (
    <section className="relative flex h-[calc(100vh-120px)] flex-col items-center justify-center px-6 text-center text-white">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/video_hero.mp4" type="video/mp4" />
          Seu navegador não suporta o elemento de vídeo.
        </video>
        {/* Overlay escuro para garantir leitura do texto branco */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl space-y-10">
        <FadeIn className="space-y-6" delay={0.2} duration={1.0}>
            <p className="text-xs md:text-sm font-philosopher font-bold tracking-luxury text-[#dabe65] drop-shadow-md">
            MAGNOLIA LUNAR • LISBOA
            </p>
            <h1 className="text-5xl md:text-7xl font-philosopher font-medium uppercase leading-tight drop-shadow-lg text-balance">
            Um refúgio para<br/>os seus sentidos
            </h1>
        </FadeIn>
      </div>
    </section>
  )
}
