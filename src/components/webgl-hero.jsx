import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ──────────────────────────────────────────────────────────────────────────
// Ashima 3D simplex noise (public domain) — drives the organic displacement.
// ──────────────────────────────────────────────────────────────────────────
const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

const VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uScroll;   // 0→1 mapped from page scroll through the hero
uniform vec2  uMouse;
varying float vDisp;
varying vec3  vNormal;
varying vec3  vView;
${SIMPLEX}
void main() {
  vec3 pos = position;
  float n1 = snoise(pos * uFreq + vec3(0.0, 0.0, uTime * 0.22));
  float n2 = snoise(pos * (uFreq * 2.1) + vec3(uTime * 0.16, 0.0, 0.0));
  // Scroll deepens the displacement a touch — the surface reacts to the page.
  float disp = (n1 * 0.7 + n2 * 0.3) * uAmp * (1.0 + uScroll * 0.35);
  disp += (uMouse.x * pos.x + uMouse.y * pos.y) * 0.12 * uAmp;
  vDisp = disp;
  // …and the whole blob breathes ~5% larger as you scroll through the hero,
  // so the 3D element reads as part of the scroll. Scale via the shader (GPU),
  // never a layout property.
  vec3 newPos = pos * (1.0 + uScroll * 0.05) + normal * disp;
  vec4 mv = modelViewMatrix * vec4(newPos, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
varying float vDisp;
varying vec3  vNormal;
varying vec3  vView;
void main() {
  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.3);
  vec3 base = mix(uColorA, uColorB, smoothstep(-0.25, 0.4, vDisp));
  vec3 col = mix(base, uColorC, fres);
  col += uColorC * fres * 0.45;          // rim glow

  // Algorithmic dithering: a sub-quantum (±0.5/255) hash noise applied just
  // before output. Breaks smooth gradients into a fine, studio-grade grain so
  // common 8-bit panels never show stepped "color banding".
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dither - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`

/**
 * Interactive WebGL hero centerpiece: an iridescent, noise-displaced blob that
 * breathes, follows the pointer and drifts with scroll. Vanilla three.js so it
 * is independent of any React-three version coupling. Degrades to nothing
 * (the CSS hero stays) if WebGL is unavailable or reduced-motion is requested.
 */
export default function WebGLHero({ className = '', posterSrc }) {
  const mountRef = useRef(null)
  const posterRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return // No WebGL — leave the CSS hero as-is.
    }

    const getSize = () => ({
      w: mount.clientWidth || window.innerWidth,
      h: mount.clientHeight || window.innerHeight,
    })

    let { w, h } = getSize()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)
    // Canvas sits ON TOP of the poster and starts invisible — it cross-fades in
    // only after the first real frame is drawn (shaders compiled, GPU warm).
    Object.assign(renderer.domElement.style, {
      width: '100%', height: '100%', display: 'block',
      position: 'absolute', inset: '0',
      opacity: '0', transition: 'opacity 0.8s ease',
    })

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.z = 4.3

    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: 0.42 },
      uFreq: { value: 0.9 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color('#0b1a4d') },
      uColorB: { value: new THREE.Color('#2f6bff') },
      uColorC: { value: new THREE.Color('#38e0ff') },
    }

    const geometry = new THREE.IcosahedronGeometry(1.35, 18)
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG })
    const blob = new THREE.Mesh(geometry, material)
    scene.add(blob)

    // Pointer (normalised -1..1), eased for a soft follow.
    const target = new THREE.Vector2(0, 0)
    const onPointerMove = (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    if (!reduced) window.addEventListener('pointermove', onPointerMove, { passive: true })

    const onResize = () => {
      ({ w, h } = getSize())
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // Pause rendering while the hero is scrolled out of view.
    let visible = true
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0 })
    io.observe(mount)

    const clock = new THREE.Clock()
    let raf = 0
    let revealed = false
    let scrollEased = 0 // eased 0→1 scroll value handed to the uScroll uniform

    // Reduced-motion: don't freeze the blob — slow time to ~12% (equivalent to
    // u_time * 0.12 in the shader) for a calm, almost-zen drift. Pointer input
    // is already disabled above, so nothing reacts abruptly.
    const timeScale = reduced ? 0.12 : 1.0

    // First successful frame → cross-fade: live canvas in, static poster out.
    const reveal = () => {
      if (revealed) return
      revealed = true
      renderer.domElement.style.opacity = '1'
      if (posterRef.current) posterRef.current.style.opacity = '0'
    }

    const renderFrame = () => {
      const t = clock.getElapsedTime() * timeScale
      uniforms.uTime.value = t

      // Scroll → uniform. window.scrollY is a cheap, cached read (no layout/
      // reflow). Normalised over the hero's pinned travel (~2 viewport heights),
      // then eased so the blob responds smoothly rather than 1:1 with the wheel.
      const scrollTarget = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 2)))
      scrollEased += (scrollTarget - scrollEased) * 0.08
      uniforms.uScroll.value = scrollEased

      uniforms.uMouse.value.x += (target.x - uniforms.uMouse.value.x) * 0.04
      uniforms.uMouse.value.y += (target.y - uniforms.uMouse.value.y) * 0.04
      blob.rotation.y = t * 0.12 + uniforms.uMouse.value.x * 0.4
      blob.rotation.x = uniforms.uMouse.value.y * 0.3 + window.scrollY * 0.0006
      renderer.render(scene, camera)
      reveal()
    }

    // Render ONLY while the hero is on-screen (IntersectionObserver) AND the tab
    // is visible — never spin the GPU on an invisible canvas. We keep looping
    // even under reduced-motion (just slowed), so the poster still hands off.
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (visible && !document.hidden) renderFrame()
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  // Purely decorative 3D backdrop — hidden from the accessibility tree.
  return (
    <div ref={mountRef} aria-hidden="true" role="presentation" className={className}>
      {/* Instant-paint placeholder behind the canvas. Keeps LCP fast while the
          WebGL context compiles shaders off the critical path, then fades out as
          the first real frame fades in. Pass `posterSrc` (an exported .webp of a
          nice blob frame) for a literal still; otherwise this lightweight CSS
          approximation of the blob's palette is used — zero network cost. */}
      <div
        ref={posterRef}
        aria-hidden="true"
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={
          posterSrc
            ? { backgroundImage: `url(${posterSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {
                background:
                  'radial-gradient(58% 58% at 42% 44%, rgba(47,107,255,0.30) 0%, rgba(11,26,77,0.20) 38%, rgba(5,7,15,0) 70%)',
              }
        }
      />
    </div>
  )
}
