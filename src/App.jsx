import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { ArrowDown, ArrowUpRight, Code2, Globe, Mail, Menu, X } from 'lucide-react'
import WebGLHero from '@/components/webgl-hero'
import {
  CustomCursor,
  ParticleField,
  Magnetic,
  SplitReveal,
  ScrollVelocity,
  LiquidText,
} from '@/components/effects'
import ScrollingAnimationDemo from '@/components/efeito-2-perfis/demo'
import ScrollPortraitWallDemo from '@/components/efeito-3-portrait-wall/demo'
import HeroScrollDemo from '@/components/efeito-4-container-scroll/demo'
import ProjetosHeroScrub from '@/components/efeito-7-projetos/demo'
import HistoriaSection from '@/components/historia'
import HistoriaIntro from '@/components/historia/intro'
import ExperienciaSection from '@/components/experiencia'

const NAV = [
  { num: '01', label: 'História', href: '#historia' },
  { num: '02', label: 'Experiência', href: '#experiencia' },
  { num: '03', label: 'Projetos', href: '#projetos' },
  { num: '04', label: 'Skills', href: '#skills' },
  { num: '05', label: 'Contato', href: '#contato' },
]

const STACK = [
  'React', 'TypeScript', 'Node.js', 'Next.js', 'Go', 'PostgreSQL',
  'Prisma', 'GraphQL', 'Docker', 'Kubernetes', 'AWS', 'Redis', 'Tailwind',
]

gsap.registerPlugin(ScrollTrigger)

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

// Surge: element rises from below + resolves out of blur + subtle zoom.
// Used both for initial page-load entry and whileInView reveals.
const rise = {
  hidden: { opacity: 0, y: 64, filter: 'blur(16px)', scale: 0.97 },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
}

// Word-level stagger: each word is a rise child, parent staggers them in.
const wordStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

// Parent that staggers its `rise` children as the block scrolls into view.
const riseGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
}
const inView = { once: true, margin: '-12% 0px -12% 0px' }

// Connective seam between two abutting effects
function Bridge({ label }) {
  return (
    <div className="relative flex h-24 w-full items-center justify-center bg-[#05070f]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2f6bff]/40 to-transparent" />
      <div className="absolute left-1/2 top-0 h-12 w-px -translate-x-1/2 bg-gradient-to-b from-[#2f6bff]/50 to-transparent" />
      <div className="relative flex flex-col items-center gap-3">
        <span className="thread-dot h-2 w-2 rounded-full bg-[#2f6bff]" />
        {label && (
          <span className="font-code text-[10px] uppercase tracking-[0.4em] text-white/30">{label}</span>
        )}
      </div>
    </div>
  )
}

// Infinite editorial ticker
function Marquee() {
  const row = [...STACK, ...STACK]
  return (
    <div className="marquee-mask relative w-full overflow-hidden border-y rule py-4">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {row.map((tech, i) => (
          <span key={i} className="flex items-center gap-8 font-code text-sm tracking-wide text-white/40">
            {tech}
            <span className="text-brand">/</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// Magazine-style section header — title splits into words, each surges in independently.
function SectionMarker({ id, num, kicker, title, lead }) {
  return (
    <div id={id} className="relative scroll-mt-24 overflow-hidden border-t rule bg-[#05070f] px-6 py-20 md:py-32">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[34vw] leading-none text-white/[0.035] md:text-[22vw]"
      >
        {num}
      </span>
      <motion.div
        variants={riseGroup}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="relative mx-auto max-w-6xl"
      >
        <motion.div variants={rise} className="flex items-center gap-4">
          <span className="h-px w-10 bg-brand" />
          <span className="font-code text-xs uppercase tracking-[0.35em] text-white/50">{kicker}</span>
        </motion.div>

        {/* Each word surges up on its own — staggered by wordStagger */}
        <motion.h2
          variants={wordStagger}
          className="mt-7 font-display text-[12vw] leading-[0.92] text-[#e9edf7] sm:text-6xl md:text-7xl"
          aria-label={title}
        >
          {title.split(' ').map((word, i) => (
            <motion.span key={i} variants={rise} className="mr-[0.22em] inline-block last:mr-0">
              {word}
            </motion.span>
          ))}
        </motion.h2>

        {lead && (
          <motion.p variants={rise} className="mt-7 max-w-xl font-editorial text-2xl italic leading-snug text-white/55 md:text-3xl">
            {lead}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}

function App() {
  const { scrollYProgress } = useScroll()
  const lenisRef    = useRef(null)
  const heroTrackRef = useRef(null) // the 280vh outer section
  const [menuOpen, setMenuOpen] = useState(false)

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

  // Hero depth-parallax: each [data-hero-layer] wrapper moves at its own velocity
  // as the 280vh track scrolls. GSAP owns the wrapper's y; framer-motion owns the
  // inner element's entry animation y — different DOM nodes, zero conflict.
  useEffect(() => {
    const track = heroTrackRef.current
    if (!track) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      })
      // Depth velocities: Silva exits the viewport ~5× faster than the meta line.
      // The "Goes da" line also drifts right, as if on a different lateral plane.
      tl.to('[data-hero-layer="meta"]',    { y: '-16vh', ease: 'none' }, 0)
      tl.to('[data-hero-layer="line1"]',   { y: '-36vh', ease: 'none' }, 0)
      tl.to('[data-hero-layer="line2"]',   { y: '-58vh', x: '2.5vw', ease: 'none' }, 0)
      tl.to('[data-hero-layer="line3"]',   { y: '-85vh', ease: 'none' }, 0)
      tl.to('[data-hero-layer="tagline"]', { y: '-26vh', ease: 'none' }, 0)
      // Veil fades to reveal more of the WebGL blob as the parallax deepens
      tl.to('[data-hero-layer="veil"]',    { opacity: 0.55, ease: 'none' }, 0)
    }, track)
    return () => ctx.revert()
  }, [])

  const handleNav = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    // Wait a tick so the overlay starts closing before we hand control to Lenis
    requestAnimationFrame(() => lenisRef.current?.scrollTo(href, { offset: -72 }))
  }

  // Freeze background scroll while the mobile menu is open
  useEffect(() => {
    const lenis = lenisRef.current
    if (menuOpen) lenis?.stop()
    else lenis?.start()
  }, [menuOpen])

  return (
    <div className="relative min-h-screen bg-[#05070f] text-[#e9edf7] selection:bg-[#2f6bff] selection:text-white">
      {/* Custom magnetic cursor (desktop / fine-pointer only) */}
      <CustomCursor />

      {/* Scroll-progress thread */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed left-0 top-0 z-[110] h-0.5 w-full origin-left bg-gradient-to-r from-[#2f6bff] via-[#6f97ff] to-[#38e0ff]"
      />

      {/* Film-grain overlay */}
      <div className="bg-noise pointer-events-none fixed inset-0 z-[100] opacity-[0.07] mix-blend-overlay" />

      {/* Vertical metadata rail */}
      <div className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <span className="vertical-rl font-code text-[10px] tracking-[0.45em] text-white/30">
          MATHEUS GOES DA SILVA &nbsp;·&nbsp; FULL&nbsp;STACK
        </span>
      </div>

      {/* Header */}
      <header className="pt-safe sticky top-0 z-50 border-b rule bg-[#05070f]/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4">
          <a href="#top" onClick={(e) => handleNav(e, '#top')} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand font-display text-sm text-white">M</span>
            <span className="hidden font-code text-xs tracking-[0.3em] text-[#e9edf7] sm:block">
              MGS<span className="text-brand">_</span>STUDIO
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-3 sm:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNav(e, item.href)}
                className="group flex items-baseline gap-1.5 px-2 py-1.5 font-code text-sm text-white/55 transition-colors hover:text-[#e9edf7]"
              >
                <span className="text-[10px] text-brand">{item.num}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#e9edf7] transition-colors hover:bg-white/5 sm:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-safe fixed inset-0 z-[120] flex flex-col bg-[#05070f]/97 backdrop-blur-xl sm:hidden"
          >
            {/* Top bar inside the overlay */}
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="font-code text-xs tracking-[0.3em] text-[#e9edf7]">
                MGS<span className="text-brand">_</span>STUDIO
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#e9edf7] transition-colors hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links — big editorial type, staggered in */}
            <nav className="flex flex-1 flex-col justify-center gap-2 overflow-y-auto px-7 py-8">
              {NAV.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNav(e, item.href)}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.08 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                  className="group flex items-center gap-4 border-b rule py-4"
                >
                  <span className="font-code text-xs text-brand">{item.num}</span>
                  <span className="font-display leading-none text-[#e9edf7] transition-colors group-hover:text-brand" style={{ fontSize: 'clamp(1.75rem, 7vw, 2.5rem)' }}>
                    {item.label}
                  </span>
                  <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-white/30 transition-colors group-hover:text-brand" />
                </motion.a>
              ))}
            </nav>

            {/* Footer of the menu */}
            <div className="px-7 pb-[calc(env(safe-area-inset-bottom)_+_2rem)]">
              <a
                href="mailto:sq1matheusgsilva@gmail.com"
                className="font-code text-xs tracking-widest text-white/50"
              >
                sq1matheusgsilva@gmail.com
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO: 280vh sticky scroll track ─────────────────── */}
      {/* The outer section is 280vh tall — the scroll "engine" for the parallax.
          The sticky inner div stays pinned to the viewport while the user scrolls
          through the full track, giving the illusion of cinematic depth. */}
      <main
        id="top"
        ref={heroTrackRef}
        className="relative bg-grain bg-[#05070f]"
        style={{ height: '280vh' }}
      >
        {/* Sticky viewport — pinned, always fills the screen */}
        <div className="sticky top-0 h-screen overflow-hidden">

          {/* WebGL blob layer (z-0) */}
          <WebGLHero className="pointer-events-none absolute inset-0 z-0" />

          {/* Interactive particle constellation (z-[2]) — drifts, links nearby
              nodes and is repelled by the pointer (light physics) */}
          <ParticleField className="pointer-events-none absolute inset-0 z-[2]" />

          {/* Readability veil (z-1) — also fades via GSAP as you scroll in */}
          <div
            data-hero-layer="veil"
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                'radial-gradient(130% 120% at 28% 42%, rgba(5,7,15,0.88) 0%, rgba(5,7,15,0.4) 48%, rgba(5,7,15,0) 72%)',
            }}
          />

          {/* Text layers (z-10) — each wrapper is the GSAP parallax target;
              the inner motion element handles only its entry animation */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6"
          >
            {/* Status meta line — slowest layer */}
            <div data-hero-layer="meta" className="will-change-transform">
              <motion.div variants={rise} className="flex flex-wrap items-center gap-x-6 gap-y-2 font-code text-xs tracking-[0.3em] text-white/45">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                  DISPONÍVEL P/ PROJETOS
                </span>
                <span className="hidden sm:inline">·</span>
                <span>PORTFÓLIO — ED. 2026</span>
                <span className="hidden sm:inline">·</span>
                <span>BRASIL</span>
              </motion.div>
            </div>

            {/* "Matheus" — second-slowest, anchors the name visually */}
            <div data-hero-layer="line1" className="will-change-transform">
              <motion.h1
                variants={rise}
                className="mt-5 font-display text-[clamp(2.5rem,11vw,9.5rem)] leading-[0.88] text-[#e9edf7]"
              >
                Matheus
              </motion.h1>
            </div>

            {/* "Goes da" — mid-speed + lateral drift, feels on a different plane */}
            <div data-hero-layer="line2" className="will-change-transform">
              <motion.h1
                variants={rise}
                className="font-display text-[clamp(2.5rem,11vw,9.5rem)] leading-[0.88] text-[#e9edf7] md:ml-[16%]"
              >
                Goes <span className="text-gradient-anim">da</span>
              </motion.h1>
            </div>

            {/* "Silva" — fastest, rockets upward first, most dramatic depth */}
            <div data-hero-layer="line3" className="will-change-transform">
              <motion.h1
                variants={rise}
                className="font-display text-[clamp(2.5rem,11vw,9.5rem)] leading-[0.88] text-[#e9edf7] md:ml-[5%]"
              >
                {/* Hover to ripple the type with an SVG liquid-distortion filter */}
                <LiquidText data-cursor="liquid">Silva</LiquidText>
              </motion.h1>
            </div>

            {/* Tagline — sits at a mid-depth between meta and name */}
            <div data-hero-layer="tagline" className="will-change-transform">
              <motion.div variants={rise} className="mt-7 flex flex-col gap-4 sm:mt-10 sm:gap-5 md:ml-auto md:max-w-md md:text-right">
                <p className="font-editorial text-lg italic leading-snug text-white/65 sm:text-2xl md:text-3xl">
                  Desenvolvedor Full Stack — transformo ideias em produtos
                  digitais que as pessoas gostam de usar.
                </p>
                <Magnetic strength={0.5} className="md:self-end">
                  <a
                    href="#historia"
                    onClick={(e) => handleNav(e, '#historia')}
                    data-cursor="rolar"
                    className="group inline-flex items-center justify-start gap-2 font-code text-sm tracking-widest text-brand md:justify-end"
                  >
                    CONHEÇA A HISTÓRIA
                    <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
                  </a>
                </Magnetic>
              </motion.div>
            </div>
          </motion.div>

          {/* Marquee pinned at the bottom of the sticky viewport.
              ScrollVelocity shears it proportionally to scroll speed. */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <ScrollVelocity maxSkew={9}>
              <Marquee />
            </ScrollVelocity>
          </div>
          {/* Bottom-edge fade — blends the hero into the next section */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 z-[19] bg-gradient-to-t from-[#05070f] to-transparent" />
        </div>
      </main>

      {/* ── 01 · HISTÓRIA ────────────────────────────────────── */}
      <HistoriaIntro />
      <HistoriaSection />

      {/* ── 02 · EXPERIÊNCIA ─────────────────────────────────── */}
      <ExperienciaSection />

      {/* ── 03 · PROJETOS ────────────────────────────────────── */}
      <SectionMarker
        id="projetos"
        num="03"
        kicker="Trabalhos Selecionados"
        title="Projetos"
        lead="Coisas que construí. Clique em cada uma para mergulhar."
      />
      {/* E4: clean scroll expand — suspense build-up before projects */}
      <HeroScrollDemo />
      <ProjetosHeroScrub />

      {/* ── 04 · SKILLS ──────────────────────────────────────── */}
      <SectionMarker
        id="skills"
        num="04"
        kicker="Stack & Ferramentas"
        title="Como eu construo"
        lead="O ecossistema de tecnologias com que trabalho no dia a dia."
      />
      <ScrollingAnimationDemo />
      <Bridge label="a stack, em detalhe" />
      <ScrollPortraitWallDemo />

      {/* ── 05 · CONTATO ─────────────────────────────────────── */}
      <footer id="contato" className="bg-grain relative overflow-hidden border-t rule px-6 py-24 scroll-mt-24 md:py-40">
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
          <motion.div variants={rise} className="flex items-center gap-4">
            <span className="h-px w-10 bg-brand" />
            <span className="font-code text-xs uppercase tracking-[0.35em] text-white/50">05 — Contato</span>
          </motion.div>

          {/* Footer heading — GSAP per-character mask reveal (SplitReveal) */}
          <h2
            className="mt-8 font-display text-[13vw] leading-[0.9] text-[#e9edf7] sm:text-6xl md:text-8xl"
            aria-label="Vamos construir algo juntos?"
          >
            <SplitReveal as="span" className="block">Vamos construir</SplitReveal>
            <SplitReveal as="span" className="block text-brand" start="top 90%">algo juntos?</SplitReveal>
          </h2>

          <motion.div variants={rise} className="mt-14 flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <Magnetic strength={0.3}>
              <a
                href="mailto:sq1matheusgsilva@gmail.com"
                data-cursor="escrever"
                className="group inline-flex max-w-full items-center gap-2 border-b-2 border-[#2f6bff] pb-2 font-editorial text-lg italic text-[#e9edf7] transition-colors hover:text-brand sm:gap-3 sm:text-2xl md:text-4xl"
              >
                <LiquidText as="span" className="break-words">sq1matheusgsilva@gmail.com</LiquidText>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:h-6 sm:w-6" />
              </a>
            </Magnetic>

            <div className="flex items-center gap-3">
              {[
                { icon: Code2,  label: 'GitHub',   href: 'https://github.com/Goes1404' },
                { icon: Globe,  label: 'LinkedIn',  href: '#' },
                { icon: Mail,   label: 'E-mail',    href: 'mailto:sq1matheusgsilva@gmail.com' },
              ].map(({ icon: Icon, label, href }) => (
                <Magnetic key={label} strength={0.45}>
                  <a
                    href={href}
                    aria-label={label}
                    data-cursor={label}
                    className="flex h-12 w-12 items-center justify-center rounded-full border rule text-white/60 transition-colors hover:border-[#2f6bff] hover:text-brand"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </motion.div>

          <motion.div variants={rise} className="mt-20 flex flex-col items-start justify-between gap-3 border-t rule pt-6 font-code text-[11px] tracking-[0.25em] text-white/30 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} MATHEUS GOES DA SILVA</span>
            <span>FEITO COM CÓDIGO &amp; CAFÉ</span>
          </motion.div>
        </motion.div>
      </footer>
    </div>
  )
}

export default App
