import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useScroll } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { ArrowDown, ArrowUpRight, Code2, Globe, Mail, MessageCircle } from 'lucide-react'
import {
  CustomCursor,
  ParticleField,
  Magnetic,
  SplitReveal,
  ScrollVelocity,
  LiquidText,
  ScrambleText,
} from '@/components/effects'
import Preloader from '@/components/shell/Preloader'
import { shouldPreload } from '@/components/shell/preload'
import Header from '@/components/shell/Header'
import SectionNav from '@/components/shell/SectionNav'
import LocalClock from '@/components/shell/LocalClock'
import useActiveSection from '@/hooks/useActiveSection'
import SkillsShowcase from '@/components/skills'
import HeroScrollDemo from '@/components/efeito-4-container-scroll/demo'
import ProjetosHeroScrub from '@/components/efeito-7-projetos/demo'
import HistoriaSection from '@/components/historia'
import HistoriaIntro from '@/components/historia/intro'
import ExperienciaSection from '@/components/experiencia'
import ParceirosSection from '@/components/parceiros'
import { ShaderBackground } from '@/components/ui/animated-shader-hero'

const NAV = [
  { num: '01', label: 'História', href: '#historia' },
  { num: '02', label: 'Experiência', href: '#experiencia' },
  { num: '03', label: 'Projetos', href: '#projetos' },
  { num: '04', label: 'Skills', href: '#skills' },
  { num: '05', label: 'Contato', href: '#contato' },
]
const SECTION_IDS = ['top', 'historia', 'experiencia', 'projetos', 'skills', 'contato']

const STACK = [
  'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js',
  'Node.js', 'Tailwind', 'Python', 'SQL', 'PostgreSQL', 'Power BI', 'Git',
]

// ── PREENCHA COM SEUS LINKS REAIS ──────────────────────────────────────────
// Deixe '' (vazio) para esconder o item — assim nenhum link quebrado vai ao ar.
const GITHUB_URL = 'https://github.com/Goes1404'
const REPO_URL = 'https://github.com/Goes1404/Portifolio' // código-fonte deste site
const LINKEDIN_URL = 'https://www.linkedin.com/in/matheus-goes-da-silva'
const EMAIL = 'sq1matheusgsilva@gmail.com'
// WhatsApp: número no formato internacional (55 = Brasil, 11 = São Paulo)
const WHATSAPP_URL = 'https://wa.me/5511950085875'
const CV_URL = '/cv.pdf' // arquivo em public/cv.pdf

gsap.registerPlugin(ScrollTrigger)

const EASE = [0.16, 1, 0.3, 1]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

// Surge: element rises from below + resolves out of blur + subtle zoom.
const rise = {
  hidden: { opacity: 0, y: 64, filter: 'blur(16px)', scale: 0.97 },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
    transition: { duration: 1.1, ease: EASE },
  },
}

// Hero name lines rise out of a mask — cleaner than a blur for giant type.
const lineMask = {
  hidden: { y: '110%', rotate: 2 },
  show: { y: '0%', rotate: 0, transition: { duration: 1.2, ease: EASE } },
}

const riseGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
}
const inView = { once: true, margin: '-12% 0px -12% 0px' }

// Infinite editorial ticker
function Marquee() {
  const row = [...STACK, ...STACK]
  return (
    <div className="marquee-mask relative w-full overflow-hidden border-y rule py-4">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {row.map((tech, i) => (
          <span key={i} className="flex items-center gap-8 font-code text-sm tracking-wide text-white/40">
            {tech}
            <span className="text-[#2f6bff]">/</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// Giant outlined/filled alternating marquee used before the footer.
function BigMarquee({ words }) {
  const row = [...words, ...words]
  return (
    <div className="marquee-mask relative overflow-hidden border-y rule py-6 md:py-8" aria-hidden>
      <div className="animate-marquee-slow flex w-max items-center gap-10 whitespace-nowrap">
        {row.map((w, i) => (
          <span
            key={i}
            className={`font-display leading-none ${i % 2 ? 'text-outline' : 'text-[#e9edf7]'}`}
            style={{ fontSize: 'clamp(3rem, 9vw, 8rem)' }}
          >
            {w}
            <span className="ml-10 inline-block h-[0.25em] w-[0.25em] rounded-full bg-[#2f6bff] align-middle" />
          </span>
        ))}
      </div>
    </div>
  )
}

function App() {
  const { scrollYProgress } = useScroll()
  const lenisRef = useRef(null)
  const heroTrackRef = useRef(null)
  const [preloading, setPreloading] = useState(() => shouldPreload())
  const ready = !preloading
  const activeId = useActiveSection(SECTION_IDS)
  const onPreloaded = useCallback(() => setPreloading(false), [])

  // Global Lenis smooth-scroll, synced with GSAP ticker
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(raf); lenis.destroy(); lenisRef.current = null }
  }, [])

  // Hold the page still while the preloader plays
  useEffect(() => {
    const lenis = lenisRef.current
    if (preloading) { lenis?.stop(); window.scrollTo(0, 0) }
    else lenis?.start()
  }, [preloading])

  // Hero depth-parallax: each [data-hero-layer] wrapper moves at its own velocity.
  useEffect(() => {
    const track = heroTrackRef.current
    if (!track) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 1.5 },
      })
      tl.to('[data-hero-layer="meta"]',    { y: '-90vh', ease: 'none' }, 0)
      tl.to('[data-hero-layer="line1"]',   { y: '-75vh', ease: 'none' }, 0)
      tl.to('[data-hero-layer="line2"]',   { y: '-55vh', x: '2.5vw', ease: 'none' }, 0)
      tl.to('[data-hero-layer="line3"]',   { y: '-35vh', ease: 'none' }, 0)
      tl.to('[data-hero-layer="tagline"]', { y: '-15vh', ease: 'none' }, 0)
      tl.to('[data-hero-layer="veil"]',    { opacity: 0.55, ease: 'none' }, 0)
      tl.to('[data-hero-layer="cue"]',     { opacity: 0, ease: 'none', duration: 0.25 }, 0)
    }, track)
    return () => ctx.revert()
  }, [])

  const handleNav = useCallback((e, href) => {
    e.preventDefault()
    requestAnimationFrame(() => lenisRef.current?.scrollTo(href, { offset: -72 }))
  }, [])

  return (
    <div className="relative min-h-screen bg-[#05070f] text-[#e9edf7] selection:bg-[#2f6bff] selection:text-white">
      {preloading && <Preloader onDone={onPreloaded} />}

      <CustomCursor />

      {/* Scroll-progress thread */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed left-0 top-0 z-[110] h-0.5 w-full origin-left bg-gradient-to-r from-[#2f6bff] via-[#6f97ff] to-[#38e0ff]"
      />

      {/* Film-grain overlay */}
      <div className="bg-noise pointer-events-none fixed inset-0 z-[100] opacity-[0.07] mix-blend-overlay" />

      <SectionNav nav={NAV} activeId={activeId} onNav={handleNav} />

      <Header nav={NAV} email={EMAIL} whatsapp={WHATSAPP_URL} onNav={handleNav} activeId={activeId} />

      {/* ── HERO: sticky scroll track ───────────────────────── */}
      <main
        id="top"
        ref={heroTrackRef}
        className="relative bg-grain bg-[#05070f]"
        style={{ height: '240vh' }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <ShaderBackground className="pointer-events-none absolute inset-0 z-0" />
          <ParticleField className="pointer-events-none absolute inset-0 z-[1]" />

          {/* Readability veil (z-2) — fades via GSAP as you scroll in */}
          <div
            data-hero-layer="veil"
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2]"
            style={{
              background:
                'radial-gradient(130% 120% at 28% 42%, rgba(5,7,15,0.88) 0%, rgba(5,7,15,0.4) 48%, rgba(5,7,15,0) 72%)',
            }}
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            animate={ready ? 'show' : 'hidden'}
            className="relative z-10 mx-auto flex h-full max-w-[88rem] flex-col justify-center gap-1 px-6 pb-20 pt-16 sm:px-8 md:gap-2"
          >
            <div data-hero-layer="meta" className="will-change-transform">
              <motion.div variants={rise} className="flex flex-wrap items-center gap-x-6 gap-y-2 font-code text-[11px] tracking-[0.3em] text-white/45 sm:text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#38e0ff] shadow-[0_0_10px_#38e0ff]" />
                  <ScrambleText playOnMount={ready} duration={900}>ABERTO A ESTÁGIO · VAGAS JÚNIOR</ScrambleText>
                </span>
                <span className="hidden sm:inline">·</span>
                <span><ScrambleText playOnMount={ready} duration={900}>SÃO PAULO · BR</ScrambleText></span>
                <span className="hidden sm:inline">·</span>
                <span><ScrambleText playOnMount={ready} duration={900}>PORTFÓLIO — ED. 2026</ScrambleText></span>
              </motion.div>
            </div>

            <div data-hero-layer="line1" className="will-change-transform">
              <h1 className="mt-5 overflow-hidden pb-[0.06em] font-display text-[clamp(2.4rem,9.2vw,7.6rem)] leading-[0.92] tracking-[-0.025em] text-[#e9edf7]">
                <motion.span variants={lineMask} className="block origin-left">Matheus</motion.span>
              </h1>
            </div>

            <div data-hero-layer="line2" className="will-change-transform">
              <h1 className="overflow-hidden pb-[0.06em] font-display text-[clamp(2.4rem,9.2vw,7.6rem)] leading-[0.92] tracking-[-0.025em] text-[#e9edf7] md:ml-[16%]">
                <motion.span variants={lineMask} className="block origin-left">
                  Goes <span className="text-gradient-anim">da</span>
                </motion.span>
              </h1>
            </div>

            <div data-hero-layer="line3" className="will-change-transform">
              <h1 className="overflow-hidden pb-[0.06em] font-display text-[clamp(2.4rem,9.2vw,7.6rem)] leading-[0.92] tracking-[-0.025em] text-[#e9edf7] md:ml-[5%]">
                <motion.span variants={lineMask} className="block origin-left">
                  <LiquidText data-cursor="liquid">Silva</LiquidText>
                </motion.span>
              </h1>
            </div>

            <div data-hero-layer="tagline" className="will-change-transform">
              <motion.div variants={rise} className="mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-5 md:ml-auto md:max-w-md md:text-right">
                <p className="font-editorial text-lg italic leading-snug text-white/65 sm:text-2xl md:text-3xl">
                  Desenvolvedor Full Stack — transformo ideias em produtos
                  digitais que as pessoas gostam de usar.
                </p>
                <Magnetic strength={0.5} className="md:self-end">
                  <a
                    href="#historia"
                    onClick={(e) => handleNav(e, '#historia')}
                    data-cursor="rolar"
                    className="group cta-press inline-flex items-center justify-start gap-2 font-code text-sm tracking-widest text-[#2f6bff] md:justify-end"
                  >
                    <span className="link-underline">CONHEÇA A HISTÓRIA</span>
                    <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
                  </a>
                </Magnetic>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll cue — bottom-left, fades out as the parallax begins */}
          <motion.div
            data-hero-layer="cue"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0, transition: { delay: 1.4, duration: 0.8 } }}
            className="absolute bottom-24 left-6 z-20 hidden items-center gap-3 sm:flex sm:left-8"
            aria-hidden
          >
            <span className="relative block h-12 w-px overflow-hidden bg-white/15">
              <span className="scroll-cue absolute left-0 top-0 h-6 w-px bg-[#38e0ff]" />
            </span>
            <span className="font-code text-[10px] uppercase tracking-[0.4em] text-white/40">Scroll</span>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 z-20">
            <ScrollVelocity maxSkew={9}>
              <Marquee />
            </ScrollVelocity>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[19] h-36 bg-gradient-to-t from-[#05070f] to-transparent" />
        </div>
      </main>

      {/* ── 01 · HISTÓRIA ────────────────────────────────────── */}
      <HistoriaIntro />
      <HistoriaSection />

      {/* ── 02 · EXPERIÊNCIA ─────────────────────────────────── */}
      <ExperienciaSection />

      {/* ── Parceiros & Clientes ───────────────────────────────── */}
      <ParceirosSection />

      {/* ── 03 · PROJETOS ────────────────────────────────────── */}
      <div id="projetos" className="scroll-mt-24">
        <HeroScrollDemo />
        <ProjetosHeroScrub />
      </div>

      {/* ── 04 · SKILLS ──────────────────────────────────────── */}
      <SkillsShowcase />

      {/* ── 05 · CONTATO ─────────────────────────────────────── */}
      <BigMarquee words={['Vamos construir algo juntos', 'Aberto a estágio & júnior', 'Full Stack · São Paulo']} />

      <footer id="contato" className="bg-grain relative overflow-hidden px-6 py-24 scroll-mt-24 sm:px-8 md:py-36">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-4 bottom-0 select-none font-display text-[30vw] leading-none text-white/[0.03] md:text-[18vw]"
        >
          OLÁ
        </span>
        <motion.div
          variants={riseGroup}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="relative mx-auto max-w-6xl"
        >
          <motion.div variants={rise} className="flex flex-wrap items-center justify-between gap-4">
            <span className="flex items-center gap-4">
              <span className="font-display text-sm leading-none text-[#2f6bff]">05</span>
              <span className="h-px w-10 bg-[#2f6bff]" />
              <span className="font-code text-[11px] uppercase tracking-[0.35em] text-white/50">Contato</span>
            </span>
            <LocalClock />
          </motion.div>

          <h2
            className="mt-8 font-display text-[13vw] leading-[1.02] text-[#e9edf7] sm:text-6xl md:text-8xl"
            aria-label="Vamos construir algo juntos?"
          >
            <SplitReveal as="span" className="block">Vamos construir</SplitReveal>
            <SplitReveal as="span" className="block text-[#2f6bff]" start="top 90%">algo juntos?</SplitReveal>
          </h2>

          <motion.div variants={rise} className="mt-14 flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <Magnetic strength={0.3}>
              <a
                href={`mailto:${EMAIL}`}
                data-cursor="escrever"
                className="group inline-flex max-w-full items-center gap-2 border-b-2 border-[#2f6bff] pb-2 font-editorial text-lg italic text-[#e9edf7] transition-colors hover:text-[#2f6bff] sm:gap-3 sm:text-2xl md:text-4xl"
              >
                <LiquidText as="span" className="break-words">{EMAIL}</LiquidText>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-[#2f6bff] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:h-6 sm:w-6" />
              </a>
            </Magnetic>

            <div className="flex items-center gap-3">
              {[
                { icon: Code2,         label: 'GitHub',   href: GITHUB_URL },
                { icon: Globe,         label: 'LinkedIn', href: LINKEDIN_URL },
                { icon: MessageCircle, label: 'WhatsApp', href: WHATSAPP_URL },
                { icon: Mail,          label: 'E-mail',   href: `mailto:${EMAIL}` },
              ].filter((s) => s.href).map(({ icon: Icon, label, href }) => (
                <Magnetic key={label} strength={0.45}>
                  <a
                    href={href}
                    aria-label={label}
                    data-cursor={label}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="icon-fill cta-press flex h-12 w-12 items-center justify-center rounded-full border rule text-white/60 transition-colors hover:border-[#2f6bff] hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </motion.div>

          {CV_URL && (
            <motion.div variants={rise} className="mt-10 flex flex-wrap items-center gap-6">
              <Magnetic strength={0.4}>
                <a
                  href={CV_URL}
                  download
                  data-cursor="baixar"
                  className="group cta-sheen cta-press inline-flex items-center gap-2.5 rounded-full border border-[#2f6bff]/40 bg-[#2f6bff]/10 px-6 py-3.5 font-code text-xs tracking-[0.2em] text-[#6f97ff] transition-colors hover:bg-[#2f6bff]/20 hover:text-white"
                >
                  BAIXAR CV (PDF)
                  <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </a>
              </Magnetic>
              <span className="flex items-center gap-2 font-code text-[11px] tracking-[0.25em] text-white/40">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#38e0ff]" />
                RESPONDO EM ATÉ 24H
              </span>
            </motion.div>
          )}

          <motion.div variants={rise} className="mt-20 flex flex-col items-start justify-between gap-3 border-t rule pt-6 font-code text-[11px] tracking-[0.25em] text-white/30 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} MATHEUS GOES DA SILVA</span>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="ver código"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[#2f6bff]"
            >
              CÓDIGO-FONTE DESTE SITE
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>
        </motion.div>
      </footer>
    </div>
  )
}

export default App
