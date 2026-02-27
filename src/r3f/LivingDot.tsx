import * as THREE from 'three';
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

import type { LivingDotProps } from './types';
import { SoftBody } from './physics/SoftBody';
import { SoftBodyMesh } from './SoftBodyMesh';
import { vec2 } from './physics/Vec2';

const FADE_IN_DURATION = 5.0;
const FADE_IN_DELAY = 0.5;
const WIGGLE_DURATION = 0.3;
const EXPAND_DURATION = 2.0;
const CONTRACT_DURATION = 1.5;

const BREATHING_FACTOR = 0.04;
const WIGGLE_IMPULSE_FACTOR = 0.55;
const EXPAND_BURST_FACTOR = 0.9;
const CONTRACT_SQUEEZE_FACTOR = 0.3;

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
    () => new SoftBody(vec2(dotWorldPos[0], dotWorldPos[1]), Math.max(baseRadius, 1)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const sbMesh = useMemo(() => new SoftBodyMesh(), []);

  const timerRef = useRef(0);
  const completedRef = useRef(false);
  const alphaRef = useRef(0);
  const globalTimeRef = useRef(0);
  const wiggleImpulseApplied = useRef(false);
  const expandBurstApplied = useRef(false);
  const contractSqueezeApplied = useRef(false);

  const onCompleteRef = useRef(onAnimationComplete);
  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    timerRef.current = 0;
    completedRef.current = false;
    wiggleImpulseApplied.current = false;
    expandBurstApplied.current = false;
    contractSqueezeApplied.current = false;

    if (dotState === 'expanded') {
      const r = getFullscreenRadius();
      softBody.targetRadius = r;
      softBody.teleport(vec2(dotWorldPos[0], dotWorldPos[1]), r);
      alphaRef.current = 1;
    }
  }, [dotState]);
  const prevWorldPos = useRef<readonly [number, number]>([0, 0]);
  useEffect(() => {
    const [px, py] = prevWorldPos.current;
    const [nx, ny] = dotWorldPos;
    if (Math.abs(nx - px) > 0.5 || Math.abs(ny - py) > 0.5) {
      prevWorldPos.current = dotWorldPos;
      if (
        dotState === 'idle' ||
        dotState === 'fadeIn' ||
        dotState === 'pause' ||
        dotState === 'secondPause'
      ) {
        softBody.teleport(vec2(nx, ny));
      } else {
        softBody.teleport(vec2(nx, ny), softBody.targetRadius);
      }
    }
  }, [dotWorldPos, dotState, softBody]);

  const prevBaseRadius = useRef(baseRadius);
  useEffect(() => {
    if (Math.abs(baseRadius - prevBaseRadius.current) > 0.5 && baseRadius > 0) {
      prevBaseRadius.current = baseRadius;
      softBody.baseRadius = baseRadius;
      if (dotState === 'idle' || dotState === 'fadeIn') {
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
          const impulse = softBody.baseRadius * WIGGLE_IMPULSE_FACTOR;
          softBody.addLateralImpulse(impulse * dir, 0);
          softBody.addRadialImpulse(-softBody.baseRadius * 0.2);
        }
        const progress = Math.min(1, t / WIGGLE_DURATION);
        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current(dotState);
        }
        break;
      }

      case 'expand': {
        alphaRef.current = 1;
        const progress = Math.min(1, t / EXPAND_DURATION);
        softBody.targetRadius =
          softBody.baseRadius +
          (getFullscreenRadius() - softBody.baseRadius) * easeStandard(progress);
        if (!expandBurstApplied.current && t < 0.05) {
          expandBurstApplied.current = true;
          softBody.addRadialImpulse(softBody.baseRadius * EXPAND_BURST_FACTOR);
        }
        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current('expand');
        }
        break;
      }

      case 'expanded': {
        alphaRef.current = 1;
        softBody.targetRadius = getFullscreenRadius();
        break;
      }

      case 'contract': {
        alphaRef.current = 1;
        const progress = Math.min(1, t / CONTRACT_DURATION);
        const fullR = getFullscreenRadius();
        softBody.targetRadius = fullR + (softBody.baseRadius - fullR) * easeStandard(progress);
        if (!contractSqueezeApplied.current && t < 0.05) {
          contractSqueezeApplied.current = true;
          softBody.addRadialImpulse(-softBody.baseRadius * CONTRACT_SQUEEZE_FACTOR);
        }
        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current('contract');
        }
        break;
      }
    }

    softBody.step(delta);

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