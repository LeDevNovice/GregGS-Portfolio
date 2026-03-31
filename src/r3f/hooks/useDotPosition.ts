import { useState, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';

export interface DotPosition {
  worldPos: readonly [number, number];
  baseRadius: number;
}

function rectToWorld(rect: DOMRect): DotPosition {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return {
    worldPos: [
      cx - window.innerWidth / 2,
      window.innerHeight / 2 - cy,
    ] as const,
    baseRadius: rect.width / 2,
  };
}

export function useDotPosition(
  placeholderRef: RefObject<HTMLSpanElement | null>,
): DotPosition {
  const [position, setPosition] = useState<DotPosition>({
    worldPos: [0, 0],
    baseRadius: 0,
  });

  const update = useCallback((): void => {
    const el = placeholderRef.current;
    if (!el) return;
    const next = rectToWorld(el.getBoundingClientRect());
    setPosition(prev => {
      const dx = Math.abs(next.worldPos[0] - prev.worldPos[0]);
      const dy = Math.abs(next.worldPos[1] - prev.worldPos[1]);
      const dr = Math.abs(next.baseRadius - prev.baseRadius);
      if (dx < 0.5 && dy < 0.5 && dr < 0.5) return prev;
      return next;
    });
  }, [placeholderRef]);

  useEffect(() => {
    update();

    const observer = new ResizeObserver(update);
    const el = placeholderRef.current;
    if (el) {
      observer.observe(el.parentElement ?? el);
    }
    window.addEventListener('resize', update);

    return (): void => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [update, placeholderRef]);

  return position;
}