#!/usr/bin/env node
/* Step 2: run blocksToDoc/docToBlocks over every live document and assert identity.
   READ ONLY. This script never issues anything but GET, and asserts that before it runs.

   Reads through the anon-key REST endpoint, per the verification standard, because
   privileged SQL sees rows the client cannot and would therefore verify the wrong thing.

   Usage:
     SUPABASE_URL=https://xxxx.supabase.co \
     SUPABASE_ANON_KEY=eyJ... \
     node verify-live.js [--table console_documents] [--json out.json]

   The column holding the document JSON is detected from the first row rather than
   assumed, since the console file does not know the Archive's table shape.
*/

var C = require("./console-blocks-doc.js");

var args = process.argv.slice(2);
function opt(n, d) { var i = args.indexOf(n); return i === -1 ? d : args[i + 1]; }
var TABLE = opt("--table", "console_documents");
var OUTJSON = opt("--json", null);
var CAMPAIGN = opt("--campaign", "6ba1c2c4-1281-4cca-826a-6677b333a68f");

var URL_ = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_ANON_KEY;
if (!URL_ || !KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_ANON_KEY (anon key, not service role).");
  process.exit(2);
}
if (/service_role/.test(Buffer.from(String(KEY).split(".")[1] || "", "base64").toString())) {
  console.error("That looks like a service-role key. The standard requires the anon key,\n" +
                "because a privileged key sees rows the client cannot.");
  process.exit(2);
}

function get(path) {
  return fetch(URL_.replace(/\/$/, "") + "/rest/v1/" + path, {
    method: "GET",
    headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" }
  }).then(function (r) {
    if (!r.ok) return r.text().then(function (t) {
      throw new Error("HTTP " + r.status + " on " + path + ": " + t.slice(0, 300)); });
    return r.json();
  });
}

/* Find the column that holds { blocks: [...] }, or the columns if the doc is flattened. */
function shapeOf(row) {
  var k;
  if (Array.isArray(row.blocks)) return { flat: true, col: null };
  for (k in row) {
    var v = row[k];
    if (v && typeof v === "object" && !Array.isArray(v) && Array.isArray(v.blocks))
      return { flat: false, col: k };
  }
  for (k in row) {                       /* jsonb sometimes arrives as a string */
    if (typeof row[k] === "string" && row[k].charAt(0) === "{") {
      try { var p = JSON.parse(row[k]); if (Array.isArray(p.blocks))
        return { flat: false, col: k, parse: true }; } catch (e) {}
    }
  }
  return null;
}

function docOf(row, sh) {
  var d = sh.flat ? row : (sh.parse ? JSON.parse(row[sh.col]) : row[sh.col]);
  /* On this table body lives one level down, in a separate `data` column
     (columns are campaign_id, id, title, folder, blocks, data, updated_at;
     data is {body, updated} for a blockless document) -- it is not a sibling
     of `blocks` the way the rest of this shape detection assumes. Without
     this, a blockless document's body reads as undefined and never gets
     reported as body-only. */
  if ((d.body === undefined || d.body === null) &&
      row.data && typeof row.data === "object" && "body" in row.data) {
    d = Object.assign({}, d, { body: row.data.body });
  }
  return d;
}

get(encodeURIComponent(TABLE) + "?select=*&limit=500").then(function (rows) {
  if (!rows.length) { console.error("No rows returned from " + TABLE +
    ". Wrong table name, or RLS is hiding them from the anon key."); process.exit(1); }

  var sh = shapeOf(rows[0]);
  if (!sh) { console.error("Could not find a document payload in " + TABLE +
    ". Columns seen: " + Object.keys(rows[0]).join(", ") +
    "\nPass the right table with --table."); process.exit(1); }

  console.log("table            : " + TABLE + "  (" + rows.length + " rows)");
  console.log("payload          : " + (sh.flat ? "flat columns"
                : "column \"" + sh.col + "\"" + (sh.parse ? " (json text)" : " (jsonb)")));
  console.log("");

  var results = [], fails = 0, totalBlocks = 0;

  rows.forEach(function (row) {
    var d, name = row.id || row.doc_id || "(no id)";
    try { d = docOf(row, sh); } catch (e) {
      results.push({ id: name, ok: false, why: "unreadable payload: " + e.message });
      fails++; return;
    }
    var blocks = d.blocks || [];
    totalBlocks += blocks.length;
    var before = JSON.stringify(blocks), after, why = null;
    try { after = JSON.stringify(C.docToBlocks(C.blocksToDoc(blocks))); }
    catch (e) { after = null; why = "threw: " + e.message; }

    var ok = after !== null && after === before;
    if (!ok && !why) {
      /* locate the first block that differs, so the report names it */
      var a = blocks, b = JSON.parse(after), i;
      for (i = 0; i < Math.max(a.length, b.length); i++) {
        if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) {
          why = "first difference at block " + i +
                " (t=" + ((a[i] && a[i].t) || "?") + ", id=" + ((a[i] && a[i].id) || "?") + ")";
          break;
        }
      }
      why = why || "lengths differ: " + a.length + " in, " + b.length + " out";
    }
    if (!ok) fails++;
    results.push({ id: name, title: d.title || "", blocks: blocks.length,
                   bodyOnly: blocks.length === 0 ? String(d.body || "").length : 0,
                   ok: ok, why: why,
                   before: ok ? null : before, after: ok ? null : after });
  });

  results.sort(function (a, b) { return b.blocks - a.blocks; });
  results.forEach(function (r) {
    console.log((r.ok ? "  ok   " : "  FAIL ") +
      String(r.blocks).padStart(4) + " blocks  " +
      String(r.id).padEnd(24) + (r.title ? " " + r.title : "") +
      (r.bodyOnly ? "   [body-only, " + r.bodyOnly + " chars]" : "") +
      (r.why ? "\n         " + r.why : ""));
  });

  /* Two canaries, not one: d-formos is the size/card-type canary named in the original
     brief; d-ghost is both the actual largest document (570 vs. d-formos's 511 blocks)
     and the arc currently being run at the table, so it is the more meaningful canary
     on both counts. Added alongside d-formos, not in place of it. */
  function canaryLine(label, pattern) {
    var c = results.filter(function (r) { return pattern.test(r.id + " " + r.title); })[0];
    return label.padEnd(17) + ": " + (c
      ? (c.ok ? "ok, " + c.blocks + " blocks" : "FAILED -- " + c.why)
      : "not found in these rows");
  }
  console.log("");
  console.log("documents        : " + results.length + ", " + totalBlocks + " blocks total");
  console.log("identity         : " + (results.length - fails) + " passed, " + fails + " failed");
  console.log(canaryLine("d-formos", /formos/i));
  console.log(canaryLine("d-ghost", /ghost/i));
  console.log("writes issued    : none (GET only)");

  if (OUTJSON) {
    require("fs").writeFileSync(OUTJSON, JSON.stringify(results, null, 1));
    console.log("report           : " + OUTJSON);
  }
  console.log("\n" + (fails ? "FAIL" : "PASS"));
  process.exit(fails ? 1 : 0);
}).catch(function (e) { console.error("\n" + e.message); process.exit(1); });
