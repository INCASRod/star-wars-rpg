#!/usr/bin/env node
/* Real-DOM, real-CSS proof for src/console-editor/dom-text.js's edText().
   ------------------------------------------------------------------
   jsdom does not implement layout/rendering, so it cannot be trusted for
   `innerText` (which reflects rendered text, not raw DOM text) or for
   CSS `text-transform` actually taking effect -- exactly the two things
   this test needs to be real. This test launches a real headless Chromium
   via Playwright instead (same tool used for every other live/browser
   verification in this port). It is not runnable with plain `node
   scripts/console-edtext.test.js` alone: Playwright is npx-cached, not a
   project dependency (matching this repo's established pattern), so it
   needs:

     NODE_PATH="<npx playwright cache path>/node_modules" \
       node scripts/console-edtext.test.js

   Finds the cache path itself if NODE_PATH isn't already set, via the same
   %LOCALAPPDATA%\npm-cache\_npx search used throughout this session. */

var path = require('path')
var fs = require('fs')

function findPlaywrightNodeModules() {
  var base = process.env.LOCALAPPDATA
  if (!base) return null
  var npxDir = path.join(base, 'npm-cache', '_npx')
  if (!fs.existsSync(npxDir)) return null
  var entries = fs.readdirSync(npxDir)
  for (var i = 0; i < entries.length; i++) {
    var candidate = path.join(npxDir, entries[i], 'node_modules', 'playwright')
    if (fs.existsSync(candidate)) return path.join(npxDir, entries[i], 'node_modules')
  }
  return null
}

var chromium
try {
  chromium = require('playwright').chromium
} catch (e) {
  var found = findPlaywrightNodeModules()
  if (!found) {
    console.error('Playwright not found on NODE_PATH and no cached npx install located.')
    console.error('Run once via npx to populate the cache, or set NODE_PATH explicitly.')
    process.exit(2)
  }
  module.paths.push(found)
  chromium = require('playwright').chromium
}

var domTextFullSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'console-editor', 'dom-text.js'), 'utf8')
/* strip the CommonJS module.exports tail -- there is no `module` global in
   the browser page this gets eval'd into; only the edText() function itself
   is needed for this test. */
var domTextSrc = domTextFullSrc.slice(0, domTextFullSrc.indexOf('module.exports'))

/* the deliberately-broken version: reads innerText with no neutralisation
   at all, exactly the bug edText exists to fix. */
var BROKEN_EDTEXT = 'function edText(n){ return n.innerText; }'

var MIXED_CASE_MULTILINE = 'Special Notes\nSecond line\n\nThird paragraph'

async function runCase(page, edTextImplSrc) {
  return page.evaluate(function (args) {
    /* Real usage never puts a literal "\n" in a text node -- the console's
       own nl() converts stored newlines to <br> elements when building the
       initial HTML (a plain text node's "\n" collapses to a space under
       normal CSS whitespace rules, which innerText would then faithfully
       report as a space -- that is not the bug edText protects against and
       building the test element that way would prove nothing). Replicate
       the real DOM shape: escape the text, then turn "\n" into <br>. */
    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
      })
    }
    var el = document.createElement('div')
    el.style.textTransform = 'uppercase'
    el.contentEditable = 'true'
    el.innerHTML = esc(args.text).replace(/\n/g, '<br>')
    document.body.appendChild(el)

    // eslint-disable-next-line no-eval
    var fn = (0, eval)('(function(){ ' + args.implSrc + '\nreturn edText; })()')
    var result = fn(el)
    var styleAfter = el.style.textTransform
    document.body.removeChild(el)
    return { result: result, styleAfter: styleAfter }
  }, { text: MIXED_CASE_MULTILINE, implSrc: edTextImplSrc })
}

;(async function () {
  var browser = await chromium.launch()
  var page = await browser.newPage()

  var pass = 0, fail = 0, failures = []
  function ok(name, cond, detail) {
    if (cond) { pass++; return }
    fail++
    failures.push(name + (detail ? ': ' + detail : ''))
  }

  // --- the real implementation ---
  var real = await runCase(page, domTextSrc)
  ok('real edText preserves original capitalisation',
    real.result === MIXED_CASE_MULTILINE, 'got ' + JSON.stringify(real.result))
  ok('real edText preserves the blank-line newline structure',
    real.result.indexOf('\n\n') >= 0, 'got ' + JSON.stringify(real.result))
  ok('real edText restores the element\'s own inline style afterward',
    real.styleAfter === 'uppercase', 'got ' + JSON.stringify(real.styleAfter))

  // --- deliberate failure: the same real element, same real CSS, but the
  // neutralisation removed -- this MUST fail the case above, proving the
  // test is actually sensitive to the bug it exists to catch. ---
  var broken = await runCase(page, BROKEN_EDTEXT)
  var brokenIsUppercased = broken.result === MIXED_CASE_MULTILINE.toUpperCase()
  ok('deliberate failure: removing the neutralisation DOES uppercase the read text',
    brokenIsUppercased, 'got ' + JSON.stringify(broken.result))
  ok('deliberate failure: the broken result no longer matches the real assertion',
    broken.result !== MIXED_CASE_MULTILINE)

  await browser.close()

  console.log('edText (real DOM) : ' + pass + ' passed, ' + fail + ' failed')
  if (failures.length) {
    console.log('\n--- failures ---')
    failures.forEach(function (f) { console.log('  ' + f) })
  }
  var passed = !fail
  console.log('\n' + (passed ? 'PASS' : 'FAIL'))
  process.exit(passed ? 0 : 1)
})().catch(function (e) { console.error(e); process.exit(1) })
