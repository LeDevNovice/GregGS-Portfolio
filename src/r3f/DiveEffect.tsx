import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { diveVert } from './shaders/dive.vert';
import { diveFrag } from './shaders/dive.frag';
import type { DotAnimationState } from '../types';

// ─── Paramètres de timing ──────────────────────────────────────────────
const DIVE_DURATION = 0.85;    // secondes pour aller de 0 → 1 (plongeon)
const SURFACE_DURATION = 0.65; // secondes pour aller de 1 → 0 (remontée)

// ─── Easing ───────────────────────────────────────────────────────────
// easeInOutCubic : démarre doucement, accélère, ralentit à la fin
// Donne une sensation organique au plongeon
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Props ────────────────────────────────────────────────────────────
interface DiveEffectProps {
  dotState: DotAnimationState;
  eHolePos: readonly [number, number]; // position CSS pixel du trou du "e"
  onAnimationComplete: (state: DotAnimationState) => void;
}

export const DiveEffect: React.FC<DiveEffectProps> = ({
  dotState,
  eHolePos,
  onAnimationComplete,
}) => {
  const { size } = useThree();

  // ── Refs pour l'animation ──
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const progressRef = useRef(0);           // valeur courante 0-1
  const directionRef = useRef<'in' | 'out' | null>(null); // sens actuel
  const completedRef = useRef(false);      // guard anti-double-fire

  // ── Ref stable pour le callback ──
  const onCompleteRef = useRef(onAnimationComplete);
  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // ── Uniforms (créés une seule fois, mutés chaque frame) ──
  const uniforms = useMemo(() => ({
    u_center: { value: new THREE.Vector2(0.5, 0.5) },
    u_progress: { value: 0.0 },
    u_aspect: { value: size.width / size.height },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mettre à jour u_aspect quand la fenêtre change ──
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_aspect.value = size.width / size.height;
    }
  }, [size.width, size.height]);

  // ── Détecter le changement d'état et démarrer l'animation ──
  useEffect(() => {
    if (dotState === 'diving') {
      // Convertir la position CSS pixel du "e" vers les coordonnées UV (0-1)
      // CSS : (0,0) = haut-gauche, y croît vers le bas
      // UV WebGL : (0,0) = bas-gauche, y croît vers le haut → d'où le (1 - y)
      const u = eHolePos[0] / window.innerWidth;
      const v = 1.0 - eHolePos[1] / window.innerHeight;

      if (materialRef.current) {
        materialRef.current.uniforms.u_center.value.set(u, v);
      }

      progressRef.current = 0;
      completedRef.current = false;
      directionRef.current = 'in';

    } else if (dotState === 'surfacing') {
      progressRef.current = 1;
      completedRef.current = false;
      directionRef.current = 'out';
    } else {
      // Aucune animation de plongeon : on s'assure que le shader est invisible
      directionRef.current = null;
      if (materialRef.current) {
        materialRef.current.uniforms.u_progress.value = 0;
        materialRef.current.visible = false;
      }
    }
  }, [dotState, eHolePos]);

  // ── Boucle d'animation ──
  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat || !directionRef.current || completedRef.current) return;

    mat.visible = true;

    if (directionRef.current === 'in') {
      // Plongeon : progress 0 → 1
      progressRef.current = Math.min(
        progressRef.current + delta / DIVE_DURATION,
        1.0
      );
      mat.uniforms.u_progress.value = easeInOutCubic(progressRef.current);

      if (progressRef.current >= 1.0) {
        completedRef.current = true;
        directionRef.current = null;
        // On attend que progress=1 soit rendu (1 frame) avant de notifier
        requestAnimationFrame(() => {
          onCompleteRef.current('diving');
        });
      }

    } else if (directionRef.current === 'out') {
      // Remontée : progress 1 → 0
      progressRef.current = Math.max(
        progressRef.current - delta / SURFACE_DURATION,
        0.0
      );
      mat.uniforms.u_progress.value = easeInOutCubic(progressRef.current);

      if (progressRef.current <= 0.0) {
        completedRef.current = true;
        directionRef.current = null;
        mat.visible = false;
        requestAnimationFrame(() => {
          onCompleteRef.current('surfacing');
        });
      }
    }
  });

  // ─── Le mesh plein écran ──────────────────────────────────────────────
  // PlaneGeometry(2, 2) avec une caméra orthographique dont le zoom=1 couvre
  // exactement NDC [-1, 1]. Le shader se dessine par-dessus tout (renderOrder élevé).
  return (
    <mesh renderOrder={10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={diveVert}
        fragmentShader={diveFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        visible={false}
      />
    </mesh>
  );
};