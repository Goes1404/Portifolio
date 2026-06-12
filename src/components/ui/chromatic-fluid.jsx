import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 3D simplex noise function
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
`;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec2 uResolution;
varying vec2 vUv;
${SIMPLEX}

float getHeight(vec2 uv) {
  // Map coordinates to center-based and aspect ratio corrected
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  
  // Layer noise to create organic liquid contours
  vec3 p1 = vec3(p * 1.3, uTime * 0.08 + uScroll * 1.4);
  vec3 p2 = vec3(p * 2.8, uTime * 0.14 - uScroll * 0.9);
  
  float n1 = snoise(p1);
  float n2 = snoise(p2) * 0.45;
  
  return (n1 + n2) * 0.18;
}

void main() {
  vec2 uv = vUv;
  
  // Finite difference to calculate screen space normals
  float eps = 0.003;
  float hL = getHeight(uv - vec2(eps, 0.0));
  float hR = getHeight(uv + vec2(eps, 0.0));
  float hD = getHeight(uv - vec2(0.0, eps));
  float hU = getHeight(uv + vec2(0.0, eps));
  
  // Compute surface normals
  vec3 normal = normalize(vec3(hL - hR, hD - hU, eps * 2.5));
  
  // Orthographic view vector
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  
  // Reflection ray
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), normal);
  
  // Lighting calculations
  vec3 lightDir = normalize(vec3(0.6, 0.6, 1.6));
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 48.0);
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);
  
  // Deep obsidian mercury background
  vec3 obsidian = vec3(0.03, 0.035, 0.05);
  
  // Specular light bands (creates studio softbox chrome reflections)
  float band = sin(r.x * 5.0 + r.y * 5.0 + uTime * 0.08) * 0.5 + 0.5;
  vec3 reflectionColor = mix(vec3(0.72, 0.75, 0.82), vec3(0.08, 0.1, 0.14), band);
  
  // Add blue/purple sky dome reflection gradient
  reflectionColor += mix(vec3(0.01, 0.02, 0.08), vec3(0.15, 0.18, 0.28), r.y * 0.5 + 0.5);
  
  // Blending the obsidian base with the chrome reflection based on fresnel and normal slopes
  float reflectionFactor = smoothstep(0.0, 0.85, fresnel + normal.x * 0.05);
  vec3 finalColor = mix(obsidian, reflectionColor, 0.15 + reflectionFactor * 0.85);
  
  // Add specular shine (the highlight peaks)
  finalColor += vec3(1.0) * spec * 0.8;
  
  // Subtle dark vignette to blend edges
  float vignette = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y);
  vignette = clamp(pow(vignette * 16.0, 0.3), 0.0, 1.0);
  finalColor *= vignette;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function ChromaticFluid({ progress, className = '' }) {
  const containerRef = useRef(null);
  const uniformsRef = useRef(null);

  // Direct subscription to the Framer Motion value to bypass React re-renders completely
  useEffect(() => {
    if (!progress) return;
    const unsubscribe = progress.on('change', (val) => {
      if (uniformsRef.current) {
        uniformsRef.current.uScroll.value = val;
      }
    });
    return () => unsubscribe();
  }, [progress]);

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
      return; // WebGL not supported
    }

    const getDimensions = () => ({
      w: container.clientWidth || window.innerWidth,
      h: container.clientHeight || window.innerHeight,
    });

    let { w, h } = getDimensions();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    mountCanvas();

    function mountCanvas() {
      container.appendChild(renderer.domElement);
      Object.assign(renderer.domElement.style, {
        width: '100%',
        height: '100%',
        display: 'block',
      });
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: progress ? progress.get() : 0 },
      uResolution: { value: new THREE.Vector2(w, h) },
    };
    uniformsRef.current = uniforms;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthWrite: false,
      depthTest: false,
    });
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    const onResize = () => {
      const { w: newW, h: newH } = getDimensions();
      renderer.setSize(newW, newH, false);
      uniforms.uResolution.value.set(newW, newH);
    };
    window.addEventListener('resize', onResize);

    // Only render when the section is visible
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
      uniforms.uTime.value = time;
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
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      uniformsRef.current = null;
    };
  }, [progress]);

  return <div ref={containerRef} aria-hidden className={className} />;
}
