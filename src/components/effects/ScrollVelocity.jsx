import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll-velocity skew. Wraps content and applies a momentary vertical skew
 * proportional to scroll velocity — fast scrolling shears the content, and it
 * settles back to 0 as you slow down. A subtle "speed/inertia" cue popularized
 * by award-winning sites. Driven by GSAP's ScrollTrigger velocity sampling so it
 * stays in sync with Lenis smooth-scroll. No-op under reduced-motion.
 */
export default function ScrollVelocity({ children, className = '', maxSkew = 7, as: Tag = 'div' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const skewSetter = gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' })
    let proxy = { skew: 0 }

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = gsap.utils.clamp(-maxSkew, maxSkew, self.getVelocity() / -260)
        if (Math.abs(v) > Math.abs(proxy.skew)) {
          proxy.skew = v
          gsap.to(proxy, {
            skew: 0,
            duration: 0.8,
            ease: 'power3',
            overwrite: true,
            onUpdate: () => skewSetter(proxy.skew),
          })
        }
      },
    })

    return () => st.kill()
  }, [maxSkew])

  return (
    <Tag ref={ref} className={className} style={{ transformOrigin: 'right center', willChange: 'transform' }}>
      {children}
    </Tag>
  )
}
