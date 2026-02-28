import type { RefObject } from 'react';
import type { DotAnimationState } from '../types';

export interface DotCanvasProps {
  dotState: DotAnimationState;
  menuOpen: boolean;  
  placeholderRef: RefObject<HTMLSpanElement | null>;
  onAnimationComplete: (completedState: DotAnimationState) => void;
  eHolePos: readonly [number, number];
}

export interface LivingDotProps {
  dotState: DotAnimationState;
  dotWorldPos: readonly [number, number];
  baseRadius: number;                     
  onAnimationComplete: (completedState: DotAnimationState) => void;
}