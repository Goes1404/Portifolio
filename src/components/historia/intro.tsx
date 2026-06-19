import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ScrollReveal from '@/components/effects/ScrollReveal';
import Magnetic from '@/components/effects/Magnetic';
import Tilt3D from '@/components/effects/Tilt3D';
import ParticleField from '@/components/effects/ParticleField';

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
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
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
  const envY     = useTransform(scrollYProgress, [0, 0.2, 0.62, 1], [24, 0, 0, -120]);
  // Subtle depth — eases in, then recedes slightly as it leaves.
  const envScale = useTransform(scrollYProgress, [0, 0.2, 0.62, 1], [0.99, 1, 1, 0.97]);
  // Opacity is owned by the exit only (the entry fade belongs to the cascade).
  const envOpacity = useTransform(scrollYProgress, [0.7, 0.95], [1, 0]);
  // Soft defocus as the block exits the top of the viewport.
  const envBlur  = useTransform(scrollYProgress, [0.72, 0.97], ['blur(0px)', 'blur(6px)']);

  return (
    <section
      id="historia"
      className="relative scroll-mt-20 bg-[#05070f] px-6 pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden"
    >
      {/* interactive constellation — sparse, low-opacity, reacts to the cursor.
          Sits behind everything; pointer-events-none so it never blocks text. */}
      <ParticleField
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        maxParticles={24}
        linkDist={160}
        color="47, 107, 255"
      />

      {/* grain */}
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.04]" />

      {/* faint top rule separating from hero */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* static measure wrapper (keeps the centering/max-width + stacking) */}
      <div ref={contentRef} className="relative mx-auto max-w-6xl">
      {/* scroll-linked entry/exit envelope */}
      <motion.div style={{ y: envY, scale: envScale, opacity: envOpacity, filter: envBlur }} className="origin-center">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inView}
      >
        {/* kicker */}
        <motion.div variants={rise} className="flex items-center gap-4 mb-14">
          <span className="h-px w-10 bg-[#2f6bff]" />
          <span className="font-code text-xs uppercase tracking-[0.35em] text-white/50">
            01 — Trajetória
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14 lg:gap-20 items-start">

          {/* ── LEFT: quem é o Matheus ── */}
          <div>
            {/* Section heading */}
            <motion.h2
              variants={rise}
              className="font-display leading-[0.88] text-[#e9edf7] mb-10"
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

          {/* ── RIGHT: stats — each card unmasks with a clip-path curtain ── */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {STATS.map((s, i) => (
              <Tilt3D
                key={s.value}
                max={8}
                scale={1.02}
                className="relative self-start rounded-2xl"
              >
                <ScrollReveal
                  direction="up"
                  duration={1}
                  lift={28}
                  start={`top ${88 - i * 2}%`}
                  className="rounded-2xl"
                >
                  {/* base border/bg moved to Tailwind classes (identical values)
                      so the hover glow can override them */}
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] px-6 py-5 transition-colors duration-300 hover:border-[rgba(47,107,255,0.45)] hover:bg-white/[0.05]">
                    <div
                      className="font-display leading-none mb-1.5"
                      style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', color: '#e9edf7' }}
                    >
                      {s.value}
                    </div>
                    <div className="font-code text-[11px] tracking-[0.18em] uppercase text-white/50 mb-0.5">
                      {s.label}
                    </div>
                    <div className="font-code text-[10px] tracking-widest text-white/25">
                      {s.sub}
                    </div>
                  </div>
                </ScrollReveal>
              </Tilt3D>
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
