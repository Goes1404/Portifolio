import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ── Atmospheric backdrop ──────────────────────────────────────────────────────
// A full-screen shader quad rendered BEHIND the snow. It paints the cold,
// cinematic mood of the hero video — a deep navy night with a blue→cyan glow
// rising from the centre (echoing the ice sculpture) and soft volumetric fog,
// closed off by a vignette. This is what replaces the flat grey background.
const BG_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const BG_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uScroll;
uniform vec2  uResolution;
varying vec2 vUv;

// Cheap value-noise + fbm for drifting fog
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  // 3 octaves is plenty for the subtle drifting haze and keeps the per-pixel
  // cost low — full-screen fbm runs every frame, so octaves are the hot path.
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  // Aspect-correct centred coords
  vec2 p = uv - 0.5;
  p.x *= uResolution.x / max(uResolution.y, 1.0);

  // Brand palette
  vec3 base = vec3(0.010, 0.014, 0.032);   // deep navy ~ #050712
  vec3 blue = vec3(0.184, 0.420, 1.000);   // #2f6bff
  vec3 cyan = vec3(0.220, 0.878, 1.000);   // #38e0ff

  // Glow rising slightly above centre — the icy sculpture light
  vec2  glowPos = vec2(0.0, 0.06);
  float d       = length(p - glowPos);
  float glow    = smoothstep(0.95, 0.0, d);
  // Cooler core, warmer-blue halo
  vec3  glowCol = mix(blue, cyan, smoothstep(0.0, 0.45, glow));

  // Drifting fog — denser low on the frame, like ground mist
  float fog = fbm(uv * 3.2 + vec2(uTime * 0.018, uTime * 0.012));
  fog *= smoothstep(0.95, 0.15, uv.y);

  // Compose. Glow lifts a touch as the user scrolls in.
  vec3 col = base;
  col += glowCol * glow * (0.20 + uScroll * 0.14);
  col += fog * vec3(0.06, 0.11, 0.26) * 0.6;

  // Faint snow-haze brightening near the horizon line
  float horizon = smoothstep(0.18, 0.0, abs(uv.y - 0.30));
  col += horizon * blue * 0.04;

  // Vignette to keep focus on the centre card
  float vig = smoothstep(1.25, 0.25, length(p));
  col *= mix(0.45, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec2 uMouse;
varying float vAlpha;

attribute float aSpeed;
attribute float aSize;
attribute float aPhase;

void main() {
  vec3 pos = position;

  // Falling animation, speed is randomized per flake, affected by scroll
  float fallSpeed = aSpeed * (0.28 + uScroll * 1.8);
  float fall = uTime * fallSpeed;

  // Wrap Y coordinate between -4.5 and 4.5
  pos.y = mod(pos.y - fall + 4.5, 9.0) - 4.5;

  // Wind sway: organic horizontal drift based on sine waves and unique phase
  float sway = sin(uTime * 0.65 + aPhase) * 0.22;
  pos.x += sway;

  // Mouse push/avoidance effect (magnetic repulsion)
  float dist = distance(pos.xy, uMouse);
  float radius = 1.1; // radius of influence in world coords
  if (dist < radius) {
    float force = (1.0 - dist / radius) * 0.42;
    vec2 push = normalize(pos.xy - uMouse) * force;
    pos.xy += push;
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Size attenuation: closer flakes look larger (simulating depth of field)
  gl_PointSize = aSize * (300.0 / -mvPosition.z);

  // Fade out flakes near wrap boundaries and deep background to look natural
  float boundaryFade = smoothstep(-4.5, -4.0, pos.y) * smoothstep(4.5, 4.0, pos.y);
  vAlpha = boundaryFade * (1.0 - abs(pos.z) / 3.0);
}
`;

const FRAG = /* glsl */ `
varying float vAlpha;

void main() {
  // Distance from center of point sprite
  float r = distance(gl_PointCoord, vec2(0.5));
  if (r > 0.5) discard;

  // Soft radial falloff for realistic fluffy flakes rather than hard squares
  float intensity = smoothstep(0.5, 0.1, r);

  // Clean white snow color with slight icy-blue ambient reflection
  gl_FragColor = vec4(vec3(0.92, 0.96, 1.0), intensity * vAlpha * 0.85);
}
`;

export default function DarkSnow({ progress, className = '' }) {
  const containerRef = useRef(null);
  const uniformsRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2(999, 999));
  const mouseTargetRef = useRef(new THREE.Vector2(999, 999));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return; // WebGL not supported, degrades gracefully
    }

    const getDimensions = () => ({
      w: container.clientWidth || window.innerWidth,
      h: container.clientHeight || window.innerHeight,
    });

    let { w, h } = getDimensions();
    // Cap at 1.5 — the full-screen atmospheric shader is fill-rate bound, so a
    // lower device-pixel-ratio is the single biggest perf win on Hi-DPI screens.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    renderer.autoClear = false; // we drive backdrop + snow passes manually

    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      width: '100%',
      height: '100%',
      display: 'block',
    });

    // ── Backdrop pass: full-screen quad with the atmospheric shader ──────────
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bgUniforms = {
      uTime: { value: 0 },
      uScroll: { value: progress ? progress.get() : 0 },
      uResolution: { value: new THREE.Vector2(w, h) },
    };
    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: bgUniforms,
      vertexShader: BG_VERT,
      fragmentShader: BG_FRAG,
      depthTest: false,
      depthWrite: false,
    });
    const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial);
    bgScene.add(bgMesh);

    // ── Snow pass: 5,000 particles in perspective for natural depth ──────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50);
    camera.position.z = 6.0;

    const flakeCount = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(flakeCount * 3);
    const speeds = new Float32Array(flakeCount);
    const sizes = new Float32Array(flakeCount);
    const phases = new Float32Array(flakeCount);

    for (let i = 0; i < flakeCount; i++) {
      // Randomly scatter flakes in a 3D box
      positions[i * 3]     = (Math.random() - 0.5) * 12.0; // X: -6.0 to 6.0
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9.0;  // Y: -4.5 to 4.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;  // Z: -2.0 to 2.0 (depth)

      speeds[i] = 0.45 + Math.random() * 0.75;
      sizes[i]  = 5.0  + Math.random() * 15.0; // point size
      phases[i] = Math.random() * Math.PI * 2.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: progress ? progress.get() : 0 },
      uMouse: { value: new THREE.Vector2(999, 999) },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending, // flakes glow against the dark sky
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Track mouse & project it to z = 0 in world coords
    const onPointerMove = (e) => {
      const mouseNDCx = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseNDCy = -((e.clientY / window.innerHeight) * 2 - 1);

      const vector = new THREE.Vector3(mouseNDCx, mouseNDCy, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const projected = camera.position.clone().add(dir.multiplyScalar(distance));

      mouseTargetRef.current.set(projected.x, projected.y);
    };

    const onPointerLeave = () => {
      // Move mouse away so snow goes back to normal when cursor leaves window
      mouseTargetRef.current.set(999, 999);
    };

    if (!reduced) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('mouseleave', onPointerLeave, { passive: true });
    }

    const onResize = () => {
      const { w: newW, h: newH } = getDimensions();
      renderer.setSize(newW, newH, false);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      bgUniforms.uResolution.value.set(newW, newH);
    };
    window.addEventListener('resize', onResize);

    //intersection observer to pause rendering when out of viewport
    let visible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    const clock = new THREE.Clock();
    let rafId = 0;

    const render = () => {
      const time = clock.getElapsedTime();
      const scroll = progress ? progress.get() : 0;
      uniforms.uTime.value = time;
      bgUniforms.uTime.value = time;
      bgUniforms.uScroll.value = scroll;
      uniforms.uScroll.value = scroll;

      // Smoothly ease mouse world coordinates
      if (mouseTargetRef.current.x > 900) {
        // If mouse is inactive, ease it far away
        mouseRef.current.lerp(mouseTargetRef.current, 0.05);
      } else {
        // Active tracking with slight easing
        mouseRef.current.lerp(mouseTargetRef.current, 0.12);
      }
      uniforms.uMouse.value.copy(mouseRef.current);

      // Backdrop first (clears the frame), then snow on top of it
      renderer.clear();
      renderer.render(bgScene, bgCamera);
      renderer.clearDepth();
      renderer.render(scene, camera);
    };

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      if (visible) render();
    };

    if (reduced) {
      render();
    } else {
      loop();
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
      geometry.dispose();
      material.dispose();
      bgMesh.geometry.dispose();
      bgMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      uniformsRef.current = null;
    };
  }, [progress]);

  return <div ref={containerRef} aria-hidden className={className} />;
}
