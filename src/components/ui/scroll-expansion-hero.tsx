import { useRef, useEffect, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useMotionValue, useTransform } from 'framer-motion';

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

const FRAMES = Array.from({ length: 144 }, (_, i) => `frame_${String(i + 1).padStart(3, '0')}.webp`);


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

  // Raw 0→1 progress driven by GSAP ScrollTrigger, which is already synced
  // with the global Lenis instance (App.jsx wires lenis.on('scroll', ScrollTrigger.update)).
  // This guarantees the scroll position is always accurate with momentum scroll.
  const rawProgress = useMotionValue(0);

  const drawFrame = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== 1920 || canvas.height !== 1080) {
      canvas.width = 1920;
      canvas.height = 1080;
    }

    const floatIndex = progress * (FRAMES.length - 1);
    const index1 = Math.floor(floatIndex);
    const index2 = Math.min(FRAMES.length - 1, index1 + 1);
    const alpha = floatIndex - index1;

    const img1 = imagesRef.current[index1];
    const img2 = imagesRef.current[index2];

    const isImg1Ready = img1 && img1.complete && img1.naturalWidth > 0;
    const isImg2Ready = img2 && img2.complete && img2.naturalWidth > 0;

    if (isImg1Ready) {
      ctx.clearRect(0, 0, 1920, 1080);
      
      // Draw first frame
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img1, 0, 0, 1920, 1080);

      // Draw second frame with alpha opacity on top to create cross-dissolve smoothing
      if (index1 !== index2 && isImg2Ready && alpha > 0.01) {
        ctx.globalAlpha = alpha;
        ctx.drawImage(img2, 0, 0, 1920, 1080);
      }
      
      ctx.globalAlpha = 1.0;
    } else {
      const fallback = imagesRef.current.find(i => i && i.complete && i.naturalWidth > 0);
      if (fallback) {
        ctx.clearRect(0, 0, 1920, 1080);
        ctx.globalAlpha = 1.0;
        ctx.drawImage(fallback, 0, 0, 1920, 1080);
      }
    }
  };

  useEffect(() => {
    if (mediaType !== 'sequence') return;

    let active = true;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    FRAMES.forEach((frame, index) => {
      const img = new Image();
      img.src = `/0611_frames/${frame}`;
      img.onload = () => {
        if (!active) return;
        loadedCount++;
        if (loadedCount === FRAMES.length) {
          const currentProgress = rawProgress.get();
          drawFrame(currentProgress);
        }
      };
      loadedImages[index] = img;
    });

    imagesRef.current = loadedImages;

    requestAnimationFrame(() => {
      if (active) {
        const currentProgress = rawProgress.get();
        drawFrame(currentProgress);
      }
    });

    return () => {
      active = false;
    };
  }, [mediaType, rawProgress]);

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
        scrub: 1.5, // Smooth catch-up delay for frame scrubbing and expansion
      },
      onUpdate: () => {
        rawProgress.set(obj.progress);
        if (mediaType === 'sequence') {
          drawFrame(obj.progress);
        }
      },
    });

    return () => {
      t.kill();
      if (t.scrollTrigger) t.scrollTrigger.kill();
    };
  }, [rawProgress, mediaType]);

  // Expansion completes at 75% of the track; the last 25% holds the fully-expanded frame.
  const p = useTransform(rawProgress, [0, 0.75], [0, 1], { clamp: true });

  // All visual values derived as MotionValues — zero React re-renders on scroll.
  // mediaW/H use px only (same unit = smooth framer-motion interpolation).
  const mediaW      = useTransform(p, [0, 1], ['300px', '1540px']);
  const mediaH      = useTransform(p, [0, 1], ['370px', '840px']);
  const bgOpacity   = useTransform(p, [0, 1], [1, 0]);
  const veilOpacity = useTransform(p, [0, 1], [0.6, 0.1]);
  const boxShadow   = useTransform(p, [0, 1], [
    '0 0 20px rgba(47,107,255,0.12)',
    '0 0 100px rgba(47,107,255,0.32)',
  ]);
  // Text slides: both values in vw (same unit = smooth interpolation).
  const xLeft       = useTransform(p, [0, 1], ['0vw', '-160vw']);
  const xRight      = useTransform(p, [0, 1], ['0vw',  '160vw']);

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
    <div ref={trackRef} className="relative bg-[#05070f]" style={{ height: '480vh' }}>

      {/* ── Pinned viewport ─────────────────────────────────── */}
      <div className="sticky top-0 h-screen overflow-hidden">

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
            maxHeight: '88vh',
            boxShadow,
            y:         exitY,
            scale:     exitScale,
            opacity:   exitOpacity,
          }}
        >
          {mediaType === 'sequence' ? (
            <canvas
              ref={canvasRef}
              className="h-full w-full object-cover block"
            />
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

          <h2 className="font-display leading-[0.92] tracking-tight" style={{ fontSize: 'clamp(2.4rem, 7.5vw, 6rem)' }}>
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
