import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-spy — reports which section id is currently the "active" one.
 *
 * Uses one IntersectionObserver with a band across the middle of the viewport
 * rather than a scroll handler, so it costs nothing per frame. Among the
 * sections intersecting the band, the one closest to the viewport centre wins;
 * this matters here because several sections are 2–5 screens tall and more than
 * one can straddle the band at once.
 *
 * @param {string[]} ids section element ids, in document order
 * @returns {string|null} the active id
 */
export function useScrollSpy(ids) {
  const [active, setActive] = useState(null)
  const key = ids.join(',')

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (!els.length) return

    const visible = new Map()

    const pick = () => {
      if (!visible.size) return
      const mid = window.innerHeight / 2
      let best = null
      let bestDist = Infinity
      for (const el of visible.keys()) {
        const rect = el.getBoundingClientRect()
        // Distance from the viewport centre to the nearest edge of the section
        // (0 when the centre is inside it).
        const dist =
          rect.top > mid ? rect.top - mid
          : rect.bottom < mid ? mid - rect.bottom
          : 0
        if (dist < bestDist) {
          bestDist = dist
          best = el
        }
      }
      if (best) setActive(best.id)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target, true)
          else visible.delete(e.target)
        }
        pick()
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // `key` stands in for the ids array so a fresh array literal with the same
    // contents doesn't re-run this effect on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return active
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Trap Tab focus inside an open dialog, and restore it to the trigger on close.
 *
 * Without this, tabbing inside the mobile menu or the project modal walks
 * straight out into the page behind the overlay — the links are still in the
 * tab order even though they're visually covered, which strands keyboard and
 * screen-reader users somewhere they can't see.
 *
 * @param {boolean} active whether the dialog is open
 * @param {() => void} onEscape called when Escape is pressed
 * @returns {React.RefObject<HTMLElement>} ref to attach to the dialog container
 */
export function useFocusTrap(active, onEscape) {
  const ref = useRef(null)
  const restoreRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    restoreRef.current = document.activeElement

    // Move focus into the dialog. Prefer its first control; fall back to the
    // container itself (which the caller marks tabIndex={-1}).
    const focusFirst = () => {
      const first = node.querySelector(FOCUSABLE)
      ;(first instanceof HTMLElement ? first : node).focus({ preventScroll: true })
    }
    const raf = requestAnimationFrame(focusFirst)

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onEscape?.()
        return
      }
      if (e.key !== 'Tab') return

      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (!items.length) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      } else if (!node.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      const restore = restoreRef.current
      if (restore instanceof HTMLElement && document.contains(restore)) {
        restore.focus({ preventScroll: true })
      }
    }
  }, [active, onEscape])

  return ref
}

/**
 * True once the page has scrolled past `threshold` px. Used to reveal the
 * back-to-top control only after the visitor has actually gone somewhere.
 *
 * Reads scroll position inside a rAF so a fast flick can't queue up dozens of
 * state updates.
 */
export function useScrolledPast(threshold = 600) {
  const [past, setPast] = useState(false)

  useEffect(() => {
    let raf = 0
    let queued = false
    const onScroll = () => {
      if (queued) return
      queued = true
      raf = requestAnimationFrame(() => {
        queued = false
        setPast(window.scrollY > threshold)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold])

  return past
}
