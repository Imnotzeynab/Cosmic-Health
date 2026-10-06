/* Page to open after "Done" (e.g. "indicators.html"). Leave empty to stay on this page. */
const NEXT_PAGE = "healthind.html";

const stage = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, .1, 50);
camera.position.set(0, .95, 4.8); camera.lookAt(0, .92, 0);
scene.add(new THREE.AmbientLight(0xffffff, .7));
const d1 = new THREE.DirectionalLight(0xffffff, .8); d1.position.set(2, 3, 4); scene.add(d1);
const d2 = new THREE.DirectionalLight(0x6aa8ff, .5); d2.position.set(-3, 1, -3); scene.add(d2);
const body = new THREE.Group(); scene.add(body);
const meshes = [], BASE = 0x7fb2ff;
const S = r => new THREE.SphereGeometry(r, 32, 24), C = (a, b, h) => new THREE.CylinderGeometry(a, b, h, 24);
function add(geo, name, x, y, z, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: BASE, roughness: .55, metalness: .1, emissive: 0x000000 }));
  m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.userData.part = name; body.add(m); meshes.push(m); return m;
}
add(S(.11), 'Head', 0, 1.68, 0, 1, 1.15, 1.05);
add(C(.045, .05, .1), 'Neck', 0, 1.54, 0);
add(S(.17), 'Chest', 0, 1.35, 0, 1.2, 1, .7);
add(S(.15), 'Abdomen', 0, 1.12, 0, 1.05, 1, .72);
add(S(.16), 'Pelvis', 0, .92, 0, 1.1, .8, .75);
[1, -1].forEach(s => {
  const n = s > 0 ? 'Left' : 'Right';
  add(S(.065), n + ' shoulder', s * .23, 1.45, 0);
  add(C(.05, .042, .27), n + ' upper arm', s * .27, 1.29, 0);
  add(C(.04, .032, .26), n + ' forearm', s * .29, .97, 0);
  add(S(.05), n + ' hand', s * .3, .78, 0, .9, 1.3, .7);
  add(C(.085, .065, .42), n + ' thigh', s * .09, .68, 0);
  add(S(.062), n + ' knee', s * .09, .46, 0);
  add(C(.058, .04, .4), n + ' shin', s * .09, .24, 0);
  add(S(.05), n + ' foot', s * .09, .04, .05, 1, .6, 2);
});
function label(p, back) {
  if (!back) return p;
  return ({ Head: 'Back of head', Neck: 'Back of neck', Chest: 'Upper back', Abdomen: 'Lower back', Pelvis: 'Glutes / hips (rear)' })[p] || p + ' (rear)';
}

/* ---------- selection state ---------- */
const sel = new Map(); // label -> { mesh, pin, point:[x,y,z] }
const list = document.getElementById('list'), done = document.getElementById('done'),
  msg = document.getElementById('msg'), hoverEl = document.getElementById('hover');
let hovered = null;

function tint() {
  meshes.forEach(m => {
    let on = false; sel.forEach(v => { if (v.mesh === m) on = true; });
    m.material.emissive.setHex(on ? 0x8a1020 : m === hovered ? 0x16396b : 0x000000);
    m.material.color.setHex(on ? 0xff7a86 : BASE);
  });
}
function say(text, isErr) { msg.textContent = text; msg.className = isErr ? 'err' : ''; }

/* ---------- healthdata.js integration ---------- */
function hasUser() { return typeof getCurrentUserId === 'function' && !!getCurrentUserId(); }
function persist() {
  if (typeof saveBodyAreas !== 'function') { say('healthdata.js is missing saveBodyAreas() – see the patch.', true); return false; }
  if (!hasUser()) { say('No current user found, so nothing was saved. Sign in first.', true); return false; }
  const old = typeof getBodyAreas === 'function' ? getBodyAreas() : [];
  saveBodyAreas([...sel].map(([label, v]) => {
    const prev = old.find(a => a.label === label) || {};
    return Object.assign({}, prev, { label, part: v.mesh.userData.part });
  }));
  return true;
}

function render() {
  list.innerHTML = '';
  if (!sel.size) list.innerHTML = '<p>Nothing selected yet.</p>';
  sel.forEach((v, k) => {
    const c = document.createElement('span'); c.className = 'chip'; c.textContent = k;
    const x = document.createElement('button'); x.textContent = '×'; x.setAttribute('aria-label', 'Remove ' + k);
    x.onclick = () => { remove(k); persist(); }; c.appendChild(x); list.appendChild(c);
  });
  done.disabled = !sel.size; tint();
}
function addSel(lbl, mesh) { sel.set(lbl, { mesh }); }
function remove(k) { if (!sel.has(k)) return; sel.delete(k); say(''); render(); }

/* ---------- picking & rotation ---------- */
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
function pick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const h = ray.intersectObjects(meshes)[0]; if (!h) return null;
  const lp = body.worldToLocal(h.point.clone());
  return { mesh: h.object, lp, label: label(h.object.userData.part, lp.z < h.object.position.z - .005) };
}
function select(h) {
  if (sel.has(h.label)) { remove(h.label); persist(); return; }
  addSel(h.label, h.mesh); say(''); render(); persist();
}
let down = null, target = null;
const cv = renderer.domElement;
cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, moved: 0 }; target = null; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', e => {
  if (down) { const dx = e.clientX - down.x; down.moved += Math.abs(dx) + Math.abs(e.clientY - down.y); body.rotation.y += dx * .01; down.x = e.clientX; down.y = e.clientY; return; }
  const h = pick(e); hovered = h ? h.mesh : null; hoverEl.textContent = h ? h.label : ''; tint();
});
cv.addEventListener('pointerup', e => { const was = down; down = null; if (was && was.moved < 8) { const h = pick(e); if (h) select(h); } });
cv.addEventListener('pointerleave', () => { hovered = null; hoverEl.textContent = ''; tint(); });
document.getElementById('front').onclick = () => target = Math.round(body.rotation.y / (2 * Math.PI)) * 2 * Math.PI;
document.getElementById('back').onclick = () => target = Math.round(body.rotation.y / (2 * Math.PI)) * 2 * Math.PI + Math.PI;
document.getElementById('clear').onclick = () => { [...sel.keys()].forEach(remove); persist(); };
done.onclick = () => {
  if (!persist()) return;
  say('✓ ' + sel.size + ' area' + (sel.size > 1 ? 's' : '') + ' saved.');
  if (NEXT_PAGE) location.href = NEXT_PAGE;
};

function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(stage); resize();
(function loop(t) {
  if (target !== null && !down) { body.rotation.y += (target - body.rotation.y) * .12; if (Math.abs(target - body.rotation.y) < .003) target = null; }
  renderer.render(scene, camera); requestAnimationFrame(loop);
})(0);

/* ---------- restore previously saved areas ---------- */
if (typeof getBodyAreas === 'function' && hasUser()) {
  getBodyAreas().forEach(a => {
    const m = meshes.find(x => x.userData.part === a.part);
    if (m) addSel(a.label, m);
  });
}
render();