import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './portrait-reveal.css'

/**
 * PortraitReveal — a grayscale portrait that blooms into full color through a
 * soft spotlight tracking the pointer (and the finger on touch). On leave, the
 * color recedes and the frame settles back to black & white.
 *
 * Single source image (the color photo): the B&W base is a CSS grayscale of the
 * exact same pixels, so the reveal is always perfectly aligned.
 */
export default function PortraitReveal({ src, alt, caption, className = '' }) {
  const ref = useRef(null)
  const rafRef = useRef(0)
  const [active, setActive] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty('--px', `${x}%`)
      el.style.setProperty('--py', `${y}%`)
    })
  }

  return (
    <motion.figure
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`portrait-reveal ${active ? 'is-active' : ''} ${reduced ? 'is-reduced' : ''} ${className}`}
      data-cursor="sou eu"
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onPointerDown={(e) => { setActive(true); handleMove(e) }}
      onPointerUp={() => setActive(false)}
      onPointerCancel={() => setActive(false)}
      onPointerMove={handleMove}
    >
      {/* B&W base — same pixels, desaturated */}
      <img src={src} alt={alt} className="portrait-reveal__base" draggable={false} loading="lazy" />
      {/* Color layer, revealed through the spotlight mask */}
      <img src={src} alt="" aria-hidden="true" className="portrait-reveal__color" draggable={false} />
      {/* Spotlight glow that follows the pointer */}
      <span aria-hidden="true" className="portrait-reveal__ring" />
      {/* Frame + vignette for caption legibility */}
      <span aria-hidden="true" className="portrait-reveal__frame" />
      {caption && <figcaption className="portrait-reveal__cap">{caption}</figcaption>}
      <span aria-hidden="true" className="portrait-reveal__hint">passe o mouse · toque</span>
    </motion.figure>
  )
}
