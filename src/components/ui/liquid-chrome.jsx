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

// GLSL injected at the top of MeshStandardMaterial's vertex shader. Defines the
// liquid displacement field and a helper that pushes a point outward along its
// (spherical) normal — used both to move the vertex AND to rebuild the normal.
const VERT_HEAD = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uScroll;
uniform vec2  uMouse;
${SIMPLEX}
float liquidField(vec3 p){
  float n1 = snoise(p * uFreq + vec3(0.0, 0.0, uTime * 0.20));
  float n2 = snoise(p * uFreq * 2.0 + vec3(uTime * 0.14, 0.0, 0.0));
  return n1 * 0.7 + n2 * 0.3;
}
vec3 liquidDisplace(vec3 p){
  vec3 dir = normalize(p);
  float amp = uAmp * (1.0 + uScroll * 0.3);
  float d = liquidField(p) * amp;
  d += (uMouse.x * p.x + uMouse.y * p.y) * 0.06 * amp;
  return p + dir * d;
}
`

// Replaces <beginnormal_vertex>: rebuild the normal from the *displaced*
// surface by sampling two tangent-offset neighbours and taking their cross
// product. Without this the chrome reflections wouldn't follow the deformation.
const NORMAL_CHUNK = /* glsl */ `
  vec3 _sphN = normalize(position);
  vec3 _tA = normalize(cross(_sphN, vec3(0.0, 1.0, 0.0)));
  if (length(_tA) < 0.01) _tA = normalize(cross(_sphN, vec3(1.0, 0.0, 0.0)));
  vec3 _tB = normalize(cross(_sphN, _tA));
  float _e = 0.012;
  vec3 _pC = liquidDisplace(position);
  vec3 _pA = liquidDisplace(position + _tA * _e);
  vec3 _pB = liquidDisplace(position + _tB * _e);
  vec3 objectNormal = normalize(cross(_pA - _pC, _pB - _pC));
  if (dot(objectNormal, _sphN) < 0.0) objectNormal = -objectNormal;
  #ifdef USE_TANGENT
    vec3 objectTangent = vec3( tangent.xyz );
  #endif
`

const POSITION_CHUNK = /* glsl */ `
  vec3 transformed = liquidDisplace(position);
  #ifdef USE_ALPHAHASH
    vPosition = vec3( position );
  #endif
`

// Build a small blue "studio" scene whose emissive panels become the chrome's
// reflections — an on-brand environment with zero external HDR assets.
function buildEnvironment(renderer) {
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color('#03050c')

  const panel = (hex, intensity, pos, scale) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex) })
    mat.color.multiplyScalar(intensity) // push >1 for HDR-ish highlights
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
    mesh.position.set(...pos)
    mesh.scale.setScalar(scale)
    mesh.lookAt(0, 0, 0)
    envScene.add(mesh)
  }

  panel('#38e0ff', 2.6, [0, 5, 3], 12)   // cyan key light (top)
  panel('#2f6bff', 1.8, [-6, -1, 4], 9)  // brand-blue fill (left)
  panel('#dfeaff', 3.4, [3.5, 3.5, 5], 2.6) // tight white spec hotspot
  panel('#0a1f6b', 1.2, [4, -4, -5], 12) // deep-blue back fill

  const pmrem = new THREE.PMREMGenerator(renderer)
  const rt = pmrem.fromScene(envScene, 0, 0.1, 100)

  // The panels + pmrem helper are no longer needed once the env is baked.
  envScene.traverse((o) => {
    if (o.geometry) o.geometry.dispose()
    if (o.material) o.material.dispose()
  })
  pmrem.dispose()

  return rt // dispose rt.texture on teardown
}

/**
 * LiquidChrome — a polished, noise-displaced chrome blob. MeshStandardMaterial
 * (metalness 1, low roughness) reflecting a procedural blue environment, with
 * vertex displacement injected via onBeforeCompile and per-vertex normals
 * rebuilt so the mirror follows the melt. Vanilla three.js; honours
 * prefers-reduced-motion, pauses off-screen, and cross-fades from a poster.
 */
export default function LiquidChrome({ className = '', posterSrc }) {
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
      return // No WebGL — leave the poster/CSS fallback in place.
    }

    const getSize = () => ({
      w: mount.clientWidth || window.innerWidth,
      h: mount.clientHeight || window.innerHeight,
    })

    let { w, h } = getSize()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    mount.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, {
      width: '100%', height: '100%', display: 'block',
      position: 'absolute', inset: '0',
      opacity: '0', transition: 'opacity 0.8s ease',
    })

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.z = 4.2

    // Procedural blue environment → the chrome's reflections.
    const envRT = buildEnvironment(renderer)
    scene.environment = envRT.texture

    // High-detail icosphere so the displacement stays smooth.
    const geometry = new THREE.IcosahedronGeometry(1.25, 48)
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#bcd0ff'), // metals tint reflections — cool blue
      metalness: 1.0,
      roughness: 0.14,
      envMap: envRT.texture,
      envMapIntensity: 1.35,
      emissive: new THREE.Color('#081026'), // keeps shadow areas from pure black
      emissiveIntensity: 0.6,
    })

    // Inject the liquid displacement + normal rebuild into the PBR shader.
    let shaderRef = null
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 }
      shader.uniforms.uAmp = { value: 0.30 }
      shader.uniforms.uFreq = { value: 1.05 }
      shader.uniforms.uScroll = { value: 0 }
      shader.uniforms.uMouse = { value: new THREE.Vector2(0, 0) }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\n' + VERT_HEAD)
        .replace('#include <beginnormal_vertex>', NORMAL_CHUNK)
        .replace('#include <begin_vertex>', POSITION_CHUNK)
      shaderRef = shader
    }
    material.customProgramCacheKey = () => 'liquid-chrome'

    const blob = new THREE.Mesh(geometry, material)
    scene.add(blob)

    // A touch of direct light adds crisp moving speculars on the melt.
    const key = new THREE.DirectionalLight('#cfe7ff', 1.1)
    key.position.set(2, 3, 4)
    const rim = new THREE.DirectionalLight('#2f6bff', 0.7)
    rim.position.set(-3, -2, -2)
    scene.add(key, rim, new THREE.AmbientLight('#0a1430', 0.4))

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

    let visible = true
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0 })
    io.observe(mount)

    const clock = new THREE.Clock()
    let raf = 0
    let revealed = false
    let scrollEased = 0
    const timeScale = reduced ? 0.12 : 1.0
    const easedMouse = new THREE.Vector2(0, 0)

    const reveal = () => {
      if (revealed) return
      revealed = true
      renderer.domElement.style.opacity = '1'
      if (posterRef.current) posterRef.current.style.opacity = '0'
    }

    const renderFrame = () => {
      const t = clock.getElapsedTime() * timeScale

      easedMouse.x += (target.x - easedMouse.x) * 0.04
      easedMouse.y += (target.y - easedMouse.y) * 0.04

      const scrollTarget = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 2)))
      scrollEased += (scrollTarget - scrollEased) * 0.08

      if (shaderRef) {
        shaderRef.uniforms.uTime.value = t
        shaderRef.uniforms.uScroll.value = scrollEased
        shaderRef.uniforms.uMouse.value.set(easedMouse.x, easedMouse.y)
      }

      blob.rotation.y = t * 0.10 + easedMouse.x * 0.4
      blob.rotation.x = easedMouse.y * 0.3
      renderer.render(scene, camera)
      reveal()
    }

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
      envRT.texture.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div ref={mountRef} aria-hidden="true" role="presentation" className={className}>
      {/* Instant-paint poster — a chrome-toned radial that fades out as the live
          canvas fades in, so there's never an empty frame while shaders warm. */}
      <div
        ref={posterRef}
        aria-hidden="true"
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={
          posterSrc
            ? { backgroundImage: `url(${posterSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {
                background:
                  'radial-gradient(56% 56% at 46% 42%, rgba(120,160,255,0.32) 0%, rgba(47,107,255,0.18) 36%, rgba(5,7,15,0) 70%)',
              }
        }
      />
    </div>
  )
}
