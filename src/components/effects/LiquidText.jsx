import { useEffect, useId, useRef } from 'react'
import gsap from 'gsap'

/**
 * Liquid-distortion hover. The content is filtered through an SVG turbulence +
 * displacement-map filter. On hover, GSAP animates the displacement `scale` and
 * the turbulence `baseFrequency` up and back down, so the text/element melts and
 * ripples like liquid, then re-solidifies. Each instance gets a unique filter id.
 *
 * Works on any inline/blocky content. Skipped under reduced-motion (renders the
 * undistorted content). SVG filters are CPU-cheap for small areas.
 */
export default function LiquidText({
  children,
  as: Tag = 'span',
  className = '',
  intensity = 26,    // peak displacement scale
  freq = 0.018,      // peak turbulence frequency
  ...rest
}) {
  const id = useId().replace(/:/g, '')
  const filterId = `liquid-${id}`
  const dispRef = useRef(null)
  const turbRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const wrap = wrapRef.current
    const disp = dispRef.current
    const turb = turbRef.current
    if (!wrap || !disp || !turb) return

    const state = { scale: 0, f: 0.001 }
    const apply = () => {
      disp.setAttribute('scale', String(state.scale))
      turb.setAttribute('baseFrequency', `${state.f} ${state.f * 1.6}`)
    }

    const enter = () => {
      gsap.killTweensOf(state)
      gsap.timeline()
        .to(state, { scale: intensity, f: freq, duration: 0.45, ease: 'power2.out', onUpdate: apply })
        .to(state, { scale: 0, f: 0.001, duration: 1.1, ease: 'elastic.out(1, 0.4)', onUpdate: apply })
    }

    wrap.addEventListener('pointerenter', enter)
    return () => wrap.removeEventListener('pointerenter', enter)
  }, [intensity, freq])

  return (
    <Tag
      ref={wrapRef}
      className={className}
      style={{ filter: `url(#${filterId})`, display: 'inline-block' }}
      {...rest}
    >
      <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.001 0.001" numOctaves="2" result="noise" />
          <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {children}
    </Tag>
  )
}
