import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * GSAP split-text reveal. The text is broken into words and characters; each
 * line lives inside an `overflow:hidden` mask so glyphs rise out of an invisible
 * baseline (a clean "type unmasking" effect). Characters stagger in on scroll,
 * lifting from below with a slight rotation + blur clear.
 *
 * Splitting is done by hand (no paid SplitText plugin) and is whitespace-aware,
 * so wrapping still works. Honors reduced-motion by rendering the final state.
 */
export default function SplitReveal({
  children,
  as: Tag = 'div',
  className = '',
  stagger = 0.022,
  duration = 0.9,
  y = '110%',
  start = 'top 85%',
  once = true,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const text = el.textContent || ''
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Build word > char structure inside masks
    el.textContent = ''
    const chars = []
    const words = text.split(/(\s+)/) // keep whitespace tokens
    for (const token of words) {
      if (/^\s+$/.test(token)) {
        el.appendChild(document.createTextNode(' '))
        continue
      }
      const wordWrap = document.createElement('span')
      wordWrap.className = 'sr-word'
      for (const ch of token) {
        const mask = document.createElement('span')
        mask.className = 'sr-mask'
        const inner = document.createElement('span')
        inner.className = 'sr-char'
        inner.textContent = ch
        mask.appendChild(inner)
        wordWrap.appendChild(mask)
        chars.push(inner)
      }
      el.appendChild(wordWrap)
    }

    if (reduced) {
      gsap.set(chars, { yPercent: 0, opacity: 1, filter: 'blur(0px)', rotate: 0 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(chars, { yPercent: 110, opacity: 0, rotate: 6, filter: 'blur(6px)' })
      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        filter: 'blur(0px)',
        duration,
        ease: 'power4.out',
        stagger,
        scrollTrigger: { trigger: el, start, once },
      })
    }, el)

    return () => {
      ctx.revert()
      el.textContent = text // restore plain text for accessibility/re-runs
    }
  }, [children, stagger, duration, y, start, once])

  return (
    <Tag ref={ref} className={`sr-root ${className}`}>
      {children}
    </Tag>
  )
}
