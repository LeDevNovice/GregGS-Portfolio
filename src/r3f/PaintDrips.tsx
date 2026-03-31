import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const N_DRIPS = 10;

const PAINT_COLOR = new THREE.Vector3(0x79 / 255, 0x22 / 255, 0x62 / 255);

const GLOBAL_FADE_SPEED = 1.2;

type DripPhase = 'waiting' | 'flowing' | 'fading' | 'done';

interface DripState {
  x: number;
  tipY: number;
  width: number;
  speed: number;
  dripAlpha: number;
  initialAlpha: number;
  currentAlpha: number;
  phase: DripPhase;
  delay: number;
  elapsed: number;
  fadeDuration: number;
}

function createDrip(index: number): DripState {
  const baseX = 0.05 + (index / N_DRIPS) * 0.90;
  const jitter = (Math.random() - 0.5) * 0.07;

  return {
    x: THREE.MathUtils.clamp(baseX + jitter, 0.04, 0.96),
    tipY: 1.0 + Math.random() * 0.05,
    width: 0.014 + Math.random() * 0.016,
    speed: 0.022 + Math.random() * 0.045,
    dripAlpha: 0.50 + Math.random() * 0.50,
    initialAlpha: 0,
    currentAlpha: 0,
    phase: 'waiting',
    delay: Math.random() * 5.5,
    elapsed: 0,
    fadeDuration: 0.7 + Math.random() * 0.6,
  };
}

function resetDrip(drip: DripState): DripState {
  return {
    ...drip,
    x: 0.04 + Math.random() * 0.92,
    tipY: 1.0 + Math.random() * 0.08,
    width: 0.014 + Math.random() * 0.016,
    speed: 0.022 + Math.random() * 0.045,
    dripAlpha: 0.50 + Math.random() * 0.50,
    initialAlpha: 0,
    currentAlpha: 0,
    phase: 'waiting',
    delay: 1.5 + Math.random() * 4.0,
    elapsed: 0,
    fadeDuration: 0.7 + Math.random() * 0.6,
  };
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  #define N_DRIPS 10

  uniform float u_aspect;

  uniform float u_time;

  uniform float u_global_alpha;

  uniform vec3  u_color;

  uniform vec4  u_drips[N_DRIPS];

  varying vec2 vUv;

  void main() {
    vec2  uv         = vUv;
    float totalAlpha = 0.0;
    vec3  finalColor = u_color;

    for (int i = 0; i < N_DRIPS; i++) {
      float cx   = u_drips[i].x; 
      float tipY = u_drips[i].y;
      float w    = u_drips[i].z;
      float da   = u_drips[i].w;

      if (da <= 0.0) continue;

      float edgeA = sin(uv.y * 22.0 + float(i) * 6.1 + u_time * 0.30) * 0.0020;
      float edgeB = sin(uv.y *  8.5 - float(i) * 3.7 - u_time * 0.18) * 0.0030;
      float halfW = w * 0.5 + edgeA + edgeB;

      float dx_h = abs(uv.x - cx) * u_aspect;

      float contrib = 0.0;

      if (uv.y > tipY) {
        float body = smoothstep(halfW + 0.003, halfW - 0.003, dx_h);
        contrib = max(contrib, body);
      }

      float tipR = w * 0.72;
      float dTip = length(vec2(dx_h, uv.y - tipY));
      float tip  = smoothstep(tipR + 0.005, tipR - 0.005, dTip);
      contrib = max(contrib, tip);

      if (contrib > 0.0) {
        float normalizedDx = clamp(dx_h / (halfW + 0.001), 0.0, 1.0);
        float highlight    = pow(1.0 - normalizedDx, 2.0) * 0.12 * contrib;
        finalColor         = max(finalColor, u_color + vec3(highlight));
      }

      totalAlpha = max(totalAlpha, contrib * da);
    }

    if (totalAlpha * u_global_alpha < 0.005) discard;

    gl_FragColor = vec4(finalColor, totalAlpha * u_global_alpha);
  }
`;

export interface PaintDripsProps {
  isActive: boolean;
}

export const PaintDrips: React.FC<PaintDripsProps> = ({ isActive }) => {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const dripsRef = useRef<DripState[]>([]);
  const globalAlpha = useRef(0);
  const wasActiveRef = useRef(false);
  const { size } = useThree();

  useEffect(() => {
    dripsRef.current = Array.from({ length: N_DRIPS }, (_, i) => createDrip(i));
  }, []);

  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      dripsRef.current = Array.from({ length: N_DRIPS }, (_, i) => createDrip(i));
    }
    wasActiveRef.current = isActive;
  }, [isActive]);

  const uniforms = useMemo(() => ({
    u_aspect: { value: 1.0 },
    u_time: { value: 0.0 },
    u_global_alpha: { value: 0.0 },
    u_color: { value: PAINT_COLOR.clone() },
    u_drips: {
      value: Array.from({ length: N_DRIPS }, () => new THREE.Vector4(0.5, 2.0, 0.01, 0.0)),
    },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const targetAlpha = isActive ? 1.0 : 0.0;
    globalAlpha.current = THREE.MathUtils.lerp(
      globalAlpha.current,
      targetAlpha,
      Math.min(1.0, delta * GLOBAL_FADE_SPEED),
    );
    mat.uniforms.u_global_alpha.value = globalAlpha.current;

    if (globalAlpha.current < 0.005 && !isActive) return;

    mat.uniforms.u_time.value += delta;
    mat.uniforms.u_aspect.value = size.width / size.height;

    const drips = dripsRef.current;

    for (let i = 0; i < N_DRIPS; i++) {
      const d = drips[i];
      d.elapsed += delta;

      switch (d.phase) {

        case 'waiting':
          if (d.elapsed >= d.delay) {
            d.phase = 'flowing';
            d.elapsed = 0;
            d.currentAlpha = d.dripAlpha;
          }
          break;

        case 'flowing':
          d.tipY -= d.speed * delta;

          if (d.tipY < -(d.width * 0.75)) {
            d.phase = 'fading';
            d.elapsed = 0;
            d.initialAlpha = d.currentAlpha;
          }
          break;

        case 'fading': {
          const progress = Math.min(1.0, d.elapsed / d.fadeDuration);
          d.currentAlpha = d.initialAlpha * (1.0 - progress);

          if (progress >= 1.0) {
            d.phase = 'done';
            d.currentAlpha = 0;
          }
          break;
        }

        case 'done':
          drips[i] = resetDrip(d);
          break;
      }

      const gpuAlpha = d.phase === 'waiting' ? 0.0 : d.currentAlpha;
      mat.uniforms.u_drips.value[i].set(d.x, d.tipY, d.width, gpuAlpha);
    }
  });

  return (
    <mesh renderOrder={1}>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};