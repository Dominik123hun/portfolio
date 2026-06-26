/**
 * <Background /> — a subtle animated aurora/nebula behind the whole scene.
 *
 * A single fullscreen shader (drei ScreenQuad) rendered first, behind every 3D
 * object: drifting fbm clouds tinted with the accent + indigo, a soft glow that
 * anchors the hero, and a gentle hue shift across the scroll journey (cool blue
 * at the intro → warmer accent toward the CTA).
 *
 * Kept deliberately low-intensity so it never competes with the laptop, stays
 * below the bloom threshold, freezes for reduced-motion, and uses fewer noise
 * octaves on mobile.
 */

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import { theme } from '../theme'
import { readScroll } from '../lib/scrollStore'
import { damp } from '../lib/math'
import type { Tier } from '../lib/tier'

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform float uAspect;
  uniform vec3 uBase;
  uniform vec3 uAccent;
  uniform vec3 uIndigo;
  uniform vec3 uWarm;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < OCTAVES; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv - 0.5;
    p.x *= uAspect;

    // Drifting nebula with a cheap domain warp.
    float drift = uTime * 0.015;
    vec2 q = uv * vec2(1.7, 1.0) * 2.2;
    q += 0.25 * vec2(noise(q + drift), noise(q.yx - drift * 0.8));
    float n = fbm(q + vec2(drift, drift * 0.5));
    n = smoothstep(0.2, 0.95, n);

    vec3 neb = mix(uIndigo, uAccent, n);
    // Hue shift across the journey, warming toward the outro.
    vec3 tint = mix(uAccent, uWarm, smoothstep(0.82, 1.0, uScroll));
    neb = mix(neb, tint, 0.35);
    // Subtle — the void should stay near-black with only a hint of colour.
    float nebAmt = n * (0.05 + 0.015 * sin(uTime * 0.2));

    // Soft hero glow, centred, a touch stronger at the very start and the outro.
    float d = length(p * vec2(1.0, 1.25));
    float glow = smoothstep(0.85, 0.0, d);
    float glowAmt = glow * (0.035
      + 0.085 * smoothstep(0.85, 1.0, uScroll)
      + 0.025 * (1.0 - smoothstep(0.0, 0.14, uScroll)));

    vec3 col = uBase;
    col += neb * nebAmt;
    col += tint * glowAmt;

    // Deep vignette so the edges fall to black and the centre stays restrained.
    col *= 1.0 - 0.55 * smoothstep(0.3, 1.05, length((uv - 0.5) * vec2(uAspect, 1.0)));

    gl_FragColor = vec4(col, 1.0);
  }
`

interface BackgroundProps {
  tier: Tier
}

export function Background({ tier }: BackgroundProps) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      defines: { OCTAVES: tier.isMobile ? 3 : 5 },
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uAspect: { value: 1 },
        uBase: { value: new THREE.Color(theme.background) },
        uAccent: { value: new THREE.Color(theme.accent) },
        uIndigo: { value: new THREE.Color('#161a40') },
        uWarm: { value: new THREE.Color('#6aa0ff') },
      },
      depthTest: false,
      depthWrite: false,
    })
  }, [tier.isMobile])

  useFrame((state, dt) => {
    const u = material.uniforms
    if (!tier.reducedMotion) u.uTime.value += Math.min(dt, 0.05)
    u.uScroll.value = damp(u.uScroll.value, readScroll(), 6, dt)
    u.uAspect.value = state.size.width / Math.max(1, state.size.height)
  })

  return <ScreenQuad renderOrder={-100} frustumCulled={false} material={material} />
}
