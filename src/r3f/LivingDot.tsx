import * as THREE from 'three';
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

import type { LivingDotProps } from './types';
import { SoftBody } from './physics/SoftBody';
import { SoftBodyMesh } from './SoftBodyMesh';
import { vec2 } from './physics/Vec2';

// ─── Timing ──────────────────────────────────────────────────────────────────
const FADE_IN_DURATION = 5.0;
const FADE_IN_DELAY = 0.5;
const WIGGLE_DURATION = 0.3;

const BREATHING_FACTOR = 0.04;
const WIGGLE_IMPULSE_FACTOR = 0.42;

function cubicBezier(t: number, x1: number, y1: number, x2: number, y2: number): number {
  function sampleX(u: number): number {
    return 3 * u * (1 - u) * (1 - u) * x1 + 3 * u * u * (1 - u) * x2 + u * u * u;
  }
  function sampleY(u: number): number {
    return 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u * u * u;
  }
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    if (sampleX(mid) < t) { lo = mid; } else { hi = mid; }
  }
  return sampleY((lo + hi) / 2);
}

function easeStandard(t: number): number {
  return cubicBezier(Math.max(0, Math.min(1, t)), 0.4, 0, 0.2, 1);
}

function easeInOut(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
}

function getFullscreenRadius(): number {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.sqrt(w * w + h * h) / 2 + 20;
}

export const LivingDot: React.FC<LivingDotProps> = ({
  dotState,
  dotWorldPos,
  baseRadius,
  onAnimationComplete,
}) => {
  const meshRef = useRef<Mesh | null>(null);

  const softBody = useMemo(
    () => new SoftBody(vec2(0, 0), 1),
    [],
  );
  const sbMesh = useMemo(() => new SoftBodyMesh(), []);

  const timerRef = useRef(0);
  const completedRef = useRef(false);
  const alphaRef = useRef(0);
  const globalTimeRef = useRef(0);
  const wiggleImpulseApplied = useRef(false);

  const onCompleteRef = useRef(onAnimationComplete);
  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  const dotWorldPosRef = useRef(dotWorldPos);
  useEffect(() => {
    dotWorldPosRef.current = dotWorldPos;
  }, [dotWorldPos]);

  useEffect(() => {
    timerRef.current = 0;
    completedRef.current = false;
    wiggleImpulseApplied.current = false;

    if (dotState === 'expanded') {
      const r = getFullscreenRadius();
      softBody.teleport(vec2(dotWorldPosRef.current[0], dotWorldPosRef.current[1]), r);
      alphaRef.current = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dotState]);

  const prevWorldPos = useRef<readonly [number, number]>([0, 0]);
  useEffect(() => {
    const [px, py] = prevWorldPos.current;
    const [nx, ny] = dotWorldPos;
    if (Math.abs(nx - px) > 0.5 || Math.abs(ny - py) > 0.5) {
      prevWorldPos.current = dotWorldPos;
      const isControlled =
        dotState === 'expand' ||
        dotState === 'expanded' ||
        dotState === 'contract';

      const r = isControlled ? softBody.targetRadius : softBody.baseRadius;
      softBody.teleport(vec2(nx, ny), r);
    }
  }, [dotWorldPos, dotState, softBody]);

  const prevBaseRadius = useRef(0);
  useEffect(() => {
    if (baseRadius > 0 && Math.abs(baseRadius - prevBaseRadius.current) > 0.5) {
      prevBaseRadius.current = baseRadius;
      softBody.baseRadius = baseRadius;

      if (
        dotState === 'idle' ||
        dotState === 'fadeIn' ||
        dotState === 'pause' ||
        dotState === 'secondPause'
      ) {
        softBody.targetRadius = baseRadius;
        softBody.teleport(vec2(dotWorldPos[0], dotWorldPos[1]), baseRadius);
      }
    }
  }, [baseRadius, dotState, dotWorldPos, softBody]);

  useEffect(() => {
    return (): void => {
      sbMesh.dispose();
    };
  }, [sbMesh]);

  useFrame((_, delta): void => {
    const mesh = meshRef.current;
    if (mesh === null || baseRadius <= 0) return;

    timerRef.current += delta;
    globalTimeRef.current += delta;
    const t = timerRef.current;
    const gt = globalTimeRef.current;

    const breatheMag = softBody.baseRadius * BREATHING_FACTOR;

    switch (dotState) {

      case 'fadeIn': {
        const elapsed = Math.max(0, t - FADE_IN_DELAY);
        const progress = Math.min(1, elapsed / FADE_IN_DURATION);
        alphaRef.current = easeInOut(progress);
        softBody.targetRadius = softBody.baseRadius;
        softBody.addBreathingForce(gt, breatheMag * Math.min(1, progress * 3));
        softBody.step(delta);
        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current('fadeIn');
        }
        break;
      }

      case 'idle': {
        alphaRef.current = 1;
        softBody.targetRadius = softBody.baseRadius;
        softBody.addBreathingForce(gt, breatheMag);
        softBody.step(delta);
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current('idle');
        }
        break;
      }

      case 'pause':
      case 'secondPause': {
        alphaRef.current = 1;
        softBody.targetRadius = softBody.baseRadius;
        softBody.addBreathingForce(gt, breatheMag * 0.5);
        softBody.step(delta);
        if (!completedRef.current && t >= 0.1) {
          completedRef.current = true;
          onCompleteRef.current(dotState);
        }
        break;
      }

      case 'wiggle1':
      case 'wiggle2': {
        alphaRef.current = 1;
        softBody.targetRadius = softBody.baseRadius;

        if (!wiggleImpulseApplied.current) {
          wiggleImpulseApplied.current = true;
          const dir = dotState === 'wiggle1' ? 1 : -1;
          softBody.addLateralImpulse(
            softBody.baseRadius * WIGGLE_IMPULSE_FACTOR * dir,
            0,
          );
          softBody.addRadialImpulse(-softBody.baseRadius * 0.12);
        }

        softBody.step(delta);

        const progress = Math.min(1, t / WIGGLE_DURATION);
        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current(dotState);
        }
        break;
      }

      case 'expand': {
        alphaRef.current = 0;
        break;
      }

      case 'expanded': {
        alphaRef.current = 0;
        break;
      }

      case 'contract': {
        alphaRef.current = 0;
        break;
      }
    }

    const positions = softBody.positions();
    const center = softBody.center;
    sbMesh.update(positions, center.x, center.y);

    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = alphaRef.current;
  });

  return (
    <mesh ref={meshRef} geometry={sbMesh.geometry} position={[0, 0, 0]}>
      <meshBasicMaterial
        color="#792262"
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};