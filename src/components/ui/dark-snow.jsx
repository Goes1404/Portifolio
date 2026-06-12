import { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
  
  // Clean white snow color with slight ambient reflection
  gl_FragColor = vec4(vec3(0.96, 0.98, 1.0), intensity * vAlpha * 0.85);
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      width: '100%',
      height: '100%',
      display: 'block',
    });

    const scene = new THREE.Scene();
    
    // Perspective camera for natural 3D depth attenuation
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 50);
    camera.position.z = 6.0;

    // Set up particle attributes for 5,000 flakes
    const flakeCount = 5000;
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
      blending: THREE.NormalBlending,
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
      uniforms.uTime.value = time;
      
      // Update scroll progress
      if (progress) {
        uniforms.uScroll.value = progress.get();
      }
      
      // Smoothly ease mouse world coordinates
      if (mouseTargetRef.current.x > 900) {
        // If mouse is inactive, ease it far away
        mouseRef.current.lerp(mouseTargetRef.current, 0.05);
      } else {
        // Active tracking with slight easing
        mouseRef.current.lerp(mouseTargetRef.current, 0.12);
      }
      uniforms.uMouse.value.copy(mouseRef.current);
      
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
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      uniformsRef.current = null;
    };
  }, [progress]);

  return <div ref={containerRef} aria-hidden className={className} />;
}
