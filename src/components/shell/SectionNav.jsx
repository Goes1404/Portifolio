import { motion } from 'framer-motion'

/**
 * Vertical section navigator (desktop). A thin rail of ticks; the active one
 * stretches into a line and reveals its label. Replaces the static vertical
 * metadata text with something that actually orients the reader.
 */
export default function SectionNav({ nav, activeId, onNav }) {
  return (
    <nav aria-label="Seções" className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
      {nav.map((item) => {
        const active = activeId === item.href.slice(1)
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => onNav(e, item.href)}
            aria-current={active ? 'true' : undefined}
            className="group flex items-center gap-3"
          >
            <motion.span
              animate={{ width: active ? 28 : 12, backgroundColor: active ? '#38e0ff' : 'rgba(233,237,247,0.25)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="block h-px group-hover:!bg-[#e9edf7]"
            />
            <span
              className={`-translate-x-2 font-code text-[10px] uppercase tracking-[0.3em] opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 ${
                active ? 'text-white/80' : 'text-white/45'
              }`}
            >
              {item.num} {item.label}
            </span>
          </a>
        )
      })}
    </nav>
  )
}
