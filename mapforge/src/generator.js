import { rng, ri, pick } from './rng.js';
import { PROP_DEFS, ENV_PROPS } from './assets.js';

export const T = { VOID:0, FLOOR:1, WALL:2, DOOR:3 };

// ── BSP ────────────────────────────────────────────────────
export function generateBSP(W, H, env, complexity) {
  const MIN  = env.minRoom  || 5;
  const MAXD = Math.round((env.maxDepth || 6) * (0.5 + complexity * 0.5));
  const CW   = env.corrW   || 1;

  const grid = Array.from({ length: H }, () => new Array(W).fill(T.WALL));
  const rooms = [];

  function split(node, depth) {
    if (depth >= MAXD) return;
    const canH = node.h >= MIN * 2 + 2;
    const canV = node.w >= MIN * 2 + 2;
    if (!canH && !canV) return;
    const doH = canH && (!canV || node.h > node.w * 1.25 || rng() < 0.5);
    if (doH) {
      const lo = MIN + 1, hi = node.h - MIN - 1;
      if (hi <= lo) return;
      const s = lo + ri(hi - lo);
      node.left  = { x: node.x,     y: node.y,     w: node.w,     h: s,          left: null, right: null, room: null };
      node.right = { x: node.x,     y: node.y + s, w: node.w,     h: node.h - s, left: null, right: null, room: null };
    } else {
      const lo = MIN + 1, hi = node.w - MIN - 1;
      if (hi <= lo) return;
      const s = lo + ri(hi - lo);
      node.left  = { x: node.x,     y: node.y, w: s,          h: node.h, left: null, right: null, room: null };
      node.right = { x: node.x + s, y: node.y, w: node.w - s, h: node.h, left: null, right: null, room: null };
    }
    split(node.left,  depth + 1);
    split(node.right, depth + 1);
  }

  function carveRooms(node) {
    if (node.left || node.right) {
      if (node.left)  carveRooms(node.left);
      if (node.right) carveRooms(node.right);
      return;
    }
    const m = 1;
    const rw = MIN + ri(Math.max(1, node.w - MIN - m * 2));
    const rh = MIN + ri(Math.max(1, node.h - MIN - m * 2));
    const rx = node.x + m + ri(Math.max(1, node.w - rw - m * 2));
    const ry = node.y + m + ri(Math.max(1, node.h - rh - m * 2));
    const room = {
      x: Math.max(1, rx), y: Math.max(1, ry),
      w: Math.min(rw, W - 2 - rx), h: Math.min(rh, H - 2 - ry),
    };
    room.cx = room.x + Math.floor(room.w / 2);
    room.cy = room.y + Math.floor(room.h / 2);
    node.room = room;
    rooms.push(room);
    for (let y = room.y; y < room.y + room.h; y++)
      for (let x = room.x; x < room.x + room.w; x++)
        grid[y][x] = T.FLOOR;
  }

  function getRoom(node) {
    if (node.room) return node.room;
    const l = node.left  ? getRoom(node.left)  : null;
    const r = node.right ? getRoom(node.right) : null;
    if (!l) return r; if (!r) return l;
    return rng() < 0.5 ? l : r;
  }

  function connect(node) {
    if (!node.left || !node.right) return;
    connect(node.left); connect(node.right);
    const A = getRoom(node.left), B = getRoom(node.right);
    if (!A || !B) return;
    if (rng() < 0.5) { carveH(A.cx, B.cx, A.cy, CW); carveV(A.cy, B.cy, B.cx, CW); }
    else             { carveV(A.cy, B.cy, A.cx, CW); carveH(A.cx, B.cx, B.cy, CW); }
  }

  function carveH(x1, x2, y, w) {
    const [a, b] = [Math.min(x1, x2), Math.max(x1, x2)];
    for (let x = a; x <= b; x++)
      for (let dy = 0; dy < w; dy++) { const ny = y + dy; if (ny >= 0 && ny < H) grid[ny][x] = T.FLOOR; }
  }
  function carveV(y1, y2, x, w) {
    const [a, b] = [Math.min(y1, y2), Math.max(y1, y2)];
    for (let y = a; y <= b; y++)
      for (let dx = 0; dx < w; dx++) { const nx = x + dx; if (nx >= 0 && nx < W) grid[y][nx] = T.FLOOR; }
  }

  const root = { x: 1, y: 1, w: W - 2, h: H - 2, left: null, right: null, room: null };
  split(root, 0);
  carveRooms(root);
  connect(root);
  placeDoors(grid, W, H, rooms);
  return { grid, rooms };
}

function placeDoors(grid, W, H, rooms) {
  for (const room of rooms) {
    const edges = [
      ...Array.from({ length: room.w }, (_, i) => [room.x + i, room.y - 1]),
      ...Array.from({ length: room.w }, (_, i) => [room.x + i, room.y + room.h]),
      ...Array.from({ length: room.h }, (_, i) => [room.x - 1, room.y + i]),
      ...Array.from({ length: room.h }, (_, i) => [room.x + room.w, room.y + i]),
    ];
    for (const [x, y] of edges) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      if (grid[y][x] === T.FLOOR && rng() < 0.3) grid[y][x] = T.DOOR;
    }
  }
}

// ── Cellular Automata ──────────────────────────────────────
export function generateCellular(W, H, env) {
  const fillRate = env.fillRate || 0.45;
  const iters    = env.caIter   || 5;

  let grid = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x) =>
      (x === 0 || y === 0 || x === W - 1 || y === H - 1) ? T.WALL
        : rng() < fillRate ? T.WALL : T.FLOOR
    )
  );

  function wallCount(g, cx, cy) {
    let c = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || g[ny][nx] === T.WALL) c++;
    }
    return c;
  }

  for (let i = 0; i < iters; i++) {
    const next = grid.map(r => [...r]);
    for (let y = 1; y < H - 1; y++)
      for (let x = 1; x < W - 1; x++)
        next[y][x] = wallCount(grid, x, y) >= 5 ? T.WALL : T.FLOOR;
    grid = next;
  }

  // Keep only the largest connected region
  const visited = Array.from({ length: H }, () => new Array(W).fill(false));
  let bestRegion = [];
  for (let sy = 1; sy < H - 1; sy++) {
    for (let sx = 1; sx < W - 1; sx++) {
      if (grid[sy][sx] !== T.FLOOR || visited[sy][sx]) continue;
      const region = [];
      const stack = [[sx, sy]];
      while (stack.length) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cy < 0 || cx >= W || cy >= H || visited[cy][cx] || grid[cy][cx] !== T.FLOOR) continue;
        visited[cy][cx] = true;
        region.push([cx, cy]);
        stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
      }
      if (region.length > bestRegion.length) bestRegion = region;
    }
  }

  const clean = Array.from({ length: H }, () => new Array(W).fill(T.WALL));
  for (const [x, y] of bestRegion) clean[y][x] = T.FLOOR;
  return { grid: clean, rooms: [] };
}

// ── Single-room generator (spec-driven) ────────────────────
export function generateSingleRoom(W, H, spec) {
  const grid = Array.from({ length: H }, () => new Array(W).fill(T.WALL));
  const pad = 2;
  const room = { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 };
  room.cx = room.x + Math.floor(room.w / 2);
  room.cy = room.y + Math.floor(room.h / 2);

  for (let y = room.y; y < room.y + room.h; y++)
    for (let x = room.x; x < room.x + room.w; x++)
      grid[y][x] = T.FLOOR;

  // Place doors from spec
  const doors = spec?.doors ?? [];
  for (const d of doors) {
    const size = d.size === 'wide' ? 3 : d.size === 'double' ? 2 : 1;
    const count = d.count ?? 1;
    for (let i = 0; i < count; i++) {
      let dx, dy;
      if (d.side === 'north' || d.side === 'south') {
        const seg = Math.floor(room.w / (count + 1));
        dx = room.x + seg * (i + 1) - Math.floor(size / 2);
        dy = d.side === 'north' ? room.y - 1 : room.y + room.h;
        for (let s = 0; s < size; s++) {
          if (dx + s >= 0 && dx + s < W && dy >= 0 && dy < H)
            grid[dy][dx + s] = T.DOOR;
        }
      } else {
        const seg = Math.floor(room.h / (count + 1));
        dy = room.y + seg * (i + 1) - Math.floor(size / 2);
        dx = d.side === 'west' ? room.x - 1 : room.x + room.w;
        for (let s = 0; s < size; s++) {
          if (dx >= 0 && dx < W && dy + s >= 0 && dy + s < H)
            grid[dy + s][dx] = T.DOOR;
        }
      }
    }
  }

  // Default door if none specified
  if (doors.length === 0) {
    const mid = room.x + Math.floor(room.w / 2);
    grid[room.y + room.h][mid] = T.DOOR;
  }

  return { grid, rooms: [room] };
}

// ── Object placement ───────────────────────────────────────
export function placeObjects(grid, rooms, W, H, envType, density) {
  const objGrid  = Array.from({ length: H }, () => new Array(W).fill(null));
  const occupied = Array.from({ length: H }, () => new Array(W).fill(false));
  const propTypes = ENV_PROPS[envType] || ['crate'];

  function canPlace(ox, oy, pw, ph) {
    for (let dy = 0; dy < ph; dy++) for (let dx = 0; dx < pw; dx++) {
      const nx = ox + dx, ny = oy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) return false;
      if (grid[ny][nx] !== T.FLOOR) return false;
      if (occupied[ny][nx]) return false;
    }
    return true;
  }

  function doPlace(ox, oy, type, def) {
    for (let dy = 0; dy < def.h; dy++) for (let dx = 0; dx < def.w; dx++)
      occupied[oy + dy][ox + dx] = true;
    objGrid[oy][ox] = { type, w: def.w, h: def.h, variant: ri(def.srcs.length) };
  }

  const zones = rooms.length > 0 ? rooms : [{ x: 1, y: 1, w: W - 2, h: H - 2 }];
  const totalCells = zones.reduce((s, r) => s + r.w * r.h, 0);
  const target = Math.floor(totalCells * density * 0.15);
  let placed = 0;

  for (let attempt = 0; attempt < target * 8 && placed < target; attempt++) {
    const zone = zones[ri(zones.length)];
    const type = propTypes[ri(propTypes.length)];
    const def  = PROP_DEFS[type];
    if (!def) continue;

    const maxX = zone.x + zone.w - def.w;
    const maxY = zone.y + zone.h - def.h;
    if (maxX < zone.x || maxY < zone.y) continue;

    const ox = zone.x + ri(maxX - zone.x + 1);
    const oy = zone.y + ri(maxY - zone.y + 1);

    if (canPlace(ox, oy, def.w, def.h)) { doPlace(ox, oy, type, def); placed++; }
  }

  return objGrid;
}

// ── Spec-driven object placement ───────────────────────────
export function placeObjectsFromSpec(grid, rooms, W, H, spec) {
  const objGrid  = Array.from({ length: H }, () => new Array(W).fill(null));
  const occupied = Array.from({ length: H }, () => new Array(W).fill(false));
  const room = rooms[0] ?? { x: 1, y: 1, w: W - 2, h: H - 2 };

  function canPlace(ox, oy, pw, ph) {
    for (let dy = 0; dy < ph; dy++) for (let dx = 0; dx < pw; dx++) {
      const nx = ox + dx, ny = oy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) return false;
      if (grid[ny][nx] !== T.FLOOR) return false;
      if (occupied[ny][nx]) return false;
    }
    return true;
  }

  function doPlace(ox, oy, type, def, tint) {
    for (let dy = 0; dy < def.h; dy++) for (let dx = 0; dx < def.w; dx++)
      occupied[oy + dy][ox + dx] = true;
    objGrid[oy][ox] = { type, w: def.w, h: def.h, variant: 0, tint: tint ?? null };
  }

  function tryPlaceAt(ox, oy, type, def, tint) {
    if (canPlace(ox, oy, def.w, def.h)) { doPlace(ox, oy, type, def, tint); return true; }
    return false;
  }

  // Place centerpiece first — centred in the room
  const cp = spec?.centerpiece;
  if (cp && cp.type && cp.type !== 'null') {
    const def = PROP_DEFS[cp.type];
    if (def) {
      const cx = room.x + Math.floor((room.w - def.w) / 2);
      const cy = room.y + Math.floor((room.h - def.h) / 2);
      tryPlaceAt(cx, cy, cp.type, def, cp.tint);
    }
  }

  // Place spec props
  for (const p of (spec?.props ?? [])) {
    const def = PROP_DEFS[p.type];
    if (!def) continue;
    const count = p.count ?? 1;

    for (let i = 0; i < count; i++) {
      let placed = false;
      for (let attempt = 0; attempt < 40 && !placed; attempt++) {
        let ox, oy;
        switch (p.placement) {
          case 'center':
            ox = room.x + Math.floor(room.w / 2) - Math.floor(def.w / 2) + ri(3) - 1;
            oy = room.y + Math.floor(room.h / 2) - Math.floor(def.h / 2) + ri(3) - 1;
            break;
          case 'walls':
          case 'back': {
            const side = ri(4);
            if (side === 0)      { ox = room.x + ri(room.w - def.w); oy = room.y; }
            else if (side === 1) { ox = room.x + ri(room.w - def.w); oy = room.y + room.h - def.h; }
            else if (side === 2) { ox = room.x; oy = room.y + ri(room.h - def.h); }
            else                 { ox = room.x + room.w - def.w; oy = room.y + ri(room.h - def.h); }
            break;
          }
          case 'corners': {
            const corner = ri(4);
            ox = corner % 2 === 0 ? room.x : room.x + room.w - def.w;
            oy = corner < 2 ? room.y : room.y + room.h - def.h;
            break;
          }
          case 'front':
            ox = room.x + ri(Math.max(1, room.w - def.w));
            oy = room.y + room.h - def.h - 1;
            break;
          default: // scattered
            ox = room.x + ri(Math.max(1, room.w - def.w));
            oy = room.y + ri(Math.max(1, room.h - def.h));
        }
        ox = Math.max(room.x, Math.min(ox, room.x + room.w - def.w));
        oy = Math.max(room.y, Math.min(oy, room.y + room.h - def.h));
        placed = tryPlaceAt(ox, oy, p.type, def, null);
      }
    }
  }

  return objGrid;
}
