import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ScrollReveal from '@/components/effects/ScrollReveal';
import Magnetic from '@/components/effects/Magnetic';
import ParticleField from '@/components/effects/ParticleField';
import InkReveal from '@/components/ui/ink-reveal';

const STATS = [
  { value: 'FIAP',        label: 'Engenharia de Software',   sub: 'Conclusão em 2028' },
  { value: 'Thales',      label: 'Multinacional Tech',       sub: 'Fundações em Infraestrutura' },
  { value: 'Freelancer',  label: 'Aplicações Web & Design',  sub: 'Projetos Reais no Ar' },
  { value: 'Dev + Dados', label: 'Performance & Analytics',  sub: 'Web · Tráfego · Power BI' },
];

const inView = { once: true, margin: '-10% 0px -10% 0px' };

const rise = {
  hidden: { opacity: 0, y: 48, filter: 'blur(12px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
};

export default function HistoriaIntro() {
  // Scroll-linked entry/exit envelope. Measured on a STATIC wrapper (never
  // transformed) so the rect stays stable; the transforms drive an inner layer.
  // 0 → content top hits viewport bottom · 1 → content bottom leaves the top.
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ['start end', 'end start'],
  });

  // Float in from below + settle, hold, then drift up on the way out (parallax).
  const envY     = useTransform(scrollYProgress, [0, 0.2, 0.75, 1], [24, 0, 0, -80]);
  // Subtle depth — eases in, then recedes slightly as it leaves.
  const envScale = useTransform(scrollYProgress, [0, 0.2, 0.75, 1], [0.99, 1, 1, 0.98]);
  // Opacity is owned by the exit only, and only once the block is truly leaving.
  const envOpacity = useTransform(scrollYProgress, [0.88, 1], [1, 0]);

  return (
    <section
      id="historia"
      className="relative scroll-mt-20 bg-[#05070f] px-6 pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden"
    >
      {/* Background glow that is revealed by the ink mask */}
      <div
        className="absolute inset-0 z-0 opacity-90 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(47, 107, 255, 0.4) 0%, rgba(56, 224, 255, 0.2) 35%, rgba(10, 31, 107, 0.35) 65%, transparent 80%)'
        }}
      />

      {/* interactive constellation — sparse, low-opacity, reacts to the cursor.
          Sits behind everything; pointer-events-none so it never blocks text. */}
      <ParticleField
        className="pointer-events-none absolute inset-0 opacity-[0.85] z-0"
        maxParticles={80}
        density={0.00015}
        linkDist={140}
        color="255, 255, 255"
      />

      {/* Ink reveal canvas masking layer */}
      <InkReveal maskColor={[5, 7, 15]} className="z-0" />

      {/* grain */}
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.04] z-10" />

      {/* faint top rule separating from hero */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent z-10" />

      {/* static measure wrapper (keeps the centering/max-width + stacking) */}
      <div ref={contentRef} className="relative mx-auto max-w-6xl z-10">
      {/* scroll-linked entry/exit envelope */}
      <motion.div style={{ y: envY, scale: envScale, opacity: envOpacity }} className="origin-center">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inView}
      >
        {/* kicker */}
        <motion.div variants={rise} className="flex items-center gap-4 mb-14">
          <span className="font-display text-sm leading-none text-[#2f6bff]">01</span>
          <span className="h-px w-10 bg-[#2f6bff]" />
          <span className="font-code text-[11px] uppercase tracking-[0.35em] text-white/50">
            Trajetória
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14 lg:gap-20 items-start">

          {/* ── LEFT: quem é o Matheus ── */}
          <div>
            {/* Section heading */}
            <motion.h2
              variants={rise}
              className="font-display leading-none text-[#e9edf7] mb-10"
              style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}
            >
              Minha{' '}
              <motion.span
                style={{ color: '#2f6bff' }}
                animate={{ color: ['#2f6bff', '#38e0ff', '#2f6bff'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                História
              </motion.span>
            </motion.h2>

            {/* Primary bio */}
            <motion.p
              variants={rise}
              className="font-editorial text-2xl italic leading-snug text-white/65 max-w-2xl mb-6 md:text-[1.65rem]"
            >
              Sou o Matheus — desenvolvedor full stack apaixonado por construir
              soluções digitais completas. Comecei como jovem aprendiz em
              infraestrutura e evolui naturalmente para o desenvolvimento de
              produtos que as pessoas realmente usam.
            </motion.p>

            {/* Secondary bio */}
            <motion.p
              variants={rise}
              className="font-editorial text-xl italic leading-relaxed text-white/42 max-w-xl mb-12 md:text-[1.25rem]"
            >
              Hoje concilio a atuação como freelancer e analista de tráfego com
              minha formação em Engenharia de Software pela FIAP. Do setor
              imobiliário a uma plataforma educacional própria — e do código à
              análise de dados e performance — meu foco é entregar interfaces
              limpas e resultado real.
            </motion.p>

            {/* Availability pill — gently pulled toward the cursor (Magnetic) */}
            <Magnetic strength={0.4}>
              <motion.div
                variants={rise}
                className="inline-flex items-center gap-3 rounded-full px-5 py-2.5 border"
                style={{
                  borderColor: 'rgba(47,107,255,0.28)',
                  background: 'rgba(47,107,255,0.06)',
                }}
              >
                <span
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: '#2f6bff' }}
                />
                <span className="font-code text-xs tracking-[0.28em] uppercase text-[#6f97ff]">
                  Aberto a estágio e vagas júnior
                </span>
              </motion.div>
            </Magnetic>

            {/* Horizontal divider before the scroll hint */}
            <motion.div
              variants={rise}
              className="mt-16 flex items-center gap-4 text-white/20"
            >
              <span className="h-px flex-1 bg-white/[0.07]" />
              <span className="font-code text-[10px] tracking-[0.4em] uppercase">
                role para ver a trajetória
              </span>
              <span className="h-px w-10 bg-white/[0.07]" />
            </motion.div>
          </div>

          {/* ── RIGHT: stats — a hairline ledger; each cell unmasks with a clip-path curtain ── */}
          <div className="grid grid-cols-2 border-l border-t rule lg:grid-cols-1">
            {STATS.map((s, i) => (
              <ScrollReveal
                key={s.value}
                direction="up"
                duration={1}
                lift={24}
                start={`top ${90 - i * 2}%`}
                className="border-b border-r rule"
              >
                <div className="index-row group relative px-5 py-6 lg:px-7 lg:py-7">
                  <span className="font-code text-[10px] tracking-[0.3em] text-white/30">0{i + 1}</span>
                  <div
                    className="mt-3 font-display leading-[1.05] text-[#e9edf7] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                    style={{ fontSize: 'clamp(1.15rem, 4.2vw, 1.9rem)' }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-2 font-code text-[10px] uppercase tracking-[0.18em] text-white/55">
                    {s.label}
                  </div>
                  <div className="mt-1 font-code text-[10px] tracking-widest text-white/28">
                    {s.sub}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </motion.div>
      </motion.div>
      </div>

      {/* bottom fade into HistoriaSection */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2f6bff]/20 to-transparent" />
    </section>
  );
}
