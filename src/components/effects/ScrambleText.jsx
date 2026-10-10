import { useEffect, useRef, useState } from 'react'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01'

/**
 * Text "decode" micro-interaction. The string is shown as random glyphs that
 * resolve left→right into the final characters. Triggers on mount (optional)
 * and on hover of the nearest `[data-scramble-trigger]` ancestor or itself.
 * Keeps the real text in an sr-only span so assistive tech reads it cleanly.
 */
export default function ScrambleText({
  children,
  as: Tag = 'span',
  className = '',
  playOnMount = false,
  duration = 600,
  ...rest
}) {
  const text = String(children)
  const [out, setOut] = useState(text)
  const raf = useRef(0)
  const ref = useRef(null)

  const play = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    cancelAnimationFrame(raf.current)
    const start = performance.now()
    const run = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const resolved = Math.floor(t * text.length)
      let s = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (ch === ' ') { s += ' '; continue }
        s += i < resolved ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      setOut(s)
      if (t < 1) raf.current = requestAnimationFrame(run)
      else setOut(text)
    }
    raf.current = requestAnimationFrame(run)
  }

  useEffect(() => {
    if (playOnMount) play()
    const el = ref.current
    const trigger = el?.closest('[data-scramble-trigger]') || el
    if (!trigger) return
    trigger.addEventListener('pointerenter', play)
    return () => {
      trigger.removeEventListener('pointerenter', play)
      cancelAnimationFrame(raf.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, playOnMount])

  return (
    <Tag ref={ref} className={className} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{out}</span>
    </Tag>
  )
}
