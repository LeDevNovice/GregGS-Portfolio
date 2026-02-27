import * as THREE from 'three';
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { LivingDotProps } from './types';
import type { DotAnimationState } from '../types';


const FADE_IN_DURATION = 5.0;
const FADE_IN_DELAY = 0.5;
const WIGGLE_DURATION = 0.3;
const EXPAND_DURATION = 2.0;
const CONTRACT_DURATION = 1.5;

const WIGGLE_AMPLITUDE = 5;

function getFullscreenRadius(): number {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.sqrt(w * w + h * h) / 2 + 10;
}

function cubicBezier(t: number, x1: number, y1: number, x2: number, y2: number): number {
  function sampleX(t: number): number {
    return 3 * t * (1 - t) * (1 - t) * x1 + 3 * t * t * (1 - t) * x2 + t * t * t;
  }
  function sampleY(t: number): number {
    return 3 * t * (1 - t) * (1 - t) * y1 + 3 * t * t * (1 - t) * y2 + t * t * t;
  }
  let start = 0; let end = 1;
  for (let i = 0; i < 8; i++) {
    const mid = (start + end) / 2;
    if (sampleX(mid) < t) start = mid; else end = mid;
  }
  return sampleY((start + end) / 2);
}

function easeStandard(t: number): number {
  return cubicBezier(Math.max(0, Math.min(1, t)), 0.4, 0, 0.2, 1);
}

function easeInOut(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

export const LivingDot: React.FC<LivingDotProps> = ({
  dotState,
  dotWorldPos,
  baseRadius,
  onAnimationComplete,
}) => {
  const meshRef = useRef<Mesh>(null!);

  const timerRef = useRef(0);
  const prevStateRef = useRef<DotAnimationState>('fadeIn');
  const completedRef = useRef(false);
  const radiusRef = useRef(0);
  const alphaRef = useRef(0);
  const offsetXRef = useRef(0);

  const onCompleteRef = useRef(onAnimationComplete);
  useEffect(() => { onCompleteRef.current = onAnimationComplete; }, [onAnimationComplete]);

  useEffect(() => {
    timerRef.current = 0;
    completedRef.current = false;
    if (dotState === 'expanded') {
      radiusRef.current = getFullscreenRadius();
      alphaRef.current = 1;
      offsetXRef.current = 0;
    }
  }, [dotState]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    timerRef.current += delta;
    const t = timerRef.current;

    let targetRadius = radiusRef.current;
    let targetAlpha = alphaRef.current;
    let targetOffsetX = 0;

    switch (dotState) {

      case 'fadeIn': {
        const elapsed = Math.max(0, t - FADE_IN_DELAY);
        const progress = Math.min(1, elapsed / FADE_IN_DURATION);
        targetAlpha = easeInOut(progress);
        targetRadius = baseRadius;
        targetOffsetX = 0;
        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current('fadeIn');
        }
        break;
      }

      case 'idle': {
        targetAlpha = 1;
        targetRadius = baseRadius;
        targetOffsetX = 0;
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current('idle');
        }
        break;
      }

      case 'pause':
      case 'secondPause': {
        targetAlpha = 1;
        targetRadius = baseRadius;
        targetOffsetX = 0;
        if (!completedRef.current && t >= 0.1) {
          completedRef.current = true;
          onCompleteRef.current(dotState);
        }
        break;
      }

      case 'wiggle1':
      case 'wiggle2': {
        const progress = Math.min(1, t / WIGGLE_DURATION);
        targetOffsetX = Math.sin(progress * Math.PI * 5) * WIGGLE_AMPLITUDE;
        targetAlpha = 1;
        targetRadius = baseRadius;
        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current(dotState);
        }
        break;
      }

      case 'expand': {
        const progress = Math.min(1, t / EXPAND_DURATION);
        const easedProgress = easeStandard(progress);
        targetRadius = baseRadius + (getFullscreenRadius() - baseRadius) * easedProgress;
        targetAlpha = 1;
        targetOffsetX = 0;
        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current('expand');
        }
        break;
      }

      case 'expanded': {
        targetRadius = getFullscreenRadius();
        targetAlpha = 1;
        targetOffsetX = 0;
        break;
      }

      case 'contract': {
        const progress = Math.min(1, t / CONTRACT_DURATION);
        const easedProgress = easeStandard(progress);
        const fullR = getFullscreenRadius();
        targetRadius = fullR + (baseRadius - fullR) * easedProgress;
        targetAlpha = 1;
        targetOffsetX = 0;
        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current('contract');
        }
        break;
      }
    }

    mesh.position.set(dotWorldPos[0] + targetOffsetX, dotWorldPos[1], 0);
    const scale = baseRadius > 0 ? targetRadius / baseRadius : 1;
    mesh.scale.setScalar(scale);

    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = targetAlpha;

    radiusRef.current = targetRadius;
    alphaRef.current = targetAlpha;
    offsetXRef.current = targetOffsetX;
  });

  return (
    <mesh ref={meshRef} position={[dotWorldPos[0], dotWorldPos[1], 0]}>
      <circleGeometry args={[1, 64]} />
      <meshBasicMaterial
        color="#792262"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
};