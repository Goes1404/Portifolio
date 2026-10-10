import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Menu, MessageCircle, X } from 'lucide-react'
import { Magnetic, ScrambleText } from '@/components/effects'
import LocalClock from './LocalClock'

const EASE = [0.16, 1, 0.3, 1]

/**
 * Site header. Hides on scroll-down, reappears on scroll-up (classic
 * "smart" header), tracks the active section with a sliding marker, shows
 * São Paulo local time, and opens a full-screen editorial menu on mobile.
 */
export default function Header({ nav, email, whatsapp, onNav, activeId }) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      // Hide only after the hero's first screen; show on any upward move
      if (y > lastY.current + 6 && y > 160 && !menuOpen) setHidden(true)
      else if (y < lastY.current - 6) setHidden(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  const go = (e, href) => {
    setMenuOpen(false)
    onNav(e, href)
  }

  return (
    <>
      <motion.header
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`pt-safe fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled ? 'border-b rule bg-[#05070f]/70 backdrop-blur-md' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[88rem] items-center justify-between px-5 py-3.5 sm:px-8 sm:py-4">
          {/* Wordmark */}
          <a href="#top" onClick={(e) => go(e, '#top')} className="group flex items-center gap-3" data-scramble-trigger>
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm bg-[#2f6bff] font-display text-sm text-white">
              <span className="absolute inset-0 -translate-y-full bg-[#38e0ff] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
              <span className="relative">M</span>
            </span>
            <span className="hidden font-code text-xs tracking-[0.3em] text-[#e9edf7] sm:block">
              <ScrambleText>MGS_STUDIO</ScrambleText>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active = activeId === item.href.slice(1)
              return (
                <Magnetic key={item.href} strength={0.25}>
                  <a
                    href={item.href}
                    onClick={(e) => go(e, item.href)}
                    data-scramble-trigger
                    className={`group relative flex items-baseline gap-1.5 px-3 py-2 font-code text-[13px] transition-colors ${
                      active ? 'text-[#e9edf7]' : 'text-white/50 hover:text-[#e9edf7]'
                    }`}
                  >
                    <span className="text-[10px] text-[#2f6bff]">{item.num}</span>
                    <ScrambleText>{item.label}</ScrambleText>
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        transition={{ duration: 0.5, ease: EASE }}
                        className="absolute -bottom-px left-3 right-3 h-px bg-[#38e0ff]"
                      />
                    )}
                  </a>
                </Magnetic>
              )
            })}
          </nav>

          {/* Right cluster: clock + CTA (desktop) */}
          <div className="hidden items-center gap-5 lg:flex">
            <LocalClock />
            <Magnetic strength={0.35}>
              <a
                href="#contato"
                onClick={(e) => go(e, '#contato')}
                data-cursor="falar"
                className="cta-press group inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-code text-[11px] tracking-[0.2em] text-[#e9edf7] transition-colors hover:border-[#2f6bff] hover:bg-[#2f6bff]/10"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#38e0ff] shadow-[0_0_10px_#38e0ff]" />
                DISPONÍVEL
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Magnetic>
          </div>

          {/* Mobile trigger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#e9edf7] transition-colors hover:bg-white/5 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="pt-safe fixed inset-0 z-[120] flex flex-col bg-[#05070f] md:hidden"
          >
            <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" />
            <div className="relative flex items-center justify-between px-5 py-3.5">
              <span className="font-code text-xs tracking-[0.3em] text-[#e9edf7]">
                MGS<span className="text-[#2f6bff]">_</span>STUDIO
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#e9edf7] transition-colors hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="relative flex flex-1 flex-col justify-center gap-1 overflow-y-auto px-6 py-8">
              {nav.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className="group flex items-center gap-4 border-b rule py-4"
                >
                  <span className="font-code text-xs text-[#2f6bff]">{item.num}</span>
                  <span className="block overflow-hidden">
                    <motion.span
                      initial={{ y: '110%' }}
                      animate={{ y: '0%', transition: { delay: 0.25 + i * 0.06, duration: 0.7, ease: EASE } }}
                      className="block font-display leading-none text-[#e9edf7] transition-colors group-hover:text-[#2f6bff]"
                      style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}
                    >
                      {item.label}
                    </motion.span>
                  </span>
                  <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-white/30 transition-colors group-hover:text-[#2f6bff]" />
                </a>
              ))}
            </nav>

            <div className="relative flex flex-col gap-3 px-6 pb-[calc(env(safe-area-inset-bottom)_+_2rem)]">
              <LocalClock className="text-white/40" />
              <a href={`mailto:${email}`} className="font-code text-xs tracking-widest text-white/50">
                {email}
              </a>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-code text-xs tracking-widest text-white/50"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp · (11) 95008-5875
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
