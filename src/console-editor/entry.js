/* Bundle entry point -> public/console/editor.bundle.js (esbuild, IIFE).
   Exposes exactly one global for the vendored console file to call:
   window.mountConsoleEditor(container, docRow). Nothing else is attached to
   window. See mount.js for what this can and cannot do (read-only, no save
   path reachable from here). */
window.mountConsoleEditor = require('./mount.js').mountConsoleEditor
