/* Drift detector: src/console-editor/card-def.js mirrors CARDDEF/CHARS/DERIV
   out of public/console/index.html by hand (the bundle cannot reach them --
   they are private to the vendored file's own closure). This test extracts
   the REAL definitions verbatim, at test time (marker-anchored, same
   technique as scripts/console-blocks-doc.oracle.test.js), and deep-compares
   them against the mirror. If this fails, fix src/console-editor/card-def.js
   to match index.html -- never edit index.html to match this file. */

var fs = require('fs')
var path = require('path')
var vm = require('vm')

var CONSOLE_PATH = path.join(__dirname, '..', 'public', 'console', 'index.html')
var CONSOLE_SRC = fs.readFileSync(CONSOLE_PATH, 'utf8')

function extractStatement(marker) {
  var i = CONSOLE_SRC.indexOf(marker)
  if (i === -1) throw new Error('could not find ' + JSON.stringify(marker) + ' in ' + CONSOLE_PATH)
  var j = CONSOLE_SRC.indexOf(';', i)
  if (j === -1) throw new Error('unterminated statement for ' + marker)
  return CONSOLE_SRC.slice(i, j + 1)
}
function extractBalanced(marker, openCh, closeCh) {
  var start = CONSOLE_SRC.indexOf(marker)
  if (start === -1) throw new Error('could not find ' + JSON.stringify(marker) + ' in ' + CONSOLE_PATH)
  var i = CONSOLE_SRC.indexOf(openCh, start), depth = 0, j = i
  for (; j < CONSOLE_SRC.length; j++) {
    if (CONSOLE_SRC[j] === openCh) depth++
    else if (CONSOLE_SRC[j] === closeCh) { depth--; if (depth === 0) break }
  }
  if (depth !== 0) throw new Error('unbalanced ' + openCh + closeCh + ' extracting ' + marker)
  var end = j + 1
  if (CONSOLE_SRC.charAt(end) === ';') end++
  return CONSOLE_SRC.slice(start, end)
}

var charsSrc = extractStatement('var CHARS=')
var derivSrc = extractStatement('var DERIV=')
var carddefSrc = extractBalanced('var CARDDEF={', '{', '}')

var sandbox = {}
vm.createContext(sandbox)
vm.runInContext(
  charsSrc + '\n' + derivSrc + '\n' + carddefSrc +
  '\nthis.__real__ = { CARDDEF: CARDDEF, CHARS: CHARS, DERIV: DERIV };',
  sandbox,
  { filename: CONSOLE_PATH + ' (extracted)' }
)
var real = sandbox.__real__
var mirror = require('../src/console-editor/card-def.js')

var pass = 0, fail = 0, failures = []
function ok(name, cond, detail) {
  if (cond) { pass++; return }
  fail++
  failures.push(name + (detail ? ': ' + detail : ''))
}

ok('CHARS matches', JSON.stringify(real.CHARS) === JSON.stringify(mirror.CHARS),
  'real=' + JSON.stringify(real.CHARS) + ' mirror=' + JSON.stringify(mirror.CHARS))
ok('DERIV matches', JSON.stringify(real.DERIV) === JSON.stringify(mirror.DERIV),
  'real=' + JSON.stringify(real.DERIV) + ' mirror=' + JSON.stringify(mirror.DERIV))
ok('CARDDEF matches', JSON.stringify(real.CARDDEF) === JSON.stringify(mirror.CARDDEF),
  'real=' + JSON.stringify(real.CARDDEF) + '\n    mirror=' + JSON.stringify(mirror.CARDDEF))

/* prove the comparison can fail */
var tamperedMirror = JSON.parse(JSON.stringify(mirror.CARDDEF))
tamperedMirror.stat.clDef = 'Something else entirely'
var caught = JSON.stringify(real.CARDDEF) !== JSON.stringify(tamperedMirror)
ok('failure detection: a tampered mirror is caught', caught)

console.log('carddef drift    : ' + pass + ' passed, ' + fail + ' failed')
if (failures.length) {
  console.log('\n--- failures ---')
  failures.forEach(function (f) { console.log('  ' + f) })
}
var passed = !fail
console.log('\n' + (passed ? 'PASS' : 'FAIL'))
process.exit(passed ? 0 : 1)
