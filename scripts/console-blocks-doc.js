/* blocksToDoc / docToBlocks
   ------------------------------------------------------------------
   The block array stays the storage format. A TipTap (ProseMirror) document is a
   projection of it. These two functions are the whole contract between the two, and
   the only place either representation is allowed to know about the other.

   Round-trip identity is stronger than deep equality here: docToBlocks(blocksToDoc(b))
   reproduces b including JSON key order, because the Word export, the Archive stat-block
   export and the JSON export/import all read blocks directly and a reordered key set
   makes a diff unreadable even when nothing has actually changed.

   Three things make identity non-trivial, and each is handled explicitly:

   1. A `p` whose `x` contains "\n\n" becomes several paragraph nodes, which is then
      indistinguishable from several adjacent `p` blocks. Nodes therefore carry `cont`:
      the first node of a block has cont:false, its continuations cont:true, and
      docToBlocks regroups on that rather than guessing.
   2. Blocks carry keys this mapping does not model -- `x` on a `pb`, the original `x`
      and `r` left on a converted card. Anything not consumed is stashed verbatim in
      attrs.extra and put back.
   3. Everything read out of the bridge is frozen, so nothing here mutates its input.
*/

var CARD_KINDS = { stat: 1, vehicle: 1, planet: 1 };

/* Key order is part of the contract, so rebuild objects in the order recorded rather
   than in the order this code happens to assign. */
function rebuild(keys, vals) {
  var out = {}, i, k;
  for (i = 0; i < keys.length; i++) { k = keys[i]; if (k in vals) out[k] = vals[k]; }
  /* anything the recorded order missed (a key added since) still lands, at the end */
  for (k in vals) if (!(k in out)) out[k] = vals[k];
  return out;
}

function clone(v) {
  if (v === null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(clone);
  var out = {}, k;
  for (k in v) out[k] = clone(v[k]);
  return out;
}

/* Everything on the block except id, t and the keys this block type consumes. */
function extraOf(b, consumed) {
  var out = null, k;
  for (k in b) {
    if (k === "id" || k === "t" || consumed[k]) continue;
    if (!out) out = {};
    out[k] = clone(b[k]);
  }
  return out;
}

/* ---- inline text <-> inline content -------------------------------------
   A single "\n" inside one logical line is a hardBreak. The read-mode renderer turns
   it into <br> via nl(), so it is real content, not whitespace to normalise away. */
function inlineOf(s) {
  var parts = String(s === undefined || s === null ? "" : s).split("\n"), out = [], i;
  for (i = 0; i < parts.length; i++) {
    if (i) out.push({ type: "hardBreak" });
    if (parts[i] !== "") out.push({ type: "text", text: parts[i] });
  }
  return out;
}
function textOf(content) {
  var s = "", i, n;
  for (i = 0; i < (content || []).length; i++) {
    n = content[i];
    if (n.type === "hardBreak") s += "\n";
    else if (n.type === "text") s += n.text;
    else if (n.content) s += textOf(n.content);
  }
  return s;
}

/* A body string: "\n\n" separates paragraphs, "\n" is a break inside one. */
function parasOf(s) {
  return String(s === undefined || s === null ? "" : s).split("\n\n").map(function (p) {
    return { type: "paragraph", content: inlineOf(p) };
  });
}
function bodyOf(nodes) {
  return (nodes || []).map(function (n) { return textOf(n.content); }).join("\n\n");
}

/* ---- blocks -> doc ---------------------------------------------------- */

function blocksToDoc(blocks) {
  var content = [];
  (blocks || []).forEach(function (b) {
    var keys = Object.keys(b), id = b.id, t = b.t, nodes, extra;

    function attrs(consumed, more) {
      var a = { blockId: id, cont: false, keys: keys, extra: extraOf(b, consumed) };
      if (more) for (var k in more) a[k] = more[k];
      return a;
    }

    switch (t) {
      case "h1": case "h2": case "h3":
        nodes = [{ type: "heading",
                   attrs: attrs({ x: 1 }, { level: +t.charAt(1) }),
                   content: inlineOf(b.x) }];
        break;

      case "p":
        extra = extraOf(b, { x: 1 });
        nodes = parasOf(b.x).map(function (p, i) {
          p.attrs = { blockId: id, cont: i > 0, keys: keys, extra: extra };
          return p;
        });
        break;

      case "quote":
        nodes = [{ type: "blockquote", attrs: attrs({ x: 1 }), content: parasOf(b.x) }];
        break;

      case "callout": case "read":
        nodes = [{ type: t === "callout" ? "calloutBlock" : "readAloud",
                   attrs: attrs({ x: 1 }),
                   content: parasOf(b.x) }];
        break;

      case "list":
        /* one item per "\n", so x:"" is a single empty item and rejoins to "" */
        nodes = [{ type: "bulletList", attrs: attrs({ x: 1 }),
                   content: String(b.x === undefined || b.x === null ? "" : b.x)
                     .split("\n").map(function (li) {
                       return { type: "listItem",
                                content: [{ type: "paragraph", content: inlineOf(li) }] };
                     }) }];
        break;

      case "table":
        /* row 0 is the header. Rows may be ragged; cells keep their newlines. */
        nodes = [{ type: "table", attrs: attrs({ r: 1 }),
                   content: (b.r || []).map(function (row, ri) {
                     return { type: "tableRow",
                              content: (row || []).map(function (c) {
                                return { type: ri === 0 ? "tableHeader" : "tableCell",
                                         attrs: { colspan: 1, rowspan: 1, colwidth: null },
                                         content: [{ type: "paragraph", content: inlineOf(c) }] };
                              }) };
                   }) }];
        break;

      case "div":
        nodes = [{ type: "ornament", attrs: attrs({}) }];
        break;

      case "pb":
        /* kept for the Word export even though the screen no longer paginates */
        nodes = [{ type: "pageBreak", attrs: attrs({}) }];
        break;

      case "npc":
        /* npc predates CARDDEF and keeps its own shape. Not normalised here: a
           migration is separate work and the live documents use the old shape. */
        nodes = [{ type: "npcCard",
                   attrs: attrs({ name: 1, rows: 1 },
                                { name: b.name, rows: clone(b.rows) }) }];
        break;

      case "stat": case "vehicle": case "planet": {
        /* The card payload varies by kind (CARDDEF drives it), so the whole payload
           travels as one attr rather than a field list this file would have to keep in
           step with CARDDEF. */
        var data = {}, k;
        for (k in b) if (k !== "id" && k !== "t") data[k] = clone(b[k]);
        nodes = [{ type: "card",
                   attrs: { blockId: id, cont: false, keys: keys, extra: null,
                            kind: t, data: data } }];
        break;
      }

      default:
        /* An unknown t must survive a round trip untouched rather than be coerced to p. */
        nodes = [{ type: "unknownBlock",
                   attrs: { blockId: id, cont: false, keys: keys, kind: t,
                            extra: extraOf(b, {}) } }];
    }

    content = content.concat(nodes);
  });

  return { type: "doc", content: content };
}

/* ---- doc -> blocks ---------------------------------------------------- */

/* A node with no blockId was not made by blocksToDoc: either TipTap filler, or a block
   the GM just created. An empty one is filler and must vanish, because a document that
   round-trips to one empty block is what deletes d-story: its 4,733 characters live in
   `body`, and saveDoc strips body the moment blocks is non-empty. An empty ProseMirror
   doc is invalid (doc content is "block+"), so mounting a zero-block document ALWAYS
   produces that filler paragraph. A non-empty one is a real new block and is minted an
   id in the console's own format. */
function isFiller(n) {
  var a = n.attrs || {};
  if (a.blockId) return false;
  if (n.type !== "paragraph") return false;
  return textOf(n.content) === "";
}
/* same shape as the console's bid() */
function mintId() { return "b" + Math.random().toString(36).slice(2, 9); }

/* Consecutive nodes belong to one block only when the later ones are marked cont AND
   carry the same blockId. That way a duplicated id cannot silently merge two blocks,
   and a paragraph dragged out of a multi-paragraph block becomes its own block. */
function groups(content) {
  var out = [], i, n, prev;
  var src = (content || []).filter(function (x) { return !isFiller(x); });
  for (i = 0; i < src.length; i++) {
    n = src[i];
    prev = out.length ? out[out.length - 1] : null;
    if (prev && n.attrs && n.attrs.cont && prev[0].attrs &&
        prev[0].attrs.blockId === n.attrs.blockId && n.type === prev[0].type) {
      prev.push(n);
    } else out.push([n]);
  }
  return out;
}

var NODE_T = { calloutBlock: "callout", readAloud: "read", ornament: "div",
               pageBreak: "pb", blockquote: "quote", bulletList: "list",
               table: "table", npcCard: "npc", paragraph: "p" };

function docToBlocks(doc) {
  return groups(doc && doc.content).map(function (g) {
    var n = g[0], a = n.attrs || {}, vals = {}, t, k;

    switch (n.type) {
      case "heading":
        t = "h" + (Math.min(3, Math.max(1, a.level || 1)));
        vals.x = textOf(n.content);
        break;

      case "paragraph":
        t = "p";
        vals.x = g.map(function (p) { return textOf(p.content); }).join("\n\n");
        break;

      case "blockquote": case "calloutBlock": case "readAloud":
        t = NODE_T[n.type];
        vals.x = bodyOf(n.content);
        break;

      case "bulletList":
        t = "list";
        vals.x = (n.content || []).map(function (li) {
          return bodyOf(li.content);
        }).join("\n");
        break;

      case "table":
        t = "table";
        vals.r = (n.content || []).map(function (row) {
          return (row.content || []).map(function (cell) { return bodyOf(cell.content); });
        });
        break;

      case "ornament": t = "div"; break;
      case "pageBreak": t = "pb"; break;

      case "npcCard":
        t = "npc";
        vals.name = a.name;
        vals.rows = clone(a.rows);
        break;

      case "card":
        t = a.kind;
        for (k in (a.data || {})) vals[k] = clone(a.data[k]);
        break;

      case "unknownBlock":
        t = a.kind;
        break;

      default:
        /* a stock node with no block of its own (a stray paragraph TipTap inserted) */
        t = "p";
        vals.x = textOf(n.content);
    }

    for (k in (a.extra || {})) if (!(k in vals)) vals[k] = clone(a.extra[k]);
    vals.id = a.blockId || mintId();
    vals.t = t;
    return rebuild(a.keys || ["id", "t"], vals);
  });
}

module.exports = { blocksToDoc: blocksToDoc, docToBlocks: docToBlocks };
