// src/r3f/LivingDot.tsx

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
const EXPAND_DURATION = 2.0;
const CONTRACT_DURATION = 1.5;

// ─── Constantes physiques ────────────────────────────────────────────────────

// Respiration : 4% du rayon → subtil mais présent
const BREATHING_FACTOR = 0.04;

// Wiggle : réduit de 0.55 → 0.18. Le squash est visible sans diverger.
const WIGGLE_IMPULSE_FACTOR = 0.42;

// ─── Easing ──────────────────────────────────────────────────────────────────

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

// ─── Composant ───────────────────────────────────────────────────────────────

export const LivingDot: React.FC<LivingDotProps> = ({
  dotState,
  dotWorldPos,
  baseRadius,
  onAnimationComplete,
}) => {
  const meshRef = useRef<Mesh | null>(null);

  // Instance unique sur toute la durée de vie — initialisée avec des valeurs
  // provisoires (pos=0,0, radius=1). Les useEffect ci-dessous corrigent
  // dès que le DOM est mesuré et que les vraies valeurs arrivent.
  const softBody = useMemo(
    () => new SoftBody(vec2(0, 0), 1),
    [],
  );
  const sbMesh = useMemo(() => new SoftBodyMesh(), []);

  // Refs d'animation — jamais de setState pour éviter les re-renders à 60fps
  const timerRef = useRef(0);
  const completedRef = useRef(false);
  const alphaRef = useRef(0);
  const globalTimeRef = useRef(0);
  const wiggleImpulseApplied = useRef(false);

  // Ref vers la callback pour éviter les closures périmées dans useFrame
  const onCompleteRef = useRef(onAnimationComplete);
  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // Ref vers dotWorldPos pour y accéder sans en faire une dep de useEffect([dotState])
  const dotWorldPosRef = useRef(dotWorldPos);
  useEffect(() => {
    dotWorldPosRef.current = dotWorldPos;
  }, [dotWorldPos]);

  // ── Reset quand dotState change ──────────────────────────────────────────
  // dotWorldPos et softBody intentionnellement absents des deps :
  // - dotWorldPos est accédé via dotWorldPosRef (ref toujours à jour)
  // - softBody est stable (useMemo([]))
  useEffect(() => {
    timerRef.current = 0;
    completedRef.current = false;
    wiggleImpulseApplied.current = false;

    if (dotState === 'expanded') {
      const r = getFullscreenRadius();
      // Snap instantané plein écran — aucune animation
      softBody.teleport(vec2(dotWorldPosRef.current[0], dotWorldPosRef.current[1]), r);
      alphaRef.current = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dotState]);

  // ── Repositionnement au resize ────────────────────────────────────────────
  const prevWorldPos = useRef<readonly [number, number]>([0, 0]);
  useEffect(() => {
    const [px, py] = prevWorldPos.current;
    const [nx, ny] = dotWorldPos;
    if (Math.abs(nx - px) > 0.5 || Math.abs(ny - py) > 0.5) {
      prevWorldPos.current = dotWorldPos;
      // Pendant les états contrôlés (expand/contract), on met à jour le centre
      // sans reset de vélocité pour ne pas casser l'animation en cours.
      const isControlled =
        dotState === 'expand' ||
        dotState === 'expanded' ||
        dotState === 'contract';

      const r = isControlled ? softBody.targetRadius : softBody.baseRadius;
      softBody.teleport(vec2(nx, ny), r);
    }
  }, [dotWorldPos, dotState, softBody]);

  // ── Mise à jour du baseRadius au resize ──────────────────────────────────
  const prevBaseRadius = useRef(0);
  useEffect(() => {
    if (baseRadius > 0 && Math.abs(baseRadius - prevBaseRadius.current) > 0.5) {
      prevBaseRadius.current = baseRadius;
      softBody.baseRadius = baseRadius;

      // Seulement pour les états au repos — pas pendant une transition active
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

  // ── Nettoyage à l'unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return (): void => {
      sbMesh.dispose();
    };
  }, [sbMesh]);

  // ── Boucle d'animation (60fps) ────────────────────────────────────────────
  useFrame((_, delta): void => {
    const mesh = meshRef.current;
    if (mesh === null || baseRadius <= 0) return;

    timerRef.current += delta;
    globalTimeRef.current += delta;
    const t = timerRef.current;
    const gt = globalTimeRef.current;

    const breatheMag = softBody.baseRadius * BREATHING_FACTOR;

    switch (dotState) {

      // ── États au repos : physique complète avec respiration ──

      case 'fadeIn': {
        const elapsed = Math.max(0, t - FADE_IN_DELAY);
        const progress = Math.min(1, elapsed / FADE_IN_DURATION);
        alphaRef.current = easeInOut(progress);
        softBody.targetRadius = softBody.baseRadius;
        // Respiration atténuée en début de fade pour une apparition douce
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

      // ── Wiggle : impulse latérale modérée, physique complète ──

      case 'wiggle1':
      case 'wiggle2': {
        alphaRef.current = 1;
        softBody.targetRadius = softBody.baseRadius;

        if (!wiggleImpulseApplied.current) {
          wiggleImpulseApplied.current = true;
          const dir = dotState === 'wiggle1' ? 1 : -1;
          // Impulse latérale principale : le blob part sur le côté
          softBody.addLateralImpulse(
            softBody.baseRadius * WIGGLE_IMPULSE_FACTOR * dir,
            0,
          );
          // Légère compression radiale simultanée : effet squash organique
          // Le blob s'aplatit légèrement dans la direction du mouvement
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

      // ── Expand : placement direct des particules sur le cercle cible ──
      //
      // Pourquoi setParticlesToRadius et non les impulses de Phase 0 ?
      // Les impulses avec des grandes variations de targetRadius (15px → 1000px)
      // rendent la simulation instable (divergence Verlet). Le placement direct
      // garantit un cercle parfait à chaque frame, contrôlé par l'easing.
      // La physique (step) ajoute ensuite un léger frémissement organique.

      case 'expand': {
        alphaRef.current = 1;
        const progress = Math.min(1, t / EXPAND_DURATION);
        const r =
          softBody.baseRadius +
          (getFullscreenRadius() - softBody.baseRadius) * easeStandard(progress);

        // Place les particules exactement sur le cercle à rayon r
        softBody.setParticlesToRadius(r);
        // Légère respiration sur les bords même pendant l'expansion (10% de l'amplitude)
        softBody.addBreathingForce(gt, breatheMag * 0.1);
        softBody.step(delta);

        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current('expand');
        }
        break;
      }

      // ── Expanded : cercle plein écran stable (fond violet du menu) ──

      case 'expanded': {
        // État stable : pas de physique active, pas de respiration.
        // Le mesh est déjà positionné par le useEffect([dotState]) via teleport().
        alphaRef.current = 1;
        break;
      }

      // ── Contract : placement direct, symétrique à expand ──

      case 'contract': {
        alphaRef.current = 1;
        const progress = Math.min(1, t / CONTRACT_DURATION);
        const fullR = getFullscreenRadius();
        const r = fullR + (softBody.baseRadius - fullR) * easeStandard(progress);

        softBody.setParticlesToRadius(r);
        softBody.addBreathingForce(gt, breatheMag * 0.1);
        softBody.step(delta);

        if (!completedRef.current && progress >= 1) {
          completedRef.current = true;
          onCompleteRef.current('contract');
        }
        break;
      }
    }

    // ── Mise à jour géométrie depuis positions physiques ──────────────────
    const positions = softBody.positions();
    const center = softBody.center;
    sbMesh.update(positions, center.x, center.y);

    // ── Opacité ──────────────────────────────────────────────────────────
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