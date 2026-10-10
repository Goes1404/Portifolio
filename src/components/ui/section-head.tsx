import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const rise: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } },
}
const lineStagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const lineRise: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.9, ease: EASE } },
}

interface SectionHeadProps {
  num: string
  kicker: string
  /** Each entry becomes one masked line. Strings or JSX (e.g. an accent span). */
  title: ReactNode[]
  lead?: ReactNode
  /** Right-aligned meta column (desktop). */
  aside?: ReactNode
  className?: string
  size?: 'md' | 'lg'
}

/**
 * Unified editorial section header — index numeral + kicker rule on the left,
 * masked-line title, optional lead and an aside column. Every section shares
 * this so the page reads as one system.
 */
export default function SectionHead({ num, kicker, title, lead, aside, className = '', size = 'lg' }: SectionHeadProps) {
  return (
    <motion.div
      variants={group}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      className={`relative ${className}`}
    >
      <motion.div variants={rise} className="flex items-center gap-4">
        <span className="font-display text-sm leading-none text-[#2f6bff]">{num}</span>
        <span className="h-px w-10 bg-[#2f6bff]" />
        <span className="font-code text-[11px] uppercase tracking-[0.35em] text-white/50">{kicker}</span>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
        <motion.h2
          variants={lineStagger}
          className="font-display leading-[1.02] text-[#e9edf7]"
          style={{ fontSize: size === 'lg' ? 'clamp(2.6rem, 7.5vw, 6.5rem)' : 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
        >
          {title.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={lineRise} className="block">
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        {aside && (
          <motion.div variants={rise} className="md:max-w-xs md:pb-2 md:text-right">
            {aside}
          </motion.div>
        )}
      </div>

      {lead && (
        <motion.p variants={rise} className="mt-7 max-w-xl font-editorial text-xl italic leading-snug text-white/55 md:text-2xl">
          {lead}
        </motion.p>
      )}
    </motion.div>
  )
}
