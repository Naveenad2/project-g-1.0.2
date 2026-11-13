import {
  BufferAttribute,
  BufferGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export interface StoryOptions {
  reducedMotion: boolean;
  dark: boolean;
  desktop: boolean;
  /** Annotation elements (data-k = anchor key, data-c = chapter) positioned over the canvas every frame. */
  labels: HTMLElement[];
  onReady?: () => void;
}

export interface StoryHandle {
  /** Story position: -1 (intro) … 0–9 (chapters) … 10–11 (closing view). */
  setProgress(t: number): void;
  setLayout(desktop: boolean): void;
  runImpact(): void;
  setTheme(dark: boolean): void;
  setActive(active: boolean): void;
  resize(): void;
  dispose(): void;
}

const N = 10;
const TAU = Math.PI * 2;
const R = 10; // radius of the ring of capabilities

type V3 = [number, number, number];
const hex = (h: string): V3 => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

type Role = 'porcelain' | 'ink' | 'teal' | 'deep' | 'tan' | 'aqua' | 'mute' | 'paper';
interface Palette extends Record<Role, V3> {
  shadeMul: number;
  sky: V3;
  ground: V3;
  spec: number;
  gloss: number;
  rim: V3;
  rimA: number;
  glass: V3;
  glassRim: V3;
  glassA: number;
  dots: V3;
  dotsA: number;
  lineA: V3;
  lineB: V3;
  head: V3;
  flash: V3;
  shadow: V3;
  shadowA: number;
  slot: V3;
  slotA: number;
  bg: V3;
}

const LIGHT: Palette = {
  porcelain: hex('#ffffff'),
  paper: hex('#eef4f2'),
  ink: hex('#0f2d3d'),
  teal: hex('#00b3aa'),
  deep: hex('#00807a'),
  tan: hex('#ff8a24'),
  aqua: hex('#5ee0d6'),
  mute: hex('#d0dcd9'),
  shadeMul: 0.82,
  sky: [1, 1, 1],
  ground: [0.86, 0.9, 0.9],
  spec: 0.32,
  gloss: 56,
  rim: hex('#8adbd1'),
  rimA: 0.55,
  glass: hex('#e1f5f1'),
  glassRim: hex('#ffffff'),
  glassA: 0.62,
  dots: hex('#0f2d3d'),
  dotsA: 0.2,
  lineA: hex('#ff8a24'),
  lineB: hex('#00b3aa'),
  head: hex('#ffe3c2'),
  flash: hex('#ff8a24'),
  shadow: hex('#0f2d3d'),
  shadowA: 0.12,
  slot: hex('#00a59c'),
  slotA: 0.5,
  bg: hex('#f2faf7'),
};

const DARK: Palette = {
  porcelain: hex('#1f546c'),
  paper: hex('#18465c'),
  ink: hex('#eaf6f4'),
  teal: hex('#2bd1c6'),
  deep: hex('#0aa89e'),
  tan: hex('#ff9a40'),
  aqua: hex('#7fe9df'),
  mute: hex('#2e6074'),
  shadeMul: 0.62,
  sky: [1.06, 1.12, 1.14],
  ground: [0.7, 0.76, 0.8],
  spec: 0.22,
  gloss: 48,
  rim: hex('#3fd0c6'),
  rimA: 0.5,
  glass: hex('#2a6c83'),
  glassRim: hex('#a6ebe4'),
  glassA: 0.5,
  dots: hex('#edf9f6'),
  dotsA: 0.15,
  lineA: hex('#ff9a40'),
  lineB: hex('#3fd0c6'),
  head: hex('#fff1e0'),
  flash: hex('#ff9a40'),
  shadow: hex('#000000'),
  shadowA: 0.3,
  slot: hex('#3fd0c6'),
  slotA: 0.45,
  bg: hex('#0f2d3d'),
};

/* ── Shaders ─────────────────────────────────────────── */

const SOLID_VS = /* glsl */ `
uniform vec3 uColor;
varying vec3 vN;
varying vec3 vV;
varying vec3 vC;
varying vec3 vW;
void main() {
  vec4 p = vec4(position, 1.0);
  vec3 n = normal;
#ifdef USE_INSTANCING
  p = instanceMatrix * p;
  n = mat3(instanceMatrix) * n;
#endif
  vec4 wp = modelMatrix * p;
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * n);
  vV = normalize(cameraPosition - wp.xyz);
#ifdef USE_INSTANCING_COLOR
  vC = instanceColor;
#else
  vC = uColor;
#endif
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

/* Glossy porcelain: wrapped key light, sky/ground ambient, two specular lobes and a teal rim */
const SOLID_FS = /* glsl */ `
uniform float uShadeMul;
uniform vec3 uSky;
uniform vec3 uGround;
uniform float uSpec;
uniform float uGloss;
uniform vec3 uRim;
uniform float uRimA;
uniform vec3 uFlashColor;
uniform float uFlash;
uniform float uOpacity;
uniform vec3 uFocus;
uniform float uFocusR;
uniform vec3 uBg;
varying vec3 vN;
varying vec3 vV;
varying vec3 vC;
varying vec3 vW;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vV);
  vec3 l1 = normalize(vec3(-0.45, 0.86, 0.38));
  vec3 l2 = normalize(vec3(0.72, 0.32, 0.62));
  float wrap = clamp(dot(n, l1) * 0.5 + 0.5, 0.0, 1.0);
  vec3 amb = mix(uGround, uSky, n.y * 0.5 + 0.5);
  vec3 col = vC * mix(uShadeMul, 1.0, smoothstep(0.0, 1.0, wrap)) * amb;
  col += vC * clamp(dot(n, l2), 0.0, 1.0) * 0.05;
  float s1 = pow(max(dot(n, normalize(l1 + v)), 0.0), uGloss);
  float s2 = pow(max(dot(n, normalize(l2 + v)), 0.0), uGloss * 0.55);
  col += (s1 + s2 * 0.35) * uSpec;
  float f = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);
  col = mix(col, uRim, f * uRimA);
  col = mix(col, uFlashColor, uFlash * (0.45 + 0.55 * f));
  float fade = smoothstep(uFocusR, uFocusR * 2.4, distance(vW, uFocus)) * 0.72 * (1.0 - uFlash);
  col = mix(col, uBg, fade);
  gl_FragColor = vec4(col, uOpacity);
}`;

const GLASS_VS = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

/* Liquid glass: fresnel rim, a slow sheen sweeping across, and a sharp specular glint */
const GLASS_FS = /* glsl */ `
uniform vec3 uTint;
uniform vec3 uRimC;
uniform float uOpacity;
uniform float uTime;
uniform vec3 uFlashColor;
uniform float uFlash;
uniform vec3 uFocus;
uniform float uFocusR;
varying vec3 vN;
varying vec3 vV;
varying vec3 vW;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vV);
  if (dot(n, v) < 0.0) n = -n;
  float f = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.2);
  float s = fract(vW.x * 0.16 + vW.y * 0.3 - uTime * 0.035);
  float sheen = smoothstep(0.44, 0.5, s) * (1.0 - smoothstep(0.5, 0.56, s));
  float glint = pow(max(dot(n, normalize(normalize(vec3(-0.45, 0.86, 0.38)) + v)), 0.0), 90.0);
  vec3 col = mix(uTint, uRimC, clamp(f * 0.9 + sheen * 0.6, 0.0, 1.0)) + glint * 0.85;
  col = mix(col, uFlashColor, uFlash * 0.6);
  float a = uOpacity * clamp(0.24 + f * 0.64 + sheen * 0.3 + glint * 0.6 + uFlash * 0.3, 0.0, 1.0);
  a *= 1.0 - smoothstep(uFocusR, uFocusR * 2.4, distance(vW, uFocus)) * 0.65;
  gl_FragColor = vec4(col, a);
}`;

const LINE_VS = /* glsl */ `
varying vec2 vUv;
varying vec3 vW;
varying vec3 vN;
varying vec3 vV;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

/* Light lines: signature gradient, travelling pulses, an impact wave; optional soft halo */
const LINE_FS = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uHead;
uniform float uDraw;
uniform float uTime;
uniform float uSpeed;
uniform float uOffset;
uniform float uAlpha;
uniform float uWave;
uniform float uHalo;
uniform vec3 uFocus;
uniform float uFocusR;
varying vec2 vUv;
varying vec3 vW;
varying vec3 vN;
varying vec3 vV;
void main() {
  float t = vUv.x;
  if (t > uDraw) discard;
  vec3 col = mix(uA, uB, t);
  float head = fract(uTime * uSpeed + uOffset) * 1.3 - 0.15;
  float trail = smoothstep(head - 0.2, head, t) * (1.0 - smoothstep(head, head + 0.012, t));
  float wave = 1.0 - smoothstep(0.0, 0.08, abs(t - uWave));
  col = mix(col, uHead, max(trail * 0.75, wave));
  float a = max(0.62 + trail * 0.38, wave);
  float edge = abs(dot(normalize(vN), normalize(vV)));
  a *= mix(1.0, pow(edge, 2.0) * 0.32, uHalo);
  a *= 1.0 - smoothstep(uFocusR, uFocusR * 2.6, distance(vW, uFocus)) * 0.6 * (1.0 - wave);
  gl_FragColor = vec4(col, a * uAlpha);
}`;

const DOTS_VS = /* glsl */ `
attribute float aR;
uniform float uScale;
uniform float uSize;
uniform float uMax;
varying float vR;
void main() {
  vR = aR;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = min(uScale * uSize / -mv.z, uMax);
  gl_Position = projectionMatrix * mv;
}`;

const DOTS_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
uniform float uRadius;
varying float vR;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.28, 0.5, d)) * (1.0 - smoothstep(uRadius * 0.42, uRadius, vR));
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a * uAlpha);
}`;

/* Light motes drifting up through the scene (all motion on the GPU) */
const MOTE_VS = /* glsl */ `
attribute vec3 aSeed;
uniform float uTime;
uniform float uScale;
uniform float uMax;
varying float vA;
varying float vMix;
void main() {
  vec3 p = position;
  float h = mod(p.y + uTime * (0.12 + aSeed.x * 0.22), 7.0);
  p.y = h;
  p.x += sin(uTime * 0.3 + aSeed.y * 6.2832) * 0.35;
  p.z += cos(uTime * 0.26 + aSeed.y * 6.2832) * 0.35;
  vA = smoothstep(0.0, 1.2, h) * (1.0 - smoothstep(5.0, 7.0, h));
  vMix = aSeed.z;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = min(uScale * (0.035 + aSeed.z * 0.04) / -mv.z, uMax);
  gl_Position = projectionMatrix * mv;
}`;

const MOTE_FS = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform float uAlpha;
varying float vA;
varying float vMix;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.1, 0.5, d)) * vA * uAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(mix(uA, uB, step(0.7, vMix)), a);
}`;

const FLAT_VS = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const SHADOW_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = 1.0 - smoothstep(0.15, 1.0, d);
  gl_FragColor = vec4(uColor, a * a * uAlpha);
}`;

const FLAT_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
void main() {
  gl_FragColor = vec4(uColor, uAlpha);
}`;

/* ── Easing ─────────────────────────────────────────── */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const backOut = (x: number) => {
  const c = 1.55;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
const stagger = (a: number, i: number, step: number, span: number) => clamp01((a - i * step) / span);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ── Camera keys ────────────────────────────────────── */

interface Key {
  t: number;
  theta: number;
  radius: number;
  height: number;
  target: Vector3;
}

const slotAngle = (slot: number) => (slot * TAU) / 8;
const ringKey = (t: number, slot: number): Key => {
  const a = slotAngle(slot);
  return { t, theta: a + 0.2, radius: R + 7.6, height: 4.6, target: new Vector3(Math.sin(a) * R * 0.94, 1.2, Math.cos(a) * R * 0.94) };
};

/** chapter → where its capability is built */
const CHAPTERS: ({ ring: number } | { center: true } | { overview: true })[] = [
  { ring: 0 },
  { center: true },
  { ring: 1 },
  { ring: 2 },
  { ring: 3 },
  { ring: 4 },
  { ring: 5 },
  { ring: 6 },
  { overview: true },
  { ring: 7 },
];

function buildKeys(): Key[] {
  const keys: Key[] = [{ t: -1, theta: -0.5, radius: 30, height: 23, target: new Vector3(0, 0.4, 0) }];
  CHAPTERS.forEach((c, i) => {
    const t = i + 0.45;
    if ('ring' in c) keys.push(ringKey(t, c.ring));
    else if ('center' in c) keys.push({ t, theta: 0.6, radius: 10.2, height: 6.6, target: new Vector3(0, 0.6, 0) });
    else keys.push({ t, theta: slotAngle(6) + 0.62, radius: 23, height: 29, target: new Vector3(0, 0, 0) });
  });
  keys.push({ t: N + 0.95, theta: slotAngle(7) + 0.95, radius: 27, height: 20, target: new Vector3(0, 0.6, 0) });
  return keys;
}

/* ── Scene ──────────────────────────────────────────── */

interface Mod {
  group: Group;
  mats: ShaderMaterial[];
  update(a: number, time: number): void;
  /** Re-apply palette-derived instance colours after a theme change. */
  onTheme?(): void;
}

export function createStory(canvas: HTMLCanvasElement, opts: StoryOptions): StoryHandle | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  const touch = window.matchMedia('(hover: none)').matches;
  const reduced = opts.reducedMotion;
  let desktop = opts.desktop;
  let pal = opts.dark ? DARK : LIGHT;
  const SEG = touch ? 24 : 40;

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 200);

  /* Shared uniforms */
  const time = { value: 0 };
  const scale = { value: 1 };
  const maxPt = { value: 4 };
  const focus = { value: new Vector3() };
  const focusR = { value: 100 };
  const v3 = (c: V3) => new Vector3(c[0], c[1], c[2]);
  const bgCol = { value: v3(pal.bg) };
  const sky = { value: v3(pal.sky) };
  const ground = { value: v3(pal.ground) };
  const specU = { value: pal.spec };
  const glossU = { value: pal.gloss };
  const shadeU = { value: pal.shadeMul };
  const rimU = { value: v3(pal.rim) };
  const rimAU = { value: pal.rimA };
  const flashC = { value: v3(pal.flash) };

  const solidMats: { m: ShaderMaterial; role: Role }[] = [];
  const glassMats: ShaderMaterial[] = [];
  const lineMats: ShaderMaterial[] = [];
  const flatMats: { m: ShaderMaterial; key: 'shadow' | 'tan' | 'mute' | 'slot' }[] = [];

  const solid = (role: Role, opacity = 1) => {
    const m = new ShaderMaterial({
      vertexShader: SOLID_VS,
      fragmentShader: SOLID_FS,
      transparent: opacity < 1,
      uniforms: {
        uColor: { value: v3(pal[role]) },
        uShadeMul: shadeU,
        uSky: sky,
        uGround: ground,
        uSpec: specU,
        uGloss: glossU,
        uRim: rimU,
        uRimA: rimAU,
        uFlashColor: flashC,
        uFlash: { value: 0 },
        uOpacity: { value: opacity },
        uFocus: focus,
        uFocusR: focusR,
        uBg: bgCol,
      },
    });
    solidMats.push({ m, role });
    return m;
  };
  const glass = (opacity = 1) => {
    const m = new ShaderMaterial({
      vertexShader: GLASS_VS,
      fragmentShader: GLASS_FS,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      uniforms: {
        uTint: { value: v3(pal.glass) },
        uRimC: { value: v3(pal.glassRim) },
        uOpacity: { value: pal.glassA * opacity },
        uTime: time,
        uFlashColor: flashC,
        uFlash: { value: 0 },
        uFocus: focus,
        uFocusR: focusR,
      },
    });
    m.userData.opacity = opacity;
    glassMats.push(m);
    return m;
  };
  const line = (speed = 0.22, offset = 0, halo = 0) => {
    const m = new ShaderMaterial({
      vertexShader: LINE_VS,
      fragmentShader: LINE_FS,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uA: { value: v3(pal.lineA) },
        uB: { value: v3(pal.lineB) },
        uHead: { value: v3(pal.head) },
        uDraw: { value: reduced ? 1 : 0 },
        uTime: time,
        uSpeed: { value: speed },
        uOffset: { value: offset },
        uAlpha: { value: 1 },
        uWave: { value: -1 },
        uHalo: { value: halo },
        uFocus: focus,
        uFocusR: focusR,
      },
    });
    lineMats.push(m);
    return m;
  };
  const flat = (key: 'shadow' | 'tan' | 'mute' | 'slot', alpha: number) => {
    const soft = key === 'shadow' || key === 'slot';
    const color = key === 'shadow' ? pal.shadow : key === 'tan' ? pal.tan : key === 'slot' ? pal.slot : pal.mute;
    const m = new ShaderMaterial({
      vertexShader: FLAT_VS,
      fragmentShader: soft ? SHADOW_FS : FLAT_FS,
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: v3(color) }, uAlpha: { value: key === 'shadow' ? pal.shadowA * alpha : alpha } },
    });
    m.userData.k = alpha;
    flatMats.push({ m, key });
    return m;
  };

  const kit = () => {
    const mats: ShaderMaterial[] = [];
    return {
      mats,
      solid: (role: Role, opacity = 1) => {
        const m = solid(role, opacity);
        mats.push(m);
        return m;
      },
      glass: (opacity = 1) => {
        const m = glass(opacity);
        mats.push(m);
        return m;
      },
    };
  };

  /* Geometry helpers */
  const rbCache = new Map<string, RoundedBoxGeometry>();
  const rb = (w: number, h: number, d: number, r = 0.06) => {
    const k = `${w}|${h}|${d}|${r}`;
    let g = rbCache.get(k);
    if (!g) {
      g = new RoundedBoxGeometry(w, h, d, touch ? 3 : 4, Math.min(r, w / 2, h / 2, d / 2));
      rbCache.set(k, g);
    }
    return g;
  };
  const sphereGeo = new SphereGeometry(1, SEG, Math.round(SEG * 0.66));
  const linkGeo = new CylinderGeometry(1, 1, 1, 12, 1);
  const shadowGeo = new PlaneGeometry(1, 1);
  const coneGeo = new ConeGeometry(1, 1, 18);

  const mesh = (g: BufferGeometry, m: Material, parent: Object3D, x = 0, y = 0, z = 0) => {
    const o = new Mesh(g, m);
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  const ball = (m: Material, parent: Object3D, r: number, x = 0, y = 0, z = 0) => {
    const o = mesh(sphereGeo, m, parent, x, y, z);
    o.scale.setScalar(r);
    return o;
  };
  const anchors = new Map<string, Object3D>();
  const anchor = (parent: Object3D, key: string, x: number, y: number, z: number) => {
    const o = new Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    anchors.set(key, o);
    return o;
  };
  const UP = new Vector3(0, 1, 0);
  const tmp = new Vector3();
  const link = (m: Material, parent: Object3D, radius: number) => {
    const o = mesh(linkGeo, m, parent);
    o.userData.r = radius;
    return o;
  };
  const setLink = (o: Mesh, a: Vector3, b: Vector3, k: number) => {
    tmp.subVectors(b, a);
    const len = tmp.length();
    o.position.copy(a).addScaledVector(tmp, 0.5 * k);
    o.scale.set(o.userData.r, Math.max(1e-4, len * k), o.userData.r);
    o.quaternion.setFromUnitVectors(UP, tmp.normalize());
    o.visible = k > 0.001;
  };
  const softShadow = (parent: Object3D, w: number, d: number, alpha = 1) => {
    const o = mesh(shadowGeo, flat('shadow', alpha), parent, 0, 0.012, 0);
    o.rotation.x = -Math.PI / 2;
    o.scale.set(w, d, 1);
    o.renderOrder = -2;
    return o;
  };
  const pop = (o: Object3D, k: number, base = 1) => {
    o.scale.setScalar(Math.max(0.0001, base * backOut(clamp01(k))));
    o.visible = k > 0.001;
  };

  /* Floor: dots fading into the page, two faint orbits */
  const RADIUS = 18;
  const floorPts: number[] = [];
  const floorR: number[] = [];
  const STEP = touch ? 0.7 : 0.6;
  for (let x = -RADIUS; x <= RADIUS; x += STEP) {
    for (let z = -RADIUS; z <= RADIUS; z += STEP) {
      const r = Math.hypot(x, z);
      if (r > RADIUS) continue;
      floorPts.push(x, 0, z);
      floorR.push(r);
    }
  }
  const floorGeo = new BufferGeometry();
  floorGeo.setAttribute('position', new BufferAttribute(new Float32Array(floorPts), 3));
  floorGeo.setAttribute('aR', new BufferAttribute(new Float32Array(floorR), 1));
  const dotsMat = new ShaderMaterial({
    vertexShader: DOTS_VS,
    fragmentShader: DOTS_FS,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uScale: scale,
      uSize: { value: 0.045 },
      uMax: maxPt,
      uColor: { value: v3(pal.dots) },
      uAlpha: { value: pal.dotsA },
      uRadius: { value: RADIUS },
    },
  });
  const floor = new Points(floorGeo, dotsMat);
  floor.renderOrder = -3;
  scene.add(floor);
  const orbitMat = flat('mute', 0.9);
  for (const r of [4.6, R + 2.8]) {
    const o = mesh(new RingGeometry(r - 0.012, r + 0.012, 180), orbitMat, scene, 0, 0.004, 0);
    o.rotation.x = -Math.PI / 2;
    o.renderOrder = -2;
  }

  /* Light motes */
  const MOTES = touch ? 140 : 320;
  const motePos = new Float32Array(MOTES * 3);
  const moteSeed = new Float32Array(MOTES * 3);
  for (let i = 0; i < MOTES; i++) {
    const a = Math.random() * TAU;
    const r = 2.5 + Math.random() * 13;
    motePos.set([Math.cos(a) * r, Math.random() * 7, Math.sin(a) * r], i * 3);
    moteSeed.set([Math.random(), Math.random(), Math.random()], i * 3);
  }
  const moteGeo = new BufferGeometry();
  moteGeo.setAttribute('position', new BufferAttribute(motePos, 3));
  moteGeo.setAttribute('aSeed', new BufferAttribute(moteSeed, 3));
  const moteMat = new ShaderMaterial({
    vertexShader: MOTE_VS,
    fragmentShader: MOTE_FS,
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: time, uScale: scale, uMax: maxPt, uA: { value: v3(pal.teal) }, uB: { value: v3(pal.tan) }, uAlpha: { value: 0.5 } },
  });
  const motes = new Points(moteGeo, moteMat);
  motes.renderOrder = 7;
  scene.add(motes);

  /* The document every capability works on */
  const doc = new Group();
  scene.add(doc);
  const docKit = kit();
  softShadow(doc, 6.4, 6.4, 0.9);
  mesh(new CylinderGeometry(2.2, 2.3, 0.22, SEG * 2), docKit.glass(0.9), doc, 0, 0.11, 0).renderOrder = 2;
  const rim = mesh(new TorusGeometry(2.2, 0.016, 8, SEG * 3), docKit.solid('teal'), doc, 0, 0.225, 0);
  rim.rotation.x = Math.PI / 2;
  const paperM = docKit.solid('paper');
  const under1 = mesh(rb(2.5, 0.05, 3.3, 0.06), paperM, doc, 0.07, 0.36, 0.06);
  under1.rotation.y = 0.035;
  const under2 = mesh(rb(2.5, 0.05, 3.3, 0.06), paperM, doc, 0.13, 0.3, 0.11);
  under2.rotation.y = 0.07;
  const sheet = new Group();
  sheet.position.y = 0.48;
  doc.add(sheet);
  mesh(rb(2.5, 0.1, 3.3, 0.06), docKit.solid('porcelain'), sheet);
  const inkM = docKit.solid('ink');
  const muteM = docKit.solid('mute');
  const tanM = docKit.solid('tan');
  mesh(rb(1.1, 0.03, 0.16, 0.03), inkM, sheet, -0.5, 0.06, -1.32);
  mesh(rb(0.6, 0.025, 0.08, 0.03), muteM, sheet, -0.75, 0.06, -1.12);
  [1.9, 1.7, 1.45].forEach((w, i) => mesh(rb(w, 0.025, 0.1, 0.03), muteM, sheet, -0.95 + w / 2, 0.06, -0.9 + i * 0.2));
  mesh(rb(2.08, 0.035, 0.36, 0.05), tanM, sheet, 0, 0.066, -0.12);
  mesh(rb(0.14, 0.05, 0.36, 0.03), inkM, sheet, -1.02, 0.07, -0.12);
  [1.95, 2.0, 1.6, 1.8].forEach((w, i) => mesh(rb(w, 0.025, 0.1, 0.03), muteM, sheet, -0.95 + w / 2, 0.06, 0.32 + i * 0.2));
  [docKit.solid('teal'), tanM, docKit.solid('deep')].forEach((m, i) => ball(m, sheet, 0.09, -0.92 + i * 0.2, 0.1, 1.32));
  mesh(rb(0.5, 0.04, 0.14, 0.05), docKit.solid('aqua'), sheet, 0.82, 0.06, 1.32);
  const ribbon = mesh(rb(0.16, 0.02, 0.9, 0.01), tanM, sheet, 0.86, 0.075, -1.3);
  ribbon.rotation.x = 0.05;
  anchor(sheet, 'i0', -0.55, 0.32, -0.12);
  anchor(doc, 'i1', 0, 0.2, 2.5);

  /* 1 · Registries */
  function registries(): Mod {
    const g = new Group();
    const k = kit();
    softShadow(g, 4.8, 2.9);
    mesh(rb(3.5, 0.08, 1.95, 0.05), k.glass(1), g, 0, 0.04, 0).renderOrder = 2;
    const colors: Role[] = ['teal', 'tan', 'deep', 'ink', 'aqua'];
    const slabM = k.solid('porcelain');
    const plateM = k.solid('paper');
    const handleM = k.solid('ink');
    const handleGeo = new CapsuleGeometry(0.035, 0.34, 6, 14);
    const rows: Group[] = [];
    colors.forEach((c, i) => {
      const row = new Group();
      g.add(row);
      mesh(rb(3.0, 0.34, 1.45, 0.09), slabM, row);
      mesh(rb(1.15, 0.17, 0.03, 0.04), plateM, row, -0.55, 0, 0.735);
      mesh(rb(0.08, 0.22, 0.05, 0.02), k.solid(c), row, -1.36, 0, 0.735);
      const handle = mesh(handleGeo, handleM, row, 0.78, 0, 0.77);
      handle.rotation.z = Math.PI / 2;
      if (i === 0) {
        mesh(rb(0.42, 0.14, 0.06, 0.06), k.solid('tan'), row, 0.25, 0, 0.75);
        anchor(row, 'r42', 0.25, 0.2, 0.76);
      }
      anchor(row, `r${i}`, 1.6, 0, 0.45);
      rows.push(row);
    });
    const ghost = new Group();
    g.add(ghost);
    mesh(rb(3.0, 0.34, 1.45, 0.09), k.glass(1.2), ghost);
    const plusM = k.solid('teal');
    mesh(rb(0.22, 0.045, 0.04, 0.02), plusM, ghost, -1.12, 0, 0.74);
    mesh(rb(0.045, 0.22, 0.04, 0.02), plusM, ghost, -1.12, 0, 0.74);
    anchor(ghost, 'r5', 1.6, 0, 0.45);
    return {
      group: g,
      mats: k.mats,
      update(a, t) {
        rows.forEach((row, i) => {
          const e = stagger(a, i, 0.09, 0.4);
          row.position.set(0, 0.36 + i * 0.44 + (1 - easeOut(e)) * 0.5 + Math.sin(t * 0.9 + i * 0.6) * 0.012, (1 - easeOut(e)) * -1.8);
          pop(row, e);
        });
        const e = stagger(a, 5, 0.09, 0.4);
        ghost.position.set(0, 0.36 + 5 * 0.44 + Math.sin(t * 0.9 + 3) * 0.02, (1 - easeOut(e)) * -1.8);
        pop(ghost, e);
      },
    };
  }

  /* 2 · Magpie AI, working on the document */
  function magpie(): Mod {
    const g = new Group();
    const k = kit();
    const scan = new Group();
    scan.position.y = 0.95;
    g.add(scan);
    mesh(new PlaneGeometry(2.9, 0.9), k.glass(1.8), scan).renderOrder = 5;
    mesh(rb(2.9, 0.025, 0.025, 0.012), k.solid('teal'), scan, 0, -0.45, 0);
    const spots: [string, Role, Vector3, Vector3][] = [
      ['m0', 'teal', new Vector3(-2.15, 1.55, -1.05), new Vector3(-0.7, 0.6, -0.9)],
      ['m1', 'tan', new Vector3(-2.35, 1.05, 0.55), new Vector3(-0.95, 0.6, -0.12)],
      ['m2', 'teal', new Vector3(2.2, 1.45, -0.8), new Vector3(0.95, 0.6, -0.12)],
      ['m3', 'deep', new Vector3(2.45, 0.95, 0.65), new Vector3(0.9, 0.6, 0.52)],
      ['m4', 'teal', new Vector3(1.75, 1.85, 1.35), new Vector3(0.6, 0.6, 0.92)],
    ];
    const capGeo = new CapsuleGeometry(0.13, 0.5, 8, 20);
    const shellM = k.glass(2);
    const pearlM = k.solid('porcelain');
    const linkM = k.solid('teal', 0.85);
    const tokens = spots.map(([key, role, at, to]) => {
      const tok = new Group();
      g.add(tok);
      const shell = mesh(capGeo, shellM, tok);
      shell.rotation.z = Math.PI / 2;
      shell.renderOrder = 6;
      ball(k.solid(role), tok, 0.085, -0.2, 0, 0);
      ball(pearlM, tok, 0.05, 0.05, 0, 0);
      ball(pearlM, tok, 0.05, 0.22, 0, 0);
      anchor(tok, key, 0, 0.26, 0);
      const ln = link(linkM, g, 0.012);
      return { tok, at, to, ln };
    });
    return {
      group: g,
      mats: k.mats,
      update(a, t) {
        const s = clamp01(a / 0.5);
        scan.visible = s > 0.01 && s < 0.99;
        scan.position.z = lerp(-1.75, 1.75, smoother(s));
        tokens.forEach(({ tok, at, to, ln }, i) => {
          const e = stagger(a - 0.4, i, 0.07, 0.3);
          const bob = Math.sin(t * 1.1 + i * 1.7) * 0.05;
          tok.position.set(lerp(to.x, at.x, easeOut(e)), lerp(to.y, at.y, easeOut(e)) + bob, lerp(to.z, at.z, easeOut(e)));
          pop(tok, e);
          setLink(ln, to, tok.position, clamp01(e * 1.2));
        });
      },
    };
  }

  /* 3 · Linked items */
  function linked(): Mod {
    const g = new Group();
    const k = kit();
    softShadow(g, 3.6, 3.6);
    mesh(new CylinderGeometry(1.05, 1.12, 0.07, SEG * 2), k.glass(1), g, 0, 0.035, 0).renderOrder = 2;
    const stem = link(k.solid('mute'), g, 0.03);
    const hub = ball(k.solid('ink'), g, 0.4, 0, 1.55, 0);
    anchor(hub, 'l0', 0, 1.35, 0);
    const halo = mesh(new TorusGeometry(0.58, 0.012, 8, SEG * 2), k.solid('tan'), g, 0, 1.55, 0);
    const AXIS_X = new Vector3(1, 0, 0);
    const orbit = mesh(new TorusGeometry(1.5, 0.01, 8, SEG * 3), k.solid('mute'), g, 0, 1.55, 0);
    orbit.rotation.x = Math.PI / 2 - 1.1;
    const sats = (
      [
        ['l1', 'teal'],
        ['l2', 'deep'],
        ['l3', 'tan'],
        ['l4', 'aqua'],
      ] as [string, Role][]
    ).map(([key, role], i) => {
      const s = ball(k.solid(role), g, 0.24);
      anchor(s, key, 0, 1.35, 0);
      const ln = link(k.solid('teal', 0.8), g, 0.016);
      return { s, i, ln };
    });
    const center = new Vector3(0, 1.55, 0);
    const base = new Vector3(0, 0.07, 0);
    const p = new Vector3();
    return {
      group: g,
      mats: k.mats,
      update(a, t) {
        const e0 = stagger(a, 0, 0, 0.35);
        pop(hub, e0, 0.4);
        setLink(stem, base, center, easeOut(e0));
        pop(orbit, stagger(a, 1, 0.12, 0.35));
        pop(halo, stagger(a, 1, 0.12, 0.35));
        halo.rotation.set(Math.PI / 2 + Math.sin(t * 0.5) * 0.4, t * 0.4, 0);
        sats.forEach(({ s, i, ln }) => {
          const e = stagger(a, i + 2, 0.1, 0.3);
          const ang = (i / 4) * TAU + t * (reduced ? 0 : 0.22) + 0.4;
          p.set(Math.cos(ang) * 1.5, 0, Math.sin(ang) * 1.5).applyAxisAngle(AXIS_X, -1.1);
          s.position.copy(center).add(p);
          pop(s, e, 0.24);
          setLink(ln, center, s.position, easeOut(e));
        });
      },
    };
  }

  /* 4 · Procedures */
  function procedures(): Mod {
    const g = new Group();
    const k = kit();
    softShadow(g, 4.4, 2.6);
    const board = new Group();
    board.position.set(0, 1.4, 0);
    board.rotation.x = -0.22;
    g.add(board);
    mesh(rb(3.5, 2.4, 0.07, 0.12), k.glass(1), board).renderOrder = 2;
    mesh(rb(3.3, 1.02, 0.02, 0.06), k.glass(0.7), board, 0, 0.56, 0.05).renderOrder = 3;
    mesh(rb(3.3, 1.02, 0.02, 0.06), k.glass(0.7), board, 0, -0.56, 0.05).renderOrder = 3;
    mesh(rb(0.05, 0.8, 0.03, 0.02), k.solid('teal'), board, -1.58, 0.56, 0.08);
    mesh(rb(0.05, 0.8, 0.03, 0.02), k.solid('tan'), board, -1.58, -0.56, 0.08);
    const start = mesh(new CapsuleGeometry(0.13, 0.44, 8, 20), k.solid('ink'), board, -1.05, 0.56, 0.16);
    start.rotation.z = Math.PI / 2;
    const approve = mesh(rb(0.5, 0.5, 0.14, 0.06), k.solid('porcelain'), board, 0.05, 0.56, 0.16);
    approve.rotation.z = Math.PI / 4;
    const end = mesh(new TorusGeometry(0.11, 0.03, 12, 40), k.solid('ink'), board, 0.98, 0.56, 0.16);
    const record = mesh(rb(0.74, 0.32, 0.14, 0.06), k.solid('porcelain'), board, 0.05, -0.56, 0.16);
    const screen = mesh(rb(0.66, 0.44, 0.05, 0.06), k.glass(1.6), board, 1.05, -0.56, 0.14);
    screen.renderOrder = 4;
    const play = mesh(new ConeGeometry(0.1, 0.18, 3), k.solid('tan'), board, 1.07, -0.56, 0.2);
    play.rotation.z = -Math.PI / 2;
    anchor(board, 'p0', -1.05, 0.84, 0.2);
    anchor(board, 'p1', 0.05, 0.94, 0.2);
    anchor(board, 'p2', 0.05, -0.8, 0.2);
    const edgeM = k.solid('ink', 0.8);
    const tipM = k.solid('ink');
    const edges = (
      [
        [new Vector3(-0.78, 0.56, 0.16), new Vector3(-0.24, 0.56, 0.16)],
        [new Vector3(0.33, 0.56, 0.16), new Vector3(0.82, 0.56, 0.16)],
        [new Vector3(0.05, 0.27, 0.16), new Vector3(0.05, -0.36, 0.16)],
        [new Vector3(0.42, -0.56, 0.16), new Vector3(0.68, -0.56, 0.16)],
      ] as [Vector3, Vector3][]
    ).map(([a, b]) => {
      const tip = mesh(coneGeo, tipM, board);
      tip.scale.set(0.045, 0.09, 0.045);
      tip.quaternion.setFromUnitVectors(UP, tmp.subVectors(b, a).normalize());
      return { a, b, o: link(edgeM, board, 0.014), tip };
    });
    const runners = [0, 1, 2].map((i) => ball(k.solid(i ? 'aqua' : 'teal'), board, 0.06 - i * 0.015, 0, 0, 0.24));
    const path = new CatmullRomCurve3([
      new Vector3(-1.05, 0.56, 0.26),
      new Vector3(0.05, 0.56, 0.26),
      new Vector3(0.05, -0.56, 0.26),
      new Vector3(1.0, -0.56, 0.26),
    ]);
    const nodes = [start, approve, end, record, screen, play];
    return {
      group: g,
      mats: k.mats,
      update(a, t) {
        pop(board, stagger(a, 0, 0, 0.3));
        nodes.forEach((n, i) => pop(n, stagger(a, i + 1, 0.07, 0.3)));
        edges.forEach(({ a: p, b, o, tip }, i) => {
          const e = easeOut(stagger(a, i + 3, 0.08, 0.3));
          setLink(o, p, b, e);
          tip.position.lerpVectors(p, b, e);
          tip.visible = e > 0.05;
        });
        runners.forEach((r, i) => {
          r.visible = a > 0.9;
          if (r.visible) path.getPointAt(reduced ? 0.5 : (t * 0.22 - i * 0.025 + 1) % 1, r.position);
        });
      },
    };
  }

  /* 5 · Workflow builder */
  function workflow(): Mod {
    const g = new Group();
    const k = kit();
    softShadow(g, 4.8, 3.1);
    const platform = mesh(rb(3.9, 0.1, 2.5, 0.08), k.glass(1.2), g, 0, 0.3, 0);
    platform.renderOrder = 2;
    const portM = k.solid('teal');
    const nodes = (
      [
        ['w0', 'tan', -1.38],
        ['w1', 'porcelain', -0.46],
        ['w2', 'porcelain', 0.46],
        ['w3', 'teal', 1.38],
      ] as [string, Role, number][]
    ).map(([key, role, x]) => {
      const n = new Group();
      n.position.set(x, 0.55, -0.45);
      g.add(n);
      mesh(rb(0.72, 0.34, 0.38, 0.07), k.solid(role), n);
      ball(portM, n, 0.04, -0.37, 0, 0);
      ball(portM, n, 0.04, 0.37, 0, 0);
      anchor(n, key, 0, 0.32, 0);
      return n;
    });
    const edgeM = k.solid('ink', 0.8);
    const edges = [-0.92, 0, 0.92].map((x) => ({
      a: new Vector3(x - 0.1, 0.55, -0.45),
      b: new Vector3(x + 0.1, 0.55, -0.45),
      o: link(edgeM, g, 0.016),
    }));
    const form = new Group();
    form.position.set(-0.46, 1.04, 0.55);
    g.add(form);
    mesh(rb(0.95, 0.78, 0.04, 0.06), k.glass(1.4), form).renderOrder = 4;
    mesh(rb(0.95, 0.12, 0.05, 0.04), k.solid('deep'), form, 0, 0.33, 0.01);
    const fieldM = k.solid('paper');
    [0.13, -0.06, -0.25].forEach((y) => mesh(rb(0.66, 0.08, 0.03, 0.03), fieldM, form, 0.05, y, 0.03));
    const formLink = link(k.solid('teal', 0.85), g, 0.012);
    const grid = new Group();
    grid.position.set(0.5, 0.42, 0.62);
    g.add(grid);
    const cellM = k.solid('aqua');
    const hotM = k.solid('tan');
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        mesh(rb(0.15, 0.15, 0.15, 0.03), r === 0 && c === 2 ? hotM : cellM, grid, (c - 1) * 0.2, 0.05, (r - 1) * 0.2);
    const people = new Group();
    people.position.set(1.42, 0.36, 0.55);
    g.add(people);
    const personM = k.solid('ink');
    [-0.17, 0.17].forEach((x) => {
      const body = mesh(coneGeo, personM, people, x, 0.12, 0);
      body.scale.set(0.09, 0.22, 0.09);
      ball(personM, people, 0.07, x, 0.3, 0);
    });
    const a1 = new Vector3(-0.46, 0.38, -0.25);
    const b1 = new Vector3(-0.46, 0.66, 0.53);
    return {
      group: g,
      mats: k.mats,
      update(a) {
        pop(platform, stagger(a, 0, 0, 0.3));
        nodes.forEach((n, i) => pop(n, stagger(a, i + 1, 0.08, 0.3)));
        edges.forEach(({ a: p, b, o }, i) => setLink(o, p, b, easeOut(stagger(a, i + 2, 0.08, 0.3))));
        pop(form, stagger(a, 6, 0.08, 0.3));
        setLink(formLink, a1, b1, easeOut(stagger(a, 7, 0.08, 0.25)));
        pop(grid, stagger(a, 7, 0.08, 0.3));
        pop(people, stagger(a, 8, 0.08, 0.25));
      },
    };
  }

  /* 6 · Lifecycle */
  function lifecycle(): Mod {
    const g = new Group();
    const k = kit();
    softShadow(g, 4.6, 2.5);
    mesh(rb(4.1, 0.07, 1.4, 0.05), k.glass(1), g, 0, 0.035, -0.15).renderOrder = 2;
    const xs = [-1.7, -0.85, 0, 0.85, 1.7];
    const pts = xs.map((x) => new Vector3(x, 0.44, -0.35 * (x / 1.7) * (x / 1.7)));
    const capM = k.solid('teal');
    const stops = xs.map((x, i) => {
      const s = new Group();
      s.position.set(pts[i].x, 0.07, pts[i].z);
      g.add(s);
      const h = i === 3 ? 0.34 : 0.2;
      mesh(new CylinderGeometry(0.2, 0.22, h, SEG), k.solid(i === 3 ? 'teal' : i === 4 ? 'mute' : 'porcelain'), s, 0, h / 2, 0);
      if (i < 3) {
        const top = mesh(new TorusGeometry(0.15, 0.018, 8, SEG), capM, s, 0, h + 0.005, 0);
        top.rotation.x = Math.PI / 2;
      }
      anchor(s, `y${i}`, 0, i % 2 ? 0.62 : -0.04, 0.25);
      return s;
    });
    const mainCurve = new CatmullRomCurve3(pts.slice(0, 4));
    const main = mesh(new TubeGeometry(mainCurve, 90, 0.03, 10, false), line(0.3, 0.2), g);
    const tail = mesh(new TubeGeometry(new CatmullRomCurve3(pts.slice(3)), 30, 0.018, 8, false), line(0, 0), g);
    (tail.material as ShaderMaterial).uniforms.uAlpha.value = 0.45;
    const arch = new CatmullRomCurve3([pts[2].clone(), new Vector3(0.42, 1.28, -0.25), pts[3].clone()]);
    const archM = line(0.4, 0.6);
    const archMesh = mesh(new TubeGeometry(arch, 60, 0.018, 8, false), archM, g);
    const board = ball(k.solid('tan'), g, 0.1, 0.42, 1.31, -0.26);
    anchor(board, 'yb', 0, 2.6, 0);
    const lock = new Group();
    lock.position.set(pts[3].x, 0.52, pts[3].z);
    g.add(lock);
    mesh(rb(0.2, 0.15, 0.08, 0.03), k.solid('ink'), lock, 0, 0.08, 0);
    mesh(new TorusGeometry(0.06, 0.018, 8, 20, Math.PI), k.solid('ink'), lock, 0, 0.16, 0);
    const tokens = [0, 1, 2].map((i) => ball(k.solid(i ? 'aqua' : 'tan'), g, 0.12 - i * 0.03));
    anchor(g, 'yv', 0, 0.05, 0.8);
    return {
      group: g,
      mats: k.mats,
      update(a, t) {
        stops.forEach((s, i) => pop(s, stagger(a, i, 0.06, 0.3)));
        const draw = clamp01((a - 0.25) / 0.45);
        (main.material as ShaderMaterial).uniforms.uDraw.value = reduced ? 1 : draw;
        (tail.material as ShaderMaterial).uniforms.uDraw.value = reduced ? 1 : clamp01((a - 0.6) / 0.3);
        archM.uniforms.uDraw.value = reduced ? 1 : clamp01((a - 0.55) / 0.35);
        archMesh.visible = a > 0.55;
        pop(board, clamp01((a - 0.8) / 0.2), 0.1);
        pop(lock, clamp01((a - 0.85) / 0.15));
        tokens.forEach((tok, i) => {
          tok.visible = draw > 0.01;
          mainCurve.getPointAt(Math.max(0, Math.min(0.999, smoother(draw) - i * 0.04)), tok.position);
          tok.position.y += 0.18 + (reduced ? 0 : Math.sin(t * 2) * 0.02);
        });
      },
    };
  }

  /* 7 · Acknowledgement */
  function acknowledgement(): Mod {
    const g = new Group();
    const k = kit();
    softShadow(g, 4.6, 2.5);
    const COLS = 12;
    const ROWS = 6;
    const count = COLS * ROWS;
    const heads = new InstancedMesh(sphereGeo, k.solid('porcelain'), count);
    const bodies = new InstancedMesh(coneGeo, k.solid('porcelain'), count);
    g.add(heads, bodies);
    const due = new Set([17, 40, 58]);
    const m4 = new Matrix4();
    const c = new Color();
    const place = (i: number, s: number) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = -1.85 + (col / (COLS - 1)) * 2.5;
      const y = 0.3 + row * 0.27;
      const z = -0.45 * Math.pow(x / 1.6, 2) - 0.2;
      m4.makeScale(0.06 * s, 0.06 * s, 0.06 * s).setPosition(x, y + 0.1 * s, z);
      heads.setMatrixAt(i, m4);
      m4.makeScale(0.065 * s, 0.12 * s, 0.065 * s).setPosition(x, y, z);
      bodies.setMatrixAt(i, m4);
    };
    const panel = new Group();
    panel.position.set(2.15, 1.15, 0.45);
    panel.rotation.y = -0.45;
    g.add(panel);
    mesh(rb(1.15, 0.95, 0.05, 0.08), k.glass(1.5), panel).renderOrder = 4;
    mesh(rb(1.15, 0.13, 0.06, 0.05), k.solid('deep'), panel, 0, 0.41, 0.005);
    const rowM = k.solid('paper');
    [0.15, -0.09, -0.33].forEach((y, i) => {
      mesh(rb(0.62, 0.07, 0.03, 0.03), rowM, panel, 0.12, y, 0.04);
      ball(k.solid(i === 1 ? 'tan' : 'teal'), panel, 0.055, -0.36, y, 0.05);
      anchor(panel, `a${i + 2}`, -0.44, y, 0.05);
    });
    const badge = ball(k.solid('tan'), panel, 0.1, 0.5, 0.46, 0.07);
    anchor(panel, 'a0', -0.1, 0.56, 0.04);
    anchor(badge, 'a1', 0, 2.2, 0);
    anchor(g, 'a5', -0.3, 0.05, 0.6);
    let last = -1;
    return {
      group: g,
      mats: k.mats,
      onTheme() {
        last = -1;
      },
      update(a) {
        const grow = clamp01(a / 0.5);
        const lit = clamp01((a - 0.35) / 0.55);
        const key = Math.round(grow * 300) + Math.round(lit * 300) * 1000;
        if (key === last) return;
        last = key;
        for (let i = 0; i < count; i++) {
          place(i, Math.max(0.0001, backOut(clamp01(grow * 1.4 - (i / count) * 0.4))));
          const isDue = due.has(i) && lit > 0.5;
          const on = i / count < lit * 0.96;
          heads.setColorAt(i, c.setRGB(...(isDue ? pal.tan : on ? pal.teal : pal.mute)));
          bodies.setColorAt(i, c.setRGB(...(on || isDue ? pal.porcelain : pal.mute)));
        }
        heads.instanceMatrix.needsUpdate = true;
        bodies.instanceMatrix.needsUpdate = true;
        if (heads.instanceColor) heads.instanceColor.needsUpdate = true;
        if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true;
        pop(panel, clamp01((a - 0.45) / 0.35));
      },
    };
  }

  /* 8 · Risk assessment */
  function risk(): Mod {
    const g = new Group();
    const k = kit();
    softShadow(g, 3.8, 3.8);
    mesh(rb(2.6, 0.06, 2.6, 0.05), k.glass(1.1), g, 0, 0.03, 0).renderOrder = 2;
    const cols = new InstancedMesh(rb(0.34, 1, 0.34, 0.05), k.solid('porcelain'), 25);
    g.add(cols);
    const m4 = new Matrix4();
    const c = new Color();
    const heights: number[] = [];
    const scores: number[] = [];
    for (let r = 0; r < 5; r++) {
      for (let q = 0; q < 5; q++) {
        const score = ((r + 1) * (q + 1)) / 25;
        scores.push(score);
        heights.push(0.22 + score * 1.25);
      }
    }
    const paint = () => {
      scores.forEach((score, i) => {
        const pick = score > 0.55 ? pal.tan : score > 0.32 ? ([1, 0.75, 0.48] as V3) : score > 0.14 ? pal.aqua : pal.teal;
        cols.setColorAt(i, c.setRGB(...pick));
      });
      if (cols.instanceColor) cols.instanceColor.needsUpdate = true;
    };
    paint();
    const at = (i: number) => new Vector3(((i % 5) - 2) * 0.44, 0, (Math.floor(i / 5) - 2) * 0.44);
    const markIdx = 13;
    const markPos = at(markIdx);
    const marker = mesh(new TorusGeometry(0.33, 0.024, 12, 56), k.solid('ink'), g, markPos.x, heights[markIdx] + 0.06, markPos.z);
    marker.rotation.x = Math.PI / 2;
    anchor(marker, 'k0', 0, 0, -0.32);
    const pin = link(k.solid('tan'), g, 0.012);
    const card = mesh(rb(0.5, 0.62, 0.03, 0.05), k.glass(1.6), g, 1.62, 0.78, 0.55);
    card.rotation.y = -0.5;
    card.renderOrder = 4;
    const clip = mesh(new TorusGeometry(0.07, 0.013, 8, 28), k.solid('tan'), card, 0.14, 0.3, 0.03);
    clip.rotation.z = 0.4;
    const lineM = k.solid('paper');
    [0.12, 0, -0.12].forEach((y) => mesh(rb(0.32, 0.04, 0.02, 0.02), lineM, card, -0.02, y, 0.025));
    anchor(card, 'k1', 0.28, 0.1, 0);
    anchor(g, 'k2', 0, 0.02, 1.4);
    let last = -1;
    const top = new Vector3();
    const bottom = new Vector3();
    return {
      group: g,
      mats: k.mats,
      onTheme: paint,
      update(a) {
        if (a !== last) {
          last = a;
          for (let i = 0; i < 25; i++) {
            const e = easeOut(stagger(a, i, 0.018, 0.4));
            const p = at(i);
            const h = Math.max(0.0001, heights[i] * e);
            m4.makeScale(1, h, 1).setPosition(p.x, 0.06 + h / 2, p.z);
            cols.setMatrixAt(i, m4);
          }
          cols.instanceMatrix.needsUpdate = true;
        }
        const hm = heights[markIdx] * easeOut(stagger(a, markIdx, 0.018, 0.4));
        marker.position.y = 0.12 + hm;
        pop(marker, clamp01((a - 0.6) / 0.25));
        top.set(markPos.x, 0.56 + hm, markPos.z);
        bottom.set(markPos.x, 0.14 + hm, markPos.z);
        setLink(pin, bottom, top, clamp01((a - 0.7) / 0.2));
        pop(card, clamp01((a - 0.7) / 0.25));
      },
    };
  }

  /* 10 · Reports and dashboards */
  function reports(): Mod {
    const g = new Group();
    const k = kit();
    softShadow(g, 4.6, 2.8);
    mesh(rb(3.5, 0.08, 1.9, 0.06), k.glass(1.2), g, 0, 0.06, 0).renderOrder = 2;
    mesh(rb(3.5, 2.0, 0.04, 0.08), k.glass(0.8), g, 0, 1.08, -0.85).renderOrder = 1;
    const gridM = k.solid('mute', 0.7);
    [0.55, 1.0, 1.45].forEach((y) => mesh(rb(3.2, 0.012, 0.012, 0.004), gridM, g, 0, y, -0.82));
    const H = [0.5, 0.75, 0.62, 1.0, 0.86, 1.2, 0.95, 1.45, 1.05, 1.3];
    const bars = new InstancedMesh(rb(0.2, 1, 0.2, 0.04), k.solid('porcelain'), H.length);
    const dots = new InstancedMesh(sphereGeo, k.solid('porcelain'), H.length);
    g.add(bars, dots);
    const c = new Color();
    const paint = () => {
      H.forEach((_, i) => {
        bars.setColorAt(i, c.setRGB(...(i === 7 ? pal.tan : i % 3 === 0 ? pal.deep : pal.teal)));
        dots.setColorAt(i, c.setRGB(...(i === 7 ? pal.tan : pal.ink)));
      });
      if (bars.instanceColor) bars.instanceColor.needsUpdate = true;
      if (dots.instanceColor) dots.instanceColor.needsUpdate = true;
    };
    paint();
    const m4 = new Matrix4();
    const xs = H.map((_, i) => -1.4 + i * 0.31);
    const pts = H.map((h, i) => new Vector3(xs[i], h + 0.45, -0.45));
    const curve = new CatmullRomCurve3(pts);
    const lineM = line(0.25, 0.4);
    mesh(new TubeGeometry(curve, 140, 0.022, 10, false), lineM, g);
    const donut = new Group();
    donut.position.set(2.1, 0.95, -0.15);
    donut.rotation.y = -0.4;
    g.add(donut);
    mesh(new TorusGeometry(0.42, 0.07, 16, SEG * 2), k.solid('mute'), donut);
    const arcA = mesh(new TorusGeometry(0.42, 0.085, 16, SEG * 2, TAU * 0.58), k.solid('teal'), donut);
    const arcB = mesh(new TorusGeometry(0.27, 0.06, 14, SEG * 2, TAU * 0.26), k.solid('tan'), donut);
    let last = -1;
    return {
      group: g,
      mats: k.mats,
      onTheme: paint,
      update(a, t) {
        if (a !== last) {
          last = a;
          const draw = clamp01((a - 0.35) / 0.5);
          H.forEach((h, i) => {
            const e = easeOut(stagger(a, i, 0.04, 0.4));
            const hh = Math.max(0.0001, h * e);
            m4.makeScale(1, hh, 1).setPosition(xs[i], 0.1 + hh / 2, 0.25);
            bars.setMatrixAt(i, m4);
            const s = draw >= i / (H.length - 1) ? 0.05 : 0.0001;
            m4.makeScale(s, s, s).setPosition(pts[i].x, pts[i].y, pts[i].z);
            dots.setMatrixAt(i, m4);
          });
          bars.instanceMatrix.needsUpdate = true;
          dots.instanceMatrix.needsUpdate = true;
          lineM.uniforms.uDraw.value = reduced ? 1 : draw;
          pop(donut, clamp01((a - 0.5) / 0.3));
        }
        arcA.rotation.z = reduced ? 0 : t * 0.3;
        arcB.rotation.z = reduced ? 0 : -t * 0.45;
      },
    };
  }

  /* Build every capability, set out the blueprint, connect each to the document */
  const builders: (() => Mod)[] = [
    registries,
    magpie,
    linked,
    procedures,
    workflow,
    lifecycle,
    acknowledgement,
    risk,
    () => ({ group: new Group(), mats: [], update() {} }),
    reports,
  ];
  const mods = builders.map((b) => b());
  const links: { mat: ShaderMaterial; halo: ShaderMaterial; chapter: number }[] = [];
  const slots: { ring: Mesh; disc: Mesh; chapter: number }[] = [];
  const guideM = flat('mute', 0.55);
  const slotRingM = new ShaderMaterial({
    vertexShader: FLAT_VS,
    fragmentShader: FLAT_FS,
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: v3(pal.slot) }, uAlpha: { value: pal.slotA } },
  });
  mods.forEach((m, i) => {
    const c = CHAPTERS[i];
    if ('ring' in c) {
      const a = slotAngle(c.ring);
      const sx = Math.sin(a);
      const sz = Math.cos(a);
      m.group.position.set(sx * R, 0, sz * R);
      m.group.rotation.y = a;
      // blueprint: a glowing slot and a faint guide, there before the capability is built
      const slotRing = mesh(new RingGeometry(2.2, 2.24, 120), slotRingM, scene, sx * R, 0.008, sz * R);
      slotRing.rotation.x = -Math.PI / 2;
      slotRing.renderOrder = -1;
      const disc = mesh(shadowGeo, flat('slot', 0.16), scene, sx * R, 0.006, sz * R);
      disc.rotation.x = -Math.PI / 2;
      disc.scale.set(4.6, 4.6, 1);
      disc.renderOrder = -2;
      slots.push({ ring: slotRing, disc, chapter: i });
      const from = new Vector3(sx * (R - 2.3), 0.05, sz * (R - 2.3));
      const to = new Vector3(sx * 2.35, 0.05, sz * 2.35);
      const mid = from
        .clone()
        .lerp(to, 0.5)
        .add(new Vector3(sz * 0.9, 0.18, -sx * 0.9));
      const curve = new CatmullRomCurve3([from, mid, to]);
      mesh(new TubeGeometry(curve, 80, 0.012, 6, false), guideM, scene).renderOrder = -1;
      const mat = line(0.28, i * 0.13);
      const halo = line(0.28, i * 0.13, 1);
      mesh(new TubeGeometry(curve, 80, 0.03, 10, false), mat, scene);
      mesh(new TubeGeometry(curve, 80, 0.11, 12, false), halo, scene).renderOrder = 1;
      links.push({ mat, halo, chapter: i });
    }
    scene.add(m.group);
  });

  /* Impact: shockwaves across the floor */
  const waves = [0, 1, 2].map(() => {
    const m = flat('tan', 0);
    const o = mesh(new RingGeometry(0.96, 1, 160), m, scene, 0, 0.02, 0);
    o.rotation.x = -Math.PI / 2;
    o.renderOrder = 6;
    return { o, m };
  });
  let waveStart = -100;

  /* Annotations */
  const labels = opts.labels.map((el) => ({ el, key: el.dataset.k ?? '', chapter: Number(el.dataset.c), shown: false, x: -1e4, y: -1e4 }));

  /* Camera path */
  const keys = buildKeys();
  const look = new Vector3();
  const pose = (t: number) => {
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const raw = clamp01((t - a.t) / (b.t - a.t));
    const u = reduced ? (raw > 0.5 ? 1 : 0) : smoother(clamp01((raw - 0.26) / 0.48));
    const theta = lerp(a.theta, b.theta, u) + (t > N ? (t - N) * 0.45 : 0);
    const radius = lerp(a.radius, b.radius, u);
    const height = lerp(a.height, b.height, u);
    camera.position.set(Math.sin(theta) * radius, height, Math.cos(theta) * radius);
    look.lerpVectors(a.target, b.target, u);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    focus.value.copy(look);
    focusR.value = 3.6 + Math.max(0, height - 6) * 2.2;
  };

  let tTarget = -1;
  let tNow = -1;
  let width = 1;
  let height = 1;
  let ratioCap = touch ? 1.35 : 1.6;

  const resize = () => {
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    const budget = (touch ? 1400 : 2600) / Math.max(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, ratioCap, Math.max(1, budget)));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = desktop ? 30 : 36;
    if (desktop) camera.setViewOffset(width, height, -width * (width < 1280 ? 0.22 : 0.17), 0, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    const v = new Vector2();
    renderer.getDrawingBufferSize(v);
    scale.value = v.y / (2 * Math.tan((camera.fov * Math.PI) / 360));
    maxPt.value = 3.4 * renderer.getPixelRatio();
  };

  const builds = new Float32Array(N);
  const update = (dt: number) => {
    // ease towards the scroll position, independent of the display's refresh rate
    tNow = reduced ? tTarget : tNow + (tTarget - tNow) * (1 - Math.exp(-dt * 7.5));
    if (Math.abs(tTarget - tNow) < 0.0005) tNow = tTarget;
    const t = tNow;
    const now = time.value;
    pose(t);
    for (let c = 0; c < N; c++) builds[c] = reduced ? (t >= c - 0.2 ? 1 : 0) : clamp01((t - c + 0.2) / 0.6);
    mods.forEach((m, c) => {
      m.group.visible = builds[c] > 0.001;
      if (m.group.visible) m.update(builds[c], reduced ? 0 : now);
    });
    const pulse = reduced ? 0 : 0.5 + 0.5 * Math.sin(now * 1.6);
    slots.forEach(({ ring: rm, disc, chapter }) => {
      const b = builds[chapter];
      rm.scale.setScalar(1 + (1 - b) * pulse * 0.04);
      (disc.material as ShaderMaterial).uniforms.uAlpha.value = 0.16 * (1 - b * 0.6);
    });
    links.forEach(({ mat, halo, chapter }) => {
      const d = reduced ? (builds[chapter] > 0 ? 1 : 0) : clamp01((builds[chapter] - 0.15) / 0.6);
      mat.uniforms.uDraw.value = d;
      halo.uniforms.uDraw.value = d;
    });

    // impact wave
    const w = (now - waveStart) / 2.6;
    const running = w >= 0 && w <= 1.2;
    waves.forEach(({ o, m }, i) => {
      const ww = clamp01(w - i * 0.14);
      o.visible = running && ww > 0 && ww < 1;
      o.scale.setScalar(1.5 + easeOut(ww) * 13);
      m.uniforms.uAlpha.value = (1 - ww) * 0.85;
    });
    const flashAt = (d: number) => (running ? Math.exp(-Math.pow((w - d) / 0.1, 2)) : 0);
    const docFlash = flashAt(0.08);
    docKit.mats.forEach((m) => (m.uniforms.uFlash.value = docFlash));
    mods.forEach((m, c) => {
      const f = c === 1 ? flashAt(0.12) : flashAt(0.5);
      m.mats.forEach((mm) => (mm.uniforms.uFlash.value = f));
    });
    const wave = running ? 1 - clamp01((w - 0.1) / 0.4) : -1;
    links.forEach(({ mat, halo }) => {
      mat.uniforms.uWave.value = wave;
      halo.uniforms.uWave.value = wave;
    });

    // annotations: only the chapter in view, once built and the camera has settled
    const chapter = Math.floor(t);
    const frac = t - chapter;
    const settled = touch ? frac > 0.1 && frac < 0.97 : frac > 0.18 && frac < 0.9;
    for (const L of labels) {
      let show = L.chapter === chapter && settled && chapter >= 0 && chapter < N && builds[chapter] > 0.75;
      const anc = show ? anchors.get(L.key) : undefined;
      if (show && anc) {
        anc.getWorldPosition(tmp);
        tmp.project(camera);
        if (tmp.z > 1 || tmp.x < -1.2 || tmp.x > 1.2 || tmp.y < -1.2 || tmp.y > 1.2) show = false;
        else {
          const x = Math.round((tmp.x * 0.5 + 0.5) * width * 4) / 4;
          const y = Math.round((-tmp.y * 0.5 + 0.5) * height * 4) / 4;
          if (x !== L.x || y !== L.y) {
            L.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            L.x = x;
            L.y = y;
          }
        }
      } else show = false;
      if (show !== L.shown) {
        L.el.style.opacity = show ? '1' : '0';
        L.shown = show;
      }
    }
    renderer.render(scene, camera);
  };

  let raf = 0;
  let active = false;
  let last = 0;
  let ready = false;
  let slow = 0;
  let frames = 0;
  const loop = (ms: number) => {
    raf = requestAnimationFrame(loop);
    const dtMs = Math.min(ms - last, 100);
    last = ms;
    const dt = Math.min(dtMs / 1000, 1 / 20);
    if (!reduced) time.value += dt;
    update(dt);
    if (!ready) {
      ready = true;
      opts.onReady?.();
    }
    // adapt: if frames keep running long, render fewer pixels
    frames++;
    if (dtMs > 26) slow++;
    if (frames >= 90) {
      if (slow > 30 && ratioCap > 1) {
        ratioCap = Math.max(1, ratioCap - 0.2);
        resize();
      }
      frames = 0;
      slow = 0;
    }
  };

  const applyPalette = () => {
    bgCol.value.set(...pal.bg);
    sky.value.set(...pal.sky);
    ground.value.set(...pal.ground);
    specU.value = pal.spec;
    glossU.value = pal.gloss;
    shadeU.value = pal.shadeMul;
    rimU.value.set(...pal.rim);
    rimAU.value = pal.rimA;
    flashC.value.set(...pal.flash);
    solidMats.forEach(({ m, role }) => m.uniforms.uColor.value.set(...pal[role]));
    glassMats.forEach((m) => {
      m.uniforms.uTint.value.set(...pal.glass);
      m.uniforms.uRimC.value.set(...pal.glassRim);
      m.uniforms.uOpacity.value = pal.glassA * (m.userData.opacity as number);
    });
    lineMats.forEach((m) => {
      m.uniforms.uA.value.set(...pal.lineA);
      m.uniforms.uB.value.set(...pal.lineB);
      m.uniforms.uHead.value.set(...pal.head);
    });
    flatMats.forEach(({ m, key }) => {
      const col = key === 'shadow' ? pal.shadow : key === 'tan' ? pal.tan : key === 'slot' ? pal.slot : pal.mute;
      m.uniforms.uColor.value.set(...col);
      if (key === 'shadow') m.uniforms.uAlpha.value = pal.shadowA * (m.userData.k as number);
    });
    slotRingM.uniforms.uColor.value.set(...pal.slot);
    slotRingM.uniforms.uAlpha.value = pal.slotA;
    dotsMat.uniforms.uColor.value.set(...pal.dots);
    dotsMat.uniforms.uAlpha.value = pal.dotsA;
    moteMat.uniforms.uA.value.set(...pal.teal);
    moteMat.uniforms.uB.value.set(...pal.tan);
    mods.forEach((m) => m.onTheme?.());
  };

  resize();
  if (reduced) {
    update(0);
    ready = true;
    opts.onReady?.();
  }

  return {
    setProgress(t) {
      tTarget = t;
      if (reduced && !active) update(0);
    },
    setLayout(next) {
      if (next === desktop) return;
      desktop = next;
      resize();
    },
    runImpact() {
      // Under reduced motion the scene stays still; the result is in the text.
      if (!reduced) waveStart = time.value;
    },
    setTheme(dark) {
      pal = dark ? DARK : LIGHT;
      applyPalette();
      if (!active || reduced) update(0);
    },
    setActive(next) {
      if (reduced) {
        if (next) update(0);
        return;
      }
      if (next === active) return;
      active = next;
      if (active) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else cancelAnimationFrame(raf);
    },
    resize() {
      resize();
      if (!active || reduced) update(0);
    },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const m = o as Mesh;
        m.geometry?.dispose();
        (m.material as Material | undefined)?.dispose?.();
      });
      rbCache.forEach((g) => g.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
