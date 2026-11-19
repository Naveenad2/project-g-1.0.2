import {
  BufferAttribute,
  BufferGeometry,
  AddEquation,
  CatmullRomCurve3,
  Color,
  CustomBlending,
  DoubleSide,
  Euler,
  Group,
  InstancedMesh,
  Material,
  Matrix3,
  Matrix4,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  Scene,
  ShaderMaterial,
  ShapeUtils,
  SrcAlphaFactor,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
  ZeroFactor,
} from 'three';

export interface StoryOptions {
  reducedMotion: boolean;
  dark: boolean;
  desktop: boolean;
  /** Annotation elements (data-k = anchor key, data-c = chapter) positioned over the canvas every frame. */
  labels: HTMLElement[];
  onReady?: () => void;
}

export interface StoryHandle {
  /** Story position: -1 (intro) … 0–9 (chapters) … 10–11 (closing view). `jump`: a tap on the index. */
  setProgress(t: number, jump?: boolean): void;
  setLayout(desktop: boolean): void;
  runImpact(): void;
  setTheme(dark: boolean): void;
  setActive(active: boolean): void;
  resize(): void;
  dispose(): void;
}

const N = 10;
const TAU = Math.PI * 2;
const HALF = Math.PI / 2;
const R = 10; // radius of the ring of capabilities

/* ── Palette ────────────────────────────────────────── */

/**
 * Every model is one matte material; each vertex names a role and the role's colour comes from a uniform
 * array, so a theme change is one uniform update. Faces and edges have their own roles, which is what
 * gives the thin card stock its crisp outline without any extra geometry.
 */
const ROLES = [
  'surf',
  'surfS',
  'paper',
  'paperS',
  'base',
  'baseS',
  'ink',
  'mute',
  'teal',
  'deep',
  'tan',
  'aqua',
  'tanSoft',
  'tealSoft',
  'inkSoft',
  'screen',
] as const;
type RoleName = (typeof ROLES)[number];
const C = Object.fromEntries(ROLES.map((r, i) => [r, i])) as Record<RoleName, number>;
/** Role for instanced parts: the colour comes from the instance. */
const INST = -1;

interface Palette {
  roles: Record<RoleName, string>;
  bg: string;
  lineA: string;
  lineB: string;
  head: string;
  flash: string;
  guide: string;
  slot: string;
  shadow: string;
  grid: string;
  amber: string;
  shadowA: number;
  gridA: number;
}
type ColorKey = RoleName | 'bg' | 'lineA' | 'lineB' | 'head' | 'flash' | 'guide' | 'slot' | 'shadow' | 'grid' | 'amber';

const LIGHT: Palette = {
  roles: {
    surf: '#fdfefe',
    surfS: '#cfe1dd',
    paper: '#eef6f4',
    paperS: '#c6dad6',
    base: '#e4f0ed',
    baseS: '#bcd3ce',
    ink: '#0f2d3d',
    mute: '#c9dbd7',
    teal: '#00b3aa',
    deep: '#00807a',
    tan: '#ff8a24',
    aqua: '#5ee0d6',
    tanSoft: '#ffe9d4',
    tealSoft: '#d3f1ed',
    inkSoft: '#6c8791',
    screen: '#123447',
  },
  bg: '#f2faf7',
  lineA: '#ff8a24',
  lineB: '#00b3aa',
  head: '#ffe3c2',
  flash: '#ff8a24',
  guide: '#7aa7a3',
  slot: '#00a59c',
  shadow: '#0f2d3d',
  grid: '#0f2d3d',
  amber: '#ffbe78',
  shadowA: 0.11,
  gridA: 0.075,
};

const DARK: Palette = {
  roles: {
    surf: '#1c4659',
    surfS: '#0f3142',
    paper: '#22526a',
    paperS: '#133a4c',
    base: '#173f52',
    baseS: '#0c2b3a',
    ink: '#e6f4f1',
    mute: '#3e6f82',
    teal: '#2bd1c6',
    deep: '#12a89e',
    tan: '#ff9a40',
    aqua: '#7fe9df',
    tanSoft: '#5a4533',
    tealSoft: '#1e5d6a',
    inkSoft: '#a6c7c9',
    screen: '#0a2230',
  },
  bg: '#0f2d3d',
  lineA: '#ff9a40',
  lineB: '#3fd0c6',
  head: '#fff1e0',
  flash: '#ff9a40',
  guide: '#6fa9a8',
  slot: '#3fd0c6',
  shadow: '#000000',
  grid: '#edf9f6',
  amber: '#ffb35c',
  shadowA: 0.28,
  gridA: 0.06,
};

const colorOf = (p: Palette, k: ColorKey): string => (k in p.roles ? p.roles[k as RoleName] : p[k as Exclude<ColorKey, RoleName>]);
const rgb = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/* ── Shaders ─────────────────────────────────────────── */

const MATTE_VS = /* glsl */ `
attribute float aRole;
uniform vec3 uPal[${ROLES.length}];
#ifdef ARC
attribute float aArc;
varying float vArc;
#endif
varying vec3 vC;
varying vec3 vN;
varying vec3 vW;
varying float vUp;
void main() {
  vec4 p = vec4(position, 1.0);
  vec3 n = normal;
#ifdef USE_INSTANCING
  p = instanceMatrix * p;
  n = mat3(instanceMatrix) * n;
#endif
  vec4 wp = modelMatrix * p;
  vW = wp.xyz;
  vec3 nw = normalize(mat3(modelMatrix) * n);
  vUp = nw.y;
  vN = normalize(mat3(viewMatrix) * nw);
  vC = uPal[int(max(aRole, 0.0) + 0.5)];
#ifdef USE_INSTANCING_COLOR
  if (aRole < -0.5) vC = instanceColor;
#endif
#ifdef ARC
  vArc = aArc;
#endif
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

/* Matte card stock: a soft key and fill that follow the camera, no specular, no rim */
const MATTE_FS = /* glsl */ `
uniform vec3 uBg;
uniform vec3 uFocus;
uniform float uFocusR;
uniform vec3 uFlashColor;
uniform float uFlash;
#ifdef ARC
uniform float uArc;
varying float vArc;
#endif
varying vec3 vC;
varying vec3 vN;
varying vec3 vW;
varying float vUp;
void main() {
#ifdef ARC
  if (vArc > uArc) discard;
#endif
  vec3 n = normalize(vN);
  float key = max(dot(n, vec3(-0.446, 0.644, 0.621)), 0.0);
  float fill = max(dot(n, vec3(0.717, 0.205, 0.666)), 0.0);
  vec3 col = vC * (0.83 + 0.18 * key + 0.04 * fill + 0.03 * (vUp * 0.5 + 0.5));
  col = mix(col, uFlashColor, uFlash * 0.5);
  float fade = smoothstep(uFocusR, uFocusR * 2.4, distance(vW, uFocus)) * 0.72 * (1.0 - uFlash);
  gl_FragColor = vec4(mix(col, uBg, fade), 1.0);
}`;

/* Hairlines with a constant on-screen width: each vertex is pushed sideways in screen space */
const LINE_VS = /* glsl */ `
attribute vec3 aPrev;
attribute vec3 aNext;
attribute float aSide;
attribute float aT;
attribute float aDist;
attribute float aDelay;
attribute float aSpan;
attribute float aSeed;
attribute float aCh;
uniform vec2 uRes;
uniform float uWidth;
uniform float uDraw;
uniform float uCh[${N}];
varying float vT;
varying float vEdge;
varying float vDist;
varying float vSeed;
varying float vProg;
varying vec3 vW;
vec2 scr(vec4 c) { return c.xy / max(c.w, 1e-4) * 0.5 * uRes; }
void main() {
  mat4 mvp = projectionMatrix * modelViewMatrix;
  vec4 c = mvp * vec4(position, 1.0);
  vec2 s = scr(c);
  vec2 d1 = s - scr(mvp * vec4(aPrev, 1.0));
  vec2 d2 = scr(mvp * vec4(aNext, 1.0)) - s;
  if (dot(d1, d1) < 1e-6) d1 = d2;
  if (dot(d2, d2) < 1e-6) d2 = d1;
  d1 = normalize(d1 + vec2(1e-6, 0.0));
  d2 = normalize(d2 + vec2(1e-6, 0.0));
  vec2 tg = normalize(d1 + d2 + vec2(0.0, 1e-6));
  vec2 nr = vec2(-tg.y, tg.x);
  float miter = 1.0 / max(dot(nr, vec2(-d1.y, d1.x)), 0.6);
  float hw = uWidth * 0.5 + 1.0;
  c.xy += nr * (aSide * hw * miter) * (2.0 / uRes) * c.w;
  gl_Position = c;
  vEdge = aSide * hw;
  vT = aT;
  vDist = aDist;
  vSeed = aSeed;
  float p = aCh > -0.5 ? uCh[int(aCh + 0.5)] : clamp((uDraw - aDelay) / aSpan, 0.0, 1.0);
  vProg = aCh > -0.5 ? p : 1.0 - pow(1.0 - p, 3.0);
  vW = (modelMatrix * vec4(position, 1.0)).xyz;
}`;

/* Signature gradient, a travelling highlight, the impact wave; dashes for blueprints */
const LINE_FS = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uHead;
uniform float uWidth;
uniform float uAlpha;
uniform float uTime;
uniform float uSpeed;
uniform float uWave;
uniform float uDash;
uniform float uMarch;
uniform vec3 uFocus;
uniform float uFocusR;
varying float vT;
varying float vEdge;
varying float vDist;
varying float vSeed;
varying float vProg;
varying vec3 vW;
float dashes(float f, float w) { return smoothstep(0.0, w, f) * (1.0 - smoothstep(0.55 - w, 0.55, f)); }
void main() {
  float hw = uWidth * 0.5;
  float a = 1.0 - smoothstep(hw - 0.5, hw + 0.5, abs(vEdge));
  vec3 col = mix(uA, uB, vT);
#ifdef SLOT
  float built = vProg;
  float w = min(fwidth(vDist / uDash) * 1.5, 0.2);
  a *= mix(dashes(fract((vDist - uTime * 0.3 * (1.0 - built)) / uDash), w), 1.0, built) * mix(0.8, 0.28, built);
#else
  if (vT > vProg) discard;
  if (uDash > 0.0) {
    float w = min(fwidth(vDist / uDash) * 1.5, 0.2);
    a *= dashes(fract((vDist - uTime * uMarch) / uDash), w);
  }
  float head = fract(uTime * uSpeed + vSeed) * 1.3 - 0.15;
  float trail = uSpeed > 0.0 ? smoothstep(head - 0.2, head, vT) * (1.0 - smoothstep(head, head + 0.02, vT)) : 0.0;
  float wave = 1.0 - smoothstep(0.0, 0.08, abs(vT - uWave));
  col = mix(col, uHead, max(trail * 0.85, wave));
  a *= 1.0 - smoothstep(uFocusR, uFocusR * 2.6, distance(vW, uFocus)) * 0.6 * (1.0 - wave);
#endif
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a * uAlpha);
}`;

const UV_VS = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/* Soft contact shadow: a blurred rounded rectangle */
const SHADOW_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
uniform vec2 uSize;
uniform float uSoft;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * uSize;
  vec2 q = abs(p) - (uSize * 0.5 - uSoft) + 0.3;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.3;
  float a = 1.0 - smoothstep(-uSoft, uSoft, d);
  gl_FragColor = vec4(uColor, a * a * uAlpha);
}`;

const FLAT_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
void main() {
  gl_FragColor = vec4(uColor, uAlpha);
}`;

/* The light trailing Magpie's scan line */
const GLOW_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
varying vec2 vUv;
void main() {
  float a = pow(1.0 - vUv.y, 2.2) * (1.0 - pow(abs(vUv.x * 2.0 - 1.0), 8.0));
  gl_FragColor = vec4(uColor, a * uAlpha);
}`;

const WORLD_VS = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

/* Drafting floor: a hairline grid, anti-aliased by its own derivatives, fading into the page */
const GRID_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
uniform float uRadius;
varying vec3 vW;
float grid(vec2 p, float s) {
  vec2 q = p / s;
  vec2 w = fwidth(q);
  vec2 g = abs(fract(q - 0.5) - 0.5) / w;
  return (1.0 - min(min(g.x, g.y), 1.0)) * (1.0 - smoothstep(0.18, 0.45, max(w.x, w.y)));
}
void main() {
  vec2 p = vW.xz;
  float a = max(grid(p, 1.0) * 0.55, grid(p, 4.0));
  a *= (1.0 - smoothstep(uRadius * 0.3, uRadius, length(p))) * uAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor, a);
}`;

/* Multiplies what is already drawn by a fade towards the canvas edges (left, right, bottom, top widths) */
const EDGE_VS = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const EDGE_FS = /* glsl */ `
uniform vec4 uEdge;
varying vec2 vUv;
void main() {
  float a = smoothstep(0.0, uEdge.x, vUv.x) * smoothstep(0.0, uEdge.y, 1.0 - vUv.x);
  a *= smoothstep(0.0, uEdge.z, vUv.y) * smoothstep(0.0, uEdge.w, 1.0 - vUv.y);
  gl_FragColor = vec4(0.0, 0.0, 0.0, a);
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

/* ── Outlines ───────────────────────────────────────── */

type P2 = [number, number];
const near = (a: P2, b: P2) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
const tidy = (p: P2[]): P2[] => {
  const out: P2[] = [];
  for (const q of p) if (!out.length || !near(out[out.length - 1], q)) out.push(q);
  if (out.length > 2 && near(out[0], out[out.length - 1])) out.pop();
  return out;
};
const area = (p: P2[]) => {
  let a = 0;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += p[j][0] * p[i][1] - p[i][0] * p[j][1];
  return a / 2;
};
const ccw = (p: P2[]) => (area(p) < 0 ? [...p].reverse() : p);
const cw = (p: P2[]) => (area(p) > 0 ? [...p].reverse() : p);

/** Rounded rectangle centred on the origin; radii per corner: [bottom-right, top-right, top-left, bottom-left]. */
function rr(w: number, h: number, r: number | [number, number, number, number], seg = 5): P2[] {
  const rs = typeof r === 'number' ? [r, r, r, r] : r;
  const lim = Math.min(w, h) / 2;
  const corners: [number, number, number, number][] = [
    [w / 2, -h / 2, -HALF, rs[0]],
    [w / 2, h / 2, 0, rs[1]],
    [-w / 2, h / 2, HALF, rs[2]],
    [-w / 2, -h / 2, Math.PI, rs[3]],
  ];
  const pts: P2[] = [];
  for (const [cx, cy, a0, rad] of corners) {
    const k = Math.min(rad, lim);
    if (k < 1e-5) {
      pts.push([cx, cy]);
      continue;
    }
    const ox = cx - Math.sign(cx) * k;
    const oy = cy - Math.sign(cy) * k;
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * HALF;
      pts.push([ox + Math.cos(a) * k, oy + Math.sin(a) * k]);
    }
  }
  return tidy(pts);
}

const circle = (r: number, seg = 28): P2[] =>
  Array.from({ length: seg }, (_, i): P2 => [Math.cos((i / seg) * TAU) * r, Math.sin((i / seg) * TAU) * r]);

/** Annulus sector from angle a0 to a1 (counter-clockwise). */
function arcBand(r0: number, r1: number, a0: number, a1: number, seg = 40): P2[] {
  const pts: P2[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = lerp(a0, a1, i / seg);
    pts.push([Math.cos(a) * r1, Math.sin(a) * r1]);
  }
  for (let i = seg; i >= 0; i--) {
    const a = lerp(a0, a1, i / seg);
    pts.push([Math.cos(a) * r0, Math.sin(a) * r0]);
  }
  return tidy(pts);
}

/** A closed polygon with softened corners. */
function soften(p: P2[], r: number, seg = 3): P2[] {
  const out: P2[] = [];
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const v = p[i];
    const a = p[(i - 1 + n) % n];
    const b = p[(i + 1) % n];
    const da = Math.hypot(a[0] - v[0], a[1] - v[1]);
    const db = Math.hypot(b[0] - v[0], b[1] - v[1]);
    const k = Math.min(r, da / 2, db / 2);
    const s: P2 = [v[0] + ((a[0] - v[0]) * k) / da, v[1] + ((a[1] - v[1]) * k) / da];
    const e: P2 = [v[0] + ((b[0] - v[0]) * k) / db, v[1] + ((b[1] - v[1]) * k) / db];
    for (let j = 0; j <= seg; j++) {
      const t = j / seg;
      out.push([
        (1 - t) * (1 - t) * s[0] + 2 * (1 - t) * t * v[0] + t * t * e[0],
        (1 - t) * (1 - t) * s[1] + 2 * (1 - t) * t * v[1] + t * t * e[1],
      ]);
    }
  }
  return tidy(out);
}

/** A 3D path with its corners rounded (for diagram connectors). */
function fillet(pts: Vector3[], r: number, seg = 5): Vector3[] {
  if (pts.length < 3) return pts;
  const out: Vector3[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const v = pts[i];
    const da = v.distanceTo(pts[i - 1]);
    const db = v.distanceTo(pts[i + 1]);
    const k = Math.min(r, da / 2, db / 2);
    const s = v.clone().lerp(pts[i - 1], k / da);
    const e = v.clone().lerp(pts[i + 1], k / db);
    for (let j = 0; j <= seg; j++) {
      const t = j / seg;
      out.push(
        new Vector3()
          .addScaledVector(s, (1 - t) * (1 - t))
          .addScaledVector(v, 2 * (1 - t) * t)
          .addScaledVector(e, t * t),
      );
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/* ── Geometry builders ──────────────────────────────── */

const _v = new Vector3();
const _n = new Vector3();
const _m = new Matrix4();
const _e = new Euler();

/**
 * Builds one merged mesh from flat outlines: thin extruded card stock (face, edge and back each with their
 * own role) and details printed on a face. Everything is placed through a transform stack, so a model is
 * one draw call however much detail it carries.
 */
class Geo {
  private p: number[] = [];
  private n: number[] = [];
  private r: number[] = [];
  private f: number[] = [];
  private i: number[] = [];
  private m = new Matrix4();
  private nm = new Matrix3();
  private stack: Matrix4[] = [];
  private arcAt: ((x: number, y: number) => number) | null = null;
  private hasArc = false;

  get count() {
    return this.p.length / 3;
  }
  save() {
    this.stack.push(this.m.clone());
    return this;
  }
  restore() {
    const m = this.stack.pop();
    if (m) this.m.copy(m);
    this.nm.getNormalMatrix(this.m);
    return this;
  }
  /** Moves the frame: translate, then rotate (XYZ). */
  move(x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) {
    _m.makeRotationFromEuler(_e.set(rx, ry, rz)).setPosition(x, y, z);
    this.m.multiply(_m);
    this.nm.getNormalMatrix(this.m);
    return this;
  }
  /** Tags following vertices with a 0–1 value (used to sweep chart arcs in). */
  arc(fn: ((x: number, y: number) => number) | null) {
    this.arcAt = fn;
    if (fn) this.hasArc = true;
    return this;
  }
  /** A point in the current frame. */
  pt(x: number, y: number, z: number) {
    return new Vector3(x, y, z).applyMatrix4(this.m);
  }
  private v(x: number, y: number, z: number, nx: number, ny: number, nz: number, role: number) {
    _v.set(x, y, z).applyMatrix4(this.m);
    _n.set(nx, ny, nz).applyMatrix3(this.nm).normalize();
    this.p.push(_v.x, _v.y, _v.z);
    this.n.push(_n.x, _n.y, _n.z);
    this.r.push(role);
    this.f.push(this.arcAt ? this.arcAt(x, y) : 0);
  }
  private cap(contour: P2[], holes: P2[][], z: number, role: number, nz: 1 | -1) {
    const faces = ShapeUtils.triangulateShape(
      contour.map(([x, y]) => new Vector2(x, y)),
      holes.map((h) => h.map(([x, y]) => new Vector2(x, y))),
    );
    const k = this.count;
    for (const [x, y] of contour) this.v(x, y, z, 0, 0, nz, role);
    for (const h of holes) for (const [x, y] of h) this.v(x, y, z, 0, 0, nz, role);
    for (const [a, b, c] of faces) {
      if (nz > 0) this.i.push(k + a, k + b, k + c);
      else this.i.push(k + a, k + c, k + b);
    }
  }
  /** Side walls; a loop wound counter-clockwise faces out, a clockwise hole faces into the hole. */
  private walls(loop: P2[], z0: number, z1: number, role: number) {
    const n = loop.length;
    const en: P2[] = loop.map(([x0, y0], i) => {
      const [x1, y1] = loop[(i + 1) % n];
      const l = Math.hypot(x1 - x0, y1 - y0) || 1;
      return [(y1 - y0) / l, -(x1 - x0) / l];
    });
    // smooth across gentle bends (rounded corners), hard across sharp ones
    const at = (i: number, e: number): P2 => {
      const a = en[(i - 1 + n) % n];
      const b = en[i % n];
      if (a[0] * b[0] + a[1] * b[1] < 0.8) return en[e];
      const x = a[0] + b[0];
      const y = a[1] + b[1];
      const l = Math.hypot(x, y) || 1;
      return [x / l, y / l];
    };
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const n0 = at(i, i);
      const n1 = at(j, i);
      const k = this.count;
      this.v(loop[i][0], loop[i][1], z0, n0[0], n0[1], 0, role);
      this.v(loop[j][0], loop[j][1], z0, n1[0], n1[1], 0, role);
      this.v(loop[j][0], loop[j][1], z1, n1[0], n1[1], 0, role);
      this.v(loop[i][0], loop[i][1], z1, n0[0], n0[1], 0, role);
      this.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
    }
  }
  /** An outline extruded from z = 0 (back) to z = d (face). */
  prism(outline: P2[], holes: P2[][], d: number, face: number, side: number, back = face) {
    const c = ccw(outline);
    const hs = holes.map(cw);
    this.cap(c, hs, d, face, 1);
    this.cap(c, hs, 0, back, -1);
    this.walls(c, 0, d, side);
    for (const h of hs) this.walls(h, 0, d, side);
    return this;
  }
  /** A rounded card centred on x/y, back at z = 0 and face at z = d. */
  slab(w: number, h: number, d: number, r: number, face: number, side: number, back = face) {
    return this.prism(rr(w, h, r), [], d, face, side, back);
  }
  /** Printed detail on the face in the current frame. */
  flat(outline: P2[], role: number, holes: P2[][] = [], z = 0.003) {
    this.cap(ccw(outline), holes.map(cw), z, role, 1);
    return this;
  }
  /** A line of "text": a pill centred on cx/cy. */
  bar(cx: number, cy: number, w: number, h: number, role: number, z = 0.003) {
    return this.save()
      .move(cx, cy, 0)
      .flat(rr(w, h, h / 2, 3), role, [], z)
      .restore();
  }
  /** The same, from its left end. */
  text(left: number, cy: number, w: number, h: number, role: number, z = 0.003) {
    return this.bar(left + w / 2, cy, w, h, role, z);
  }
  dot(cx: number, cy: number, r: number, role: number, z = 0.003) {
    return this.save().move(cx, cy, 0).flat(circle(r, 16), role, [], z).restore();
  }
  /** A rounded rectangle printed at cx/cy. */
  tile(cx: number, cy: number, w: number, h: number, r: number | [number, number, number, number], role: number, z = 0.003) {
    return this.save()
      .move(cx, cy, 0)
      .flat(rr(w, h, r, 4), role, [], z)
      .restore();
  }
  build() {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(this.p), 3));
    g.setAttribute('normal', new BufferAttribute(new Float32Array(this.n), 3));
    g.setAttribute('aRole', new BufferAttribute(new Float32Array(this.r), 1));
    if (this.hasArc) g.setAttribute('aArc', new BufferAttribute(new Float32Array(this.f), 1));
    g.setIndex(new BufferAttribute(this.count > 65535 ? new Uint32Array(this.i) : new Uint16Array(this.i), 1));
    return g;
  }
}

interface LineOpts {
  /** Draw delay and duration in the model's build progress (0–1). */
  delay?: number;
  span?: number;
  /** Phase of the travelling highlight. */
  seed?: number;
  /** Chapter whose progress draws this line (floor links and footprints). */
  ch?: number;
  closed?: boolean;
}

/** Polylines turned into screen-space ribbons (see LINE_VS). Many lines, one draw call. */
class Lines {
  private P: number[] = [];
  private A: number[] = [];
  private B: number[] = [];
  private S: number[] = [];
  private T: number[] = [];
  private D: number[] = [];
  private L: number[] = [];
  private Q: number[] = [];
  private E: number[] = [];
  private H: number[] = [];
  private I: number[] = [];

  add(pts: Vector3[], o: LineOpts = {}) {
    const p = o.closed ? [...pts, pts[0]] : pts;
    const n = p.length;
    if (n < 2) return this;
    const dist = [0];
    for (let i = 1; i < n; i++) dist.push(dist[i - 1] + p[i].distanceTo(p[i - 1]));
    const total = dist[n - 1] || 1;
    const base = this.P.length / 3;
    for (let i = 0; i < n; i++) {
      const prev = i > 0 ? p[i - 1] : o.closed ? p[n - 2] : p[i];
      const next = i < n - 1 ? p[i + 1] : o.closed ? p[1] : p[i];
      for (const side of [-1, 1]) {
        this.P.push(p[i].x, p[i].y, p[i].z);
        this.A.push(prev.x, prev.y, prev.z);
        this.B.push(next.x, next.y, next.z);
        this.S.push(side);
        this.T.push(dist[i] / total);
        this.D.push(dist[i]);
        this.L.push(o.delay ?? 0);
        this.Q.push(o.span ?? 1);
        this.E.push(o.seed ?? 0);
        this.H.push(o.ch ?? -1);
      }
      if (i < n - 1) {
        const k = base + i * 2;
        this.I.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
      }
    }
    return this;
  }
  build() {
    const g = new BufferGeometry();
    const f3 = (a: number[]) => new BufferAttribute(new Float32Array(a), 3);
    const f1 = (a: number[]) => new BufferAttribute(new Float32Array(a), 1);
    g.setAttribute('position', f3(this.P));
    g.setAttribute('aPrev', f3(this.A));
    g.setAttribute('aNext', f3(this.B));
    g.setAttribute('aSide', f1(this.S));
    g.setAttribute('aT', f1(this.T));
    g.setAttribute('aDist', f1(this.D));
    g.setAttribute('aDelay', f1(this.L));
    g.setAttribute('aSpan', f1(this.Q));
    g.setAttribute('aSeed', f1(this.E));
    g.setAttribute('aCh', f1(this.H));
    const count = this.P.length / 3;
    g.setIndex(new BufferAttribute(count > 65535 ? new Uint32Array(this.I) : new Uint16Array(this.I), 1));
    return g;
  }
}

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
  return { t, theta: a + 0.2, radius: R + 8.4, height: 4.8, target: new Vector3(Math.sin(a) * R * 0.94, 1.32, Math.cos(a) * R * 0.94) };
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
    else if ('center' in c) keys.push({ t, theta: 0.6, radius: 11.4, height: 7.3, target: new Vector3(0, 0.6, 0) });
    else keys.push({ t, theta: slotAngle(6) + 0.62, radius: 23, height: 29, target: new Vector3(0, 0, 0) });
  });
  keys.push({ t: N + 0.95, theta: slotAngle(7) + 0.95, radius: 27, height: 20, target: new Vector3(0, 0.6, 0) });
  return keys;
}

/* ── Scene ──────────────────────────────────────────── */

interface Mod {
  group: Group;
  /** Matte materials that flash when the impact wave reaches the model. */
  mats: ShaderMaterial[];
  /** Footprint on the floor: width, depth, offset along the model's facing and (optionally) across it. */
  foot: [number, number, number, number?];
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

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.5, 200);

  /* Shared uniforms */
  const v3 = (h: string) => new Vector3(...rgb(h));
  const time = { value: 0 };
  const res = { value: new Vector2(1, 1) };
  const focus = { value: new Vector3() };
  const focusR = { value: 100 };
  const bgU = { value: v3(pal.bg) };
  const flashC = { value: v3(pal.flash) };
  const palU = { value: ROLES.map((r) => v3(pal.roles[r])) };
  const noCh = { value: new Array<number>(N).fill(0) };

  /* Materials */
  const mattes: ShaderMaterial[] = [];
  const matte = (arc = false) => {
    const m = new ShaderMaterial({
      vertexShader: MATTE_VS,
      fragmentShader: MATTE_FS,
      defines: arc ? { ARC: '' } : {},
      uniforms: {
        uPal: palU,
        uBg: bgU,
        uFocus: focus,
        uFocusR: focusR,
        uFlashColor: flashC,
        uFlash: { value: 0 },
        uArc: { value: reduced ? 1 : 0 },
      },
    });
    mattes.push(m);
    return m;
  };

  interface LineMat {
    a: ColorKey;
    b?: ColorKey;
    head?: ColorKey;
    width: number;
    alpha?: number;
    speed?: number;
    dash?: number;
    march?: number;
    slot?: boolean;
    ch?: { value: number[] };
  }
  const lineMats: { m: ShaderMaterial; o: LineMat }[] = [];
  const lineMat = (o: LineMat) => {
    const m = new ShaderMaterial({
      vertexShader: LINE_VS,
      fragmentShader: LINE_FS,
      defines: o.slot ? { SLOT: '' } : {},
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      uniforms: {
        uRes: res,
        uWidth: { value: o.width },
        uA: { value: v3(colorOf(pal, o.a)) },
        uB: { value: v3(colorOf(pal, o.b ?? o.a)) },
        uHead: { value: v3(colorOf(pal, o.head ?? 'head')) },
        uAlpha: { value: o.alpha ?? 1 },
        uTime: time,
        uSpeed: { value: reduced ? 0 : (o.speed ?? 0) },
        uWave: { value: -1 },
        uDash: { value: o.dash ?? 0 },
        uMarch: { value: o.march ?? 0 },
        // fully drawn unless a model animates it (its update sets this before every render)
        uDraw: { value: 99 },
        uCh: o.ch ?? noCh,
        uFocus: focus,
        uFocusR: focusR,
      },
    });
    lineMats.push({ m, o });
    return m;
  };

  const flatMats: { m: ShaderMaterial; key: ColorKey; k: number }[] = [];
  const flatMat = (frag: string, key: ColorKey, k: number, extra: Record<string, { value: unknown }> = {}) => {
    const m = new ShaderMaterial({
      vertexShader: UV_VS,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: v3(colorOf(pal, key)) }, uAlpha: { value: key === 'shadow' ? pal.shadowA * k : k }, ...extra },
    });
    flatMats.push({ m, key, k });
    return m;
  };

  const kit = () => {
    const solid = matte();
    return { solid, mats: [solid] };
  };

  /* Helpers */
  const quad = new PlaneGeometry(1, 1);
  const solidMesh = (mat: ShaderMaterial, parent: Object3D, draw: (b: Geo) => void) => {
    const b = new Geo();
    draw(b);
    const o = new Mesh(b.build(), mat);
    parent.add(o);
    return o;
  };
  const lineMesh = (lines: Lines, mat: ShaderMaterial, parent: Object3D) => {
    const o = new Mesh(lines.build(), mat);
    o.renderOrder = 3;
    parent.add(o);
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
  const shadow = (parent: Object3D, w: number, d: number, x = 0, z = 0, k = 1) => {
    const soft = 0.42;
    const W = w + soft * 2;
    const D = d + soft * 2;
    const o = new Mesh(quad, flatMat(SHADOW_FS, 'shadow', k, { uSize: { value: new Vector2(W, D) }, uSoft: { value: soft } }));
    o.rotation.x = -HALF;
    o.position.set(x, 0.004, z);
    o.scale.set(W, D, 1);
    o.renderOrder = -2;
    parent.add(o);
  };
  /** A low matte plinth with an inset hairline, like a tray. */
  const plinth = (b: Geo, w: number, d: number, h = 0.08, x = 0, z = 0) => {
    b.save().move(x, 0, z, -HALF, 0, 0);
    b.slab(w, d, h, Math.min(0.24, d * 0.2), C.base, C.baseS);
    b.move(0, 0, h);
    b.flat(rr(w - 0.18, d - 0.18, 0.16), C.baseS, [rr(w - 0.205, d - 0.205, 0.148)]);
    b.restore();
  };
  /** Top strip of a card in a role colour (rounded to match the card's top corners). */
  const header = (b: Geo, w: number, top: number, h: number, r: number, role: number) => b.tile(0, top - h / 2, w, h, [0, r, r, 0], role);
  const pop = (o: Object3D, k: number, base = 1) => {
    o.scale.setScalar(Math.max(0.0001, base * backOut(clamp01(k))));
    o.visible = k > 0.001;
  };
  const ease = (x: number) => (reduced ? (x > 0 ? 1 : 0) : easeOut(x));

  /* Floor: a drafting grid that fades into the page */
  const gridMat = new ShaderMaterial({
    vertexShader: WORLD_VS,
    fragmentShader: GRID_FS,
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: v3(pal.grid) }, uAlpha: { value: pal.gridA }, uRadius: { value: 19 } },
  });
  const floor = new Mesh(new PlaneGeometry(44, 44), gridMat);
  floor.rotation.x = -HALF;
  floor.renderOrder = -3;
  scene.add(floor);

  /* The document every capability works on */
  const doc = new Group();
  scene.add(doc);
  const docKit = kit();
  const PLINTH = 0.18;
  const SHEET = PLINTH + 0.06; // two sheets underneath
  const SHEET_TOP = SHEET + 0.045;
  shadow(doc, 3.6, 4.4, 0, 0, 1.1);
  solidMesh(docKit.solid, doc, (b) => {
    plinth(b, 3.6, 4.4, PLINTH);
    b.save().move(0.13, PLINTH, 0.12, -HALF, 0, -0.07).slab(2.5, 3.3, 0.03, 0.05, C.paper, C.paperS).restore();
    b.save()
      .move(0.06, PLINTH + 0.03, 0.06, -HALF, 0, -0.035)
      .slab(2.5, 3.3, 0.03, 0.05, C.paper, C.paperS)
      .restore();
    // the policy: heading, paragraphs, § 4.2 highlighted, approvals in the footer
    b.move(0, SHEET, 0, -HALF, 0, 0);
    b.slab(2.5, 3.3, 0.045, 0.05, C.surf, C.surfS);
    b.move(0, 0, 0.045);
    b.text(-1.05, 1.34, 1.1, 0.14, C.ink);
    b.text(-1.05, 1.14, 0.62, 0.07, C.mute);
    [1.9, 1.72, 1.45].forEach((w, i) => b.text(-1.05, 0.9 - i * 0.19, w, 0.07, C.mute));
    b.tile(0, 0.13, 2.18, 0.44, 0.06, C.tanSoft);
    b.tile(-1.03, 0.13, 0.05, 0.34, 0.025, C.tan, 0.005);
    b.text(-0.9, 0.23, 1.62, 0.07, C.tan, 0.005);
    b.text(-0.9, 0.04, 1.2, 0.07, C.tan, 0.005);
    [1.95, 2.0, 1.6, 1.8].forEach((w, i) => b.text(-1.05, -0.3 - i * 0.19, w, 0.07, C.mute));
    [C.teal, C.tan, C.deep].forEach((role, i) => b.dot(-0.93 + i * 0.19, -1.33, 0.075, role));
    b.bar(0.82, -1.33, 0.5, 0.14, C.aqua);
    b.tile(0.92, 1.42, 0.16, 0.42, [0.04, 0, 0, 0.04], C.tan);
  });
  anchor(doc, 'i0', -0.55, SHEET_TOP + 0.3, -0.13);
  anchor(doc, 'i1', 0, 0.2, 2.6);

  /* 1 · Registries: five registers filed like tabbed cards, and room for your own */
  function registries(): Mod {
    const g = new Group();
    const k = kit();
    const X = -0.3; // leaves room for the register names on the right
    shadow(g, 3.1, 2.1, X, -0.3);
    solidMesh(k.solid, g, (b) => plinth(b, 3.1, 2.1, 0.08, X, -0.3));
    const W = 2.5;
    const H = 1.2;
    const D = 0.045;
    const LEAN = -0.17;
    const tab = (i: number) => -0.9 + i * 0.36;
    const roles = [C.teal, C.tan, C.deep, C.ink, C.aqua];
    const rows = [1.42, 1.6, 1.15];
    const top = H - 0.18;
    const cards = roles.map((role, i) => {
      const card = new Group();
      card.rotation.x = LEAN;
      g.add(card);
      solidMesh(k.solid, card, (b) => {
        b.save()
          .move(0, H / 2, -D / 2)
          .slab(W, H, D, 0.08, C.surf, C.surfS)
          .restore();
        b.save()
          .move(tab(i), H + 0.065, -D / 2)
          .prism(rr(0.34, 0.13, [0, 0.05, 0.05, 0], 4), [], D, role, C.surfS)
          .restore();
        b.move(0, 0, D / 2);
        b.text(-W / 2 + 0.18, top, 0.72, 0.08, C.ink);
        b.bar(W / 2 - 0.3, top, 0.32, 0.12, C.tealSoft);
        b.tile(0, top - 0.13, W - 0.26, 0.012, 0, C.mute);
        rows.forEach((len, j) => {
          const y = top - 0.31 - j * 0.21;
          const hot = i === 0 && j === 1;
          if (hot) b.tile(0, y, W - 0.16, 0.17, 0.05, C.tanSoft);
          b.dot(-W / 2 + 0.22, y, 0.033, hot ? C.tan : role, 0.005);
          b.text(-W / 2 + 0.34, y, len, 0.05, hot ? C.tan : C.mute, 0.005);
          b.bar(W / 2 - 0.3, y, 0.28, 0.05, C.mute, 0.005);
        });
      });
      anchor(card, `r${i}`, W / 2 + 0.04, top, D / 2);
      if (i === 0) anchor(card, 'r42', -0.2, top - 0.4, D / 2);
      return card;
    });
    // + your own registry: a dashed outline with an add tab
    const ghost = new Group();
    ghost.rotation.x = LEAN;
    g.add(ghost);
    const outline = rr(W, H, 0.08, 4).map(([x, y]) => new Vector3(x, y + H / 2, 0));
    lineMesh(new Lines().add(outline, { closed: true }), lineMat({ a: 'teal', width: 1.3, alpha: 0.85, dash: 0.08 }), ghost);
    solidMesh(k.solid, ghost, (b) => {
      b.save()
        .move(tab(5), H + 0.065, -D / 2)
        .prism(rr(0.34, 0.13, [0, 0.05, 0.05, 0], 4), [], D, C.tealSoft, C.surfS)
        .restore();
      b.move(tab(5), H + 0.065, D / 2);
      b.tile(0, 0, 0.1, 0.02, 0.01, C.teal);
      b.tile(0, 0, 0.02, 0.1, 0.01, C.teal);
    });
    anchor(ghost, 'r5', tab(5), H + 0.17, D / 2);
    const place = (o: Group, i: number, a: number, t: number) => {
      const e = stagger(a, i, 0.09, 0.4);
      const q = ease(e);
      o.position.set(X, 0.08 + i * 0.33 + (1 - q) * 0.5 + Math.sin(t * 0.9 + i * 0.6) * 0.01, 0.36 - i * 0.3 + (1 - q) * -1.8);
      pop(o, e);
    };
    return {
      group: g,
      mats: k.mats,
      foot: [3.1, 2.1, -0.3, X],
      update(a, t) {
        cards.forEach((card, i) => place(card, i, a, t));
        place(ghost, 5, a, t);
      },
    };
  }

  /* 2 · Magpie AI, working on the document: a scan, then suggestions lifting off the clauses they touch */
  function magpie(): Mod {
    const g = new Group();
    const k = kit();
    const scan = new Group();
    scan.position.y = SHEET_TOP + 0.012;
    g.add(scan);
    solidMesh(k.solid, scan, (b) => b.move(0, 0, 0, -HALF, 0, 0).slab(2.6, 0.026, 0.016, 0.013, C.teal, C.deep));
    const glow = new Mesh(quad, flatMat(GLOW_FS, 'teal', 0.32));
    glow.rotation.x = -HALF;
    glow.scale.set(2.6, 0.9, 1);
    glow.position.set(0, -0.006, -0.45);
    glow.renderOrder = 4;
    scan.add(glow);
    const spots: [string, number, Vector3, Vector3][] = [
      ['m0', C.teal, new Vector3(-2.2, 1.6, -1.0), new Vector3(-0.7, SHEET_TOP, -0.9)],
      ['m1', C.tan, new Vector3(-2.4, 1.05, 0.55), new Vector3(-0.95, SHEET_TOP, -0.13)],
      ['m2', C.teal, new Vector3(2.25, 1.45, -0.8), new Vector3(0.95, SHEET_TOP, -0.13)],
      ['m3', C.deep, new Vector3(2.45, 0.95, 0.68), new Vector3(0.9, SHEET_TOP, 0.52)],
      ['m4', C.teal, new Vector3(1.75, 1.85, 1.38), new Vector3(0.6, SHEET_TOP, 0.92)],
    ];
    const lines = new Lines();
    const chips = spots.map(([key, role, at, to], i) => {
      const chip = new Group();
      chip.rotation.order = 'YXZ';
      g.add(chip);
      solidMesh(k.solid, chip, (b) => {
        b.save().move(0, 0, -0.02).slab(1.0, 0.34, 0.04, 0.09, C.surf, C.surfS).restore();
        b.move(0, 0, 0.02);
        b.tile(-0.37, 0, 0.15, 0.15, 0.045, role);
        b.text(-0.24, 0.05, 0.46, 0.06, C.ink);
        b.text(-0.24, -0.07, 0.3, 0.05, C.mute);
      });
      anchor(chip, key, 0, 0.3, 0);
      lines.add([to.clone().setY(SHEET_TOP + 0.01), new Vector3(at.x, at.y - 0.17, at.z)], { delay: 0.4 + i * 0.07, span: 0.3 });
      return { chip, at, to };
    });
    const lm = lineMat({ a: 'deep', b: 'teal', width: 1.4, alpha: 0.9 });
    lineMesh(lines, lm, g);
    return {
      group: g,
      mats: k.mats,
      foot: [0, 0, 0],
      update(a, t) {
        const s = clamp01(a / 0.5);
        scan.visible = !reduced && s > 0.01 && s < 0.99;
        scan.position.z = lerp(-1.7, 1.7, smoother(s));
        lm.uniforms.uDraw.value = reduced ? 99 : a;
        chips.forEach(({ chip, at, to }, i) => {
          const e = stagger(a - 0.4, i, 0.07, 0.3);
          chip.position.lerpVectors(to, at, ease(e));
          chip.position.y += Math.sin(t * 1.1 + i * 1.7) * 0.025 * ease(e);
          chip.rotation.set(-0.1, Math.atan2(camera.position.x - chip.position.x, camera.position.z - chip.position.z), 0);
          pop(chip, e);
        });
      },
    };
  }

  /* 3 · Linked items: the policy and what it is linked to, joined like a diagram */
  function linked(): Mod {
    const g = new Group();
    const k = kit();
    shadow(g, 3.7, 2.4, 0, -0.1);
    solidMesh(k.solid, g, (b) => plinth(b, 3.7, 2.4, 0.08, 0, -0.1));
    const hub = new Group();
    hub.position.set(0, 0.08, -0.15);
    hub.rotation.x = -0.12;
    g.add(hub);
    const HW = 1.2;
    const HH = 1.62;
    const ports: [number, number][] = [
      [-HW / 2, 1.22],
      [HW / 2, 1.22],
      [-HW / 2, 0.5],
      [HW / 2, 0.5],
    ];
    solidMesh(k.solid, hub, (b) => {
      b.save()
        .move(0, HH / 2, -0.025)
        .slab(HW, HH, 0.05, 0.07, C.surf, C.surfS)
        .restore();
      b.move(0, 0, 0.025);
      b.text(-HW / 2 + 0.15, HH - 0.17, 0.6, 0.085, C.ink);
      b.text(-HW / 2 + 0.15, HH - 0.32, 0.4, 0.05, C.mute);
      [0.9, 0.78].forEach((w, i) => b.text(-HW / 2 + 0.15, HH - 0.5 - i * 0.14, w, 0.05, C.mute));
      b.tile(0, HH - 0.92, HW - 0.16, 0.3, 0.045, C.tanSoft);
      b.text(-HW / 2 + 0.15, HH - 0.87, 0.72, 0.05, C.tan, 0.005);
      b.text(-HW / 2 + 0.15, HH - 0.98, 0.5, 0.05, C.tan, 0.005);
      [0.86, 0.66].forEach((w, i) => b.text(-HW / 2 + 0.15, HH - 1.22 - i * 0.14, w, 0.05, C.mute));
      ports.forEach(([x, y]) => b.dot(x, y, 0.038, C.deep, 0.006));
    });
    anchor(hub, 'l0', 0, HH + 0.1, 0.03);
    const hubM = new Matrix4().compose(hub.position, hub.quaternion, new Vector3(1, 1, 1));
    const SW = 0.94;
    const SH = 0.6;
    const specs: [string, number, [number, number, number], number][] = [
      ['l1', C.teal, [-1.62, 1.42, -0.5], 0.3],
      ['l2', C.deep, [1.64, 1.38, -0.46], -0.3],
      ['l3', C.tan, [-1.56, 0.5, 0.48], 0.22],
      ['l4', C.aqua, [1.58, 0.47, 0.52], -0.22],
    ];
    const lines = new Lines();
    const sats = specs.map(([key, role, [x, y, z], yaw], i) => {
      const s = new Group();
      s.position.set(x, y, z);
      s.rotation.set(-0.1, yaw, 0, 'YXZ');
      g.add(s);
      const inner = x < 0 ? SW / 2 : -SW / 2;
      solidMesh(k.solid, s, (b) => {
        b.save().move(0, 0, -0.02).slab(SW, SH, 0.04, 0.07, C.surf, C.surfS).restore();
        b.move(0, 0, 0.02);
        header(b, SW, SH / 2, 0.11, 0.07, role);
        if (key === 'l4') {
          b.dot(-0.3, 0.02, 0.065, C.inkSoft);
          b.tile(-0.3, -0.13, 0.17, 0.09, [0, 0.045, 0.045, 0], C.inkSoft);
          b.text(-0.15, 0.03, 0.42, 0.055, C.ink);
          b.text(-0.15, -0.1, 0.3, 0.045, C.mute);
        } else {
          b.text(-SW / 2 + 0.12, 0.05, 0.5, 0.055, C.ink);
          b.text(-SW / 2 + 0.12, -0.08, 0.66, 0.045, C.mute);
          if (key === 'l3') [C.teal, C.aqua, C.tan].forEach((c, j) => b.tile(-0.31 + j * 0.13, -0.19, 0.1, 0.06, 0.02, c));
          else b.text(-SW / 2 + 0.12, -0.18, 0.4, 0.045, C.mute);
        }
        b.dot(inner, 0, 0.034, C.deep, 0.006);
      });
      anchor(s, key, 0, SH / 2 + 0.1, 0.02);
      // an elbow connector from the policy's port to this item
      const [px, py] = ports[i];
      const from = new Vector3(px, py, 0.035).applyMatrix4(hubM);
      const to = new Vector3(inner, 0, 0.03).applyMatrix4(new Matrix4().compose(s.position, s.quaternion, new Vector3(1, 1, 1)));
      const mx = lerp(from.x, to.x, 0.42);
      lines.add(fillet([from, new Vector3(mx, from.y, from.z), new Vector3(mx, to.y, to.z), to], 0.14), {
        delay: 0.25 + i * 0.1,
        span: 0.3,
        seed: i * 0.27,
      });
      return s;
    });
    const lm = lineMat({ a: 'deep', head: 'aqua', width: 1.5, alpha: 0.9, speed: 0.32 });
    lineMesh(lines, lm, g);
    return {
      group: g,
      mats: k.mats,
      foot: [3.7, 2.4, -0.1],
      update(a) {
        pop(hub, stagger(a, 0, 0, 0.35));
        lm.uniforms.uDraw.value = reduced ? 99 : a;
        sats.forEach((s, i) => pop(s, clamp01((a - 0.45 - i * 0.1) / 0.3)));
      },
    };
  }

  /* 4 · Procedures: the SOP drawn as a flow in two swimlanes, with a screen simulation attached */
  function procedures(): Mod {
    const g = new Group();
    const k = kit();
    shadow(g, 3.9, 1.5, 0, 0.1);
    solidMesh(k.solid, g, (b) => plinth(b, 3.9, 1.5, 0.08, 0, 0.1));
    const board = new Group();
    board.position.set(0, 0.08, 0.05);
    board.rotation.x = -0.2;
    g.add(board);
    const BW = 3.6;
    const BH = 2.4;
    const BD = 0.06;
    const L1 = BH / 2 + 0.56;
    const L2 = BH / 2 - 0.56;
    const Z = BD / 2;
    solidMesh(k.solid, board, (b) => {
      b.save()
        .move(0, BH / 2, -BD / 2)
        .slab(BW, BH, BD, 0.1, C.surf, C.surfS)
        .restore();
      b.move(0, 0, Z);
      b.tile(0.06, L1, BW - 0.36, 1.0, 0.06, C.paper);
      b.tile(0.06, L2, BW - 0.36, 1.0, 0.06, C.paper);
      b.tile(-BW / 2 + 0.13, L1, 0.07, 0.86, 0.035, C.teal);
      b.tile(-BW / 2 + 0.13, L2, 0.07, 0.86, 0.035, C.tan);
    });
    const node = (x: number, y: number, draw: (b: Geo) => void) => {
      const n = new Group();
      n.position.set(x, y, Z);
      board.add(n);
      solidMesh(k.solid, n, draw);
      return n;
    };
    const start = node(-1.05, L1, (b) => b.prism(rr(0.62, 0.26, 0.13), [], 0.05, C.ink, C.ink));
    const approve = node(0.05, L1, (b) =>
      b.prism(
        soften(
          [
            [0, -0.29],
            [0.29, 0],
            [0, 0.29],
            [-0.29, 0],
          ],
          0.05,
        ),
        [],
        0.05,
        C.tealSoft,
        C.inkSoft,
      ),
    );
    const end = node(0.98, L1, (b) => b.prism(circle(0.13), [circle(0.075)], 0.05, C.ink, C.ink));
    const record = node(0.05, L2, (b) => {
      b.slab(0.78, 0.34, 0.05, 0.07, C.surf, C.inkSoft);
      b.move(0, 0, 0.05);
      b.bar(-0.03, 0.05, 0.5, 0.05, C.ink);
      b.bar(-0.08, -0.06, 0.4, 0.045, C.mute);
    });
    const screen = node(1.08, L2, (b) => {
      b.slab(0.7, 0.46, 0.05, 0.06, C.screen, C.screen);
      b.move(0, 0, 0.05);
      b.save()
        .move(0.01, 0.03, 0)
        .flat(
          soften(
            [
              [-0.07, -0.085],
              [0.09, 0],
              [-0.07, 0.085],
            ],
            0.018,
          ),
          C.tan,
        )
        .restore();
      b.bar(0, -0.16, 0.5, 0.03, C.mute);
      b.text(-0.25, -0.16, 0.2, 0.03, C.aqua, 0.005);
    });
    anchor(start, 'p0', 0, 0.25, 0.05);
    anchor(approve, 'p1', 0, 0.38, 0.05);
    anchor(record, 'p2', 0, -0.24, 0.05);
    const LZ = Z + 0.03;
    const edges: [Vector3, Vector3][] = [
      [new Vector3(-0.74, L1, LZ), new Vector3(-0.25, L1, LZ)],
      [new Vector3(0.35, L1, LZ), new Vector3(0.84, L1, LZ)],
      [new Vector3(0.05, L1 - 0.3, LZ), new Vector3(0.05, L2 + 0.18, LZ)],
      [new Vector3(0.44, L2, LZ), new Vector3(0.72, L2, LZ)],
    ];
    const lines = new Lines();
    const arrows = edges.map(([p, q], i) => {
      lines.add([p, q], { delay: 0.24 + i * 0.08, span: 0.3, seed: i * 0.31 });
      const tip = new Group();
      tip.position.copy(q);
      tip.rotation.z = Math.atan2(q.y - p.y, q.x - p.x);
      board.add(tip);
      solidMesh(k.solid, tip, (b) =>
        b.flat(
          soften(
            [
              [-0.09, -0.045],
              [0, 0],
              [-0.09, 0.045],
            ],
            0.01,
          ),
          C.ink,
          [],
          0,
        ),
      );
      return tip;
    });
    const lm = lineMat({ a: 'ink', head: 'teal', width: 1.5, alpha: 0.8, speed: 0.42 });
    lineMesh(lines, lm, board);
    const nodes = [start, approve, end, record, screen];
    return {
      group: g,
      mats: k.mats,
      foot: [3.9, 1.5, 0.1],
      update(a) {
        pop(board, stagger(a, 0, 0, 0.3));
        nodes.forEach((n, i) => pop(n, stagger(a, i + 1, 0.07, 0.3)));
        lm.uniforms.uDraw.value = reduced ? 99 : a;
        arrows.forEach((tip, i) => pop(tip, clamp01((a - 0.5 - i * 0.08) / 0.12)));
      },
    };
  }

  /* 5 · Workflow builder: steps on a canvas, a form feeding a step, the escalation matrix */
  function workflow(): Mod {
    const g = new Group();
    const k = kit();
    shadow(g, 4.4, 2.6, 0, 0);
    solidMesh(k.solid, g, (b) => plinth(b, 4.4, 2.6, 0.08));
    const NW = 0.74;
    const NH = 0.5;
    const ROW_Y = 1.62;
    const ROW_Z = -0.62;
    const specs: [string, number, number][] = [
      ['w0', C.tan, -1.5],
      ['w1', C.deep, -0.5],
      ['w2', C.deep, 0.5],
      ['w3', C.teal, 1.5],
    ];
    const lines = new Lines();
    const dashes = new Lines();
    const nodes = specs.map(([key, role, x], i) => {
      const n = new Group();
      n.position.set(x, ROW_Y, ROW_Z);
      n.rotation.x = -0.12;
      g.add(n);
      solidMesh(k.solid, n, (b) => {
        b.save().move(0, 0, -0.022).slab(NW, NH, 0.045, 0.07, C.surf, C.surfS).restore();
        b.move(0, 0, 0.023);
        header(b, NW, NH / 2, 0.11, 0.07, role);
        b.text(-NW / 2 + 0.11, 0.03, 0.42, 0.06, C.ink);
        b.text(-NW / 2 + 0.11, -0.1, 0.3, 0.045, C.mute);
        if (i > 0) b.dot(-NW / 2, 0, 0.032, C.deep, 0.006);
        if (i < 3) b.dot(NW / 2, 0, 0.032, C.deep, 0.006);
        if (i === 2) {
          // access control on the step: who may act on it
          b.dot(0.17, -0.12, 0.055, C.aqua, 0.006);
          b.dot(0.25, -0.12, 0.055, C.teal, 0.009);
        }
      });
      anchor(n, key, 0, NH / 2 + 0.08, 0.03);
      if (i < 3) {
        const y = ROW_Y - 0.003;
        const z = ROW_Z + 0.03;
        lines.add([new Vector3(x + NW / 2 + 0.04, y, z), new Vector3(x + 1 - NW / 2 - 0.06, y, z)], {
          delay: (i + 2) * 0.08,
          span: 0.3,
          seed: i * 0.33,
        });
      }
      return n;
    });
    // the form that collects what a step needs
    const form = new Group();
    form.position.set(-1.22, 0.08, 0.5);
    form.rotation.set(-0.16, 0.28, 0, 'YXZ');
    g.add(form);
    const FW = 1.05;
    const FH = 1.2;
    solidMesh(k.solid, form, (b) => {
      b.save()
        .move(0, FH / 2, -0.02)
        .slab(FW, FH, 0.04, 0.07, C.surf, C.surfS)
        .restore();
      b.move(0, 0, 0.021);
      header(b, FW, FH, 0.14, 0.07, C.deep);
      b.text(-FW / 2 + 0.12, FH - 0.07, 0.36, 0.05, C.surf, 0.005);
      [0.86, 0.6, 0.34].forEach((y) => {
        b.text(-FW / 2 + 0.12, y + 0.1, 0.26, 0.04, C.mute);
        b.tile(0, y, FW - 0.24, 0.13, 0.03, C.mute);
        b.tile(0, y, FW - 0.26, 0.11, 0.025, C.paper, 0.005);
      });
      b.bar(FW / 2 - 0.3, 0.12, 0.36, 0.12, C.teal);
    });
    dashes.add(
      fillet([new Vector3(-1.2, 1.36, 0.28), new Vector3(-0.85, 1.38, -0.2), new Vector3(-0.5, ROW_Y - NH / 2 - 0.03, ROW_Z)], 0.2),
      {
        delay: 0.56,
        span: 0.25,
      },
    );
    // the escalation matrix
    const matrix = new Group();
    matrix.position.set(1.22, 0.1, 0.58);
    matrix.rotation.set(-0.5, -0.28, 0, 'YXZ');
    g.add(matrix);
    solidMesh(k.solid, matrix, (b) => {
      b.save().move(0, 0.47, -0.02).slab(1.0, 0.94, 0.04, 0.07, C.surf, C.surfS).restore();
      b.move(0, 0, 0.021);
      b.text(-0.38, 0.84, 0.36, 0.055, C.ink);
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) b.tile(-0.21 + c * 0.24, 0.6 - r * 0.2, 0.2, 0.15, 0.03, r === 0 && c === 2 ? C.tan : C.tealSoft);
      [0.6, 0.4, 0.2].forEach((y) => b.bar(-0.4, y, 0.06, 0.04, C.mute));
    });
    const lm = lineMat({ a: 'ink', head: 'teal', width: 1.5, alpha: 0.8, speed: 0.36 });
    const dm = lineMat({ a: 'deep', width: 1.3, alpha: 0.85, dash: 0.07, march: reduced ? 0 : 0.12 });
    lineMesh(lines, lm, g);
    lineMesh(dashes, dm, g);
    return {
      group: g,
      mats: k.mats,
      foot: [4.4, 2.6, 0],
      update(a) {
        nodes.forEach((n, i) => pop(n, stagger(a, i + 1, 0.08, 0.3)));
        lm.uniforms.uDraw.value = reduced ? 99 : a;
        dm.uniforms.uDraw.value = reduced ? 99 : a;
        pop(form, stagger(a, 6, 0.08, 0.3));
        pop(matrix, stagger(a, 7, 0.08, 0.3));
      },
    };
  }

  /* 6 · Lifecycle: Draft → Under review → Approved → Published → Archived along one rail */
  function lifecycle(): Mod {
    const g = new Group();
    const k = kit();
    shadow(g, 4.6, 1.7, 0, -0.1);
    const xs = [-1.72, -0.86, 0, 0.86, 1.72];
    const zOf = (x: number) => -0.24 * (x / 1.72) ** 2 - 0.3;
    const RAIL_Y = 0.09;
    const rail = xs.map((x) => new Vector3(x, RAIL_Y, zOf(x) + 0.5));
    solidMesh(k.solid, g, (b) => {
      plinth(b, 4.6, 1.7, 0.08, 0, -0.1);
      // stations along the rail
      rail.forEach((p, i) =>
        b
          .save()
          .move(p.x, 0.08, p.z, -HALF, 0, 0)
          .flat(circle(0.065, 20), i === 4 ? C.mute : C.deep, [circle(0.04, 20)])
          .restore(),
      );
    });
    const heads = [C.mute, C.aqua, C.deep, C.teal, C.mute];
    const stops = xs.map((x, i) => {
      const s = new Group();
      s.position.set(x, 0.08, zOf(x));
      s.rotation.set(-0.14, -x * 0.1, 0, 'YXZ');
      g.add(s);
      const pub = i === 3;
      const w = pub ? 0.72 : 0.6;
      const h = pub ? 0.5 : 0.42;
      const lift = pub ? 0.12 : 0;
      solidMesh(k.solid, s, (b) => {
        if (pub) b.save().move(0, 0, 0, -HALF, 0, 0).slab(0.86, 0.4, lift, 0.06, C.base, C.baseS).restore();
        b.save()
          .move(0, lift + h / 2, -0.02)
          .slab(w, h, 0.04, 0.06, i === 4 ? C.paper : C.surf, C.surfS)
          .restore();
        b.move(0, lift, 0.021);
        header(b, w, h, 0.1, 0.06, heads[i]);
        b.text(-w / 2 + 0.09, h - 0.21, 0.3, 0.05, i === 4 ? C.mute : C.ink);
        b.text(-w / 2 + 0.09, h - 0.32, w * 0.62, 0.04, C.mute);
        if (pub) {
          // version locked on publish
          b.tile(w / 2 - 0.13, 0.13, 0.15, 0.11, 0.025, C.ink);
          b.save()
            .move(w / 2 - 0.13, 0.18, 0)
            .flat(arcBand(0.033, 0.05, 0, Math.PI, 14), C.ink)
            .restore();
        }
      });
      anchor(s, `y${i}`, 0, i % 2 ? lift + h + 0.06 : -0.03, i % 2 ? 0.02 : 0.5);
      return s;
    });
    const curve = new CatmullRomCurve3(rail.slice(0, 4));
    const main = new Lines().add(curve.getSpacedPoints(60), { delay: 0.25, span: 0.45, seed: 0.2 });
    const tail = new Lines().add([rail[3], rail[4]], { delay: 0.6, span: 0.3 });
    // the optional board approval tier, between Approved and Published
    const boardAt = new Vector3(0.43, 1.42, -0.42);
    const arch = new Lines()
      .add(
        new CatmullRomCurve3([new Vector3(0, 0.56, zOf(0)), new Vector3(0.1, 1.2, -0.42), new Vector3(0.2, 1.36, -0.42)]).getSpacedPoints(
          24,
        ),
        {
          delay: 0.55,
          span: 0.2,
        },
      )
      .add(
        new CatmullRomCurve3([
          new Vector3(0.68, 1.36, -0.42),
          new Vector3(0.78, 1.2, -0.42),
          new Vector3(0.86, 0.76, zOf(0.86)),
        ]).getSpacedPoints(24),
        {
          delay: 0.72,
          span: 0.2,
        },
      );
    const mainM = lineMat({ a: 'lineA', b: 'lineB', width: 2.4, speed: 0.3 });
    const tailM = lineMat({ a: 'guide', width: 1.4, alpha: 0.6 });
    const archM = lineMat({ a: 'tan', width: 1.3, alpha: 0.9, dash: 0.06 });
    lineMesh(main, mainM, g);
    lineMesh(tail, tailM, g);
    lineMesh(arch, archM, g);
    const board = new Group();
    board.position.copy(boardAt);
    board.rotation.x = -0.12;
    g.add(board);
    solidMesh(k.solid, board, (b) => {
      b.save().move(0, 0, -0.02).slab(0.52, 0.3, 0.04, 0.06, C.surf, C.surfS).restore();
      b.move(0, 0, 0.021);
      header(b, 0.52, 0.15, 0.08, 0.06, C.tan);
      b.text(-0.18, -0.04, 0.3, 0.045, C.ink);
    });
    anchor(board, 'yb', 0, 0.24, 0.02);
    // the document itself, travelling through the stages
    const sheet = new Group();
    g.add(sheet);
    solidMesh(k.solid, sheet, (b) => {
      b.save().move(0, 0.16, -0.015).slab(0.24, 0.3, 0.03, 0.03, C.surf, C.inkSoft).restore();
      b.move(0, 0, 0.016);
      [0.25, 0.18, 0.11].forEach((y, i) => b.text(-0.08, y, i ? 0.12 : 0.16, 0.025, i ? C.mute : C.ink));
    });
    anchor(g, 'yv', 0, 0.06, 0.95);
    return {
      group: g,
      mats: k.mats,
      foot: [4.6, 1.7, -0.1],
      update(a, t) {
        stops.forEach((s, i) => pop(s, stagger(a, i, 0.06, 0.3)));
        for (const m of [mainM, tailM, archM]) m.uniforms.uDraw.value = reduced ? 99 : a;
        pop(board, clamp01((a - 0.62) / 0.2));
        const d = reduced ? 1 : easeOut(clamp01((a - 0.25) / 0.45));
        sheet.visible = d > 0.01;
        curve.getPointAt(Math.min(0.999, d), sheet.position);
        sheet.position.y += 0.01 + (reduced ? 0 : Math.sin(t * 2) * 0.012);
      },
    };
  }

  /* 7 · Acknowledgement: everyone the policy was published to, filling in as they read */
  function acknowledgement(): Mod {
    const g = new Group();
    const k = kit();
    shadow(g, 4.3, 1.8, 0, 0);
    solidMesh(k.solid, g, (b) => plinth(b, 4.3, 1.8, 0.08));
    const roster = new Group();
    roster.position.set(-0.72, 0.08, -0.2);
    roster.rotation.set(-0.12, 0.1, 0, 'YXZ');
    g.add(roster);
    const RW = 2.56;
    const RH = 1.86;
    const FZ = 0.026;
    const track = RW - 0.36;
    solidMesh(k.solid, roster, (b) => {
      b.save()
        .move(0, RH / 2, -0.025)
        .slab(RW, RH, 0.05, 0.09, C.surf, C.surfS)
        .restore();
      b.move(0, 0, FZ);
      b.text(-RW / 2 + 0.18, RH - 0.17, 0.72, 0.085, C.ink);
      b.text(-RW / 2 + 0.18 + 0.8, RH - 0.17, 0.34, 0.06, C.mute);
      b.bar(0, 0.2, track, 0.07, C.mute);
    });
    const fill = new Group();
    fill.position.set(-track / 2, 0.2, FZ);
    roster.add(fill);
    solidMesh(k.solid, fill, (b) =>
      b
        .save()
        .move(track / 2, 0, 0)
        .flat(rr(track, 0.07, 0.035, 3), C.teal, [], 0.004)
        .restore(),
    );
    // one person icon, instanced for everyone
    const COLS = 12;
    const ROWS = 6;
    const count = COLS * ROWS;
    const icon = new Geo();
    icon.save().move(0, 0.062, 0).prism(circle(0.04, 18), [], 0.016, INST, INST).restore();
    icon
      .save()
      .move(0, -0.012, 0)
      .prism(rr(0.12, 0.07, [0, 0.035, 0.035, 0], 4), [], 0.016, INST, INST)
      .restore();
    const people = new InstancedMesh(icon.build(), k.solid, count);
    people.frustumCulled = false;
    roster.add(people);
    const due = new Set([17, 40, 58]);
    const m4 = new Matrix4();
    const c = new Color();
    const place = (i: number, s: number) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      m4.makeScale(s, s, s).setPosition(-RW / 2 + 0.32 + (col * (RW - 0.64)) / (COLS - 1), 0.44 + row * 0.205, FZ);
      people.setMatrixAt(i, m4);
    };
    // Published to me
    const panel = new Group();
    panel.position.set(1.66, 0.62, 0.42);
    panel.rotation.set(-0.12, -0.42, 0, 'YXZ');
    g.add(panel);
    const PW = 1.15;
    const PH = 0.98;
    const rowsY = [0.15, -0.09, -0.33];
    solidMesh(k.solid, panel, (b) => {
      b.save().move(0, 0, -0.025).slab(PW, PH, 0.05, 0.08, C.surf, C.surfS).restore();
      b.move(0, 0, 0.026);
      header(b, PW, PH / 2, 0.17, 0.08, C.deep);
      b.text(-PW / 2 + 0.12, PH / 2 - 0.085, 0.42, 0.05, C.surf, 0.005);
      b.dot(PW / 2 - 0.13, PH / 2 - 0.085, 0.07, C.tan, 0.006);
      rowsY.forEach((y, i) => {
        b.dot(-0.42, y, 0.048, i === 1 ? C.tan : C.teal);
        b.text(-0.3, y + 0.03, 0.56, 0.05, C.ink);
        b.text(-0.3, y - 0.06, 0.34, 0.04, C.mute);
      });
    });
    anchor(panel, 'a0', -0.16, PH / 2 + 0.05, 0.03);
    anchor(panel, 'a1', PW / 2 - 0.04, PH / 2 - 0.085, 0.03);
    rowsY.forEach((y, i) => anchor(panel, `a${i + 2}`, -0.49, y, 0.03));
    anchor(roster, 'a5', -0.42, 0.12, FZ);
    let last = -1;
    return {
      group: g,
      mats: k.mats,
      foot: [4.3, 1.8, 0],
      onTheme() {
        last = -1;
      },
      update(a) {
        pop(roster, stagger(a, 0, 0, 0.25));
        const grow = clamp01(a / 0.5);
        const lit = clamp01((a - 0.35) / 0.55);
        fill.scale.x = Math.max(0.0001, lit * 0.954);
        fill.visible = lit > 0.001;
        pop(panel, clamp01((a - 0.45) / 0.35));
        const key = Math.round(grow * 300) + Math.round(lit * 300) * 1000;
        if (key === last) return;
        last = key;
        for (let i = 0; i < count; i++) {
          place(i, Math.max(0.0001, backOut(clamp01(grow * 1.4 - (i / count) * 0.4))));
          const isDue = due.has(i) && lit > 0.5;
          const on = i / count < lit * 0.96;
          people.setColorAt(i, c.setRGB(...rgb(isDue ? pal.roles.tan : on ? pal.roles.teal : pal.roles.mute)));
        }
        people.instanceMatrix.needsUpdate = true;
        if (people.instanceColor) people.instanceColor.needsUpdate = true;
      },
    };
  }

  /* 8 · Risk assessment: the 5 × 5 heat map, a rated risk, its evidence */
  function risk(): Mod {
    const g = new Group();
    const k = kit();
    shadow(g, 3.4, 2.8, 0, 0);
    solidMesh(k.solid, g, (b) => plinth(b, 3.4, 2.8, 0.08));
    const board = new Group();
    board.position.set(-0.22, 0.86, -0.08);
    board.rotation.x = -HALF + 0.55;
    g.add(board);
    const BS = 2.5;
    const FZ = 0.031;
    solidMesh(k.solid, board, (b) => {
      b.save().move(0, 0, -0.03).slab(BS, BS, 0.06, 0.1, C.surf, C.surfS).restore();
      b.move(0, 0, FZ);
      b.tile(-BS / 2 + 0.17, 0.13, 0.035, BS - 0.62, 0.017, C.mute);
      b.tile(0.13, -BS / 2 + 0.17, BS - 0.62, 0.035, 0.017, C.mute);
      b.save()
        .move(BS / 2 - 0.14, -BS / 2 + 0.17, 0)
        .flat(
          soften(
            [
              [-0.05, -0.05],
              [0.05, 0],
              [-0.05, 0.05],
            ],
            0.008,
          ),
          C.inkSoft,
        )
        .restore();
    });
    const tileGeo = new Geo().prism(rr(0.42, 0.42, 0.05, 4), [], 1, INST, INST).build();
    const tiles = new InstancedMesh(tileGeo, k.solid, 25);
    tiles.frustumCulled = false;
    board.add(tiles);
    const at = (i: number): [number, number] => [((i % 5) - 2) * 0.46 + 0.13, (Math.floor(i / 5) - 2) * 0.46 + 0.13];
    const scores = Array.from({ length: 25 }, (_, i) => ((Math.floor(i / 5) + 1) * ((i % 5) + 1)) / 25);
    const heights = scores.map((s) => 0.02 + s * 0.07);
    const c = new Color();
    const paint = () => {
      scores.forEach((s, i) => {
        const pick = s > 0.55 ? pal.roles.tan : s > 0.32 ? pal.amber : s > 0.14 ? pal.roles.aqua : pal.roles.teal;
        tiles.setColorAt(i, c.setRGB(...rgb(pick)));
      });
      if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
    };
    paint();
    const MARK = 13;
    const [mx, my] = at(MARK);
    const marker = new Group();
    board.add(marker);
    solidMesh(k.solid, marker, (b) => b.prism(rr(0.54, 0.54, 0.08, 4), [rr(0.47, 0.47, 0.05, 4)], 0.014, C.ink, C.ink));
    anchor(marker, 'k0', 0, 0.36, 0.12);
    anchor(board, 'k2', 0.13, -BS / 2 + 0.02, FZ + 0.02);
    // the evidence, clipped to the assessment
    const ev = new Group();
    ev.position.set(1.44, 0.08, 0.74);
    ev.rotation.set(-0.14, -0.5, 0, 'YXZ');
    g.add(ev);
    const EW = 0.66;
    const EH = 0.86;
    solidMesh(k.solid, ev, (b) => {
      b.save()
        .move(0, EH / 2, -0.02)
        .slab(EW, EH, 0.04, 0.05, C.surf, C.surfS)
        .restore();
      b.move(0, 0, 0.021);
      b.text(-EW / 2 + 0.1, EH - 0.15, 0.32, 0.06, C.ink);
      [0.44, 0.38, 0.46, 0.3].forEach((w, i) => b.text(-EW / 2 + 0.1, EH - 0.32 - i * 0.12, w, 0.04, C.mute));
      b.save()
        .move(EW / 2 - 0.12, EH - 0.06, 0.006, 0, 0, 0.3)
        .flat(rr(0.1, 0.3, 0.05, 4), C.tan, [rr(0.064, 0.264, 0.032, 4)])
        .restore();
    });
    anchor(ev, 'k1', 0, -0.02, 0.02);
    const m4 = new Matrix4();
    let last = -1;
    return {
      group: g,
      mats: k.mats,
      foot: [3.4, 2.8, 0],
      onTheme: paint,
      update(a) {
        pop(board, stagger(a, 0, 0, 0.25));
        if (a !== last) {
          last = a;
          for (let i = 0; i < 25; i++) {
            const [x, y] = at(i);
            const e = stagger(a, i, 0.018, 0.4);
            const p = Math.max(0.0001, backOut(e));
            m4.makeScale(p, p, Math.max(0.0001, heights[i] * ease(e))).setPosition(x, y, FZ);
            tiles.setMatrixAt(i, m4);
          }
          tiles.instanceMatrix.needsUpdate = true;
        }
        marker.position.set(mx, my, FZ + heights[MARK] * ease(stagger(a, MARK, 0.018, 0.4)) + 0.05);
        pop(marker, clamp01((a - 0.6) / 0.25));
        pop(ev, clamp01((a - 0.7) / 0.25));
      },
    };
  }

  /* 10 · Reports and dashboards: a home screen of widgets, and a designed report */
  function reports(): Mod {
    const g = new Group();
    const k = kit();
    const arcM = matte(true);
    k.mats.push(arcM);
    shadow(g, 4.2, 2.2, 0, -0.1);
    solidMesh(k.solid, g, (b) => plinth(b, 4.2, 2.2, 0.08, 0, -0.1));
    const scr = new Group();
    scr.position.set(0.18, 0.08, -0.48);
    scr.rotation.x = -0.12;
    g.add(scr);
    const SW = 3.5;
    const SH = 2.1;
    const FZ = 0.031;
    const DX = 1.18;
    const DY = 1.2;
    solidMesh(k.solid, scr, (b) => {
      b.save()
        .move(0, SH / 2, -0.03)
        .slab(SW, SH, 0.06, 0.1, C.surf, C.surfS)
        .restore();
      b.move(0, 0, FZ);
      [C.teal, C.tan, C.deep].forEach((role, j) => {
        const x = -1.25 + j * 0.76;
        b.tile(x, 1.76, 0.68, 0.4, 0.05, C.paper);
        b.text(x - 0.26, 1.81, 0.3, 0.09, C.ink, 0.005);
        b.text(x - 0.26, 1.67, 0.22, 0.045, C.mute, 0.005);
        b.dot(x + 0.24, 1.8, 0.035, role, 0.005);
      });
      b.tile(-0.5, 0.79, 2.26, 1.28, 0.06, C.paper);
      [0.52, 0.82, 1.12].forEach((y) => b.tile(-0.5, y, 2.06, 0.008, 0, C.mute, 0.005));
      b.tile(DX, 1.02, 0.98, 1.88, 0.06, C.paper);
      b.save()
        .move(DX, DY, 0)
        .flat(circle(0.31, 48), C.mute, [circle(0.2, 48)], 0.005)
        .restore();
      [
        [C.teal, 0.56],
        [C.tan, 0.4],
      ].forEach(([role, w], j) => {
        b.dot(DX - 0.3, 0.68 - j * 0.14, 0.03, role, 0.005);
        b.text(DX - 0.22, 0.68 - j * 0.14, w, 0.04, C.mute, 0.005);
      });
    });
    // the donut sweeps in, clockwise from the top
    const sweep = (x: number, y: number) => {
      const f = (HALF - Math.atan2(y, x)) / TAU;
      return f - Math.floor(f);
    };
    solidMesh(arcM, scr, (b) => {
      b.move(DX, DY, FZ + 0.004).arc(sweep);
      b.prism(arcBand(0.2, 0.31, HALF - 0.58 * TAU, HALF - 0.005, 40), [], 0.02, C.teal, C.deep);
      b.prism(arcBand(0.2, 0.31, HALF - 0.86 * TAU, HALF - 0.6 * TAU, 24), [], 0.02, C.tan, C.tan);
    });
    // bars and the trend over them
    const H = [0.5, 0.75, 0.62, 1.0, 0.86, 1.2, 0.95, 1.45, 1.05, 1.3];
    const barGeo = new Geo()
      .move(0, 0.5, 0)
      .prism(rr(0.12, 1, 0), [], 0.03, INST, INST)
      .build();
    const bars = new InstancedMesh(barGeo, k.solid, H.length);
    bars.frustumCulled = false;
    scr.add(bars);
    const dotGeo = new Geo().prism(circle(0.04, 16), [], 0.012, INST, INST).build();
    const dots = new InstancedMesh(dotGeo, k.solid, H.length);
    dots.frustumCulled = false;
    scr.add(dots);
    const xs = H.map((_, i) => -1.43 + i * 0.205);
    const pts = H.map((h, i) => new Vector3(xs[i], 0.24 + h * 0.6 + 0.16, FZ + 0.05));
    const trendM = lineMat({ a: 'lineA', b: 'lineB', width: 2, speed: 0.25 });
    lineMesh(new Lines().add(new CatmullRomCurve3(pts).getSpacedPoints(90), { delay: 0.35, span: 0.5 }), trendM, scr);
    const c = new Color();
    const paint = () => {
      H.forEach((_, i) => {
        bars.setColorAt(i, c.setRGB(...rgb(i === 7 ? pal.roles.tan : i % 3 === 0 ? pal.roles.deep : pal.roles.teal)));
        dots.setColorAt(i, c.setRGB(...rgb(i === 7 ? pal.roles.tan : pal.roles.ink)));
      });
      if (bars.instanceColor) bars.instanceColor.needsUpdate = true;
      if (dots.instanceColor) dots.instanceColor.needsUpdate = true;
    };
    paint();
    // a report from the Report Designer
    const rep = new Group();
    rep.position.set(-1.56, 0.08, 0.6);
    rep.rotation.set(-0.5, 0.32, 0, 'YXZ');
    g.add(rep);
    solidMesh(k.solid, rep, (b) => {
      b.save().move(0, 0.47, -0.02).slab(0.74, 0.94, 0.04, 0.05, C.surf, C.surfS).restore();
      b.move(0, 0, 0.021);
      b.text(-0.27, 0.82, 0.36, 0.06, C.ink);
      for (let r = 0; r < 4; r++) {
        const y = 0.64 - r * 0.13;
        if (r === 2) b.tile(0, y, 0.62, 0.1, 0.03, C.tanSoft);
        b.text(-0.27, y, 0.18, 0.035, r === 2 ? C.tan : C.ink, 0.005);
        b.text(-0.03, y, 0.12, 0.035, C.mute, 0.005);
        b.text(0.15, y, 0.1, 0.035, C.mute, 0.005);
      }
      b.tile(0, 0.12, 0.6, 0.008, 0, C.mute);
    });
    const m4 = new Matrix4();
    let last = -1;
    return {
      group: g,
      mats: k.mats,
      foot: [4.2, 2.2, -0.1],
      onTheme: paint,
      update(a) {
        pop(scr, stagger(a, 0, 0, 0.3));
        trendM.uniforms.uDraw.value = reduced ? 99 : a;
        arcM.uniforms.uArc.value = reduced ? 1 : easeOut(clamp01((a - 0.45) / 0.45));
        pop(rep, clamp01((a - 0.7) / 0.25));
        if (a === last) return;
        last = a;
        const draw = reduced ? 1 : easeOut(clamp01((a - 0.35) / 0.5));
        H.forEach((h, i) => {
          const e = ease(stagger(a, i, 0.04, 0.4));
          m4.makeScale(1, Math.max(0.0001, h * 0.6 * e), 1).setPosition(xs[i], 0.24, FZ);
          bars.setMatrixAt(i, m4);
          const s = draw >= i / (H.length - 1) - 0.001 ? 1 : 0.0001;
          m4.makeScale(s, s, s).setPosition(pts[i].x, pts[i].y, pts[i].z - 0.01);
          dots.setMatrixAt(i, m4);
        });
        bars.instanceMatrix.needsUpdate = true;
        dots.instanceMatrix.needsUpdate = true;
      },
    };
  }

  /* Build every capability, set out its footprint, connect each to the document */
  const builders: (() => Mod)[] = [
    registries,
    magpie,
    linked,
    procedures,
    workflow,
    lifecycle,
    acknowledgement,
    risk,
    () => ({ group: new Group(), mats: [], foot: [0, 0, 0], update() {} }),
    reports,
  ];
  const mods = builders.map((b) => b());
  const linkCh = { value: new Array<number>(N).fill(reduced ? 1 : 0) };
  const slotCh = { value: new Array<number>(N).fill(0) };
  const links = new Lines();
  const guides = new Lines();
  const slots = new Lines();
  mods.forEach((m, i) => {
    scene.add(m.group);
    const c = CHAPTERS[i];
    if (!('ring' in c)) return;
    const a = slotAngle(c.ring);
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    m.group.position.set(sx * R, 0, sz * R);
    m.group.rotation.y = a;
    const [fw, fd, fz, fx = 0] = m.foot;
    const fm = new Matrix4().makeRotationY(a).setPosition(sx * R, 0.02, sz * R);
    slots.add(
      rr(fw + 0.4, fd + 0.4, 0.34, 4).map(([x, y]) => new Vector3(fx + x, 0, fz - y).applyMatrix4(fm)),
      { closed: true, ch: i },
    );
    const r0 = R + fz - fd / 2 - 0.26;
    const from = new Vector3(sx * r0, 0.03, sz * r0);
    const to = new Vector3(sx * 2.4, 0.03, sz * 2.4);
    const mid = from
      .clone()
      .lerp(to, 0.5)
      .add(new Vector3(sz * 0.9, 0, -sx * 0.9));
    const pts = new CatmullRomCurve3([from, mid, to]).getSpacedPoints(56);
    links.add(pts, { ch: i, seed: i * 0.13 });
    guides.add(pts);
  });
  const linkM = lineMat({ a: 'lineA', b: 'lineB', width: 2.2, alpha: 0.95, speed: 0.28, ch: linkCh });
  const guideM = lineMat({ a: 'guide', width: 1.1, alpha: 0.5, dash: 0.14 });
  const slotM = lineMat({ a: 'slot', width: 1.2, dash: 0.2, slot: true, ch: slotCh });
  lineMesh(guides, guideM, scene).renderOrder = -1;
  lineMesh(slots, slotM, scene).renderOrder = -1;
  lineMesh(links, linkM, scene).renderOrder = 1;

  /* Impact: shockwaves across the floor */
  const waves = [0, 1, 2].map(() => {
    const m = flatMat(FLAT_FS, 'tan', 0);
    const o = new Mesh(new RingGeometry(0.97, 1, 160), m);
    o.rotation.x = -HALF;
    o.position.y = 0.02;
    o.renderOrder = 6;
    scene.add(o);
    return { o, m };
  });
  let waveStart = -100;

  /* Annotations */
  const labels = opts.labels.map((el) => ({ el, key: el.dataset.k ?? '', chapter: Number(el.dataset.c), shown: false, x: -1e4, y: -1e4 }));

  /* In-canvas edge fade: the drawing dissolves at its own edges, with no CSS mask over the live canvas */
  const edge = { value: new Vector4(0.1, 0.06, 0.1, 0.06) };
  const fade = new Mesh(
    new PlaneGeometry(2, 2),
    new ShaderMaterial({
      vertexShader: EDGE_VS,
      fragmentShader: EDGE_FS,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: ZeroFactor,
      blendDst: SrcAlphaFactor,
      uniforms: { uEdge: edge },
    }),
  );
  fade.frustumCulled = false;
  fade.renderOrder = 100;
  scene.add(fade);

  /* Camera: scroll position → a pose between the keys, and direct flights for jumps */
  interface Pose {
    theta: number;
    radius: number;
    height: number;
    target: Vector3;
  }
  const keys = buildKeys();
  const look = new Vector3();
  const tmp = new Vector3();
  const poseAt = (t: number, out: Pose) => {
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const raw = clamp01((t - a.t) / (b.t - a.t));
    const u = reduced ? (raw > 0.5 ? 1 : 0) : smoother(clamp01((raw - 0.26) / 0.48));
    out.theta = lerp(a.theta, b.theta, u) + (t > N ? (t - N) * 0.45 : 0);
    out.radius = lerp(a.radius, b.radius, u);
    out.height = lerp(a.height, b.height, u);
    out.target.lerpVectors(a.target, b.target, u);
    return out;
  };
  const newPose = (): Pose => ({ theta: 0, radius: 1, height: 1, target: new Vector3() });
  const cur = poseAt(-1, newPose());
  const from = newPose();
  const to = newPose();
  const wrapAngle = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));
  let flight = 1;
  let flightDur = 1;
  let lift = 0;
  let flightT = -1;
  const applyPose = (p: Pose) => {
    camera.position.set(Math.sin(p.theta) * p.radius, p.height, Math.cos(p.theta) * p.radius);
    look.copy(p.target);
    if (zoom) camera.position.lerp(look, zoom);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    focus.value.copy(look);
    focusR.value = 3.6 + Math.max(0, p.height - 6) * 2.2;
  };

  let tTarget = -1;
  let tNow = -1;
  /** Camera pull towards the look point: >0 closer, <0 further. */
  let zoom = 0;
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
    camera.fov = desktop ? 30 : 33;
    // the scene has its own column (desktop) or band (phones), so only one capability needs to fill it
    zoom = desktop ? 0.1 - clamp01((1.15 - camera.aspect) / 0.4) * 0.24 : 0.08 + Math.min(0.14, clamp01((camera.aspect - 1.25) * 0.5));
    // desktop: lift the drawing a little so the model sits in the middle of its column
    if (desktop) camera.setViewOffset(width, height, 0, height * 0.07, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    edge.value.set(desktop ? 0.12 : 0.05, desktop ? 0.07 : 0.05, desktop ? 0.12 : 0.1, desktop ? 0.08 : 0.06);
    renderer.getDrawingBufferSize(res.value);
    const dpr = renderer.getPixelRatio();
    lineMats.forEach(({ m, o }) => (m.uniforms.uWidth.value = o.width * dpr));
  };

  /* What is on show: only the capability being told, built as you reach it and taken down as you leave.
     The document, the other capabilities and the links between them appear for the establishing shot
     and the Impact Analyser's overview. */
  const OVERVIEW = 8;
  const near = (c: number, t: number) => clamp01((t - c + 0.25) / 0.55) * (1 - clamp01((t - c - 0.8) / 0.4));
  const builds = new Float32Array(N);
  let docShow = 1;
  let wide = 1;
  const approach = (v: number, target: number, rate: number, dt: number) =>
    reduced ? target : v + (target - v) * (1 - Math.exp(-dt * rate));

  const update = (dt: number) => {
    const now = time.value;
    if (flight < 1) {
      // a jump from the index: fly straight there instead of sweeping through every chapter between
      flight = Math.min(1, flight + dt / flightDur);
      const e = smoother(flight);
      const arc = Math.sin(Math.PI * e) * lift;
      cur.theta = from.theta + wrapAngle(to.theta - from.theta) * e;
      cur.radius = lerp(from.radius, to.radius, e) * (1 + 0.2 * arc);
      cur.height = lerp(from.height, to.height, e) + 5 * arc;
      cur.target.lerpVectors(from.target, to.target, e);
      if (flight >= 1) {
        tNow = flightT;
        poseAt(tNow, cur);
      }
    } else {
      // ease towards the scroll position, independent of the display's refresh rate
      tNow = reduced ? tTarget : tNow + (tTarget - tNow) * (1 - Math.exp(-dt * 7.5));
      if (Math.abs(tTarget - tNow) < 0.0005) tNow = tTarget;
      poseAt(tNow, cur);
    }
    applyPose(cur);
    const t = flight < 1 ? flightT : tNow;

    const ov = clamp01((t - OVERVIEW + 0.25) / 0.5) * (1 - clamp01((t - OVERVIEW - 0.85) / 0.35));
    const intro = 1 - clamp01((t + 0.35) / 0.35);
    wide = approach(wide, Math.max(intro, ov), 5, dt);
    docShow = approach(docShow, Math.max(intro, ov, near(1, t)), 5, dt);
    pop(doc, docShow);
    for (let c = 0; c < N; c++) {
      const want = c === OVERVIEW ? ov : Math.max(near(c, t), ov);
      builds[c] = approach(builds[c], want, flight < 1 ? 3.2 : 6, dt);
      if (builds[c] < 0.001) builds[c] = want > 0 ? builds[c] : 0;
    }
    mods.forEach((m, c) => {
      m.group.visible = builds[c] > 0.001;
      if (m.group.visible) m.update(builds[c], reduced ? 0 : now);
      linkCh.value[c] = clamp01((Math.min(builds[c], ov) - 0.15) / 0.6);
      slotCh.value[c] = builds[c];
    });
    guideM.uniforms.uAlpha.value = 0.5 * wide;
    slotM.uniforms.uAlpha.value = wide;

    // impact wave
    const w = (now - waveStart) / 2.6;
    const running = w >= 0 && w <= 1.2;
    waves.forEach(({ o, m }, i) => {
      const ww = clamp01(w - i * 0.14);
      o.visible = running && ww > 0 && ww < 1;
      o.scale.setScalar(1.5 + easeOut(ww) * 13);
      m.uniforms.uAlpha.value = (1 - ww) * 0.8;
    });
    const flashAt = (d: number) => (running ? Math.exp(-Math.pow((w - d) / 0.1, 2)) : 0);
    const docFlash = flashAt(0.08);
    docKit.mats.forEach((m) => (m.uniforms.uFlash.value = docFlash));
    mods.forEach((m, c) => {
      const f = c === 1 ? flashAt(0.12) : flashAt(0.5);
      m.mats.forEach((mm) => (mm.uniforms.uFlash.value = f));
    });
    linkM.uniforms.uWave.value = running ? 1 - clamp01((w - 0.1) / 0.4) : -1;

    // annotations: only the chapter in view, once built and the camera has settled
    const chapter = Math.floor(t);
    const frac = t - chapter;
    const settled = flight >= 1 && (touch ? frac > 0.1 && frac < 0.97 : frac > 0.18 && frac < 0.9);
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
        // resizing clears the canvas: draw again at once, so no blank frame can show
        renderer.render(scene, camera);
      }
      frames = 0;
      slow = 0;
    }
  };

  const applyPalette = () => {
    bgU.value.set(...rgb(pal.bg));
    flashC.value.set(...rgb(pal.flash));
    ROLES.forEach((r, i) => palU.value[i].set(...rgb(pal.roles[r])));
    lineMats.forEach(({ m, o }) => {
      m.uniforms.uA.value.set(...rgb(colorOf(pal, o.a)));
      m.uniforms.uB.value.set(...rgb(colorOf(pal, o.b ?? o.a)));
      m.uniforms.uHead.value.set(...rgb(colorOf(pal, o.head ?? 'head')));
    });
    flatMats.forEach(({ m, key, k }) => {
      m.uniforms.uColor.value.set(...rgb(colorOf(pal, key)));
      if (key === 'shadow') m.uniforms.uAlpha.value = pal.shadowA * k;
    });
    gridMat.uniforms.uColor.value.set(...rgb(pal.grid));
    gridMat.uniforms.uAlpha.value = pal.gridA;
    mods.forEach((m) => m.onTheme?.());
  };

  resize();
  if (reduced) {
    update(0);
    ready = true;
    opts.onReady?.();
  }

  return {
    setProgress(t, jump = false) {
      // a jump of more than a chapter becomes a direct flight. On touch screens only a tap on the index
      // does: a fast swipe always moves through the story with the finger, and back again the same way.
      if (Math.abs(t - tTarget) > 1.2 && !reduced && active && (jump || !touch)) {
        Object.assign(from, { ...cur, target: from.target.copy(cur.target) });
        poseAt(t, to);
        const turn = Math.abs(wrapAngle(to.theta - from.theta));
        flightDur = 1.1 + 0.5 * (turn / Math.PI) + Math.abs(to.height - from.height) * 0.01;
        lift = Math.min(1, turn / 1.6);
        flight = 0;
        flightT = t;
      }
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
      // resizing clears the canvas, so draw again at once rather than leave a blank frame until the next tick
      update(0);
    },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const m = o as Mesh;
        m.geometry?.dispose();
        (m.material as Material | undefined)?.dispose?.();
      });
      quad.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
