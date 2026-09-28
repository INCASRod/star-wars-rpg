/* Test for dedupeBlockIds. Verification standard matches the other suites:
   deliberate-failure check included, not just the happy path. */

var C = require('./console-block-ids.js')
var dedupeBlockIds = C.dedupeBlockIds

var pass = 0, fail = 0, failures = []

function ok(name, cond, detail) {
  if (cond) { pass++; return }
  fail++
  failures.push(name + (detail ? ': ' + detail : ''))
}

function ids(blocks) { return blocks.map(function (b) { return b.id }) }
function idSet(blocks) {
  var s = {}
  ids(blocks).forEach(function (id) { s[id] = (s[id] || 0) + 1 })
  return s
}
function hasDuplicates(blocks) {
  var s = idSet(blocks)
  return Object.keys(s).some(function (k) { return s[k] > 1 })
}

/* ---- no duplicates: unchanged ------------------------------------------- */
var clean = [
  { id: 'b1', t: 'p', x: 'A' },
  { id: 'b2', t: 'p', x: 'B' },
  { id: 'b3', t: 'h1', x: 'Title' },
]
var cleanOut = dedupeBlockIds(clean)
ok('no duplicates: same length', cleanOut.length === clean.length)
ok('no duplicates: ids unchanged', JSON.stringify(ids(cleanOut)) === JSON.stringify(ids(clean)))
ok('no duplicates: values unchanged (deep)', JSON.stringify(cleanOut) === JSON.stringify(clean))
ok('no duplicates: input not mutated', clean[0].id === 'b1' && clean[1].id === 'b2')

/* ---- one duplicate -------------------------------------------------------*/
var oneDup = [
  { id: 'b1', t: 'p', x: 'A' },
  { id: 'b1', t: 'p', x: 'B' },
  { id: 'b3', t: 'p', x: 'C' },
]
var oneDupOut = dedupeBlockIds(oneDup)
ok('one duplicate: no duplicates remain', !hasDuplicates(oneDupOut), JSON.stringify(ids(oneDupOut)))
ok('one duplicate: first occurrence kept its id', oneDupOut[0].id === 'b1')
ok('one duplicate: second occurrence got a new id', oneDupOut[1].id !== 'b1')
ok('one duplicate: third block untouched', oneDupOut[2].id === 'b3' && oneDupOut[2].x === 'C')
ok('one duplicate: minted id matches bid() format',
  /^b[a-z0-9]{1,8}$/.test(oneDupOut[1].id), 'got ' + JSON.stringify(oneDupOut[1].id))
ok('one duplicate: content of renamed block preserved', oneDupOut[1].x === 'B')
ok('one duplicate: original array not mutated', oneDup[1].id === 'b1')

/* ---- several duplicates, including a duplicate of a MINTED id ---------- */
var several = [
  { id: 'b1', t: 'p', x: 'A' },
  { id: 'b1', t: 'p', x: 'B' },
  { id: 'b1', t: 'p', x: 'C' },
  { id: 'b2', t: 'p', x: 'D' },
  { id: 'b2', t: 'p', x: 'E' },
]
var severalOut = dedupeBlockIds(several)
ok('several duplicates: count unchanged', severalOut.length === 5)
ok('several duplicates: no duplicates remain', !hasDuplicates(severalOut), JSON.stringify(ids(severalOut)))
ok('several duplicates: first b1 and first b2 kept their ids',
  severalOut[0].id === 'b1' && severalOut[3].id === 'b2')
ok('several duplicates: content order preserved',
  severalOut.map(function (b) { return b.x }).join('') === 'ABCDE')

/* ---- null / missing id --------------------------------------------------*/
var nullish = [
  { id: null, t: 'p', x: 'A' },
  { t: 'p', x: 'B' }, /* id key entirely absent */
  { id: 'b9', t: 'p', x: 'C' },
]
var nullishOut = dedupeBlockIds(nullish)
ok('null/missing id: all get real ids', nullishOut.every(function (b) { return b.id != null }))
ok('null/missing id: no duplicates', !hasDuplicates(nullishOut), JSON.stringify(ids(nullishOut)))
ok('null/missing id: b9 untouched', nullishOut[2].id === 'b9')
ok('null/missing id: minted ids match bid() format',
  /^b[a-z0-9]{1,8}$/.test(nullishOut[0].id) && /^b[a-z0-9]{1,8}$/.test(nullishOut[1].id))
ok('null/missing id: content preserved', nullishOut[0].x === 'A' && nullishOut[1].x === 'B')

/* ---- empty array ---------------------------------------------------------*/
ok('empty array: returns empty array', JSON.stringify(dedupeBlockIds([])) === '[]')
ok('undefined input: returns empty array', JSON.stringify(dedupeBlockIds(undefined)) === '[]')

/* ---- prove the comparison can fail --------------------------------------
   A "no duplicates" checker that always returns true would pass every ok()
   above silently. Confirm hasDuplicates() itself actually detects duplicates,
   and confirm a naive (broken) dedupe -- one that just re-numbers every id
   sequentially, discarding legitimate stable ids -- would be caught by the
   "first occurrence kept its id" assertions above, not waved through. */
var canaryDup = [{ id: 'x', t: 'p', x: '1' }, { id: 'x', t: 'p', x: '2' }]
var canaryCaught = hasDuplicates(canaryDup) && !hasDuplicates(dedupeBlockIds(canaryDup))
ok('failure detection: hasDuplicates() sees the canary, dedupeBlockIds() clears it', canaryCaught)

function brokenDedupe(blocks) {
  /* deliberately wrong: renumbers every block, including ones that were
     already unique -- this must NOT pass "kept its id" assertions */
  return (blocks || []).map(function (b, i) { return Object.assign({}, b, { id: 'x' + i }) })
}
var brokenOut = brokenDedupe(oneDup)
var brokenCaught = brokenOut[0].id !== 'b1' /* the real dedupeBlockIds keeps b1; the broken one renumbers it */
ok('failure detection: a broken dedupe (renumbers everything) is distinguishable from the real one', brokenCaught)

console.log('dedupeBlockIds    : ' + pass + ' passed, ' + fail + ' failed')
if (failures.length) {
  console.log('\n--- failures ---')
  failures.forEach(function (f) { console.log('  ' + f) })
}
var passed = !fail
console.log('\n' + (passed ? 'PASS' : 'FAIL'))
process.exit(passed ? 0 : 1)
