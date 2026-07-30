import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isTouch, prefersReducedMotion } from '@/lib/device'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll orchestration — owns the single Lenis instance, keeps GSAP
 * ScrollTrigger in sync with it, and provides the scroll-to / scroll-lock
 * helpers used by the header, the mobile menu and the project modal.
 *
 * ── Why touch devices get NO Lenis ──────────────────────────────────────────
 * Native touch scrolling on iOS and Android runs on the compositor thread: it
 * tracks the finger exactly, keeps its momentum curve even while the main
 * thread is busy, and is what every other app on the phone feels like. Lenis
 * re-implements scrolling in JavaScript on the main thread. On desktop that is
 * a clear win (wheel events are discrete and ugly), but on a phone it means
 * every dropped frame becomes visible drag-lag, and its JS `scrollTo` animation
 * fights the browser's own momentum. That mismatch is what makes a smooth-
 * scroll site feel "stuck to the finger but a beat behind" on mobile.
 *
 * So: Lenis for fine pointers, untouched native scrolling for touch. GSAP
 * ScrollTrigger works against whichever is active with no further changes,
 * because when Lenis is absent it simply reads `window.scrollY` as usual.
 */

let lenis = null
let rafHandler = null

export const getLenis = () => lenis

/**
 * Boot the scroll system. Returns a teardown function.
 *
 * Safe to call once per app mount; under React StrictMode's double-invoke the
 * teardown fully reverses it, so the second run starts from a clean slate.
 */
export function initSmoothScroll() {
  // ── ScrollTrigger tuning that matters most on mobile ──────────────────────
  //
  // `ignoreMobileResize` is the single most important line here. Mobile
  // browsers grow and shrink the visual viewport as the address bar hides on
  // scroll-down and reappears on scroll-up. That fires a `resize`, which by
  // default makes ScrollTrigger re-measure every trigger — so every pinned
  // section's start/end shifts mid-scroll and the content visibly jumps and
  // desynchronises from the finger. Ignoring height-only mobile resizes keeps
  // the pin geometry stable for the whole gesture.
  ScrollTrigger.config({
    ignoreMobileResize: true,
    // Drop `resize` from the auto-refresh list for the same reason; genuine
    // layout changes are handled by the orientation listener below.
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  })

  // Pin via fixed positioning so pinned panes are not affected by the mobile
  // toolbar collapsing the document height underneath them.
  ScrollTrigger.normalizeScroll(false)

  const useLenis = !isTouch() && !prefersReducedMotion()

  if (useLenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Explicit: never take over touch scrolling, even if a future Lenis
      // version changes its default.
      syncTouch: false,
      smoothTouch: false,
    })

    lenis.on('scroll', ScrollTrigger.update)
    rafHandler = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(rafHandler)
    // GSAP throttles its ticker when frames run long; that throttling makes a
    // Lenis-driven scroll stutter, so it is disabled while Lenis owns the loop.
    gsap.ticker.lagSmoothing(0)
  } else {
    // Native scrolling: let GSAP keep its frame-lag protection, which is what
    // stops a slow frame on a phone from producing a large animation jump.
    gsap.ticker.lagSmoothing(500, 33)
  }

  // Re-measure only on a real layout change (rotation / window resize on
  // desktop), debounced so a burst of events costs one refresh.
  let refreshTimer = 0
  const scheduleRefresh = () => {
    window.clearTimeout(refreshTimer)
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 250)
  }
  const orientation = window.matchMedia('(orientation: portrait)')
  orientation.addEventListener('change', scheduleRefresh)
  if (!isTouch()) window.addEventListener('resize', scheduleRefresh)

  return () => {
    window.clearTimeout(refreshTimer)
    orientation.removeEventListener('change', scheduleRefresh)
    window.removeEventListener('resize', scheduleRefresh)
    if (rafHandler) {
      gsap.ticker.remove(rafHandler)
      rafHandler = null
    }
    gsap.ticker.lagSmoothing(500, 33)
    lenis?.destroy()
    lenis = null
  }
}

/**
 * Scroll to an element or selector, honouring the sticky header height and
 * whatever scroll implementation is currently active.
 *
 * @param {string|Element} target
 * @param {{ offset?: number }} [options] extra offset in px (negative = higher)
 */
export function scrollToTarget(target, { offset = 0 } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return

  // The header is sticky, so a raw scroll would tuck the section title behind
  // it. Measure it rather than hard-coding a magic number, because its height
  // differs between mobile and desktop (and grows by the notch inset on iOS).
  const header = document.querySelector('[data-site-header]')
  const headerH = header ? header.getBoundingClientRect().height : 0
  const total = -(headerH + 8) + offset

  if (lenis) {
    lenis.scrollTo(el, { offset: total })
    return
  }

  const top = el.getBoundingClientRect().top + window.scrollY + total
  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  })
}

// ── Scroll lock ────────────────────────────────────────────────────────────

let lockCount = 0

/**
 * Freeze page scrolling while a modal/overlay is open.
 *
 * Deliberately does NOT reposition `<body>` (the usual `position: fixed` trick).
 * This page is built out of GSAP-pinned sections; moving the body would report a
 * scroll position of 0, unpin every track, and then re-pin on unlock — a
 * violent layout thrash behind the overlay. Setting `overflow: hidden` on the
 * root leaves the scroll offset untouched, so pins survive.
 *
 * Reference-counted, so nested overlays cannot unlock each other prematurely.
 */
export function lockScroll() {
  if (lockCount++ > 0) return
  lenis?.stop()
  document.documentElement.setAttribute('data-scroll-locked', 'true')
}

export function unlockScroll() {
  if (lockCount === 0) return
  if (--lockCount > 0) return
  document.documentElement.removeAttribute('data-scroll-locked')
  lenis?.start()
}
