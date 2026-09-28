#!/usr/bin/env node
/* Builds public/console/editor.bundle.js from src/console-editor/entry.js.
   Wired as `prebuild`/`predev` (see package.json) so the bundle can never go
   stale silently -- public/ is a directory nobody inspects, and a stale
   vendored bundle there is exactly the kind of drift that stays invisible
   until it's wrong at the table. The output is gitignored; this script is
   the only thing that produces it. */
var esbuild = require('esbuild')
var path = require('path')

esbuild.buildSync({
  entryPoints: [path.join(__dirname, '..', 'src', 'console-editor', 'entry.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: path.join(__dirname, '..', 'public', 'console', 'editor.bundle.js'),
  minify: true,
  logLevel: 'info',
})
