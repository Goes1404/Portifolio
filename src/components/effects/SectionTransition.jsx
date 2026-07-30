import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isTouch, prefersReducedMotion } from '@/lib/device'

// Sections that get a transition when they become the centered one on scroll.
// Order isn't important — the IntersectionObserver decides what's active.
const SECTIONS = [
  { id: 'historia',    num: '01', label: 'História' },
  { id: 'experiencia', num: '02', label: 'Experiência' },
  { id: 'parceiros',   num: '—',  label: 'Parceiros & Clientes' },
  { id: 'projetos',    num: '03', label: 'Projetos' },
  { id: 'skills',      num: '04', label: 'Skills' },
  { id: 'contato',     num: '05', label: 'Contato' },
]

const EASE = [0.76, 0, 0.24, 1] // strong in-out — reads as a deliberate sweep

/**
 * SectionTransition — a curtain wipe that sweeps the viewport whenever a new
 * section reaches the vertical center as you scroll. Decoupled from the menu
 * and from each section's internal layout (it's a fixed, pointer-events-none
 * overlay), so it never breaks the pinned/sticky scroll tracks. The panel
 * slides bottom→top in one continuous pass with the section name, so it reads
 * as a "page change" without ever holding over the content.
 *
 * Honors prefers-reduced-motion (disabled) and ignores activations in the first
 * moments after mount so a page that loads scrolled mid-section doesn't flash.
 *
 * ── Why this is desktop-only ────────────────────────────────────────────────
 * The wipe is a full-screen opaque panel. With a mouse wheel you cross a
 * section boundary deliberately, every few seconds, and the sweep reads as a
 * chapter break. A touch flick crosses two or three boundaries in one gesture,
 * so on a phone the same effect means a panel slams over the content you were
 * trying to read, repeatedly, while you're mid-scroll — you can't see where you
 * are or where you're going. It's the single most disorienting thing on the page
 * on mobile, so touch devices don't get it at all.
 */
export default function SectionTransition() {
  const [trigger, setTrigger] = useState(null) // { key, num, label }
  const activeRef = useRef(null)
  const animatingRef = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion() || isTouch()) return

    const els = SECTIONS
      .map((s) => ({ ...s, el: document.getElementById(s.id) }))
      .filter((s) => s.el)
    if (!els.length) return

    const mountedAt = performance.now()

    const activate = (id) => {
      if (id === activeRef.current) return
      const prev = activeRef.current
      activeRef.current = id
      // Skip the very first resolve + anything during the initial paint window,
      // so landing on (or restoring into) a section doesn't fire a curtain.
      if (prev === null || performance.now() - mountedAt < 800) return
      if (animatingRef.current) return
      const info = els.find((s) => s.id === id)
      if (!info) return
      animatingRef.current = true
      setTrigger({ key: `${id}-${Date.now()}`, num: info.num, label: info.label })
    }

    // A section is "active" once it crosses the central band of the viewport.
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) activate(e.target.id) })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    els.forEach((s) => obs.observe(s.el))

    return () => obs.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          key={trigger.key}
          aria-hidden
          initial={{ y: '105%' }}
          animate={{ y: '-105%' }}
          transition={{ duration: 0.92, ease: EASE }}
          onAnimationComplete={() => {
            animatingRef.current = false
            setTrigger(null)
          }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[125] flex h-[115vh] items-center justify-center"
          style={{
            background:
              'linear-gradient(180deg, #0a1f6b 0%, #070b18 38%, #05070f 100%)',
          }}
        >
          {/* Bright leading edge — the "blade" of the wipe */}
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#38e0ff] to-transparent" />
          {/* Film grain so the panel matches the site's atmosphere */}
          <span className="bg-noise absolute inset-0 opacity-[0.07] mix-blend-overlay" />

          {/* Section label — fades in mid-sweep, out as the panel leaves */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: [0, 1, 1, 0], y: [16, 0, 0, -16] }}
            transition={{ duration: 0.92, ease: 'easeInOut', times: [0, 0.32, 0.62, 1] }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="font-code text-xs uppercase tracking-[0.5em] text-[#6f97ff]">
              {trigger.num}
            </span>
            <span
              className="font-display leading-none text-[#e9edf7]"
              style={{ fontSize: 'clamp(2rem, 7vw, 4.5rem)' }}
            >
              {trigger.label}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
