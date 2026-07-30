import { useRef, useEffect, useState, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  canvasDpr,
  isNarrowScreen,
  isSlowConnection,
  isTouch,
  prefersReducedData,
  prefersReducedMotion,
  scrubFor,
} from '@/lib/device';

gsap.registerPlugin(ScrollTrigger);

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image' | 'sequence';
  mediaSrc?: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  /** Explicit two-line title. When given, overrides the naive first-word split
   *  so the headline stays balanced. titleTop renders white, titleBottom accent. */
  titleTop?: string;
  titleBottom?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const TOTAL_FRAMES = 144;
const frameSrc = (i: number) => `/0611_frames/frame_${String(i + 1).padStart(3, '0')}.webp`;

/**
 * How many of the 144 frames to actually download and decode.
 *
 * Each frame is a 1920×1080 webp: ~110KB on the wire but ~8.3MB once the
 * browser decodes it to a bitmap. Loading all 144 therefore costs ~16MB of
 * transfer and, far worse, on the order of 1.2GB of decoded image memory. A
 * desktop absorbs that; a phone starts evicting decoded frames as fast as they
 * arrive, so the sequence stutters, goes blank, and can take the tab down with
 * it — while also saturating the main thread that the scroll needs.
 *
 * Sampling every Nth frame keeps the full duration of the animation and simply
 * lowers its frame rate, which is nearly invisible during a scrub because the
 * canvas cross-dissolves between neighbouring frames anyway.
 */
function pickFrameStep(): number {
  if (prefersReducedData() || isSlowConnection()) return 12; // 12 frames
  if (isTouch() && isNarrowScreen()) return 4;               // 36 frames
  if (isTouch()) return 2;                                   // 72 frames
  return 1;                                                  // all 144
}


export default function ScrollExpandMedia({
  mediaType = 'image',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  titleTop,
  titleBottom,
  date,
  scrollToExpand = 'scroll para expandir',
  textBlend,
  children,
}: ScrollExpandMediaProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnRef = useRef(-1);
  const [staticPoster, setStaticPoster] = useState(false);

  // Raw 0→1 progress driven by GSAP ScrollTrigger, which is synced with
  // whichever scroller is active (Lenis on desktop, native on touch — see
  // src/lib/scroll.js), so the scroll position is always accurate.
  const rawProgress = useMotionValue(0);

  /**
   * Size the canvas backing store to the box it is actually displayed in.
   *
   * The previous version hard-coded 1920×1080 regardless of the element's real
   * size. On a 390px-wide phone that meant compositing ~2 megapixels every
   * scroll frame to fill a box a fifth of that size — pure waste, and enough to
   * drop the whole page below 60fps while scrolling.
   */
  const syncCanvasSize = (canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    const dpr = canvasDpr(2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      lastDrawnRef.current = -1; // force a redraw into the new buffer
    }
    return true;
  };

  const drawFrame = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!syncCanvasSize(canvas)) return;

    const frames = imagesRef.current;
    if (!frames.length) return;

    const { width: cw, height: ch } = canvas;
    const floatIndex = progress * (frames.length - 1);
    const index1 = Math.max(0, Math.min(frames.length - 1, Math.floor(floatIndex)));
    const index2 = Math.min(frames.length - 1, index1 + 1);
    const alpha = floatIndex - index1;

    const ready = (img?: HTMLImageElement) =>
      !!img && img.complete && img.naturalWidth > 0;

    let base = index1;
    if (!ready(frames[base])) {
      // Fall back to the nearest decoded neighbour so a frame that hasn't
      // arrived yet holds the last good image instead of flashing empty.
      let found = -1;
      for (let d = 1; d < frames.length; d++) {
        if (base - d >= 0 && ready(frames[base - d])) { found = base - d; break; }
        if (base + d < frames.length && ready(frames[base + d])) { found = base + d; break; }
      }
      if (found === -1) return;
      base = found;
    }

    const crossFade = base === index1 && index1 !== index2 && ready(frames[index2]) && alpha > 0.01;
    // Skip the redraw entirely when nothing would change — during the held
    // section at the end of the track this saves every single frame's work.
    if (!crossFade && lastDrawnRef.current === base) return;

    ctx.clearRect(0, 0, cw, ch);
    ctx.globalAlpha = 1;
    ctx.drawImage(frames[base], 0, 0, cw, ch);
    if (crossFade) {
      ctx.globalAlpha = alpha;
      ctx.drawImage(frames[index2], 0, 0, cw, ch);
      ctx.globalAlpha = 1;
    }
    lastDrawnRef.current = crossFade ? -1 : base;
  };

  // ── Frame loading ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (mediaType !== 'sequence') return;

    // Reduced motion: no scrubbing sequence at all. Show the poster still.
    if (prefersReducedMotion()) {
      setStaticPoster(true);
      return;
    }

    let active = true;
    // Chosen once per mount. `drawFrame` derives its index from
    // `imagesRef.current.length`, so the two can never disagree.
    const step = pickFrameStep();

    const indices: number[] = [];
    for (let i = 0; i < TOTAL_FRAMES; i += step) indices.push(i);
    // Always include the final frame so the sequence resolves on its real end.
    if (indices[indices.length - 1] !== TOTAL_FRAMES - 1) indices.push(TOTAL_FRAMES - 1);

    const images: HTMLImageElement[] = new Array(indices.length);
    imagesRef.current = images;

    const load = (slot: number) => {
      const img = new Image();
      img.decoding = 'async';
      if (slot < 3) img.fetchPriority = 'high';
      img.onload = () => {
        if (active && slot === 0) drawFrame(rawProgress.get());
      };
      img.src = frameSrc(indices[slot]);
      images[slot] = img;
    };

    // Progressive, batched loading. Loading every frame at once floods the
    // connection and blocks decode of the frames actually needed first, so the
    // opening frames land immediately and the rest trickle in behind them.
    const FIRST = Math.min(6, indices.length);
    for (let i = 0; i < FIRST; i++) load(i);

    let cursor = FIRST;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const loadNext = () => {
      if (!active) return;
      const end = Math.min(indices.length, cursor + 6);
      for (let i = cursor; i < end; i++) load(i);
      cursor = end;
      if (cursor < indices.length) timer = setTimeout(loadNext, 120);
    };
    timer = setTimeout(loadNext, 150);

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      // Drop the decoded bitmaps so leaving the page reclaims the memory
      // instead of holding it until GC happens to notice.
      for (const img of images) {
        if (img) img.src = '';
      }
      imagesRef.current = [];
      lastDrawnRef.current = -1;
    };
  }, [mediaType, rawProgress]);

  // Redraw on resize — the canvas backing store follows the element's box.
  useEffect(() => {
    if (mediaType !== 'sequence' || staticPoster) return;
    const onResize = () => {
      lastDrawnRef.current = -1;
      drawFrame(rawProgress.get());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mediaType, staticPoster, rawProgress]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const obj = { progress: 0 };
    const t = gsap.to(obj, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        // Long catch-up reads as inertia with a wheel; on touch it just reads as
        // lag, because the finger is already telling the user where they are.
        scrub: scrubFor(1.5),
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        rawProgress.set(obj.progress);
        if (mediaType === 'sequence' && !staticPoster) {
          drawFrame(obj.progress);
        }
      },
    });

    return () => {
      t.kill();
      if (t.scrollTrigger) t.scrollTrigger.kill();
    };
  }, [rawProgress, mediaType, staticPoster]);

  // Expansion completes at 75% of the track; the last 25% holds the fully-expanded frame.
  const p = useTransform(rawProgress, [0, 0.75], [0, 1], { clamp: true });

  // The card's start size has to be relative to the screen, not absolute. A
  // fixed 300×370px start is 77% of a 390px phone, so the "expand" barely reads
  // as an expansion at all — it just grows a little and stops at max-width.
  // Measuring the viewport lets the gesture cover the same proportional range
  // on a phone as on a desktop.
  const [dims, setDims] = useState({ w0: 300, h0: 370, narrow: false });
  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const scale = vw < 640 ? 0.46 : vw < 1024 ? 0.4 : 1;
      setDims({
        w0: Math.round(Math.min(300, vw * scale)),
        h0: Math.round(Math.min(370, vw * scale * 1.23)),
        narrow: vw < 768,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // All visual values derived as MotionValues — zero React re-renders on scroll.
  // mediaW/H use px only (same unit = smooth framer-motion interpolation).
  const mediaW      = useTransform(p, [0, 1], [`${dims.w0}px`, '1540px']);
  const mediaH      = useTransform(p, [0, 1], [`${dims.h0}px`, '840px']);
  const bgOpacity   = useTransform(p, [0, 1], [1, 0]);
  const veilOpacity = useTransform(p, [0, 1], [0.6, 0.1]);
  const boxShadow   = useTransform(p, [0, 1], [
    '0 0 20px rgba(47,107,255,0.12)',
    '0 0 100px rgba(47,107,255,0.32)',
  ]);
  // Text slides: both values in vw (same unit = smooth interpolation).
  //
  // The headline sits ON TOP of the media card and slides away to reveal it. On
  // a phone the card is a small centred rectangle while the headline still
  // spans the full width, so the two overlap far more than they do on a wide
  // screen — the title ends up printed across the image with the "role para
  // expandir" hint on top of it. Clearing the text by 45% of the expansion
  // (instead of 100%) keeps that collision to a brief, deliberate-looking beat.
  const textOut     = dims.narrow ? 0.45 : 1;
  const xLeft       = useTransform(p, [0, textOut], ['0vw', '-160vw'], { clamp: true });
  const xRight      = useTransform(p, [0, textOut], ['0vw',  '160vw'], { clamp: true });

  // Parallax EXIT — once the card is fully expanded (~0.75) and held, the last
  // stretch of the track lifts it away: it drifts up, pushes in slightly and
  // dissolves, so the media "exits" the frame before the next section arrives.
  const exitY       = useTransform(rawProgress, [0.86, 1], ['0vh', '-26vh'], { clamp: true });
  const exitScale   = useTransform(rawProgress, [0.86, 1], [1, 1.08], { clamp: true });
  const exitOpacity = useTransform(rawProgress, [0.9, 1], [1, 0], { clamp: true });

  // Content below fades in after expansion
  const contentAlpha = useTransform(rawProgress, [0.73, 0.86], [0, 1], { clamp: true });

  // Prefer the explicit two-line title; otherwise fall back to splitting the
  // single `title` on its first word (legacy behaviour).
  const words    = title?.split(' ') ?? [];
  const topLine    = titleTop    ?? words[0] ?? '';
  const bottomLine = titleBottom ?? words.slice(1).join(' ');

  return (
    // No overflow-x here — that breaks position:sticky in Chromium.
    // The sticky inner div has overflow:hidden which handles clipping.
    <div ref={trackRef} className="track-expand relative bg-[#05070f]">

      {/* ── Pinned viewport ─────────────────────────────────── */}
      <div className="pane-sticky">

        {/* Static atmospheric backdrop — a blurred frame of the video itself,
            so it carries the exact cold/blue mood with ZERO per-frame GPU cost
            (no WebGL). It just fades out as the media card expands. */}
        <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 z-0">
          {/* Blurred, darkened still — composited once, then cached by the GPU */}
          <div
            aria-hidden
            className="absolute inset-0 scale-110 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bgImageSrc})`,
              filter: 'blur(28px) brightness(0.42) saturate(1.15)',
            }}
          />
          {/* Cold blue glow rising from the centre — echoes the ice sculpture */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 55% at 50% 45%, rgba(47,107,255,0.30) 0%, rgba(56,224,255,0.10) 35%, transparent 70%)',
            }}
          />
          {/* Vignette + base tint to keep the centred text legible */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 120% at 50% 50%, transparent 35%, rgba(5,7,15,0.85) 100%)',
            }}
          />
          <div className="absolute inset-0 bg-[#05070f]/35" />
        </motion.div>

        {/* Expanding media card — centred via flexbox so the parallax-exit
            `y`/`scale` transforms never collide with a translate-based centring. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <motion.div
          className="overflow-hidden rounded-2xl will-change-transform"
          style={{
            width:     mediaW,
            height:    mediaH,
            maxWidth:  '96vw',
            // svh, not vh: with vh the card is taller than the visible area
            // whenever the mobile address bar is showing.
            maxHeight: 'calc(var(--svh) * 88)',
            boxShadow,
            y:         exitY,
            scale:     exitScale,
            opacity:   exitOpacity,
          }}
        >
          {mediaType === 'sequence' ? (
            staticPoster ? (
              // Reduced motion: a single still stands in for the scrubbed
              // sequence. The card still expands (that's scroll-linked layout,
              // not decoration) but nothing animates frame to frame.
              <img
                src={bgImageSrc}
                alt={title ?? ''}
                className="block h-full w-full object-cover"
              />
            ) : (
              <canvas
                ref={canvasRef}
                aria-hidden
                className="block h-full w-full object-cover"
              />
            )
          ) : mediaType === 'video' ? (
            <video
              src={mediaSrc}
              poster={posterSrc}
              autoPlay muted loop playsInline preload="auto"
              disablePictureInPicture
              className="h-full w-full object-cover"
            />
          ) : (
            <img src={mediaSrc} alt={title ?? ''} className="h-full w-full object-cover" />
          )}
          {/* Overlay clears as the card grows to reveal the media */}
          <motion.div className="absolute inset-0 bg-[#05070f]" style={{ opacity: veilOpacity }} />
        </motion.div>
        </div>

        {/* ── Text layers ── two balanced lines that slide apart to clear the
            expanding media. Top line drifts left, bottom line drifts right. */}
        <div
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center pointer-events-none ${
            textBlend ? 'mix-blend-difference' : ''
          }`}
        >
          {date && (
            <motion.p
              style={{ x: xLeft }}
              className="mb-5 flex items-center gap-3 font-code text-[10px] uppercase tracking-[0.42em] text-white/60 sm:text-xs"
            >
              <span className="h-px w-6 bg-brand/70" />
              {date}
              <span className="h-px w-6 bg-brand/70" />
            </motion.p>
          )}

          <h2 className="fx-title font-display leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2.2rem, 6.5vw, 5.2rem)' }}>
            {topLine && (
              <motion.span
                style={{ x: xLeft }}
                className="block text-[#e9edf7]"
              >
                {topLine}
              </motion.span>
            )}
            {bottomLine && (
              <motion.span
                style={{ x: xRight }}
                className="block bg-gradient-to-r from-[#2f6bff] via-[#6f97ff] to-[#38e0ff] bg-clip-text text-transparent"
              >
                {bottomLine}
              </motion.span>
            )}
          </h2>

          {scrollToExpand && (
            <motion.p
              style={{ x: xRight }}
              className="mt-7 flex items-center gap-2 font-code text-[10px] uppercase tracking-[0.32em] text-[#6f97ff]"
            >
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#38e0ff]" />
              {scrollToExpand}
            </motion.p>
          )}
        </div>
      </div>

      {/* Children — appear below the sticky frame after expansion */}
      {children && (
        <motion.div
          style={{ opacity: contentAlpha }}
          className="relative z-30 bg-[#05070f] px-8 py-20 md:px-16"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
