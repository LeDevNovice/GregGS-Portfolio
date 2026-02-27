export const paintExplosionFrag = /* glsl */`
precision highp float;

#define NUM_BLOBS 10

varying vec2 vUv;

uniform vec2  u_blob_pos[NUM_BLOBS];
uniform float u_blob_r[NUM_BLOBS];
uniform float u_aspect;
uniform float u_time;
uniform float u_global_alpha;
uniform vec3  u_color;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i),                  hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float amplitude = 0.5;
  mat2 rot = mat2(
    cos(0.5), sin(0.5),
   -sin(0.5), cos(0.5)
  );
  for (int i = 0; i < 3; i++) {
    v += amplitude * vnoise(p);
    p  = rot * p * 2.1;
    amplitude *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;

  float noise = fbm(uv * 5.5 + u_time * 0.22) - 0.5;
  vec2 displaced = uv + vec2(noise * 0.04);

  float field = 0.0;

  for (int i = 0; i < NUM_BLOBS; i++) {
    float r = u_blob_r[i];

    if (r < 0.0008) continue;

    vec2 d = displaced - u_blob_pos[i];
    d.x *= u_aspect;

    float dist2 = dot(d, d);

    field += (r * r) / (dist2 + 0.00005);
  }

  float paintAlpha = smoothstep(0.82, 1.18, field);

  gl_FragColor = vec4(u_color, paintAlpha * u_global_alpha);
}
`;