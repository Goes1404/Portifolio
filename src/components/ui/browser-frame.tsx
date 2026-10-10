import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BrowserFrameProps {
  src: string;
  alt: string;
  /** Shown in the address pill (hostname is enough). */
  url?: string;
  /** framer layoutId for the image, so the modal can share it. */
  layoutId?: string;
  accentHex?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * The one mockup every project cover sits in: a minimal dark browser chrome
 * (three dots + address pill), the live screenshot cropped from the top,
 * and the same inner shadow and grain. Consistency is the point — nine
 * different sites read as one series.
 */
export default function BrowserFrame({ src, alt, url, layoutId, accentHex = "#2f6bff", className = "", children }: BrowserFrameProps) {
  const host = url ? url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "localhost";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e1c] shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)] ${className}`}>
      {/* Chrome */}
      <div className="relative z-10 flex items-center gap-3 border-b border-white/[0.06] bg-[#0a0e1c] px-4 py-2.5">
        <span className="flex gap-1.5">
          <i className="h-2 w-2 rounded-full bg-white/15" />
          <i className="h-2 w-2 rounded-full bg-white/15" />
          <i className="h-2 w-2 rounded-full" style={{ background: accentHex }} />
        </span>
        <span className="mx-auto flex h-5 w-[52%] items-center justify-center gap-1.5 rounded-full bg-white/[0.05] font-code text-[9px] tracking-[0.15em] text-white/40">
          <i className="h-1 w-1 rounded-full bg-[#38e0ff]" />
          {host}
        </span>
        <span className="w-9" />
      </div>
      {/* Shot */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <motion.img
          layoutId={layoutId}
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(5,7,15,0.55)]" />
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />
        {children}
      </div>
    </div>
  );
}
