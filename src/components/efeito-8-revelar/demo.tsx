import { motion } from "framer-motion";
import RevealSpotlight from "@/components/efeito-8-revelar/reveal-spotlight";

// ─────────────────────────────────────────────────────────────────────────
//  SUAS FOTOS
//  Os dois arquivos ficam em /public/reveal/. Para usar as suas fotos, basta
//  substituir esses arquivos mantendo os mesmos nomes (ou trocar os caminhos
//  abaixo). Hoje são placeholders gerados automaticamente.
//    1ª imagem → PRETO E BRANCO (aparece em repouso)
//    2ª imagem → COLORIDA       (revelada sob o ponteiro / dedo)
// ─────────────────────────────────────────────────────────────────────────
const FOTO_PB = "/reveal/matheus-pb.png";
const FOTO_COLOR = "/reveal/matheus-color.png";

const rise = {
  hidden: { opacity: 0, y: 56, filter: "blur(14px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
  },
};
const group = { hidden: {}, show: { transition: { staggerChildren: 0.14 } } };
const inView = { once: true, margin: "-12% 0px -12% 0px" } as const;

export default function RevealDemo() {
  return (
    <section
      id="retrato"
      className="bg-grain relative scroll-mt-24 overflow-hidden border-t rule bg-[#05070f] px-6 py-20 md:py-32"
    >
      {/* Faint watermark, in the same vein as the numbered section markers */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-2 top-6 select-none font-display text-[26vw] leading-none text-white/[0.03] md:text-[15vw]"
      >
        RETRATO
      </span>

      <motion.div
        variants={group}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16"
      >
        {/* Copy */}
        <div className="order-2 md:order-1">
          <motion.div variants={rise} className="flex items-center gap-4">
            <span className="h-px w-10 bg-brand" />
            <span className="font-code text-xs uppercase tracking-[0.35em] text-white/50">
              Retrato · Interativo
            </span>
          </motion.div>

          <motion.h2
            variants={rise}
            className="mt-7 font-display text-[12vw] leading-[0.95] text-[#e9edf7] sm:text-5xl md:text-6xl"
          >
            Da sombra<br />à cor
          </motion.h2>

          <motion.p
            variants={rise}
            className="mt-7 max-w-md font-editorial text-2xl italic leading-snug text-white/55 md:text-3xl"
          >
            Passe o mouse — ou arraste o dedo — sobre a foto. A cor aparece só
            onde a luz toca.
          </motion.p>

          <motion.div
            variants={rise}
            className="mt-8 flex items-center gap-3 font-code text-[11px] uppercase tracking-[0.3em] text-white/35"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            preto &amp; branco&nbsp;&nbsp;⇄&nbsp;&nbsp;cor
          </motion.div>
        </div>

        {/* The reveal */}
        <motion.div variants={rise} className="order-1 mx-auto w-full max-w-[420px] md:order-2">
          <RevealSpotlight
            bwSrc={FOTO_PB}
            colorSrc={FOTO_COLOR}
            alt="Matheus Goes da Silva"
            hint="passe o mouse · arraste o dedo"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
