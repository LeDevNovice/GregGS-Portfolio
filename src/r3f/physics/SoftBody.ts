import {
  Vec2,
  vec2,
  addV,
  subV,
  scaleV,
  lenV,
  normV,
  copyV,
} from './Vec2';

export const NUM_PARTICLES = 12;

const DAMPING = 0.88;

const CONSTRAINT_ITERATIONS = 3;

const RADIAL_STIFFNESS = 0.3;

const SHAPE_STIFFNESS = 0.5;

interface Particle {
  pos: Vec2;
  prevPos: Vec2;
  force: Vec2;
}

export class SoftBody {
  private particles: Particle[] = [];
  private _center: Vec2;
  public baseRadius: number;
  public targetRadius: number;

  constructor(center: Vec2, baseRadius: number) {
    this._center = copyV(center);
    this.baseRadius = baseRadius;
    this.targetRadius = baseRadius;
    this._initParticles(center, baseRadius);
  }

  get center(): Vec2 {
    return this._center;
  }

  private _initParticles(center: Vec2, radius: number): void {
    this.particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const angle = (i / NUM_PARTICLES) * Math.PI * 2;
      const pos = vec2(
        center.x + Math.cos(angle) * radius,
        center.y + Math.sin(angle) * radius,
      );
      this.particles.push({
        pos: copyV(pos),
        prevPos: copyV(pos),
        force: vec2(),
      });
    }
  }

  public teleport(center: Vec2, radius?: number): void {
    this._center = copyV(center);
    const r = radius ?? this.targetRadius;
    this.targetRadius = r;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const angle = (i / NUM_PARTICLES) * Math.PI * 2;
      const pos = vec2(
        this._center.x + Math.cos(angle) * r,
        this._center.y + Math.sin(angle) * r,
      );
      this.particles[i].pos = copyV(pos);
      this.particles[i].prevPos = copyV(pos);
      this.particles[i].force = vec2();
    }
  }

  public addRadialImpulse(magnitude: number): void {
    for (const p of this.particles) {
      const dir = normV(subV(p.pos, this._center));
      p.force = addV(p.force, scaleV(dir, magnitude));
    }
  }

  public addLateralImpulse(x: number, y: number): void {
    for (const p of this.particles) {
      p.force.x += x;
      p.force.y += y;
    }
  }

  public addBreathingForce(time: number, magnitude: number): void {
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const phase = (i / NUM_PARTICLES) * Math.PI * 2;
      const wave1 = Math.sin(time * 0.6 + phase) * 0.6;
      const wave2 = Math.sin(time * 1.0 + phase * 1.37) * 0.4;
      const v = wave1 + wave2;
      const dir = normV(subV(this.particles[i].pos, this._center));
      this.particles[i].force = addV(
        this.particles[i].force,
        scaleV(dir, v * magnitude),
      );
    }
  }

  public step(dt: number): void {
    const n = NUM_PARTICLES;

    for (const p of this.particles) {
      const vel = scaleV(subV(p.pos, p.prevPos), DAMPING);
      p.prevPos = copyV(p.pos);
      p.pos = addV(addV(p.pos, vel), p.force);
      p.force = vec2();
    }

    const restChord = 2 * this.targetRadius * Math.sin(Math.PI / n);

    for (let iter = 0; iter < CONSTRAINT_ITERATIONS; iter++) {
      for (const p of this.particles) {
        const toP = subV(p.pos, this._center);
        const dist = lenV(toP);
        if (dist < 0.001) continue;
        const correction = (dist - this.targetRadius) * RADIAL_STIFFNESS;
        p.pos = subV(p.pos, scaleV(scaleV(toP, 1 / dist), correction));
      }

      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const pi = this.particles[i];
        const pj = this.particles[j];
        const delta = subV(pj.pos, pi.pos);
        const dist = lenV(delta);
        if (dist < 0.001) continue;
        const correction = ((dist - restChord) / dist) * SHAPE_STIFFNESS * 0.5;
        const move = scaleV(delta, correction);
        pi.pos = addV(pi.pos, move);
        pj.pos = subV(pj.pos, move);
      }
    }
  }

  public positions(): Vec2[] {
    return this.particles.map(p => p.pos);
  }
}