import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { shouldEnablePointerEffects } from '@/lib/device'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll-velocity skew. Wraps content and applies a momentary vertical skew
 * proportional to scroll velocity — fast scrolling shears the content, and it
 * settles back to 0 as you slow down. A subtle "speed/inertia" cue popularized
 * by award-winning sites. Driven by GSAP's ScrollTrigger velocity sampling so it
 * stays in sync with Lenis smooth-scroll.
 *
 * Disabled on touch and under reduced-motion. On a phone this effect is a bad
 * trade twice over: a flick produces velocities far higher than a wheel, so the
 * text shears hard enough to be unreadable exactly when you're moving through
 * it, and each velocity sample spawns a fresh tween that has to re-rasterise
 * skewed text on the same frames the scroll is competing for.
 */
export default function ScrollVelocity({ children, className = '', maxSkew = 7, as: Tag = 'div' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!shouldEnablePointerEffects()) return

    const skewSetter = gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' })
    const proxy = { skew: 0 }
    el.style.willChange = 'transform'

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
            onComplete: () => {
              // Release the composited layer once the shear has settled, so the
              // marquee isn't permanently promoted for an effect that is idle
              // almost all of the time.
              el.style.willChange = 'auto'
            },
            onStart: () => {
              el.style.willChange = 'transform'
            },
          })
        }
      },
    })

    return () => {
      st.kill()
      gsap.killTweensOf(proxy)
      el.style.willChange = ''
    }
  }, [maxSkew])

  return (
    <Tag ref={ref} className={className} style={{ transformOrigin: 'right center' }}>
      {children}
    </Tag>
  )
}
