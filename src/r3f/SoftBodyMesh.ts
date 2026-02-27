// src/r3f/SoftBodyMesh.ts

import * as THREE from 'three';
import type { Vec2 } from './physics/Vec2';
import { NUM_PARTICLES } from './physics/SoftBody';

const SUBDIVISIONS = 6;
const CURVE_POINTS = NUM_PARTICLES * SUBDIVISIONS; // 72
const TOTAL_VERTICES = CURVE_POINTS + 1;           // 73 (vertex 0 = centre)
const TOTAL_INDICES = CURVE_POINTS * 3;            // 216

// Objet temporaire réutilisé par catmullRom — zéro allocation dans la boucle.
const _tmp = { x: 0, y: 0 };

// Helper qui satisfait TypeScript strict (Array[i] = T | undefined).
// En pratique ne retourne jamais le fallback car particles.length = NUM_PARTICLES.
function safeParticle(particles: Vec2[], idx: number): Vec2 {
  const p = particles[idx];
  return p !== undefined ? p : { x: 0, y: 0 };
}

/**
 * Spline Catmull-Rom entre P1 et P2.
 * Écrit dans `out` pour éviter toute allocation dans la boucle.
 */
function catmullRom(
  p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2,
  t: number,
  out: { x: number; y: number },
): void {
  const t2 = t * t;
  const t3 = t2 * t;
  out.x = 0.5 * (
    2 * p1.x
    + (-p0.x + p2.x) * t
    + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2
    + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
  );
  out.y = 0.5 * (
    2 * p1.y
    + (-p0.y + p2.y) * t
    + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2
    + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
  );
}

export class SoftBodyMesh {
  public readonly geometry: THREE.BufferGeometry;
  private readonly posAttr: THREE.BufferAttribute;

  constructor() {
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(TOTAL_VERTICES * 3);
    this.posAttr = new THREE.BufferAttribute(positions, 3);
    this.posAttr.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', this.posAttr);

    // Fan triangulation : [centre, point_i, point_(i+1 % N)]
    const indices = new Uint16Array(TOTAL_INDICES);
    for (let i = 0; i < CURVE_POINTS; i++) {
      indices[i * 3 + 0] = 0;
      indices[i * 3 + 1] = i + 1;
      indices[i * 3 + 2] = (i + 1) % CURVE_POINTS + 1;
    }
    this.geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  }

  public update(particles: Vec2[], centerX: number, centerY: number): void {
    const pos = this.posAttr.array as Float32Array;
    const n = NUM_PARTICLES;

    // Vertex 0 : centre
    pos[0] = centerX;
    pos[1] = centerY;
    pos[2] = 0;

    // Vertices 1..72 : périmètre Catmull-Rom
    for (let i = 0; i < n; i++) {
      const p0 = safeParticle(particles, (i - 1 + n) % n);
      const p1 = safeParticle(particles, i);
      const p2 = safeParticle(particles, (i + 1) % n);
      const p3 = safeParticle(particles, (i + 2) % n);

      for (let s = 0; s < SUBDIVISIONS; s++) {
        const t = s / SUBDIVISIONS; // t ∈ [0, 1)
        catmullRom(p0, p1, p2, p3, t, _tmp);

        const vi = i * SUBDIVISIONS + s + 1;
        pos[vi * 3 + 0] = _tmp.x;
        pos[vi * 3 + 1] = _tmp.y;
        pos[vi * 3 + 2] = 0;
      }
    }

    this.posAttr.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }

  public dispose(): void {
    this.geometry.dispose();
  }
}