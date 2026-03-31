import React from 'react';
import { Canvas } from '@react-three/fiber';
import { LivingDot } from './LivingDot';
import { PaintExplosion } from './PaintExplosion';
import { DiveEffect } from './DiveEffect';
import { useDotPosition } from './hooks/useDotPosition';
import type { DotCanvasProps } from './types';

const canvasStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 5,
} as const;

// ─── Props étendus ────────────────────────────────────────────────────
interface DotCanvasPropsExtended extends DotCanvasProps {
  // Position CSS pixel du trou du "e" dans le titre Greg.GS
  // [x, y] où (0,0) est haut-gauche de la fenêtre
  eHolePos: readonly [number, number];
}

export const DotCanvas: React.FC<DotCanvasPropsExtended> = ({
  dotState,
  placeholderRef,
  onAnimationComplete,
  eHolePos,
}) => {
  const { worldPos, baseRadius } = useDotPosition(placeholderRef);

  return (
    <Canvas
      style={canvasStyle}
      orthographic
      camera={{ zoom: 1, position: [0, 0, 100], near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        alpha: true,
      }}
      dpr={Math.min(window.devicePixelRatio, 2)}
      raycaster={{ enabled: false }}
    >
      <LivingDot
        dotState={dotState}
        dotWorldPos={worldPos}
        baseRadius={baseRadius}
        onAnimationComplete={onAnimationComplete}
      />
      <PaintExplosion
        dotState={dotState}
        dotWorldPos={worldPos}
        onAnimationComplete={onAnimationComplete}
      />
      {/* ← NOUVEAU : l'effet de plongeon */}
      <DiveEffect
        dotState={dotState}
        eHolePos={eHolePos}
        onAnimationComplete={onAnimationComplete}
      />
    </Canvas>
  );
};