import { useCallback, useSyncExternalStore } from 'react'

/**
 * Device capability detection — the single source of truth for how aggressively
 * an effect may spend the user's CPU/GPU/battery.
 *
 * Every decorative effect on the site (WebGL shaders, canvas particle fields,
 * pinned scroll tracks, pointer-driven micro-interactions) reads from here
 * instead of doing its own ad-hoc `innerWidth < 768` check, so the degradation
 * story stays consistent and there is one place to tune it.
 *
 * All helpers are SSR-safe (they answer conservatively when `window` is absent)
 * and all matchMedia queries are read live, never cached at module scope — a
 * cached value goes stale when the user rotates the device, resizes a desktop
 * window, or flips the reduced-motion switch mid-session.
 */

const MQ = {
  /** No hover-capable pointer — phones, tablets, most touch laptops in tablet mode. */
  coarse: '(pointer: coarse)',
  /** A real mouse/trackpad is present. */
  fine: '(pointer: fine)',
  /** Hover actually works (excludes touch devices that fake `:hover` on tap). */
  hover: '(hover: hover)',
  /** Phone-sized. Matches the Tailwind `sm` breakpoint boundary. */
  small: '(max-width: 639px)',
  /** Phone or small tablet. Matches the Tailwind `md` breakpoint boundary. */
  narrow: '(max-width: 767px)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
}

const matches = (query) => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(query).matches
}

export const isTouch = () => matches(MQ.coarse) || !matches(MQ.hover)
export const isFinePointer = () => matches(MQ.fine) && matches(MQ.hover)
export const isSmallScreen = () => matches(MQ.small)
export const isNarrowScreen = () => matches(MQ.narrow)
export const prefersReducedMotion = () => matches(MQ.reducedMotion)

/**
 * The user asked the OS/browser to conserve data. Chromium-only, but when it is
 * set it is an explicit signal we should honour before shipping 15MB of frames.
 */
export const prefersReducedData = () => {
  if (typeof navigator === 'undefined') return false
  return navigator.connection?.saveData === true
}

/** A connection slow enough that a heavy image sequence would never keep up. */
export const isSlowConnection = () => {
  if (typeof navigator === 'undefined') return false
  const type = navigator.connection?.effectiveType
  return type === 'slow-2g' || type === '2g' || type === '3g'
}

/**
 * Rough device-class score used to decide whether the expensive decorative
 * layers are affordable at all.
 *
 * `hardwareConcurrency` and `deviceMemory` are advisory and absent on Safari, so
 * a missing value must never by itself mark a device as weak — we only treat a
 * device as low-end when it *reports* a low value. Touch + tiny screen is the
 * reliable signal, and it carries most of the weight.
 */
export const isLowPowerDevice = () => {
  if (typeof navigator === 'undefined') return true
  const cores = navigator.hardwareConcurrency
  const memory = navigator.deviceMemory
  if (typeof cores === 'number' && cores > 0 && cores <= 4) return true
  if (typeof memory === 'number' && memory > 0 && memory <= 4) return true
  return false
}

/**
 * The master switch for expensive always-on visuals: fullscreen WebGL shaders,
 * three.js scenes, per-frame canvas compositing.
 *
 * Note this deliberately does NOT include plain touch devices with big screens
 * and lots of cores (e.g. an iPad Pro) — those render the full experience.
 */
export const shouldSkipHeavyVisuals = () =>
  prefersReducedMotion() ||
  prefersReducedData() ||
  isSlowConnection() ||
  (isTouch() && (isNarrowScreen() || isLowPowerDevice()))

/**
 * Pointer-driven micro-interactions (magnetic pull, 3D tilt, liquid distortion,
 * custom cursor) only make sense where there is a hovering cursor to react to.
 * On touch they either do nothing or actively fight the user's finger.
 */
export const shouldEnablePointerEffects = () =>
  isFinePointer() && !prefersReducedMotion()

/** Device-pixel-ratio ceiling for canvas backing stores. */
export const canvasDpr = (max = 2) => {
  if (typeof window === 'undefined') return 1
  const cap = isTouch() && isNarrowScreen() ? Math.min(max, 1.5) : max
  return Math.min(window.devicePixelRatio || 1, cap)
}

/**
 * How far a GSAP `scrub` should lag behind the scroll position.
 *
 * A long scrub reads as luxurious inertia with a mouse wheel, but on a
 * touchscreen the content is pinned to the finger, so the same lag reads as the
 * page being broken — you drag and nothing moves. Touch gets a near-immediate
 * scrub, and reduced-motion gets an exact one.
 */
export const scrubFor = (desktopValue = 1) => {
  if (prefersReducedMotion()) return true
  return isTouch() ? Math.min(desktopValue, 0.3) : desktopValue
}

// ── React bindings ─────────────────────────────────────────────────────────

/**
 * Subscribe to a media query.
 *
 * The initial value is resolved SYNCHRONOUSLY, in a lazy `useState` initializer,
 * not in an effect. That distinction matters a great deal here: callers use this
 * to decide whether to *mount* an expensive component at all. If the first
 * render returned a placeholder `false`, a phone would mount the WebGL shader
 * and the three.js scene, fire their dynamic imports and create their GL
 * contexts, and only unmount them one commit later — having already paid the
 * download and the initialisation cost the gate exists to avoid.
 *
 * This app is a client-rendered SPA, so there is no server markup to match and
 * nothing to hydrate; reading matchMedia during the first render is safe.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  const getSnapshot = useCallback(() => matches(query), [query])

  // useSyncExternalStore gives us the real value on the very first render and
  // still re-reads it after subscribing, so a change landing between render and
  // commit can't be missed — without the cascading extra render that a
  // setState-in-effect would cause.
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export const useIsTouch = () => useMediaQuery(MQ.coarse)
export const useIsSmallScreen = () => useMediaQuery(MQ.small)
export const useIsNarrowScreen = () => useMediaQuery(MQ.narrow)
export const useReducedMotion = () => useMediaQuery(MQ.reducedMotion)

/**
 * Live version of `shouldEnablePointerEffects` for components that need to
 * change what they *render* (not just what they listen to) — e.g. dropping a
 * wrapper element entirely on touch.
 */
export function usePointerEffects() {
  const fine = useMediaQuery(MQ.fine)
  const hover = useMediaQuery(MQ.hover)
  const reduced = useMediaQuery(MQ.reducedMotion)
  return fine && hover && !reduced
}

/**
 * The hardware/connection hints don't change during a session and can't fire
 * change events, so they're resolved once on first use and cached — no effect,
 * no extra render.
 */
let constraintCache = null
const sessionConstraints = () => {
  if (constraintCache === null) {
    constraintCache = {
      reducedData: prefersReducedData(),
      slow: isSlowConnection(),
      lowPower: isLowPowerDevice(),
    }
  }
  return constraintCache
}

/**
 * Live version of `shouldSkipHeavyVisuals`. Re-evaluates on breakpoint and
 * reduced-motion changes, which are the parts that genuinely can change
 * mid-session (rotation, window resize, toggling the OS motion setting).
 */
export function useSkipHeavyVisuals() {
  const narrow = useMediaQuery(MQ.narrow)
  const coarse = useMediaQuery(MQ.coarse)
  const reduced = useMediaQuery(MQ.reducedMotion)
  const { reducedData, slow, lowPower } = sessionConstraints()

  if (reduced || reducedData || slow) return true
  return coarse && (narrow || lowPower)
}

export { MQ }
