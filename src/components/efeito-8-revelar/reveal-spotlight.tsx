import { useRef, useState, useCallback, type PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface RevealSpotlightProps {
  /** Imagem em PRETO E BRANCO — fica visível por baixo (estado de repouso). */
  bwSrc: string;
  /** Imagem COLORIDA — revelada sob o "holofote" que segue o ponteiro/dedo. */
  colorSrc: string;
  /** Texto alternativo (descreve a foto colorida, que é o conteúdo real). */
  alt?: string;
  /** Rótulo de ajuda mostrado no estado de repouso. */
  hint?: string;
  className?: string;
}

// Spring presets tuned for a smooth, "tirar o fôlego" follow — the light eases
// toward the pointer instead of snapping, and the radius blooms open/closed.
const POS_SPRING = { stiffness: 320, damping: 36, mass: 0.5 };
const R_SPRING = { stiffness: 190, damping: 26 };

/**
 * RevealSpotlight — black-and-white photo that reveals its color twin inside a
 * soft, glowing circle that tracks the cursor (or finger). Pointer Events cover
 * mouse, pen and touch with one code path. Honors prefers-reduced-motion by
 * falling back to a gentle full-frame cross-fade.
 */
export default function RevealSpotlight({
  bwSrc,
  colorSrc,
  alt = "",
  hint = "passe o mouse · arraste o dedo",
  className,
}: RevealSpotlightProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Pointer position (px, relative to the frame) → spring-smoothed.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, POS_SPRING);
  const y = useSpring(my, POS_SPRING);

  // Spotlight radius springs 0 → R on enter and back to 0 on leave.
  const targetR = useMotionValue(0);
  const r = useSpring(targetR, R_SPRING);

  // Soft-edged circular mask, centered on the (lagged) pointer. Solid to 62% of
  // the radius, then feathered to transparent at the rim — that feather is what
  // makes the reveal feel like light rather than a hard cut-out.
  const maskImage = useMotionTemplate`radial-gradient(circle ${r}px at ${x}px ${y}px, #000 0%, #000 62%, rgba(0,0,0,0) 100%)`;

  // Brand-tinted glow ring that hugs the rim of the spotlight.
  const haloSize = useTransform(r, (v) => v * 2.15);
  const haloOpacity = useTransform(r, (v) => Math.min(0.7, v / 260));

  const radiusFor = (rect: DOMRect) =>
    Math.max(132, Math.min(Math.min(rect.width, rect.height) * 0.5, 280));

  const track = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
    targetR.set(radiusFor(rect));
  }, [mx, my, targetR]);

  const open = useCallback((e: PointerEvent<HTMLDivElement>) => {
    track(e);
    // Seed the springs at the entry point so the light doesn't fly in from 0,0.
    x.jump(mx.get());
    y.jump(my.get());
    setActive(true);
  }, [track, x, y, mx, my]);

  const close = useCallback(() => {
    targetR.set(0);
    setActive(false);
  }, [targetR]);

  // ── Reduced motion: skip the tracking light, cross-fade the whole frame ──
  if (prefersReduced) {
    return (
      <Frame
        ref={ref}
        className={className}
        active={active}
        hint={hint}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
        onPointerDown={() => setActive(true)}
        onPointerUp={() => setActive(false)}
      >
        <img src={bwSrc} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        <img
          src={colorSrc}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out"
          style={{ opacity: active ? 1 : 0 }}
        />
      </Frame>
    );
  }

  return (
    <Frame
      ref={ref}
      className={className}
      active={active}
      hint={hint}
      onPointerEnter={open}
      onPointerMove={(e) => {
        track(e);
        if (!active) setActive(true);
      }}
      onPointerDown={open}
      onPointerLeave={close}
      onPointerUp={close}
      onPointerCancel={close}
    >
      {/* Base: black & white */}
      <img src={bwSrc} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-cover" />

      {/* Color twin, revealed only inside the masked circle */}
      <motion.img
        src={colorSrc}
        alt={alt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          WebkitMaskImage: maskImage,
          maskImage,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />

      {/* Glow ring hugging the rim of the spotlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
        style={{
          left: x,
          top: y,
          width: haloSize,
          height: haloSize,
          opacity: haloOpacity,
          background:
            "radial-gradient(circle, rgba(0,0,0,0) 54%, rgba(47,107,255,0.55) 66%, rgba(56,224,255,0.25) 80%, rgba(0,0,0,0) 100%)",
        }}
      />
    </Frame>
  );
}

// ── Shared frame: aspect, borders, grain/vignette and the resting hint ──
interface FrameProps {
  className?: string;
  active: boolean;
  hint: string;
  children: React.ReactNode;
  onPointerEnter?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerDown?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerLeave?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (e: PointerEvent<HTMLDivElement>) => void;
}

const Frame = ({ ref, className, active, hint, children, ...handlers }: FrameProps & { ref: React.Ref<HTMLDivElement> }) => (
  <div
    ref={ref}
    data-cursor="revelar"
    className={cn(
      // touch-pan-y lets the page still scroll vertically; horizontal drags /
      // taps drive the spotlight instead of being swallowed.
      "group relative aspect-[4/5] w-full touch-pan-y select-none overflow-hidden rounded-xl border rule bg-[#05070f]",
      "shadow-[0_40px_120px_-40px_rgba(47,107,255,0.45)]",
      className,
    )}
    {...handlers}
  >
    {children}

    {/* Film grain + vignette so it sits in the site's atmosphere */}
    <div className="bg-noise pointer-events-none absolute inset-0 z-20 opacity-[0.10] mix-blend-overlay" />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20"
      style={{ boxShadow: "inset 0 0 120px 20px rgba(5,7,15,0.7)" }}
    />

    {/* Resting hint — fades out the moment the reveal is active */}
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-3.5 transition-opacity duration-500",
        active ? "opacity-0" : "opacity-100",
      )}
    >
      {/* Soft scrim so the hint reads on any photo — light or dark */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(58% 48% at 50% 50%, rgba(5,7,15,0.6) 0%, rgba(5,7,15,0) 72%)" }}
      />
      <span className="relative flex h-11 w-11 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-white/40" />
        <span className="thread-dot h-2 w-2 rounded-full bg-brand" />
      </span>
      <span className="relative max-w-[82%] rounded-full border border-white/15 bg-[#05070f]/55 px-3 py-1.5 text-center font-code text-[9px] uppercase leading-tight tracking-[0.26em] text-white/85 backdrop-blur-sm">
        {hint}
      </span>
    </div>

    {/* Corner ticks — small editorial frame detail */}
    <span className="pointer-events-none absolute left-3 top-3 z-30 h-4 w-4 border-l border-t border-white/30" />
    <span className="pointer-events-none absolute bottom-3 right-3 z-30 h-4 w-4 border-b border-r border-white/30" />
  </div>
);
