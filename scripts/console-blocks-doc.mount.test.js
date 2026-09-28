/* Mount safety.
   Separate from round-trip identity, because this is a different property: what the
   converter does with a document TipTap has touched but the GM has not.

   The bug this guards against: doc content is "block+", so an empty ProseMirror document
   is invalid. Mounting a zero-block document therefore always yields one filler
   paragraph. If that serialises back to one `p` block, saveDoc's conditional strip
   (`if (payload.blocks && payload.blocks.length) delete payload.body`) fires and deletes
   the body -- which for d-story is its entire 4,733 characters of content.

   Runs with or without prosemirror-model. Without it, the filler shape is the one
   schema.nodes.doc.createAndFill() actually produced against a block+ schema. */

var C = require("./console-blocks-doc.js");
var pass = 0, fail = 0, notes = [];

function ok(name, cond, detail) {
  if (cond) { pass++; return; }
  fail++; notes.push(name + (detail ? ": " + detail : ""));
}

/* the console's save path, in the shape it actually has */
function savePath(doc, body) {
  var payload = { id: "d-story", title: "Campaign Guide",
                  blocks: C.docToBlocks(doc), body: body };
  if (payload.blocks && payload.blocks.length) delete payload.body;
  return payload;
}
var BODY = "the entire document, 4733 characters";

/* --- the filler shape, as real ProseMirror produces it ------------------ */
var FILLER = { type: "doc", content: [ { type: "paragraph",
  attrs: { blockId: null, cont: false, keys: null, extra: null } } ] };

var p1 = savePath(FILLER, BODY);
ok("filler doc yields zero blocks", p1.blocks.length === 0,
   "got " + JSON.stringify(p1.blocks));
ok("body survives a bare mount", "body" in p1 && p1.body === BODY,
   "body was stripped");

/* filler with an explicitly empty content array, and with missing attrs entirely */
[ { type: "doc", content: [ { type: "paragraph", content: [] } ] },
  { type: "doc", content: [ { type: "paragraph" } ] },
  { type: "doc", content: [ { type: "paragraph", attrs: {}, content: [] } ] }
].forEach(function (d, i) {
  var p = savePath(d, BODY);
  ok("filler variant " + i + " yields zero blocks", p.blocks.length === 0,
     JSON.stringify(p.blocks));
  ok("filler variant " + i + " keeps body", "body" in p);
});

/* --- what must NOT be swallowed ----------------------------------------- */

/* a real empty p block the GM made: it has an id, so it is content, not filler */
var realEmpty = C.blocksToDoc([{ id: "b1", t: "p", x: "" }]);
ok("an id-bearing empty p survives", C.docToBlocks(realEmpty).length === 1);

/* a paragraph the GM just typed, before any id has been stamped on it */
var typed = { type: "doc", content: [ { type: "paragraph",
  content: [ { type: "text", text: "Something new." } ] } ] };
var out = C.docToBlocks(typed);
ok("a new typed paragraph becomes a block", out.length === 1, JSON.stringify(out));
ok("a new block is minted a real id",
   out.length === 1 && /^b[a-z0-9]{1,8}$/.test(String(out[0].id)),
   "id was " + (out[0] && JSON.stringify(out[0].id)));
ok("a minted id is never null", out.every(function (b) { return b.id != null; }));

/* trailing filler after real content must not become a stray empty block */
var trailing = { type: "doc", content:
  C.blocksToDoc([{ id: "b1", t: "p", x: "Real." }]).content
   .concat([{ type: "paragraph", attrs: { blockId: null, cont: false, keys: null, extra: null } }]) };
var tb = C.docToBlocks(trailing);
ok("trailing filler is dropped", tb.length === 1, JSON.stringify(tb));
ok("real content ahead of filler is intact", tb.length && tb[0].x === "Real.");

/* an empty doc must still round-trip to zero blocks, not one */
ok("blocksToDoc([]) -> docToBlocks -> []",
   C.docToBlocks(C.blocksToDoc([])).length === 0);

/* --- against the real schema, when it is available ---------------------- */
var real = "skipped (prosemirror-model not installed)";
try {
  var Schema = require("prosemirror-model").Schema;
  var schema = new Schema({ nodes: {
    doc: { content: "block+" },
    paragraph: { group: "block", content: "inline*",
      attrs: { blockId:{default:null}, cont:{default:false},
               keys:{default:null}, extra:{default:null} },
      toDOM: function(){ return ["p", 0]; } },
    text: { group: "inline" } }, marks: {} });

  /* confirm the premise rather than assume it: an empty doc really is invalid */
  var invalid = false;
  try { schema.nodeFromJSON({ type:"doc", content:[] }).check(); }
  catch (e) { invalid = true; }
  ok("premise holds: an empty doc is invalid under block+", invalid,
     "an empty doc validated, so the filler may not appear and this test is moot");

  var filled = schema.nodes.doc.createAndFill().toJSON();
  var p = savePath(filled, BODY);
  ok("real createAndFill yields zero blocks", p.blocks.length === 0, JSON.stringify(p.blocks));
  ok("real createAndFill keeps body", "body" in p);
  real = "ran against prosemirror-model";
} catch (e) {
  if (!/Cannot find module/.test(e.message)) { fail++; notes.push("schema probe: " + e.message); }
}

/* --- prove these assertions can fail ------------------------------------ */
/* Re-run the central one against a converter that lacks the guard. */
function unguarded(doc) {
  return (doc.content || []).map(function (n) {
    return { id: (n.attrs && n.attrs.blockId) || null, t: "p",
             x: (n.content || []).map(function (t) { return t.text || ""; }).join("") };
  });
}
var bad = { id:"d-story", blocks: unguarded(FILLER), body: BODY };
if (bad.blocks && bad.blocks.length) delete bad.body;
var caught = !("body" in bad);
ok("the unguarded converter is caught destroying body", caught,
   "this test cannot detect the bug it exists to prevent");

console.log("mount safety     : " + pass + " passed, " + fail + " failed");
console.log("real schema      : " + real);
if (notes.length) { console.log("\n--- failures ---");
  notes.forEach(function (n) { console.log("  " + n); }); }
console.log("\n" + (fail ? "FAIL" : "PASS"));
process.exit(fail ? 1 : 0);
