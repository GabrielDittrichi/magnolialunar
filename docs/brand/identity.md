Design system mobile-first (inspirado no Royal Therapy Spa)

Sem entrar ainda no código do projeto, aqui vai uma base pronta para virar Tailwind:

- Paleta de cores (dark sofisticado)
  
  - Fundo principal:
    - bg-slate-950 ou custom bg-[#05060A]
  - Superfícies:
    - Cards/sections: bg-slate-900 / bg-slate-900/80
  - Dourado / destaque:
    - primary : algo próximo de #D4AF37 (ouro clássico)
    - Variações para hover: #F0D27A
  - Texto:
    - Primário: text-slate-50
    - Secundário: text-slate-300
    - Muted: text-slate-400
  - Estado/feedback (discreto):
    - Sucesso: emerald-400
    - Alerta: amber-400
- Tipografia
  
  - Títulos: serif elegante ou display (ex.: Playfair Display, Cormorant Garamond).
  - Corpo: sans serif limpa (ex.: Inter, Manrope).
  - Mobile-first:
    - text-xl / text-2xl para headings principais,
    - text-sm / text-base para textos.
- Componentes-chave (mobile)
  
  - Header fixo com logo + ícone de menu (hamburger) + CTA WhatsApp flutuante.
  - Botões:
    - Primário: fundo dourado, texto escuro, bordas arredondadas ( rounded-full ).
    - Secundário: borda dourada, fundo transparente, texto dourado.
  - Cards de massagem/terapeuta com:
    - Imagem full width, texto sobreposto com gradient escuro inferior ou bloco abaixo.
  - Seções com bastante breathing room:
    - py-8 / py-10 nas seções.
    - px-4 como padrão horizontal mobile.
- Layout mobile-first
  
  - Breakpoint base: pensar tudo para max-width: 430px primeiro.
  - Grade: 1 coluna por padrão; 2 colunas só em seções com cards pequenos.
  - Navegação sempre com CTAs claros:
    - Botão primário fixo de “Agendar no WhatsApp” visível em quase todas as páginas.
Como isso se traduz em Tailwind (conceitual)

Exemplo de padrão de hero mobile para a home:

```
export function Hero() {
  return (
    <section className="relative flex min-h-[80vh] 
    flex-col justify-end px-4 pb-10 pt-24 text-slate-50">
      <div className="absolute inset-0">
        <img
          src="/images/hero-magnolia.jpg"
          alt="Ambiente intimista da Magnolia Lunar"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] 
        text-slate-300">
          Magnolia Lunar • Lisboa
        </p>
        <h1 className="text-3xl font-semibold 
        leading-tight">
          Um dia relaxante para corpo, mente e sentidos.
        </h1>
        <p className="text-sm text-slate-300">
          Massagens sensoriais em ambiente reservado, 
          com total discrição e cuidado.
        </p>
        <a
          href="https://wa.me/351962252659"
          className="mt-4 inline-flex items-center 
          justify-center rounded-full bg-[#D4AF37] px-6 
          py-3 text-sm font-medium text-slate-950"
        >
          Agendar sessão no WhatsApp
        </a>
      </div>
    </section>
  )
}
```
(Esse código é só referência de como quero estruturar o design mobile: fundo com imagem, overlay escuro, tipografia forte e CTA único bem claro.)

Próximos passos sugeridos

Para não criar arquivos desnecessariamente sem a tua validação, vou propor a próxima etapa e, se você quiser, já parto para a implementação no repo:

1. Assumir que este projeto NoarEcom será o monorepo onde vamos colocar o app da Magnolia Lunar.
2. Criar um app Next.js (App Router) dentro desse repo (ou usar um que você já tenha, se for o caso).
3. Implementar o esqueleto de rotas/páginas que listei ( / , /massagens , /terapeutas , etc.), com layouts já em mobile-first e CTAs funcionando para o WhatsApp da Magnolia.
4. Em paralelo, ir refinando textos e nomes de seções/massagens contigo.
Se você me confirmar que posso começar a subir o esqueleto em Next.js direto nesse repo, eu já parto para:

- Definir app structure
- Configurar Tailwind com essa paleta + tipografia
- Implementar a home mobile com hero + blocos principais alinhados à referência do Royal Therapy Spa.