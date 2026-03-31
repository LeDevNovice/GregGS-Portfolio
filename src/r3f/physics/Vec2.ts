export interface Vec2 {
  x: number;
  y: number;
}

export function vec2(x = 0, y = 0): Vec2 {
  return { x, y };
}

export function addV(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subV(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scaleV(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s };
}

export function lenV(a: Vec2): number {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

export function normV(a: Vec2): Vec2 {
  const l = lenV(a);
  return l > 0.0001 ? scaleV(a, 1 / l) : vec2();
}

export function copyV(a: Vec2): Vec2 {
  return { x: a.x, y: a.y };
}

export function lerpV(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}