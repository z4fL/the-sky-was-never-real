export const skyVertex = /* glsl */ `
varying vec3 vDirection;
void main() {
  vDirection = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

export const skyFragment = /* glsl */ `
uniform float uNight;
uniform float uQuiet;
varying vec3 vDirection;
float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float skyNoise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(vec3(i,0)),hash(vec3(i+vec2(1,0),0)),f.x),mix(hash(vec3(i+vec2(0,1),0)),hash(vec3(i+1.0,0)),f.x),f.y);
}
void main() {
  vec3 d = normalize(vDirection);
  float h = smoothstep(-0.25, 0.75, d.y);
  vec3 day = mix(vec3(0.75, 0.65, 0.43), vec3(0.19, 0.34, 0.33), h);
  float sun = pow(max(dot(d, normalize(vec3(0.28, 0.27, -1.0))), 0.0), 160.0);
  float haze = pow(max(dot(d, normalize(vec3(0.28, 0.27, -1.0))), 0.0), 6.0);
  day += vec3(0.66, 0.49, 0.25) * haze * 0.38 + vec3(1.0, 0.82, 0.49) * sun;
  float cloud=skyNoise(d.xz*9.0+d.y*4.0)*.65+skyNoise(d.xz*23.0)*.35;
  day+=vec3(.12,.11,.08)*smoothstep(.45,.8,cloud)*smoothstep(-.05,.35,d.y);
  vec3 night = mix(vec3(0.035, 0.018, 0.055), vec3(0.008, 0.018, 0.028), uQuiet);
  float belt = pow(max(0.0, 1.0 - abs(d.x * 0.5 + d.y * 1.3 - 0.3)), 12.0);
  night += vec3(0.038, 0.018, 0.042) * belt;
  vec3 cell = floor(d * 750.0);
  float star = step(0.9985, hash(cell)) * pow(hash(cell + 6.0), 7.0);
  night += star * vec3(0.65, 0.7, 0.76);
  gl_FragColor = vec4(mix(day, night, uNight), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const grassVertex = /* glsl */ `
uniform float uTime;
uniform float uMotion;
varying float vHeight;
varying float vShade;
varying float vDistance;
void main() {
  vec3 p = position;
  vec4 root = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float wind = sin(root.x * 0.19 + root.z * 0.12 + uTime * 0.8);
  p.x += p.y * p.y * (0.24 + wind * 0.19 * uMotion);
  p.z += p.y * p.y * cos(root.x * 0.2 + uTime * 0.6) * 0.13 * uMotion;
  vec4 world = modelMatrix * instanceMatrix * vec4(p, 1.0);
  vec4 mv = viewMatrix * world;
  vHeight = position.y;
  vShade = fract(root.x * 0.7 + root.z * 0.31);
  vDistance = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

export const grassFragment = /* glsl */ `
uniform vec3 uFog;
varying float vHeight;
varying float vShade;
varying float vDistance;
void main() {
  vec3 base = mix(vec3(0.13, 0.17, 0.073), vec3(0.3, 0.28, 0.09), vShade);
  vec3 tip = mix(vec3(0.62, 0.47, 0.17), vec3(0.88, 0.71, 0.37), vShade);
  vec3 color = mix(base, tip, pow(vHeight, 0.65));
  color = mix(color, uFog, smoothstep(28.0, 160.0, vDistance));
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const veilVertex = /* glsl */ `
attribute vec3 aCenter;
attribute vec3 aBary;
attribute float aSeed;
uniform float uFracture;
varying vec3 vBary;
varying vec3 vWorld;
varying float vSeed;
void main() {
  vBary = aBary;
  vSeed = aSeed;
  vec3 local = position - aCenter;
  float opening = pow(uFracture, 1.3);
  float tilt = opening * (aSeed - 0.5) * 1.8;
  mat2 rot = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt));
  local.xy = rot * local.xy;
  vec3 center = aCenter;
  vec2 direction = normalize(center.xz + vec2(0.01));
  center.xz += direction * opening * (24.0 + aSeed * 32.0);
  center.y += opening * (aSeed * 9.0);
  vec3 p = center + local * (1.0 - uFracture * 0.08);
  vWorld = (modelMatrix * vec4(p, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}`;

export const veilFragment = /* glsl */ `
uniform float uFracture;
uniform float uPresence;
varying vec3 vBary;
varying vec3 vWorld;
varying float vSeed;
void main() {
  vec3 width = fwidth(vBary);
  vec3 edge3 = smoothstep(vec3(0.0), width * 1.1, vBary);
  float edge = 1.0 - min(min(edge3.x, edge3.y), edge3.z);
  float veins = sin(vWorld.x * 0.18 + sin(vWorld.z * 0.23) * 2.0) * 0.5 + 0.5;
  vec3 shell = mix(vec3(0.18, 0.27, 0.28), vec3(0.52, 0.58, 0.49), veins * 0.28 + vSeed * 0.25);
  shell *= 0.8 + vSeed * 0.3;
  float reveal = smoothstep(0.0, 0.5, uFracture);
  vec3 seam = mix(vec3(0.38, 0.44, 0.39), vec3(3.6, 2.2, 0.8), reveal);
  gl_FragColor = vec4(mix(shell, seam, edge * (0.18 + reveal * 0.82)), uPresence);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const particleVertex = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uMotion;
uniform float uPixelRatio;
uniform float uCorruption;
varying float vAlpha;
varying float vSeed;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.12 + aSeed * 40.0) * 1.8 * uMotion;
  p.y += sin(uTime * 0.17 + aSeed * 60.0) * 1.0 * uMotion;
  p.z += cos(uTime * 0.12 + aSeed * 50.0) * uMotion;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vAlpha = smoothstep(90.0, 8.0, -mv.z) * (0.3 + aSeed * 0.6);
  vSeed = aSeed;
  gl_PointSize = clamp((24.0 + aSeed * 70.0) / max(1.0, -mv.z), 0.8, 4.0) * uPixelRatio;
  gl_Position = projectionMatrix * mv;
}`;

export const particleFragment = /* glsl */ `
uniform float uCorruption;
varying float vAlpha;
varying float vSeed;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = 1.0 - smoothstep(0.12, 0.5, d);
  vec3 col = mix(vec3(1.4, 1.0, 0.48), vec3(1.7, 0.08, 0.13), uCorruption);
  gl_FragColor = vec4(col, alpha * vAlpha * 0.65);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
