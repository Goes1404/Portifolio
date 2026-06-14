import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Magnetic wrapper — the child is gently pulled toward the pointer while it
 * hovers, then springs back to rest on leave. Spring-backed so motion stays
 * fluid even on fast pointer moves.
 *
 * Usage:
 *   <Magnetic strength={0.4}><button>Hover me</button></Magnetic>
 */
export default function Magnetic({
  children,
  strength = 0.35,
  as = 'div',
  className = '',
  ...rest
}) {
  const ref = useRef(null)
  const mvx = useMotionValue(0)
  const mvy = useMotionValue(0)
  const spring = { stiffness: 200, damping: 18, mass: 0.4 }
  const x = useSpring(mvx, spring)
  const y = useSpring(mvy, spring)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    mvx.set(relX * strength)
    mvy.set(relY * strength)
  }
  const onLeave = () => {
    mvx.set(0)
    mvy.set(0)
  }

  const MotionTag = motion[as] || motion.div

  return (
    <MotionTag
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x, y, display: 'inline-block' }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
