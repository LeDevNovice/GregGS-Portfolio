export const diveFrag = /* glsl */ `
  varying vec2 vUv;

  // Position normalisée (0-1) du centre du trou du "e" sur l'écran
  uniform vec2 u_center;

  // 0.0 = invisible, 1.0 = plein écran blanc
  // Pendant "diving" : 0→1
  // Pendant "surfacing" : 1→0
  uniform float u_progress;

  // Ratio largeur/hauteur de la fenêtre
  uniform float u_aspect;

  void main() {
    vec2 uv = vUv;

    // Distance depuis le centre du "e", corrigée pour l'aspect ratio
    // Sans cette correction, le cercle serait une ellipse sur des écrans non carrés
    vec2 offset = uv - u_center;
    offset.x *= u_aspect;
    float dist = length(offset);

    // Distance maximale depuis u_center jusqu'au coin le plus éloigné de l'écran.
    // Quand radius = maxDist, l'iris couvre tout l'écran.
    float cx = u_center.x * u_aspect;
    float dx = max(cx, u_aspect - cx);
    float cy = u_center.y;
    float dy = max(cy, 1.0 - cy);
    float maxDist = sqrt(dx * dx + dy * dy);

    // Rayon courant de l'iris blanc
    float radius = u_progress * maxDist;

    // Bord doux : le front de l'iris est légèrement flou pour éviter l'aliasing
    float feather = 0.025 + u_progress * 0.015;
    float circleMask = 1.0 - smoothstep(radius - feather, radius + feather, dist);

    // Légère ombre au bord avançant de l'iris (donne une impression de profondeur,
    // comme si l'iris avait de l'épaisseur)
    float edgeShadow = smoothstep(radius, radius - feather * 4.0, dist)
                     * (1.0 - smoothstep(radius - feather * 4.0, radius - feather * 8.0, dist));
    float brightness = 1.0 - edgeShadow * 0.12;

    // Vignette très légère au centre pour suggérer la profondeur du tunnel
    float vignette = 1.0 - smoothstep(0.0, 0.3, dist / (maxDist + 0.001)) * 0.05;
    brightness *= vignette;

    gl_FragColor = vec4(brightness, brightness, brightness, circleMask);
  }
`;