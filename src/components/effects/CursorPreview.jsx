import { useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Floating image that follows the pointer while a list row is hovered — the
 * "hover list → image trail" pattern. Spring-lagged position; the card tilts
 * with horizontal velocity so it feels carried, not pinned. Fine pointers only.
 *
 * Usage: parent keeps `src` state (null = hidden) and toggles it on
 * onPointerEnter / onPointerLeave of each row.
 */
export default function CursorPreview({ src, alt = '', fit = 'cover', width = 300, height = 200 }) {
  const mx = useMotionValue(-1000)
  const my = useMotionValue(-1000)
  const x = useSpring(mx, { stiffness: 260, damping: 28, mass: 0.6 })
  const y = useSpring(my, { stiffness: 260, damping: 28, mass: 0.6 })
  const vx = useMotionValue(0)
  const rotate = useTransform(vx, [-40, 40], [-9, 9])

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    let last = { x: 0, t: performance.now() }
    const onMove = (e) => {
      mx.set(e.clientX)
      my.set(e.clientY)
      const now = performance.now()
      const dt = Math.max(1, now - last.t)
      vx.set(((e.clientX - last.x) / dt) * 12)
      last = { x: e.clientX, t: now }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mx, my, vx])

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] hidden [@media(pointer:fine)]:block">
      <AnimatePresence>
        {src && (
          <motion.div
            key={src}
            initial={{ opacity: 0, scale: 0.72, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.86, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ x, y, rotate, width, height, translateX: '-50%', translateY: '-50%' }}
            className="absolute left-0 top-0 overflow-hidden rounded-xl border border-white/10 bg-[#0a0e1c] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]"
          >
            <img
              src={src}
              alt={alt}
              draggable={false}
              className={fit === 'contain' ? 'h-full w-full bg-white object-contain p-8' : 'h-full w-full object-cover object-top'}
            />
            <span className="bg-noise pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
