/* Independent check: the console's own docBody() must see identical text before and
   after a round trip. docBody is lifted verbatim from build 2026-09-27.1 rather than
   reimplemented, so this does not share a code path with blocks-doc.js and cannot
   agree with it by construction. docBody feeds search, word counts and the Word export,
   so an identical result there is the property that actually matters downstream. */

/* docBody, CARDDEF, CHARS and DERIV are extracted verbatim from the vendored console
   file at test time -- not reimplemented, not imported from an equivalent -- so this
   oracle shares no code path with blocks-doc.js and cannot agree with it by
   construction, and stays honest if the console file changes underneath it. */
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var CONSOLE_PATH = path.join(__dirname, "..", "public", "console", "index.html");
var CONSOLE_SRC = fs.readFileSync(CONSOLE_PATH, "utf8");

function extractStatement(marker) {
  var i = CONSOLE_SRC.indexOf(marker);
  if (i === -1) throw new Error("could not find " + JSON.stringify(marker) + " in " + CONSOLE_PATH);
  var j = CONSOLE_SRC.indexOf(";", i);
  if (j === -1) throw new Error("unterminated statement for " + marker);
  return CONSOLE_SRC.slice(i, j + 1);
}

function extractBalanced(marker, openCh, closeCh) {
  var start = CONSOLE_SRC.indexOf(marker);
  if (start === -1) throw new Error("could not find " + JSON.stringify(marker) + " in " + CONSOLE_PATH);
  var i = CONSOLE_SRC.indexOf(openCh, start), depth = 0, j = i;
  for (; j < CONSOLE_SRC.length; j++) {
    if (CONSOLE_SRC[j] === openCh) depth++;
    else if (CONSOLE_SRC[j] === closeCh) { depth--; if (depth === 0) break; }
  }
  if (depth !== 0) throw new Error("unbalanced " + openCh + closeCh + " extracting " + marker);
  var end = j + 1;
  if (CONSOLE_SRC.charAt(end) === ";") end++;
  return CONSOLE_SRC.slice(start, end);
}

var charsSrc   = extractStatement("var CHARS=");
var derivSrc   = extractStatement("var DERIV=");
var carddefSrc = extractBalanced("var CARDDEF={", "{", "}");
var docBodySrc = extractBalanced("function docBody(", "{", "}");

var sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  charsSrc + "\n" + derivSrc + "\n" + carddefSrc + "\n" + docBodySrc +
  "\nthis.__oracle__ = { docBody: docBody, CARDDEF: CARDDEF, CHARS: CHARS, DERIV: DERIV };",
  sandbox,
  { filename: CONSOLE_PATH + " (extracted)" }
);

var O = sandbox.__oracle__;
var C = require("./console-blocks-doc.js");

var pass = 0, fail = 0, bad = [];

function check(name, blocks) {
  var before, after;
  try {
    before = O.docBody({ blocks: blocks });
    after  = O.docBody({ blocks: C.docToBlocks(C.blocksToDoc(blocks)) });
  } catch (e) { fail++; bad.push(name + ": threw " + e.message); return; }
  if (before === after) pass++;
  else { fail++; bad.push(name + "\n    before: " + JSON.stringify(before)
                            + "\n    after:  " + JSON.stringify(after)); }
}

/* the same corpus the round-trip test uses, plus the card shapes docBody walks deepest */
var cases = {
  "p multi":   [{ id: "b1", t: "p", x: "A\n\nB\nC" }],
  "h1 case":   [{ id: "b1", t: "h1", x: "The Emperor's Own" }],
  "list":      [{ id: "b1", t: "list", x: "One\nTwo\n\nFour" }],
  "table":     [{ id: "b1", t: "table", r: [["H1", "H2"], ["a\nb"], []] }],
  "div/pb":    [{ id: "b1", t: "div" }, { id: "b2", t: "pb", x: "" }],
  "npc":       [{ id: "b1", t: "npc", name: "Qwar",
                  rows: [{ l: "Role", v: "Elder" }, { l: "Notes", v: "two\nlines" }] }],
  "npc empty": [{ id: "b1", t: "npc", name: "X", rows: [] }],
  "stat":      [{ id: "b1", t: "stat", name: "Stormtrooper", tier: "Minion",
                  ch: { br: "3", ag: "3", int: "2", cun: "2", wil: "2", pr: "1" },
                  soak: "4", wt: "5", st: "—", def: "0",
                  rows: [{ l: "Skills", v: "Ranged (Light) 2" }] }],
  "stat gaps": [{ id: "b1", t: "stat", name: "X", tier: "Rival", ch: { br: "2" }, rows: [] }],
  "vehicle":   [{ id: "b1", t: "vehicle", name: "Gozanti", tier: "Starship",
                  vs: { sil: "5", spd: "2", hnd: "-1" },
                  vd: { dfore: "1", daft: "1", arm: "3", htt: "18", sst: "12" },
                  rows: [{ l: "Crew", v: "Six" }] }],
  "planet":    [{ id: "b1", t: "planet", name: "Formos", kind: "Planet",
                  rows: [{ l: "Region", v: "Outer Rim" }, { l: "Climate", v: "Arid\nHot" }] }],
  "d-story":   []
};
Object.keys(cases).forEach(function (k) { check(k, cases[k]); });

/* and the whole fuzz corpus, regenerated from the same seed */
function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0;
  var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
var TYPES = ["p","h1","h2","h3","quote","callout","read","list","table","div","pb",
             "npc","stat","vehicle","planet"];
var FRAGS = ["","a","Word","MIXED Case Text","two\nlines","para\n\npara","trail\n",
             "\nlead","\n","\n\n","a\n\n\nb","  spaced  ","The Emperor's Own","—",
             "x: y","Skills: Ranged 2 Talents: Adversary 1"];
function fz(r, n) {
  var t = TYPES[Math.floor(r() * TYPES.length)], b = { id: "f" + n, t: t };
  function f() { return FRAGS[Math.floor(r() * FRAGS.length)]; }
  function rows() { var o = [], c = Math.floor(r() * 4), i;
    for (i = 0; i < c; i++) o.push({ l: f(), v: f() }); return o; }
  if (t === "table") { var rs = Math.floor(r() * 4), rr = [], i, k;
    for (i = 0; i < rs; i++) { var cs = Math.floor(r() * 4), row = [];
      for (k = 0; k < cs; k++) row.push(f()); rr.push(row); } b.r = rr; }
  else if (t === "npc") { b.name = f(); b.rows = rows(); }
  else if (t === "stat") { b.name = f(); b.tier = f();
    b.ch = { br: f(), ag: f(), int: f(), cun: f(), wil: f(), pr: f() };
    b.soak = f(); b.wt = f(); b.st = f(); b.def = f(); b.rows = rows();
    if (r() < 0.3) b.x = f(); if (r() < 0.2) b.r = [[f()]]; }
  else if (t === "vehicle") { b.name = f(); b.tier = f();
    b.vs = { sil: f(), spd: f(), hnd: f() };
    b.vd = { dfore: f(), daft: f(), arm: f(), htt: f(), sst: f() }; b.rows = rows(); }
  else if (t === "planet") { b.name = f(); b.kind = f(); b.rows = rows(); }
  else if (t === "div" || t === "pb") { if (r() < 0.5) b.x = ""; }
  else b.x = f();
  return b;
}
var r = rng(20260928), n, i;
for (n = 0; n < 2000; n++) {
  var len = Math.floor(r() * 6), bs = [];
  for (i = 0; i < len; i++) bs.push(fz(r, n * 10 + i));
  check("fuzz#" + n, bs);
}

/* prove this oracle can disagree: feed it a deliberately lossy conversion */
function lossy(blocks) {
  return JSON.parse(JSON.stringify(blocks)).map(function (b) {
    if (b.t === "p" && b.x) b.x = b.x.replace(/\n\n/g, "\n");        /* the \n\n trap */
    if (b.t === "h1" && b.x) b.x = b.x.toUpperCase();                /* the innerText trap */
    if (b.rows) b.rows = b.rows.map(function (q) {
      return { l: q.l, v: String(q.v || "").replace(/\n/g, " ") }; });/* textContent trap */
    return b;
  });
}
var probe = [{ id: "b1", t: "p", x: "A\n\nB" },
             { id: "b2", t: "h1", x: "The Emperor's Own" },
             { id: "b3", t: "npc", name: "Q", rows: [{ l: "Notes", v: "two\nlines" }] }];
var caught = O.docBody({ blocks: probe }) !== O.docBody({ blocks: lossy(probe) });

console.log("docBody identity : " + pass + " passed, " + fail + " failed");
console.log("oracle sensitivity: " + (caught ? "detects a lossy conversion"
                                             : "BLIND -- oracle proves nothing"));
if (bad.length) { console.log("\n--- failures (first 10) ---");
  bad.slice(0, 10).forEach(function (b) { console.log("  " + b); }); }
var ok = !fail && caught;
console.log("\n" + (ok ? "PASS" : "FAIL"));
process.exit(ok ? 0 : 1);
