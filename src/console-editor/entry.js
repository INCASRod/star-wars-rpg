/* Bundle entry point -> public/console/editor.bundle.js (esbuild, IIFE).
   Exposes exactly two globals for the vendored console file to call:
     window.mountConsoleEditor(container, docRow, {onChange})
     window.dedupeBlockIds(blocks)
   plus one frozen read-only list:
     window.LOR_BLOCK_TYPES  (the block-type list; see block-types.js)
   Nothing else is attached to window. Neither of these contains persistence
   code or a reference to any save path -- see mount.js and
   scripts/console-block-ids.js. The index.html patch is what calls saveDoc,
   through the console's own existing schedule()/flushAll() debounce. */
var mount = require('./mount.js')
window.mountConsoleEditor = mount.mountConsoleEditor
window.unmountConsoleEditor = mount.unmountConsoleEditor
window.dedupeBlockIds = require('../../scripts/console-block-ids.js').dedupeBlockIds
window.LOR_BLOCK_TYPES = Object.freeze(require('./block-types.js').BLOCK_TYPES.slice())
