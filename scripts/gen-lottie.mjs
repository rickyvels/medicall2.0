// Genera las animaciones Lottie propias de MediCall (sin assets de terceros).
// Uso: node scripts/gen-lottie.mjs  →  src/assets/lottie/*.json
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'lottie')
mkdirSync(OUT, { recursive: true })

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).concat(1)
const C = {
  mint: hex('#8fcfc0'), mintStrong: hex('#6bbaa8'), mintSoft: hex('#dff2ed'), dark: hex('#0f3d36'),
  lav: hex('#b9c8f2'), lavSoft: hex('#e8edfb'), peach: hex('#f6d5c4'), orange: hex('#f5b48a'),
  coral: hex('#e8998f'), yellow: hex('#f2cf8e'), white: [1, 1, 1, 1],
}

const val = (k) => ({ a: 0, k })
const arr = (v) => (Array.isArray(v) ? v : [v])
/** Propiedad animada: frames = [[t, valor], ...] */
const anim = (all) => {
  // Si dos keyframes comparten tiempo, prevalece el último
  const frames = all.filter((f, i) => !all[i + 1] || all[i + 1][0] !== f[0])
  return {
  a: 1,
  k: frames.map(([t, s], i) => {
    const n = arr(s).length
    const kf = { t, s: arr(s) }
    if (i < frames.length - 1) {
      kf.e = arr(frames[i + 1][1])
      kf.i = { x: Array(n).fill(0.6), y: Array(n).fill(1) }
      kf.o = { x: Array(n).fill(0.4), y: Array(n).fill(0) }
    }
    return kf
  }),
  }
}
const prop = (v) => (Array.isArray(v) && v.length && Array.isArray(v[0]) ? anim(v) : val(v))

const tr = ({ p = [0, 0], a = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) => ({
  ty: 'tr', p: prop(p), a: prop(a), s: prop(s), r: prop(r), o: prop(o), sk: val(0), sa: val(0),
})
const group = (items, t = {}, nm = 'g') => ({ ty: 'gr', nm, it: [...items, tr(t)] })
const ellipse = (size, p = [0, 0]) => ({ ty: 'el', p: val(p), s: val(size) })
const rect = (size, r = 0, p = [0, 0]) => ({ ty: 'rc', p: val(p), s: val(size), r: val(r) })
const path = (v, { i, o, c = true } = {}) => ({
  ty: 'sh',
  ks: val({ i: i ?? v.map(() => [0, 0]), o: o ?? v.map(() => [0, 0]), v, c }),
})
const fill = (c, o = 100) => ({ ty: 'fl', c: val(c), o: prop(o), r: 1 })
const stroke = (c, w, o = 100) => ({ ty: 'st', c: val(c), o: prop(o), w: val(w), lc: 2, lj: 2 })
const trim = (s, e) => ({ ty: 'tm', s: prop(s), e: prop(e), o: val(0), m: 1 })

let ind = 0
const layer = (shapes, ks = {}, nm = 'layer', op) => ({
  ddd: 0, ind: ++ind, ty: 4, nm, sr: 1,
  ks: {
    o: prop(ks.o ?? 100), r: prop(ks.r ?? 0), p: prop(ks.p ?? [0, 0, 0]),
    a: prop(ks.a ?? [0, 0, 0]), s: prop(ks.s ?? [100, 100, 100]),
  },
  ao: 0, shapes, ip: 0, op, st: 0, bm: 0,
})

const comp = (nm, w, h, op, layers) => {
  ind = 0
  return { v: '5.7.0', fr: 30, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers }
}
const save = (name, data) => writeFileSync(join(OUT, `${name}.json`), JSON.stringify(data))
const withInd = (build) => {
  ind = 0
  return build()
}

// Un ciclo "expandir y desvanecer" dentro de [t0, t1]; fuera de él queda invisible.
const burst = (t0, t1, from, to, o = 70) => ({
  s: [[0, from], [t0, from], [t1, to], [t1 + 1, from]],
  o: [[0, 0], [t0, o], [t1, 0]],
})

// Corazón paramétrico, suavizado con Catmull-Rom → bézier
const heartPath = (scale = 5.2, n = 28) => {
  const pts = Array.from({ length: n }, (_, k) => {
    const t = (k / n) * Math.PI * 2
    return [scale * 16 * Math.sin(t) ** 3, -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) + 6]
  })
  const at = (k) => pts[(k + n) % n]
  return {
    v: pts,
    i: pts.map((_, k) => [(at(k - 1)[0] - at(k + 1)[0]) / 6, (at(k - 1)[1] - at(k + 1)[1]) / 6]),
    o: pts.map((_, k) => [(at(k + 1)[0] - at(k - 1)[0]) / 6, (at(k + 1)[1] - at(k - 1)[1]) / 6]),
  }
}
const HEART = heartPath()

// ---------- 1. heartbeat ----------
save('heartbeat', withInd(() => {
  const OP = 72
  const beat = [[0, [100, 100, 100]], [8, [116, 116, 100]], [14, [100, 100, 100]], [22, [110, 110, 100]], [30, [100, 100, 100]], [OP, [100, 100, 100]]]
  const heart = layer([
    group([rect([22, 70], 6), rect([70, 22], 6), fill(C.dark)], { p: [0, -6] }, 'cross'),
    group([ellipse([34, 18], [-44, -48]), fill(C.white, 55)], { r: -30 }, 'shine'),
    group([path(HEART.v, HEART), fill(C.mint), stroke(C.mintStrong, 6)], {}, 'heart'),
  ], { p: [200, 180, 0], s: beat }, 'Heart', OP)
  const ecg = layer([
    group([path([[40, 335], [135, 335], [158, 335], [176, 292], [196, 370], [214, 305], [230, 335], [360, 335]], { c: false }), stroke(C.dark, 6), trim([[0, 0], [56, 0], [OP, 100]], [[0, 0], [40, 100], [OP, 100]])], {}, 'ecg'),
  ], {}, 'ECG', OP)
  const ripples = [0, 12, 24].map((t0, k) => {
    const b = burst(t0, t0 + 48, [60, 60], [190, 190], 65)
    return layer([group([ellipse([200, 200]), stroke(k === 1 ? C.lav : C.mint, 4)], {}, 'r')], { p: [200, 180, 0], s: b.s.map(([t, v]) => [t, [...v, 100]]), o: b.o }, `Ripple ${k}`, OP)
  })
  const dots = [[70, 90, C.lav, 10, 0], [335, 120, C.peach, 14, 20], [320, 270, C.mint, 9, 40], [80, 250, C.yellow, 12, 10]].map(([x, y, c, r, ph], k) =>
    layer([group([ellipse([r * 2, r * 2]), fill(c)], {}, 'dot')], { p: [[0, [x, y, 0]], [OP / 2, [x, y - 12 - ph / 4, 0]], [OP, [x, y, 0]]] }, `Dot ${k}`, OP))
  const blob = layer([group([ellipse([320, 320]), fill(C.lavSoft, 70)])], { p: [200, 180, 0], s: [[0, [100, 100, 100]], [OP / 2, [105, 105, 100]], [OP, [100, 100, 100]]] }, 'Blob', OP)
  return comp('heartbeat', 400, 400, OP, [heart, ecg, ...ripples, ...dots, blob])
}))

// ---------- 2. radar (búsqueda de médico) ----------
save('radar', withInd(() => {
  const OP = 90
  const disc = layer([
    group([rect([16, 50], 5), rect([50, 16], 5), fill(C.dark)]),
    group([ellipse([92, 92]), fill(C.mint), stroke(C.mintStrong, 5)]),
  ], { p: [200, 200, 0], s: [[0, [100, 100, 100]], [45, [108, 108, 100]], [OP, [100, 100, 100]]] }, 'Disc', OP)
  const rings = [0, 18, 36].map((t0, k) => {
    const b = burst(t0, t0 + 54, [50, 50], [210, 210], 60)
    return layer([group([ellipse([200, 200]), stroke(C.mintStrong, 4)])], { p: [200, 200, 0], s: b.s.map(([t, v]) => [t, [...v, 100]]), o: b.o }, `Ring ${k}`, OP)
  })
  const orbitCols = [C.lav, C.peach, C.mintStrong, C.yellow]
  const orbit = layer(
    orbitCols.map((c, k) => {
      const ang = (k * Math.PI) / 2
      return group([ellipse([22, 22]), fill(c)], { p: [Math.cos(ang) * 125, Math.sin(ang) * 125] }, `orb${k}`)
    }),
    { p: [200, 200, 0], r: [[0, 0], [OP, 360]] },
    'Orbit', OP,
  )
  return comp('radar', 400, 400, OP, [disc, orbit, ...rings])
}))

// ---------- 3. success (check + confeti) ----------
save('success', withInd(() => {
  const OP = 80
  const check = layer([
    group([path([[-38, 4], [-10, 32], [42, -26]], { c: false }), stroke(C.dark, 14), trim(0, [[0, 0], [14, 0], [32, 100], [OP, 100]])]),
  ], { p: [150, 150, 0] }, 'Check', OP)
  const disc = layer([group([ellipse([130, 130]), fill(C.mint), stroke(C.mintStrong, 6)])], {
    p: [150, 150, 0], s: [[0, [0, 0, 100]], [12, [112, 112, 100]], [20, [100, 100, 100]], [OP, [100, 100, 100]]],
  }, 'Disc', OP)
  const colors = [C.lav, C.peach, C.yellow, C.coral, C.mintStrong]
  const parts = Array.from({ length: 14 }, (_, k) => {
    const ang = (k / 14) * Math.PI * 2 + 0.3
    const d = 85 + (k % 3) * 22
    const c = colors[k % colors.length]
    const x = 150 + Math.cos(ang) * d, y = 150 + Math.sin(ang) * d + 14
    return layer([group([k % 2 ? rect([10, 10], 2) : ellipse([10, 10]), fill(c)])], {
      p: [[0, [150, 150, 0]], [14, [150, 150, 0]], [50, [x, y, 0]]],
      o: [[0, 0], [14, 100], [48, 100], [62, 0]],
      r: [[0, 0], [62, 180 * (k % 2 ? 1 : -1)]],
    }, `Confetti ${k}`, OP)
  })
  const ring = layer([group([ellipse([130, 130]), stroke(C.mint, 4)])], {
    p: [150, 150, 0], s: [[0, [100, 100, 100]], [12, [100, 100, 100]], [40, [230, 230, 100]], [OP, [230, 230, 100]]],
    o: [[0, 0], [12, 70], [40, 0]],
  }, 'Ring', OP)
  return comp('success', 300, 300, OP, [check, disc, ...parts, ring])
}))

// ---------- 4. flame (racha) ----------
save('flame', withInd(() => {
  const OP = 60
  const F = {
    v: [[100, 22], [150, 128], [100, 196], [50, 128]],
    i: [[0, 0], [0, -52], [42, 0], [0, 42]],
    o: [[0, 0], [0, 44], [-42, 0], [0, -52]],
  }
  const sway = [[0, [100, 100, 100]], [15, [93, 107, 100]], [30, [105, 96, 100]], [45, [95, 105, 100]], [OP, [100, 100, 100]]]
  const outer = layer([group([path(F.v, F), fill(C.orange), stroke(C.coral, 5)])], { p: [100, 196, 0], a: [100, 196, 0], s: sway, r: [[0, 0], [15, -3], [30, 3], [OP, 0]] }, 'Outer', OP)
  const inner = layer([group([path(F.v, F), fill(C.yellow)], { s: [55, 55], p: [45, 84] })], { p: [100, 196, 0], a: [100, 196, 0], s: [[0, [100, 100, 100]], [20, [90, 112, 100]], [40, [104, 94, 100]], [OP, [100, 100, 100]]] }, 'Inner', OP)
  return comp('flame', 200, 240, OP, [inner, outer])
}))

// ---------- 5. floaty (estados vacíos) ----------
save('floaty', withInd(() => {
  const OP = 120
  const bob = (x, y, amp, phase = 0) => [[0, [x, y + phase, 0]], [60, [x, y + phase - amp, 0]], [OP, [x, y + phase, 0]]]
  const main = layer([
    group([rect([14, 46], 5), rect([46, 14], 5), fill(C.mintStrong)]),
    group([ellipse([104, 104]), fill(C.mintSoft), stroke(C.mint, 5)]),
  ], { p: bob(150, 120, 10), s: [[0, [100, 100, 100]], [60, [104, 104, 100]], [OP, [100, 100, 100]]] }, 'Main', OP)
  const pillA = layer([group([rect([31, 26], 0, [-15.5, 0]), fill(C.white, 55)]), group([rect([62, 26], 13), fill(C.lav)])], { p: bob(70, 70, 12), r: [[0, -28], [60, -20], [OP, -28]] }, 'PillA', OP)
  const pillB = layer([group([rect([28, 24], 0, [14, 0]), fill(C.coral, 70)]), group([rect([56, 24], 12), fill(C.peach)])], { p: bob(232, 176, -10), r: [[0, 32], [60, 24], [OP, 32]] }, 'PillB', OP)
  const circles = [[240, 70, 16, C.yellow, 8], [58, 188, 12, C.mintStrong, -9], [200, 30, 8, C.lav, 6]].map(([x, y, r, c, a], k) =>
    layer([group([ellipse([r * 2, r * 2]), fill(c)])], { p: bob(x, y, a) }, `Circle ${k}`, OP))
  const shadow = layer([group([ellipse([84, 12]), fill(C.dark, 10)])], { p: [150, 205, 0], s: [[0, [100, 100, 100]], [60, [86, 86, 100]], [OP, [100, 100, 100]]] }, 'Shadow', OP)
  return comp('floaty', 300, 240, OP, [main, pillA, pillB, ...circles, shadow])
}))

// ---------- 6. sparkle ----------
save('sparkle', withInd(() => {
  const OP = 60
  const star = (size) => path([[0, -size], [size * 0.22, -size * 0.22], [size, 0], [size * 0.22, size * 0.22], [0, size], [-size * 0.22, size * 0.22], [-size, 0], [-size * 0.22, -size * 0.22]])
  const mk = (x, y, size, c, t0, k) => {
    const pts = [[t0, 35], [t0 + 15, 100], [t0 + 30, 35]].filter(([n]) => n <= OP)
    const keys = [[0, 35], ...pts, [OP, 35]].sort((a, b) => a[0] - b[0]).filter((v, i, a) => !i || v[0] !== a[i - 1][0])
    return layer([group([star(size), fill(c)])], { p: [x, y, 0], s: keys.map(([n, v]) => [n, [v, v, 100]]), r: [[0, 0], [OP, 90]] }, `Star ${k}`, OP)
  }
  return comp('sparkle', 200, 200, OP, [mk(100, 100, 42, C.yellow, 0, 0), mk(40, 50, 20, C.lav, 14, 1), mk(158, 60, 16, C.peach, 28, 2), mk(150, 150, 22, C.mint, 40, 3), mk(46, 152, 14, C.coral, 8, 4)])
}))

// ---------- 7. calendar ----------
save('calendar', withInd(() => {
  const OP = 120
  const body = layer([
    group([rect([180, 50], 22, [0, -60]), rect([180, 26], 0, [0, -48]), fill(C.mint)]),
    group([rect([180, 170], 22), fill(C.white), stroke(C.mint, 5)]),
  ], { p: [150, 160, 0], s: [[0, [100, 100, 100]], [60, [102, 102, 100]], [OP, [100, 100, 100]]] }, 'Body', OP)
  const rings = [-48, 48].map((x, k) => layer([group([rect([12, 36], 6), fill(C.dark)])], { p: [150 + x, 84, 0] }, `Ring ${k}`, OP))
  const cells = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const d = (r * 4 + c) * 3
    cells.push(layer([group([ellipse([16, 16]), fill(r === 1 && c === 2 ? C.coral : C.lavSoft)])], { p: [150 + (c - 1.5) * 34, 150 + r * 30, 0], s: [[0, [100, 100, 100]], [Math.min(60 + d, 100), [r === 1 && c === 2 ? 130 : 100, r === 1 && c === 2 ? 130 : 100, 100]], [OP, [100, 100, 100]]] }, `Cell ${r}${c}`, OP))
  }
  const sp = layer([group([path([[0, -14], [3, -3], [14, 0], [3, 3], [0, 14], [-3, 3], [-14, 0], [-3, -3]]), fill(C.yellow)])], { p: [238, 78, 0], s: [[0, [60, 60, 100]], [60, [120, 120, 100]], [OP, [60, 60, 100]]], r: [[0, 0], [OP, 180]] }, 'Spark', OP)
  return comp('calendar', 300, 260, OP, [sp, ...rings, ...cells, body])
}))

// ---------- 8. pulse-line (banner ECG) ----------
save('pulse-line', withInd(() => {
  const OP = 90
  const v = [[0, 60]]
  for (let x = 40; x < 600; x += 150) v.push([x, 60], [x + 28, 60], [x + 44, 18], [x + 62, 104], [x + 78, 40], [x + 92, 60])
  v.push([600, 60])
  const line = layer([group([path(v, { c: false }), stroke(C.mintStrong, 4), trim([[0, 0], [48, 0], [OP, 100]], [[0, 0], [40, 100], [OP, 100]])])], {}, 'Line', OP)
  const base = layer([group([path([[0, 60], [600, 60]], { c: false }), stroke(C.mint, 2, 40)])], {}, 'Base', OP)
  return comp('pulse-line', 600, 120, OP, [line, base])
}))

console.log('Lottie generadas en', OUT)
