// check:z : keeps the two z-index scales from drifting. Fails (exit 1) when
//   1. src/styles/z-tokens.css is out of date vs `Z` in src/lib/tokens.ts,
//   2. any var(--z-x) in src/ names a layer `Z` does not define,
//   3. the number of raw numeric z-index sites in src/ goes ABOVE RAW_Z_BASELINE (a ratchet).
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { renderZCss, Z_CSS_PATH, Z_ENTRIES, kebab } from './z-tokens-lib'

// RATCHET: raw numeric z-index sites currently allowed in src/. This number may ONLY go DOWN:
// when you replace a raw number with a `Z` layer, lower it to the new count. Never raise it to
// make a failing check pass; add or reuse a layer in `Z` (src/lib/tokens.ts) instead.
// Baseline recorded 2026-11-04 (prompt G, phase 1: 103; phase 2 removed GroupSheet's two raw numbers: 101). Counts CSS `z-index: <n>` and TSX `zIndex: <n>`,
// skipping comment-only lines. (Audit F counted 104; one of those was a comment in StagingTopBar.tsx.)
const RAW_Z_BASELINE = 101

const errors: string[] = []
const norm = (p: string) => p.split('\\').join('/')

// 1. generated file is current
const want = renderZCss()
const have = existsSync(Z_CSS_PATH) ? readFileSync(Z_CSS_PATH, 'utf8').replace(/\r\n/g, '\n') : ''
if (have !== want) errors.push(`${Z_CSS_PATH} is out of date vs Z in src/lib/tokens.ts. Run: npm run gen:z`)

// walk src/
const files: string[] = []
const walk = (d: string) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.(tsx?|css)$/.test(e.name)) files.push(p)
  }
}
walk('src')

const defined = new Set(Z_ENTRIES.map(([n]) => '--z-' + kebab(n)))
const isComment = (l: string) => /^\s*(\/\/|\/\*|\*)/.test(l)
let rawCount = 0
const rawSites: string[] = []

for (const f of files) {
  const isCss = f.endsWith('.css')
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (isCss && norm(f) === Z_CSS_PATH) return
    // 2. unknown var(--z-*)
    for (const m of line.matchAll(/var\(\s*(--z-[\w-]+)/g)) {
      if (!defined.has(m[1])) errors.push(`${norm(f)}:${i + 1} uses ${m[1]}, which Z does not define`)
    }
    // 3. raw numeric z-index (same matcher as the F audit scan, minus comment-only lines)
    if (isComment(line)) return
    const css = isCss ? line.match(/(?<![\w-])z-index\s*:\s*(-?\d+)(\s*!important)?\s*(;|}|$)/) : null
    const tsx = !isCss ? line.match(/zIndex\s*:\s*(-?\d+)\b/) : null
    const inline = !isCss ? line.match(/z-index\s*:\s*(-?\d+)\s*[;'"`}]/) : null
    if (css || tsx || inline) { rawCount++; rawSites.push(`${norm(f)}:${i + 1}`) }
  })
}

if (rawCount > RAW_Z_BASELINE) {
  errors.push(`raw numeric z-index sites: ${rawCount} > baseline ${RAW_Z_BASELINE}. Use a layer from Z (src/lib/tokens.ts) instead of a number.`)
}

if (errors.length) {
  console.error('check:z FAILED\n  ' + errors.join('\n  '))
  process.exit(1)
}
console.log(`check:z ok: z-tokens.css current, all var(--z-*) defined, raw z-index sites ${rawCount}/${RAW_Z_BASELINE}` +
  (rawCount < RAW_Z_BASELINE ? ` (baseline can be lowered to ${rawCount})` : ''))
