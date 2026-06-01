(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@supabase/ssr/dist/module/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
;
function createClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://peodenvcchftqqtikdhx.supabase.co").trim(), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlb2RlbnZjY2hmdHFxdGlrZGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTY0MjUsImV4cCI6MjA4ODE3MjQyNX0.IbXBomzcm9XbLZE5dpOVfuQvLzqgM4skOzgn10wa4aM").trim());
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "randomUUID",
    ()=>randomUUID,
    "stripBBCode",
    ()=>stripBBCode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
/**
 * UUID v4 generator that works in both secure (HTTPS/localhost) and
 * non-secure (HTTP over local network) contexts.
 * crypto.randomUUID() requires a secure context — fall back to Math.random()
 * when unavailable (e.g. accessed via 192.168.x.x over HTTP).
 */ const DICE_TAGS_RE = /\[(BO|BST|SE|SET|BL|DI|DIF|CH|CHL|PR|PRO|AB|ABL)\]/gi;
function stripBBCode(text) {
    // Stash dice tags behind NUL placeholders so the catch-all strip misses them
    const stash = [];
    let held = text.replace(DICE_TAGS_RE, (match)=>{
        stash.push(match.toUpperCase());
        return `\x00${stash.length - 1}\x00`;
    });
    // Strip [H3]/[H4] headings entirely including their content (item name shown in card header)
    held = held.replace(/\[H[34]\][^\[]*\[[Hh][34]\]/gi, '');
    // Convert [P] paragraph markers to double newline for spacing
    held = held.replace(/\[P\]/gi, '\n\n');
    // Strip all remaining BBCode tags
    const stripped = held.replace(/\[[^\]]*\]/g, '');
    // Collapse horizontal whitespace only (preserve newlines), cap at 2 consecutive newlines
    const normalized = stripped.replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    return normalized.replace(/\x00(\d+)\x00/g, (_, i)=>stash[parseInt(i, 10)]);
}
function randomUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c)=>{
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ═══════════════════════════════════════
// HOLOCRON TypeScript Types
// ═══════════════════════════════════════
// ── Reference Data Types ──
__turbopack_context__.s([
    "ACTIVATION_LABELS",
    ()=>ACTIVATION_LABELS,
    "CHARACTERISTIC_ABBR",
    ()=>CHARACTERISTIC_ABBR,
    "RANGE_LABELS",
    ()=>RANGE_LABELS
]);
const CHARACTERISTIC_ABBR = {
    BR: 'brawn',
    AG: 'agility',
    INT: 'intellect',
    CUN: 'cunning',
    WIL: 'willpower',
    PR: 'presence'
};
const RANGE_LABELS = {
    wrEngaged: 'Engaged',
    wrShort: 'Short',
    wrMedium: 'Medium',
    wrLong: 'Long',
    wrExtreme: 'Extreme'
};
const ACTIVATION_LABELS = {
    taPassive: 'Passive',
    taAction: 'Action',
    taManeuver: 'Maneuver',
    taIncidental: 'Incidental',
    taIncidentalOOT: 'Incidental (OOT)'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/parseSymbols.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * parseSymbols — parses human-readable shortcode markup into typed segments.
 *
 * Supported shortcodes:
 *   Result symbols : [success] [failure] [advantage] [threat] [triumph] [despair]
 *   Force pips     : [light] [dark]
 *   Dice faces     : [boost] [ability] [proficiency] [setback] [difficulty] [challenge] [force]
 *   Formatting     : [B]…[b]  [I]…[i]  [H3]…[h3]  [H4]…[h4]  [P]  [BR]
 *
 * Repeat count is optional: [difficulty:2] renders the symbol twice.
 * Matching is case-insensitive for symbol/dice tags.
 * Formatting tags are case-sensitive (uppercase = open, lowercase = close).
 * Unknown shortcodes (e.g. [banana]) are emitted as literal text, not dropped.
 *
 * This is a pure data utility — no React dependency.
 */ __turbopack_context__.s([
    "parseSymbols",
    ()=>parseSymbols
]);
const KNOWN_KEYS = new Set([
    // Result symbols (rendered via ffi-swrpg-* CSS classes)
    'success',
    'failure',
    'advantage',
    'threat',
    'triumph',
    'despair',
    // Force pips (rendered via ffi-swrpg-force with colour override)
    'light',
    'dark',
    // Dice faces (rendered via DiceFace SVG component)
    'boost',
    'ability',
    'proficiency',
    'setback',
    'difficulty',
    'challenge',
    'force'
]);
// OggDude XML export shorthand → canonical key (case-insensitive lookup)
const OGGDUDE_ALIASES = {
    // Dice
    'bo': 'boost',
    'bst': 'boost',
    'se': 'setback',
    'set': 'setback',
    'bl': 'setback',
    'di': 'difficulty',
    'dif': 'difficulty',
    'ch': 'challenge',
    'chl': 'challenge',
    'fo': 'force',
    'pr': 'proficiency',
    'pro': 'proficiency',
    'ab': 'ability',
    'abl': 'ability',
    // Result symbols
    'su': 'success',
    'fa': 'failure',
    'ad': 'advantage',
    'th': 'threat',
    'tr': 'triumph',
    'de': 'despair',
    // Force pips
    'fp': 'light',
    'li': 'light',
    'da': 'dark',
    'dp': 'dark'
};
// OggDude formatting tags — exact-case match (uppercase = open, lowercase = close)
const FORMAT_TAG_MAP = {
    'H4': 'h4-open',
    'h4': 'h4-close',
    'H3': 'h3-open',
    'h3': 'h3-close',
    'B': 'bold-open',
    'b': 'bold-close',
    'I': 'italic-open',
    'i': 'italic-close',
    'P': 'paragraph',
    'BR': 'linebreak'
};
// Colon-style codes (:success:, :average:, etc.) used in adversaries.json
const COLON_ALIASES = {
    'lightside': 'light',
    'darkside': 'dark',
    'forcepip': 'light',
    'simple': '(-)',
    'easy': 'difficulty',
    'average': 'difficulty:2',
    'hard': 'difficulty:3',
    'daunting': 'difficulty:4',
    'formidable': 'difficulty:5'
};
function expandColonCodes(text) {
    return text.replace(/:([a-z_]+):/g, (match, key)=>{
        const lower = key.toLowerCase();
        if (lower in COLON_ALIASES) {
            const mapped = COLON_ALIASES[lower];
            return /^[a-z]/.test(mapped) ? `[${mapped}]` : mapped;
        }
        if (KNOWN_KEYS.has(lower)) return `[${lower}]`;
        return match;
    });
}
// Matches [word], [word:digits], [H4], [h4], [BR], etc.
// Leading letter required; subsequent chars may be letters or digits.
const SHORTCODE_RE = /\[([a-z][a-z0-9]*)(?::(\d+))?\]/gi;
function parseSymbols(text) {
    const segments = [];
    let lastIndex = 0;
    let match;
    const normalised = expandColonCodes(text);
    SHORTCODE_RE.lastIndex = 0;
    while((match = SHORTCODE_RE.exec(normalised)) !== null){
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                value: normalised.slice(lastIndex, match.index)
            });
        }
        const original = match[1] // preserve case for format-tag detection
        ;
        // Formatting tags are case-sensitive (B ≠ b)
        const formatTag = FORMAT_TAG_MAP[original];
        if (formatTag !== undefined) {
            segments.push({
                type: 'format',
                tag: formatTag
            });
        } else {
            const raw = original.toLowerCase();
            const key = OGGDUDE_ALIASES[raw] ?? raw;
            const count = match[2] ? Math.max(1, parseInt(match[2], 10)) : 1;
            if (KNOWN_KEYS.has(key)) {
                segments.push({
                    type: 'symbol',
                    key,
                    count
                });
            } else {
                segments.push({
                    type: 'text',
                    value: match[0]
                });
            }
        }
        lastIndex = SHORTCODE_RE.lastIndex;
    }
    if (lastIndex < normalised.length) {
        segments.push({
            type: 'text',
            value: normalised.slice(lastIndex)
        });
    }
    return segments;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/buildTalentTree.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildTalentTree",
    ()=>buildTalentTree
]);
// ─────────────────────────────────────────────────────────────────────────────
// buildTalentTree — shared talent-tree data builder
//
// Converts a RefSpecialization + a set of purchased (row-col) keys into the
// TalentTreeNode[] + TalentTreeConnection[] arrays that <TalentTree> consumes.
//
// Used by:
//   • PlayerHUDDesktop  (in-play spec tree display & purchase)
//   • XpInvestmentStep  (character creator talent selection)
// ─────────────────────────────────────────────────────────────────────────────
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/types.ts [app-client] (ecmascript)");
;
function buildTalentTree(spec, refTalentMap, /** Set of "<row>-<col>" strings for already-purchased nodes in this spec */ purchasedSet) {
    if (!spec?.talent_tree?.rows) return null;
    const nodes = [];
    const connections = [];
    for (const row of spec.talent_tree.rows){
        for(let col = 0; col < (row.talents || []).length; col++){
            const tKey = row.talents[col];
            const ref = refTalentMap[tKey];
            const isPurchased = purchasedSet.has(`${row.index}-${col}`);
            const dir = (row.directions || [])[col] || {};
            let canPurchase = false;
            if (!isPurchased) {
                if (row.index === 0) {
                    canPurchase = true;
                } else {
                    if (dir.up) canPurchase = canPurchase || purchasedSet.has(`${row.index - 1}-${col}`);
                    if (dir.left && col > 0) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col - 1}`);
                    if (dir.right && col < 3) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col + 1}`);
                    if (dir.down) canPurchase = canPurchase || purchasedSet.has(`${row.index + 1}-${col}`);
                }
            }
            nodes.push({
                talentKey: tKey,
                name: ref?.name || tKey,
                description: ref?.description,
                row: row.index,
                col,
                purchased: isPurchased,
                activation: ref ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACTIVATION_LABELS"][ref.activation] || ref.activation : 'Passive',
                isRanked: ref?.is_ranked || false,
                canPurchase
            });
            // Horizontal connection (right)
            if (dir.right && col < 3) connections.push({
                fromRow: row.index,
                fromCol: col,
                toRow: row.index,
                toCol: col + 1
            });
            // Vertical connection (down)
            if (dir.down) connections.push({
                fromRow: row.index,
                fromCol: col,
                toRow: row.index + 1,
                toCol: col
            });
        }
    }
    return {
        specName: spec.name,
        nodes,
        connections
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript) <export HUD as C>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "C",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
}),
"[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript) <export FONT as FONT_CINZEL>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FONT_CINZEL",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
}),
"[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript) <export FONT as FONT_RAJDHANI>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FONT_RAJDHANI",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
}),
"[project]/star-wars-rpg/src/lib/mapWipe.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * mapWipe.ts
 * Pixi.js map wipe transition system.
 * Three wipe types randomly selected per transition:
 *   - diagonal: angled band sweeps left-to-right
 *   - horizontal: full-width bar pushes right
 *   - iris: circular aperture contracts to cover, then expands to reveal
 *
 * Usage:
 *   const wipe = await runMapWipe(app, px)
 *   // add new map sprite here
 *   wipe.reveal()
 *   await wipe.done
 */ __turbopack_context__.s([
    "runMapWipe",
    ()=>runMapWipe
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
const WIPE_COLOR = 0x060D09;
const WIPE_DURATION = 400 // ms per half (in or out)
;
function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
// ── Draw functions ────────────────────────────────────────────
// progress 0→1 = wipe IN (increasingly covered)
// progress 1→0 (via 1-p passed from reveal) = wipe OUT (decreasingly covered)
function drawHorizontal(g, w, h, progress) {
    g.clear();
    if (progress <= 0) return;
    g.beginFill(WIPE_COLOR);
    g.drawRect(0, 0, progress * w, h);
    g.endFill();
}
function drawDiagonal(g, w, h, progress) {
    g.clear();
    if (progress <= 0) return;
    const angle = h * 0.3 // skew amount
    ;
    // Leading edge x-position at the top of the canvas
    const leadX = progress * (w + angle) - angle;
    // Filled polygon from left edge to the diagonal leading edge
    g.beginFill(WIPE_COLOR);
    g.drawPolygon([
        0,
        0,
        0,
        h,
        Math.max(0, leadX + angle),
        h,
        Math.max(0, leadX),
        0
    ]);
    g.endFill();
}
function drawIris(g, w, h, progress) {
    g.clear();
    const maxRadius = Math.sqrt(w * w + h * h) / 2 * 1.1;
    // progress=0 → radius=max (big hole, mostly open)
    // progress=1 → radius=0  (no hole, fully covered)
    const radius = (1 - progress) * maxRadius;
    if (radius <= 0) {
        // Fully covered — just fill rect
        g.beginFill(WIPE_COLOR);
        g.drawRect(0, 0, w, h);
        g.endFill();
        return;
    }
    // Fill canvas then cut out circular hole
    g.beginFill(WIPE_COLOR);
    g.drawRect(0, 0, w, h);
    g.beginHole();
    g.drawCircle(w / 2, h / 2, radius);
    g.endHole();
    g.endFill();
}
function drawWipe(g, type, w, h, progress) {
    if (type === 'horizontal') drawHorizontal(g, w, h, progress);
    else if (type === 'diagonal') drawDiagonal(g, w, h, progress);
    else drawIris(g, w, h, progress);
}
async function runMapWipe(app, px) {
    const types = [
        'diagonal',
        'horizontal',
        'iris'
    ];
    const type = types[Math.floor(Math.random() * 3)];
    const graphics = new px.Graphics();
    graphics['name'] = 'mapWipe';
    graphics.zIndex = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].tooltip;
    app.stage.addChild(graphics);
    app.stage.sortChildren();
    const w = app.screen.width;
    const h = app.screen.height;
    // ── Wipe IN ────────────────────────────────────────────────
    return new Promise((resolveHandle)=>{
        let elapsed = 0;
        let appDestroyed = false;
        const onTick = ()=>{
            if (appDestroyed || !app.ticker) return;
            elapsed += app.ticker.deltaMS;
            const raw = Math.min(elapsed / WIPE_DURATION, 1);
            const eased = easeInOut(raw);
            drawWipe(graphics, type, w, h, eased);
            if (raw >= 1) {
                app.ticker.remove(onTick);
                // ── Wipe OUT setup ──────────────────────────────────
                let revealCalled = false;
                let resolveDone;
                const done = new Promise((r)=>{
                    resolveDone = r;
                });
                const reveal = ()=>{
                    if (revealCalled) return;
                    revealCalled = true;
                    let revealElapsed = 0;
                    const onRevealTick = ()=>{
                        if (appDestroyed || !app.ticker) {
                            resolveDone();
                            return;
                        }
                        revealElapsed += app.ticker.deltaMS;
                        const rRaw = Math.min(revealElapsed / WIPE_DURATION, 1);
                        const rEased = easeInOut(rRaw);
                        // Reverse: 1-rEased goes 1→0 (full coverage → no coverage)
                        drawWipe(graphics, type, w, h, 1 - rEased);
                        if (rRaw >= 1) {
                            app.ticker.remove(onRevealTick);
                            try {
                                app.stage.removeChild(graphics);
                            } catch  {}
                            graphics.destroy();
                            resolveDone();
                        }
                    };
                    app.ticker.add(onRevealTick);
                };
                graphics['_setDestroyed'] = ()=>{
                    appDestroyed = true;
                };
                resolveHandle({
                    reveal,
                    done
                });
            }
        };
        app.ticker.add(onTick);
        graphics['_setDestroyed'] = ()=>{
            appDestroyed = true;
        };
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/tokenHover.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * tokenHover.ts
 * Pixi.js token hover glow and scale animation.
 * Called from MapCanvas.tsx on pointerover/pointerout.
 *
 * Each token gets a glowRing Graphics child added on first hover setup.
 * The ring persists and is shown/hidden via alpha — no repeated construction.
 * Scale lift animates 1.0 → 1.08 on enter, 1.08 → 1.0 on exit.
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
__turbopack_context__.s([
    "attachTokenHover",
    ()=>attachTokenHover,
    "destroyTokenHover",
    ()=>destroyTokenHover,
    "onTokenPointerOut",
    ()=>onTokenPointerOut,
    "onTokenPointerOver",
    ()=>onTokenPointerOver
]);
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function attachTokenHover(container, px, colour, ticker, size, isRect) {
    const radius = size / 2;
    const glowRadius = radius + 4;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const glowRing = new px.Graphics();
    glowRing.name = 'glowRing';
    glowRing.alpha = 0;
    glowRing.zIndex = 1;
    // Inner ring — brighter, thinner
    glowRing.lineStyle(3, colour, 0.7);
    if (isRect) {
        glowRing.drawRoundedRect(-radius - 4, -radius - 4, size + 8, size + 8, 4);
    } else {
        glowRing.drawCircle(0, 0, glowRadius);
    }
    // Outer halo — dimmer, thicker
    glowRing.lineStyle(6, colour, 0.15);
    if (isRect) {
        glowRing.drawRoundedRect(-radius - 7, -radius - 7, size + 14, size + 14, 6);
    } else {
        glowRing.drawCircle(0, 0, glowRadius + 3);
    }
    container.sortableChildren = true;
    container.addChild(glowRing);
    // Hover state
    container._hoverActive = false;
    container._hoverScale = 1.0;
    container._glowAlpha = 0;
    container._baseAlpha = container.alpha ?? 1;
    container._baseScale = container.scale.x;
    container._hoverTickerFn = null;
}
// ── Remove any active ticker listener ─────────────────────────
function removeHoverTicker(container, ticker) {
    if (container._hoverTickerFn) {
        ticker.remove(container._hoverTickerFn);
        container._hoverTickerFn = null;
    }
}
function onTokenPointerOver(container, ticker) {
    // Capture current (tokenScale) as the rest-after-hover target
    container._restScale = container.scale?.x ?? 1.0;
    container._hoverActive = true;
    removeHoverTicker(container, ticker);
    const glowRing = container.getChildByName('glowRing');
    const fn = ()=>{
        if (!container._hoverActive) return;
        // Lerp scale toward baseScale * 1.08
        const baseScale = container._baseScale ?? 1.0;
        const currentScale = container.scale?.x ?? baseScale;
        const targetScale = baseScale * 1.08;
        const nextScale = lerp(currentScale, targetScale, 0.18);
        container.scale?.set(nextScale);
        // Lerp glow alpha toward 0.9
        if (glowRing) {
            const nextAlpha = lerp(glowRing.alpha, 0.9, 0.18);
            glowRing.alpha = nextAlpha;
        }
        // Settle check
        const scaleDone = Math.abs((container.scale?.x ?? baseScale) - targetScale) < 0.01;
        const alphaDone = !glowRing || Math.abs(glowRing.alpha - 0.9) < 0.01;
        if (scaleDone && alphaDone) {
            container.scale?.set(targetScale);
            if (glowRing) glowRing.alpha = 0.9;
            removeHoverTicker(container, ticker);
        }
    };
    container._hoverTickerFn = fn;
    ticker.add(fn);
}
function onTokenPointerOut(container, ticker) {
    container._hoverActive = false;
    removeHoverTicker(container, ticker);
    const glowRing = container.getChildByName('glowRing');
    // Lerp back toward the token's base scale (set at attachTokenHover time)
    const restScale = container._baseScale ?? 1.0;
    const fn = ()=>{
        // Lerp scale toward restScale
        const currentScale = container.scale?.x ?? restScale;
        const nextScale = lerp(currentScale, restScale, 0.14);
        container.scale?.set(nextScale);
        // Lerp glow alpha toward 0
        if (glowRing) {
            const nextAlpha = lerp(glowRing.alpha, 0, 0.14);
            glowRing.alpha = nextAlpha;
        }
        // Settle check
        const scaleDone = Math.abs((container.scale?.x ?? restScale) - restScale) < 0.005;
        const alphaDone = !glowRing || glowRing.alpha < 0.005;
        if (scaleDone && alphaDone) {
            container.scale?.set(restScale);
            if (glowRing) glowRing.alpha = 0;
            removeHoverTicker(container, ticker);
        }
    };
    container._hoverTickerFn = fn;
    ticker.add(fn);
}
function destroyTokenHover(container, ticker) {
    removeHoverTicker(container, ticker);
    const glowRing = container.getChildByName?.('glowRing');
    if (glowRing) {
        try {
            glowRing.destroy();
        } catch  {}
    }
    container._hoverActive = undefined;
    container._hoverScale = undefined;
    container._glowAlpha = undefined;
    container._baseAlpha = undefined;
    container._hoverTickerFn = undefined;
    container._restScale = undefined;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/resolve-weapon.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared weapon display resolver for both GM (CombatPanel) and player (CombatTracker).
 *
 * Problems it solves:
 *  1. Adversaries.json stores weapons as plain name strings — `parseWeaponString` always
 *     produces `damage: 0` for name-only entries.
 *  2. ref_weapons.range_value is stored with a "wr" prefix ("wrMedium", "wrShort", etc.).
 *  3. Some generic weapon names don't exist in ref_weapons at all.
 *  4. Brawn-based damage should resolve to an actual number.
 */ __turbopack_context__.s([
    "resolveWeapon",
    ()=>resolveWeapon
]);
// Static fallback for common generic names not in ref_weapons
// Format: { dmg: fixed damage } or { brawn: bonus added to brawn stat }, optional crit
const FALLBACK = {
    'brawl': {
        brawn: 0,
        range: 'Engaged',
        crit: 5
    },
    'fists': {
        brawn: 0,
        range: 'Engaged',
        crit: 5
    },
    'enhanced fists': {
        brawn: 1,
        range: 'Engaged',
        crit: 5
    },
    'iron-hard fists': {
        brawn: 1,
        range: 'Engaged',
        crit: 5
    },
    'meaty fists': {
        brawn: 1,
        range: 'Engaged',
        crit: 5
    },
    'mechanical fists': {
        brawn: 1,
        range: 'Engaged',
        crit: 5
    },
    'metal fists': {
        brawn: 1,
        range: 'Engaged',
        crit: 5
    },
    'stone fists': {
        brawn: 1,
        range: 'Engaged',
        crit: 5
    },
    'pummeling fists': {
        brawn: 1,
        range: 'Engaged',
        crit: 5
    },
    'unarmed combat': {
        brawn: 0,
        range: 'Engaged',
        crit: 5
    },
    'unarmed martial attack': {
        brawn: 0,
        range: 'Engaged',
        crit: 5
    },
    'claws': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'claws and teeth': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'claws and fangs': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'teeth and claws': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'teeth': {
        brawn: 0,
        range: 'Engaged',
        crit: 4
    },
    'bite': {
        brawn: 0,
        range: 'Engaged',
        crit: 4
    },
    'vicious bite': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'massive bite': {
        brawn: 2,
        range: 'Engaged',
        crit: 3
    },
    'fangs': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'knife': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'combat knife': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'hunting knife': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'makeshift knife': {
        brawn: 1,
        range: 'Engaged',
        crit: 4
    },
    'vibroblade': {
        brawn: 1,
        range: 'Engaged',
        crit: 2
    },
    'combat vibroblade': {
        brawn: 1,
        range: 'Engaged',
        crit: 2
    },
    'two vibroblades': {
        brawn: 1,
        range: 'Engaged',
        crit: 2
    },
    'vibrorapier': {
        brawn: 1,
        range: 'Engaged',
        crit: 2
    },
    'vibrosaw': {
        brawn: 2,
        range: 'Engaged',
        crit: 2
    },
    'vibroknucklers': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'vibroknuckles': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'gaffi stick': {
        brawn: 2,
        range: 'Engaged',
        crit: 4
    },
    'staff': {
        brawn: 1,
        range: 'Engaged',
        crit: 4
    },
    'security staff': {
        brawn: 1,
        range: 'Engaged',
        crit: 4
    },
    'truncheon': {
        brawn: 1,
        range: 'Engaged',
        crit: 4
    },
    'shock truncheon': {
        brawn: 1,
        range: 'Engaged',
        crit: 4
    },
    'electrostaff': {
        brawn: 2,
        range: 'Engaged',
        crit: 2
    },
    'force pike': {
        brawn: 2,
        range: 'Engaged',
        crit: 3
    },
    'spear': {
        brawn: 1,
        range: 'Engaged',
        crit: 3
    },
    'lightsaber': {
        dmg: 10,
        range: 'Engaged',
        crit: 1
    },
    'double-bladed lightsaber': {
        dmg: 10,
        range: 'Engaged',
        crit: 1
    },
    'double bladed lightsaber': {
        dmg: 10,
        range: 'Engaged',
        crit: 1
    },
    'training lightsaber': {
        dmg: 7,
        range: 'Engaged',
        crit: 2
    },
    'frag grenade': {
        dmg: 8,
        range: 'Short',
        crit: 4
    },
    'stun grenade': {
        dmg: 8,
        range: 'Short'
    },
    'ion grenade': {
        dmg: 7,
        range: 'Short'
    },
    'thermal detonator': {
        dmg: 20,
        range: 'Short',
        crit: 2
    },
    'smoke grenade': {
        dmg: 0,
        range: 'Short'
    },
    'bowcaster': {
        dmg: 10,
        range: 'Medium',
        crit: 3
    },
    'blaster pistol': {
        dmg: 6,
        range: 'Medium',
        crit: 3
    },
    'heavy blaster pistol': {
        dmg: 7,
        range: 'Medium',
        crit: 3
    },
    'light blaster pistol': {
        dmg: 5,
        range: 'Medium',
        crit: 4
    },
    'holdout blaster': {
        dmg: 5,
        range: 'Short',
        crit: 4
    },
    'blaster carbine': {
        dmg: 9,
        range: 'Medium',
        crit: 3
    },
    'blaster rifle': {
        dmg: 9,
        range: 'Long',
        crit: 3
    },
    'heavy blaster rifle': {
        dmg: 10,
        range: 'Long',
        crit: 3
    },
    'repeating blaster': {
        dmg: 11,
        range: 'Long',
        crit: 2
    },
    'light repeating blaster': {
        dmg: 9,
        range: 'Medium',
        crit: 3
    },
    'slugthrower pistol': {
        dmg: 4,
        range: 'Short',
        crit: 5
    },
    'slugthrower rifle': {
        dmg: 7,
        range: 'Medium',
        crit: 5
    },
    'sniper rifle': {
        dmg: 10,
        range: 'Extreme',
        crit: 1
    },
    'disruptor pistol': {
        dmg: 10,
        range: 'Short',
        crit: 2
    },
    'disruptor rifle': {
        dmg: 10,
        range: 'Long',
        crit: 2
    },
    'arc welder': {
        dmg: 3,
        range: 'Engaged'
    },
    'stun blaster': {
        dmg: 8,
        range: 'Short'
    },
    'stun pistol': {
        dmg: 6,
        range: 'Short'
    },
    'ion blaster': {
        dmg: 10,
        range: 'Short',
        crit: 5
    },
    'flamethrower': {
        dmg: 8,
        range: 'Short'
    },
    'flame projector': {
        dmg: 7,
        range: 'Short'
    },
    'missile launcher': {
        dmg: 20,
        range: 'Long',
        crit: 2
    },
    'rocket launcher': {
        dmg: 20,
        range: 'Long',
        crit: 2
    },
    'throw': {
        brawn: 0,
        range: 'Short'
    },
    'tail': {
        brawn: 0,
        range: 'Engaged',
        crit: 5
    },
    'tail whip': {
        brawn: 1,
        range: 'Engaged',
        crit: 4
    },
    'stomp': {
        brawn: 2,
        range: 'Engaged',
        crit: 4
    },
    'trample': {
        brawn: 2,
        range: 'Engaged',
        crit: 4
    },
    'headbutt': {
        brawn: 0,
        range: 'Engaged',
        crit: 5
    },
    'horns': {
        brawn: 1,
        range: 'Engaged',
        crit: 4
    },
    'tusks': {
        brawn: 2,
        range: 'Engaged',
        crit: 3
    },
    'stinger': {
        brawn: 0,
        range: 'Engaged',
        crit: 4
    },
    'spine': {
        brawn: 0,
        range: 'Engaged',
        crit: 4
    },
    // Adversary utility / exotic weapons
    'grs-1 snare rifle': {
        dmg: 4,
        range: 'Long'
    },
    'snare launcher': {
        dmg: 0,
        range: 'Short'
    },
    'built-in cleaning spray hose': {
        dmg: 0,
        range: 'Short'
    },
    'net gun': {
        dmg: 0,
        range: 'Short'
    },
    'optical flare': {
        dmg: 0,
        range: 'Engaged'
    },
    'bag of sleeping powder': {
        dmg: 0,
        range: 'Short'
    },
    // Vehicle utility weapons (0 damage — tractor beams, tracers)
    // Keyed as lowercase OggDude weaponKey, matched after turret-suffix stripping below
    'tractlt': {
        dmg: 0,
        range: 'Close'
    },
    'tractmed': {
        dmg: 0,
        range: 'Short'
    },
    'tracthvy': {
        dmg: 0,
        range: 'Medium'
    },
    'lttractcouple': {
        dmg: 0,
        range: 'Close'
    },
    'xx23tracer': {
        dmg: 0,
        range: 'Medium'
    }
};
// Strip OggDude "wr" prefix from range_value (e.g. "wrMedium" → "Medium")
function cleanRange(raw) {
    if (!raw) return 'Engaged';
    return raw.replace(/^wr/i, '');
}
function resolveWeapon(w, brawn, weaponRef) {
    // Normalise lookup key:
    //  • lowercase
    //  • strip vehicle count prefix   e.g. "2× LASERMED"  → "lasermed"
    //  • strip turret suffix           e.g. "TRACTLT (Turret)" → "tractlt"
    const key = w.name.toLowerCase().replace(/^\d+×\s*/i, '').replace(/\s*\(turret\)$/i, '');
    // Crit resolution: parsed value > ref_weapons > FALLBACK > undefined
    const resolvedCrit = w.crit !== undefined ? w.crit : weaponRef[key]?.crit != null ? weaponRef[key].crit : FALLBACK[key]?.crit;
    // 1. If weapon already has explicit non-zero numeric damage, use it
    if (typeof w.damage === 'number' && w.damage !== 0) {
        const range = w.range && w.range !== 'Engaged' ? w.range : cleanRange((weaponRef[key] ?? FALLBACK[key])?.range_value ?? FALLBACK[key]?.range ?? w.range);
        return {
            dmg: String(w.damage),
            range,
            ...resolvedCrit !== undefined ? {
                crit: resolvedCrit
            } : {}
        };
    }
    // 2. If weapon has a Brawn-based string (e.g. "Brawn+2"), resolve to number
    if (typeof w.damage === 'string') {
        const m = w.damage.match(/^Brawn([+-]\d+)$/i);
        if (m) {
            const range = w.range && w.range !== 'Engaged' ? w.range : cleanRange(weaponRef[key]?.range_value ?? FALLBACK[key]?.range ?? w.range);
            return {
                dmg: String(brawn + parseInt(m[1])),
                range,
                ...resolvedCrit !== undefined ? {
                    crit: resolvedCrit
                } : {}
            };
        }
    }
    // 3. Try ref_weapons lookup (damage = 0 — plain name string from adversaries.json)
    const ref = weaponRef[key];
    if (ref) {
        const dmg = ref.damage_add != null && ref.damage_add !== 0 ? String(brawn + ref.damage_add) : String(ref.damage);
        const range = cleanRange(ref.range_value) || (w.range !== 'Engaged' ? w.range : 'Engaged');
        return {
            dmg,
            range,
            ...resolvedCrit !== undefined ? {
                crit: resolvedCrit
            } : {}
        };
    }
    // 4. Static fallback for common generic names
    const fb = FALLBACK[key];
    if (fb) {
        const dmg = fb.dmg !== undefined ? String(fb.dmg) : String(brawn + (fb.brawn ?? 0));
        const range = fb.range ?? w.range ?? 'Engaged';
        return {
            dmg,
            range,
            ...resolvedCrit !== undefined ? {
                crit: resolvedCrit
            } : {}
        };
    }
    // 5. Truly unknown — null/undefined damage means a utility weapon with no hull damage
    if (w.damage == null) {
        return {
            dmg: '—',
            range: w.range ?? 'Engaged'
        };
    }
    return {
        dmg: '?',
        range: w.range ?? 'Engaged'
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/vehicles.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_VEHICLE_WEAPONS",
    ()=>ALL_VEHICLE_WEAPONS,
    "dbRowToVehicle",
    ()=>dbRowToVehicle,
    "fetchVehicles",
    ()=>fetchVehicles,
    "vehicleToInstance",
    ()=>vehicleToInstance,
    "vehicleToVehicleInstance",
    ()=>vehicleToVehicleInstance,
    "vehicleWeaponDisplayName",
    ()=>vehicleWeaponDisplayName,
    "vehicleWeaponStats",
    ()=>vehicleWeaponStats
]);
const VEHICLE_WEAPON_STATS = {
    // Laser cannons
    LASERLT: {
        name: 'Light Laser Cannon',
        damage: 5,
        range: 'Close',
        crit: 3
    },
    LASERMED: {
        name: 'Medium Laser Cannon',
        damage: 6,
        range: 'Close',
        crit: 3
    },
    LASERHVY: {
        name: 'Heavy Laser Cannon',
        damage: 6,
        range: 'Short',
        crit: 3
    },
    LASERLONG: {
        name: 'Long-Range Laser Cannon',
        damage: 5,
        range: 'Long',
        crit: 3
    },
    LASERQUAD: {
        name: 'Quad Laser Cannon',
        damage: 5,
        range: 'Close',
        crit: 3
    },
    LASERPTDEF: {
        name: 'Point-Defence Laser Cannon',
        damage: 4,
        range: 'Close',
        crit: 4
    },
    LASCAN: {
        name: 'Laser Cannon',
        damage: 6,
        range: 'Medium',
        crit: 3
    },
    CLW: {
        name: 'Close-Range Laser Weapon',
        damage: 5,
        range: 'Close',
        crit: 3
    },
    VL6: {
        name: 'VL6 Laser Cannon',
        damage: 4,
        range: 'Close',
        crit: 3
    },
    // Blaster cannons
    BLASTCANLT: {
        name: 'Light Blaster Cannon',
        damage: 4,
        range: 'Close',
        crit: 4
    },
    BLASTCANHVY: {
        name: 'Heavy Blaster Cannon',
        damage: 5,
        range: 'Close',
        crit: 4
    },
    BLASTLTREP: {
        name: 'Light Repeating Blaster',
        damage: 4,
        range: 'Short',
        crit: 4
    },
    BLASTHVYREP: {
        name: 'Heavy Repeating Blaster',
        damage: 5,
        range: 'Short',
        crit: 4
    },
    LIGHTREPBLASVEH20: {
        name: 'Light Repeating Blaster',
        damage: 3,
        range: 'Close',
        crit: 4
    },
    LIGHTREPVEHICLE: {
        name: 'Light Repeating Blaster',
        damage: 3,
        range: 'Close',
        crit: 4
    },
    AUTOBLAST: {
        name: 'Auto-Blaster',
        damage: 3,
        range: 'Close',
        crit: 5
    },
    ROTREPBLASTCAN: {
        name: 'Rotating Repeating Blaster',
        damage: 4,
        range: 'Short',
        crit: 4
    },
    ANTIPERSLASER: {
        name: 'Anti-Personnel Laser',
        damage: 3,
        range: 'Short',
        crit: 4
    },
    SUPPRESSCANNON: {
        name: 'Suppression Cannon',
        damage: 3,
        range: 'Short',
        crit: 5
    },
    // Ion weapons
    IONLT: {
        name: 'Light Ion Cannon',
        damage: 5,
        range: 'Close',
        crit: 4
    },
    IONMED: {
        name: 'Medium Ion Cannon',
        damage: 6,
        range: 'Medium',
        crit: 4
    },
    IONHVY: {
        name: 'Heavy Ion Cannon',
        damage: 7,
        range: 'Long',
        crit: 4
    },
    IONBATT: {
        name: 'Ion Battery',
        damage: 7,
        range: 'Medium',
        crit: 4
    },
    IONLONG: {
        name: 'Long-Range Ion Cannon',
        damage: 7,
        range: 'Extreme',
        crit: 4
    },
    HEAVYIONBLAS: {
        name: 'Heavy Ion Blaster',
        damage: 5,
        range: 'Short',
        crit: 4
    },
    // Missiles & torpedoes
    PTL: {
        name: 'Proton Torpedo Launcher',
        damage: 8,
        range: 'Short',
        crit: 2
    },
    CML: {
        name: 'Concussion Missile Launcher',
        damage: 6,
        range: 'Short',
        crit: 3
    },
    CMLHK: {
        name: 'Homing Missile Launcher',
        damage: 6,
        range: 'Medium',
        crit: 3
    },
    ACML: {
        name: 'Advanced Missile Launcher',
        damage: 6,
        range: 'Medium',
        crit: 3
    },
    AFCML: {
        name: 'Auto-Fire Missile Launcher',
        damage: 6,
        range: 'Short',
        crit: 3
    },
    PROTTORPHVY: {
        name: 'Heavy Proton Torpedo',
        damage: 10,
        range: 'Short',
        crit: 2
    },
    PROTONBAY: {
        name: 'Proton Bomb Bay',
        damage: 8,
        range: 'Close',
        crit: 2
    },
    PROTONBOMB: {
        name: 'Proton Bomb',
        damage: 8,
        range: 'Close',
        crit: 2
    },
    TORPLAUNCH: {
        name: 'Torpedo Launcher',
        damage: 8,
        range: 'Short',
        crit: 2
    },
    MINCONCLNCH: {
        name: 'Mini Concussion Launcher',
        damage: 4,
        range: 'Short',
        crit: 3
    },
    MINIROCKET: {
        name: 'Mini Rocket Pod',
        damage: 4,
        range: 'Short',
        crit: 3
    },
    CLUSTERBOMB: {
        name: 'Cluster Bomb',
        damage: 5,
        range: 'Close',
        crit: 3
    },
    MASSDRIVERCANNON: {
        name: 'Mass Driver Cannon',
        damage: 7,
        range: 'Long',
        crit: 3
    },
    MASSDRIVMSL: {
        name: 'Mass Driver Missile',
        damage: 7,
        range: 'Long',
        crit: 3
    },
    CONGRENLAUNCH: {
        name: 'Concussion Grenade Launcher',
        damage: 4,
        range: 'Short',
        crit: 4
    },
    // Flak / anti-air
    FLAKLT: {
        name: 'Light Flak Cannon',
        damage: 4,
        range: 'Short',
        crit: 4
    },
    FLAKMED: {
        name: 'Medium Flak Cannon',
        damage: 5,
        range: 'Short',
        crit: 4
    },
    ANTIAIR: {
        name: 'Anti-Air Cannon',
        damage: 4,
        range: 'Short',
        crit: 4
    },
    // Turbolasers (capital ship scale)
    TURBOLT: {
        name: 'Light Turbolaser',
        damage: 9,
        range: 'Medium',
        crit: 3
    },
    TURBOMED: {
        name: 'Medium Turbolaser',
        damage: 10,
        range: 'Long',
        crit: 3
    },
    TURBOHVY: {
        name: 'Heavy Turbolaser',
        damage: 11,
        range: 'Long',
        crit: 3
    },
    SUPERLASER: {
        name: 'Superlaser',
        damage: 60,
        range: 'Extreme',
        crit: 1
    },
    // Specialty / utility
    ELECHARPOON: {
        name: 'Electro-Harpoon',
        damage: 6,
        range: 'Short',
        crit: 5
    },
    TRACTLT: {
        name: 'Light Tractor Beam',
        damage: 0,
        range: 'Close'
    },
    TRACTMED: {
        name: 'Medium Tractor Beam',
        damage: 0,
        range: 'Short'
    },
    TRACTHVY: {
        name: 'Heavy Tractor Beam',
        damage: 0,
        range: 'Medium'
    },
    LTTRACTCOUPLE: {
        name: 'Light Tractor Coupling',
        damage: 0,
        range: 'Close'
    },
    XX23TRACER: {
        name: 'XX-23 S-Thread Tracer',
        damage: 0,
        range: 'Medium'
    }
};
function vehicleWeaponDisplayName(key) {
    return VEHICLE_WEAPON_STATS[key]?.name ?? key;
}
function vehicleWeaponStats(key) {
    return VEHICLE_WEAPON_STATS[key];
}
const ALL_VEHICLE_WEAPONS = Object.entries(VEHICLE_WEAPON_STATS).map(([key, v])=>({
        key,
        ...v
    })).sort(_c = (a, b)=>a.name.localeCompare(b.name));
_c1 = ALL_VEHICLE_WEAPONS;
const VEHICLE_URL = '/vehicles.json';
let _cache = null;
async function fetchVehicles() {
    if (_cache) return _cache;
    const res = await fetch(VEHICLE_URL);
    if (!res.ok) throw new Error(`Failed to fetch vehicles: ${res.status}`);
    _cache = await res.json();
    return _cache;
}
function dbRowToVehicle(row) {
    return {
        key: String(row.id),
        name: String(row.name),
        type: String(row.type ?? 'Speeder'),
        categories: row.categories ?? [],
        isStarship: Boolean(row.is_starship),
        silhouette: Number(row.silhouette ?? 3),
        speed: Number(row.speed ?? 2),
        handling: Number(row.handling ?? 0),
        defFore: Number(row.def_fore ?? 0),
        defAft: Number(row.def_aft ?? 0),
        defPort: Number(row.def_port ?? 0),
        defStarboard: Number(row.def_starboard ?? 0),
        armor: Number(row.armor ?? 2),
        hullTrauma: Number(row.hull_trauma ?? 10),
        systemStrain: Number(row.system_strain ?? 8),
        crew: row.crew ? String(row.crew) : undefined,
        passengers: row.passengers != null ? Number(row.passengers) : undefined,
        encumbranceCapacity: row.encumbrance_capacity != null ? Number(row.encumbrance_capacity) : undefined,
        consumables: row.consumables ? String(row.consumables) : undefined,
        hyperdrivePrimary: row.hyperdrive_primary != null ? Number(row.hyperdrive_primary) : undefined,
        hyperdriveBackup: row.hyperdrive_backup != null ? Number(row.hyperdrive_backup) : undefined,
        naviComputer: row.navi_computer != null ? Boolean(row.navi_computer) : undefined,
        sensorRange: row.sensor_range ? String(row.sensor_range) : undefined,
        maxAltitude: row.max_altitude ? String(row.max_altitude) : undefined,
        massiveValue: row.massive_value != null ? Number(row.massive_value) : undefined,
        hardPoints: row.hard_points != null ? Number(row.hard_points) : undefined,
        weapons: row.weapons ?? [],
        abilities: row.abilities ?? [],
        description: row.description ? String(row.description) : undefined,
        _isCustom: true,
        _dbId: String(row.id)
    };
}
function vehicleToInstance(v) {
    const arcs = `${v.defFore}/${v.defAft}/${v.defPort}/${v.defStarboard}`;
    return {
        instanceId: `${v.key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sourceId: v.key,
        name: v.name,
        type: 'nemesis',
        groupSize: 1,
        groupRemaining: 1,
        revealed: false,
        characteristics: {
            brawn: 2,
            agility: 2,
            intellect: 2,
            cunning: 2,
            willpower: 2,
            presence: 2
        },
        soak: v.armor,
        woundThreshold: v.hullTrauma,
        strainThreshold: v.systemStrain,
        defense: {
            melee: v.defFore,
            ranged: v.defFore
        },
        skills: [],
        skillRanks: {},
        talents: [],
        abilities: [
            {
                name: `Sil ${v.silhouette} · Spd ${v.speed} · Hdl ${v.handling >= 0 ? '+' : ''}${v.handling}`,
                description: `Defense (F/A/P/S): ${arcs}${v.isStarship ? ' · Starship' : ''}`
            },
            ...v.abilities ?? []
        ],
        weapons: v.weapons.map((w)=>{
            const stats = VEHICLE_WEAPON_STATS[w.weaponKey];
            const displayName = stats?.name ?? w.weaponKey;
            return {
                name: `${w.count > 1 ? `${w.count}× ` : ''}${displayName}${w.turret ? ' (Turret)' : ''}`,
                damage: stats?.damage ?? 0,
                range: stats?.range ?? 'Short',
                crit: stats?.crit,
                qualities: w.qualities.map((q)=>`${q.key}${q.count > 1 ? ` ${q.count}` : ''}`)
            };
        }),
        gear: [],
        _isVehicle: true
    };
}
function vehicleToVehicleInstance(v, alignment = 'enemy', tokenImageUrl) {
    return {
        instanceId: `veh-${v.key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sourceId: v.key,
        name: v.name,
        kind: 'vehicle',
        silhouette: v.silhouette,
        speed: v.speed,
        handling: v.handling,
        armor: v.armor,
        hullTraumaThreshold: v.hullTrauma,
        systemStrainThreshold: v.systemStrain,
        hullTraumaCurrent: 0,
        systemStrainCurrent: 0,
        defense: {
            fore: v.defFore,
            aft: v.defAft,
            port: v.defPort,
            starboard: v.defStarboard
        },
        weapons: v.weapons,
        revealed: false,
        alignment,
        token_image_url: tokenImageUrl ?? null
    };
}
var _c, _c1;
__turbopack_context__.k.register(_c, "ALL_VEHICLE_WEAPONS$Object.entries(VEHICLE_WEAPON_STATS)\n    .map(([key, v]) => ({ key, ...v }))\n    .sort");
__turbopack_context__.k.register(_c1, "ALL_VEHICLE_WEAPONS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/adversary-abilities.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Canonical descriptions for adversary abilities that appear as plain strings
 * in the source data (no description embedded). Sourced from FFG Star Wars RPG
 * core rulebooks and sourcebooks.
 *
 * Keys must match the exact string used in adversaries.json abilities arrays.
 */ __turbopack_context__.s([
    "ABILITY_DESCRIPTIONS",
    ()=>ABILITY_DESCRIPTIONS
]);
const ABILITY_DESCRIPTIONS = {
    // ── Size ─────────────────────────────────────────────────────────────────
    'Silhouette 0': 'Silhouette 0 — smaller than an adult human (e.g. a tooka cat or small droid). Attackers targeting this creature from medium range or beyond upgrade difficulty once.',
    'Silhouette 2': 'Silhouette 2 — larger than an adult human (e.g. a bantha or large beast). Affects cover, vehicle targeting, and range band calculations.',
    'Silhouette 3': 'Silhouette 3 — roughly the size of a large beast or light transport. Affects vehicle combat targeting and range calculations.',
    'Silhouette 4': 'Silhouette 4 — light freighter class or very large creature. Significantly affects vehicle combat targeting and defense zone rules.',
    'Silhouette 5': 'Silhouette 5 — frigate or capital ship class. Affects targeting, defense zones, and range band calculations at all distances.',
    // ── Adversary Tier ────────────────────────────────────────────────────────
    'Adversary 1': 'Upgrade the difficulty of any combat checks targeting this character once.',
    'Adversary 2': 'Upgrade the difficulty of any combat checks targeting this character twice.',
    'Adversary 3': 'Upgrade the difficulty of any combat checks targeting this character three times.',
    // ── Force ─────────────────────────────────────────────────────────────────
    'Force Rating 1': 'This character has a Force Rating of 1 and may spend Force points to activate Force powers.',
    'Force Rating 2': 'This character has a Force Rating of 2 and may spend Force points to activate Force powers.',
    'Force Rating 3': 'This character has a Force Rating of 3 and may spend Force points to activate Force powers.',
    'Darkside Force User': 'Draws on the dark side. Force dice generate dark side Force points by default. May spend Destiny Points from the dark side pool.',
    'Force Hunter': 'Automatically detects Force-sensitive characters within Medium range. May roll Force dice on Initiative; spend :forcepip: to gain :success: per point.',
    'Detect Force-Sensitivity': 'Automatically aware of Force-sensitive characters within Short range.',
    'Negate Force Powers': 'When a Force power is activated within Medium range, may spend a Destiny Point to cancel its effects entirely.',
    'Force Mimic': 'After witnessing a Force power used within Short range, may attempt to replicate it using own Force Rating.',
    'Drain Life': 'As an action, make a Force power check against one Engaged target. Spend :forcepip: to deal wounds equal to Force Rating.',
    'Creature of Illusion': 'As an action, make a Force power check (Average ◆◆ Discipline difficulty). On success, create a sustained visual illusion within Short range until this creature is damaged or moves.',
    'Blessing of the Ancients': 'Once per session, call upon ancient power: one ally may reroll all dice on a single check and keep the better result.',
    'Invoke Doellin': 'Once per encounter, invoke the spirit of Doellin, adding :advantage::advantage::advantage: to one ally\'s next check.',
    'force-power-enhance-rots': 'When making an Athletics, Resilience, or Brawl check, may roll an Enhance Force power check and spend :forcepip: to add :success:.',
    'force-power-sense-rots': 'Spend :forcepip: to sense the current thoughts of one living target within Short range, or perceive the environment beyond normal senses for one round.',
    // ── Force Powers ───────────────────────────────────────────────────────────
    'Force Power: Enhance': 'Channel the Force through the body to exceed normal physical limits. Spend :forcepip: when making an Athletics check to add :success:, or spend :forcepip: to perform a Force Leap — jump to any location within Short range as a maneuver. Upgrades may extend this to Coordination, Resilience, and Piloting checks.',
    'Force Power: Foresee': 'Peer into the currents of the Force to glimpse likely futures. Spend :forcepip: to have vague visions of the near future (GM describes broad events in the coming scene). Upgrades allow sensing threats, sharing visions with allies, or gaining :boost: dice on upcoming checks.',
    'Force Power: Heal': 'Channel the Force to mend wounds in living targets. Commit :forcepip: (light side) to remove 1 wound from one living target within Short range per round. Alternatively, make a Force power check — spend :forcepip: to heal wounds equal to Intellect. Dark side Harm upgrade deals wounds instead of healing.',
    'Force Power: Influence': 'Shape the thoughts and feelings of others through the Force. Spend :forcepip: to inflict or remove one emotion on a target within Short range (fear, calm, anger, despair). Upgrades allow implanting false memories, compelling actions (opposed by Discipline), or affecting multiple targets.',
    'Force Power: Move': 'Use telekinesis to lift and hurl objects or creatures through the Force. Spend :forcepip: to move one silhouette 0 object within Short range to another location within Short range. Additional :forcepip: increase the silhouette that can be moved or extend the range. May be used to disarm, push, or restrain targets.',
    'Force Power: Sense': 'Expand awareness through the Force to perceive the living world around you. Spend :forcepip: to sense the current thoughts and emotional state of all living beings within Short range, or perceive the environment clearly in all directions for one round. Upgrades allow detecting Force-sensitive characters, reading surface thoughts, or shrouding one\'s own presence.',
    'Force Power: Bind': 'Restrain a target with the Force, holding them in place or crushing their body. Make an opposed Force power vs. Resilience check. Spend :forcepip: to immobilize the target until the end of their next turn. Dark side upgrades allow dealing wounds or lifting multiple targets simultaneously.',
    'Force Power: Battle Meditation': 'Enter a deep concentration to guide allies in combat through the Force. Commit :forcepip: to increase the ability of all combat checks made by allies within Short range by one die per round. Upgrades allow affecting larger groups, adding Defense to allies, or penalizing enemy checks at the cost of Conflict.',
    'Force Power: Farsight': 'Use the Force to perceive events at remote locations. Spend :forcepip: to visualize a known location anywhere in the galaxy for one round (cannot interact — observation only). Upgrades allow sensing the emotions and intentions of individuals at the remote location, or obscuring the user\'s vision from other Farsight users.',
    'Force Power: Force Choke': 'Channel the dark side to crush a target\'s throat or body from a distance. Make an opposed Force power vs. Resilience check. On success, spend :forcepip: to deal wounds equal to Force Rating (ignore soak). Sustained — while active, the target cannot speak or use actions requiring movement. Generates Conflict when used.',
    'Force Power: Harm': 'Channel the dark side to drain life from a living target and restore the user\'s own. Make a Force power check vs. one living target within Short range. Spend :forcepip: to deal wounds equal to Force Rating and recover the same number of wounds. Generates Conflict. Upgrades allow targeting multiple or distant targets.',
    'Force Power: Misdirect': 'Weave illusions through the Force to confuse and mislead targets. Spend :forcepip: to make one target within Short range perceive the environment as slightly different (shadows, sounds, minor visual changes) until the end of the round. Upgrades allow creating full visual illusions, making the user appear as someone else, or affecting multiple targets.',
    'Force Power: Protect': 'Interpose the Force between allies and harm, deflecting attacks and hazards. Spend :forcepip: to reduce all damage suffered by one ally within Short range by 1 for one round. Upgrades allow deflecting ranged attacks, extending protection to all allies in range, or reflecting damage back at attackers (costs Conflict).',
    'Force Power: Seek': 'Use the Force to track and locate specific individuals or objects. Spend :forcepip: to sense the direction and general distance of a specific known target anywhere on the same planet. Upgrades allow pinpointing exact locations, tracking through hyperspace, or locating targets that are actively hiding from the Force.',
    'Force Power: Unleash': 'Release raw dark side energy at a target. Make a Force power check — spend :forcepip: :forcepip: to deal a ranged attack (Damage 6; Critical 3; Range [Short]; Blast 3; Burn 2). Generates Conflict. Upgrades may increase damage, range, or add additional qualities.',
    'Force Power: Wrack': 'Inflict intense pain through the dark side by attacking the target\'s connection to the Force. Make an opposed Force power vs. Discipline check. Spend :forcepip: to stagger the target until end of their next turn and deal strain equal to Force Rating. Generates Conflict. Upgrades extend duration or add wounds.',
    'Force Power: Phantasmagoria': 'Project terrifying illusions so vivid the mind accepts them as real, causing genuine psychic harm. Make an opposed Force power vs. Discipline check. Spend :forcepip: to deal strain equal to Force Rating. Dark side upgrades allow targets to suffer wounds equal to strain dealt. Generates Conflict.',
    'Force Power: Manifestations': 'Manifest a physical expression of the Force — ranging from spectral visions to tangible energy constructs. The exact effect varies by the Force-user\'s tradition and the GM\'s interpretation. Generally costs :forcepip: to activate and sustain, and may generate Conflict when used aggressively.',
    "Force Power: Jerserra\u2019s Influence": 'A variant of the Influence power unique to Jerserra. Spend :forcepip: to psychically dominate a weak-willed target within Short range, implanting a compulsion they act on immediately. Targets may resist with an opposed Discipline check. Generates Conflict.',
    "Force power Jerserra\u2019s Influence": 'A variant of the Influence power unique to Jerserra. Spend :forcepip: to psychically dominate a weak-willed target within Short range, implanting a compulsion they act on immediately. Targets may resist with an opposed Discipline check. Generates Conflict.',
    "Force Power: Warde\u2019s Foresight": 'A variant of the Foresee power unique to Jedi Knight Warde. Spend :forcepip: to gain a vision of immediate danger — the next attack targeting Warde or an ally within Short range must be rerolled by the attacker. May also be used to anticipate enemy actions, granting :boost: to Initiative.',
    // ── Environmental Adaptation ──────────────────────────────────────────────
    'Amphibious': 'May breathe underwater and move through aquatic environments without penalty.',
    'Aquatic Creature': 'Native to aquatic environments. Remove all :setback: added to checks while underwater.',
    'Arboreal Creature': 'Remove all :setback: from checks made while moving through or fighting in wooded or arboreal environments.',
    'Desert Dweller': 'Remove all :setback: from checks made while operating in desert or arid environments.',
    'Suited to the Cold': 'Remove all :setback: from checks due to cold conditions. Immune to hypothermia and cold-based environmental effects.',
    'Suited to the Heat': 'Remove all :setback: from checks due to heat or hot conditions. Immune to the Overheated condition.',
    'Vacuum Dweller': 'Can survive indefinitely in the vacuum of space. Immune to vacuum exposure and extreme cold.',
    'Ammonia Breather': 'Breathes ammonia — cannot survive in a standard atmosphere without a breathing apparatus. In its native atmosphere, remove all environment-based :setback:.',
    'Fire Resistant': 'Immune to fire and heat damage. Ignore the Burning quality on attacks and environmental fire effects.',
    'Heat Resistance': 'Remove all :setback: imposed by hot environments. Reduces severity of fire-based Critical Injuries by one step.',
    'Helium Allergy': 'Adversely affected by helium. In helium-rich atmospheres, add :setback::setback: to all checks.',
    'Creature of the Sea': 'Native to aquatic environments. Remove all :setback: while underwater and may breathe water as easily as air.',
    // ── Movement & Locomotion ──────────────────────────────────────────────────
    'Flyer': 'This creature can fly. When flying, may traverse vertical obstacles and difficult terrain without additional cost.',
    'Glider': 'Can glide but cannot ascend under own power. Gains :boost::boost: on Athletics checks involving controlled descent.',
    'Sathari Glider': 'Lightweight frame allows gliding. When jumping from height, may glide up to Medium range horizontally without Athletics checks.',
    'Hoverer': 'Hovers above the ground. Does not suffer additional maneuver costs from difficult terrain.',
    'Hover': 'Can hover above the ground. Does not need to spend additional maneuvers to traverse difficult terrain.',
    'Jet booster': 'Equipped with jet boosters. May spend a maneuver to fly up to Short range vertically or horizontally.',
    'Swift': 'Does not suffer penalties for moving through difficult terrain and may perform one additional free Move maneuver once per round.',
    'Surefooted': 'Does not suffer additional difficulties when moving through difficult terrain. Never falls prone due to terrain effects.',
    'Sand Walker': 'Does not suffer additional difficulties when moving through sandy or desert terrain. Ignores quicksand and similar hazards.',
    'Tunnelling': 'Can dig through loose soil or soft rock at normal movement rate. Cannot tunnel through reinforced structures.',
    'Leap': 'Adds :boost::boost: to all Athletics checks to perform vertical or horizontal jumps. May cover twice the normal jumping distance.',
    'Long Arms': 'Exceptionally long arms or appendages. Adds :boost: to Brawl attacks at Engaged range and may interact with objects at Short range as if Engaged.',
    'Many-armed': 'Multiple arms or appendages. May wield multiple items simultaneously and perform one additional free Brawl attack per round when engaged with multiple targets.',
    'Constrictor': 'When hitting with a Brawl attack and generating :advantage::advantage:, may ensnare the target (Immobilized until the target succeeds on an opposed Athletics check).',
    // ── Combat Abilities ───────────────────────────────────────────────────────
    'Trample': 'When this creature charges through an opponent\'s space during a Move maneuver, may make a free Brawl attack against each opponent in its path as an incidental.',
    'Overrun': 'When a Move maneuver takes this creature into an enemy\'s space, may make a free Athletics check against the enemy. On success, the enemy is knocked prone.',
    'Fierce Pounce': 'As an action, leap onto an Engaged target. Make a Brawl check — on success the target is also knocked prone.',
    'Dive Attack': 'When attacking from elevation or while diving from flight, adds :boost::boost: to the next Brawl or Melee attack and deals +2 damage.',
    'Dive-bomb': 'When attacking from a flying position by diving at the target, add :boost: to the attack and deal +2 damage on a hit.',
    'Death Lunge': 'Once per encounter, when this creature suffers a hit, it may immediately make a free Brawl check against the attacker as an out-of-turn incidental.',
    'Sweep Attack': 'May spend :triumph: on a successful Brawl check to simultaneously hit all Engaged opponents, dealing the attack\'s damage to each.',
    'Fire Sweep': 'When attacking, may spend :advantage::advantage: to also hit one additional target adjacent to the original target.',
    'Brute Strength': 'Extraordinary physical power. Brawl and Melee attacks deal damage equal to weapon damage + Brawn + 2.',
    'Strong as a Jakobeast': 'Legendary creature strength. Brawl and Melee attacks deal +2 damage. May spend :advantage: on Brawl checks to knock targets prone.',
    'Strong as a Murra': 'Legendary creature strength rivaling a murra beast. Brawl and Melee attacks deal +2 damage.',
    'Animal Combatant': 'Trained for combat. Remove :setback: from all Brawl and Melee attack checks.',
    'Swipe 1': 'Once per round, after a successful Brawl attack, may spend :advantage: to make a free attack against another Engaged target dealing Brawn+1 damage.',
    'Reckless Strike': 'May suffer 2 strain as an incidental to add :success: to one attack check.',
    'Cornered Fury': 'When wounds equal or exceed half the wound threshold, add :success::advantage: to all combat checks.',
    'Berzerk Rage': 'When suffering a Critical Injury, must make a Daunting (◆◆◆◆) Discipline check or enter a berserk rage — must attack the nearest target regardless of allegiance until calmed.',
    'Enhanced Nemesis Combat': 'Particularly skilled nemesis combatant. May perform one additional free maneuver per turn and ignore one negative dice result per round.',
    // ── Natural Weapons & Hazards ──────────────────────────────────────────────
    'Envenomed Bite': 'When hitting with a Brawl attack, spend :advantage: to inject venom. Target must make a Hard (◆◆◆) Resilience check or suffer a Critical Injury in addition to normal damage.',
    'Poisonous': 'Natural attacks carry a mild toxin. After a hit, spend :advantage: to force the target to make an Average (◆◆) Resilience check or suffer 3 additional wounds.',
    'Poisonous Bite': 'Bite attacks carry a toxin. Spend :advantage: after a hit to force the target to make an Average (◆◆) Resilience check or suffer 3 additional wounds.',
    'Venomous': 'Highly venomous. When hitting with an attack, target must make a Hard (◆◆◆) Resilience check or suffer a Critical Injury and the Staggered condition.',
    'Neurotoxin': 'When hitting with an attack, target must make an Average (◆◆) Resilience check or suffer the Staggered condition until the end of their next turn.',
    'Neurotoxin Doses': 'Carries doses of neurotoxin. As an incidental, apply one dose to a bladed weapon or dart. Victims must make an Average (◆◆) Resilience check or suffer the Staggered condition.',
    'Paralysing Neurotoxin': 'When hitting with an attack, target must make a Hard (◆◆◆) Resilience check or become Immobilized and Staggered until the end of their next turn.',
    'Acidic Drool': 'As an action, spit a stream of acid (Ranged [Light]; Damage 5; Critical 3; Range [Short]; Burn 2; Corrosive). Deals ongoing damage and corrodes equipment.',
    'Sticky Saliva': 'When hitting with a bite or grab and spending :advantage::advantage:, the target is coated in sticky saliva and Immobilized until they or an ally succeeds on a Hard (◆◆◆) Athletics check.',
    'Ink Spray': 'Once per encounter as an out-of-turn incidental, spray ink at all opponents within Short range. Targets must make a Hard (◆◆◆) Resilience check or be Blinded until end of next turn.',
    'Scorching Touch': 'When hitting with a Brawl attack, the target suffers the Burning 2 condition (suffers 2 wounds at start of each turn until extinguished).',
    'Searing Touch': 'When hitting with a Brawl attack, the target suffers the Burning 3 condition. Armor provides no soak against this damage.',
    'Lightning Charge': 'As an action or after a charge, discharge electricity at all Engaged targets. Each must make an Average (◆◆) Resilience check or suffer 4 wounds and the Staggered condition.',
    'Photonic Burst': 'Once per round as an action, release a blinding burst of light. All opponents within Short range make a Hard (◆◆◆) Resilience check or are Blinded until end of their next turn.',
    'Humming Vibrations': 'Constantly emits subsonic vibrations. Opponents within Engaged range add :setback: to Perception checks and must make an Average (◆◆) Resilience check each round or suffer 1 strain.',
    'Allelochemical Transmitters': 'Communicates via chemical signals with creatures of the same species within Medium range, conveying complex tactical information silently.',
    'Pheromone Communication': 'Communicates via pheromones with same-species creatures within Engaged range, allowing silent coordination.',
    'Stinky': 'Emits a powerful odor. Opponents within Engaged range add :setback: to all Perception checks and social checks.',
    'Fecklen Boom': 'Once per encounter, produce a concussive boom. All opponents within Engaged range must make a Hard (◆◆◆) Resilience check or be Staggered until end of their next turn.',
    // ── Natural Armor & Defenses ───────────────────────────────────────────────
    'Barbed Hide': 'Any character making a Brawl check against this creature suffers 2 wounds (ignoring soak) even if the attack fails.',
    'Asharl Pelt': 'Energy-dispersing pelt. Reduces damage from energy weapons (blasters, lightsabers) by 2, to a minimum of 1.',
    'Crystalline': 'Crystalline body provides +1 soak. However, sonic attacks deal +3 damage to this creature and bypass its soak.',
    'Tough Hide': 'Exceptionally tough hide. Increase soak by 1.',
    'Plated Hide 1': 'Thick armored hide provides 1 point of ranged and melee defense in addition to normal soak.',
    'Plated Hide 3': 'Heavy armored hide provides 3 points of ranged and melee defense in addition to normal soak.',
    'Duracrete Plating': 'Armored with duracrete. Reduces damage from all attacks by 2 and provides +2 soak. Cannot move more than one range band per turn.',
    'Dense Feathers': 'Thick feathers provide natural insulation and protection. Add +1 to soak. Remove :setback: from checks due to cold environments.',
    'Blubber': 'Thick layer of blubber provides insulation and armor. Add +1 to soak. Reduces damage from cold-based attacks by 2.',
    // ── Fear ─────────────────────────────────────────────────────────────────
    'Fearsome Aspect': 'When first encountered, opponents within Medium range must make an Average (◆◆) Discipline check or add :setback: to all checks for the remainder of the encounter.',
    'Frightening Visage': 'When first encountered, opponents within Short range must make a Daunting (◆◆◆◆) Discipline check or add :setback::setback: to all checks for the remainder of the encounter.',
    'Terrify (Improved)': 'All Fear checks caused by this character have their difficulty upgraded twice instead of once.',
    'Terrifying Howl': 'As an action, emit a terrifying howl. Opponents within Short range must make an Average (◆◆) Discipline check or add :setback: to all checks until end of their next turn.',
    'Darkest Dreams': 'Characters sleeping within Short range must make a Hard (◆◆◆) Discipline check or gain :setback::setback: to all checks the following day.',
    'Shriek': 'As an action, emit a shriek. Targets within Short range must make a Daunting (◆◆◆◆) Discipline check or be Staggered until end of their next turn.',
    'Soothing Song': 'As an action, emit a soothing song. Opponents within Short range must make an Average (◆◆) Discipline check or become Disoriented. Allies within Short range instead remove 1 strain.',
    'Insectoid Appearance': 'Disturbing to many species. Opponents must make a Hard (◆◆◆) Discipline check when first encountered or add :setback: to Presence-based checks against it.',
    'Fearless': 'Immune to Fear effects. Never needs to make Fear checks and adds :boost: to Discipline checks.',
    // ── Defensive Abilities ────────────────────────────────────────────────────
    'Hardy': 'Reduce the difficulty of all Resilience checks by 1.',
    'Hard to Kill': 'May spend a Destiny Point to ignore any one Critical Injury result for the remainder of the encounter (the injury still applies at encounter\'s end).',
    'Resilient Metabolism': 'Add automatic :success: to all Resilience checks.',
    'Regeneration': 'When recovering wounds via natural rest or bacta treatment, recover 1 additional wound per recovery check.',
    'Energy Parasite': 'When Engaged with a droid or powered vehicle, spend a maneuver to drain energy: the target adds :setback: to all system-dependent checks and this creature heals 1 wound.',
    'Sessile': 'This creature cannot move under its own power and is permanently stationary.',
    'Immobile': 'Cannot spend maneuvers to move. Cannot be moved by most effects.',
    'Restraint': 'Exceptional self-control. May spend a Destiny Point to immediately end a Rage, Berserk, or forced emotion effect as an incidental.',
    'Stubborn 1': 'Upgrade the ability of all Resilience checks once. May reroll 1 die on checks made to resist being moved or affected by status conditions.',
    'Stubborn and Dependable': 'Exceptionally steadfast. Upgrade ability of all Resilience and Discipline checks once. Cannot be involuntarily moved.',
    'Breakaway Systems': 'When suffering a Critical Hit exceeding wound threshold, may eject non-essential systems as a reaction, reducing the Critical result by 30.',
    'Self-destruct Mechanism': 'If reduced to 0 wounds, may activate self-destruct as an out-of-turn incidental, dealing 8 damage (ignoring soak) to all Engaged characters.',
    'Reflect (Improved) 2': 'When hit by a ranged attack while wielding a lightsaber, may reflect it back at the attacker, adding :advantage::advantage: to the reflected attack.',
    'Shield Projector': 'Generates a personal energy shield providing 2 ranged defense. When the shield absorbs a ranged hit, reduce the damage by an additional 2.',
    'Unstable 4': 'Dangerously unstable. At the end of each round, if 4 or more :threat: or a :despair: is generated during the round, this character malfunctions or explodes, dealing 6 damage to all Engaged targets.',
    // ── Perception & Stealth ───────────────────────────────────────────────────
    'Enhanced Senses': 'Remove all :setback: imposed by darkness, concealment, or environmental interference on Perception and Vigilance checks.',
    'Heightened Sense of Smell': 'Remove all :setback: imposed by darkness or concealment when tracking by scent. Add :boost: to Perception checks involving smell.',
    'Keen Senses': 'Add :boost: to all Perception and Vigilance checks. May never be surprised.',
    'Keen Eyed 1': 'Once per session, reroll 1 die on a Perception or Vigilance check. Remove :setback: from Perception checks due to distance.',
    'Olfactory Perception': 'Remove all :setback: from Perception checks involving scent. May track creatures by smell through medium terrain without additional difficulty.',
    'Olfactory Sensor Suite': '(Droid) Advanced chemical sensors. Remove :setback: imposed by darkness or concealment when locating targets by scent or chemical signature.',
    'Magnetic Sense': 'Can sense magnetic fields. Remove :setback: imposed by darkness and disorientation. May navigate underground or underwater without difficulty.',
    'Nightvision': 'Remove all :setback: imposed by low-light conditions on Perception and ranged attack checks.',
    'Infravision': 'Remove all :setback: imposed by lighting conditions by detecting heat signatures.',
    'Sight Hunter': 'Remove :setback: imposed by lighting conditions. However, add :setback::setback: in environments with heavy visual interference (smoke, fog, strobing lights).',
    'Silent Hunter': 'Opponents add :setback::setback: to Perception checks made to detect this creature. Add :boost::boost: to all Stealth checks.',
    'Near-Sighted': 'Add :setback::setback: to all Perception checks beyond Short range and to ranged attacks at Medium range or beyond.',
    'Light-Sensitive': 'Adversely affected by bright light. Add :setback::setback: to all checks in bright conditions. Remove :setback: in darkness.',
    'Camouflaged (Jungle)': 'Coloring blends into jungle or forested environments. Opponents add :setback::setback: to Perception checks to notice it there. Add :boost::boost: to Stealth in such terrain.',
    'Camouflaged (Snow)': 'White fur or coloring blends into snowy environments. Opponents add :setback::setback: to Perception checks to notice it there. Add :boost::boost: to Stealth in arctic terrain.',
    'Natural Camouflage': 'When stationary, opponents add :setback::setback::setback: to Perception checks to notice this creature. Add :boost::boost::boost: to Stealth when motionless.',
    'Living Shadow': 'In dim lighting or darkness, adds :boost::boost::boost: to Stealth and opponents need a Formidable (◆◆◆◆◆) Perception check to detect it.',
    'Shadowblend': 'In any area with shadows, adds :boost::boost: to Stealth and opponents add :setback: to Perception checks.',
    'Shadowed': 'Skilled at operating in darkness. Add :boost: to Stealth and remove :setback: from checks made in low-light conditions.',
    'Cloak': 'As an action, activate cloaking device — invisible to sensors and visual detection until making an attack. Opponents need a Formidable (◆◆◆◆◆) Perception check to detect.',
    // ── Droid/Cybernetic ───────────────────────────────────────────────────────
    'Droid': 'Does not need to breathe, eat, or drink. Can survive indefinitely in a vacuum or underwater. Immune to poisons, toxins, and gases. Does not suffer Strain. Immune to mind-affecting Force powers.',
    'Cyborg': 'Significant cybernetic enhancements. Ignore the first Critical Injury each encounter. Vulnerable to ion damage as if a droid.',
    'Advanced Language Module': 'Equipped with an advanced language module. Can communicate fluently in over 6 million forms of communication.',
    'Computer Affinity': 'Remove :setback: from all Computers checks. Treat all locked terminals as one difficulty lower when slicing.',
    'Sensor Masking': 'Generates sensor-masking signals. Opponents add :setback::setback: to Computers checks to detect this character with sensors.',
    'Cybernetic Communications': 'Can communicate silently via encrypted datalink with other droids or cybernetically-enhanced allies within Medium range.',
    'Contraption': 'Cobbled together from salvaged parts. Critical Hit results are reduced by 10 (minimum 1), but repairs cost half the normal amount.',
    // ── Social & Command ───────────────────────────────────────────────────────
    'Aura of Command': 'Allies within Short range add :boost: to all combat and leadership checks. May spend a maneuver to grant one ally within Short range a free :advantage: on their next check.',
    'Leader': 'Allies within Short range remove :setback: from combat checks. Once per round, may spend a maneuver to direct an ally, granting them :boost: on their next action.',
    'Tactical Direction': 'Once per round, use a maneuver to grant one ally within Medium range an additional free maneuver.',
    'Alliance Leader': 'Allied characters within Medium range add :boost: to Leadership and Discipline checks. Once per encounter, spend a Destiny Point to allow all allies to recover 2 strain.',
    'Military Analyst': 'Spend a maneuver to study an opponent. Next round, gain :boost::boost: on all combat checks against that target.',
    'Spaceport Leader': 'Allied characters within Short range add :boost: to all Streetwise and Underworld checks.',
    'Pirate Leader': 'May spend a maneuver to grant pirates within Medium range :boost: on their next check. Allies within Short range add :boost: to attack checks.',
    'Networking': 'Once per session, call on a contact for information, equipment, or a favor.',
    'Lorekeeper 2': 'Add :boost::boost: to Knowledge checks about ancient history, artifacts, or lore. May reroll 1 die on any Knowledge check.',
    // ── Imperial/Faction ───────────────────────────────────────────────────────
    'Imperial Haughtiness': 'Bearing conveys Imperial authority. Add :boost: to Coercion checks. Remove :setback: from Leadership checks with Imperial personnel.',
    'Imperial Valour': 'This character and allies within Short range may each spend a Destiny Point once per encounter to ignore one Critical Injury for the remainder of the encounter.',
    'Mandalorian Visage': 'Mandalorian armor inspires fear or respect. Add :boost: to Coercion checks. May reroll one die on Coercion checks.',
    'Constabulary Honour 2': 'Allies within Short range remove :setback: from Discipline checks. May spend 2 Destiny Points to negate a :despair: result on a combat check.',
    'Constabulary Honour 3': 'Senior officer aura. Allies within Short range remove :setback::setback: from Discipline checks. Once per encounter, negate one Critical Injury on an ally.',
    'Green Nikto': 'Kajain\'ad\'Nikto species trait. Adapted to arid heat — remove :setback: from checks in desert environments. Add :boost: on Resilience checks.',
    'Red Nikto': 'Kajain\'ad\'Nikto species trait. Remove :setback: from checks in hot, dry environments.',
    'Mountain Nikto': 'Esral\'sa\'Nikto species trait. Adapted to high altitude — remove :setback: from checks in mountainous terrain.',
    'Southern Nikto': 'Gluss\'sa\'Nikto species trait. Remove :setback: from checks in aquatic or coastal environments.',
    'Pale Nikto': 'Nikto sub-species trait. Remove :setback: from checks in shadowy or underground environments.',
    'Huttese': 'Fluent in Huttese. No language barriers with Hutt-aligned NPCs. Add :boost: to social checks with Hutt crime lords.',
    // ── Social / Personal ──────────────────────────────────────────────────────
    'Loyalty': 'Utterly loyal to a specific person or faction. Gain :boost::boost: on Discipline checks to resist manipulation that would harm them.',
    'Loyalty Imprint': 'Imprinted on a specific handler. Prioritizes their safety above all else. Cannot be reprogrammed without a Hard (◆◆◆) Computers check.',
    'Code of Silence': 'Will not reveal information under any circumstances. Immune to social Coercion. Reduces difficulty of Discipline checks to resist interrogation by 2.',
    'Blabber Mouth': 'Has trouble keeping secrets. Coercion checks against this character are one difficulty lower. On a :despair: on Deception, involuntarily reveals sensitive information.',
    'Etiquette and Protocol': 'Versed in formal social customs. Add :boost: to Charm and Negotiation checks in formal or political contexts.',
    'Etiquette and Protocol (Improved)': 'Highly versed in social customs. Add :boost::boost: to all Charm and Negotiation checks. Remove :setback: from Charm, Negotiation, and Leadership checks.',
    'Rhetoric Mimic': 'Can perfectly mimic voices and speech patterns. Add :boost::boost: to Deception checks involving impersonation.',
    'Backup Entertainer': 'Trained in performing arts. Add :boost: to Charm and Deception checks using performance as cover. Once per session, distract a group of targets with a performance.',
    'Intimidating Presence': 'Allies within Short range add :success: to Coercion checks. Opponents within Short range must make an Average (◆◆) Discipline check or add :setback: to checks.',
    'Slave Authority': 'May use Coercion instead of Leadership when commanding enslaved or coerced individuals.',
    'Fearsome Countenance': 'Add automatic :advantage: to all Coercion checks.',
    // ── Medical & Support ─────────────────────────────────────────────────────
    'Surgeon\'s Aid': 'Allies within Short range remove :setback: from Medicine checks. When assisting a Medicine check, provides :boost::boost: instead of the normal :boost:.',
    'Create Bacta': 'Once per session, synthesize 1 dose of crude bacta from available materials (requires Hard ◆◆◆ Medicine check). The bacta heals 4 wounds when applied.',
    'Firefighter': 'Add :boost::boost: to checks made to extinguish fires or rescue individuals from burning environments. May ignore the Burning condition for one round as an incidental.',
    'Covering Fire': 'May spend a maneuver to add +1 ranged Defense to up to three allied characters within Short range until start of this character\'s next turn.',
    'Improved Covering Fire': 'When allied minion groups within Short range use Covering Fire, they instead add +2 ranged Defense.',
    'Gun Crew': 'When serving as part of a gunnery crew, add :boost: to all Gunnery checks. Reduce reload time for crew-served weapons by 1.',
    'Body Guard': 'Once per round, when an ally within Short range would suffer wounds, this character may suffer those wounds instead as an out-of-turn incidental.',
    'Teamwork': 'When assisting another character\'s check, provides :boost::boost: instead of the normal :boost:.',
    'Overwhelming Fire': 'As a maneuver, make a Leadership check to direct allies within Short range; on success, each may make a free ranged attack as an incidental.',
    'Push the Limit': 'Once per encounter, suffer 2 strain to perform an additional maneuver as an incidental.',
    'Technical Master': 'Remove :setback::setback: from all Mechanics checks. When repairing, restore 1 additional Hull Trauma or System Strain per check.',
    'Fire Control': 'As a maneuver, direct one ally within Short range to add :boost: to their next ranged attack.',
    'Projectile Guidance': 'Remove :setback: from all ranged attack checks. The first :advantage: generated may be spent to hit a second adjacent target.',
    'Skilled Jockey 2': 'Add :boost::boost: to all Piloting checks. Once per encounter, reroll one Piloting check and keep the better result.',
    // ── Animal Traits ──────────────────────────────────────────────────────────
    'Companion Animal': 'Bonded to a specific handler. Follows simple commands, defends the handler, and gains :boost: on all checks while the handler is within Short range.',
    'Bantha Affinity': 'Sand People and those with this ability may ride banthas without Riding checks. These banthas will not flee in most combat situations.',
    'Pack Instincts': 'When fighting alongside 3 or more of the same species, add :boost: to all combat checks.',
    'Territorial': 'Will automatically attack any creature entering its territory (within Short range) unless the intruder makes a Hard (◆◆◆) Survival check to appear non-threatening.',
    'Ornery': 'Ill-tempered and unpredictable. Handlers add :setback::setback: to Animal Handling checks. May attack its own handlers on a :despair: result.',
    'Domesticated': 'Domesticated and trained. Follows commands from its handler without checks in normal circumstances.',
    'Domesticable 1': 'Can be domesticated with training. Requires 1 rank in Survival and a series of successful checks over several weeks.',
    'Domesticable 2': 'Can be domesticated with significant expertise. Requires 2 ranks in Survival and at least one month of dedicated training.',
    'Trained Mount 1': 'Trained as a riding animal. Characters with at least 1 rank in Riding may use it without penalty.',
    'Trained Mount 2': 'Highly trained as a riding animal. Characters with at least 2 ranks in Riding may perform advanced maneuvers.',
    // ── Beast of Burden ────────────────────────────────────────────────────────
    'Beast of Burden 4': 'When used as a pack animal, can carry up to encumbrance 4 before becoming encumbered.',
    'Beast of Burden 5': 'When used as a pack animal, can carry up to encumbrance 5 before becoming encumbered.',
    'Beast of Burden 6': 'When used as a pack animal, can carry up to encumbrance 6 before becoming encumbered.',
    'Beast of Burden 10': 'When used as a pack animal, can carry up to encumbrance 10 before becoming encumbered.',
    'Beast of Burden 15': 'When used as a pack animal, can carry up to encumbrance 15 before becoming encumbered.',
    'Beast of Burden 20': 'When used as a pack animal, can carry up to encumbrance 20 before becoming encumbered.',
    // ── Special / Named ────────────────────────────────────────────────────────
    'Wookiee Rage': 'Deals +1 damage with Brawl and Melee attacks when suffering any wounds. When suffering a Critical Injury, deals +2 damage with Brawl and Melee attacks instead.',
    'Swarm': 'Operates as a swarm (silhouette 0 individuals). May move through any opening a small creature could pass through.',
    'Ponderous': 'Cannot spend more than one maneuver moving per turn. Cannot perform the Sprint action.',
    'Ponderous (Thalassian)': 'The Thalassian\'s bulk limits movement. Cannot spend more than one maneuver moving per turn.',
    'Awkward': 'Add :setback: to all Coordination and Stealth checks. Cannot perform the Dodge incidental.',
    'Ambushers': 'When attacking from ambush before targets are aware, add :boost::boost: to the initial attack check.',
    'Cunning Ambusher': 'Add :boost::boost: to all combat checks made while undetected or attacking from stealth.',
    'Cunning Ambusher 1': 'Add :boost: to the first combat check made against a target that is unaware of this character\'s presence.',
    'On the Edge': 'Add :boost::boost: to combat checks in dangerous situations. Remove :setback: from Initiative checks.',
    'Hunter 1': 'Add :boost: to combat checks against targets that have been successfully tracked or identified by this character this encounter.',
    'Jungle Hunter': 'Remove :setback: from combat and Stealth checks in jungle environments. Add :boost: to Survival checks in jungle terrain.',
    'Clone Inhibitor Chip': 'With proper chain of command, upgrade ability of Leadership checks with clones once. Clones with this chip will not disobey direct orders from their commander.',
    'Skilled Cheater': 'Once per session when gambling, cancel a :despair: on a skill check. Add :boost: to all Skulduggery checks.',
    'Luck Be a Lady': 'Once per session, reroll all dice on any one check and keep the new result.',
    'All the Luck in the Galaxy': 'Once per session, flip a Destiny Point to add :triumph: to any check. Remove :setback: from all Deception and Skulduggery checks.',
    'Bad Knee': 'Old injury. Add :setback: to Athletics and Coordination checks. Leg Critical Injury results are increased by 20.',
    'Bloodfly Sickness': 'Carries bloodfly fever. When dealing wounds with Brawl, the target must make an Average (◆◆) Resilience check or contract the sickness, suffering 1 wound per round until treated.',
    'Destabilizing Influence': 'Force-sensitive characters within Medium range must make an Average (◆◆) Discipline check each round or suffer 1 Conflict.',
    'Wilderness Valor': 'When fighting in natural outdoor environments, add :boost: to combat checks and remove :setback: from Survival checks.',
    'Low-Tech User': 'Uncomfortable with advanced technology. Add :setback::setback: to all Computers and Mechanics checks.',
    'Intuitive Navigation': 'Never becomes lost. Remove :setback: from all navigation-based Astrogation and Survival checks.',
    'For Quolas!': 'Fights with fanatical devotion. Once per encounter, declare this ability to add :success::success::advantage::advantage: to one combat check and recover 3 strain.'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/adversary-talents.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Adversary Talent Description Lookup
//
// Maps talent name strings (as they appear in adversaries.json) to canonical
// descriptions sourced from the AoE / EotE / FaD core rulebooks.
//
// Lookup strategy (applied in adversaries.ts normalize()):
//   1. Exact match: TALENT_DESCRIPTIONS['Parry 3']
//   2. Rank-stripped match: TALENT_DESCRIPTIONS['Parry']  (strips trailing " N")
//   3. Improved/Supreme variant: TALENT_DESCRIPTIONS['Parry (Improved)']
//
// ACTIVATION_TYPES maps base talent name → activation keyword.
// Omitted entries default to 'passive'.
// ═══════════════════════════════════════════════════════════════════════════
__turbopack_context__.s([
    "TALENT_ACTIVATION",
    ()=>TALENT_ACTIVATION,
    "TALENT_DESCRIPTIONS",
    ()=>TALENT_DESCRIPTIONS
]);
const TALENT_DESCRIPTIONS = {
    // ── A ───────────────────────────────────────────────────────────────────
    'Adversary': 'Upgrade the difficulty of any combat checks targeting this character once per rank of Adversary.',
    'All-Terrain Driver': 'Ignore penalties for driving through difficult terrain; remove one Setback from relevant Piloting (Planetary) checks.',
    'Anatomy Lessons': 'After a successful attack, spend 2 Advantage to add Intellect ranks to total damage dealt.',
    'Animal Empathy': 'Remove Setback dice from checks to train, calm, or ride animals equal to ranks in Animal Empathy.',
    'Ataru Technique': 'May use Cunning instead of Brawn for Lightsaber combat checks. When making a Lightsaber check, may spend Triumph to add Cunning ranks as bonus damage.',
    // ── B ───────────────────────────────────────────────────────────────────
    'Bacta Specialist': 'Patients under this character\'s care heal one additional wound per rank of Bacta Specialist when making natural recovery checks.',
    'Bad Cop': 'When making an opposed Coercion check as part of a social encounter, may assist a paired character\'s Charm check. The partner adds Boost dice equal to ranks in Bad Cop.',
    'Bad Motivator': 'Once per session when repairing a droid or vehicle, may make an Average Mechanics check. On success, the vehicle or droid suffers a serious or critical hit instead of gaining repairs.',
    'Barrage': 'Add +1 damage per rank of Barrage to successful hits made with ranged weapons at long or extreme range.',
    'Black Market Contacts': 'When purchasing illegal, black market, or restricted gear, reduce the rarity by 1 per rank of Black Market Contacts.',
    'Blooded': 'When suffering a Critical Injury result of 01-39, may spend Destiny Point to recover from it immediately.',
    'Body Guard': 'Once per round, perform the Body Guard maneuver: suffer 2 strain to upgrade difficulty of combat checks targeting a chosen ally by 1 per rank of Body Guard until the start of next turn.',
    'Body Guard (Improved)': 'When performing the Body Guard maneuver, if the chosen ally is targeted and hit, may spend 2 Advantage to cause the attack to miss.',
    'Bought Info': 'Spend 50 credits; may ask the GM one yes/no question about a subject. Once per session.',
    'Brace': 'Perform the Brace maneuver: remove one Setback die per rank from next action caused by difficult terrain, a moving vehicle, or similar conditions.',
    'Brilliant Evasion': 'Once per encounter, take an action to avoid attacks: reduce the total number of hits targeting this character each round to 0, with a number of those attacks reduced equal to Cunning. Lasts until next turn.',
    'Bypass Security': 'Remove one Setback die per rank of Bypass Security from checks made to disable or bypass security systems.',
    // ── C ───────────────────────────────────────────────────────────────────
    'Calming Aura': 'Allies within short range add one Boost die to Discipline and Cool checks.',
    'Careful Planning': 'Once per session, may introduce a "plan" as a free action — treat one result as if one Destiny Point had been spent.',
    'Centre of Being (Improved)': 'When activating Centre of Being, the benefits apply until the start of this character\'s next turn rather than just the first attack.',
    'Circle of Shelter': 'When performing the Body Guard maneuver, may protect one additional ally per rank of Circle of Shelter.',
    'Clever Commander': 'Once per session, take the Clever Commander action: make an Average Leadership check; on success, allies may each perform one free maneuver.',
    'Clever Solution': 'Once per session, make an Average check with any Knowledge skill to receive one relevant piece of information that is immediately applicable to the current situation.',
    'Codebreaker': 'Remove one Setback die per rank of Codebreaker from checks to break codes or decrypt communications. Reduce difficulty of Computers checks to decrypt by 1.',
    'Command': 'Add one Boost die per rank of Command to Leadership checks. Affected NPCs add a Boost die to Discipline checks for remainder of encounter.',
    'Commanding Presence': 'Remove one Setback die per rank of Commanding Presence from Leadership or Cool checks.',
    'Conditioned': 'Remove one Setback die per rank of Conditioned from Athletics or Resilience checks. Reduce the difficulty of these checks by 1 (to a minimum of Easy).',
    'Confidence': 'May decrease the difficulty of Discipline checks to avoid fear by 1 per rank of Confidence, to a minimum of Easy.',
    'Congenial': 'Suffer strain to downgrade difficulty of Charm or Negotiation checks. Amount suffered equals levels downgraded, to maximum equal to ranks in Congenial.',
    'Contraption': 'Once per session, spend 1 Destiny Point and make a Hard Mechanics check to jury-rig a device that performs any function the character needs for the scene. It breaks irreparably at the end of the scene.',
    'Convincing Demeanor': 'Remove one Setback die per rank of Convincing Demeanor from Deception or Skulduggery checks.',
    'Coordinated Assault': 'Once per round, take a Coordinated Assault maneuver: a number of allies equal to Ranks in Coordinated Assault within short range add damage equal to rank to their next hit this round.',
    'Crippling Blow': 'May spend 1 Advantage on a successful combat check to inflict a Critical Injury on the target, even if the hit did not exceed their Wound Threshold.',
    'Cunning Ambusher': 'Add one Boost die per rank of Cunning Ambusher to the first combat check made against an opponent who has not yet had a turn in the encounter.',
    // ── D ───────────────────────────────────────────────────────────────────
    'Darkside Force User': 'This character has given in to the dark side of the Force. Treat dark side Force dice results as light side when spending Force points on Force powers.',
    'Dead to Rights': 'When making a ranged combat check against a target at engaged or short range, may spend 2 Advantage to add half of Agility (rounded up) to damage.',
    'Deadly Accuracy (Brawl)': 'When making Brawl combat checks, add ranks in Brawl as bonus damage to one hit per attack.',
    'Deadly Accuracy (Melee)': 'When making Melee combat checks, add ranks in Melee as bonus damage to one hit per attack.',
    'Deadly Accuracy (Ranged: Heavy)': 'When making Ranged (Heavy) combat checks, add ranks in Ranged (Heavy) as bonus damage to one hit per attack.',
    'Deadly Accuracy (Ranged: Light)': 'When making Ranged (Light) combat checks, add ranks in Ranged (Light) as bonus damage to one hit per attack.',
    'Deadly accuracy': 'Add ranks in the relevant combat skill as bonus damage to one hit per attack.',
    'Death From Above': 'If attacking from elevated terrain, spend 2 Advantage or a Triumph to add the difference in silhouette to damage.',
    'Defensive Driving': 'Increase defense of vehicle this character pilots by 1 per rank of Defensive Driving.',
    'Defensive Slicing': 'When attempting to defend a computer system, add Setback dice equal to ranks in Defensive Slicing to opponent\'s attempts to breach the system.',
    'Discredit': 'Once per session, make an Average Deception check targeting an opponent in a social situation. On success, reduce their Social Standing or standing with an organization.',
    'Disorient': 'After making a successful attack, spend Advantage to disorient the target; they add Setback dice to all checks for rounds equal to ranks in Disorient.',
    'Distracting Behaviour': 'Take an action; make an opposed Deception vs Perception check. On success, one opponent is staggered until the end of the current round.',
    'Distracting Behaviour (Improved)': 'When successfully using Distracting Behaviour, the target is staggered for a number of rounds equal to successes rolled.',
    'Dodge': 'When targeted by a combat check, may spend 1 Destiny Point as an out-of-turn incidental. Upgrade the difficulty of that check a number of times equal to ranks of Dodge.',
    'Double-Talk': 'Once per encounter, may make an Average Deception check as a maneuver; on success, create a distraction — one target within short range loses their next free maneuver.',
    'Draw Closer': 'After successfully activating a Force power, spend 1 Force pip to move an engaged enemy up to short range.',
    'Draw Closer (Skysnare)': 'A variation of Draw Closer specific to this character\'s technique. Spend 1 Force pip after a successful Force power to reposition an engaged opponent.',
    'Drive Back': 'On a successful melee hit, spend 2 Advantage to force target to move one range band away.',
    'Droid': 'This character is a droid. They do not need to breathe, eat, drink, or sleep. They are not affected by poisons or toxins. They can survive in vacuum indefinitely. Recover 1 strain when repaired.',
    'Duelist\'s Training': 'When engaged with a single opponent, upgrade ability of all combat checks against that opponent once.',
    'Durable': 'Reduce result of any Critical Injury suffered by 10 per rank of Durable, to a minimum of 1.',
    // ── E ───────────────────────────────────────────────────────────────────
    'Encoded Communique': 'Once per session, send or intercept a coded message. Make a Hard Computers check; on success, decode or send a message without detection.',
    'Encouraging Words': 'Once per session, use an action to let an ally recover strain equal to this character\'s Presence ranks.',
    'Enduring': 'Gain +1 soak per rank of Enduring.',
    'Enhanced Leader': 'When using the Field Commander talent, grants one additional maneuver to all affected allies.',
    'Expert Handler': 'Remove one Setback die per rank of Expert Handler from checks to handle, train, ride, or interact with animals.',
    'Expert Tracker': 'Remove one Setback die per rank of Expert Tracker from Survival checks to track prey. Decrease time to find tracks by 50% per rank.',
    'Eye for Detail': 'Remove up to 2 Setback dice per rank from Mechanics or Computers checks. Reduce difficulty of these checks by 1 (minimum Easy).',
    // ── F ───────────────────────────────────────────────────────────────────
    'Fear is My Ally': 'May use Coercion instead of Leadership for command-related checks. Allied minion groups may use this character\'s Coercion ranks as their own.',
    'Fearsome': 'When enemies first encounter this character in combat, they must make a Daunting Discipline check or suffer 1 strain per rank of Fearsome.',
    'Feint': 'After winning an opposed Melee check, upgrade the difficulty of the target\'s next combat check once per rank of Feint.',
    'Feral Strength': 'Add +1 damage per rank of Feral Strength to melee combat checks.',
    'Field Commander': 'Take an action; spend 1 Destiny Point. Up to Presence number of allies within medium range may immediately perform one free maneuver without suffering strain.',
    'Field Commander (Improved)': 'Allies benefiting from Field Commander may perform both a free maneuver and a free action.',
    'Fine Tuning': 'When reducing a ship\'s system strain, reduce 1 additional system strain per rank of Fine Tuning.',
    'Finesse': 'May use Agility instead of Brawn for Melee combat checks.',
    'Fire Control': 'Spend 2 Advantage on a successful ranged attack to grant all allies a Boost die on their next ranged attack against the same target.',
    'Flyer': 'This character has a natural flying ability. May spend a maneuver to take to the air, gaining the benefits of elevated terrain. May not be knocked prone while flying.',
    'Forager': 'Remove up to 2 Setback dice from Survival checks to find food, water, or shelter. In urban environments, this applies to scrounging supplies.',
    'Force Rating': 'Increase Force Rating by 1 per rank of Force Rating.',
    'Forewarning': 'At the beginning of an encounter, may spend a Destiny Point as an out-of-turn incidental; allies may not be surprised and add Boost dice to their Initiative check equal to ranks of Forewarning.',
    'Form on Me': 'When performing the assist maneuver for combat, add Boost dice equal to Leadership ranks.',
    'Formation Tactics': 'Allies in short range who attack the same target as this character add one Boost die to their checks.',
    'Formation Tactics (Improved)': 'Formation Tactics also grants one additional Boost die to all affected allies.',
    'Frenzied Attack': 'Perform the Frenzied Attack maneuver: suffer strain up to ranks in Frenzied Attack; add the same amount as damage to the next melee attack made this turn.',
    'Full Throttle': 'Take an action; make a Daunting Piloting check. On success, vehicle\'s Speed increases by 1 for a number of rounds equal to successes.',
    'Full Throttle (Improved)': 'Full Throttle now requires only a Hard Piloting check instead of Daunting.',
    'Full Throttle (Supreme)': 'Full Throttle may now be performed as an incidental rather than an action.',
    // ── G ───────────────────────────────────────────────────────────────────
    'Galaxy Mapper': 'Remove one Setback die per rank from Astrogation checks. Reduce time to calculate hyperspace routes by half.',
    'Gang Leader': 'Minions under this character\'s command add one Boost die to all combat checks when this character is engaged with the same target.',
    'Gearhead': 'Remove one Setback die per rank of Gearhead from Mechanics checks. Halve the cost of personally owned equipment modifications.',
    'Good Cop': 'Add a Boost die per rank of Good Cop to Charm checks when working with a paired "Bad Cop" character.',
    'Grapple': 'After a successful Brawl attack, spend 2 Advantage to immobilize the target until the start of this character\'s next turn.',
    'Greased Palms': 'Before making a social check, may spend credits equal to 50 × the number of Boost dice added (up to ranks) to add those Boost dice to the check.',
    'Guns Blazing': 'When making a ranged attack, may add Setback dice to the check (up to ranks in Guns Blazing) to add the same number of Boost dice to any attacks this character suffers until next turn.',
    // ── H ───────────────────────────────────────────────────────────────────
    'Hard Headed': 'When staggered, may take an action and suffer strain equal to ranks in Hard Headed to act normally.',
    'Hawk Bat Swoop': 'Take the Hawk Bat Swoop maneuver; suffer 1 strain to disengage from all melee opponents without incurring the free attack.',
    'Healing Trance': 'Take an action; enter a healing trance. Make a Hard Discipline check; on success heal wounds equal to successes. May not be performed more than once per encounter.',
    'Heightened Awareness': 'Allies within close range add one Boost die to Perception and Vigilance checks.',
    'Hidden Storage': 'Possesses hidden compartments in gear or body that can store items; each rank adds encumbrance 2 worth of storage that is not detected by standard searches.',
    'Hit And Run': 'After making a melee attack and moving away, opponents do not receive a free attack when disengaging.',
    'Hold Together': 'Once per encounter, take a Hold Together action on a vehicle; make a Hard Mechanics check. On success, the vehicle is not destroyed until the end of the following round.',
    'Hunter': 'Add Boost dice per rank of Hunter to checks made while hunting, tracking, or attacking beasts and wild creatures.',
    'Hunter\'s Quarry': 'Designate one target as Quarry. Gain Boost dice on all checks made to track, find, or attack the Quarry equal to ranks in Hunter\'s Quarry.',
    'Hunter\'s Quarry (Improved)': 'When attacking the designated Quarry, the first hit each round deals additional damage equal to Cunning ranks.',
    // ── I ───────────────────────────────────────────────────────────────────
    'Idealist': 'May spend Destiny Points to add Boost dice to social checks involving ideals this character believes in; each Destiny Point spent adds one Boost die.',
    'Imbue Item': 'May spend Force pips to imbue a weapon or armor with the Force, granting it magical properties for the remainder of the encounter.',
    'Improved Dodge': 'When activating Dodge, may upgrade the difficulty of the triggering check one additional time per rank of Improved Dodge.',
    'Improved Parry': 'As Parry (Improved): when enemy rolls Despair or 3+ Threat on a Melee check, may spend to make an immediate counter-attack as an out-of-turn incidental.',
    'Improved Reflect': 'As Reflect (Improved): when enemy rolls Despair or 3+ Threat on a ranged check, may reflect the attack back at the original attacker.',
    'Improved Scathing Tirade': 'See Scathing Tirade (Improved).',
    'Incite Rebellion': 'Take an action; make an opposed Leadership vs Discipline check against a group of NPCs; on success, cause them to rebel against their current commander for one round per success.',
    'Indistinguishable': 'Opponents attempting to identify or recognize this character must succeed at an opposed Perception check against this character\'s Deception or Skulduggery.',
    'Inspiring Leadership': 'Allies within medium range who succeed on a social or Leadership check recover 1 strain.',
    'Inspiring Rhetoric': 'Take an action; make an Average Leadership check. Each success causes one ally within short range to immediately recover 1 strain.',
    'Inspiring Rhetoric (Improved)': 'Each ally benefiting from Inspiring Rhetoric may also immediately perform one free maneuver.',
    'Inspiring Rhetoric (Supreme)': 'Inspiring Rhetoric is now a maneuver rather than an action.',
    'Intense Focus': 'Perform the Intense Focus maneuver: suffer 1 strain to upgrade the ability of the next check made this turn once.',
    'Intense Presence': 'Once per session, recover strain equal to Presence ranks.',
    'Intimidating': 'May suffer strain to downgrade the difficulty of Coercion checks or upgrade the difficulty of Discipline checks targeting this character. May be performed as an out-of-turn incidental up to ranks in Intimidating.',
    'Intuitive Evasion': 'Suffer 1 strain to use Cunning instead of Agility when calculating defense for personal scale.',
    'Intuitive Improvements': 'When successfully modifying a weapon or armor, increase the number of advantages required to gain additional mods by 1.',
    'It\'s Not That Bad': 'Once per session, use an action to let an ally re-roll a Critical Injury result. They must accept the new result.',
    // ── J ───────────────────────────────────────────────────────────────────
    'Jetpack Expertise': 'Reduce the difficulty of checks to avoid hazards while using a jetpack or similar device by 2. Negate the increased difficulty caused by jetpack use.',
    'Jump Up': 'Once per round, may stand from prone as an incidental rather than a maneuver.',
    'Just Kidding!': 'When using Deception or Charm in a social check, may suffer 2 strain to force the target to reroll one die.',
    'Just Kidding! (Improved)': 'When using Just Kidding!, the target must choose the worse result between their original roll and the reroll.',
    // ── K ───────────────────────────────────────────────────────────────────
    'Keen Eyed': 'Remove one Setback die per rank of Keen Eyed from Perception and Vigilance checks. Reduce the time to search an area by 50% per rank.',
    'Kill with Kindness': 'Remove one Setback die per rank of Kill with Kindness from Charm or Leadership checks.',
    'Know Somebody': 'Once per session, may reduce the rarity of one purchased item by 2 per rank of Know Somebody by citing a contact who can provide it.',
    'Know the Enemy': 'When first engaging an enemy, make an Average Knowledge check. On success, learn one relevant weakness or piece of tactical information.',
    'Know their Weakness': 'Once per combat, exploit a target\'s weakness — add damage equal to ranks in Know their Weakness to one hit against a designated target.',
    'Knowledge Specialization: Lore': 'When making Knowledge (Lore) checks, may remove Setback dice equal to ranks, and treat checks as having one rank higher.',
    'Known Schematic': 'Once per session, declare knowledge of a building or vehicle\'s floor plan. Gain Boost dice on all Mechanics checks for that structure.',
    'Knockdown': 'When making a successful melee attack, spend 1 Advantage to knock the target prone.',
    // ── L ───────────────────────────────────────────────────────────────────
    'Lead from the Back': 'Allies within medium range who use this character\'s Leadership skill instead of their own for Initiative checks add one Boost die to the roll.',
    'Lethal Blows': 'Add +10 to any Critical Injury roll made against opponents, per rank of Lethal Blows.',
    'Let\'s Ride': 'Once per round, may mount or dismount a vehicle or beast as an incidental rather than a maneuver.',
    'Loom': 'When making a Coercion check, may add ranks in Coercion as bonus damage to melee attacks against the same target this round.',
    // ── M ───────────────────────────────────────────────────────────────────
    'Makashi Technique': 'When making a Lightsaber check against a single opponent, may use Presence instead of Brawn. Successful hits reduce target\'s melee defense by 1 until end of round.',
    'Martial Grace': 'When making Brawl or Melee checks, may use Agility instead of Brawn to determine damage.',
    'Master Doctor': 'Once per session, perform emergency surgery using the Master Doctor action: make an Average Medicine check; on success, patient heals wounds equal to Intellect minus 1.',
    'Master Driver': 'Once per session, perform Full Throttle as an incidental.',
    'Master Grenadier': 'Remove Setback dice from checks with thrown weapons up to ranks in Master Grenadier. Add ranks as bonus damage to thrown weapon attacks.',
    'Master Instructor': 'Once per session, suffer 2 strain to give another character Boost dice equal to Presence ranks on their next check.',
    'Master of Shadows': 'When making Stealth checks, remove Setback dice equal to ranks. May use Cunning instead of Agility for Stealth.',
    'Master Pilot': 'Once per session, perform Full Throttle as an incidental.',
    'Master Strategist': 'Once per encounter, as an action make an Average Leadership check; until next turn all allies treat their Silhouette as 1 lower for the purpose of avoiding attacks.',
    'Mind Over Matter': 'Once per session, suffer 2 strain to ignore the effects of one Critical Injury for the rest of the encounter.',
    'Multiple Opponents': 'Add one Boost die to melee combat checks when engaged with two or more opponents.',
    // ── N ───────────────────────────────────────────────────────────────────
    'Natural Brawler': 'Once per session, may reroll any one Brawl check and keep the preferred result.',
    'Natural Charmer': 'Once per session, may reroll any one Charm check and keep the preferred result.',
    'Natural Commando': 'Once per session, may reroll any one Athletics check and keep the preferred result.',
    'Natural Driver': 'Once per session, may reroll any one Piloting check and keep the preferred result.',
    'Natural Hunter': 'Once per session, may reroll any one Survival check and keep the preferred result.',
    'Natural Leader': 'Once per session, may reroll any one Leadership check and keep the preferred result.',
    'Natural Mystic': 'Once per session, may reroll any one Force power check and keep the preferred result.',
    'Natural Negotiator': 'Once per session, may reroll any one Negotiation check and keep the preferred result.',
    'Natural Outdoorsman': 'Once per session, may reroll any one Survival or Athletics check in the wilderness and keep the preferred result.',
    'Natural Pilot': 'Once per session, may reroll any one Piloting check and keep the preferred result.',
    'Natural Programmer': 'Once per session, may reroll any one Computers check and keep the preferred result.',
    'Natural Rogue': 'Once per session, may reroll any one Skulduggery check and keep the preferred result.',
    'Natural Scholar': 'Once per session, may reroll any one Knowledge check and keep the preferred result.',
    'Natural Tinkerer': 'Once per session, may reroll any one Mechanics check and keep the preferred result.',
    'Niman Technique': 'May use Willpower instead of Brawn when making Lightsaber combat checks. When using a Force power with the Niman Technique active, may spend Force pips to add Advantage to the check.',
    'No Escape': 'When attacking a target who is disoriented, staggered, or prone, add one Boost die to the attack.',
    'Nobody\'s Fool': 'Upgrade the difficulty of Charm, Coercion, or Deception checks targeting this character once per rank of Nobody\'s Fool.',
    // ── O ───────────────────────────────────────────────────────────────────
    'Outdoorsman': 'Remove one Setback die per rank from Survival checks. Reduce time required to travel through natural terrain by 50% per rank.',
    // ── P ───────────────────────────────────────────────────────────────────
    'Parry': 'When hit by a melee attack while armed, suffer 3 strain to reduce damage by 2 + ranks in Parry. Must be wielding a melee weapon or unarmed.',
    'Parry (Improved)': 'When an enemy rolls Despair or 3+ Threat on a melee attack while Parry is active, may spend to immediately make a melee counter-attack as an out-of-turn incidental — this does not cost an action.',
    'Persistent Targeting': 'When the same target is attacked by this character two rounds in a row, the second attack adds one Boost die.',
    'Physical Training': 'Add Boost dice to Athletics checks and increase encumbrance threshold by 1 per rank of Physical Training.',
    'Physician': 'Remove Setback dice from Medicine checks equal to ranks of Physician. Patients recover wounds equal to this character\'s Intellect when treated.',
    'Pin': 'After a successful Brawl attack, spend 1 Advantage to prevent the target from disengaging until the start of their next turn.',
    'Plausible Deniability': 'Remove one Setback die per rank of Plausible Deniability from Coercion or Deception checks.',
    'Point Blank': 'Add +1 damage per rank of Point Blank to ranged attacks made against targets at engaged or short range.',
    'Powerful Blast': 'Increase the Blast quality rating of weapons by 2 per rank of Powerful Blast.',
    'Pre-emptive Avoidance': 'As a reaction once per round, spend 1 Destiny Point when another character moves within range; move to a new position to avoid them.',
    'Precise Aim': 'Once per round, perform the Precise Aim maneuver: suffer 1 strain to reduce the target\'s ranged defense by ranks in Precise Aim until end of turn.',
    // ── Q ───────────────────────────────────────────────────────────────────
    'Quick Draw': 'Once per round, draw or holster a weapon as an incidental rather than a maneuver.',
    'Quick Draw (Improved)': 'When using Quick Draw, may also draw a second weapon simultaneously.',
    'Quick Strike': 'Add one Boost die per rank of Quick Strike to combat checks made against any target that has not yet acted this round.',
    // ── R ───────────────────────────────────────────────────────────────────
    'Rain of Death': 'May perform a full-auto attack without suffering the normal full-auto strain penalty.',
    'Rapid Reaction': 'Suffer strain up to ranks in Rapid Reaction to add an equal number of successes to Initiative checks.',
    'Ready for Anything': 'Once per session, may move one Destiny Point from the GM pool to the players\' pool.',
    'Reconstruct the Scene': 'When attempting to analyze or reconstruct the details of a past event, make an Average Perception check. Reduce difficulty by 1 per rank of Reconstruct the Scene.',
    'Reflect': 'When hit by a ranged attack while wielding a lightsaber, suffer 3 strain to reduce damage by 2 + ranks in Reflect.',
    'Reflect (Improved)': 'When an enemy rolls Despair or 3+ Threat on a ranged attack while Reflect is active, may immediately reflect the attack back at the attacker as an out-of-turn incidental counter-attack.',
    'Researcher': 'Remove one Setback die per rank of Researcher from Knowledge checks. Halve the time needed to research a topic.',
    'Researcher (Improved)': 'When researching a topic, gain extra information or piece together clues without additional checks.',
    'Resolve': 'When suffering strain from an external source (not voluntarily), reduce the amount suffered by 1 per rank of Resolve, to a minimum of 1.',
    'Ritual Caster': 'May take an action and spend Force pips to perform ritual magic outside of combat, producing persistent supernatural effects that last for a scene.',
    // ── S ───────────────────────────────────────────────────────────────────
    'Saber Swarm': 'Commit one Force die. While committed, each hit with a Lightsaber weapon deals one additional hit, dealing base damage without any additional modifiers.',
    'Saber Throw': 'Take a Saber Throw action; spend Force pips to make a ranged Lightsaber attack at short range. The saber returns at the end of the turn.',
    'Scathing Tirade': 'Take an action; make an Average Coercion check. Each success inflicts 1 strain on each enemy within short range.',
    'Scathing Tirade (Improved)': 'Enemies suffering from Scathing Tirade are also disoriented until the end of their next turn.',
    'Scathing Tirade (Supreme)': 'Scathing Tirade may now be performed as a maneuver rather than an action.',
    'Second Chances': 'Once per session per rank of Second Chances, may reroll a number of dice equal to Cunning on a failed check.',
    'Selective Detonation': 'When activating the Blast quality, spend 1 Advantage per rank of Selective Detonation to exclude one target from the blast.',
    'Sense Advantage': 'Once per session, convert all Setback dice in one check to Boost dice instead.',
    'Sense Danger': 'Once per session, remove up to 2 Setback dice from any skill check.',
    'Sense Emotions': 'When attempting to read another character\'s emotional state or intentions, use Vigilance vs Discipline. Success reveals surface emotions or general demeanor.',
    'Sense the Scene': 'Once per encounter, make a Perception check before Initiative is rolled. On success, add one Boost die to Initiative rolls equal to successes.',
    'Shien Technique': 'May use Cunning instead of Agility when making Lightsaber combat checks. Automatically return ranged attacks to attackers on Despair or 3+ Threat.',
    'Shortcut': 'During a chase, add one Boost die per rank of Shortcut to any checks made to escape or pursue.',
    'Shortcut (Improved)': 'When using Shortcut, also upgrade ability of the relevant check once.',
    'Shroud': 'This character is unusually difficult to perceive even in plain sight. Opponents must succeed on an opposed Perception vs Stealth check to notice this character, even when not hiding.',
    'Side Step': 'Once per round, perform the Side Step maneuver: suffer 1 strain per rank to upgrade the difficulty of one incoming ranged attack.',
    'Silhouette 3': 'This character has an unusually large physical profile (Silhouette 3 — roughly the size of a large speeder or beast of burden). Attacks against them from smaller targets receive Boost dice; they treat some terrain as difficult.',
    'Skilled Jockey': 'Remove one Setback die per rank of Skilled Jockey from Piloting (Planetary) and Piloting (Space) checks.',
    'Skilled Slicer': 'Remove Setback dice from Computers checks equal to ranks. Spend 2 Advantage on a successful Computers check to perform an additional action on the same system.',
    'Skilled Teacher': 'When assisting another character, add Boost dice equal to ranks in Skilled Teacher to their check instead of the normal single Boost.',
    'Sleight of Mind': 'Add Boost dice equal to ranks of Sleight of Mind to Deception checks made to conceal Force use or other mental actions.',
    'Slippery Minded': 'When a character would force this character to perform an action or reveal information using Coercion or Deception, may make an opposed Discipline vs Coercion/Deception check to resist.',
    'Smooth Talker (Charm)': 'When making Charm checks, may spend Triumph results to add additional successes equal to the Charm ranks gained through this specialization.',
    'Smooth Talker (Coercion)': 'When making Coercion checks, treat results as if the skill ranks were one higher per rank of Smooth Talker.',
    'Smooth Talker (Deception)': 'When making Deception checks, may treat results as if rolling on a different, related social skill.',
    'Smooth Talker (Negotiation)': 'When making Negotiation checks, may use Deception instead and treat results as Negotiation.',
    'Soft Spot': 'After making a successful attack, spend 2 Advantage to ignore half of the target\'s total soak (rounded down) for that hit.',
    'Solid Repairs': 'When repairing hull trauma, restore 1 additional hull trauma per rank of Solid Repairs.',
    'Soresu Technique': 'May use Intellect instead of Brawn when making Lightsaber combat checks. When performing a Parry incidental, the character may reduce the damage of the triggering hit by an additional 2.',
    'Spare Clip': 'Weapons with the Limited Ammo quality do not run out of ammo when a Despair is rolled.',
    'Speaks Binary': 'May communicate with and give orders to droids without a translator. Add Boost dice to social checks with droids per rank of Speaks Binary.',
    'Spitfire': 'When making a full-auto ranged attack, add one Boost die per rank of Spitfire to the check.',
    'Stalker': 'Add one Boost die per rank of Stalker to Stealth and Coordination checks.',
    'Stand Firm': 'When suffering a knockdown result, may spend 1 Destiny Point to remain standing.',
    'Starship Adversary': 'Upgrade the difficulty of any combat checks targeting the vehicle this character pilots once per rank of Starship Adversary.',
    'Steely Nerves': 'Suffer 1 strain to ignore the effect of one ongoing Critical Injury for a number of rounds equal to ranks in Steely Nerves.',
    'Stimpack Specialisation': 'Stimpacks heal 1 additional wound per rank of Stimpack Specialisation when used on this character or a patient this character treats.',
    'Street Smarts': 'Remove Setback dice from Streetwise and Knowledge (Underworld) checks equal to ranks in Street Smarts.',
    'Stroke of Genius': 'Once per session, may use an action and make a Hard Intellect check. On success, gain one relevant piece of information about the current problem — equivalent to spending 2 Advantages.',
    'Strong Arm': 'Treat weapons with the Limited Ammo or Slow-Firing quality as having one additional rank of Reliable.',
    'Stunning Blow': 'When making a melee attack, spend 1 Advantage to deal damage as strain instead of wounds.',
    'Stunning Blow (Improved)': 'When Stunning Blow is activated, the target is also disoriented until the end of their next turn.',
    'Surgeon': 'Remove one Setback die per rank of Surgeon from Medicine checks made to heal wounds. Patients heal one additional wound per rank during natural recovery.',
    'Swift': 'Do not suffer the movement penalties for moving through difficult or hazardous terrain.',
    // ── T ───────────────────────────────────────────────────────────────────
    'Tactical Direction': 'Once per round, take a Tactical Direction maneuver; an ally within medium range may immediately perform one free action on their next turn.',
    'Targeted Blow': 'After a successful melee attack, spend 1 Advantage to add Agility ranks as additional damage.',
    'Technical Aptitude': 'Reduce time needed to make Computers checks by 50% per rank of Technical Aptitude. Remove one Setback die from Computers checks per rank.',
    'The Force is My Ally': 'Once per session, commit Force dice up to Force Rating. While committed, add equal number of Boost dice to all checks.',
    'Thorough Assessment': 'Make a Hard Perception or Knowledge check to fully assess a scene, vehicle, or target. On success, gain Boost dice for all subsequent related checks equal to successes.',
    'Time to Go': 'Once per round, when an ally within short range is targeted by a combat check, may move to their position and intercept — the attack targets this character instead.',
    'Tinkerer': 'May add one additional non-stackable mod slot to a number of items equal to ranks in Tinkerer per session.',
    'Touch of Fate': 'Once per session, add two Boost dice to any one check.',
    'Toughness': 'Increase wound threshold by 2 per rank of Toughness.',
    'True Aim': 'Once per round, take the True Aim maneuver; suffer 1 strain. May activate up to ranks in True Aim per round. Upgrade ability of the next ranged combat check once per activation.',
    'Trust No One': 'When subject to a social manipulation check, add Boost dice to the opposed check equal to ranks in Trust No One.',
    // ── U ───────────────────────────────────────────────────────────────────
    'Unarmed Parry': 'When hit by a melee attack while unarmed, suffer 3 strain to reduce damage by 2 + ranks in Unarmed Parry. Does not require a weapon.',
    'Uncanny Reactions': 'Add one Boost die per rank of Uncanny Reactions to all Vigilance checks.',
    'Uncanny Senses': 'Add one Boost die per rank of Uncanny Senses to all Perception checks.',
    'Up the Ante': 'When gambling or bluffing, add Boost dice equal to ranks of Up the Ante. May spend Triumph to gain credits or social advantage.',
    'Utinni!': 'When selling salvage or scavenged parts, increase selling price by 10% per rank. Remove Setback dice from checks to find specific items in junkyards or black markets.',
    // ── V ───────────────────────────────────────────────────────────────────
    'Valuable Facts': 'Once per session, may reveal a "valuable fact" about the current scene or encounter. Gain 1 Destiny Point if the fact helps resolve a situation.',
    // ── W ───────────────────────────────────────────────────────────────────
    'Wheel and Deal': 'When selling goods or services legally, gain an additional 10% of the base price per rank of Wheel and Deal.',
    'Works Like a Charm': 'Once per session, when an item with a Limited Ammo or Slow-Firing quality would malfunction, it does not.'
};
const TALENT_ACTIVATION = {
    'Parry': 'out of turn',
    'Parry (Improved)': 'out of turn',
    'Reflect': 'out of turn',
    'Reflect (Improved)': 'out of turn',
    'Improved Parry': 'out of turn',
    'Improved Reflect': 'out of turn',
    'Unarmed Parry': 'out of turn',
    'Dodge': 'out of turn',
    'Improved Dodge': 'out of turn',
    'Side Step': 'maneuver',
    'Body Guard': 'maneuver',
    'Coordinated Assault': 'maneuver',
    'Frenzied Attack': 'maneuver',
    'Brace': 'maneuver',
    'True Aim': 'maneuver',
    'Hawk Bat Swoop': 'maneuver',
    'Quick Draw': 'incidental',
    'Jump Up': 'incidental',
    'Intense Focus': 'maneuver',
    'Pre-emptive Avoidance': 'out of turn',
    'Let\'s Ride': 'incidental',
    'Field Commander': 'action',
    'Field Commander (Improved)': 'action',
    'Scathing Tirade': 'action',
    'Scathing Tirade (Improved)': 'action',
    'Scathing Tirade (Supreme)': 'maneuver',
    'Inspiring Rhetoric': 'action',
    'Inspiring Rhetoric (Improved)': 'action',
    'Inspiring Rhetoric (Supreme)': 'maneuver',
    'Full Throttle': 'action',
    'Full Throttle (Improved)': 'action',
    'Full Throttle (Supreme)': 'incidental',
    'Brilliant Evasion': 'action',
    'Saber Throw': 'action',
    'Master Doctor': 'action',
    'Stroke of Genius': 'action',
    'Clever Commander': 'action',
    'Incite Rebellion': 'action',
    'Know the Enemy': 'action',
    'Tactical Direction': 'maneuver',
    'Time to Go': 'out of turn',
    'Crippling Blow': 'active',
    'Knockdown': 'active',
    'Soft Spot': 'active',
    'Anatomy Lessons': 'active',
    'Dead to Rights': 'active',
    'Targeted Blow': 'active',
    'Feint': 'active',
    'Fire Control': 'active',
    'Barrage': 'passive',
    'Point Blank': 'passive',
    'Lethal Blows': 'passive',
    'Adversary': 'passive',
    'Enduring': 'passive',
    'Durable': 'passive',
    'Toughness': 'passive',
    'Soresu Technique': 'passive',
    'Ataru Technique': 'passive',
    'Makashi Technique': 'passive',
    'Shien Technique': 'passive',
    'Niman Technique': 'passive',
    'Force Rating': 'passive',
    'Feral Strength': 'passive',
    'Quick Strike': 'passive',
    'Stalker': 'passive',
    'Swift': 'passive',
    'Finesse': 'passive',
    'Shroud': 'passive',
    'Natural Charmer': 'incidental',
    'Natural Negotiator': 'incidental',
    'Natural Leader': 'incidental',
    'Natural Hunter': 'incidental',
    'Natural Pilot': 'incidental',
    'Natural Brawler': 'incidental',
    'Natural Commando': 'incidental',
    'Natural Rogue': 'incidental',
    'Natural Mystic': 'incidental',
    'Natural Tinkerer': 'incidental',
    'Natural Driver': 'incidental',
    'Natural Outdoorsman': 'incidental',
    'Natural Programmer': 'incidental',
    'Natural Scholar': 'incidental',
    'Touch of Fate': 'incidental',
    'Intense Presence': 'incidental',
    'Sense Danger': 'incidental',
    'Sense Advantage': 'incidental',
    'Ready for Anything': 'incidental',
    'Spare Clip': 'incidental',
    'Stand Firm': 'incidental',
    'Steely Nerves': 'incidental',
    'Hard Headed': 'action',
    'Stunning Blow': 'active',
    'Stunning Blow (Improved)': 'active',
    'Pin': 'active',
    'Grapple': 'active',
    'Draw Closer': 'active',
    'Drive Back': 'active'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/adversaries.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CHAR_KEY_TO_FIELD",
    ()=>CHAR_KEY_TO_FIELD,
    "CHAR_KEY_TO_NAME",
    ()=>CHAR_KEY_TO_NAME,
    "CHAR_NAME_TO_KEY",
    ()=>CHAR_NAME_TO_KEY,
    "adversaryToInstance",
    ()=>adversaryToInstance,
    "fetchAdversaries",
    ()=>fetchAdversaries
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$abilities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/adversary-abilities.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$talents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/adversary-talents.ts [app-client] (ecmascript)");
;
;
const CHAR_NAME_TO_KEY = {
    'Brawn': 'BR',
    'Agility': 'AGI',
    'Intellect': 'INT',
    'Cunning': 'CUN',
    'Willpower': 'WIL',
    'Presence': 'PR'
};
const CHAR_KEY_TO_NAME = {
    'BR': 'Brawn',
    'AGI': 'Agility',
    'INT': 'Intellect',
    'CUN': 'Cunning',
    'WIL': 'Willpower',
    'PR': 'Presence'
};
const CHAR_KEY_TO_FIELD = {
    'BR': 'brawn',
    'AGI': 'agility',
    'INT': 'intellect',
    'CUN': 'cunning',
    'WIL': 'willpower',
    'PR': 'presence'
};
const ADVERSARY_URL = '/adversaries.json';
// Parse weapon string from new repo format:
// "Blaster pistol (Ranged [Light]; Damage 5; Critical 3; Range [Medium]; Stun setting)"
// "Claws (Brawn+2; Critical 4; Range [Engaged]; Knockdown)"
function parseWeaponString(raw) {
    const name = raw.replace(/\s*\(.*/, '').trim() || raw;
    let damage = 0;
    let range = 'Engaged';
    let crit;
    const qualities = [];
    let skillCategory;
    const parenMatch = raw.match(/\(([^)]+)\)/);
    if (parenMatch) {
        for (const part of parenMatch[1].split(/;\s*/)){
            const p = part.trim();
            const dmgMatch = p.match(/^Damage\s+(\d+)$/i);
            if (dmgMatch) {
                damage = parseInt(dmgMatch[1]);
                continue;
            }
            const brawnMatch = p.match(/^Brawn([+-]\d+)$/i);
            if (brawnMatch) {
                damage = `Brawn${brawnMatch[1]}`;
                continue;
            }
            const critMatch = p.match(/^Critical\s+(\d+)$/i);
            if (critMatch) {
                crit = parseInt(critMatch[1]);
                continue;
            }
            const rangeMatch = p.match(/^Range\s+\[([^\]]+)\]$/i);
            if (rangeMatch) {
                range = rangeMatch[1];
                continue;
            }
            const skillCatMatch = p.match(/^(Ranged|Melee)\s+\[([^\]]+)\]$/i);
            if (skillCatMatch) {
                skillCategory = p;
                continue;
            }
            qualities.push(p);
        }
    }
    return {
        name,
        damage,
        range,
        ...crit !== undefined ? {
            crit
        } : {},
        skillCategory,
        qualities: qualities.length > 0 ? qualities : undefined
    };
}
// Normalize raw API data to our Adversary type
// Handles both old format (flat lowercase keys) and new repo format (characteristics object + derived object)
function normalize(raw) {
    const chars = raw.characteristics ?? {};
    const derived = raw.derived ?? {};
    // Characteristics: new format uses capitalized keys inside characteristics{}; old format uses flat lowercase
    const stat = (key)=>Number(chars[key] ?? chars[key[0].toUpperCase() + key.slice(1)] ?? raw[key] ?? 2);
    const defense = Array.isArray(raw.defense) ? raw.defense : typeof raw.defense === 'object' && raw.defense ? [
        Number(raw.defense.melee ?? 0),
        Number(raw.defense.ranged ?? 0)
    ] : [
        0,
        0
    ];
    const typeRaw = String(raw.type ?? '').toLowerCase();
    const type = [
        'minion',
        'rival',
        'nemesis'
    ].includes(typeRaw) ? typeRaw : 'rival';
    // Weapons: new format is string[], old format is AdversaryWeapon[]
    // Object-format weapons may carry a `plus-damage` field (Brawn modifier) instead of
    // a flat `damage` number — normalise it to the "Brawn+N" string that resolveWeapon understands.
    const weapons = Array.isArray(raw.weapons) ? raw.weapons.map((w)=>{
        if (typeof w === 'string') return parseWeaponString(w);
        const wo = w;
        const critVal = wo['critical'] !== undefined ? {
            crit: Number(wo['critical'])
        } : {};
        if (wo['plus-damage'] !== undefined) {
            const bonus = Number(wo['plus-damage']);
            return {
                ...wo,
                ...critVal,
                damage: `Brawn${bonus >= 0 ? '+' : ''}${bonus}`
            };
        }
        return {
            ...wo,
            ...critVal
        };
    }) : [];
    // Skills: rivals/nemeses use object { Cool: 4, Lightsaber (Intellect): 5 }, minions use string[]
    // For Lightsaber (X) entries: strip the parenthetical, normalise key to 'Lightsaber', record override.
    const skillRanks = {};
    const characteristicOverrides = {};
    if (raw.skills && !Array.isArray(raw.skills) && typeof raw.skills === 'object') {
        for (const [k, v] of Object.entries(raw.skills)){
            const lsMatch = k.match(/^Lightsaber\s*\((\w+)\)$/i);
            if (lsMatch) {
                const charName = lsMatch[1];
                const charKey = CHAR_NAME_TO_KEY[charName];
                if (charKey && charKey !== 'BR') {
                    characteristicOverrides['Lightsaber'] = charKey;
                }
                skillRanks['Lightsaber'] = Number(v);
            } else {
                skillRanks[k] = Number(v);
            }
        }
    } else if (Array.isArray(raw.skills)) {
        for (const s of raw.skills){
            skillRanks[String(s)] = 1;
        }
    }
    return {
        ...raw,
        id: String(raw.id ?? raw.name ?? Math.random()),
        name: String(raw.name ?? 'Unknown'),
        type,
        brawn: stat('brawn'),
        agility: stat('agility'),
        intellect: stat('intellect'),
        cunning: stat('cunning'),
        willpower: stat('willpower'),
        presence: stat('presence'),
        soak: Number(derived.soak ?? raw.soak ?? 0),
        wound: Number(derived.wounds ?? derived.wound ?? raw.wound ?? raw.wounds ?? raw.woundThreshold ?? 10),
        strain: derived.strain !== undefined ? Number(derived.strain) : raw.strain !== undefined ? Number(raw.strain) : undefined,
        defense,
        skills: Array.isArray(raw.skills) ? raw.skills : Object.keys(skillRanks),
        skillRanks,
        characteristicOverrides: Object.keys(characteristicOverrides).length > 0 ? characteristicOverrides : undefined,
        talents: Array.isArray(raw.talents) ? raw.talents.map((t)=>{
            if (typeof t === 'string') {
                const base = t.replace(/\s+\d+$/, '').trim();
                const desc = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$talents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TALENT_DESCRIPTIONS"][t] ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$talents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TALENT_DESCRIPTIONS"][base] ?? '';
                const activation = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$talents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TALENT_ACTIVATION"][t] ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$talents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TALENT_ACTIVATION"][base] ?? 'passive';
                return {
                    name: t,
                    description: desc,
                    activation
                };
            }
            const obj = t;
            const base = obj.name.replace(/\s+\d+$/, '').trim();
            return {
                ...obj,
                description: obj.description || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$talents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TALENT_DESCRIPTIONS"][obj.name] || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$talents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TALENT_DESCRIPTIONS"][base] || '',
                activation: obj.activation || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$talents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TALENT_ACTIVATION"][obj.name] || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$talents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TALENT_ACTIVATION"][base] || 'passive'
            };
        }) : [],
        abilities: Array.isArray(raw.abilities) ? raw.abilities.map((ab)=>{
            if (typeof ab === 'string') {
                return {
                    name: ab,
                    description: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$abilities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ABILITY_DESCRIPTIONS"][ab] ?? ''
                };
            }
            const obj = ab;
            // Fill in description from lookup if the embedded one is empty
            return {
                name: obj.name,
                description: obj.description || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversary$2d$abilities$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ABILITY_DESCRIPTIONS"][obj.name] || ''
            };
        }) : [],
        weapons,
        gear: Array.isArray(raw.gear) ? raw.gear.map((g)=>typeof g === 'string' ? {
                name: g,
                encumbrance: '',
                description: ''
            } : g) : []
    };
}
let _cache = null;
async function fetchAdversaries() {
    if (_cache) return _cache;
    const res = await fetch(ADVERSARY_URL);
    if (!res.ok) throw new Error(`Failed to fetch adversaries: ${res.status}`);
    const raw = await res.json();
    _cache = raw.map(normalize);
    return _cache;
}
function adversaryToInstance(adv, groupSize = 4) {
    return {
        instanceId: `${adv.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sourceId: adv.id,
        name: adv.name,
        type: adv.type,
        groupSize: adv.type === 'minion' ? groupSize : 1,
        groupRemaining: adv.type === 'minion' ? groupSize : 1,
        revealed: false,
        characteristics: {
            brawn: adv.brawn,
            agility: adv.agility,
            intellect: adv.intellect,
            cunning: adv.cunning,
            willpower: adv.willpower,
            presence: adv.presence
        },
        soak: adv.soak,
        woundThreshold: adv.wound,
        strainThreshold: adv.strain,
        defense: {
            melee: Array.isArray(adv.defense) ? adv.defense[0] ?? 0 : 0,
            ranged: Array.isArray(adv.defense) ? adv.defense[1] ?? 0 : 0
        },
        skills: adv.skills ?? [],
        skillRanks: adv.skillRanks ?? {},
        characteristicOverrides: adv.characteristicOverrides,
        talents: adv.talents ?? [],
        abilities: adv.abilities ?? [],
        weapons: adv.weapons ?? [],
        gear: adv.gear ?? []
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/logRoll.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "logRoll",
    ()=>logRoll
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
;
function logRoll({ campaignId, characterId, characterName, label, pool, result, isDM = false, hidden = false, meta }) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = {
        campaign_id: campaignId,
        character_id: characterId,
        character_name: characterName,
        roll_label: label ?? null,
        pool,
        result: {
            netSuccess: result.net.success,
            netAdvantage: result.net.advantage,
            triumph: result.net.triumph,
            despair: result.net.despair,
            succeeded: result.net.success > 0
        },
        is_dm: isDM,
        hidden
    };
    if (meta?.rollType) payload.roll_type = meta.rollType;
    if (meta?.weaponName) payload.weapon_name = meta.weaponName;
    if (meta?.targetName) payload.target_name = meta.targetName;
    if (meta?.rangeBand) payload.range_band = meta.rangeBand;
    if (meta?.alignment) payload.alignment = meta.alignment;
    if (meta?.weaponDamage != null || meta?.weaponDamageAdd != null || meta?.characterBrawn != null || meta?.attackType || meta?.critEligible != null || meta?.critRating != null || meta?.critModifier != null) {
        payload.roll_meta = {
            ...meta.weaponDamage != null ? {
                weaponDamage: meta.weaponDamage
            } : {},
            ...meta.weaponDamageAdd != null ? {
                weaponDamageAdd: meta.weaponDamageAdd
            } : {},
            ...meta.characterBrawn != null ? {
                characterBrawn: meta.characterBrawn
            } : {},
            ...meta.attackType ? {
                attackType: meta.attackType
            } : {},
            ...meta.critEligible != null ? {
                critEligible: meta.critEligible
            } : {},
            ...meta.critRating != null ? {
                critRating: meta.critRating
            } : {},
            ...meta.critModifier != null ? {
                critModifier: meta.critModifier
            } : {}
        };
    }
    supabase.from('roll_log').insert(payload).then(({ error })=>{
        if (error) console.warn('[logRoll] failed:', error.message);
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/equipment-icons.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Category-to-fallback icon mapping constants.
 * Maps OggDude weapon categories, armor categories, and gear types
 * to their corresponding SVG fallback icon names in /images/fallback/.
 */ __turbopack_context__.s([
    "ARMOR_FALLBACK_MAP",
    ()=>ARMOR_FALLBACK_MAP,
    "GEAR_TYPE_FALLBACK_MAP",
    ()=>GEAR_TYPE_FALLBACK_MAP,
    "GENERIC_FALLBACK",
    ()=>GENERIC_FALLBACK,
    "WEAPON_FALLBACK_MAP",
    ()=>WEAPON_FALLBACK_MAP,
    "resolveFallbackIcon",
    ()=>resolveFallbackIcon
]);
const WEAPON_FALLBACK_MAP = {
    'Blaster Pistol': 'blaster-pistol',
    'Heavy Blaster Pistol': 'blaster-pistol',
    'Holdout Blaster': 'blaster-pistol',
    'Pistol': 'blaster-pistol',
    'Blaster Rifle': 'blaster-rifle',
    'Heavy Blaster Rifle': 'blaster-rifle',
    'Rifle': 'blaster-rifle',
    'Heavy Rifle': 'blaster-rifle',
    'Carbine': 'blaster-rifle',
    'Heavy Blaster Carbine': 'blaster-rifle',
    'Blaster Carbine': 'blaster-rifle',
    'Heavy Carbine': 'blaster-rifle',
    'Blaster': 'blaster-rifle',
    'Lightsaber': 'lightsaber',
    'Lightsaber Hilt': 'lightsaber',
    'Cutting Edge Melee': 'melee-blade',
    'Ancient Relics': 'melee-blade',
    'Bludgeoning Melee': 'melee-blunt',
    'Bludgeoning Brawl': 'melee-blunt',
    'Powered Melee': 'melee-blunt',
    'Powered Brawl': 'melee-blunt',
    'Grenade': 'grenade',
    'Explosive': 'grenade',
    'Mine': 'mine',
    'Space Mine': 'mine',
    'Missile': 'missile',
    'Rocket': 'missile',
    'Micro-Rocket': 'missile',
    'Proton Torpedo': 'missile',
    'Proton Bomb': 'missile',
    'Portable Gunnery': 'heavy-weapon',
    'Flak': 'heavy-weapon',
    'Suppression': 'heavy-weapon',
    'Bow': 'bow',
    'Bowcaster': 'bow',
    'Beamdrill': 'beam',
    'Laser': 'beam',
    'Ion': 'beam',
    'Tractor': 'beam',
    'Shield': 'shield',
    'Whip': 'whip',
    'Ranged': 'ranged-generic'
};
const ARMOR_FALLBACK_MAP = {
    'Full Body': 'armor-heavy',
    'Hard': 'armor-heavy',
    'Heavy': 'armor-heavy',
    'Half Body': 'armor-light',
    'Light': 'armor-light',
    'Resistant': 'armor-light',
    'Sealable': 'armor-sealed',
    'Sealed': 'armor-sealed'
};
const GEAR_TYPE_FALLBACK_MAP = {
    'Medical': 'gear-medical',
    'Antidotes': 'gear-medical',
    'Drugs and Consumables': 'gear-medical',
    'Poisons': 'gear-medical',
    'Tools/Electronics': 'gear-tool',
    'Construction/Salvage Tools': 'gear-tool',
    'Slicing Tools': 'gear-tool',
    'Communications': 'gear-comms',
    'Cybernetics': 'gear-cybernetic',
    'Security/Espionage': 'gear-security',
    'Detection/Surveillance Devices': 'gear-security',
    'Carrying/Storage': 'gear-storage',
    'Survival': 'gear-survival',
    'Droids': 'gear-droid',
    'Remotes': 'gear-droid',
    'Holocrons/Ancient Lore': 'gear-holocron',
    'Ancient Talismans': 'gear-holocron',
    'Alchemical Potion': 'gear-holocron',
    'Alchemical Talisman': 'gear-holocron',
    'Focuses, Fetishes, and Figurines': 'gear-holocron',
    'Luxury Items': 'gear-luxury',
    'Entertainment': 'gear-luxury',
    'Award/Medal': 'gear-luxury',
    'Trophies': 'gear-luxury',
    'Uniforms and Accessories': 'gear-luxury',
    'Reloads/Ammo': 'gear-ammo',
    'Riding Beasts': 'gear-beast',
    'Trainable Beasts': 'gear-beast',
    'Black Market': 'gear-blackmarket',
    'Slaver Tech': 'gear-blackmarket',
    'Generic': 'gear-generic'
};
const GENERIC_FALLBACK = {
    weapon: 'weapon-generic',
    armor: 'armor-generic',
    gear: 'gear-generic'
};
function resolveFallbackIcon(itemType, categories, gearType) {
    if (itemType === 'weapon' && categories) {
        for (const cat of categories){
            if (WEAPON_FALLBACK_MAP[cat]) return WEAPON_FALLBACK_MAP[cat];
        }
    }
    if (itemType === 'armor' && categories) {
        for (const cat of categories){
            if (ARMOR_FALLBACK_MAP[cat]) return ARMOR_FALLBACK_MAP[cat];
        }
    }
    if (itemType === 'gear') {
        if (gearType && GEAR_TYPE_FALLBACK_MAP[gearType]) {
            return GEAR_TYPE_FALLBACK_MAP[gearType];
        }
        if (categories) {
            for (const cat of categories){
                if (GEAR_TYPE_FALLBACK_MAP[cat]) return GEAR_TYPE_FALLBACK_MAP[cat];
            }
        }
    }
    return GENERIC_FALLBACK[itemType] || 'gear-generic';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/forceRoll.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Force die rolling — thin re-export over dice-engine so overlay code
 * has a stable import path that does not depend on the HUD module tree.
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/dice-engine.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/forceUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAvailableForceRating",
    ()=>getAvailableForceRating,
    "getFreeForceAlignment",
    ()=>getFreeForceAlignment,
    "isDarkSideFallen",
    ()=>isDarkSideFallen,
    "isForceUserSensitive",
    ()=>isForceUserSensitive
]);
function isForceUserSensitive(character, computedForceRating) {
    const rating = computedForceRating ?? character.force_rating ?? 0;
    return rating >= 1;
}
function getAvailableForceRating(character, computedForceRating) {
    const total = computedForceRating ?? character.force_rating ?? 0;
    const committed = character.force_rating_committed ?? 0;
    return Math.max(0, total - committed);
}
function isDarkSideFallen(character) {
    return character.is_dark_side_fallen === true;
}
function getFreeForceAlignment(character) {
    if (character.species_key && [
        'DATHOMIRIAN',
        'NIGHTSISTER',
        'DATHOMIRI'
    ].includes(character.species_key.toUpperCase())) {
        return 'both';
    }
    return isDarkSideFallen(character) ? 'dark' : 'light';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/tooltips/skillDescriptions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Static tooltip descriptions for all 36 FFG Star Wars skills */ __turbopack_context__.s([
    "SKILL_TIPS",
    ()=>SKILL_TIPS,
    "getSkillTip",
    ()=>getSkillTip
]);
const SKILL_TIPS = {
    // ── GENERAL ─────────────────────────────────────
    Astrogation: {
        description: 'Plotting hyperspace jump routes and navigating the galaxy. A failed check can result in a misjump into an obstacle or the deep unknown.',
        examples: [
            'Calculate a jump to Coruscant (Easy)',
            'Astrogate through the Kessel Run (Daunting)',
            'Escape an Interdiction field (Hard)'
        ]
    },
    Athletics: {
        description: 'Raw physical activity: running, climbing, swimming, jumping. Used whenever the body is pushed to its limits.',
        examples: [
            'Sprint across a catwalk (Easy)',
            'Climb a sheer durasteel wall (Hard)',
            'Swim against a strong current (Average)'
        ]
    },
    Brawl: {
        description: 'Unarmed combat using fists, knees, elbows, or improvised body parts. Deals Brawn+0 damage, Engaged range.',
        examples: [
            'Throw a punch (Average)',
            'Grapple an opponent (Average)',
            'Deliver a headbutt (Easy)'
        ]
    },
    Charm: {
        description: 'Making a friendly impression through compliments, wit, and likability. Works best on targets who are already neutral or positive toward you.',
        examples: [
            'Talk your way past a guard (Easy)',
            'Negotiate a discount (Average)',
            'Convince a crime lord to trust you (Hard)'
        ]
    },
    Coercion: {
        description: 'Persuasion through threats, intimidation, and fear. Creates Conflict. May work quickly but leaves long-term resentment.',
        examples: [
            'Intimidate a thug (Easy)',
            'Threaten a bureaucrat (Average)',
            'Break a prisoner\'s will (Hard)'
        ]
    },
    Computers: {
        description: 'Slicing, programming, and operating computer systems — from cracking datapads to controlling starship systems.',
        examples: [
            'Access a security terminal (Easy)',
            'Slice an Imperial database (Hard)',
            'Override a lockdown (Daunting)'
        ]
    },
    Cool: {
        description: 'Remaining calm under pressure and acting first in tense standoffs. Used to determine Initiative in non-combat encounters.',
        examples: [
            'Calm Initiative roll',
            'Resist social pressure (Average)',
            'Maintain composure while bluffing (Average)'
        ]
    },
    Coordination: {
        description: 'Balance, flexibility, tumbling, and acrobatic maneuvers. Useful for escaping grapples and navigating hazardous terrain.',
        examples: [
            'Tumble through a closing blast door (Average)',
            'Walk a tightrope (Easy)',
            'Land after a fall (Hard)'
        ]
    },
    Deception: {
        description: 'Lying, bluffing, and creating false impressions. Contested by the target\'s Perception or Discipline.',
        examples: [
            'Lie to a questioning officer (Average)',
            'Maintain a cover identity (Hard)',
            'Bluff past a checkpoint (Average)'
        ]
    },
    Discipline: {
        description: 'Willpower and mental fortitude. Resists fear, manipulation, and Force-induced effects. Also governs Initiative in combat.',
        examples: [
            'Combat Initiative roll',
            'Resist a mind-affecting Force power (Hard)',
            'Stay calm while being tortured (Daunting)'
        ]
    },
    Leadership: {
        description: 'Directing allies, organizing groups, and inspiring others. A strong leader can grant extra actions or boost morale.',
        examples: [
            'Rally fleeing allies (Average)',
            'Coordinate a squad assault (Hard)',
            'Inspire civilians to resist (Daunting)'
        ]
    },
    Lore: {
        description: 'Academic knowledge of history, culture, religions, and the Force. Covers galactic history and ancient civilizations.',
        examples: [
            'Recall Imperial history (Easy)',
            'Identify a Sith artifact (Hard)',
            'Translate Old Republic runes (Daunting)'
        ]
    },
    Mechanics: {
        description: 'Repairing, modifying, and building mechanical and electronic systems — from speeders to starships.',
        examples: [
            'Patch a hyperdrive (Average)',
            'Rig an explosive (Easy)',
            'Build a custom weapon mod (Hard)'
        ]
    },
    Medicine: {
        description: 'Diagnosing and treating injuries, disease, and poisons. Restores Wounds and removes Critical Injuries.',
        examples: [
            'Patch a blaster wound (Easy)',
            'Perform surgery (Hard)',
            'Synthesize an antitoxin (Daunting)'
        ]
    },
    Melee: {
        description: 'One- and two-handed melee weapons: vibroswords, vibroknives, clubs, stun batons. Engaged range.',
        examples: [
            'Strike with a vibroblade (Average)',
            'Parry an attack (Average)',
            'Dual-wield vibroblades (Hard)'
        ]
    },
    Negotiation: {
        description: 'Formal bargaining, deal-making, and trade. Unlike Charm, Negotiation is transactional — both parties want something.',
        examples: [
            'Haggle over cargo price (Average)',
            'Broker a peace deal (Hard)',
            'Arrange a prisoner exchange (Average)'
        ]
    },
    Perception: {
        description: 'Noticing environmental details, hidden threats, and lies. Opposed by Stealth or Deception.',
        examples: [
            'Spot an ambush (Average)',
            'Detect a concealed weapon (Hard)',
            'See through a disguise (Daunting)'
        ]
    },
    Piloting_Planetary: {
        description: 'Operating atmospheric and ground vehicles: speeders, walkers, submarines. Used within planetary atmospheres.',
        examples: [
            'Chase through Mos Eisley (Average)',
            'Perform a stunt maneuver (Hard)',
            'Escape in a stolen speeder (Easy)'
        ]
    },
    Piloting_Space: {
        description: 'Operating starships in space: capital ships, fighters, freighters. Used in ship combat and astro-maneuvers.',
        examples: [
            'Evade a TIE squadron (Hard)',
            'Dock with a space station (Easy)',
            'Fly through an asteroid field (Daunting)'
        ]
    },
    Resilience: {
        description: 'Physical endurance and resistance to toxins, extreme environments, and physical exhaustion. Determines Wound Threshold.',
        examples: [
            'Survive a firefight in extreme heat (Average)',
            'Resist a poison (Hard)',
            'March for 48 hours without rest (Hard)'
        ]
    },
    Skulduggery: {
        description: 'Criminal tradecraft: lock-picking, pickpocketing, sleight of hand, forgery, and general shady activity.',
        examples: [
            'Pick a basic lock (Easy)',
            'Pickpocket a mark (Average)',
            'Bypass a security door (Hard)'
        ]
    },
    Stealth: {
        description: 'Moving unseen and unheard. Opposed by the target\'s Perception. Encumbrance penalties can apply.',
        examples: [
            'Sneak past a sentry (Average)',
            'Shadow a target through a crowd (Hard)',
            'Infiltrate an Imperial facility (Daunting)'
        ]
    },
    Streetwise: {
        description: 'Knowledge of the urban underworld: criminal contacts, black markets, gang territories, and criminal customs.',
        examples: [
            'Find a fence for stolen goods (Easy)',
            'Locate a smuggler\'s contact (Average)',
            'Navigate Hutt space politics (Hard)'
        ]
    },
    Survival: {
        description: 'Wilderness navigation, tracking, foraging, and enduring harsh natural environments. Keeps you alive in the field.',
        examples: [
            'Track quarry across Tatooine (Average)',
            'Find water in a jungle (Easy)',
            'Survive a rancor attack (Daunting)'
        ]
    },
    Vigilance: {
        description: 'Awareness of your surroundings and readiness for sudden danger. Used for surprise Initiative checks in ambushes.',
        examples: [
            'Surprise Initiative roll',
            'Detect a trap (Average)',
            'Notice someone following you (Hard)'
        ]
    },
    // ── KNOWLEDGE ───────────────────────────────────
    Education: {
        description: 'Formal academic learning: science, mathematics, engineering theory, and general scholarly knowledge.',
        examples: [
            'Recall Imperial regulations (Easy)',
            'Understand a technical schematic (Average)',
            'Hack a classified research archive (Hard)'
        ]
    },
    Outer_Rim: {
        description: 'Knowledge of the Outer Rim Territories: planets, factions, local customs, trade routes, and hidden outposts.',
        examples: [
            'Know a safe planet to hide on (Easy)',
            'Identify a Hutt cartel by symbol (Average)',
            'Navigate Black Sun territories (Hard)'
        ]
    },
    Underworld: {
        description: 'Knowledge of criminal organisations, the black market, contraband, and the people who move illegal goods.',
        examples: [
            'Identify spice by type (Easy)',
            'Know a crime boss\'s reputation (Average)',
            'Understand cartel codes (Hard)'
        ]
    },
    Warfare: {
        description: 'Military tactics, strategy, unit organization, and the history of conflicts across the galaxy.',
        examples: [
            'Assess enemy troop disposition (Average)',
            'Plan a flanking assault (Hard)',
            'Counter an Imperial formation (Daunting)'
        ]
    },
    Xenology: {
        description: 'Knowledge of alien species, their biology, culture, languages, and customs throughout the galaxy.',
        examples: [
            'Identify a species by appearance (Easy)',
            'Understand Wookiee customs (Average)',
            'Communicate with a rare species (Hard)'
        ]
    },
    // ── COMBAT (ranged) ─────────────────────────────
    Gunnery: {
        description: 'Operating heavy mounted weapons: starship cannons, vehicle weapons, and emplaced turrets.',
        examples: [
            'Fire a quad laser at a fighter (Average)',
            'Hit a moving capital ship (Hard)',
            'Destroy a shield generator (Daunting)'
        ]
    },
    Ranged_Heavy: {
        description: 'Heavy ranged weapons held by the character: blaster rifles, heavy blasters, missile launchers, and repeating blasters.',
        examples: [
            'Shoot a stormtrooper (Easy)',
            'Snipe at long range (Hard)',
            'Fire a rocket launcher (Average)'
        ]
    },
    Ranged_Light: {
        description: 'Light one-handed ranged weapons: blaster pistols, hold-out blasters, and slings.',
        examples: [
            'Draw and fire a blaster pistol (Easy)',
            'Shoot while in cover (Average)',
            'Hip-fire during a chase (Hard)'
        ]
    },
    // ── FORCE ────────────────────────────────────────
    Lightsaber: {
        description: 'Combat with a lightsaber (or other Force-imbued weapon). Uses the character\'s highest Force-related characteristic.',
        examples: [
            'Strike with a lightsaber (Average)',
            'Deflect a blaster bolt (Hard)',
            'Duel another Force-user (Daunting)'
        ]
    }
};
function getSkillTip(name) {
    // Try direct lookup first
    if (SKILL_TIPS[name]) return SKILL_TIPS[name];
    // Normalise: replace spaces/( /) with underscores, drop special chars
    const key = name.replace(/\s*\(.*?\)/g, '') // drop (Planetary) etc for plain key
    .trim().replace(/\s+/g, '_');
    if (SKILL_TIPS[key]) return SKILL_TIPS[key];
    // Try with parenthetical content as suffix
    const withParen = name.replace(/\s+\(([^)]+)\)/, '_$1').replace(/\s+/g, '_');
    return SKILL_TIPS[withParen];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/combatCheckUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Combat Check Utility Functions
//
// Pure helpers for the guided combat check overlay: difficulty calculation,
// pool assembly, and result formatting.
// ═══════════════════════════════════════════════════════════════════════════
__turbopack_context__.s([
    "CHAR_FIELD_MAP",
    ()=>CHAR_FIELD_MAP,
    "MELEE_SKILL_KEYS",
    ()=>MELEE_SKILL_KEYS,
    "RANGED_SKILL_KEYS",
    ()=>RANGED_SKILL_KEYS,
    "RANGE_BAND_LABELS",
    ()=>RANGE_BAND_LABELS,
    "RANGE_BAND_ORDER",
    ()=>RANGE_BAND_ORDER,
    "RANGE_VALUE_MAP",
    ()=>RANGE_VALUE_MAP,
    "bandIndex",
    ()=>bandIndex,
    "formatResultSummary",
    ()=>formatResultSummary,
    "getMeleeDifficulty",
    ()=>getMeleeDifficulty,
    "getRangedDifficulty",
    ()=>getRangedDifficulty,
    "isMeleeSkill",
    ()=>isMeleeSkill,
    "isRangedSkill",
    ()=>isRangedSkill
]);
const RANGE_BAND_ORDER = [
    'engaged',
    'short',
    'medium',
    'long',
    'extreme'
];
const RANGE_BAND_LABELS = {
    engaged: 'Engaged',
    short: 'Short',
    medium: 'Medium',
    long: 'Long',
    extreme: 'Extreme'
};
const RANGE_VALUE_MAP = {
    wrEngaged: 'engaged',
    wrShort: 'short',
    wrMedium: 'medium',
    wrLong: 'long',
    wrExtreme: 'extreme'
};
function bandIndex(band) {
    return RANGE_BAND_ORDER.indexOf(band);
}
const BASE_RANGED_DIFFICULTY = {
    engaged: 1,
    short: 1,
    medium: 2,
    long: 3,
    extreme: 4
};
function getRangedDifficulty(band, skillKey, weaponMaxRange) {
    // Beyond max range — blocked
    if (bandIndex(band) > bandIndex(weaponMaxRange)) {
        return {
            difficultyDice: 0,
            challengeDice: 0,
            notes: [
                'Beyond weapon range'
            ],
            blocked: true
        };
    }
    let difficulty = BASE_RANGED_DIFFICULTY[band];
    const notes = [];
    if (band === 'engaged') {
        if (skillKey === 'RANGLT') {
            difficulty += 1;
            notes.push('+1 difficulty: Ranged (Light) at Engaged range');
        } else if (skillKey === 'RANGHVY') {
            difficulty += 2;
            notes.push('+2 difficulty: Ranged (Heavy) at Engaged range');
        } else if (skillKey === 'GUNN') {
            return {
                difficultyDice: 0,
                challengeDice: 0,
                notes: [
                    'Cannot use Gunnery at Engaged range'
                ],
                blocked: true
            };
        }
    }
    return {
        difficultyDice: difficulty,
        challengeDice: 0,
        notes,
        blocked: false
    };
}
function getMeleeDifficulty(target) {
    const ranks = target.skillRanks ?? {};
    // skillRanks stores by display name ("Melee") in adversary data
    let meleeRank = ranks['Melee'] ?? ranks['MELEE'] ?? -1;
    let isDefault = false;
    let defaultNote;
    if (meleeRank < 0) {
        isDefault = true;
        meleeRank = 0;
        defaultNote = `Melee not listed — defaulting to rank 0`;
    }
    const brawn = target.characteristics?.brawn ?? 2;
    const proficiency = Math.min(brawn, meleeRank);
    const ability = Math.abs(brawn - meleeRank);
    return {
        difficultyDice: ability,
        challengeDice: proficiency,
        targetMeleeRank: meleeRank,
        targetBrawn: brawn,
        isDefault,
        defaultNote
    };
}
const RANGED_SKILL_KEYS = [
    'RANGLT',
    'RANGHVY',
    'GUNN'
];
const MELEE_SKILL_KEYS = [
    'MELEE',
    'BRAWL',
    'LTSABER'
];
function isRangedSkill(key) {
    return RANGED_SKILL_KEYS.includes(key);
}
function isMeleeSkill(key) {
    return MELEE_SKILL_KEYS.includes(key);
}
function formatResultSummary(result, weaponName, targetName, rangeBand) {
    const net = result.net;
    const parts = [];
    if (net.success > 0) parts.push(`${net.success} Success`);
    else if (net.success < 0) parts.push(`${Math.abs(net.success)} Failure`);
    else parts.push('Wash');
    if (net.advantage > 0) parts.push(`${net.advantage} Advantage`);
    else if (net.advantage < 0) parts.push(`${Math.abs(net.advantage)} Threat`);
    if (net.triumph > 0) parts.push(`${net.triumph} Triumph`);
    if (net.despair > 0) parts.push(`${net.despair} Despair`);
    const contextParts = [
        weaponName
    ];
    if (targetName) contextParts.push(`vs ${targetName}`);
    if (rangeBand) contextParts.push(`at ${RANGE_BAND_LABELS[rangeBand]}`);
    return `${contextParts.join(' ')} — ${parts.join(' · ')}`;
}
const CHAR_FIELD_MAP = {
    BR: 'brawn',
    AG: 'agility',
    INT: 'intellect',
    CUN: 'cunning',
    WIL: 'willpower',
    PR: 'presence'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/criticalUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Critical Hit Eligibility Utility
//
// Determines whether a combat roll qualifies for a critical hit declaration,
// based on SWRPG rules: triumph (unconditional) or net advantages ≥ crit
// rating, as long as the attack dealt at least 1 wound after soak.
// ═══════════════════════════════════════════════════════════════════════════
__turbopack_context__.s([
    "checkCriticalEligibility",
    ()=>checkCriticalEligibility
]);
function checkCriticalEligibility(rollResult, refWeapon, netDamage) {
    const critRating = refWeapon?.crit ?? 4;
    const netAdvantages = rollResult.net.advantage;
    const triumph = rollResult.net.triumph;
    // Vicious quality: key is 'VICIOUS' (XML-derived)
    const viciousRating = Array.isArray(refWeapon?.qualities) ? refWeapon.qualities.find((q)=>q.key?.toUpperCase() === 'VICIOUS')?.count ?? 0 : 0;
    const totalCritModifier = viciousRating * 10;
    // Must deal at least 1 wound after soak
    if (netDamage <= 0) {
        return {
            isEligible: false,
            triggeredByTriumph: false,
            triggeredByAdvantage: false,
            critRating,
            viciousRating,
            totalCritModifier
        };
    }
    const triggeredByTriumph = triumph > 0;
    const triggeredByAdvantage = netAdvantages >= critRating;
    const isEligible = triggeredByTriumph || triggeredByAdvantage;
    return {
        isEligible,
        triggeredByTriumph,
        triggeredByAdvantage,
        critRating,
        viciousRating,
        totalCritModifier
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/weaponHandedness.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canDualWield",
    ()=>canDualWield,
    "getWeaponHandedness",
    ()=>getWeaponHandedness,
    "validateLoadout",
    ()=>validateLoadout
]);
// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Weapon Handedness Utility
//
// Determines whether a weapon is one-handed or two-handed based on its skill
// key, with support for GM overrides. Used for loadout validation and dual
// wield detection.
// ═══════════════════════════════════════════════════════════════════════════
// Skill keys that are inherently one-handed
const ONE_HANDED_SKILLS = [
    'RANGLT',
    'BRAWL'
];
// Skill keys that are inherently two-handed
const TWO_HANDED_SKILLS = [
    'RANGHVY',
    'GUNN'
];
// MELEE weapon_keys that are one-handed by nature (Enc ≤2, no Cumbersome quality).
// Enc 0–1: daggers, knives, small blades, batons, whips
// Enc 2: swords, rapiers, sabres, clubs, truncheons that don't require two hands
// Excluded despite Enc 2: ELECTRONET (thrown net), ENERGYBUCK (shield), FUSCUT (tool), IONPIKE (pike)
const ONE_HANDED_MELEE_KEYS = new Set([
    // Enc 0–1
    'THNDRBOLT',
    'AKRABDAG',
    'BLADEBREAKER',
    'BORNEURLASH',
    'KNIFE',
    'CS12STUNMAST',
    'ELECTPULSEDIS',
    'ENTRENCHTOOL',
    'KALDAGGER',
    'M8KNIFE',
    'MMD18DAG',
    'MOLSTILETTO',
    'MSW12',
    'NEURWHIP',
    'OUROBLADE',
    'PARRDAGG',
    'PARRVIBRO',
    'PUNCHDAGGER',
    'CRYOWHIP',
    'OBSIDIANDAGGER',
    'SNAPBATON',
    'STVIBKN',
    'VIBKN',
    'VIBRORANGMELEE',
    // Enc 2
    'CERBLADE',
    'CUTLASSCOR',
    'DIIRO',
    'DUSKBLADE',
    'EXPKNIFE',
    'FLASHSTICK',
    'SHISBLADE',
    'STUNBATON',
    'STUNCLUB',
    'SWORDCANE',
    'THERMCUTW',
    'TRUNCH',
    'TZ97SHOCKBATON',
    'VIBROMACH',
    'VIBRORAPIER',
    'Z6RIOT'
]);
function getWeaponHandedness(weapon) {
    // GM override takes highest priority
    if (weapon.is_one_handed_override === true) return 'one';
    if (weapon.is_two_handed_override === true) return 'two';
    // Auto-detect from skill
    if (ONE_HANDED_SKILLS.includes(weapon.skill_key)) return 'one';
    if (TWO_HANDED_SKILLS.includes(weapon.skill_key)) return 'two';
    // For MELEE, check the weapon key against known one-handed weapons
    if (weapon.skill_key === 'MELEE' && weapon.weapon_key && ONE_HANDED_MELEE_KEYS.has(weapon.weapon_key)) {
        return 'one';
    }
    // Default: two-handed
    return 'two';
}
function canDualWield(weapon) {
    return getWeaponHandedness(weapon) === 'one';
}
function validateLoadout(equipped) {
    if (equipped.length <= 1) return {
        valid: true,
        reason: null
    };
    if (equipped.length > 2) {
        return {
            valid: false,
            reason: 'Cannot equip more than 2 weapons at once.'
        };
    }
    // Two weapons — both must be one-handed
    const twoHanded = equipped.filter((w)=>getWeaponHandedness(w) === 'two');
    if (twoHanded.length === 2) {
        return {
            valid: false,
            reason: 'Cannot equip two two-handed weapons simultaneously.'
        };
    }
    if (twoHanded.length === 1) {
        return {
            valid: false,
            reason: `${twoHanded[0].name} requires two hands. Stow your other weapon first.`
        };
    }
    return {
        valid: true,
        reason: null
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/dathomiriUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isDathomiri",
    ()=>isDathomiri
]);
/** Species keys that treat dark-side Force points freely (no strain / Destiny cost). */ const DATHOMIRIAN_SPECIES_KEYS = [
    'DATHOMIRIAN',
    'NIGHTSISTER',
    'DATHOMIRI'
];
function isDathomiri(character) {
    return DATHOMIRIAN_SPECIES_KEYS.includes((character.species_key ?? '').toUpperCase());
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/derivedStats.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ═══════════════════════════════════════════════════════════════════════════
// HOLOCRON — Derived Stats Engine
//
// Computes a character's effective stats from their talents, armor, and item
// attachments. All computation is client-side at render time — nothing is
// written back to the database. Derived values are a pure function of the
// character data passed in.
// ═══════════════════════════════════════════════════════════════════════════
__turbopack_context__.s([
    "computeDerivedStats",
    ()=>computeDerivedStats,
    "computeEffectiveWeaponStats",
    ()=>computeEffectiveWeaponStats,
    "computeEncumbranceStats",
    ()=>computeEncumbranceStats
]);
// ── Weapon attachment helpers ─────────────────────────────────────────────────
function isAttModArray(v) {
    return Array.isArray(v);
}
function computeEffectiveWeaponStats(refWeapon, attachments, installedAddedModIndicesByKey = {}) {
    let damage = refWeapon.damage ?? 0;
    let damage_add = refWeapon.damage_add ?? null;
    let crit = refWeapon.crit ?? 4;
    // Build a mutable quality map keyed by quality key
    const qualMap = {};
    if (Array.isArray(refWeapon.qualities)) {
        for (const q of refWeapon.qualities){
            qualMap[q.key] = (qualMap[q.key] ?? 0) + (q.count ?? 1);
        }
    }
    const applyMod = (entry)=>{
        if (!entry.key) return;
        const n = entry.count ?? 1;
        switch(entry.key){
            case 'DAMADD':
                damage += n;
                break;
            case 'DAMSUB':
                damage -= n;
                break;
            case 'DAMSET':
                damage = n;
                break;
            case 'CRITADD':
                crit += n;
                break;
            case 'CRITSUB':
                crit = Math.max(1, crit - n);
                break;
            case 'CRITSET':
                crit = n;
                break;
            default:
                // Assume any other non-null key with count > 0 is a quality mod
                if (n > 0) qualMap[entry.key] = (qualMap[entry.key] ?? 0) + n;
        }
    };
    for (const att of attachments){
        if (isAttModArray(att.base_mods)) {
            for (const entry of att.base_mods)applyMod(entry);
        }
        const installedIndices = installedAddedModIndicesByKey[att.key] ?? [];
        if (isAttModArray(att.added_mods)) {
            for (const idx of installedIndices){
                const entry = att.added_mods[idx];
                if (entry) applyMod(entry);
            }
        }
    }
    const qualities = Object.entries(qualMap).filter(([, count])=>count > 0).map(([key, count])=>({
            key,
            count
        }));
    return {
        damage,
        damage_add,
        crit,
        qualities
    };
}
function computeEncumbranceStats(character, armor, refArmorMap, gear, refGearMap, weapons, refWeaponMap) {
    let current = 0;
    for (const a of armor){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (a.is_dropped) continue;
        const state = a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying');
        if (state === 'stowed') continue;
        const enc = refArmorMap[a.armor_key]?.encumbrance || 0;
        current += state === 'equipped' ? Math.max(0, enc - 3) : enc;
    }
    for (const g of gear){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (g.is_dropped) continue;
        const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying');
        if (state === 'stowed') continue;
        current += (refGearMap[g.gear_key]?.encumbrance || 0) * (g.quantity || 1);
    }
    for (const w of weapons){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (w.is_dropped) continue;
        const state = w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying');
        if (state === 'stowed') continue;
        current += refWeaponMap[w.weapon_key]?.encumbrance || 0;
    }
    const bonus = gear.reduce((s, g)=>{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (g.is_dropped) return s;
        const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying');
        const ref = refGearMap[g.gear_key];
        return s + (state === 'equipped' && ref?.encumbrance_bonus ? ref.encumbrance_bonus : 0);
    }, 0);
    return {
        current,
        threshold: character.encumbrance_threshold + bonus
    };
}
function computeDerivedStats(character, forceRatingBase, characterTalents, refTalentMap, equippedArmor, refArmorMap, refAttachmentMap, characterWeapons = [], refWeaponMap = {}, refWeaponQualityMap = {}, speciesAbilities = []) {
    const mods = {
        soakBonus: 0,
        defenseMelee: 0,
        defenseRanged: 0,
        woundThresholdBonus: 0,
        strainThresholdBonus: 0,
        forceRatingBonus: 0,
        skillModifiers: {}
    };
    // ── Breakdown source arrays for tooltip display ───────────────────────────
    const soakSources = [
        {
            label: 'Brawn',
            value: character.brawn
        }
    ];
    const defMSources = [];
    const defRSources = [];
    // Base entries are deferred — talent loop adds to woundThresholdBonus / strainThresholdBonus,
    // so we prepend the true species/class base AFTER the loop to avoid an inflated Base value.
    const woundSources = [];
    const strainSources = [];
    const forceSources = forceRatingBase > 0 ? [
        {
            label: 'Career / Force talents',
            value: forceRatingBase
        }
    ] : [];
    // ── Step 2: Armor modifiers ───────────────────────────────────────────────
    const worn = equippedArmor.filter((a)=>a.equip_state === 'equipped' || a.is_equipped);
    for (const piece of worn){
        const ref = refArmorMap[piece.armor_key];
        if (!ref) continue;
        // Prefer migration-018 columns; fall back to legacy columns
        const soakB = ref.soak_bonus ?? ref.soak ?? 0;
        const defM = ref.defense_melee ?? ref.defense ?? 0;
        const defR = ref.defense_ranged ?? ref.defense ?? 0;
        const label = piece.custom_name || ref.name;
        if (soakB > 0) {
            mods.soakBonus += soakB;
            soakSources.push({
                label,
                value: soakB
            });
        }
        if (defM > 0) {
            mods.defenseMelee += defM;
            defMSources.push({
                label,
                value: defM
            });
        }
        if (defR > 0) {
            mods.defenseRanged += defR;
            defRSources.push({
                label,
                value: defR
            });
        }
    }
    // ── Step 3: Item attachment modifiers ─────────────────────────────────────
    // Attachments are stored inline as unknown[] on character_armor/gear rows.
    // We only process attachments whose ref entry has a key field we can look up.
    for (const piece of worn){
        if (!Array.isArray(piece.attachments)) continue;
        for (const att of piece.attachments){
            const attKey = att?.key;
            if (!attKey) continue;
            const ref = refAttachmentMap[attKey];
            if (!ref?.base_mods) continue;
            // Handle both legacy flat-object format and new array format
            if (isAttModArray(ref.base_mods)) {
                // New array format: derive armor stats from known keys
                for (const entry of ref.base_mods){
                    if (!entry.key || !entry.count) continue;
                    const n = entry.count;
                    if (entry.key === 'SOAKADD') {
                        mods.soakBonus += n;
                        soakSources.push({
                            label: ref.name,
                            value: n
                        });
                    }
                    if (entry.key === 'DEFADD') {
                        mods.defenseMelee += n;
                        mods.defenseRanged += n;
                        defMSources.push({
                            label: ref.name,
                            value: n
                        });
                        defRSources.push({
                            label: ref.name,
                            value: n
                        });
                    }
                    if (entry.key === 'STRAINADD') {
                        mods.strainThresholdBonus += n;
                        strainSources.push({
                            label: ref.name,
                            value: n
                        });
                    }
                    if (entry.key === 'WOUNDADD') {
                        mods.woundThresholdBonus += n;
                        woundSources.push({
                            label: ref.name,
                            value: n
                        });
                    }
                }
            } else {
                // Legacy flat-object format
                const m = ref.base_mods;
                if (m.soakAdd) {
                    mods.soakBonus += m.soakAdd;
                    soakSources.push({
                        label: ref.name,
                        value: m.soakAdd
                    });
                }
                if (m.defenseMeleeAdd) {
                    mods.defenseMelee += m.defenseMeleeAdd;
                    defMSources.push({
                        label: ref.name,
                        value: m.defenseMeleeAdd
                    });
                }
                if (m.defenseRangedAdd) {
                    mods.defenseRanged += m.defenseRangedAdd;
                    defRSources.push({
                        label: ref.name,
                        value: m.defenseRangedAdd
                    });
                }
                if (m.woundThresholdAdd) {
                    mods.woundThresholdBonus += m.woundThresholdAdd;
                    woundSources.push({
                        label: ref.name,
                        value: m.woundThresholdAdd
                    });
                }
                if (m.strainThresholdAdd) {
                    mods.strainThresholdBonus += m.strainThresholdAdd;
                    strainSources.push({
                        label: ref.name,
                        value: m.strainThresholdAdd
                    });
                }
            }
        }
    }
    // ── Step 2b: Equipped weapon quality modifiers ────────────────────────────
    const equippedWeapons = characterWeapons.filter((w)=>w.equip_state === 'equipped' || w.is_equipped);
    for (const cw of equippedWeapons){
        const refW = refWeaponMap[cw.weapon_key];
        if (!Array.isArray(refW?.qualities)) continue;
        const weaponLabel = cw.custom_name || refW.name;
        for (const q of refW.qualities){
            const refQ = refWeaponQualityMap[q.key];
            if (!refQ?.stat_modifier) continue;
            const count = q.count ?? 1;
            const sm = refQ.stat_modifier;
            if (sm.defenseMelee) {
                const val = sm.defenseMelee * count;
                mods.defenseMelee += val;
                defMSources.push({
                    label: `${weaponLabel} (${refQ.name} ${count})`,
                    value: val
                });
            }
            if (sm.defenseRanged) {
                const val = sm.defenseRanged * count;
                mods.defenseRanged += val;
                defRSources.push({
                    label: `${weaponLabel} (${refQ.name} ${count})`,
                    value: val
                });
            }
        }
    }
    // ── Track soak after armor (needed for talent requirements) ───────────────
    const soakAfterArmor = character.brawn + mods.soakBonus;
    // ── Step 4: Talent modifiers ──────────────────────────────────────────────
    for (const talent of characterTalents){
        const ref = refTalentMap[talent.talent_key];
        if (!ref?.attributes && !ref?.die_modifiers && !ref?.modifiers) continue;
        const rank = talent.ranks ?? 1;
        // Requirement checks
        if (ref.requirements?.wearingArmor && worn.length === 0) continue;
        if (ref.requirements?.soakAtLeast != null && soakAfterArmor < ref.requirements.soakAtLeast) continue;
        // Stat attribute modifiers — prefer migration-017 `attributes` shape; fall back
        // to legacy `modifiers` for talents (e.g. WITCHCRAFT) not yet backfilled.
        const rankLabel = rank > 1 ? ` ×${rank}` : '';
        if (ref.attributes) {
            const a = ref.attributes;
            const soakVal = (a.soakValue ?? 0) * rank;
            const defMVal = (a.defenseMelee ?? 0) * rank;
            const defRVal = (a.defenseRanged ?? 0) * rank;
            const woundVal = (a.woundThreshold ?? 0) * rank;
            const strainVal = (a.strainThreshold ?? 0) * rank;
            const forceVal = (a.forceRating ?? 0) * rank;
            if (soakVal) {
                mods.soakBonus += soakVal;
                soakSources.push({
                    label: ref.name + rankLabel,
                    value: soakVal
                });
            }
            if (defMVal) {
                mods.defenseMelee += defMVal;
                defMSources.push({
                    label: ref.name + rankLabel,
                    value: defMVal
                });
            }
            if (defRVal) {
                mods.defenseRanged += defRVal;
                defRSources.push({
                    label: ref.name + rankLabel,
                    value: defRVal
                });
            }
            if (woundVal) {
                mods.woundThresholdBonus += woundVal;
                woundSources.push({
                    label: ref.name + rankLabel,
                    value: woundVal
                });
            }
            if (strainVal) {
                mods.strainThresholdBonus += strainVal;
                strainSources.push({
                    label: ref.name + rankLabel,
                    value: strainVal
                });
            }
            if (forceVal) {
                mods.forceRatingBonus += forceVal;
                forceSources.push({
                    label: ref.name + rankLabel,
                    value: forceVal
                });
            }
        } else if (ref.modifiers) {
            // Legacy modifiers shape (snake_case) — used by some OggDude-imported talents
            const m = ref.modifiers;
            const soakVal = (m.soak ?? 0) * rank;
            const defMVal = (m.defense_melee ?? 0) * rank;
            const defRVal = (m.defense_ranged ?? 0) * rank;
            const woundVal = (m.wound_threshold ?? 0) * rank;
            const strainVal = (m.strain_threshold ?? 0) * rank;
            // Conditional FR talent (e.g. Witchcraft): only applies if career/spec base is 0
            const rawForceVal = (m.force_rating ?? 0) * rank;
            const forceVal = m.force_rating_conditional && forceRatingBase > 0 ? 0 : rawForceVal;
            if (soakVal) {
                mods.soakBonus += soakVal;
                soakSources.push({
                    label: ref.name + rankLabel,
                    value: soakVal
                });
            }
            if (defMVal) {
                mods.defenseMelee += defMVal;
                defMSources.push({
                    label: ref.name + rankLabel,
                    value: defMVal
                });
            }
            if (defRVal) {
                mods.defenseRanged += defRVal;
                defRSources.push({
                    label: ref.name + rankLabel,
                    value: defRVal
                });
            }
            if (woundVal) {
                mods.woundThresholdBonus += woundVal;
                woundSources.push({
                    label: ref.name + rankLabel,
                    value: woundVal
                });
            }
            if (strainVal) {
                mods.strainThresholdBonus += strainVal;
                strainSources.push({
                    label: ref.name + rankLabel,
                    value: strainVal
                });
            }
            if (forceVal) {
                mods.forceRatingBonus += forceVal;
                forceSources.push({
                    label: ref.name + rankLabel,
                    value: forceVal
                });
            }
        }
        // Dice modifier effects
        if (ref.die_modifiers) {
            for (const dm of ref.die_modifiers){
                const existing = mods.skillModifiers[dm.skillKey] ?? {
                    boostAdd: 0,
                    setbackRemove: 0,
                    sources: []
                };
                const rankLabel = rank > 1 ? ` (Rank ${rank})` : '';
                existing.boostAdd += (dm.boostCount ?? 0) * rank;
                existing.setbackRemove += (dm.setbackCount ?? 0) * rank;
                existing.sources.push(ref.name + rankLabel);
                mods.skillModifiers[dm.skillKey] = existing;
            }
        }
    }
    // ── Step 4b: Species talent_rank ability stat modifiers ──────────────────────
    // Species abilities that grant a free talent rank (e.g. Dathomirian → Outdoorsman,
    // Hutt → Enduring) apply that talent's stat modifiers as if it were purchased.
    for (const sa of speciesAbilities){
        if (sa.mechanical_type !== 'talent_rank' || !sa.talent_key) continue;
        const ref = refTalentMap[sa.talent_key];
        if (!ref?.modifiers && !ref?.attributes) continue;
        const rank = sa.rank_add ?? 1;
        const rankLabel = ` (Species)`;
        if (ref.attributes) {
            const a = ref.attributes;
            const soakVal = (a.soakValue ?? 0) * rank;
            const defMVal = (a.defenseMelee ?? 0) * rank;
            const defRVal = (a.defenseRanged ?? 0) * rank;
            const woundVal = (a.woundThreshold ?? 0) * rank;
            const strainVal = (a.strainThreshold ?? 0) * rank;
            const forceVal = (a.forceRating ?? 0) * rank;
            if (soakVal) {
                mods.soakBonus += soakVal;
                soakSources.push({
                    label: ref.name + rankLabel,
                    value: soakVal
                });
            }
            if (defMVal) {
                mods.defenseMelee += defMVal;
                defMSources.push({
                    label: ref.name + rankLabel,
                    value: defMVal
                });
            }
            if (defRVal) {
                mods.defenseRanged += defRVal;
                defRSources.push({
                    label: ref.name + rankLabel,
                    value: defRVal
                });
            }
            if (woundVal) {
                mods.woundThresholdBonus += woundVal;
                woundSources.push({
                    label: ref.name + rankLabel,
                    value: woundVal
                });
            }
            if (strainVal) {
                mods.strainThresholdBonus += strainVal;
                strainSources.push({
                    label: ref.name + rankLabel,
                    value: strainVal
                });
            }
            if (forceVal) {
                mods.forceRatingBonus += forceVal;
                forceSources.push({
                    label: ref.name + rankLabel,
                    value: forceVal
                });
            }
        } else if (ref.modifiers) {
            const m = ref.modifiers;
            const soakVal = (m.soak ?? 0) * rank;
            const defMVal = (m.defense_melee ?? 0) * rank;
            const defRVal = (m.defense_ranged ?? 0) * rank;
            const woundVal = (m.wound_threshold ?? 0) * rank;
            const strainVal = (m.strain_threshold ?? 0) * rank;
            const rawForceVal = (m.force_rating ?? 0) * rank;
            const forceVal = m.force_rating_conditional && forceRatingBase > 0 ? 0 : rawForceVal;
            if (soakVal) {
                mods.soakBonus += soakVal;
                soakSources.push({
                    label: ref.name + rankLabel,
                    value: soakVal
                });
            }
            if (defMVal) {
                mods.defenseMelee += defMVal;
                defMSources.push({
                    label: ref.name + rankLabel,
                    value: defMVal
                });
            }
            if (defRVal) {
                mods.defenseRanged += defRVal;
                defRSources.push({
                    label: ref.name + rankLabel,
                    value: defRVal
                });
            }
            if (woundVal) {
                mods.woundThresholdBonus += woundVal;
                woundSources.push({
                    label: ref.name + rankLabel,
                    value: woundVal
                });
            }
            if (strainVal) {
                mods.strainThresholdBonus += strainVal;
                strainSources.push({
                    label: ref.name + rankLabel,
                    value: strainVal
                });
            }
            if (forceVal) {
                mods.forceRatingBonus += forceVal;
                forceSources.push({
                    label: ref.name + rankLabel,
                    value: forceVal
                });
            }
        }
    }
    // ── Prepend true Base entries now that talent bonuses are fully accumulated ─
    // character.wound_threshold stores the effective value (species base + GRIT/TOUGH bonuses).
    // Subtract accumulated bonuses to recover the original species/career base for the tooltip.
    const trueWoundBase = character.wound_threshold - mods.woundThresholdBonus;
    const trueStrainBase = character.strain_threshold - mods.strainThresholdBonus;
    woundSources.unshift({
        label: 'Base',
        value: trueWoundBase
    });
    strainSources.unshift({
        label: 'Base',
        value: trueStrainBase
    });
    // ── Step 5: Assemble effective stats ─────────────────────────────────────
    const effectiveStats = {
        soak: character.brawn + mods.soakBonus,
        defenseMelee: mods.defenseMelee,
        defenseRanged: mods.defenseRanged,
        // wound/strain talent bonuses (GRIT, TOUGH) are stored directly on the character row
        // via applyTalentModifiers — do NOT add them again here to avoid double-counting.
        woundThreshold: character.wound_threshold,
        strainThreshold: character.strain_threshold,
        forceRating: forceRatingBase + mods.forceRatingBonus
    };
    return {
        effectiveStats,
        modifiers: mods,
        breakdown: {
            soak: soakSources,
            defenseMelee: defMSources,
            defenseRanged: defRSources,
            woundThreshold: woundSources,
            strainThreshold: strainSources,
            forceRating: forceSources
        }
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/lib/characterSheetPDF.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateCharacterSheetPDF",
    ()=>generateCharacterSheetPDF
]);
/**
 * characterSheetPDF.ts
 *
 * Overlays character data onto the official FFG Age of Rebellion character
 * sheet template using pdf-lib.
 *
 * Coordinates are calibrated for the actual 603×783pt page (bottom-left origin).
 * pdf-lib coordinate system: (0,0) = bottom-left, y increases upward.
 * PNG scale: 1257×1632px → 0.4798 pts/px; x_pts = px*0.4797; y_pts = (1632-py)*0.4798
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/pdf-lib/es/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/pdf-lib/es/api/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/pdf-lib/es/api/colors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/pdf-lib/es/api/StandardFonts.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/types.ts [app-client] (ecmascript)");
;
;
// ── Constants ─────────────────────────────────────────────────────────────────
const BLACK = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rgb"])(0, 0, 0);
const WHITE = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rgb"])(1, 1, 1);
// ── Skill layout: ordered exactly as they appear on the official sheet ────────
// Skill y-positions calibrated from sheet-page1.png:
// Skills section header dark band at y=540-546px → pts=524-521
// First data row immediately below at pts≈520; row spacing 11pts (matches template)
const GENERAL_SKILLS = [
    {
        key: 'ASTRO',
        y: 520
    },
    {
        key: 'ATHL',
        y: 509
    },
    {
        key: 'CHARM',
        y: 498
    },
    {
        key: 'COERC',
        y: 487
    },
    {
        key: 'COMP',
        y: 476
    },
    {
        key: 'COOL',
        y: 465
    },
    {
        key: 'COORD',
        y: 454
    },
    {
        key: 'DECEP',
        y: 443
    },
    {
        key: 'DISC',
        y: 432
    },
    {
        key: 'LEAD',
        y: 421
    },
    {
        key: 'MECH',
        y: 410
    },
    {
        key: 'MED',
        y: 399
    },
    {
        key: 'NEG',
        y: 388
    },
    {
        key: 'PERC',
        y: 377
    },
    {
        key: 'PILOTPL',
        y: 366
    },
    {
        key: 'PILOTSP',
        y: 355
    },
    {
        key: 'RESIL',
        y: 344
    },
    {
        key: 'SKUL',
        y: 333
    },
    {
        key: 'STEALTH',
        y: 322
    },
    {
        key: 'STWISE',
        y: 311
    },
    {
        key: 'SURV',
        y: 300
    },
    {
        key: 'VIGIL',
        y: 289
    }
];
const COMBAT_SKILLS = [
    {
        key: 'BRAWL',
        y: 520
    },
    {
        key: 'GUNN',
        y: 509
    },
    {
        key: 'MELEE',
        y: 498
    },
    {
        key: 'RANGLT',
        y: 487
    },
    {
        key: 'RANGHVY',
        y: 476
    }
];
const KNOWLEDGE_SKILLS = [
    {
        key: 'CORE',
        y: 443
    },
    {
        key: 'EDU',
        y: 432
    },
    {
        key: 'LORE',
        y: 421
    },
    {
        key: 'OUTER',
        y: 410
    },
    {
        key: 'UNDER',
        y: 399
    },
    {
        key: 'WARF',
        y: 388
    },
    {
        key: 'XENO',
        y: 377
    }
];
// y positions for the 14 talent rows on page 2
// Calibrated from sheet-page2.png: talent header at pts≈219, rows measured from dark separator bands
const TALENT_ROW_Y = [
    211,
    202,
    192,
    182,
    171,
    165,
    158,
    152,
    143,
    137,
    130,
    124,
    115,
    109
];
async function generateCharacterSheetPDF(input) {
    const templateBytes = await fetch('/character-sheet-template.pdf').then((r)=>{
        if (!r.ok) throw new Error(`Template fetch failed: ${r.status}`);
        return r.arrayBuffer();
    });
    const pdfDoc = await __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PDFDocument"].load(templateBytes);
    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    const page2 = pages[1] ?? null;
    const font = await pdfDoc.embedFont(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StandardFonts"].Helvetica);
    const fontBold = await pdfDoc.embedFont(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StandardFonts"].HelveticaBold);
    fillPage1(page1, font, fontBold, input);
    if (page2) fillPage2(page2, font, fontBold, input);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([
        pdfBytes.buffer
    ], {
        type: 'application/pdf'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${input.character.name.replace(/[^A-Za-z0-9_-]/g, '_')}_CharacterSheet.pdf`;
    a.click();
    URL.revokeObjectURL(url);
}
// ── Page 1 ────────────────────────────────────────────────────────────────────
function fillPage1(page, font, bold, input) {
    const { character, playerName, careerName, speciesName, specNames, skills, weapons, refWeaponMap, refWeaponQualityMap, effectiveStats } = input;
    // Build skill lookup: skill_key (upper) → { rank, is_career }
    const skillData = {};
    for (const cs of skills){
        skillData[cs.skill_key.toUpperCase()] = {
            rank: cs.rank,
            is_career: cs.is_career
        };
    }
    // ── HEADER ────────────────────────────────────────────────────────────────
    // y-positions calibrated from sheet-page1.png brightness scans
    t(page, bold, character.name, 50, 760, 14);
    t(page, font, speciesName, 50, 728, 9);
    t(page, font, careerName, 50, 720, 9);
    t(page, font, clip(specNames, font, 8, 300), 50, 711, 8);
    t(page, font, playerName, 450, 711, 9);
    // XP boxes at bottom: total (left box) + available (right box), y≈64pts from bottom
    t(page, font, String(character.xp_total), 56, 64, 9);
    t(page, font, String(character.xp_available), 480, 64, 9);
    // ── SOAK / WOUNDS / STRAIN / DEFENSE ──────────────────────────────────────
    // White value boxes measured at y=265-320px → pts≈643; x-positions spread across page
    const soak = effectiveStats?.soak ?? character.soak;
    const woundT = effectiveStats?.woundThreshold ?? character.wound_threshold;
    const strT = effectiveStats?.strainThreshold ?? character.strain_threshold;
    const defM = effectiveStats?.defenseMelee ?? character.defense_melee;
    const defR = effectiveStats?.defenseRanged ?? character.defense_ranged;
    t(page, bold, String(soak), 95, 643, 18);
    t(page, bold, String(woundT), 210, 643, 14);
    t(page, bold, String(character.wound_current), 270, 643, 14);
    t(page, bold, String(strT), 350, 643, 14);
    t(page, bold, String(character.strain_current), 410, 643, 14);
    t(page, bold, String(defR), 472, 643, 14);
    t(page, bold, String(defM), 530, 643, 14);
    // ── CHARACTERISTICS ───────────────────────────────────────────────────────
    // Dials at y=400-510px → center pts≈565
    t(page, bold, String(character.brawn), 68, 565, 20);
    t(page, bold, String(character.agility), 165, 565, 20);
    t(page, bold, String(character.intellect), 262, 565, 20);
    t(page, bold, String(character.cunning), 358, 565, 20);
    t(page, bold, String(character.willpower), 455, 565, 20);
    t(page, bold, String(character.presence), 550, 565, 20);
    // ── GENERAL SKILLS (left column) ─────────────────────────────────────────
    for (const { key, y } of GENERAL_SKILLS){
        const cs = skillData[key] ?? {
            rank: 0,
            is_career: false
        };
        if (cs.is_career) {
            page.drawCircle({
                x: 170,
                y,
                size: 3,
                color: BLACK
            });
        }
        drawSkillPips(page, 220, y, cs.rank);
    }
    // ── COMBAT SKILLS (right column) ─────────────────────────────────────────
    for (const { key, y } of COMBAT_SKILLS){
        const cs = skillData[key] ?? {
            rank: 0,
            is_career: false
        };
        if (cs.is_career) {
            page.drawCircle({
                x: 455,
                y,
                size: 3,
                color: BLACK
            });
        }
        drawSkillPips(page, 500, y, cs.rank);
    }
    // ── KNOWLEDGE SKILLS (right column) ──────────────────────────────────────
    for (const { key, y } of KNOWLEDGE_SKILLS){
        const cs = skillData[key] ?? {
            rank: 0,
            is_career: false
        };
        if (cs.is_career) {
            page.drawCircle({
                x: 455,
                y,
                size: 3,
                color: BLACK
            });
        }
        drawSkillPips(page, 500, y, cs.rank);
    }
    // ── WEAPONS TABLE ─────────────────────────────────────────────────────────
    // Calibrated: section top border at y=1243px (pts=187), first data row starts pts=166
    const WEAPON_ROWS = [
        166,
        147,
        128,
        109,
        90
    ];
    weapons.slice(0, 5).forEach((cw, i)=>{
        const rowY = WEAPON_ROWS[i];
        if (rowY === undefined) return;
        const rw = refWeaponMap[cw.weapon_key];
        if (!rw) {
            t(page, font, cw.custom_name ?? cw.weapon_key, 52, rowY, 7);
            return;
        }
        const weaponName = cw.custom_name ?? rw.name;
        const skillName = input.refSkillMap[rw.skill_key]?.name ?? rw.skill_key;
        const damageStr = rw.damage_add != null ? `+${rw.damage_add}` : String(rw.damage ?? 0);
        const qualStr = (rw.qualities ?? []).map((q)=>{
            const qName = refWeaponQualityMap[q.key]?.name ?? q.key;
            return q.count && q.count > 1 ? `${qName} ${q.count}` : qName;
        }).join(', ');
        t(page, font, clip(weaponName, font, 7, 72), 52, rowY, 7);
        t(page, font, clip(skillName, font, 7, 72), 130, rowY, 7);
        t(page, font, damageStr, 210, rowY, 7);
        t(page, font, String(rw.crit ?? '—'), 280, rowY, 7);
        t(page, font, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_LABELS"][rw.range_value] ?? rw.range_value, 330, rowY, 7);
        t(page, font, clip(qualStr || '—', font, 7, 150), 400, rowY, 7);
    });
}
// ── Page 2 ────────────────────────────────────────────────────────────────────
function fillPage2(page, font, bold, input) {
    const { character, speciesName, careerName, talents, refTalentMap, weapons, refWeaponMap, armor, refArmorMap, gear, refGearMap, crits } = input;
    // ── MOTIVATIONS (top section) — mapped to duty / obligation ───────────────
    // Left box = duty, right box = obligation
    if (character.duty_type) {
        t(page, font, character.duty_custom_name ?? character.duty_type, 115, 748, 9);
        t(page, font, `Magnitude: ${character.duty_value ?? 0}`, 115, 736, 8);
    }
    if (character.obligation_type) {
        t(page, font, character.obligation_custom_name ?? character.obligation_type, 310, 748, 9);
        t(page, font, `Value: ${character.obligation_value ?? 0}`, 310, 736, 8);
    }
    // ── CHARACTER DESCRIPTION (right column) ─────────────────────────────────
    t(page, font, speciesName || '—', 450, 748, 9);
    t(page, font, careerName || '—', 450, 720, 9);
    t(page, font, character.gender || '—', 450, 706, 9);
    // age / height / build / hair / eyes: not stored on Character — leave blank
    // ── DUTIES ────────────────────────────────────────────────────────────────
    if (character.duty_type) {
        t(page, font, character.duty_custom_name ?? character.duty_type, 115, 620, 9);
        t(page, font, String(character.duty_value ?? 0), 115, 595, 9);
    }
    if (character.obligation_type) {
        t(page, font, character.obligation_custom_name ?? character.obligation_type, 310, 620, 9);
        t(page, font, String(character.obligation_value ?? 0), 310, 595, 9);
    }
    // ── EQUIPMENT LOG ─────────────────────────────────────────────────────────
    t(page, bold, String(character.credits.toLocaleString()), 115, 480, 9);
    const wepLine = weapons.map((cw)=>cw.custom_name ?? refWeaponMap[cw.weapon_key]?.name ?? cw.weapon_key).concat(armor.map((ca)=>ca.custom_name ?? refArmorMap[ca.armor_key]?.name ?? ca.armor_key)).join(', ') || '—';
    drawWrapped(page, font, wepLine, 115, 455, 8, 150);
    const gearLine = gear.map((cg)=>{
        const name = cg.custom_name ?? refGearMap[cg.gear_key]?.name ?? cg.gear_key;
        return cg.quantity > 1 ? `${name} ×${cg.quantity}` : name;
    }).join(', ') || '—';
    drawWrapped(page, font, gearLine, 310, 455, 8, 150);
    // ── CRITICAL INJURIES ─────────────────────────────────────────────────────
    const critRowYs = [
        480,
        465,
        450,
        435,
        420,
        405
    ];
    crits.filter((c)=>!c.is_healed).slice(0, 6).forEach((c, i)=>{
        const ry = critRowYs[i];
        if (ry === undefined) return;
        t(page, font, c.severity?.toUpperCase() ?? '—', 440, ry, 8);
        t(page, font, clip(c.custom_name ?? `Roll ${c.roll_result ?? '—'}`, font, 8, 140), 490, ry, 8);
    });
    // ── TALENTS TABLE ─────────────────────────────────────────────────────────
    talents.slice(0, TALENT_ROW_Y.length).forEach((ct, i)=>{
        const rowY = TALENT_ROW_Y[i];
        if (rowY === undefined) return;
        const rt = refTalentMap[ct.talent_key];
        if (!rt) {
            t(page, font, ct.talent_key, 52, rowY, 7);
            return;
        }
        const ranked = rt.is_ranked && ct.ranks > 1 ? ` ${ct.ranks}` : '';
        const activation = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACTIVATION_LABELS"][rt.activation] ?? rt.activation ?? '—';
        const desc = (rt.description ?? '').replace(/<[^>]+>/g, '').slice(0, 120);
        t(page, font, clip(`${rt.name}${ranked}`, font, 7, 95), 52, rowY, 7);
        t(page, font, clip(activation, font, 7, 80), 200, rowY, 7);
        drawWrapped(page, font, desc, 235, rowY, 7, 320, 2);
    });
}
// ── Drawing helpers ───────────────────────────────────────────────────────────
/** Draw text at (x, y) — shorthand to keep layout code readable. */ function t(page, font, text, x, y, size) {
    if (!text) return;
    page.drawText(text, {
        x,
        y,
        size,
        font,
        color: BLACK
    });
}
/**
 * Draw skill rank pips starting at (x, y).
 * Filled circles for rank, open circles for remainder up to 5.
 * Each pip is radius 3, spaced 7pt apart.
 */ function drawSkillPips(page, x, y, rank) {
    const r = Math.max(0, Math.min(5, rank));
    for(let i = 0; i < 5; i++){
        const cx = x + i * 7;
        if (i < r) {
            // Filled
            page.drawCircle({
                x: cx,
                y,
                size: 3,
                color: BLACK
            });
        } else {
            // Open — white fill with black border
            page.drawCircle({
                x: cx,
                y,
                size: 3,
                color: WHITE,
                borderColor: BLACK,
                borderWidth: 0.8
            });
        }
    }
}
/**
 * Clip text so it does not exceed maxWidth at the given font size.
 * Appends '…' if truncated.
 */ function clip(text, font, size, maxWidth) {
    if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
    let s = text;
    while(s.length > 0 && font.widthOfTextAtSize(s + '…', size) > maxWidth){
        s = s.slice(0, -1);
    }
    return s + '…';
}
/**
 * Draw text wrapped to maxWidth, stepping y down by (size+2) per line.
 * maxLines defaults to 3 to prevent overflow into adjacent fields.
 */ function drawWrapped(page, font, text, x, y, size, maxWidth, maxLines = 3) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words){
        const candidate = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
            current = candidate;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);
    lines.slice(0, maxLines).forEach((line, i)=>{
        page.drawText(line, {
            x,
            y: y - i * (size + 2),
            size,
            font,
            color: BLACK
        });
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=star-wars-rpg_src_lib_47331bd5._.js.map