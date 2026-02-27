import { useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';

interface DotPosition {
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
  placeholderRef: RefObject<HTMLSpanElement | null>
): DotPosition {
  const positionRef = useRef<DotPosition>({
    worldPos: [0, 0],
    baseRadius: 0,
  });

  const update = useCallback((): void => {
    const el = placeholderRef.current;
    if (!el) return;
    positionRef.current = rectToWorld(el.getBoundingClientRect());
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

  return positionRef.current;
}