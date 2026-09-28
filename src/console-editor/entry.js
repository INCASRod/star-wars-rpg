/* Bundle entry point -> public/console/editor.bundle.js (esbuild, IIFE).
   Exposes exactly two globals for the vendored console file to call:
     window.mountConsoleEditor(container, docRow, {onChange})
     window.dedupeBlockIds(blocks)
   Nothing else is attached to window. Neither of these contains persistence
   code or a reference to any save path -- see mount.js and
   scripts/console-block-ids.js. The index.html patch is what calls saveDoc,
   through the console's own existing schedule()/flushAll() debounce. */
var mount = require('./mount.js')
window.mountConsoleEditor = mount.mountConsoleEditor
window.unmountConsoleEditor = mount.unmountConsoleEditor
window.dedupeBlockIds = require('../../scripts/console-block-ids.js').dedupeBlockIds
