import { useRef } from 'react'
import { shouldEnablePointerEffects, usePointerEffects } from '@/lib/device'

/**
 * 3D tilt card. Tracks the pointer over the element and rotates it in 3D around
 * its center (perspective-based), with a moving specular glare and an optional
 * lifted inner layer (`[data-tilt-layer]`) that floats above the surface on the
 * Z axis for parallax depth. Eased back to flat on leave.
 *
 * Pure transforms (GPU-friendly). On coarse pointers / reduced-motion it renders
 * a plain wrapper: no handlers, no `preserve-3d` (which promotes the card and
 * everything in it to its own layer), and no glare element — none of which can
 * do anything useful without a hovering cursor.
 */
export default function Tilt3D({
  children,
  className = '',
  max = 12,          // max rotation in degrees
  scale = 1.02,
  glare = true,
  ...rest
}) {
  const ref = useRef(null)
  const glareRef = useRef(null)
  const raf = useRef(0)
  const enabled = usePointerEffects()

  const fineOk = shouldEnablePointerEffects

  const onMove = (e) => {
    const el = ref.current
    if (!el || !fineOk()) return
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      const rx = (0.5 - py) * max * 2
      const ry = (px - 0.5) * max * 2
      // Track the pointer 1:1 while moving — the eased transition is only for
      // the spring-back on leave, otherwise it lags behind the cursor.
      el.style.transition = 'transform 0s'
      el.style.transform =
        `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`
      if (glare && glareRef.current) {
        glareRef.current.style.background =
          `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.22), transparent 55%)`
        glareRef.current.style.opacity = '1'
      }
    })
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)'
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)'
    if (glareRef.current) glareRef.current.style.opacity = '0'
  }

  if (!enabled) {
    return (
      <div className={`tilt-3d ${className}`} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt-3d ${className}`}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }}
      {...rest}
    >
      {children}
      {glare && (
        <span
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] opacity-0 transition-opacity duration-300"
        />
      )}
    </div>
  )
}
