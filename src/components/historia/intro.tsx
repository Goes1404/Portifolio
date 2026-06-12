import { motion } from 'framer-motion';

const STATS = [
  { value: 'FIAP',        label: 'Engenharia de Software',  sub: 'formação em andamento' },
  { value: 'Full Stack',  label: 'front · back · infra',    sub: 'end-to-end' },
  { value: 'Freelancer',  label: 'projetos ativos',          sub: 'nicho imobiliário' },
  { value: 'IoT + Web',   label: 'software & hardware',      sub: 'automação residencial' },
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
  return (
    <section
      id="historia"
      className="relative scroll-mt-20 bg-[#05070f] px-6 pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden"
    >
      {/* grain */}
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.04]" />

      {/* faint top rule separating from hero */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="relative mx-auto max-w-6xl"
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
              Minha <span style={{ color: '#2f6bff' }}>História</span>
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
              Hoje concilio a atuação como freelancer com minha formação em
              Engenharia de Software pela FIAP. Do nicho imobiliário a plataformas
              educacionais — e da web à integração com hardware via IoT —
              meu foco é sempre entregar código limpo e impacto real.
            </motion.p>

            {/* Availability pill */}
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
                Disponível para novos projetos
              </span>
            </motion.div>

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

          {/* ── RIGHT: stats ── */}
          <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {STATS.map((s) => (
              <motion.div
                key={s.value}
                variants={rise}
                className="rounded-2xl border px-6 py-5"
                style={{
                  borderColor: 'rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.025)',
                }}
              >
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* bottom fade into HistoriaSection */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2f6bff]/20 to-transparent" />
    </section>
  );
}
