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
"[project]/star-wars-rpg/src/components/ui/VersionWatermark.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VersionWatermark",
    ()=>VersionWatermark
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
function VersionWatermark() {
    const version = ("TURBOPACK compile-time value", "0.1.0") ?? '0.0.0';
    const commit = ("TURBOPACK compile-time value", "ed73781") ?? 'unknown';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            bottom: '0.75rem',
            right: '1rem',
            zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].sticky,
            fontFamily: 'var(--font-body)',
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
            color: 'var(--hud-text-faint)',
            letterSpacing: '0.05em',
            userSelect: 'none',
            pointerEvents: 'none'
        },
        onMouseEnter: (e)=>{
            const el = e.currentTarget;
            el.style.color = 'var(--hud-text-dim)';
            el.style.pointerEvents = 'auto';
        },
        onMouseLeave: (e)=>{
            const el = e.currentTarget;
            el.style.color = 'var(--hud-text-faint)';
            el.style.pointerEvents = 'none';
        },
        children: [
            "v",
            version,
            " (",
            commit,
            ")"
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/ui/VersionWatermark.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
_c = VersionWatermark;
var _c;
__turbopack_context__.k.register(_c, "VersionWatermark");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$VersionWatermark$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/VersionWatermark.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
// ─── Design Tokens ───────────────────────────────────────────────────────────
const BG = 'var(--hud-bg)';
const PANEL = 'var(--hud-surface-hi)';
const RAISED = 'var(--hud-surface-mid)';
const INPUT_BG = 'var(--hud-surface-lo)';
const GOLD_L = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold;
const GOLD_DIM = 'var(--hud-text-faint)';
const BORDER = 'var(--hud-border)';
const BORDER_MD = 'var(--hud-border)';
const BORDER_HI = 'var(--hud-border-hi)';
// Raw hex for SVG attributes and <style> strings — CSS vars can't be used there
const ACCENT_HEX = '#E03A1E';
const SUCCESS = 'var(--state-success)';
const DANGER = 'var(--state-wounds)';
const WARN = 'var(--state-strain)';
const TEXT = 'var(--hud-text)';
const TEXT_SEC = 'var(--hud-text-dim)';
const TEXT_MUT = 'var(--hud-text-faint)';
const CHAR_COLORS = {
    brawn: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].brawn,
    agility: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].agility,
    intellect: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].intellect,
    cunning: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].cunning,
    willpower: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].willpower,
    presence: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].presence
};
// ─── Player Identity Helpers ──────────────────────────────────────────────────
function getSessionKey() {
    let k = localStorage.getItem('holocron_session_key');
    if (!k) {
        k = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["randomUUID"])();
        localStorage.setItem('holocron_session_key', k);
    }
    return k;
}
function CharacterCard({ char, state, online, animDelay, onClaim, onDelete }) {
    _s();
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const cardBorder = state === 'self' ? BORDER_HI : hovered ? BORDER_MD : BORDER;
    const cardBg = PANEL;
    const cardShadow = state === 'self' ? '0 2px 10px rgba(90,40,24,0.18)' : hovered ? '0 4px 12px rgba(90,40,24,0.10)' : 'none';
    const cardCursor = state === 'self' ? 'default' : 'pointer';
    const cardTransform = hovered && state !== 'self' ? 'translateY(-2px)' : 'none';
    const avatarBorderColor = state === 'self' ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : BORDER_MD;
    const avatarShadow = state === 'self' ? '0 0 8px rgba(90,40,24,0.2)' : 'none';
    const dotColor = state === 'self' ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : online ? SUCCESS : TEXT_MUT;
    const dotPulse = state === 'self' || online ? 'pulse-dot 1.8s ease-in-out infinite' : 'none';
    const nameColor = state === 'self' ? GOLD_L : TEXT;
    const characteristics = [
        {
            key: 'brawn',
            label: 'BR'
        },
        {
            key: 'agility',
            label: 'AG'
        },
        {
            key: 'intellect',
            label: 'INT'
        },
        {
            key: 'cunning',
            label: 'CUN'
        },
        {
            key: 'willpower',
            label: 'WIL'
        },
        {
            key: 'presence',
            label: 'PR'
        }
    ];
    const derived = [
        {
            label: 'Soak',
            value: char.soak
        },
        {
            label: 'Wounds',
            value: char.wound_threshold
        },
        {
            label: 'Strain',
            value: char.strain_threshold
        },
        {
            label: 'M.Def',
            value: char.defense_melee
        },
        {
            label: 'R.Def',
            value: char.defense_ranged
        },
        {
            label: 'XP',
            value: char.xp_available
        }
    ];
    function handleClick() {
        onClaim();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative',
            overflow: 'hidden',
            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
            padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3]} ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3]} ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]}`,
            backdropFilter: 'blur(12px)',
            transition: `all ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`,
            animation: `fadeUp 0.5s ${animDelay}s ease both`,
            border: `1px solid ${cardBorder}`,
            background: cardBg,
            cursor: cardCursor,
            transform: cardTransform,
            boxShadow: cardShadow
        },
        onClick: handleClick,
        onMouseEnter: ()=>setHovered(true),
        onMouseLeave: ()=>setHovered(false),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '0.125rem',
                    background: `linear-gradient(90deg, transparent, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}, transparent)`,
                    opacity: state === 'self' ? 1 : hovered ? 0.6 : 0,
                    transition: `opacity ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            hovered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: (e)=>{
                    e.stopPropagation();
                    onDelete();
                },
                style: {
                    position: 'absolute',
                    top: '0.375rem',
                    right: '0.375rem',
                    width: '1.375rem',
                    height: '1.375rem',
                    background: 'rgba(224,82,82,0.12)',
                    border: `1px solid ${DANGER}`,
                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                    fontWeight: 700,
                    color: DANGER,
                    transition: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default,
                    zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].raised,
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"]
                },
                title: "Delete character",
                children: "×"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 156,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3],
                    marginBottom: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3],
                    alignItems: 'flex-start'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flexShrink: 0,
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].full,
                            overflow: 'hidden',
                            position: 'relative',
                            border: `2px solid ${avatarBorderColor}`,
                            boxShadow: avatarShadow,
                            background: RAISED,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        children: [
                            char.portrait_url ? // eslint-disable-next-line @next/next/no-img-element
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: char.portrait_url,
                                alt: "",
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 192,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h2,
                                    color: state === 'self' ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : TEXT_SEC
                                },
                                children: char.name.charAt(0)
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 194,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: 'absolute',
                                    bottom: '0.3125rem',
                                    right: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2],
                                    width: '0.75rem',
                                    height: '0.75rem',
                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].full,
                                    border: `2px solid ${BG}`,
                                    background: dotColor,
                                    animation: dotPulse
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 202,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 179,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            minWidth: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h3,
                                    fontWeight: 700,
                                    color: nameColor,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                },
                                children: char.name
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 214,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    color: TEXT_MUT,
                                    textTransform: 'uppercase',
                                    marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1],
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                },
                                children: [
                                    char.career_key,
                                    " // ",
                                    char.species_key
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 217,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '0.375rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3125rem',
                                    border: `1px solid ${state === 'self' ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : TEXT_MUT}`,
                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                    padding: `0.1875rem ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]}`,
                                    background: state === 'self' ? 'var(--hud-surface-lo)' : 'transparent'
                                },
                                children: [
                                    state === 'available' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                            color: TEXT_MUT,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Unselected"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 230,
                                        columnNumber: 15
                                    }, this),
                                    state === 'self' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: '0.375rem',
                                                    height: '0.375rem',
                                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].full,
                                                    background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                                    animation: 'pulse-dot 1.8s ease-in-out infinite'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                                lineNumber: 236,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase'
                                                },
                                                children: "You · Active"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                                lineNumber: 237,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 221,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 213,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    borderTop: `1px solid ${BORDER}`,
                    paddingTop: '0.625rem',
                    marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1],
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]
                },
                children: characteristics.map(({ key, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: INPUT_BG,
                            border: `1px solid ${BORDER}`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                            padding: '0.3125rem 0.125rem',
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h3,
                                    fontWeight: 700,
                                    color: CHAR_COLORS[key]
                                },
                                children: char[key]
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 263,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: TEXT_MUT,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em'
                                },
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 266,
                                columnNumber: 13
                            }, this)
                        ]
                    }, key, true, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 256,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 247,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2],
                    display: 'flex',
                    gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1],
                    flexWrap: 'wrap'
                },
                children: derived.map(({ label, value })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: INPUT_BG,
                            border: `1px solid ${BORDER}`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                            padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]} ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]}`,
                            minWidth: '2.625rem',
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h3,
                                    fontWeight: 700,
                                    color: TEXT
                                },
                                children: value
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 284,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: TEXT_MUT,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em'
                                },
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 287,
                                columnNumber: 13
                            }, this)
                        ]
                    }, label, true, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 276,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 274,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: '0.375rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: TEXT_MUT,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em'
                                        },
                                        children: "Wounds"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 299,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: TEXT_MUT
                                        },
                                        children: [
                                            char.wound_current,
                                            "/",
                                            char.wound_threshold
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 300,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 298,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.1875rem',
                                    marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]
                                },
                                children: Array.from({
                                    length: char.wound_threshold
                                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '0.5rem',
                                            height: '0.5rem',
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                            background: i < char.wound_current ? DANGER : 'transparent',
                                            border: `1px solid ${i < char.wound_current ? DANGER : 'color-mix(in srgb, var(--hud-accent) 25%, transparent)'}`
                                        }
                                    }, i, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 304,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 302,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 297,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: TEXT_MUT,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em'
                                        },
                                        children: "Strain"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 315,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: TEXT_MUT
                                        },
                                        children: [
                                            char.strain_current,
                                            "/",
                                            char.strain_threshold
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 316,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 314,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.1875rem',
                                    marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]
                                },
                                children: Array.from({
                                    length: char.strain_threshold
                                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '0.5rem',
                                            height: '0.5rem',
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                            background: i < char.strain_current ? WARN : 'transparent',
                                            border: `1px solid ${i < char.strain_current ? WARN : 'var(--hud-border)'}`
                                        }
                                    }, i, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 322,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 320,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 313,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 295,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
_s(CharacterCard, "V8YbV+gTZxGliGj1g0fftBlvsq4=");
_c = CharacterCard;
function Home() {
    _s1();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [characters, setCharacters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sessions, setSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [campaignId, setCampaignId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [campaignName, setCampaignName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Legacy of Rebellion');
    const [sessionKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Home.useState": ()=>("TURBOPACK compile-time truthy", 1) ? getSessionKey() : "TURBOPACK unreachable"
    }["Home.useState"]);
    const [onlineKeys, setOnlineKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showGmInput, setShowGmInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gmPin, setGmPin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [sessionMode, setSessionMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('exploration');
    const [createHovered, setCreateHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const campaignIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ── Data load ──────────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            async function load() {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
                // 1. Fetch first campaign
                const { data: campaigns } = await supabase.from('campaigns').select('*').limit(1);
                if (!campaigns?.length) return;
                const camp = campaigns[0];
                setCampaignId(camp.id);
                campaignIdRef.current = camp.id;
                setCampaignName(camp.name ?? 'Legacy of Rebellion');
                if (camp.settings?.session_mode) setSessionMode(String(camp.settings.session_mode));
                // 2. Fetch characters
                const { data: chars } = await supabase.from('characters').select('*').eq('campaign_id', camp.id).eq('is_archived', false);
                if (chars) setCharacters(chars);
                // 3. Fetch character_sessions
                const { data: sessData } = await supabase.from('character_sessions').select('*').eq('campaign_id', camp.id);
                if (sessData) setSessions(sessData);
            }
            load();
        }
    }["Home.useEffect"], []);
    // ── Realtime: sessions ─────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (!campaignId) return;
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            async function refetchSessions() {
                const { data } = await supabase.from('character_sessions').select('*').eq('campaign_id', campaignId);
                if (data) setSessions(data);
            }
            const channel = supabase.channel('char-sessions-rt').on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'character_sessions',
                filter: `campaign_id=eq.${campaignId}`
            }, {
                "Home.useEffect.channel": ()=>{
                    void refetchSessions();
                }
            }["Home.useEffect.channel"]).subscribe();
            return ({
                "Home.useEffect": ()=>{
                    void supabase.removeChannel(channel);
                }
            })["Home.useEffect"];
        }
    }["Home.useEffect"], [
        campaignId
    ]);
    // ── Realtime: presence ─────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (!campaignId || !sessionKey) return;
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const ch = supabase.channel(`lobby-presence-${campaignId}`);
            ch.on('presence', {
                event: 'sync'
            }, {
                "Home.useEffect": ()=>{
                    const state = ch.presenceState();
                    setOnlineKeys(Object.values(state).flat().map({
                        "Home.useEffect": (p)=>p.sessionKey
                    }["Home.useEffect"]));
                }
            }["Home.useEffect"]).subscribe({
                "Home.useEffect": async (status)=>{
                    if (status === 'SUBSCRIBED') {
                        await ch.track({
                            sessionKey
                        });
                    }
                }
            }["Home.useEffect"]);
            return ({
                "Home.useEffect": ()=>{
                    void supabase.removeChannel(ch);
                }
            })["Home.useEffect"];
        }
    }["Home.useEffect"], [
        campaignId,
        sessionKey
    ]);
    // ── claimCharacter ─────────────────────────────────────────────────────────
    async function claimCharacter(characterId) {
        if (!campaignId) return;
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
        // Release any previous claim by this session_key
        await supabase.from('character_sessions').delete().eq('session_key', sessionKey).eq('campaign_id', campaignId);
        // Release any existing session for this character (so anyone can take it)
        await supabase.from('character_sessions').delete().eq('character_id', characterId).eq('campaign_id', campaignId);
        // Claim the character
        await supabase.from('character_sessions').insert({
            campaign_id: campaignId,
            character_id: characterId,
            session_key: sessionKey,
            is_active: true
        });
        router.push(`/character/${characterId}${campaignId ? `?campaign=${campaignId}` : ''}`);
    }
    // ── deleteCharacter ────────────────────────────────────────────────────────
    async function deleteCharacter(charId, charName) {
        if (!confirm(`Delete ${charName}? This cannot be undone.`)) return;
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
        await supabase.from('character_sessions').delete().eq('character_id', charId);
        await supabase.from('xp_transactions').delete().eq('character_id', charId);
        await supabase.from('character_critical_injuries').delete().eq('character_id', charId);
        await supabase.from('character_gear').delete().eq('character_id', charId);
        await supabase.from('character_armor').delete().eq('character_id', charId);
        await supabase.from('character_weapons').delete().eq('character_id', charId);
        await supabase.from('character_talents').delete().eq('character_id', charId);
        await supabase.from('character_skills').delete().eq('character_id', charId);
        await supabase.from('character_specializations').delete().eq('character_id', charId);
        await supabase.from('characters').delete().eq('id', charId);
        setCharacters((prev)=>prev.filter((c)=>c.id !== charId));
    }
    // ── GM login ───────────────────────────────────────────────────────────────
    async function handleGmLogin() {
        if (!campaignId) return;
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
        const { data } = await supabase.from('campaigns').select('gm_pin').eq('id', campaignId).single();
        if (data?.gm_pin === gmPin) {
            router.push(`/gm?campaign=${campaignId}`);
        } else {
            alert('Invalid PIN');
        }
    }
    // ── Derived state ──────────────────────────────────────────────────────────
    function getCardState(charId) {
        const session = sessions.find((s)=>s.character_id === charId && s.is_active);
        if (session?.session_key === sessionKey) return 'self';
        return 'available';
    }
    function getSession(charId) {
        return sessions.find((s)=>s.character_id === charId && s.is_active);
    }
    function isPlayerOnline(charId) {
        const sess = getSession(charId);
        return sess ? onlineKeys.includes(sess.session_key) : false;
    }
    const activeSessions = sessions.filter((s)=>s.is_active);
    // ── Render ─────────────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '100vw',
            minHeight: '100vh',
            background: BG,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowX: 'hidden',
            position: 'relative'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                style: {
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].base,
                    opacity: 0.018,
                    width: '100%',
                    height: '100%'
                },
                xmlns: "http://www.w3.org/2000/svg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pattern", {
                            id: "crosshatch",
                            width: "20",
                            height: "20",
                            patternUnits: "userSpaceOnUse",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: "0",
                                    y1: "20",
                                    x2: "20",
                                    y2: "0",
                                    stroke: ACCENT_HEX,
                                    strokeWidth: "0.5"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                    lineNumber: 516,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: "0",
                                    y1: "0",
                                    x2: "20",
                                    y2: "20",
                                    stroke: ACCENT_HEX,
                                    strokeWidth: "0.5"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                    lineNumber: 517,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                            lineNumber: 515,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 514,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        width: "100%",
                        height: "100%",
                        fill: "url(#crosshatch)"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 520,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 510,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].base,
                    pointerEvents: 'none',
                    background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(224,58,30,0.06) 0%, transparent 70%)`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 524,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'relative',
                    zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].raised,
                    width: '100%',
                    maxWidth: '77.5rem',
                    padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][12]} var(--space-5) 3.75rem`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][6]
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            animation: 'fadeDown 0.6s ease both',
                            width: '100%'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: 'relative',
                                    textAlign: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].bodyLg,
                                            color: GOLD_DIM,
                                            letterSpacing: 0
                                        },
                                        children: "⬡"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 541,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            position: 'absolute',
                                            right: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].bodyLg,
                                            color: GOLD_DIM,
                                            letterSpacing: 0
                                        },
                                        children: "⬡"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 545,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontWeight: 900,
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h1,
                                            letterSpacing: '0.4em',
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                            textShadow: '0 0 40px rgba(224,58,30,0.45)',
                                            display: 'inline-block'
                                        },
                                        children: "HOLOCRON"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 549,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 540,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    letterSpacing: '0.3em',
                                    color: TEXT_MUT,
                                    textTransform: 'uppercase',
                                    marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][5],
                                    textAlign: 'center'
                                },
                                children: "Star Wars RPG · Campaign Manager"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 561,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][5],
                                    height: '1px',
                                    background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)`
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 572,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 539,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            animation: 'fadeDown 0.6s 0.1s ease both',
                            width: '100%',
                            background: PANEL,
                            border: `1px solid ${BORDER}`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                            backdropFilter: 'blur(12px)',
                            padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]} ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][4]}`,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '0.5rem',
                                            height: '0.5rem',
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].full,
                                            background: SUCCESS,
                                            animation: 'pulse-dot 1.8s ease-in-out infinite'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 595,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: TEXT_SEC
                                        },
                                        children: [
                                            onlineKeys.length,
                                            " players online · ",
                                            activeSessions.length,
                                            " claimed"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 600,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 594,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '1px',
                                    height: '1.25rem',
                                    background: BORDER_MD,
                                    flexShrink: 0,
                                    margin: `0 0.75rem`
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 606,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: TEXT_SEC
                                },
                                children: [
                                    "Session · ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            letterSpacing: '0.05em'
                                        },
                                        children: sessionMode.toUpperCase()
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 610,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 609,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '1px',
                                    height: '1.25rem',
                                    background: BORDER_MD,
                                    flexShrink: 0,
                                    margin: `0 0.75rem`
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 614,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: TEXT_MUT
                                },
                                children: campaignName
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 617,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 580,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            letterSpacing: '0.28em',
                            textTransform: 'uppercase',
                            color: TEXT_MUT,
                            width: '100%'
                        },
                        children: "Select Your Character"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 623,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                            gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3]
                        },
                        children: characters.map((char, index)=>{
                            const cardState = getCardState(char.id);
                            const online = isPlayerOnline(char.id);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CharacterCard, {
                                char: char,
                                state: cardState,
                                online: online,
                                animDelay: 0.15 + index * 0.08,
                                onClaim: ()=>void claimCharacter(char.id),
                                onDelete: ()=>void deleteCharacter(char.id, char.name)
                            }, char.id, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 645,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 635,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            animation: 'fadeUp 0.5s 0.3s ease both',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3],
                            marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2],
                            width: '100%',
                            maxWidth: '22.5rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.push(`/create?campaign=${campaignId}`),
                                onMouseEnter: ()=>setCreateHovered(true),
                                onMouseLeave: ()=>setCreateHovered(false),
                                style: {
                                    background: createHovered ? 'color-mix(in srgb, var(--hud-accent) 20%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
                                    boxShadow: createHovered ? '0 0 16px rgba(224,58,30,0.2)' : 'none',
                                    border: `1px solid ${BORDER_MD}`,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    padding: `0.625rem 0`,
                                    width: '100%',
                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                    cursor: 'pointer',
                                    transition: `all ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`,
                                    textTransform: 'uppercase'
                                },
                                children: "+ Create New Character"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 670,
                                columnNumber: 11
                            }, this),
                            !showGmInput ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowGmInput(true),
                                className: "gm-access-btn",
                                style: {
                                    background: 'transparent',
                                    border: `1px solid ${BORDER}`,
                                    color: TEXT_MUT,
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    letterSpacing: '0.1em',
                                    padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]} 0`,
                                    width: '100%',
                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                    cursor: 'pointer',
                                    transition: `all ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`,
                                    textTransform: 'uppercase'
                                },
                                children: "GM Access"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 696,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2],
                                    width: '100%',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "password",
                                        maxLength: 4,
                                        placeholder: "PIN",
                                        value: gmPin,
                                        onChange: (e)=>setGmPin(e.target.value),
                                        onKeyDown: (e)=>e.key === 'Enter' && void handleGmLogin(),
                                        autoFocus: true,
                                        style: {
                                            flex: 1,
                                            background: INPUT_BG,
                                            border: `1px solid ${BORDER_MD}`,
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                            padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]} ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3]}`,
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                            color: TEXT,
                                            textAlign: 'center',
                                            letterSpacing: '0.3em',
                                            outline: 'none'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 718,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>void handleGmLogin(),
                                        style: {
                                            background: 'color-mix(in srgb, var(--hud-accent) 20%, transparent)',
                                            border: `1px solid ${BORDER_HI}`,
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            letterSpacing: '0.1em',
                                            padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]} ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][4]}`,
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                            cursor: 'pointer',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Enter"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                        lineNumber: 740,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 717,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                    color: TEXT_MUT,
                                    textAlign: 'center'
                                },
                                children: "Edge of the Empire // Age of Rebellion // Force and Destiny"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                                lineNumber: 761,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                        lineNumber: 659,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 530,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .gm-access-btn:hover { border-color: var(--hud-border-hi); }
      `
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 768,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$VersionWatermark$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VersionWatermark"], {}, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/app/page.tsx",
                lineNumber: 783,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/app/page.tsx",
        lineNumber: 499,
        columnNumber: 5
    }, this);
}
_s1(Home, "nrVnx/I6YGbeNscYNXuB7aSoFu4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = Home;
var _c, _c1;
__turbopack_context__.k.register(_c, "CharacterCard");
__turbopack_context__.k.register(_c1, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=star-wars-rpg_src_2b45a8d8._.js.map