// Tokkey 3D for the "Release the True Power" story (#sr)
// Scroll-driven pose (set by index.html via window.TK3D_POSE) -> plug / unplug / hero,
// then free drag + tag-driven exploded view with leader-line labels.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

// artifacts can't serve .glb/.hdr, so the binaries ship as base64 ES modules (model_glb.js, env_hdr.js)
const toBuf = (b64) => { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; };

const MAT = {
  body:      { color: 0xc2c6cb, metalness: 1.0, roughness: 0.44, envMapIntensity: 1.3 },
  usb:       { color: 0x6f7378, metalness: 1.0, roughness: 0.38, envMapIntensity: 1.35 },
  lensPanel: { color: 0x0d0f12, metalness: 0.35, roughness: 0.30, envMapIntensity: 1.0 },
  lensArt:   { color: 0xd8dade, metalness: 0.55, roughness: 0.38, envMapIntensity: 1.2 },
  text:      { color: 0xe8eaed, metalness: 0.6, roughness: 0.30, envMapIntensity: 1.3 },
  inner:     { color: 0x2a2d31, metalness: 0.2, roughness: 0.75, envMapIntensity: 0.5 },
  glass:     { color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1.0, thickness: 0.0012, ior: 1.48,
               attenuationColor: 0xffffff, attenuationDistance: Infinity, specularIntensity: 0.6, envMapIntensity: 0.45 },
};
const PRESETS = { '金属2': MAT.body, '金属1': MAT.usb, OctMetal2: MAT.lensPanel, OctMetal2_0: MAT.lensArt,
                  OctGlossy1: MAT.text, OctDiffuse1: MAT.inner, OctSpecular1: MAT.glass };

const sr = document.getElementById('sr');
const cv = document.getElementById('tk3d');
if (!sr || !cv) throw new Error('sr3d: #sr / #tk3d missing');

// pose written by index.html every frame (px in viewport space)
const P = window.TK3D_POSE = Object.assign({ vis: 0, x: 0, y: 0, h: 300, morph: 0, live: false, light: 0, plugZ: Math.PI / 2, plugX: 0 }, window.TK3D_POSE || {});

const DEPTH = 1, FOV = 22, UNIT = 0.075; // camera distance, fov, model's largest side (m)
let started = false, visible = false, ready = false;
let renderer, scene, camera, pivot, modelRoot, glowEl;
let W = 1, H = 1, upp = 0.001;
let table = null, scaleK = 1;
const groups = [];            // { meshes:[], offset:Vector3, c0:Vector3, mats:[] }
let sel = -1, tClock = 0, tTarget = 0, lastT = performance.now();
let yawD = 0, pitchD = 0, velY = 0, velP = 0, autoYaw = -0.3, dragging = false, lx = 0, ly = 0;
let opNow = [1, 1, 1, 1];
const SPREAD = 0.16, EXPLODE_MS = 1500;
const smoother = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10));
const NAMES = [
  ['Light panel', 'Diffuses the breathing light.'],
  ['Top cover', 'Sits over the board and carries the Tokkey mark.'],
  ['Core board', 'Chips and local memory.'],
  ['Shell + USB-C', 'Metal body that plugs straight into your Mac.'],
];

const dock = document.getElementById('tkdock');
const capT = document.getElementById('tkcT'), capP = document.getElementById('tkcP'), capN = document.getElementById('tkcN');
const labsEl = document.getElementById('tklabs');
const lnSvg = document.getElementById('tkln');
const labEls = [], lnPaths = [], lnDots = [];
if (labsEl && lnSvg) {
  const NS = 'http://www.w3.org/2000/svg';
  for (let g = 0; g < 4; g++) {
    const d = document.createElement('div'); d.className = 'tkl';
    d.innerHTML = `<i>0${g + 1}</i><b>${NAMES[g][0]}</b>`;
    labsEl.appendChild(d); labEls.push(d);
    const p = document.createElementNS(NS, 'path'), c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '4');
    lnSvg.appendChild(p); lnSvg.appendChild(c); lnPaths.push(p); lnDots.push(c);
  }
}
glowEl = document.getElementById('tkglow');

function select(i) {
  sel = (i === sel) ? -1 : i;
  tTarget = sel >= 0 ? 1 : 0;
  document.querySelectorAll('.tkb').forEach((b) => b.classList.toggle('on', +b.dataset.g === sel));
  if (capT) { capT.textContent = sel >= 0 ? NAMES[sel][0] : 'Take it apart'; }
  if (capP) { capP.textContent = sel >= 0 ? NAMES[sel][1] : 'Pick a part to see inside.'; }
  if (capN) { capN.textContent = sel >= 0 ? '0' + (sel + 1) + ' / 04' : '00 / 04'; }
}
window.TK3D = { select, pose: P };
document.querySelectorAll('.tkb').forEach((b) => b.addEventListener('click', () => select(+b.dataset.g)));

function boot() {
  if (started) return; started = true;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { console.warn('[tk3d] no WebGL', e); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 10);
  camera.position.set(0, 0, DEPTH);

  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(1.4, -1.8, 2.4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xf2f4f7, 1.1); fill.position.set(-2, -0.8, 0.6); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.4); rim.position.set(0.3, 2.2, 1.1); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  pivot = new THREE.Group(); scene.add(pivot);
  window.__tk3d = { scene, camera, pivot, P, groups, select };

  const pm = new THREE.PMREMGenerator(renderer);
  import('./env_hdr.js').then((m) => {
    const d = new HDRLoader().parse(toBuf(m.default));
    const t = new THREE.DataTexture(d.data, d.width, d.height, d.format, d.type);
    t.colorSpace = THREE.LinearSRGBColorSpace; t.minFilter = t.magFilter = THREE.LinearFilter; t.flipY = true; t.generateMipmaps = false; t.needsUpdate = true;
    t.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pm.fromEquirectangular(t).texture;
    scene.environmentRotation.set(0, 3.0, 0);
    pm.dispose();
  });

  Promise.all([import('./model_glb.js'), fetch('explode.json').then((r) => (r.ok ? r.json() : null)).catch(() => null)]).then(([m, tb]) => {
    table = tb;
    new GLTFLoader().parse(toBuf(m.default), '', (gltf) => { setup(gltf); }, (e) => console.warn('[tk3d] model failed', e));
  });

  new ResizeObserver(resize).observe(cv); resize();
  cv.addEventListener('pointerdown', (e) => {
    if (!P.live) return; dragging = true; lx = e.clientX; ly = e.clientY; velY = velP = 0; cv.setPointerCapture(e.pointerId); cv.classList.add('drag');
  });
  cv.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    velY = dx * 0.009; velP = dy * 0.006; yawD += velY; pitchD = Math.max(-1.1, Math.min(1.1, pitchD + velP));
  });
  const up = () => { dragging = false; cv.classList.remove('drag'); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  requestAnimationFrame(loop);
}

function setup(gltf) {
  modelRoot = gltf.scene;
  modelRoot.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const out = mats.map((m) => {
      const tune = PRESETS[m.name] || MAT.body;
      let nm;
      if (tune.transmission !== undefined) {
        nm = new THREE.MeshPhysicalMaterial({ ...tune, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false });
        nm.userData.glass = true;
      } else {
        nm = m.clone(); nm.color.setHex(tune.color); nm.metalness = tune.metalness; nm.roughness = tune.roughness; nm.envMapIntensity = tune.envMapIntensity;
      }
      nm.name = m.name; nm.needsUpdate = true; return nm;
    });
    o.material = Array.isArray(o.material) ? out : out[0];
  });
  // bake transforms, scale to 7.5 cm (same as the standalone preview, so explode.json offsets line up)
  const raw = new THREE.Box3().setFromObject(modelRoot).getSize(new THREE.Vector3());
  scaleK = UNIT / Math.max(raw.x, raw.y, raw.z);
  modelRoot.updateMatrixWorld(true);
  const inv = new THREE.Matrix4(); if (modelRoot.parent) inv.copy(modelRoot.parent.matrixWorld).invert();
  const toRoot = new THREE.Matrix4().multiplyMatrices(inv, modelRoot.matrixWorld);
  modelRoot.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(toRoot, o.matrixWorld));
    o.position.set(0, 0, 0); o.quaternion.identity(); o.scale.set(1, 1, 1); o.updateMatrix();
    o.geometry.applyMatrix4(new THREE.Matrix4().makeScale(scaleK, scaleK, scaleK));
    o.geometry.computeBoundingBox(); o.geometry.computeBoundingSphere();
  });
  modelRoot.traverse((o) => { if (o === modelRoot || o.isMesh) return; o.position.set(0, 0, 0); o.quaternion.identity(); o.scale.set(1, 1, 1); o.updateMatrix(); });
  modelRoot.position.set(0, 0, 0); modelRoot.quaternion.identity(); modelRoot.scale.set(1, 1, 1); modelRoot.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(modelRoot), c = b.getCenter(new THREE.Vector3());
  modelRoot.position.set(-c.x, -c.y, -c.z); modelRoot.updateMatrixWorld(true);
  pivot.add(modelRoot);

  // explode groups (explode.json: group_of + per-object offsets, metres in source units -> * scaleK)
  for (let g = 0; g < 4; g++) groups.push({ meshes: [], offset: new THREE.Vector3(), box: new THREE.Box3(), c0: new THREE.Vector3() });
  if (table && table.objects && table.group_of) {
    modelRoot.traverse((o) => {
      if (!o.isMesh) return;
      const off = table.objects[o.name]; const gi = table.group_of[o.name];
      if (!off || gi === undefined || !groups[gi]) return;
      const G = groups[gi]; G.meshes.push({ mesh: o, off: new THREE.Vector3(off[0], off[1], off[2]).multiplyScalar(scaleK) });
      G.box.union(o.geometry.boundingBox);
    });
    groups.forEach((G) => { G.box.getCenter(G.c0); if (G.meshes.length) G.offset.copy(G.meshes[0].off); });
  }
  ready = true;
  window.__tk3d.table = !!table;
}

function resize() {
  W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
  if (!renderer) return;
  renderer.setSize(W, H, false);
  camera.aspect = W / H; camera.updateProjectionMatrix();
  upp = 2 * DEPTH * Math.tan(FOV * Math.PI / 360) / H; // world units per css px at the model's depth
}
window.__tk3dResize = resize;

const _b = new THREE.Box3(), _t = new THREE.Vector3(), _ub = new THREE.Box3(), _ctr = new THREE.Vector3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _qd = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3();
function project(x, y, z) { // pivot-local point -> css px
  _v.set(x, y, z); pivot.localToWorld(_v); _v.project(camera);
  return [(_v.x + 1) * 0.5 * W, (1 - _v.y) * 0.5 * H];
}

function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  const vis = P.vis;
  cv.style.opacity = vis.toFixed(3);
  cv.style.pointerEvents = (P.live && vis > 0.5) ? 'auto' : 'none';
  if (!ready || !visible || vis < 0.01) { if (glowEl) glowEl.style.opacity = 0; labsEl && (labsEl.style.opacity = 0); return; }

  // explode clock + per-group phase (top group lifts first, bottom group returns first)
  const dir = tTarget > tClock ? 1 : -1;
  tClock = Math.max(0, Math.min(1, tClock + dir * dt / (EXPLODE_MS / 1000)));
  if (Math.abs(tTarget - tClock) < 1e-4) tClock = tTarget;
  const pg = groups.map((G, k) => smoother((tClock - SPREAD * k / 3) / (1 - SPREAD)));
  groups.forEach((G, k) => { G.meshes.forEach((m) => { m.mesh.position.copy(m.off).multiplyScalar(pg[k]); }); });
  // keep the exploded stack centred: centre of the union of the moved group boxes
  _ub.makeEmpty();
  groups.forEach((G, k) => { if (!G.meshes.length) return; _b.copy(G.box).translate(_t.copy(G.offset).multiplyScalar(pg[k])); _ub.union(_b); });
  if (!_ub.isEmpty()) { _ub.getCenter(_ctr); modelRoot.position.copy(_ctr).negate(); }
  const exK = smoother(tClock);

  // drag inertia + idle spin (spin pauses while a part is selected)
  if (!dragging) { yawD += velY; pitchD = Math.max(-1.1, Math.min(1.1, pitchD + velP)); velY *= 0.93; velP *= 0.93; }
  if (P.live && !dragging && sel < 0) autoYaw += dt * 0.35;
  // idle pitch drifts back so the hero view stays readable
  if (!dragging) pitchD *= 0.995;

  // orientation: plugged (top-down) -> hero 3/4, then drag layered on top
  _q.setFromEuler(_e.set(P.plugX, 0, P.plugZ, 'XYZ'));
  _q2.setFromEuler(_e.set(0.58, autoYaw, 0, 'XYZ'));
  _q.slerp(_q2, P.morph);
  _qd.setFromEuler(_e.set(pitchD, yawD, 0, 'XYZ'));
  pivot.quaternion.copy(_qd).multiply(_q);
  const sc = (P.h * upp) / UNIT * (1 - 0.36 * exK);
  pivot.scale.setScalar(sc);
  pivot.position.set((P.x - W / 2) * upp, -(P.y - H / 2 - exK * H * 0.02) * upp, 0);
  pivot.updateMatrixWorld(true);

  // highlight: dim everything but the selected group
  groups.forEach((G, k) => {
    const want = sel < 0 || sel === k ? 1 : 0.14;
    opNow[k] += (want - opNow[k]) * 0.14;
    G.meshes.forEach((m) => {
      const mats = Array.isArray(m.mesh.material) ? m.mesh.material : [m.mesh.material];
      mats.forEach((mt) => { const o = opNow[k]; mt.opacity = o; mt.transparent = o < 0.99 || !!mt.userData.glass; mt.depthWrite = o >= 0.99 && !mt.userData.glass; });
    });
  });

  renderer.render(scene, camera);

  // leader-line labels (exploded diagram)
  const ex = smoother(tClock);
  if (labsEl) {
    labsEl.style.opacity = (ex * Math.min(1, vis * 2)).toFixed(3);
    if (ex > 0.02) {
      const pts = groups.map((G, k) => { const c = G.c0.clone().add(G.offset.clone().multiplyScalar(pg[k])).add(modelRoot.position); return project(c.x, c.y, c.z); });
      const xL = Math.min(W - 230, P.x + P.h * 0.6 + 70);
      const order = pts.map((p, k) => k).sort((a, b) => pts[a][1] - pts[b][1]);
      const ly = []; let prev = -1e9;
      order.forEach((k) => { const y = Math.max(pts[k][1], prev + 66); ly[k] = y; prev = y; });
      const shift = (pts.reduce((s, p) => s + p[1], 0) - ly.reduce((s, y) => s + y, 0)) / 4; // keep the stack centred on the parts
      groups.forEach((G, k) => {
        const y = ly[k] + shift, on = sel < 0 || sel === k;
        labEls[k].style.transform = `translate(${xL}px,${y}px) translateY(-50%)`;
        labEls[k].style.opacity = on ? 1 : 0.5;
        const [px, py] = pts[k], xm = xL - 40;
        lnPaths[k].setAttribute('d', `M${px.toFixed(1)} ${py.toFixed(1)}H${xm.toFixed(1)}V${y.toFixed(1)}H${(xL - 12).toFixed(1)}`);
        lnPaths[k].setAttribute('class', on ? 'on' : '');
        lnDots[k].setAttribute('cx', px.toFixed(1)); lnDots[k].setAttribute('cy', py.toFixed(1));
        lnDots[k].setAttribute('class', on ? 'on' : '');
      });
    }
  }
  // breathing glow: lit while plugged, off when unplugged, breathes when "Light panel" is picked
  if (glowEl) {
    const t = now / 1000, br = 0.55 + 0.45 * Math.sin(t * 2.1);
    const lit = Math.max(P.light, sel === 0 ? 0.6 + 0.4 * br : 0);
    glowEl.style.opacity = (lit * vis).toFixed(3);
    let gx = P.x, gy = P.y;
    if (sel === 0 && ex > 0.5 && groups.length) { const c = groups[0].c0.clone().add(groups[0].offset.clone().multiplyScalar(pg[0])).add(modelRoot.position); [gx, gy] = project(c.x, c.y, c.z); }
    glowEl.style.transform = `translate(${gx.toFixed(1)}px,${gy.toFixed(1)}px) scale(${((P.h / 300) * (sel === 0 ? 1.2 + 0.15 * br : 1)).toFixed(3)})`;
  }
}

new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }, { rootMargin: '0px' }).observe(sr);
const lazy = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { lazy.disconnect(); boot(); } }, { rootMargin: '200% 0px' });
lazy.observe(sr);
