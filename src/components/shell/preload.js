export const PRELOAD_KEY = 'mgs:preloaded'

/** Play the preloader once per session; never under reduced-motion. */
export function shouldPreload() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try { return !sessionStorage.getItem(PRELOAD_KEY) } catch { return true }
}
