import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { PRELOAD_KEY as KEY } from './preload'

const EASE = [0.76, 0, 0.24, 1]

/**
 * Cinematic preloader — a counter climbs 000 → 100 while a hairline fills,
 * then the whole panel peels upward (clip-path) to reveal the hero. Plays once
 * per session; skipped entirely under prefers-reduced-motion. Calls `onDone`
 * the moment the curtain starts lifting so the hero can begin its entrance in
 * sync with the reveal.
 */
export default function Preloader({ onDone }) {
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    const start = performance.now()
    const DURATION = 1500
    let raf = 0
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION)
      // ease-out-expo so the last digits settle slowly — feels "loaded"
      const eased = 1 - Math.pow(2, -10 * t)
      setCount(Math.round(eased * 100))
      if (t < 1) raf = requestAnimationFrame(tick)
      else {
        setLeaving(true)
        try { sessionStorage.setItem(KEY, '1') } catch { /* private mode */ }
        if (!doneRef.current) { doneRef.current = true; onDone?.() }
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  const digits = String(count).padStart(3, '0')

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="preloader"
          aria-hidden
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 1.05, ease: EASE } }}
          className="fixed inset-0 z-[300] flex flex-col justify-between bg-[#05070f] px-6 py-6 text-[#e9edf7] sm:px-10 sm:py-8"
        >
          {/* grain to match the site */}
          <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />

          <div className="relative flex items-center justify-between font-code text-[10px] uppercase tracking-[0.4em] text-white/40">
            <span>Matheus Goes da Silva</span>
            <span className="hidden sm:inline">Portfólio — Ed. 2026</span>
          </div>

          {/* Centre mark: name slides up from behind a mask */}
          <div className="relative flex flex-col items-start gap-6">
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: '0%', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 } }}
                className="block font-editorial text-2xl italic text-white/60 sm:text-3xl"
              >
                Desenvolvedor Full Stack
              </motion.span>
            </span>
            <motion.span
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 } }}
              className="font-display text-[clamp(4.5rem,18vw,13rem)] leading-none tabular-nums tracking-tight"
            >
              {digits}
            </motion.span>
          </div>

          {/* Hairline progress */}
          <div className="relative">
            <div className="h-px w-full bg-white/[0.08]" />
            <div
              className="absolute left-0 top-0 h-px bg-gradient-to-r from-[#2f6bff] to-[#38e0ff]"
              style={{ width: `${count}%` }}
            />
            <div className="mt-4 flex items-center justify-between font-code text-[10px] uppercase tracking-[0.4em] text-white/40">
              <span>Carregando</span>
              <span className="tabular-nums">{digits} / 100</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
