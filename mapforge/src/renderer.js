import * as PIXI from 'pixi.js';
import { Texture } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { T } from './generator.js';
import { loadFloorTextures } from './assets.js';

const TS = 140;

let app      = null;
let viewport = null;
let floorTex = null;

export function initRenderer(container) {
  if (app) return;
  app = new PIXI.Application({
    backgroundColor: 0x050608,
    resizeTo: container,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  container.appendChild(app.view);
  Object.assign(app.view.style, { position:'absolute', inset:'0', width:'100%', height:'100%', display:'block' });
  app.stage.eventMode = 'dynamic';
  app.stage.hitArea   = app.screen;

  // pixi-viewport v5 uses the old `interactive` boolean; PixiJS v7.4 needs isInteractive().
  // Polyfill it on any object that's missing it rather than skipping (skipping breaks viewport drag).
  const boundary = app.renderer.events?.boundary;
  if (boundary) {
    const proto = Object.getPrototypeOf(boundary);
    for (const method of ['hitTestRecursive', 'hitTestMoveRecursive']) {
      const orig = proto[method];
      if (!orig) continue;
      proto[method] = function (currentTarget, ...args) {
        if (currentTarget && typeof currentTarget.isInteractive !== 'function') {
          const wasInteractive = currentTarget.interactive === true;
          currentTarget.isInteractive = () => wasInteractive;
          if (!currentTarget.eventMode)
            currentTarget.eventMode = wasInteractive ? 'static' : 'passive';
        }
        return orig.call(this, currentTarget, ...args);
      };
    }
  }
}

export async function renderMap(grid, objGrid, W, H, env, textures, bgImageUrl = null) {
  const worldW = W * TS, worldH = H * TS;
  const container = app.view.parentElement;

  if (viewport) { app.stage.removeChild(viewport); viewport.destroy({ children:true }); }

  viewport = new Viewport({
    screenWidth:  container.clientWidth,
    screenHeight: container.clientHeight,
    worldWidth:   worldW,
    worldHeight:  worldH,
    events:       app.renderer.events,
    disableOnContextMenu: true,
  });
  viewport.eventMode = 'dynamic';
  app.stage.addChild(viewport);
  viewport
    .drag({ mouseButtons: 'left' })
    .pinch()
    .wheel({ smooth: 4 })
    .decelerate({ friction: 0.92 })
    .clampZoom({ minScale: 0.06, maxScale: 5 });

  viewport.fit(true, worldW, worldH);
  viewport.moveCenter(worldW / 2, worldH / 2);

  if (bgImageUrl) {
    // ── AI image mode — image only, no sprites ──────────────
    await _drawImageBackground(viewport, bgImageUrl, worldW, worldH);
    _drawGrid(viewport, W, H);
  } else {
    // ── Programmatic fallback ───────────────────────────────
    if (!floorTex) floorTex = await loadFloorTextures();
    _drawFloor(viewport, grid, W, H, env, floorTex);
    _drawShadows(viewport, grid, W, H);
    _drawWalls(viewport, grid, W, H, env);
    _drawDoors(viewport, grid, W, H, env);
    _drawObjects(viewport, objGrid, W, H, textures);
  }
}

// ── AI image background ────────────────────────────────────
async function _drawImageBackground(vp, url, worldW, worldH) {
  const tex    = await Texture.fromURL(url);
  const sprite = new PIXI.Sprite(tex);
  sprite.width  = worldW;
  sprite.height = worldH;
  vp.addChild(sprite);

  // Subtle vignette over the image edges
  const vignette = new PIXI.Graphics();
  const v = Math.min(worldW, worldH) * 0.18;
  const dirs = [
    { x: 0,          y: 0,           w: worldW, h: v,  axis: 'tb', fwd: true  },
    { x: 0,          y: worldH - v,  w: worldW, h: v,  axis: 'tb', fwd: false },
    { x: 0,          y: 0,           w: v,       h: worldH, axis: 'lr', fwd: true  },
    { x: worldW - v, y: 0,           w: v,       h: worldH, axis: 'lr', fwd: false },
  ];
  const steps = 8;
  for (const d of dirs) {
    for (let s = 0; s < steps; s++) {
      const alpha = 0.55 * (1 - s / steps);
      const frac  = s / steps;
      const inv   = 1 / steps;
      if (d.axis === 'tb') {
        const h = d.h * inv;
        const y = d.fwd ? d.y + frac * d.h : d.y + d.h - (frac + inv) * d.h;
        vignette.beginFill(0x000000, alpha);
        vignette.drawRect(d.x, y, d.w, h);
        vignette.endFill();
      } else {
        const w = d.w * inv;
        const x = d.fwd ? d.x + frac * d.w : d.x + d.w - (frac + inv) * d.w;
        vignette.beginFill(0x000000, alpha);
        vignette.drawRect(x, d.y, w, d.h);
        vignette.endFill();
      }
    }
  }
  vp.addChild(vignette);
}

// ── Gameplay grid overlay (AI mode only) ───────────────────
function _drawGrid(vp, W, H) {
  const g = new PIXI.Graphics();
  g.lineStyle(1, 0xffffff, 0.09);
  for (let x = 0; x <= W; x++) { g.moveTo(x * TS, 0); g.lineTo(x * TS, H * TS); }
  for (let y = 0; y <= H; y++) { g.moveTo(0, y * TS); g.lineTo(W * TS, y * TS); }
  vp.addChild(g);
}

// ── Helpers ────────────────────────────────────────────────
function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  return ((Math.round(ar + (br - ar) * t) << 16) |
          (Math.round(ag + (bg - ag) * t) << 8)  |
           Math.round(ab + (bb - ab) * t));
}

// ── Floor: large plate panels + texture overlay ─────────────
function _drawFloor(vp, grid, W, H, env, floorTextures) {
  const gBase  = new PIXI.Graphics();
  const gSeams = new PIXI.Graphics();
  vp.addChild(gBase);

  const PLATE = 4; // tiles per floor plate — seam lines every 4 tiles

  const isFloor = (x, y) =>
    x >= 0 && y >= 0 && x < W && y < H &&
    (grid[y][x] === T.FLOOR || grid[y][x] === T.DOOR);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!isFloor(x, y)) continue;
      const px = x * TS, py = y * TS;

      // Subtle per-tile noise — breaks regular pattern without checkerboard
      const noise = ((x * 17 + y * 31) % 23) / 23; // 0..1 deterministic
      gBase.beginFill(lerpColor(env.floorC, env.floorAlt, noise * 0.6));
      gBase.drawRect(px, py, TS, TS);
      gBase.endFill();

      // Plate seam lines — only at PLATE-tile boundaries, only where next tile is also floor
      const seamsRight  = (x + 1) % PLATE === 0 && isFloor(x + 1, y);
      const seamsBottom = (y + 1) % PLATE === 0 && isFloor(x, y + 1);

      if (seamsRight) {
        // Dark crack
        gSeams.beginFill(0x000000, 0.5);
        gSeams.drawRect(px + TS - 1, py, 1, TS);
        gSeams.endFill();
        // Bright highlight on far side
        gSeams.beginFill(env.highlightC, 0.25);
        gSeams.drawRect(px + TS, py, 1, TS);
        gSeams.endFill();
      }
      if (seamsBottom) {
        gSeams.beginFill(0x000000, 0.5);
        gSeams.drawRect(px, py + TS - 1, TS, 1);
        gSeams.endFill();
        gSeams.beginFill(env.highlightC, 0.25);
        gSeams.drawRect(px, py + TS, TS, 1);
        gSeams.endFill();
      }
    }
  }

  // Build shared floor mask for texture overlays
  const mask = new PIXI.Graphics();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!isFloor(x, y)) continue;
      mask.beginFill(0xffffff);
      mask.drawRect(x * TS, y * TS, TS, TS);
      mask.endFill();
    }
  }

  // Primary texture overlay — large scale (5-tile width)
  const corridorTex = floorTextures?.corridorMid;
  if (corridorTex) {
    const scale1 = (5 * TS) / corridorTex.width;
    const overlay1 = new PIXI.TilingSprite(corridorTex, W * TS, H * TS);
    overlay1.tileScale.set(scale1);
    overlay1.blendMode = PIXI.BLEND_MODES.SCREEN;
    overlay1.alpha = 0.5;
    overlay1.mask = mask;
    vp.addChild(mask);
    vp.addChild(overlay1);

    // Second pass at rotated/offset scale for cross-hatched depth
    const maskB = new PIXI.Graphics();
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (!isFloor(x, y)) continue;
        maskB.beginFill(0xffffff);
        maskB.drawRect(x * TS, y * TS, TS, TS);
        maskB.endFill();
      }
    const scale2 = (3 * TS) / corridorTex.width;
    const overlay2 = new PIXI.TilingSprite(corridorTex, W * TS, H * TS);
    overlay2.tileScale.set(scale2);
    overlay2.tilePosition.set(TS * 1.5, TS * 1.5); // offset so grids don't align
    overlay2.blendMode = PIXI.BLEND_MODES.SCREEN;
    overlay2.alpha = 0.18;
    overlay2.mask = maskB;
    vp.addChild(maskB);
    vp.addChild(overlay2);
  }

  vp.addChild(gSeams);
}

// ── Ambient occlusion shadows ───────────────────────────────
function _drawShadows(vp, grid, W, H) {
  const g = new PIXI.Graphics();
  vp.addChild(g);
  const SW = Math.floor(TS * 0.28);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = grid[y][x];
      if (t !== T.FLOOR && t !== T.DOOR) continue;
      const px = x * TS, py = y * TS;
      const isWall = (nx, ny) => nx < 0 || ny < 0 || nx >= W || ny >= H || grid[ny][nx] === T.WALL;

      // 4 direction shadows with gradient falloff
      const defs = [
        { test: isWall(x, y-1), x0:px,    y0:py,    w:TS,  h:SW, axis:'h', fwd:true  },
        { test: isWall(x-1, y), x0:px,    y0:py,    w:SW,  h:TS, axis:'v', fwd:true  },
        { test: isWall(x+1, y), x0:px+TS, y0:py,    w:SW,  h:TS, axis:'v', fwd:false },
        { test: isWall(x, y+1), x0:px,    y0:py+TS, w:TS,  h:SW, axis:'h', fwd:false },
      ];
      for (const d of defs) {
        if (!d.test) continue;
        const steps = 5;
        for (let s = 0; s < steps; s++) {
          const alpha = 0.38 * (1 - s / steps);
          const frac  = s / steps;
          const inv   = 1 / steps;
          let rx, ry, rw, rh;
          if (d.axis === 'h') {
            rw = d.w; rh = SW * inv;
            rx = d.x0;
            ry = d.fwd ? d.y0 + frac * SW : d.y0 - (frac + inv) * SW;
          } else {
            rh = d.h; rw = SW * inv;
            ry = d.y0;
            rx = d.fwd ? d.x0 + frac * SW : d.x0 - (frac + inv) * SW;
          }
          g.beginFill(0x000000, alpha);
          g.drawRect(rx, ry, rw, rh);
          g.endFill();
        }
      }
    }
  }
}

// ── Walls ──────────────────────────────────────────────────
function _drawWalls(vp, grid, W, H, env) {
  const g = new PIXI.Graphics();
  vp.addChild(g);
  const CAP = Math.max(5, Math.floor(TS * 0.25));
  const ECAP = Math.max(3, Math.floor(TS * 0.1));

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (grid[y][x] !== T.WALL) continue;
      const px = x * TS, py = y * TS;

      // Subtle noise variation on wall face
      const noise = ((x * 19 + y * 37) % 29) / 29;
      g.beginFill(lerpColor(env.wallC, env.wallTop, noise * 0.25));
      g.drawRect(px, py, TS, TS);
      g.endFill();

      const southOpen = y < H-1 && (grid[y+1][x] === T.FLOOR || grid[y+1][x] === T.DOOR);
      const eastOpen  = x < W-1 && (grid[y][x+1] === T.FLOOR || grid[y][x+1] === T.DOOR);
      const northOpen = y > 0   && (grid[y-1][x] === T.FLOOR || grid[y-1][x] === T.DOOR);
      const westOpen  = x > 0   && (grid[y][x-1] === T.FLOOR || grid[y][x-1] === T.DOOR);

      // South face cap — primary visible "top" of wall
      if (southOpen) {
        g.beginFill(env.wallTop);
        g.drawRect(px, py + TS - CAP, TS, CAP);
        g.endFill();
        // Inner highlight stripe
        g.beginFill(0xffffff, 0.06);
        g.drawRect(px, py + TS - CAP, TS, 1);
        g.endFill();
      }
      // East face cap
      if (eastOpen) {
        g.beginFill(env.wallTop, 0.45);
        g.drawRect(px + TS - ECAP, py, ECAP, TS);
        g.endFill();
      }
      // Thin inner edge where wall meets corridor (north/west)
      if (northOpen) {
        g.beginFill(env.wallTop, 0.15);
        g.drawRect(px, py, TS, 2);
        g.endFill();
      }
      if (westOpen) {
        g.beginFill(env.wallTop, 0.15);
        g.drawRect(px, py, 2, TS);
        g.endFill();
      }
    }
  }
}

// ── Doors ──────────────────────────────────────────────────
function _drawDoors(vp, grid, W, H, env) {
  const g = new PIXI.Graphics();
  vp.addChild(g);
  const FT = Math.floor(TS * 0.2);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (grid[y][x] !== T.DOOR) continue;
      const px = x * TS, py = y * TS;
      const hOpen = (x > 0 && grid[y][x-1] === T.FLOOR) || (x < W-1 && grid[y][x+1] === T.FLOOR);

      // Soft halo
      g.beginFill(env.accent, 0.07);
      g.drawRect(px - TS * 0.4, py - TS * 0.4, TS * 1.8, TS * 1.8);
      g.endFill();

      // Frame bars
      g.beginFill(env.doorC);
      if (hOpen) {
        g.drawRect(px, py, TS, FT);
        g.drawRect(px, py + TS - FT, TS, FT);
      } else {
        g.drawRect(px, py, FT, TS);
        g.drawRect(px + TS - FT, py, FT, TS);
      }
      g.endFill();

      // Accent stripe across frame
      g.beginFill(env.accent, 0.6);
      if (hOpen) {
        g.drawRect(px, py + FT - 2, TS, 2);
        g.drawRect(px, py + TS - FT, TS, 2);
      } else {
        g.drawRect(px + FT - 2, py, 2, TS);
        g.drawRect(px + TS - FT, py, 2, TS);
      }
      g.endFill();

      // Centre indicator
      g.beginFill(env.accent, 0.9);
      g.drawCircle(px + TS / 2, py + TS / 2, Math.max(3, TS * 0.07));
      g.endFill();
    }
  }
}

// ── Props ──────────────────────────────────────────────────
function _drawObjects(vp, objGrid, W, H, textures) {
  const layer = new PIXI.Container();
  vp.addChild(layer);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const obj = objGrid[y][x];
      if (!obj) continue;

      const variants = textures[obj.type];
      const tex = variants?.[obj.variant] ?? variants?.[0] ?? null;

      if (tex) {
        // Drop shadow
        const shadow = new PIXI.Graphics();
        const sw = obj.w * TS * 0.7, sh = obj.h * TS * 0.3;
        shadow.beginFill(0x000000, 0.35);
        shadow.drawEllipse((x + obj.w / 2) * TS + 5, (y + obj.h) * TS - 4, sw / 2, sh / 2);
        shadow.endFill();
        layer.addChild(shadow);

        const sprite = new PIXI.Sprite(tex);
        const targetW = obj.w * TS * 0.9;
        const targetH = obj.h * TS * 0.9;
        const scale = Math.min(targetW / tex.width, targetH / tex.height);
        sprite.scale.set(scale);
        sprite.anchor.set(0.5, 0.5);
        sprite.x = (x + obj.w / 2) * TS;
        sprite.y = (y + obj.h / 2) * TS;
        if (obj.tint) sprite.tint = parseInt(obj.tint.replace('#', ''), 16);
        layer.addChild(sprite);
      } else {
        // Fallback block (styled, not plain grey)
        const g = new PIXI.Graphics();
        g.beginFill(0x2a3040, 0.9);
        g.lineStyle(1, 0x3a5070, 0.8);
        g.drawRoundedRect(x * TS + 5, y * TS + 5, obj.w * TS - 10, obj.h * TS - 10, 3);
        g.endFill();
        layer.addChild(g);
      }
    }
  }
}

export function getViewport() { return viewport; }

export function fitView() {
  if (!viewport || !app) return;
  const worldW = viewport.worldWidth, worldH = viewport.worldHeight;
  viewport.fit(true, worldW, worldH);
  viewport.moveCenter(worldW / 2, worldH / 2);
}
