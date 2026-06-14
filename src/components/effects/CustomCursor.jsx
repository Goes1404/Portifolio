import { useEffect, useRef } from 'react'

/**
 * Custom magnetic cursor — a small solid dot that tracks the pointer 1:1 and a
 * larger, lagging ring that eases behind it (spring-like trailing). The ring
 * uses `mix-blend-mode: difference` so it inverts whatever sits beneath it,
 * reading cleanly over both the dark shell and bright accents.
 *
 * Interactive elements (links, buttons, [data-cursor]) make the ring expand and
 * the dot fade — a classic "magnetic focus" micro-interaction. Hidden entirely
 * on touch / coarse pointers and when reduced-motion is requested. Native
 * cursor is hidden via the `.has-custom-cursor` class added to <html>.
 */
export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring) return

    document.documentElement.classList.add('has-custom-cursor')

    // Pointer target + eased ring position
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...pointer }
    let ringScale = 1
    let ringScaleTarget = 1
    let activeScale = 1 // scale while hovering an interactive element (or its data value)
    let visible = false
    let raf = 0

    const onMove = (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      if (!visible) {
        visible = true
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
    }

    const onLeave = () => {
      visible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }

    // Hover state for interactive elements
    const onOver = (e) => {
      const t = e.target.closest('a, button, [role="button"], [data-cursor]')
      if (t) {
        activeScale = t.dataset.cursorScale ? Number(t.dataset.cursorScale) : 2.4
        ringScaleTarget = activeScale
        ring.classList.add('is-active')
        dot.classList.add('is-hidden')
        const text = t.dataset.cursor
        if (text && label) {
          label.textContent = text
          label.style.opacity = '1'
        }
      }
    }
    const onOut = (e) => {
      const t = e.target.closest('a, button, [role="button"], [data-cursor]')
      if (t) {
        activeScale = 1
        ringScaleTarget = 1
        ring.classList.remove('is-active')
        dot.classList.remove('is-hidden')
        if (label) label.style.opacity = '0'
      }
    }

    // Press feedback
    const onDown = () => { ringScaleTarget *= 0.7 }
    const onUp = () => { ringScaleTarget = ring.classList.contains('is-active') ? activeScale : 1 }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerout', onOut, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    const loop = () => {
      raf = requestAnimationFrame(loop)
      // Dot tracks instantly
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`
      // Ring eases toward the pointer (trailing)
      ringPos.x += (pointer.x - ringPos.x) * 0.16
      ringPos.y += (pointer.y - ringPos.y) * 0.16
      ringScale += (ringScaleTarget - ringScale) * 0.18
      ring.style.transform =
        `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${ringScale})`
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden>
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  )
}
