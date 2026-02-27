import React from 'react';
import { Canvas } from '@react-three/fiber';
import { LivingDot } from './LivingDot';
import { useDotPosition } from './hooks/useDotPosition';
import type { DotCanvasProps } from './types';
import { PaintExplosion } from './PaintExplosion';

const canvasStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 5,
} as const;

export const DotCanvas: React.FC<DotCanvasProps> = ({
  dotState,
  placeholderRef,
  onAnimationComplete,
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
    </Canvas>
  );
};