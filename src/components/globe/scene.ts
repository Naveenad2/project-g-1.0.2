import {
  BufferAttribute,
  BufferGeometry,
  CubicBezierCurve3,
  Group,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { LAND_POINTS } from './landPoints';

const DEG = Math.PI / 180;
const FOV = 30;

export type GlobeVariant = 'hero' | 'art' | 'horizon';

export interface GlobeOptions {
  variant: GlobeVariant;
  reducedMotion: boolean;
  dark: boolean;
  /** Always use the navy palette (for globes placed on navy panels). */
  forceDark?: boolean;
  /** Scroll-linked transition, 0 → 1, read on every frame. */
  progress?: { current: number };
  onReady?: () => void;
}

export interface GlobeHandle {
  setTheme(dark: boolean): void;
  setActive(active: boolean): void;
  resize(): void;
  dispose(): void;
}

/* The regulators named on the site: RBI and SEBI (Mumbai), IRDAI (Hyderabad), CBUAE and ADGM (Abu Dhabi),
   DFSA (Dubai), SAMA (Riyadh), CBB (Manama), QFCRA (Doha) and FATF (Paris). */
const HUBS: [number, number][] = [
  [19.08, 72.88],
  [17.39, 78.49],
  [24.45, 54.38],
  [25.2, 55.27],
  [24.71, 46.68],
  [26.23, 50.59],
  [25.29, 51.53],
  [48.86, 2.35],
];

const ARCS: [number, number][] = [
  [7, 0],
  [0, 3],
  [7, 4],
  [1, 2],
  [7, 3],
  [0, 6],
  [4, 2],
  [1, 5],
  [0, 4],
  [1, 7],
  [6, 3],
];

/** Where each variant looks, how far away it sits and how its axis is rolled. */
const FRAMING: Record<GlobeVariant, { lat: number; lng: number; roll: number; fill: number }> = {
  hero: { lat: 26, lng: 64, roll: -0.26, fill: 0.74 },
  art: { lat: 22, lng: 58, roll: -0.24, fill: 0.72 },
  horizon: { lat: -4, lng: 56, roll: -0.12, fill: 0.8 },
};

type V3 = [number, number, number];
const hex = (h: string): V3 => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

interface Palette {
  fill: V3;
  shade: V3;
  rim: V3;
  warm: V3;
  grid: V3;
  gridA: number;
  dot: V3;
  dotLimb: V3;
  dotHot: V3;
  dotA: number;
  arcA: V3;
  arcB: V3;
  arcHead: V3;
  arcAlpha: number;
  hub: V3;
  hubCore: V3;
  orbit: V3;
  orbitA: number;
  comet: V3;
  halo: V3;
  haloWarm: V3;
  haloA: number;
}

const LIGHT: Palette = {
  fill: hex('#ffffff'),
  shade: hex('#d7eee8'),
  rim: hex('#b4e6df'),
  warm: hex('#ffd2a6'),
  grid: hex('#0f2d3d'),
  gridA: 0.07,
  dot: hex('#0d5f66'),
  dotLimb: hex('#7fcac3'),
  dotHot: hex('#ff8a24'),
  dotA: 0.82,
  arcA: hex('#ff8a24'),
  arcB: hex('#00b3aa'),
  arcHead: hex('#ffd9b0'),
  arcAlpha: 1,
  hub: hex('#ff8a24'),
  hubCore: hex('#ffffff'),
  orbit: hex('#0f2d3d'),
  orbitA: 0.2,
  comet: hex('#00b3aa'),
  halo: hex('#00b3aa'),
  haloWarm: hex('#ff8a24'),
  haloA: 0.34,
};

const DARK: Palette = {
  fill: hex('#15435a'),
  shade: hex('#0b2735'),
  rim: hex('#2a8f92'),
  warm: hex('#8a5a2e'),
  grid: hex('#edf9f6'),
  gridA: 0.06,
  dot: hex('#7fe9df'),
  dotLimb: hex('#2a7f84'),
  dotHot: hex('#ffb066'),
  dotA: 0.86,
  arcA: hex('#ff9a40'),
  arcB: hex('#3fd0c6'),
  arcHead: hex('#fff1e0'),
  arcAlpha: 1,
  hub: hex('#ff9a40'),
  hubCore: hex('#fff6ec'),
  orbit: hex('#edf9f6'),
  orbitA: 0.18,
  comet: hex('#5ee0d6'),
  halo: hex('#00b3aa'),
  haloWarm: hex('#ff8a24'),
  haloA: 0.5,
};

function latLng(lat: number, lng: number, r = 1): Vector3 {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return new Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function decodeLand(): Float32Array {
  const bin = atob(LAND_POINTS);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const pairs = new Int16Array(bytes.buffer);
  const out = new Float32Array((pairs.length / 2) * 3);
  for (let i = 0, j = 0; i < pairs.length; i += 2, j += 3) {
    const v = latLng(pairs[i] / 100, pairs[i + 1] / 100, 1.004);
    out[j] = v.x;
    out[j + 1] = v.y;
    out[j + 2] = v.z;
  }
  return out;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/* ── Shaders ─────────────────────────────────────────── */

const SPHERE_VS = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vLocal;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  vLocal = position;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const SPHERE_FS = /* glsl */ `
uniform vec3 uFill;
uniform vec3 uShade;
uniform vec3 uRim;
uniform vec3 uWarm;
uniform vec3 uGrid;
uniform float uGridA;
varying vec3 vN;
varying vec3 vV;
varying vec3 vLocal;
void main() {
  vec3 n = normalize(vN);
  float f = 1.0 - clamp(dot(n, normalize(vV)), 0.0, 1.0);
  float l = clamp(dot(n, normalize(vec3(-0.55, 0.72, 0.5))) * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uShade, uFill, smoothstep(0.12, 0.95, l));
  float warm = clamp(dot(n, normalize(vec3(0.78, -0.5, 0.3))), 0.0, 1.0);
  col = mix(col, uWarm, pow(f, 2.0) * warm * 0.95);
  col = mix(col, uRim, pow(f, 2.6) * (1.0 - warm * 0.55));
  vec3 p = normalize(vLocal);
  vec2 g = vec2(asin(clamp(p.y, -1.0, 1.0)), atan(p.z, p.x)) / 0.2617994;
  vec2 w = fwidth(g);
  vec2 dist = abs(fract(g - 0.5) - 0.5) / max(w, vec2(1e-4));
  float line = 1.0 - min(min(dist.x, dist.y), 1.0);
  col = mix(col, uGrid, line * uGridA * (1.0 - f * f));
  gl_FragColor = vec4(col, 1.0);
}`;

const DOT_VS = /* glsl */ `
attribute float aRand;
uniform float uScale;
uniform float uDot;
varying float vFacing;
varying float vRand;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vFacing = dot(normalize(wp.xyz), normalize(cameraPosition - wp.xyz));
  vRand = aRand;
  vec4 mv = viewMatrix * wp;
  gl_PointSize = uScale * uDot / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const DOT_FS = /* glsl */ `
uniform vec3 uFront;
uniform vec3 uLimb;
uniform vec3 uHot;
uniform float uTime;
uniform float uAlpha;
varying float vFacing;
varying float vRand;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.3, 0.5, d)) * smoothstep(0.0, 0.4, vFacing);
  if (a < 0.01) discard;
  vec3 col = mix(uLimb, uFront, smoothstep(0.05, 0.75, vFacing));
  float tw = step(0.92, vRand) * pow(0.5 + 0.5 * sin(uTime * (0.5 + vRand) + vRand * 91.0), 14.0);
  col = mix(col, uHot, tw);
  gl_FragColor = vec4(col, a * uAlpha);
}`;

const HALO_VS = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const HALO_FS = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uWarm;
uniform float uAlpha;
uniform float uRadius;
uniform vec2 uRes;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * 4.0;
  float d = length(p) / uRadius;
  if (d < 0.96) discard;
  float x = max(d - 1.0, 0.0);
  float glow = exp(-pow(x / 0.075, 2.0)) * 0.9 + exp(-x / 0.1) * 0.32;
  float side = dot(normalize(p), normalize(vec2(0.8, -0.6))) * 0.5 + 0.5;
  vec3 col = mix(uColor, uWarm, smoothstep(0.5, 1.0, side));
  vec2 s = gl_FragCoord.xy / uRes;
  float edge = smoothstep(0.0, 0.1, min(min(s.x, 1.0 - s.x), min(s.y, 1.0 - s.y)));
  gl_FragColor = vec4(col, glow * uAlpha * edge * smoothstep(0.96, 1.0, d));
}`;

const ARC_VS = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const ARC_FS = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uHead;
uniform float uDraw;
uniform float uTime;
uniform float uSpeed;
uniform float uOffset;
uniform float uAlpha;
varying vec2 vUv;
void main() {
  float t = vUv.x;
  if (t > uDraw) discard;
  vec3 col = mix(uA, uB, smoothstep(0.0, 1.0, t));
  float head = fract(uTime * uSpeed + uOffset) * 1.4 - 0.2;
  float trail = smoothstep(head - 0.22, head, t) * (1.0 - smoothstep(head, head + 0.01, t));
  float a = 0.62 + trail * 0.38;
  col = mix(col, uHead, trail * 0.75);
  float tip = (1.0 - smoothstep(0.0, 0.06, uDraw - t)) * (1.0 - step(0.999, uDraw));
  col = mix(col, uHead, tip);
  a = max(a, tip);
  gl_FragColor = vec4(col, a * uAlpha);
}`;

const HUB_VS = /* glsl */ `
attribute float aPhase;
attribute float aStart;
uniform float uScale;
uniform float uSize;
uniform float uTime;
varying float vPhase;
varying float vFacing;
varying float vOn;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vFacing = dot(normalize(wp.xyz), normalize(cameraPosition - wp.xyz));
  vPhase = aPhase;
  vOn = clamp((uTime - aStart) / 0.7, 0.0, 1.0);
  vec4 mv = viewMatrix * wp;
  gl_PointSize = uScale * uSize / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const HUB_FS = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uCore;
uniform float uTime;
varying float vPhase;
varying float vFacing;
varying float vOn;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float on = vOn * vOn * (3.0 - 2.0 * vOn);
  float dot1 = 1.0 - smoothstep(0.12, 0.18, d / max(on, 0.001));
  float core = 1.0 - smoothstep(0.04, 0.08, d / max(on, 0.001));
  float halo = (1.0 - smoothstep(0.12, 0.36, d)) * 0.3 * on;
  float t = fract(uTime * 0.38 + vPhase);
  float ring = (1.0 - smoothstep(0.0, 0.045, abs(d - mix(0.16, 0.96, t)))) * (1.0 - t) * on;
  float a = max(max(dot1, halo), ring * 0.8) * smoothstep(0.0, 0.25, vFacing);
  if (a < 0.01) discard;
  vec3 col = mix(uColor, uCore, core * 0.85);
  gl_FragColor = vec4(col, a);
}`;

const ORBIT_VS = /* glsl */ `
attribute float aT;
uniform float uScale;
uniform float uSize;
uniform float uTime;
uniform float uSpeed;
varying float vComet;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec4 mv = viewMatrix * wp;
  float d = fract(uTime * uSpeed - aT);
  vComet = 1.0 - smoothstep(0.0, 0.14, d);
  gl_PointSize = uScale * uSize * (1.0 + vComet * 1.5) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const ORBIT_FS = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uComet;
uniform float uAlpha;
uniform vec2 uRes;
varying float vComet;
void main() {
  float d = length(gl_PointCoord - 0.5);
  vec2 s = gl_FragCoord.xy / uRes;
  float edge = smoothstep(0.0, 0.12, min(min(s.x, 1.0 - s.x), min(s.y, 1.0 - s.y)));
  float a = (1.0 - smoothstep(0.28, 0.5, d)) * edge;
  if (a < 0.01) discard;
  gl_FragColor = vec4(mix(uColor, uComet, vComet), a * mix(uAlpha, 0.95, vComet));
}`;

/* ── Scene ──────────────────────────────────────────── */

export function createGlobe(canvas: HTMLCanvasElement, opts: GlobeOptions): GlobeHandle | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  const { variant, reducedMotion, progress, onReady, forceDark } = opts;
  const frame = FRAMING[variant];
  const hero = variant === 'hero';
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  const tanHalf = Math.tan((FOV / 2) * DEG);
  const baseDist = Math.sqrt(1 + Math.pow(1 / (frame.fill * tanHalf), 2));

  // roll → tilt → spin, so the spin turns about the earth's own axis
  const roll = new Group();
  const tilt = new Group();
  const spin = new Group();
  roll.add(tilt);
  tilt.add(spin);
  scene.add(roll);

  const scale = { value: 1 };
  const time = { value: 0 };
  const res = { value: new Vector2(1, 1) };
  let palette = opts.dark || forceDark ? DARK : LIGHT;

  // Atmosphere halo, always facing the camera
  const haloMat = new ShaderMaterial({
    vertexShader: HALO_VS,
    fragmentShader: HALO_FS,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new Vector3(...palette.halo) },
      uWarm: { value: new Vector3(...palette.haloWarm) },
      uAlpha: { value: palette.haloA },
      uRadius: { value: 1.03 },
      uRes: res,
    },
  });
  const halo = new Mesh(new PlaneGeometry(4, 4), haloMat);
  halo.renderOrder = -1;
  scene.add(halo);

  // Porcelain sphere with a faint graticule
  const sphereMat = new ShaderMaterial({
    vertexShader: SPHERE_VS,
    fragmentShader: SPHERE_FS,
    uniforms: {
      uFill: { value: new Vector3(...palette.fill) },
      uShade: { value: new Vector3(...palette.shade) },
      uRim: { value: new Vector3(...palette.rim) },
      uWarm: { value: new Vector3(...palette.warm) },
      uGrid: { value: new Vector3(...palette.grid) },
      uGridA: { value: palette.gridA },
    },
  });
  const sphere = new Mesh(new SphereGeometry(1, 128, 96), sphereMat);
  spin.add(sphere);

  // Land as a field of dots
  const landPos = decodeLand();
  const landGeo = new BufferGeometry();
  landGeo.setAttribute('position', new BufferAttribute(landPos, 3));
  const rand = new Float32Array(landPos.length / 3);
  for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
  landGeo.setAttribute('aRand', new BufferAttribute(rand, 1));
  const dotMat = new ShaderMaterial({
    vertexShader: DOT_VS,
    fragmentShader: DOT_FS,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uScale: scale,
      uDot: { value: 0.0122 },
      uTime: time,
      uFront: { value: new Vector3(...palette.dot) },
      uLimb: { value: new Vector3(...palette.dotLimb) },
      uHot: { value: new Vector3(...palette.dotHot) },
      uAlpha: { value: palette.dotA },
    },
  });
  const land = new Points(landGeo, dotMat);
  land.renderOrder = 1;
  spin.add(land);

  // Arcs between the regulators
  const arcStart = (i: number) => (reducedMotion ? -10 : 1.25 + i * 0.17);
  const ARC_DUR = 1.5;
  const arcs = ARCS.map(([a, b], i) => {
    const s = latLng(HUBS[a][0], HUBS[a][1], 1.006);
    const e = latLng(HUBS[b][0], HUBS[b][1], 1.006);
    const ang = s.angleTo(e);
    const h = Math.min(0.46, 0.07 + ang * 0.34);
    const c1 = s
      .clone()
      .lerp(e, 0.25)
      .normalize()
      .multiplyScalar(1 + h);
    const c2 = s
      .clone()
      .lerp(e, 0.75)
      .normalize()
      .multiplyScalar(1 + h);
    const geo = new TubeGeometry(new CubicBezierCurve3(s, c1, c2, e), 120, hero ? 0.0056 : 0.006, 8, false);
    const mat = new ShaderMaterial({
      vertexShader: ARC_VS,
      fragmentShader: ARC_FS,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uA: { value: new Vector3(...palette.arcA) },
        uB: { value: new Vector3(...palette.arcB) },
        uHead: { value: new Vector3(...palette.arcHead) },
        uDraw: { value: reducedMotion ? 1 : 0 },
        uTime: time,
        uSpeed: { value: 0.16 + ((i * 37) % 10) / 100 },
        uOffset: { value: ((i * 0.618) % 1) as number },
        uAlpha: { value: palette.arcAlpha },
      },
    });
    const mesh = new Mesh(geo, mat);
    mesh.renderOrder = 2;
    spin.add(mesh);
    return { mesh, mat, start: arcStart(i) };
  });

  // Hub markers, appearing as their first arc sets off
  const hubPos = new Float32Array(HUBS.length * 3);
  const hubPhase = new Float32Array(HUBS.length);
  const hubStart = new Float32Array(HUBS.length);
  HUBS.forEach(([lat, lng], i) => {
    const v = latLng(lat, lng, 1.008);
    hubPos.set([v.x, v.y, v.z], i * 3);
    hubPhase[i] = (i * 0.37) % 1;
    const first = ARCS.findIndex(([a, b]) => a === i || b === i);
    hubStart[i] = reducedMotion ? -10 : arcStart(Math.max(0, first)) + (ARCS[first]?.[0] === i ? 0 : ARC_DUR * 0.8);
  });
  const hubGeo = new BufferGeometry();
  hubGeo.setAttribute('position', new BufferAttribute(hubPos, 3));
  hubGeo.setAttribute('aPhase', new BufferAttribute(hubPhase, 1));
  hubGeo.setAttribute('aStart', new BufferAttribute(hubStart, 1));
  const hubMat = new ShaderMaterial({
    vertexShader: HUB_VS,
    fragmentShader: HUB_FS,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uScale: scale,
      uSize: { value: hero ? 0.13 : 0.15 },
      uTime: time,
      uColor: { value: new Vector3(...palette.hub) },
      uCore: { value: new Vector3(...palette.hubCore) },
    },
  });
  const hubs = new Points(hubGeo, hubMat);
  hubs.renderOrder = 3;
  spin.add(hubs);

  // Two dotted orbits with a travelling light on each
  const orbitMats: ShaderMaterial[] = [];
  const orbitGroup = new Group();
  const orbitSpecs = [
    { r: 1.13, tx: 1.18, tz: 0.42, speed: 0.045, n: 300 },
    { r: 1.24, tx: 1.38, tz: -0.62, speed: -0.032, n: 340 },
  ];
  for (const o of orbitSpecs) {
    const pos = new Float32Array(o.n * 3);
    const t = new Float32Array(o.n);
    for (let i = 0; i < o.n; i++) {
      const a = (i / o.n) * Math.PI * 2;
      pos.set([Math.cos(a) * o.r, 0, Math.sin(a) * o.r], i * 3);
      t[i] = o.speed > 0 ? i / o.n : 1 - i / o.n;
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('aT', new BufferAttribute(t, 1));
    const mat = new ShaderMaterial({
      vertexShader: ORBIT_VS,
      fragmentShader: ORBIT_FS,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uScale: scale,
        uSize: { value: 0.0085 },
        uTime: time,
        uSpeed: { value: Math.abs(o.speed) },
        uColor: { value: new Vector3(...palette.orbit) },
        uComet: { value: new Vector3(...palette.comet) },
        uAlpha: { value: palette.orbitA },
        uRes: res,
      },
    });
    orbitMats.push(mat);
    const pts = new Points(geo, mat);
    pts.rotation.set(o.tx, 0, o.tz);
    pts.renderOrder = 2;
    orbitGroup.add(pts);
  }
  roll.add(orbitGroup);

  // ── Framing and motion ──
  const pointer = new Vector2();
  const pointerNow = new Vector2();
  let smoothProgress = progress?.current ?? 0;
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
  if (hero && !reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true });

  const pose = (t: number) => {
    const intro = reducedMotion ? 1 : easeOutExpo(clamp01(t / 3.2));
    const turn = reducedMotion ? 1 : easeInOutCubic(clamp01(t / 3.4));
    const p = reducedMotion ? 0 : (smoothProgress += ((progress?.current ?? 0) - smoothProgress) * 0.14);
    pointerNow.lerp(pointer, 0.045);
    const sway = reducedMotion ? 0 : Math.sin(t * 0.085) * 0.09;

    spin.rotation.y = -(frame.lng + 90) * DEG + (1 - turn) * -1.9 + sway + p * (hero ? 0.62 : 0.3);
    tilt.rotation.x = frame.lat * DEG + (1 - turn) * 0.35 - p * 0.14;
    roll.rotation.z = frame.roll;
    roll.rotation.x = pointerNow.y * 0.05;
    roll.rotation.y = pointerNow.x * 0.09;
    orbitGroup.rotation.y = t * 0.02;

    const dist = baseDist * (1 + (1 - intro) * 0.85) * (1 - p * (hero ? 0.2 : 0.1));
    const rise = (1 - easeOutCubic(clamp01(t / 2.6))) * 0.55;
    camera.position.set(0, rise, dist);
    camera.lookAt(0, rise, 0);
    halo.position.set(0, 0, 0);
    halo.lookAt(camera.position);
    haloMat.uniforms.uRadius.value = 1 / Math.sqrt(1 - 1 / (dist * dist));

    for (const arc of arcs) arc.mat.uniforms.uDraw.value = reducedMotion ? 1 : easeInOutCubic(clamp01((t - arc.start) / ARC_DUR));
  };

  const touch = window.matchMedia('(hover: none)').matches;
  const resize = () => {
    const parent = canvas.parentElement;
    const w = Math.max(1, parent?.clientWidth ?? canvas.clientWidth);
    const h = Math.max(1, parent?.clientHeight ?? canvas.clientHeight);
    // keep the drawing buffer within what phones and tablets will allocate
    const budget = (touch ? 1500 : 2600) / Math.max(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, hero ? 1.75 : 1.5, Math.max(1, budget)));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const v = new Vector2();
    renderer.getDrawingBufferSize(v);
    scale.value = v.y / (2 * tanHalf);
    res.value.copy(v);
  };

  const render = () => {
    pose(time.value);
    renderer.render(scene, camera);
  };

  let raf = 0;
  let active = false;
  let last = 0;
  let ready = false;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    time.value += dt;
    render();
    if (!ready) {
      ready = true;
      onReady?.();
    }
  };

  const applyPalette = () => {
    sphereMat.uniforms.uFill.value.set(...palette.fill);
    sphereMat.uniforms.uShade.value.set(...palette.shade);
    sphereMat.uniforms.uRim.value.set(...palette.rim);
    sphereMat.uniforms.uWarm.value.set(...palette.warm);
    sphereMat.uniforms.uGrid.value.set(...palette.grid);
    sphereMat.uniforms.uGridA.value = palette.gridA;
    dotMat.uniforms.uFront.value.set(...palette.dot);
    dotMat.uniforms.uLimb.value.set(...palette.dotLimb);
    dotMat.uniforms.uHot.value.set(...palette.dotHot);
    dotMat.uniforms.uAlpha.value = palette.dotA;
    for (const { mat } of arcs) {
      mat.uniforms.uA.value.set(...palette.arcA);
      mat.uniforms.uB.value.set(...palette.arcB);
      mat.uniforms.uHead.value.set(...palette.arcHead);
      mat.uniforms.uAlpha.value = palette.arcAlpha;
    }
    hubMat.uniforms.uColor.value.set(...palette.hub);
    hubMat.uniforms.uCore.value.set(...palette.hubCore);
    for (const m of orbitMats) {
      m.uniforms.uColor.value.set(...palette.orbit);
      m.uniforms.uComet.value.set(...palette.comet);
      m.uniforms.uAlpha.value = palette.orbitA;
    }
    haloMat.uniforms.uColor.value.set(...palette.halo);
    haloMat.uniforms.uWarm.value.set(...palette.haloWarm);
    haloMat.uniforms.uAlpha.value = palette.haloA;
  };

  resize();
  if (reducedMotion) {
    time.value = 12;
    render();
    ready = true;
    onReady?.();
  }

  return {
    setTheme(dark) {
      palette = dark || forceDark ? DARK : LIGHT;
      applyPalette();
      if (!active || reducedMotion) render();
    },
    setActive(next) {
      if (reducedMotion) {
        if (next) render();
        return;
      }
      if (next === active) return;
      active = next;
      if (active) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
      }
    },
    resize() {
      resize();
      if (!active || reducedMotion) render();
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      scene.traverse((obj) => {
        const m = obj as Mesh;
        m.geometry?.dispose();
        const mat = m.material as ShaderMaterial | undefined;
        mat?.dispose?.();
      });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
