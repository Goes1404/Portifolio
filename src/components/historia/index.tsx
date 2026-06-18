import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import RevealSpotlight from '@/components/efeito-8-revelar/reveal-spotlight';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────────────────
//  SUAS FOTOS (retrato ao lado da história)
//  Os dois arquivos ficam em /public/reveal/. Para usar as suas fotos, basta
//  substituir esses arquivos mantendo os mesmos nomes (ou trocar os caminhos).
//  Hoje são placeholders gerados automaticamente.
//    1ª imagem → PRETO E BRANCO (aparece em repouso)
//    2ª imagem → COLORIDA       (revelada sob o ponteiro / dedo)
// ─────────────────────────────────────────────────────────────────────────
const FOTO_PB = '/reveal/matheus-pb.jpg';
const FOTO_COLOR = '/reveal/matheus-color.jpg';

const CHAPTERS = [
  {
    num: '01',
    year: '2020',
    keyword: 'APRENDIZ',
    kicker: '// jovem aprendiz em infraestrutura',
    body: 'Comecei cedo — não pela tela, mas pelas entranhas da rede. Como jovem aprendiz em TI, aprendi que tecnologia é camada sobre camada. Servidores, roteadores, logs que não mentem. Essa base virou vantagem permanente.',
    code: `# primeiro dia em produção\nping -c 4 192.168.1.1\n\n64 bytes: icmp_seq=1\n  time=0.8 ms`,
    tags: ['Infraestrutura', 'Redes', 'TI', 'Hands-on'],
    accent: '#2f6bff',
  },
  {
    num: '02',
    year: '2022',
    keyword: 'CONSTRUTOR',
    kicker: '// do infra ao produto digital',
    body: 'A transição para o desenvolvimento foi natural. O nicho imobiliário virou laboratório: landing pages que convertem, sistemas de captação, interfaces que vendem imóveis. Cada projeto exigiu uma solução nova — aprendi fazendo.',
    code: `const projeto = {\n  nicho: 'imobiliário',\n  stack: ['Next.js','React'],\n  meta: 'conversão',\n};`,
    tags: ['Next.js', 'React', 'Node.js', 'Imobiliário'],
    accent: '#38e0ff',
  },
  {
    num: '03',
    year: '2024',
    keyword: 'FULL STACK',
    kicker: '// meu maior projeto até aqui',
    body: 'Toquei a Compromisso — uma plataforma educacional completa — do início ao fim, ao lado de um único parceiro e à frente de todo o desenvolvimento. Em paralelo, concilio freelancing, a FIAP (Engenharia de Software) e projetos de automação residencial (IoT). Da interface ao hardware — e foi onde mais aprendi.',
    code: `ship({\n  projeto: 'Compromisso',\n  papel: 'à frente do dev',\n  time: 'eu + 1 parceiro',\n  iot: true,\n});`,
    tags: ['Full Stack', 'EdTech', 'IoT', 'Next.js'],
    accent: '#e9edf7',
  },
] as const;

// Font geometry: Boldonse line-height 0.88 — container matches so y:±100% = one full slot.
// Keep container slightly generous (1.1×) to avoid cap-height clipping on any OS.
// Mobile floor kept low (1.85rem) so wide 10-char words like AUTODIDATA/CONSTRUTOR
// fit on a 320–375px screen without the whitespace-nowrap line clipping.
const KW_FS = 'clamp(1.85rem, 8.5vw, 9rem)';
const KW_H  = 'clamp(2.05rem, 9.35vw, 9.9rem)'; // 1.1 × KW_FS

const EASE_IN  = [0.16, 1, 0.3, 1]    as const;
const EASE_OUT = [0.4,  0, 0.6, 1]    as const;

export default function HistoriaSection() {
  const trackRef    = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null); // left rail fill
  const accentRef   = useRef<HTMLDivElement>(null); // keyword underline
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const n = CHAPTERS.length;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;

        // Left rail — direct DOM, no re-render
        if (progressRef.current) {
          progressRef.current.style.height = `${p * 100}%`;
        }

        // Compute current chapter here (avoids stale closure on idx)
        const next    = Math.min(n - 1, Math.floor(p * n));
        // Local progress 0→1 within the current chapter
        const chLocal = Math.min(1, p * n - next);
        if (accentRef.current) {
          accentRef.current.style.transform = `scaleX(${chLocal})`;
        }

        setIdx((prev) => (prev !== next ? next : prev));
      },
    });

    return () => st.kill();
  }, []);

  // Reset underline bar when chapter index changes
  useEffect(() => {
    if (accentRef.current) accentRef.current.style.transform = 'scaleX(0)';
  }, [idx]);

  const ch = CHAPTERS[idx];

  return (
    <div ref={trackRef} className="relative bg-[#05070f]" style={{ height: '400vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#05070f]">

        {/* Ambient chapter glow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`glow-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(58% 58% at 74% 52%, ${ch.accent}1c 0%, transparent 68%)`,
            }}
          />
        </AnimatePresence>

        {/* Giant watermark number */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 select-none font-display text-white leading-none"
          style={{ fontSize: '32vw', bottom: '-0.05em', opacity: 0.045 }}
        >
          {ch.num}
        </span>

        {/* ── Left progress rail ── */}
        <div className="absolute left-6 top-0 bottom-0 hidden md:flex flex-col items-center py-14 z-30">
          <div className="relative flex-1 w-px bg-white/[0.10]">
            <div
              ref={progressRef}
              className="absolute top-0 left-0 w-full"
              style={{ height: '0%', background: ch.accent, transition: 'background 0.7s' }}
            />
          </div>
          <div className="flex flex-col gap-3 mt-5">
            {CHAPTERS.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i === idx ? 1.7 : 1,
                  backgroundColor: i === idx ? ch.accent : 'rgba(255,255,255,0.18)',
                }}
                transition={{ duration: 0.4 }}
                className="h-1.5 w-1.5 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* ── Chapter content ── */}
        <div className="relative h-full flex flex-col justify-center pl-6 pr-5 md:pl-24 md:pr-10 max-w-[88rem] mx-auto">

          {/* Year · kicker · counter */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`meta-${idx}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_IN } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.26 } }}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 md:mb-7"
            >
              <span className="font-code text-[11px] tracking-[0.45em] text-white/35 tabular-nums">
                {ch.year}
              </span>
              <span className="hidden h-px w-10 shrink-0 bg-white/[0.18] sm:block" />
              <span className="font-code text-[11px] tracking-widest" style={{ color: ch.accent }}>
                {ch.kicker}
              </span>
              <span className="ml-auto hidden sm:block font-code text-[11px] tracking-widest text-white/[0.18]">
                {ch.num}&thinsp;/&thinsp;0{CHAPTERS.length}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* ── Keyword reveal — slides up from below ── */}
          <div
            className="overflow-hidden relative"
            style={{ height: KW_H }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={`kw-${idx}`}
                initial={{ y: '104%' }}
                animate={{ y: '0%', transition: { duration: 0.74, ease: EASE_IN } }}
                exit={{ y: '-104%', transition: { duration: 0.44, ease: EASE_OUT } }}
                className="absolute bottom-0 inset-x-0 font-display text-[#e9edf7] whitespace-nowrap"
                style={{
                  fontSize: KW_FS,
                  lineHeight: '0.88',
                  textShadow: `0 0 120px ${ch.accent}28`,
                }}
              >
                {ch.keyword}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Accent underline — grows with scroll progress within the chapter */}
          <div className="relative mt-4 mb-6 md:mt-5 md:mb-9" style={{ height: '2px' }}>
            <div className="absolute inset-0 bg-white/[0.08]" />
            <div
              ref={accentRef}
              className="absolute inset-0 origin-left"
              style={{
                background: ch.accent,
                transform: 'scaleX(0)',
                transition: 'background 0.7s',
              }}
            />
          </div>

          {/* Body row: chapter text (cycles) sits beside the portrait (persistent) */}
          <div className="flex flex-row items-center gap-4 sm:gap-7 md:gap-12 lg:gap-16">

            {/* ── Left: body text + tags + code — re-animates each chapter ── */}
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`body-${idx}`}
                  initial={{ opacity: 0, y: 30, filter: 'blur(14px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.68, delay: 0.1, ease: EASE_IN } }}
                  exit={{ opacity: 0, y: -14, filter: 'blur(8px)', transition: { duration: 0.3 } }}
                  className="flex flex-col gap-5 md:gap-6"
                >
                  <p className="max-w-xl font-editorial text-base italic leading-snug text-white/[0.60] sm:text-xl md:text-[1.35rem]">
                    {ch.body}
                  </p>
                  {/* Skill / trait tags */}
                  <div className="flex flex-wrap gap-2">
                    {ch.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border px-3 py-1.5 font-code text-[10px] uppercase tracking-[0.3em]"
                        style={{
                          color: ch.accent,
                          borderColor: `${ch.accent}28`,
                          background: `${ch.accent}0a`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Code snippet — only on lg+, where there's vertical room beside the portrait */}
                  <pre
                    className="hidden w-fit rounded-2xl border px-6 py-5 font-code text-sm leading-relaxed lg:block"
                    style={{
                      color: ch.accent,
                      borderColor: `${ch.accent}20`,
                      background: `${ch.accent}08`,
                      boxShadow: `0 0 50px ${ch.accent}0f`,
                    }}
                  >
                    {ch.code}
                  </pre>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Right: the reveal portrait — stays put as the chapters change ── */}
            {/* Mobile: a compact column beside the text. md+: sized by available
                viewport HEIGHT (not width) so it grows on tall screens yet never
                clips inside the pinned 100vh frame on short laptops. */}
            <figure className="m-0 w-[46%] max-w-[190px] shrink-0 sm:max-w-[230px] md:w-[min(460px,42vh)] md:max-w-none">
              <RevealSpotlight
                bwSrc={FOTO_PB}
                colorSrc={FOTO_COLOR}
                alt="Matheus Goes da Silva"
                hint="passe o mouse · arraste o dedo"
              />
              <figcaption className="mt-3 font-code text-[10px] uppercase tracking-[0.3em] text-white/30">
                preto &amp; branco&nbsp;&nbsp;⇄&nbsp;&nbsp;cor
              </figcaption>
            </figure>
          </div>

          {/* Scroll hint — first chapter only */}
          {idx === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.1, duration: 0.7 } }}
              className="absolute bottom-10 left-6 md:bottom-12 md:left-24 font-code text-[10px] uppercase tracking-[0.45em] text-white/[0.22]"
            >
              role para continuar
            </motion.p>
          )}
        </div>

        {/* Bottom fade into next section */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#05070f] to-transparent" />
      </div>
    </div>
  );
}
