import * as THREE from 'three';
import type { Vec2 } from './physics/Vec2';
import { NUM_PARTICLES } from './physics/SoftBody';

const SUBDIVISIONS = 6;
const CURVE_POINTS = NUM_PARTICLES * SUBDIVISIONS;
const TOTAL_VERTICES = CURVE_POINTS + 1;
const TOTAL_INDICES = CURVE_POINTS * 3;

const _tmp = { x: 0, y: 0 };

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

    pos[0] = centerX;
    pos[1] = centerY;
    pos[2] = 0;

    for (let i = 0; i < n; i++) {
      const p0 = particles[(i - 1 + n) % n];
      const p1 = particles[i];
      const p2 = particles[(i + 1) % n];
      const p3 = particles[(i + 2) % n];

      for (let s = 0; s < SUBDIVISIONS; s++) {
        const t = s / SUBDIVISIONS;
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