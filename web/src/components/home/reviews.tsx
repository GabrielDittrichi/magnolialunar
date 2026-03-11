import { Star } from "lucide-react"

const reviews = [
  {
    id: 1,
    name: "João M.",
    text: "Uma experiência transcendental. O ambiente é impecável e a terapeuta foi extremamente profissional e atenciosa. Recomendo vivamente.",
    rating: 5
  },
  {
    id: 2,
    name: "Ricardo S.",
    text: "A melhor massagem que já fiz em Lisboa. O espaço é muito discreto e limpo. A massagem tântrica foi uma descoberta incrível.",
    rating: 5
  },
  {
    id: 3,
    name: "Pedro L.",
    text: "Profissionalismo e simpatia desde o primeiro contato. Senti-me muito à vontade e relaxado. Voltarei com certeza.",
    rating: 5
  }
]

export function Reviews() {
  return (
    <section className="py-20 bg-linear-to-b from-[#feffba42] to-[#fff] text-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-philosopher mb-4 text-slate-900">
            O que dizem nossos clientes
          </h2>
          <div className="w-24 h-0.5 bg-gold mx-auto opacity-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-none border border-slate-700/50">
              <div className="flex gap-1 mb-4 text-pink-300">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-000 mb-6 leading-relaxed italic">
                "{review.text}"
              </p>
              <p className="font-philosopher text-lg text-slate-900">
                {review.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
