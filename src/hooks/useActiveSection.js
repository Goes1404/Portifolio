import { useEffect, useState } from 'react'

/**
 * Tracks which section id currently crosses the vertical centre band of the
 * viewport. Drives the header marker and the side rail; nothing visual itself.
 */
export default function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] ?? null)
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!els.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [ids])
  return active
}
