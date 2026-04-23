import { Texture } from 'pixi.js';

// w/h = grid square footprint
export const PROP_DEFS = {
  crate:         { w:2, h:1, srcs:['/sprites/props/crate-gray.png','/sprites/props/crate-orange.png'] },
  crate_stack:   { w:2, h:2, srcs:['/sprites/props/crate-stack1.png','/sprites/props/crate-stack3.png'] },
  computer:      { w:3, h:1, srcs:['/sprites/props/computer1.png','/sprites/props/computer2.png'] },
  duty_station:  { w:2, h:2, srcs:['/sprites/props/duty-station.png'] },
  turret:        { w:1, h:1, srcs:['/sprites/props/turret.png'] },
  hologram:      { w:2, h:2, srcs:['/sprites/props/hologram-planet.png'] },
  generator:     { w:2, h:2, srcs:['/sprites/props/generator-gray.png'] },
  container:     { w:2, h:3, srcs:['/sprites/props/container-gray.png','/sprites/props/container-orange.png'] },
  tank:          { w:1, h:2, srcs:['/sprites/props/tank-blue.png','/sprites/props/tank-metal.png'] },
  cannon:        { w:2, h:2, srcs:['/sprites/props/cannon.png'] },
  table:         { w:3, h:2, srcs:['/sprites/props/meeting-table.png'] },
  chair:         { w:1, h:1, srcs:['/sprites/props/chair-v1.png'] },
  reactor:       { w:3, h:3, srcs:['/sprites/props/reactor.png'] },
  // Vehicles
  shuttle:       { w:6, h:4, srcs:['/sprites/vehicles/shuttle.png'] },
  cargo_shuttle: { w:8, h:5, srcs:['/sprites/vehicles/cargo-shuttle.png'] },
  transport:     { w:7, h:4, srcs:['/sprites/vehicles/transport.png'] },
  troop_transport:{ w:7, h:4, srcs:['/sprites/vehicles/troop-transport.png'] },
};

export const ENV_PROPS = {
  spaceship: ['computer','duty_station','crate','hologram','turret','generator','reactor'],
  warehouse: ['crate','crate_stack','container','tank'],
  base:      ['computer','duty_station','crate','turret','cannon','generator'],
  cantina:   ['crate','table','chair','tank'],
  city:      ['computer','crate','turret','cannon'],
  desert:    ['crate','crate_stack','container'],
  cave:      ['crate','container'],
  jungle:    ['crate'],
  ice:       ['crate','container'],
};

const _cache = {};

async function loadTex(src) {
  if (_cache[src]) return _cache[src];
  const tex = await Texture.fromURL(src);
  _cache[src] = tex;
  return tex;
}

export async function loadAssets(propTypes) {
  const result = {};
  await Promise.allSettled(
    propTypes.flatMap(type => {
      const def = PROP_DEFS[type];
      if (!def) return [];
      result[type] = [];
      return def.srcs.map((src, i) =>
        loadTex(src)
          .then(tex => { result[type][i] = tex; })
          .catch(() => { result[type][i] = null; })
      );
    })
  );
  return result;
}

export async function loadFloorTextures() {
  const srcs = {
    corridorMid: '/sprites/floor/corridor-mid.png',
    corridorEnd: '/sprites/floor/corridor-end.png',
  };
  const out = {};
  for (const [key, src] of Object.entries(srcs)) {
    try { out[key] = await loadTex(src); } catch { out[key] = null; }
  }
  return out;
}
