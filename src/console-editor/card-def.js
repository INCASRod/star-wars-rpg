/* CARDDEF/CHARS/DERIV, mirrored from public/console/index.html.
   ------------------------------------------------------------------
   These three declarations drive the ONE shared stat/vehicle/planet card
   renderer -- exactly the structure the vendored file's own blockHTML() and
   wireBlocks() already use: a banner (class field + name), zero or more
   strips of boxed figures, and a list of label/value rows, with planet's
   `grid:true` switching the rows layout to a grid.

   This file is a MIRROR, not the source of truth -- the console file is
   still the canonical definition. scripts/console-carddef-drift.test.js
   extracts the real CARDDEF/CHARS/DERIV out of index.html at test time
   (marker-anchored, same technique as the oracle test) and deep-compares
   them against this file, so drift between the two fails loudly instead of
   silently. If that test ever fails, this file is what's wrong -- update it
   to match index.html, never the other way around. */

var CHARS = [['br', 'Brawn'], ['ag', 'Agility'], ['int', 'Intellect'], ['cun', 'Cunning'], ['wil', 'Willpower'], ['pr', 'Presence']]
var DERIV = [['soak', 'Soak'], ['wt', 'Wounds'], ['st', 'Strain'], ['def', 'Defence']]

var CARDDEF = {
  stat: {
    cl: 'tier', clDef: 'Rival',
    strips: [{ store: 'ch', f: CHARS, def: '2' }, { store: '', f: DERIV, def: '—' }],
    rows: ['Skills', 'Talents', 'Abilities', 'Equipment'],
  },
  vehicle: {
    cl: 'tier', clDef: 'Starship',
    strips: [
      { store: 'vs', f: [['sil', 'Silhouette'], ['spd', 'Speed'], ['hnd', 'Handling']], def: '—' },
      { store: 'vd', f: [['dfore', 'Def Fore'], ['daft', 'Def Aft'], ['arm', 'Armour'], ['htt', 'Hull'], ['sst', 'Strain']], def: '—' },
    ],
    rows: ['Sensor Range', 'Crew', 'Passengers', 'Encumbrance', 'Consumables', 'Hyperdrive', 'Navicomputer', 'Weapons'],
  },
  planet: {
    cl: 'kind', clDef: 'Planet', grid: true, strips: [],
    rows: ['Region', 'Sector', 'System', 'Climate', 'Terrain', 'Gravity', 'Government', 'Population', 'Starport', 'Native Species', 'Major Exports', 'Trade Routes'],
  },
}

module.exports = { CARDDEF: CARDDEF, CHARS: CHARS, DERIV: DERIV }
