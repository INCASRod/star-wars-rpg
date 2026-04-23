import * as PIXI from 'pixi.js';
import { Texture } from 'pixi.js';
import { PROP_DEFS } from './assets.js';
import { getViewport } from './renderer.js';

const TS = 140;

export const ASSET_CATEGORIES = [
  {
    label: 'TECH',
    items: [
      { type: 'computer',     label: 'Computer',     src: '/sprites/props/computer1.png' },
      { type: 'duty_station', label: 'Duty Station', src: '/sprites/props/duty-station.png' },
      { type: 'hologram',     label: 'Hologram',     src: '/sprites/props/hologram-planet.png' },
      { type: 'generator',    label: 'Generator',    src: '/sprites/props/generator-gray.png' },
      { type: 'turret',       label: 'Turret',       src: '/sprites/props/turret.png' },
      { type: 'cannon',       label: 'Cannon',       src: '/sprites/props/cannon.png' },
      { type: 'reactor',      label: 'Reactor',      src: '/sprites/props/reactor.png' },
    ],
  },
  {
    label: 'STORAGE',
    items: [
      { type: 'crate',       label: 'Crate',      src: '/sprites/props/crate-gray.png' },
      { type: 'crate_stack', label: 'Crate Stack', src: '/sprites/props/crate-stack1.png' },
      { type: 'container',   label: 'Container',  src: '/sprites/props/container-gray.png' },
      { type: 'tank',        label: 'Fluid Tank', src: '/sprites/props/tank-blue.png' },
    ],
  },
  {
    label: 'FURNITURE',
    items: [
      { type: 'table', label: 'Table', src: '/sprites/props/meeting-table.png' },
      { type: 'chair', label: 'Chair', src: '/sprites/props/chair-v1.png' },
    ],
  },
  {
    label: 'VEHICLES',
    items: [
      { type: 'shuttle',        label: 'Shuttle',       src: '/sprites/vehicles/shuttle.png' },
      { type: 'cargo_shuttle',  label: 'Cargo Shuttle', src: '/sprites/vehicles/cargo-shuttle.png' },
      { type: 'transport',      label: 'Transport',     src: '/sprites/vehicles/transport.png' },
      { type: 'troop_transport',label: 'Troop Transport',src: '/sprites/vehicles/troop-transport.png' },
    ],
  },
];

const _texCache = {};
let _layer = null;

async function getTex(src) {
  if (!_texCache[src]) _texCache[src] = await Texture.fromURL(src);
  return _texCache[src];
}

export function initAssetLayer(viewport) {
  _layer = new PIXI.Container();
  _layer.sortableChildren = true;
  viewport.addChild(_layer);
}

export async function placeAsset(type, worldX, worldY) {
  if (!_layer) return;
  const item = ASSET_CATEGORIES.flatMap(c => c.items).find(i => i.type === type);
  const def  = PROP_DEFS[type];
  if (!item || !def) return;

  const tex    = await getTex(item.src);
  const sprite = new PIXI.Sprite(tex);

  const targetW = def.w * TS * 0.9;
  const targetH = def.h * TS * 0.9;
  const scale   = Math.min(targetW / tex.width, targetH / tex.height);
  sprite.scale.set(scale);
  sprite.anchor.set(0.5, 0.5);
  sprite.x = worldX;
  sprite.y = worldY;
  sprite.eventMode = 'static';
  sprite.cursor    = 'grab';

  // Drop shadow
  const shadow = new PIXI.Graphics();
  const sw = def.w * TS * 0.6, sh = def.h * TS * 0.25;
  shadow.beginFill(0x000000, 0.4);
  shadow.drawEllipse(0, def.h * TS * 0.42, sw / 2, sh / 2);
  shadow.endFill();
  sprite.addChild(shadow);

  // ── Drag within map ─────────────────────────────────────
  let dragging = false, offX = 0, offY = 0;

  sprite.on('pointerdown', e => {
    e.stopPropagation();
    dragging = true;
    sprite.cursor  = 'grabbing';
    sprite.zIndex  = 9999;
    const vp    = getViewport();
    const world = vp.toWorld(e.global.x, e.global.y);
    offX = world.x - sprite.x;
    offY = world.y - sprite.y;
    vp.plugins.pause('drag');
  });

  sprite.on('globalpointermove', e => {
    if (!dragging) return;
    const vp    = getViewport();
    const world = vp.toWorld(e.global.x, e.global.y);
    sprite.x = world.x - offX;
    sprite.y = world.y - offY;
  });

  const stopDrag = () => {
    if (!dragging) return;
    dragging      = false;
    sprite.cursor = 'grab';
    sprite.zIndex = 0;
    getViewport()?.plugins.resume('drag');
  };
  sprite.on('pointerup',        stopDrag);
  sprite.on('pointerupoutside', stopDrag);

  // Right-click removes the sprite
  sprite.on('rightclick', () => {
    _layer.removeChild(sprite);
    sprite.destroy({ children: true });
  });

  _layer.addChild(sprite);
}

// ── Build sidebar HTML ──────────────────────────────────────
export function buildAssetPickerHTML() {
  return ASSET_CATEGORIES.map(cat => `
    <div class="asset-cat">
      <div class="asset-cat-label">${cat.label}</div>
      <div class="asset-grid">
        ${cat.items.map(item => `
          <div class="asset-thumb" draggable="true"
               data-type="${item.type}"
               title="${item.label}">
            <img src="${item.src}" alt="${item.label}" draggable="false">
            <span>${item.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}
