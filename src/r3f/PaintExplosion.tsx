import React, {
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { paintExplosionVert } from './shaders/paintExplosion.vert';
import { paintExplosionFrag } from './shaders/paintExplosion.frag';
import type { DotAnimationState } from '../types';

const NUM_BLOBS = 10;
const EXPLOSION_DURATION = 3.0;
const CONTRACTION_DURATION = 0.60;

const PAINT_COLOR = new THREE.Color('#ba3296');

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeInExpo(t: number): number {
  return t <= 0 ? 0 : Math.pow(2, 10 * (t - 1));
}

interface BlobDef {
  endPos: [number, number];
  maxRadius: number;
  delay: number;
  duration: number;
}

function generateBlobs(originUV: [number, number], aspect: number): BlobDef[] {
  const [ox, oy] = originUV;
  const blobs: BlobDef[] = [];

  blobs.push({
    endPos: [
      ox + (Math.random() - 0.5) * 0.06,
      oy + (Math.random() - 0.5) * 0.06,
    ],
    maxRadius: 0.62 + Math.random() * 0.16,
    delay: 0.0,
    duration: 0.80 + Math.random() * 0.20,
  });

  for (let i = 0; i < 8; i++) {
    const baseAngle = (i / 8) * Math.PI * 2;
    const jitter = (Math.random() - 0.5) * 0.7;
    const angle = baseAngle + jitter;

    const rawDx = Math.cos(angle) / aspect;
    const rawDy = Math.sin(angle);
    const len = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
    const dx = rawDx / len;
    const dy = rawDy / len;

    const travel = 1.3 + Math.random() * 0.4;

    blobs.push({
      endPos: [ox + dx * travel, oy + dy * travel],
      maxRadius: 0.26 + Math.random() * 0.26,
      delay: Math.random() * 0.18,
      duration: 0.55 + Math.random() * 0.35,
    });
  }

  {
    const angle = Math.random() * Math.PI * 2;
    const rawDx = Math.cos(angle) / aspect;
    const rawDy = Math.sin(angle);
    const len = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
    blobs.push({
      endPos: [ox + (rawDx / len) * 1.45, oy + (rawDy / len) * 1.45],
      maxRadius: 0.20 + Math.random() * 0.22,
      delay: Math.random() * 0.12,
      duration: 0.50 + Math.random() * 0.38,
    });
  }

  return blobs.slice(0, NUM_BLOBS);
}

interface PaintExplosionProps {
  dotState: DotAnimationState;
  dotWorldPos: readonly [number, number];
  onAnimationComplete: (state: DotAnimationState) => void;
}

export const PaintExplosion: React.FC<PaintExplosionProps> = ({
  dotState,
  dotWorldPos,
  onAnimationComplete,
}) => {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const timerRef = useRef(0);
  const completedRef = useRef(false);
  const blobsRef = useRef<BlobDef[] | null>(null);
  const capturedOriginRef = useRef<[number, number]>([0.5, 0.5]);

  const onCompleteRef = useRef(onAnimationComplete);
  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  const dotWorldPosRef = useRef(dotWorldPos);
  useEffect(() => {
    dotWorldPosRef.current = dotWorldPos;
  }, [dotWorldPos]);

  const uniforms = useMemo(() => ({
    u_blob_pos: {
      value: Array.from({ length: NUM_BLOBS }, () => new THREE.Vector2(0.5, 0.5)),
    },
    u_blob_r: {
      value: new Float32Array(NUM_BLOBS),
    },
    u_aspect: { value: 1.0 },
    u_time: { value: 0.0 },
    u_global_alpha: { value: 0.0 },
    u_color: {
      value: new THREE.Vector3(PAINT_COLOR.r, PAINT_COLOR.g, PAINT_COLOR.b),
    },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (dotState === 'expand') {
      timerRef.current = 0;
      completedRef.current = false;

      const aspectRatio = window.innerWidth / window.innerHeight;

      const u = dotWorldPosRef.current[0] / window.innerWidth + 0.5;
      const v = dotWorldPosRef.current[1] / window.innerHeight + 0.5;

      capturedOriginRef.current = [u, v];
      blobsRef.current = generateBlobs([u, v], aspectRatio);

      if (materialRef.current) {
        materialRef.current.uniforms.u_aspect.value = aspectRatio;
      }
    } else if (dotState === 'contract') {
      timerRef.current = 0;
      completedRef.current = false;

      const u = dotWorldPosRef.current[0] / window.innerWidth + 0.5;
      const v = dotWorldPosRef.current[1] / window.innerHeight + 0.5;
      capturedOriginRef.current = [u, v];
    }
  }, [dotState]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((rfState, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const isActive =
      dotState === 'expand' ||
      dotState === 'expanded' ||
      dotState === 'contract';

    if (!isActive) {
      mat.uniforms.u_global_alpha.value = 0;
      return;
    }

    mat.uniforms.u_aspect.value =
      rfState.viewport.width / rfState.viewport.height;

    mat.uniforms.u_time.value += delta;

    mat.uniforms.u_global_alpha.value = 1;

    const blobs = blobsRef.current;
    const [ox, oy] = capturedOriginRef.current;

    if (dotState === 'expanded') {
      if (blobs) {
        for (let i = 0; i < NUM_BLOBS; i++) {
          mat.uniforms.u_blob_pos.value[i].set(blobs[i].endPos[0], blobs[i].endPos[1]);
          mat.uniforms.u_blob_r.value[i] = blobs[i].maxRadius;
        }
      }
      return;
    }

    if (!blobs) return;

    timerRef.current += delta;
    const t = timerRef.current;

    if (dotState === 'expand') {
      for (let i = 0; i < NUM_BLOBS; i++) {
        const blob = blobs[i];

        const blobStart = blob.delay * EXPLOSION_DURATION;
        const blobEnd = blobStart + blob.duration * EXPLOSION_DURATION;
        const localT = Math.min(1, Math.max(0, (t - blobStart) / (blobEnd - blobStart)));

        const e = easeOutExpo(localT);

        mat.uniforms.u_blob_pos.value[i].set(
          ox + (blob.endPos[0] - ox) * e,
          oy + (blob.endPos[1] - oy) * e,
        );
        mat.uniforms.u_blob_r.value[i] = blob.maxRadius * e;
      }

      if (!completedRef.current && t >= EXPLOSION_DURATION) {
        completedRef.current = true;
        onCompleteRef.current('expand');
      }
    }

    else if (dotState === 'contract') {
      for (let i = 0; i < NUM_BLOBS; i++) {
        const blob = blobs[i];

        const blobStart = blob.delay * CONTRACTION_DURATION;
        const blobEnd = blobStart + blob.duration * CONTRACTION_DURATION;
        const localT = Math.min(1, Math.max(0, (t - blobStart) / (blobEnd - blobStart)));

        const e = easeInExpo(localT);

        mat.uniforms.u_blob_pos.value[i].set(
          blob.endPos[0] + (ox - blob.endPos[0]) * e,
          blob.endPos[1] + (oy - blob.endPos[1]) * e,
        );
        mat.uniforms.u_blob_r.value[i] = blob.maxRadius * (1 - e);
      }

      if (!completedRef.current && t >= CONTRACTION_DURATION) {
        completedRef.current = true;
        onCompleteRef.current('contract');
      }
    }
  });

  return (
    <mesh position={[0, 0, 1]} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={paintExplosionVert}
        fragmentShader={paintExplosionFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};