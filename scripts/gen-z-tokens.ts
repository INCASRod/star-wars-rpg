// Writes src/styles/z-tokens.css from `Z` in src/lib/tokens.ts. Run by predev/prebuild.
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { renderZCss, Z_CSS_PATH, Z_ENTRIES } from './z-tokens-lib'

const next = renderZCss()
const prev = existsSync(Z_CSS_PATH) ? readFileSync(Z_CSS_PATH, 'utf8').replace(/\r\n/g, '\n') : ''
if (prev !== next) {
  writeFileSync(Z_CSS_PATH, next)
  console.log(`gen-z-tokens: wrote ${Z_CSS_PATH} (${Z_ENTRIES.length} layers)`)
} else {
  console.log(`gen-z-tokens: ${Z_CSS_PATH} already up to date`)
}
