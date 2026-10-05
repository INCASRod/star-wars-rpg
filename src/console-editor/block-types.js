/* The one list of block types. Everything that needs to know "which `t` values are
   real" reads it from here:
     - scripts/console-blocks-doc.js builds its card-kind set from CARD_KINDS;
     - the editor bundle (entry.js) exposes BLOCK_TYPES as window.LOR_BLOCK_TYPES, which
       the console's patch validation reads (public/console/index.html validatePatch);
     - scripts/console-block-types.test.js fails if blocks-doc.js stops handling any type
       listed here, or starts handling one that is not.
   Add a type here FIRST, then teach blocks-doc.js about it; the test catches the order
   being wrong. Do not keep a second hand-maintained list anywhere. */
var BLOCK_TYPES = [
  'h1', 'h2', 'h3', 'p', 'quote', 'callout', 'read', 'list', 'table',
  'div', 'pb', 'npc', 'stat', 'vehicle', 'planet',
]
/* card blocks: payload varies by kind and is driven by CARDDEF in the console */
var CARD_KINDS = ['stat', 'vehicle', 'planet']

module.exports = { BLOCK_TYPES: BLOCK_TYPES, CARD_KINDS: CARD_KINDS }
