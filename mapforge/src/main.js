import { seedRng, hashStr } from './rng.js';
import { parsePrompt } from './prompt.js';
import { parsePromptWithClaude } from './claudeParser.js';
import { generateMapImage } from './imageGen.js';
import { ENVS } from './envs.js';
import { generateBSP, generateCellular, generateSingleRoom, placeObjects, placeObjectsFromSpec } from './generator.js';
import { loadAssets, ENV_PROPS, PROP_DEFS } from './assets.js';
import { initRenderer, renderMap, getViewport, fitView } from './renderer.js';
import { buildAssetPickerHTML, initAssetLayer, placeAsset } from './assetPicker.js';

const SIZES = {
  small:  { w: 18, h: 12 },
  medium: { w: 24, h: 16 },
  large:  { w: 32, h: 20 },
};

// ── UI helpers ─────────────────────────────────────────────
const $ = id => document.getElementById(id);

function setStatus(msg) { $('status-msg').textContent = msg; }

function setLoading(on) {
  const btn = $('btn-generate');
  btn.disabled = on;
  btn.textContent = on ? '⟳  GENERATING...' : '▶  GENERATE MAP';
}

// ── Generation overlay ─────────────────────────────────────
const STEPS = ['PARSE', 'LAYOUT', 'IMAGE', 'ASSETS', 'RENDER'];

function overlayShow() {
  $('gen-overlay').style.display = 'flex';
  _setStepDots(-1);
}

function overlayHide() {
  $('gen-overlay').style.display = 'none';
}

function _setStepDots(activeIdx) {
  const dots  = $('gen-steps-row').querySelectorAll('.gen-sdot');
  const lines = $('gen-steps-row').querySelectorAll('.gen-sdot-line');
  dots.forEach((d, i) => {
    d.classList.toggle('done',   i < activeIdx);
    d.classList.toggle('active', i === activeIdx);
  });
  lines.forEach((l, i) => l.classList.toggle('done', i < activeIdx));
}

function setStep(stepIdx, label, detail, pct) {
  $('gen-step-name').textContent   = label;
  $('gen-step-detail').textContent = detail;
  _setStepDots(stepIdx);
  _setPct(pct);
}

function _setPct(pct) {
  const p = Math.round(Math.min(100, Math.max(0, pct)));
  $('gen-progress-fill').style.width = p + '%';
  $('gen-progress-glow').style.left  = p + '%';
  $('gen-progress-pct').textContent  = p + '%';
}

// Animate progress bar in the background (non-blocking)
function animatePct(from, to, ms) {
  const start = performance.now();
  const tick = now => {
    const t = Math.min((now - start) / ms, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    _setPct(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function showInfo(env, faction, roomCount, objCount) {
  $('section-info').style.display   = 'block';
  $('section-legend').style.display = 'block';
  $('info-env').textContent     = env.label;
  $('info-faction').textContent = faction.toUpperCase();
  $('info-rooms').textContent   = roomCount || '—';
  $('info-objects').textContent = objCount;

  $('legend-list').innerHTML = env.legend.map(l =>
    `<div class="legend-item">
       <div class="legend-swatch" style="background:${l.c}"></div>
       <span>${l.l}</span>
     </div>`
  ).join('');
}

// ── Fit view ───────────────────────────────────────────────
window.onFitView = () => fitView();
document.addEventListener('keydown', e => {
  if (e.key === 'f' || e.key === 'F') {
    if (document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT')
      fitView();
  }
});

// ── Asset picker drag-and-drop ──────────────────────────────
const mapArea = document.getElementById('map-area');

mapArea.addEventListener('dragover', e => {
  if (!e.dataTransfer.types.includes('text/plain')) return;
  e.preventDefault();
  mapArea.classList.add('drag-active');
});
mapArea.addEventListener('dragleave', () => mapArea.classList.remove('drag-active'));
mapArea.addEventListener('drop', async e => {
  e.preventDefault();
  mapArea.classList.remove('drag-active');
  const type = e.dataTransfer.getData('text/plain');
  if (!type) return;
  const vp = getViewport();
  if (!vp) return;
  const canvas = mapArea.querySelector('canvas');
  if (!canvas) return;
  const rect      = canvas.getBoundingClientRect();
  const pixelRatio = canvas.width / rect.width;
  const canvasX   = (e.clientX - rect.left) * pixelRatio;
  const canvasY   = (e.clientY - rect.top)  * pixelRatio;
  const world     = vp.toWorld(canvasX, canvasY);
  await placeAsset(type, world.x, world.y);
});

// Wire up thumbnails after picker is built
function initAssetPicker() {
  $('asset-picker-content').innerHTML = buildAssetPickerHTML();
  $('asset-picker-content').querySelectorAll('.asset-thumb').forEach(el => {
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', el.dataset.type);
      e.dataTransfer.effectAllowed = 'copy';
    });
  });
}

// Range inputs
['p-density','p-complexity'].forEach(id => {
  const input = $(id), val = $(id + '-val');
  input.addEventListener('input', () => val.textContent = input.value);
});

// Quick-prompt chips
window.setPrompt = text => {
  $('prompt-input').value = text;
  $('prompt-input').focus();
};

// Ctrl+Enter shortcut
$('prompt-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onGenerate();
});

// Mouse coords over viewport
let _W = 0, _H = 0;
document.getElementById('map-area').addEventListener('mousemove', e => {
  const canvas = document.querySelector('#map-area canvas');
  if (!canvas || !_W) return;
  const rect = canvas.getBoundingClientRect();
  const tx = Math.floor((e.clientX - rect.left) / (rect.width  / canvas.width)  / 140);
  const ty = Math.floor((e.clientY - rect.top)  / (rect.height / canvas.height) / 140);
  if (tx >= 0 && ty >= 0 && tx < _W && ty < _H)
    $('coords').textContent = `[${tx}, ${ty}]`;
  else
    $('coords').textContent = '';
});

// ── Generate ───────────────────────────────────────────────
window.onGenerate = async function () {
  const promptText = $('prompt-input').value.trim();
  if (!promptText) { $('prompt-input').focus(); setStatus('Enter a mission brief first.'); return; }

  setLoading(true);
  overlayShow();
  await new Promise(r => setTimeout(r, 20));

  try {
    // ── 1. Parse prompt ───────────────────────────────────
    setStep(0, 'ANALYSING BRIEF', 'Sending mission parameters to AI…', 2);
    let spec = null;
    let envType, faction;

    try {
      spec = await parsePromptWithClaude(promptText);
      envType = spec.environment ?? 'spaceship';
      faction = spec.faction    ?? 'neutral';
      console.log('[claude] spec:', spec);
    } catch (err) {
      console.warn('[claude] failed, falling back to keywords:', err);
      const parsed = parsePrompt(promptText);
      envType = parsed.envType;
      faction = parsed.faction;
    }
    _setPct(22);

    const env     = ENVS[envType] ?? ENVS.spaceship;
    const sizeKey = spec?.mapSize ?? $('p-size').value;
    const { w: W, h: H } = SIZES[sizeKey] ?? SIZES.medium;
    const density    = parseInt($('p-density').value)    / 100;
    const complexity = parseInt($('p-complexity').value) / 100;

    seedRng(hashStr(promptText + sizeKey + density + complexity));

    // ── 2. Generate layout ────────────────────────────────
    setStep(1, 'GENERATING LAYOUT', `Building ${env.label.toLowerCase()} — ${W}×${H} tiles…`, 25);
    await new Promise(r => setTimeout(r, 20));
    let grid, rooms;

    const isSingleRoom = spec?.layout === 'single' || (spec?.roomCount ?? 99) <= 1;
    if (isSingleRoom)                ({ grid, rooms } = generateSingleRoom(W, H, spec));
    else if (env.style === 'cellular') ({ grid, rooms } = generateCellular(W, H, env));
    else                             ({ grid, rooms } = generateBSP(W, H, env, complexity));
    _setPct(34);

    // ── 3. Generate background image ─────────────────────
    setStep(2, 'RENDERING ENVIRONMENT', 'Generating map via fal.ai Flux Pro…', 36);
    const imageSpec = spec ?? { environment: envType, faction, props: [], doors: [], centerpiece: null };
    let bgImageUrl  = null;
    animatePct(36, 80, 14000);
    try {
      bgImageUrl = await generateMapImage(imageSpec, promptText);
      console.log('[imageGen] success');
    } catch (err) {
      console.error('[imageGen] failed:', err.message);
      setStep(2, 'RENDERING ENVIRONMENT', 'Image gen failed — using programmatic render', 80);
      await new Promise(r => setTimeout(r, 600));
    }
    _setPct(82);

    // ── 4. Assets — only needed for programmatic fallback ─
    let objGrid  = null;
    let textures = {};
    let objCount = 0;
    if (!bgImageUrl) {
      setStep(3, 'LOADING ASSETS', 'Fetching sprite textures…', 84);
      objGrid  = spec
        ? placeObjectsFromSpec(grid, rooms, W, H, spec)
        : placeObjects(grid, rooms, W, H, envType, density);
      objCount = objGrid.flat().filter(Boolean).length;
      const propTypes = collectPropTypes(spec, envType);
      textures = await loadAssets(propTypes);
    }
    _setPct(92);

    // ── 5. Render ─────────────────────────────────────────
    setStep(4, 'COMPOSITING', 'Building final scene…', 94);
    initRenderer($('map-area'));
    await renderMap(grid, objGrid, W, H, env, textures, bgImageUrl);
    _setPct(100);
    await new Promise(r => setTimeout(r, 350));

    // Init asset drop layer on the live viewport
    initAssetLayer(getViewport());

    _W = W; _H = H;
    $('map-empty').style.display    = 'none';
    $('section-assets').style.display = 'block';
    initAssetPicker();
    showInfo(env, faction, rooms.length, objCount);
    setStatus(`${env.label} — ${W}×${H} tiles — ${rooms.length} rooms`);
  } catch (err) {
    setStatus('Error: ' + err.message);
    console.error(err);
  }

  overlayHide();
  setLoading(false);
};

function collectPropTypes(spec, envType) {
  if (!spec) return ENV_PROPS[envType] || [];
  const types = new Set(ENV_PROPS[envType] ?? []);
  if (spec.centerpiece?.type && spec.centerpiece.type !== 'null')
    types.add(spec.centerpiece.type);
  for (const p of (spec.props ?? []))
    if (PROP_DEFS[p.type]) types.add(p.type);
  return [...types];
}
