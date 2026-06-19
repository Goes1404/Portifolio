import { motion } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

// Kinetic line reveal. Each line slides up from behind an overflow-hidden mask,
// staggered 0.1s apart, eased with a premium cubic-bezier. Pure `transform`
// animation (translateY %) — no layout properties, so it never triggers reflow.
const lineStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const lineRise = {
  // 115% keeps descenders fully tucked below the mask before reveal.
  hidden: { y: '115%' },
  show: {
    y: '0%',
    transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] },
  },
};

interface MaskedTextProps {
  /** Each entry becomes one masked line. Strings or JSX (e.g. a coloured span).
   *  Author the breaks for rhythm. */
  lines: ReactNode[];
  className?: string;
  style?: CSSProperties;
  /** Semantic element to render. Defaults to a paragraph. */
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'div';
}

/**
 * Drop inside any parent driven by framer-motion variants (e.g. a section with
 * `whileInView="show"`). It inherits the "show" state and runs its OWN nested
 * stagger, so the lines cascade right after the block takes its turn in the
 * parent sequence — keeping the kicker → title → paragraph order intact.
 *
 * NOTE: when masking a tall display face, give the element a line-height ≥ 1 so
 * the glyphs fit their own line box (the mask clips to that box at rest).
 */
export function MaskedText({ lines, className, style, as = 'p' }: MaskedTextProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag variants={lineStagger} className={className} style={style}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span variants={lineRise} className="block will-change-transform">
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

export default MaskedText;
