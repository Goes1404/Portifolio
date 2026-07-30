import { useEffect, useRef } from 'react'
import { canvasDpr, isNarrowScreen, isTouch, prefersReducedMotion } from '@/lib/device'

/**
 * Interactive particle constellation with light physics.
 *
 * A canvas of drifting nodes that link with hairlines when close (a classic
 * "constellation network"), plus pointer interaction: particles within the
 * pointer's radius are gently repelled, then spring back via a restoring force
 * toward their idle velocity. DPR-aware, pauses when scrolled off-screen, and
 * renders a single still frame under reduced-motion.
 */
export default function ParticleField({
  className = '',
  density = 0.00009,   // particles per px² of canvas
  maxParticles = 140,
  linkDist = 130,      // px below which two nodes draw a link
  pointerRadius = 150, // px radius of pointer repulsion
  color = '47, 107, 255', // rgb of the line/dot color
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduced = prefersReducedMotion()
    const coarse = isTouch()
    const narrow = isNarrowScreen()
    const dpr = canvasDpr(2)

    // The link pass is O(n²) and, unlike the dots, it also costs a stroke call
    // per pair — it dominates the frame budget. On phones the constellation is
    // dense enough to read as texture from the dots alone, so the links are
    // dropped rather than the whole effect.
    const drawLinks = !(coarse && narrow)

    let w = 0
    let h = 0
    let particles = []
    const pointer = { x: -9999, y: -9999, active: false }

    const spawn = () => {
      // Thin out the field on small / touch screens to save CPU and battery.
      const cap = narrow ? Math.round(maxParticles * 0.35) : maxParticles
      const count = Math.min(cap, Math.floor(w * h * density))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }))
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      spawn()
    }
    resize()

    // Mobile browsers fire `resize` every time the address bar slides in or out,
    // i.e. constantly while scrolling. Reallocating the backing store and
    // respawning the field on each of those is both wasteful and visible (the
    // constellation restarts). Only react to a real width change, and debounce.
    let resizeTimer = 0
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (coarse && window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 150)
    }
    window.addEventListener('resize', onResize)

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.active = true
    }
    const onLeave = () => { pointer.active = false; pointer.x = pointer.y = -9999 }
    // Pointer repulsion is a fine-pointer affordance; skip the listeners on
    // touch devices where there's no hovering cursor to react to.
    if (!coarse) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerleave', onLeave, { passive: true })
    }

    let visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(canvas)

    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        // Idle drift
        p.x += p.vx
        p.y += p.vy

        // Pointer repulsion with inverse-square-ish falloff
        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d2 = dx * dx + dy * dy
          const r2 = pointerRadius * pointerRadius
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const force = (1 - d / pointerRadius) * 1.8
            p.x += (dx / d) * force
            p.y += (dy / d) * force
          }
        }

        // Wrap around edges
        if (p.x < -10) p.x = w + 10
        else if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        else if (p.y > h + 10) p.y = -10
      }

      // Links
      if (drawLinks) {
        const linkDist2 = linkDist * linkDist
        ctx.lineWidth = 1
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i]
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            const d2 = dx * dx + dy * dy
            if (d2 < linkDist2) {
              const alpha = (1 - Math.sqrt(d2) / linkDist) * 0.5
              ctx.strokeStyle = `rgba(${color}, ${alpha})`
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }
          }
        }
      }

      // Dots
      for (const p of particles) {
        ctx.fillStyle = `rgba(${color}, 0.85)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      // Skip the work — but keep the rAF alive so it resumes instantly — while
      // the canvas is scrolled away or the tab is in the background.
      if (visible && !document.hidden) draw()
    }

    if (reduced) draw()
    else loop()

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [density, maxParticles, linkDist, pointerRadius, color])

  return <canvas ref={canvasRef} aria-hidden className={className} />
}
