/* Round-trip property test for blocksToDoc / docToBlocks.
   Verification standard: identity is checked on the exact JSON text, so key order counts,
   and the comparison itself is proved able to fail before any result is trusted. */

var C = require("./console-blocks-doc.js");
var blocksToDoc = C.blocksToDoc, docToBlocks = C.docToBlocks;

var pass = 0, fail = 0, failures = [];

function j(v) { return JSON.stringify(v); }

/* Deep-freeze the input the way the bridge does, so any mutation of an input block
   throws here instead of in production. */
function freeze(v) {
  if (v && typeof v === "object") { Object.keys(v).forEach(function (k) { freeze(v[k]); }); Object.freeze(v); }
  return v;
}

function roundTrip(name, blocks) {
  var got;
  try { got = docToBlocks(blocksToDoc(freeze(blocks))); }
  catch (e) { fail++; failures.push(name + ": threw " + e.message); return false; }
  if (j(got) === j(blocks)) { pass++; return true; }
  fail++;
  failures.push(name + "\n    in:  " + j(blocks) + "\n    out: " + j(got));
  return false;
}

/* ---- the awkward cases named in the brief, one at a time --------------- */

var cases = {
  "p plain":            [{ id: "b1", t: "p", x: "One line." }],
  "p with \\n\\n":      [{ id: "b1", t: "p", x: "First para.\n\nSecond para." }],
  "p with \\n\\n\\n":   [{ id: "b1", t: "p", x: "A\n\n\nB" }],
  "p single \\n":       [{ id: "b1", t: "p", x: "Line one\nline two" }],
  "p empty":            [{ id: "b1", t: "p", x: "" }],
  "two adjacent p":     [{ id: "b1", t: "p", x: "A" }, { id: "b2", t: "p", x: "B" }],
  "p multi + p":        [{ id: "b1", t: "p", x: "A\n\nB" }, { id: "b2", t: "p", x: "C" }],
  "duplicate ids":      [{ id: "b1", t: "p", x: "A" }, { id: "b1", t: "p", x: "B" }],
  "h1/h2/h3":           [{ id: "b1", t: "h1", x: "BANNER" }, { id: "b2", t: "h2", x: "Heading" },
                         { id: "b3", t: "h3", x: "Sub" }],
  "h1 mixed case":      [{ id: "b1", t: "h1", x: "The Emperor's Own" }],
  "h1 with \\n":        [{ id: "b1", t: "h1", x: "Two\nLines" }],
  "quote":              [{ id: "b1", t: "quote", x: "A quote.\n\nSecond para." }],
  "callout":            [{ id: "b1", t: "callout", x: "GM note.\n\nMore." }],
  "read multi-para":    [{ id: "b1", t: "read", x: "Read this.\n\nThen this.\nWith a break." }],
  "list":               [{ id: "b1", t: "list", x: "One\nTwo\nThree" }],
  "list empty":         [{ id: "b1", t: "list", x: "" }],
  "list blank item":    [{ id: "b1", t: "list", x: "One\n\nThree" }],
  "list one item":      [{ id: "b1", t: "list", x: "Only" }],
  "table":              [{ id: "b1", t: "table", r: [["H1", "H2"], ["a", "b"]] }],
  "table ragged":       [{ id: "b1", t: "table", r: [["H1", "H2", "H3"], ["a"], ["b", "c"]] }],
  "table empty rows":   [{ id: "b1", t: "table", r: [] }],
  "table cell \\n":     [{ id: "b1", t: "table", r: [["H"], ["two\nlines"]] }],
  "table empty cells":  [{ id: "b1", t: "table", r: [["", ""], ["", "x"]] }],
  "div":                [{ id: "b1", t: "div" }],
  "pb with x":          [{ id: "b1", t: "pb", x: "" }],
  "pb bare":            [{ id: "b1", t: "pb" }],

  "npc":                [{ id: "b1", t: "npc", name: "Qwar",
                           rows: [{ l: "Role", v: "Village elder" }] }],
  "npc zero rows":      [{ id: "b1", t: "npc", name: "Nameless", rows: [] }],
  "npc no rows key":    [{ id: "b1", t: "npc", name: "Nameless" }],
  "npc multiline v":    [{ id: "b1", t: "npc", name: "Q",
                           rows: [{ l: "Notes", v: "Line one\nLine two\n\nPara" }] }],

  "stat":               [{ id: "b1", t: "stat", name: "Stormtrooper", tier: "Minion",
                           ch: { br: "3", ag: "3", int: "2", cun: "2", wil: "2", pr: "1" },
                           soak: "4", wt: "5", st: "—", def: "0",
                           rows: [{ l: "Skills", v: "Ranged (Light) 2" },
                                  { l: "Equipment", v: "E-11 blaster rifle" }] }],
  "stat zero rows":     [{ id: "b1", t: "stat", name: "X", tier: "Rival",
                           ch: { br: "2" }, rows: [] }],
  "stat carried x/r":   [{ id: "b1", t: "stat", x: "Stormtrooper", name: "Stormtrooper",
                           tier: "Minion", r: [["Skills", "Ranged 2"]],
                           rows: [{ l: "Skills", v: "Ranged 2" }] }],
  "vehicle":            [{ id: "b1", t: "vehicle", name: "Gozanti", tier: "Starship",
                           vs: { sil: "5", spd: "2", hnd: "-1" },
                           vd: { dfore: "1", daft: "1", arm: "3", htt: "18", sst: "12" },
                           rows: [{ l: "Crew", v: "Six" }] }],
  "planet":             [{ id: "b1", t: "planet", name: "Formos", kind: "Planet",
                           rows: [{ l: "Region", v: "Outer Rim" },
                                  { l: "Climate", v: "Arid\nHot" }] }],

  "d-story, no blocks": [],
  "unknown type":       [{ id: "b1", t: "sidebar", x: "Some future block type" }],
  "key order odd":      [{ t: "p", x: "t before id", id: "b1" }]
};

Object.keys(cases).forEach(function (k) { roundTrip(k, cases[k]); });

/* ---- a document mixing every type, in one array ------------------------ */
var mixed = [];
Object.keys(cases).forEach(function (k) {
  cases[k].forEach(function (b, i) { mixed.push(Object.assign({}, b, { id: "m" + mixed.length })); });
});
roundTrip("all types in one document", mixed);

/* ---- seeded fuzz ------------------------------------------------------- */
/* mulberry32: deterministic, so a failure is reproducible from its seed alone */
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

var TYPES = ["p", "h1", "h2", "h3", "quote", "callout", "read", "list", "table",
             "div", "pb", "npc", "stat", "vehicle", "planet"];
/* Strings chosen to stress the newline handling and the transform trap, not to look real */
var FRAGS = ["", "a", "Word", "MIXED Case Text", "two\nlines", "para\n\npara",
             "trail\n", "\nlead", "\n", "\n\n", "a\n\n\nb", "  spaced  ",
             "The Emperor's Own", "—", "x: y", "Skills: Ranged 2 Talents: Adversary 1"];

function fuzzBlock(r, n) {
  var t = TYPES[Math.floor(r() * TYPES.length)], b = { id: "f" + n, t: t };
  function frag() { return FRAGS[Math.floor(r() * FRAGS.length)]; }
  function rows() {
    var out = [], c = Math.floor(r() * 4);
    for (var i = 0; i < c; i++) out.push({ l: frag(), v: frag() });
    return out;
  }
  if (t === "table") {
    var rs = Math.floor(r() * 4), rr = [];
    for (var i = 0; i < rs; i++) {
      var cs = Math.floor(r() * 4), row = [];
      for (var k = 0; k < cs; k++) row.push(frag());
      rr.push(row);
    }
    b.r = rr;
  } else if (t === "npc") { b.name = frag(); b.rows = rows(); }
  else if (t === "stat") {
    b.name = frag(); b.tier = frag();
    b.ch = { br: frag(), ag: frag(), int: frag(), cun: frag(), wil: frag(), pr: frag() };
    b.soak = frag(); b.wt = frag(); b.st = frag(); b.def = frag(); b.rows = rows();
    if (r() < 0.3) b.x = frag();          /* carried original, as cardCarry leaves it */
    if (r() < 0.2) b.r = [[frag()]];
  } else if (t === "vehicle") {
    b.name = frag(); b.tier = frag();
    b.vs = { sil: frag(), spd: frag(), hnd: frag() };
    b.vd = { dfore: frag(), daft: frag(), arm: frag(), htt: frag(), sst: frag() };
    b.rows = rows();
  } else if (t === "planet") { b.name = frag(); b.kind = frag(); b.rows = rows(); }
  else if (t === "div" || t === "pb") { if (r() < 0.5) b.x = ""; }
  else b.x = frag();
  return b;
}

var r = rng(20260928), fuzzFails = 0;
for (var n = 0; n < 2000; n++) {
  var len = Math.floor(r() * 6), bs = [];
  for (var i = 0; i < len; i++) bs.push(fuzzBlock(r, n * 10 + i));
  if (!roundTrip("fuzz#" + n, bs)) fuzzFails++;
}

/* ---- prove the comparison can fail ------------------------------------- */
/* A test that cannot fail has not been run. Each mutation below must be caught. */
var canary = [{ id: "b1", t: "p", x: "A\n\nB" },
              { id: "b2", t: "list", x: "One\nTwo" },
              { id: "b3", t: "stat", name: "S", tier: "Rival", ch: { br: "2" },
                rows: [{ l: "Skills", v: "Ranged 2" }] },
              { id: "b4", t: "table", r: [["H"], ["a"]] }];

var mutations = {
  "drops a block":        function (b) { return b.slice(1); },
  "reorders blocks":      function (b) { return [b[1], b[0]].concat(b.slice(2)); },
  "loses a \\n\\n":       function (b) { var c = JSON.parse(j(b)); c[0].x = "A\nB"; return c; },
  "loses a \\n in list":  function (b) { var c = JSON.parse(j(b)); c[1].x = "One Two"; return c; },
  "uppercases a name":    function (b) { var c = JSON.parse(j(b)); c[2].name = "S".toUpperCase() + "!"; return c; },
  "drops a card row":     function (b) { var c = JSON.parse(j(b)); c[2].rows = []; return c; },
  "changes key order":    function (b) { var c = JSON.parse(j(b)); c[0] = { t: "p", id: "b1", x: "A\n\nB" }; return c; },
  "swaps table rows":     function (b) { var c = JSON.parse(j(b)); c[3].r = [["a"], ["H"]]; return c; },
  "changes a block id":   function (b) { var c = JSON.parse(j(b)); c[0].id = "zz"; return c; }
};

var mutCaught = 0, mutMissed = [];
var baseline = j(docToBlocks(blocksToDoc(canary)));
Object.keys(mutations).forEach(function (name) {
  /* the mutation is applied to the EXPECTED value; the comparison must reject it */
  if (baseline !== j(mutations[name](canary))) mutCaught++;
  else mutMissed.push(name);
});

/* and the input must not have been mutated in place */
var frozenInput = freeze(JSON.parse(j(canary)));
var mutatedInput = false;
try { docToBlocks(blocksToDoc(frozenInput)); }
catch (e) { mutatedInput = true; failures.push("mutated a frozen input: " + e.message); }

/* ---- report ------------------------------------------------------------ */
console.log("named cases + fuzz : " + pass + " passed, " + fail + " failed"
            + "   (fuzz documents: 2000, failing: " + fuzzFails + ")");
console.log("failure detection  : " + mutCaught + "/" + Object.keys(mutations).length
            + " mutations caught" + (mutMissed.length ? " -- MISSED: " + mutMissed.join(", ") : ""));
console.log("frozen input       : " + (mutatedInput ? "MUTATED (bad)" : "not mutated"));

if (failures.length) {
  console.log("\n--- failures (first 12) ---");
  failures.slice(0, 12).forEach(function (f) { console.log("  " + f); });
}
var ok = !fail && !mutMissed.length && !mutatedInput;
console.log("\n" + (ok ? "PASS" : "FAIL"));
process.exit(ok ? 0 : 1);
