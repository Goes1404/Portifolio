import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 3D simplex noise function for organic lightning/crackle and wave displacement
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
uniform float uVelocity;
uniform vec2 uResolution;
varying vec2 vUv;
${SIMPLEX}

#define NUM_CABLES 10

void main() {
  vec2 uv = vUv;
  // Map coordinates to center-based and aspect ratio corrected
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  
  vec3 finalColor = vec3(0.0);
  
  // Base deep dark green/blue background glow (cyberpunk look)
  vec3 bgGlow = vec3(0.003, 0.015, 0.008) * (1.0 - length(p) * 0.7);
  finalColor += bgGlow;
  
  // Render layered cables
  for (int i = 0; i < NUM_CABLES; i++) {
    float fi = float(i);
    float depth = fi / float(NUM_CABLES);
    
    // Parallax scrolling: foreground cables (high depth) move faster
    vec2 pCable = p;
    pCable.x += (depth - 0.5) * uScroll * 0.65;
    pCable.y += (depth - 0.5) * uScroll * 0.18;
    
    // Unique frequency, amplitude, speed and phase offset per cable based on depth
    float freq = 1.3 + sin(depth * 5.0) * 0.5;
    float amp = 0.16 + cos(depth * 3.14) * 0.07;
    float speed = 0.12 + depth * 0.18;
    float offset = depth * 17.54;
    float verticalPos = (depth - 0.5) * 1.35; // vertical offset spread
    
    // Base cable wave path (sine wave + low-frequency noise drift)
    float wave = sin(pCable.x * freq + uTime * speed + offset) * amp + verticalPos;
    wave += snoise(vec3(pCable.x * 0.5, uTime * 0.03, depth * 10.0)) * 0.07;
    
    // Distance from current pixel to cable path
    float d = abs(pCable.y - wave);
    
    // Thickness scale based on depth (closer cables are thicker/foreground)
    float thickness = 0.008 + (1.0 - depth) * 0.024;
    
    // Cable body alpha
    float bodyAlpha = smoothstep(thickness, thickness - 0.002, d);
    
    // Calculate normal on the cylinder for 3D lighting/reflection look
    float dy = pCable.y - wave;
    float normY = clamp(dy / (thickness + 0.0001), -1.0, 1.0);
    float normZ = sqrt(1.0 - normY * normY);
    
    // Base cable color (ribbed plastic/rubber sheath)
    vec3 sheathColor = mix(vec3(0.01, 0.08, 0.02), vec3(0.04, 0.22, 0.06), normZ);
    // Add ribbed segment texture along the cable
    float ribs = step(0.4, sin(pCable.x * 130.0 + dy * 25.0));
    sheathColor = mix(sheathColor, sheathColor * 0.22, ribs * 0.45);
    
    // Electric pulse/shock traveling down the cable (speed increases on scroll)
    float pulseSpeed = 2.4 + uVelocity * 5.5;
    float pulsePos = uTime * pulseSpeed - offset;
    float pulse = smoothstep(0.14, 0.0, abs(fract(pCable.x * 0.20 - pulsePos) - 0.5));
    
    // Electrical crackle/spark (high-frequency simplex noise)
    // Becomes more intense and jagged when the user scrolls!
    float crackleSpeed = 22.0 + uVelocity * 35.0;
    float crackleFreq = 38.0 + depth * 15.0;
    float crackleAmp = 0.012 + uVelocity * 0.028;
    float crackle = snoise(vec3(pCable.x * crackleFreq, uTime * crackleSpeed, depth * 8.4)) * crackleAmp;
    
    // Electric spark coordinates (active and jagged ONLY where the pulse is)
    float sparkD = abs(pCable.y - (wave + crackle * pulse));
    
    // Glowing electric shock color (gradient from vivid green to bright electric white)
    vec3 sparkColor = mix(vec3(0.05, 0.95, 0.25), vec3(0.7, 1.0, 0.85), pulse);
    float sparkGlow = exp(-sparkD * 240.0) * pulse * (1.6 + uVelocity * 2.8);
    
    // Constant core glow inside the fiber-optic/electric cable
    float coreGlow = exp(-d * 95.0) * 0.35;
    
    // Assemble cable color
    vec3 cableColor = mix(vec3(0.0), sheathColor, bodyAlpha);
    
    // Specular shine highlights
    float spec = pow(max(0.0, normZ * 0.82 + normY * 0.18), 14.0) * 0.28;
    cableColor += vec3(0.65, 0.95, 0.75) * spec * bodyAlpha;
    
    // Electric shock glow and constant fiber glow
    vec3 electricEffect = sparkColor * sparkGlow + vec3(0.02, 0.75, 0.18) * coreGlow;
    
    // Compositing layer based on cable alpha and electric glow
    float layerAlpha = bodyAlpha + sparkGlow * 0.55 + coreGlow * 0.22;
    layerAlpha = clamp(layerAlpha, 0.0, 1.0);
    
    finalColor = mix(finalColor, cableColor + electricEffect, layerAlpha);
  }
  
  // Ambient electric sparks/particles floating around
  float particles = 0.0;
  for(int j = 0; j < 3; j++) {
    float fj = float(j);
    vec3 pPos = vec3(p.x * 2.2, p.y * 2.2 - uTime * 0.12, uTime * 0.45 + fj * 9.2);
    float pNoise = snoise(pPos);
    float size = 0.988 - uVelocity * 0.007; // more particles appear on scroll
    if (pNoise > size) {
      float intensity = smoothstep(size, size + 0.003, pNoise);
      particles += intensity * (0.4 + uVelocity * 1.0);
    }
  }
  finalColor += vec3(0.25, 0.98, 0.55) * particles;
  
  // Vignette for seamless dark contrast
  float vignette = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y);
  vignette = clamp(pow(vignette * 16.0, 0.35), 0.0, 1.0);
  finalColor *= vignette;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function GreenCableMesh({ progress, className = '' }) {
  const containerRef = useRef(null);
  const uniformsRef = useRef(null);
  const lastScrollRef = useRef(0);
  const velocityRef = useRef(0);

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
      return; // WebGL not supported, degrades to dark background
    }

    const getDimensions = () => ({
      w: container.clientWidth || window.innerWidth,
      h: container.clientHeight || window.innerHeight,
    });

    let { w, h } = getDimensions();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      width: '100%',
      height: '100%',
      display: 'block',
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: progress ? progress.get() : 0 },
      uVelocity: { value: 0 },
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

    // Intersection observer to pause rendering when section is out of viewport
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
      
      // Calculate real-time scrolling speed (velocity)
      const currentScroll = progress ? progress.get() : 0;
      const diff = Math.abs(currentScroll - lastScrollRef.current);
      
      // Low-pass filter to smooth velocity transitions
      velocityRef.current += (diff - velocityRef.current) * 0.08;
      lastScrollRef.current = currentScroll;
      
      uniforms.uScroll.value = currentScroll;
      // Map velocity to a standard range for the shader (0.0 to 1.5)
      uniforms.uVelocity.value = Math.min(velocityRef.current * 16.0, 1.5);
      
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
