import { useRef, useEffect, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import DarkSnow from './dark-snow';

gsap.registerPlugin(ScrollTrigger);

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image' | 'sequence';
  mediaSrc?: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const FRAMES = Array.from({ length: 144 }, (_, i) => `frame_${String(i + 1).padStart(3, '0')}.png`);


export default function ScrollExpandMedia({
  mediaType = 'image',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
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
  // Content below fades in after expansion
  const contentAlpha = useTransform(rawProgress, [0.73, 0.86], [0, 1], { clamp: true });

  const words  = title?.split(' ') ?? [];
  const firstW = words[0] ?? '';
  const restW  = words.slice(1).join(' ');

  return (
    // No overflow-x here — that breaks position:sticky in Chromium.
    // The sticky inner div has overflow:hidden which handles clipping.
    <div ref={trackRef} className="relative bg-[#05070f]" style={{ height: '480vh' }}>

      {/* ── Pinned viewport ─────────────────────────────────── */}
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* WebGL realistic dark snow background fades out as media expands */}
        <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 z-0">
          <DarkSnow progress={rawProgress} className="h-full w-full" />
          <div className="absolute inset-0 bg-[#05070f]/35" />
        </motion.div>

        {/* Expanding media card */}
        <motion.div
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl"
          style={{
            width:     mediaW,
            height:    mediaH,
            maxWidth:  '96vw',
            maxHeight: '88vh',
            boxShadow,
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

        {/* ── Text layers ── all slide apart to make room for the expanding media */}
        <div
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 pointer-events-none ${
            textBlend ? 'mix-blend-difference' : ''
          }`}
        >
          {date && (
            <motion.p
              style={{ x: xLeft }}
              className="font-code text-xs uppercase tracking-[0.38em] text-white/55"
            >
              {date}
            </motion.p>
          )}

          {firstW && (
            <motion.h2
              style={{ x: xLeft }}
              className="font-display text-[9vw] leading-[0.88] text-[#e9edf7] sm:text-6xl lg:text-7xl"
            >
              {firstW}
            </motion.h2>
          )}
          {restW && (
            <motion.h2
              style={{ x: xRight }}
              className="font-display text-[9vw] leading-[0.88] text-brand sm:text-6xl lg:text-7xl"
            >
              {restW}
            </motion.h2>
          )}

          {scrollToExpand && (
            <motion.p
              style={{ x: xRight }}
              className="font-code text-[10px] uppercase tracking-[0.3em] text-[#6f97ff]"
            >
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
