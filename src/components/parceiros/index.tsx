import { motion, type Variants } from 'framer-motion'
import SectionHead from '@/components/ui/section-head'

// ─────────────────────────────────────────────────────────────────────────
//  Parceiros & clientes — as marcas e os times com quem construí.
//  Para editar: adicione/remova itens abaixo (logo em /public).
// ─────────────────────────────────────────────────────────────────────────
const PARTNERS = [
  {
    name: 'Thales Group',
    role: 'Jovem Aprendiz · Infraestrutura de TI',
    period: '2023 — 2024',
    desc: 'Redes, IPs, contas de usuário e suporte aos sistemas de uma multinacional de tecnologia.',
    logo: '/thales.png',
  },
  {
    name: 'Next Home',
    role: 'Tráfego & Dev Front-end',
    period: '2025 — hoje',
    desc: 'Sites e landing pages imobiliárias de alta conversão, com campanhas Meta/Google Ads guiadas por dados.',
    logo: '/nexthome.png',
  },
  {
    name: 'A5 Maker',
    role: 'Web & Automação (IoT)',
    period: '2024',
    desc: 'Sistemas embarcados e aplicações web para automação residencial, do hardware ao software.',
    logo: '/a5maker.jpg',
  },
  {
    name: 'Projov',
    role: 'Projetos sociais & tecnologia',
    period: '2024',
    desc: 'Sistemas web corporativos e apoio a iniciativas de fomento tecnológico social.',
    logo: '/projov.jpg',
  },
  {
    name: 'FutFeminino',
    role: 'Front-end / Projetos',
    period: '2024',
    desc: 'Plataforma interativa de engajamento para a comunidade esportiva, com foco em UX e performance.',
    logo: '/futfeminino.png',
  },
]

const EASE = [0.16, 1, 0.3, 1] as const
const grid: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }
const cell: Variants = {
  hidden: { opacity: 0, y: 36, clipPath: 'inset(0 0 100% 0)' },
  show: { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.9, ease: EASE } },
}

/**
 * Parceiros — an editorial strip. Five hairline cells, each with its index,
 * a logo tile that colours on hover, the role and a one-line brief. Snaps
 * horizontally on phones, sits as one row on desktop. A thin ticker of the
 * names runs above it so the section has motion without a widget.
 */
export default function ParceirosSection() {
  const names = [...PARTNERS, ...PARTNERS]
  return (
    <section id="parceiros" className="relative overflow-hidden border-t rule bg-[#05070f] py-24 md:py-32">
      <div aria-hidden className="aurora pointer-events-none absolute inset-0 z-0"><i /></div>
      <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 z-0 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]" />
      <div className="bg-noise pointer-events-none absolute inset-0 z-[1] opacity-[0.05] mix-blend-overlay" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHead
          num="—"
          kicker="Ecossistema"
          size="md"
          title={['Parceiros &', <span key="c" className="text-[#38e0ff]">Clientes</span>]}
          aside={
            <p className="font-editorial text-lg italic leading-snug text-white/50 md:text-xl">
              As marcas e os times com quem construí, codei e entreguei.
            </p>
          }
        />
      </div>

      {/* Name ticker */}
      <div className="marquee-mask relative z-10 mt-14 overflow-hidden border-y rule py-3 md:mt-16" aria-hidden>
        <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
          {names.map((p, i) => (
            <span key={i} className="flex items-center gap-10 font-code text-[11px] uppercase tracking-[0.35em] text-white/40">
              {p.name}
              <span className="h-1 w-1 rounded-full bg-[#2f6bff]" />
            </span>
          ))}
        </div>
      </div>

      {/* Strip */}
      <motion.ul
        variants={grid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10% 0px' }}
        className="no-scrollbar relative z-10 mx-auto flex max-w-6xl snap-x snap-mandatory overflow-x-auto border-b border-l rule md:grid md:grid-cols-5 md:overflow-visible"
      >
        {PARTNERS.map((p, i) => (
          <motion.li
            key={p.name}
            variants={cell}
            className="index-row group min-w-[76vw] snap-start border-r rule px-6 py-7 sm:min-w-[52vw] md:min-w-0 md:px-6 md:py-8"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-sm leading-none text-[#2f6bff]">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-code text-[10px] tracking-[0.3em] text-white/30 tabular-nums">{p.period}</span>
            </div>
            <div className="mt-7 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-2.5 grayscale transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:grayscale-0 group-hover:shadow-[0_18px_40px_-14px_rgba(47,107,255,0.7)]">
              <img src={p.logo} alt={p.name} draggable={false} loading="lazy" className="h-full w-full object-contain" />
            </div>
            <h3 className="mt-6 font-display text-[1.35rem] leading-tight text-[#e9edf7] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
              {p.name}
            </h3>
            <p className="mt-2 font-code text-[10px] uppercase tracking-[0.22em] text-[#6f97ff]">{p.role}</p>
            <p className="mt-4 font-editorial text-[15px] italic leading-snug text-white/45">{p.desc}</p>
          </motion.li>
        ))}
      </motion.ul>
      <p className="relative z-10 mt-4 px-6 text-center font-code text-[10px] tracking-[0.3em] text-white/25 md:hidden">
        ← ARRASTE →
      </p>
    </section>
  )
}
