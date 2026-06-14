import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const DIRECTIONS = {
  up:    { from: 'inset(100% 0% 0% 0%)' },
  down:  { from: 'inset(0% 0% 100% 0%)' },
  left:  { from: 'inset(0% 100% 0% 0%)' },
  right: { from: 'inset(0% 0% 0% 100%)' },
}

/**
 * Clip-path reveal / mask wipe. The content starts fully clipped and unmasks
 * along the chosen direction as it scrolls into view, with a paired inner lift
 * so the content also rises slightly behind the moving mask edge — the "image
 * curtain reveal" look. Driven by GSAP ScrollTrigger; reduced-motion shows the
 * content immediately.
 */
export default function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  duration = 1.2,
  lift = 40,
  start = 'top 82%',
  as: Tag = 'div',
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const inner = el.firstElementChild
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      el.style.clipPath = 'inset(0% 0% 0% 0%)'
      return
    }

    const from = (DIRECTIONS[direction] || DIRECTIONS.up).from
    const ctx = gsap.context(() => {
      gsap.set(el, { clipPath: from })
      if (inner) gsap.set(inner, { y: lift, scale: 1.06 })
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start, once: true } })
      tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: 'power4.inOut' }, 0)
      if (inner) tl.to(inner, { y: 0, scale: 1, duration: duration * 1.1, ease: 'power4.out' }, 0)
    }, el)

    return () => ctx.revert()
  }, [direction, duration, lift, start])

  return (
    <Tag ref={ref} className={className} style={{ willChange: 'clip-path' }}>
      {children}
    </Tag>
  )
}
