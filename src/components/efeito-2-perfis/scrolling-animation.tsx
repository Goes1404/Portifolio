"use client"

import React, { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger);

// The orbit is authored at a fixed 600px diameter (profiles reach a 300px
// radius). Rather than juggle per-element responsive sizes, we fit the whole
// rig to the viewport with a single JS-computed scale — robust on any phone.
const ORBIT_RADIUS = 300
const ORBIT_FOOTPRINT = 680 // 600px rig + breathing room

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    const viewport = viewportRef.current
    if (!container || !viewport) return

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      pin: viewport,
      scrub: true,
      onUpdate: (self) => {
        setProgress(self.progress)
      }
    })

    return () => {
      trigger.kill()
    }
  }, [])

  // Fit the fixed-size orbit to the viewport width (never upscale past 1)
  useEffect(() => {
    const update = () => setScale(Math.min(1, window.innerWidth / ORBIT_FOOTPRINT))
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const expandRadius = progress * ORBIT_RADIUS

  return (
    <div ref={containerRef} className="min-h-[300vh] bg-[#05070f] relative">
      <div ref={viewportRef} className="relative h-screen flex items-center justify-center p-4 sm:p-8 w-full overflow-hidden">
        {/* Scale wrapper: shrinks the whole orbit on narrow viewports */}
        <div className="relative" style={{ transform: `scale(${scale})` }}>
          <div
            className={`w-[600px] h-[600px] rounded-full flex items-center justify-center transition-all duration-500 ${
              progress > 0.6 ? "border-2 border-[#2f6bff]/20" : ""
            }`}
          >
            <div
              className={`w-[500px] h-[500px] rounded-full flex items-center justify-center relative transition-all duration-500 ${
                progress > 0.2 ? "border-2 border-[#38e0ff]/25" : ""
              }`}
            >
              <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-r from-[#2f6bff] via-[#38e0ff] to-[#6f97ff] p-0.5 flex items-center justify-center relative shadow-[0_0_80px_rgba(47,107,255,0.35)]">
                <div className="w-full h-full rounded-full bg-[#05070f] flex items-center justify-center relative">
                  
                  {/* Profiles with trigonometry positions */}
                  <div
                    className="absolute w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0a0e1c] shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(0)}px, ${expandRadius * Math.sin(0)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 1"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0a0e1c] shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(Math.PI / 4)}px, ${expandRadius * Math.sin(Math.PI / 4)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 2"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0a0e1c] shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(Math.PI / 2)}px, ${expandRadius * Math.sin(Math.PI / 2)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1619365734050-cb5e64a42d43?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 3"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0a0e1c] shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((3 * Math.PI) / 4)}px, ${expandRadius * Math.sin((3 * Math.PI) / 4)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 4"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0a0e1c] shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos(Math.PI)}px, ${expandRadius * Math.sin(Math.PI)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 5"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0a0e1c] shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((5 * Math.PI) / 4)}px, ${expandRadius * Math.sin((5 * Math.PI) / 4)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 6"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0a0e1c] shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((3 * Math.PI) / 2)}px, ${expandRadius * Math.sin((3 * Math.PI) / 2)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 7"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#0a0e1c] shadow-lg transition-transform duration-300 ease-out z-0"
                    style={{
                      transform: `translate(${expandRadius * Math.cos((7 * Math.PI) / 4)}px, ${expandRadius * Math.sin((7 * Math.PI) / 4)}px)`,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0"
                      alt="Profile 8"
                      className="w-full h-full object-cover"
                    />
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center message — rendered OUTSIDE the scaled orbit so it stays fully
            legible on mobile (the rig shrinks to fit, the copy must not). A soft
            radial halo keeps it readable over whichever profiles sit behind. */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8">
          <div
            className={`relative flex flex-col items-center text-center transition-all duration-700 ease-out ${
              progress > 0.5 ? "opacity-100 translate-y-0" : "translate-y-3 opacity-0"
            }`}
          >
            {/* Dark halo so the copy reads against the orbiting thumbnails */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -z-10 h-[150%] w-[180%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(5,7,15,0.92) 40%, rgba(5,7,15,0.55) 65%, transparent 100%)",
              }}
            />
            <h2
              className="font-display leading-[0.92] text-[#e9edf7]"
              style={{ fontSize: "clamp(1.9rem, 8vw, 3rem)" }}
            >
              Full <span className="text-[#38e0ff]">Stack</span>
            </h2>
            <p className="mt-3 max-w-[15rem] font-editorial text-base italic leading-snug text-white/60 sm:max-w-xs sm:text-lg">
              Do front ao back, da UI ao deploy — um ecossistema de ferramentas
              trabalhando junto.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
