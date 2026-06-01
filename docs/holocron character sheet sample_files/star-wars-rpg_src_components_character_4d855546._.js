(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/src/components/character/TalentTree.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TalentTree",
    ()=>TalentTree
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/Modal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
/* ═══════════════════════════════════════════════════════ */ /*  DESIGN TOKENS                                         */ /* ═══════════════════════════════════════════════════════ */ // All font references use FONT_BODY (JetBrains Mono) per design system rules.
// FC (formerly var(--font-body)) and FR (formerly var(--font-body)) unified.
const FR = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"];
const BG = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].bg;
const TEXT = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text;
const DIM = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim;
const FAINT = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint;
const BORDER = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border;
const PANEL_BG = 'var(--hud-surface-lo)';
const GOLD_BR = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold;
// GOLD_DIM: dimmed accent at ~45% opacity — no HUD named property, use CSS var
const GOLD_DIM = 'color-mix(in srgb, var(--hud-accent) 45%, transparent)';
// Activation type colours — pre-approved hex exceptions: no CSS vars exist for
// these specific asset/state colours (BLUE, GREEN, RED, ORANGE). Kept as-is per
// the pre-approved hex exception rule for type-identity swatches.
const BLUE = '#5AAAE0';
const GREEN = '#4EC87A';
const RED = '#E05050';
const ORANGE = '#E07855';
/* ═══════════════════════════════════════════════════════ */ /*  CONSTANTS                                             */ /* ═══════════════════════════════════════════════════════ */ const ROW_COSTS = [
    5,
    10,
    15,
    20,
    25
];
const ACTIVATION_COLORS = {
    'Passive': BLUE,
    'Action': RED,
    'Maneuver': ORANGE,
    'Incidental': GREEN,
    'Incidental (OOT)': GREEN
};
// viewBox geometry (5 rows × 160px = 800px tall)
const COL_CENTERS = [
    100,
    300,
    500,
    700
];
const ROW_CENTERS = [
    80,
    240,
    400,
    560,
    720
];
const NODE_HALF_W = 92;
const NODE_HALF_H = 68;
/* ═══════════════════════════════════════════════════════ */ /*  ACTIVATION DOT                                        */ /* ═══════════════════════════════════════════════════════ */ function ActivationDot({ activation, dim }) {
    const color = ACTIVATION_COLORS[activation] ?? DIM;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].full,
            background: color,
            opacity: dim ? 0.4 : 1,
            flexShrink: 0
        }
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
        lineNumber: 96,
        columnNumber: 5
    }, this);
}
_c = ActivationDot;
/* ═══════════════════════════════════════════════════════ */ /*  NODE CARD                                             */ /* ═══════════════════════════════════════════════════════ */ function NodeCard({ node, xpAvailable, isGmMode, onClickAvailable, onClickRemove, onClickLocked, previewMode }) {
    _s();
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const cost = ROW_COSTS[node.row];
    const actColor = ACTIVATION_COLORS[node.activation] ?? DIM;
    if (node.purchased) {
        /* ── PURCHASED ── */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                padding: '8px 10px',
                position: 'relative',
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                overflow: 'hidden',
                background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
                border: '1.5px solid color-mix(in srgb, var(--hud-accent) 55%, transparent)',
                boxShadow: '0 0 14px color-mix(in srgb, var(--hud-accent) 12%, transparent), inset 0 1px 0 color-mix(in srgb, var(--hud-accent) 18%, transparent)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        // rgba(78,200,122,*) — GREEN identity swatch, pre-approved
                        background: 'rgba(78,200,122,0.15)',
                        border: '1px solid rgba(78,200,122,0.4)',
                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                        padding: '1px 5px',
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                        fontWeight: 700,
                        color: GREEN,
                        lineHeight: 1.4
                    },
                    children: "✓ Owned"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 156,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                        fontWeight: 700,
                        color: GOLD_BR,
                        lineHeight: 1.25,
                        paddingRight: 44
                    },
                    children: node.name
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 177,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivationDot, {
                            activation: node.activation
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 192,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: FR,
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                fontWeight: 700,
                                color: actColor,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            },
                            children: node.activation
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 193,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 191,
                    columnNumber: 9
                }, this),
                node.isRanked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        gap: 4
                    },
                    children: [
                        0,
                        1,
                        2
                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                display: 'inline-block',
                                width: 6,
                                height: 6,
                                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].full,
                                background: i === 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : 'color-mix(in srgb, var(--hud-accent) 20%, transparent)',
                                border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`,
                                boxShadow: i === 0 ? `0 0 4px ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}` : 'none'
                            }
                        }, i, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 211,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 209,
                    columnNumber: 11
                }, this),
                node.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: DIM,
                        lineHeight: 1.5,
                        overflowY: 'auto',
                        fontWeight: 600,
                        flex: 1,
                        minHeight: 0
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                        text: node.description
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 241,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 229,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'absolute',
                        bottom: 5,
                        right: 6,
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                        color: FAINT
                    },
                    children: [
                        cost,
                        " XP"
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 246,
                    columnNumber: 9
                }, this),
                isGmMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: (e)=>{
                        e.stopPropagation();
                        onClickRemove(node);
                    },
                    style: {
                        position: 'absolute',
                        bottom: 4,
                        left: 4,
                        width: 16,
                        height: 16,
                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                        // rgba(224,80,80,*) — RED identity swatch, pre-approved
                        border: '1px solid rgba(224,80,80,0.5)',
                        background: 'rgba(224,80,80,0.12)',
                        color: RED,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                        lineHeight: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                    },
                    children: "×"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 261,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
            lineNumber: 139,
            columnNumber: 7
        }, this);
    }
    if (previewMode || node.canPurchase) {
        /* ── AVAILABLE (or preview) ── */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            onClick: ()=>previewMode ? onClickLocked(node) : onClickAvailable(node),
            onMouseEnter: ()=>setHovered(true),
            onMouseLeave: ()=>setHovered(false),
            style: {
                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                padding: '8px 10px',
                position: 'relative',
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                fontWeight: 600,
                gap: 4,
                overflow: 'hidden',
                background: hovered ? 'color-mix(in srgb, var(--hud-accent) 7%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 2%, transparent)',
                border: `1.5px solid ${hovered ? 'color-mix(in srgb, var(--hud-accent) 50%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 22%, transparent)'}`,
                cursor: 'pointer',
                transition: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        background: 'var(--hud-surface-lo)',
                        border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                        padding: '1px 5px',
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                        color: GOLD_DIM,
                        lineHeight: 1.4
                    },
                    children: [
                        cost,
                        " XP"
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 315,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                        fontWeight: 700,
                        color: TEXT,
                        lineHeight: 1.25,
                        paddingRight: 44
                    },
                    children: node.name
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 334,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivationDot, {
                            activation: node.activation
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 349,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: FR,
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                color: actColor,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            },
                            children: node.activation
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 350,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 348,
                    columnNumber: 9
                }, this),
                node.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: DIM,
                        lineHeight: 1.5,
                        overflowY: 'auto',
                        flex: 1,
                        minHeight: 0
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                        text: node.description
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 376,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 365,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
            lineNumber: 293,
            columnNumber: 7
        }, this);
    }
    /* ── LOCKED ── hoverable for preview, not purchasable */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: ()=>onClickLocked(node),
        onMouseEnter: ()=>setHovered(true),
        onMouseLeave: ()=>setHovered(false),
        style: {
            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
            padding: '8px 10px',
            position: 'relative',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            overflow: 'hidden',
            background: hovered ? 'color-mix(in srgb, var(--hud-accent) 6%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 1%, transparent)',
            border: hovered ? '1px dashed color-mix(in srgb, var(--hud-accent) 22%, transparent)' : '1px dashed color-mix(in srgb, var(--hud-accent) 12%, transparent)',
            opacity: hovered ? 0.82 : 0.42,
            cursor: 'pointer',
            transition: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    fontFamily: FR,
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: FAINT,
                    letterSpacing: '0.06em'
                },
                children: [
                    "🔒 ",
                    ROW_COSTS[node.row],
                    " XP"
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                lineNumber: 407,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: FR,
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    fontWeight: 700,
                    color: hovered ? TEXT : FAINT,
                    lineHeight: 1.25,
                    paddingRight: 52,
                    transition: `color ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`
                },
                children: node.name
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                lineNumber: 416,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivationDot, {
                        activation: node.activation,
                        dim: !hovered
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 427,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: FR,
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: hovered ? ACTIVATION_COLORS[node.activation] ?? DIM : FAINT,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            transition: `color ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`
                        },
                        children: node.activation
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 428,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                lineNumber: 426,
                columnNumber: 7
            }, this),
            node.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: FR,
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    color: DIM,
                    lineHeight: 1.5,
                    overflowY: 'auto',
                    flex: 1,
                    minHeight: 0,
                    opacity: hovered ? 0.9 : 0.5,
                    transition: `opacity ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                    text: node.description
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 447,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                lineNumber: 440,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
        lineNumber: 385,
        columnNumber: 5
    }, this);
}
_s(NodeCard, "V8YbV+gTZxGliGj1g0fftBlvsq4=");
_c1 = NodeCard;
/* ═══════════════════════════════════════════════════════ */ /*  PURCHASE POPOVER                                      */ /* ═══════════════════════════════════════════════════════ */ function PurchasePopover({ node, xpAvailable, onConfirm, onCancel }) {
    const cost = ROW_COSTS[node.row];
    const remaining = (xpAvailable ?? 0) - cost;
    const canAfford = xpAvailable === undefined || xpAvailable >= cost;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
        open: true,
        onClose: onCancel,
        maxWidth: 320,
        zIndex: 500,
        backdrop: "rgba(0,0,0,0.4)",
        borderColor: "color-mix(in srgb, var(--hud-accent) 50%, transparent)",
        shadow: "0 8px 32px rgba(0,0,0,0.7)",
        panelBackground: "var(--hud-surface-hi)",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: '14px 16px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                        marginBottom: 4
                    },
                    children: [
                        node.name,
                        node.isRanked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: FR,
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                color: DIM,
                                marginLeft: 6
                            },
                            children: "· Rank 1"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 496,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 486,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: DIM,
                        marginBottom: 2
                    },
                    children: [
                        "Spend ",
                        cost,
                        " XP"
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 503,
                    columnNumber: 9
                }, this),
                xpAvailable !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: remaining >= 0 ? GREEN : RED,
                        marginBottom: 10
                    },
                    children: [
                        "Remaining after: ",
                        remaining,
                        " XP"
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 509,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: 1,
                        background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border,
                        marginBottom: 10
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 522,
                    columnNumber: 9
                }, this),
                node.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: DIM,
                        lineHeight: 1.5,
                        maxHeight: 100,
                        overflowY: 'auto',
                        marginBottom: 10
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                        text: node.description
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 537,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 526,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: 1,
                        background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border,
                        marginBottom: 10
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 542,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onCancel,
                            style: {
                                background: 'transparent',
                                border: `1px solid ${BORDER}`,
                                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                fontFamily: FR,
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                color: DIM,
                                padding: '6px 16px',
                                cursor: 'pointer'
                            },
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 546,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: canAfford ? onConfirm : undefined,
                            disabled: !canAfford,
                            style: {
                                background: 'color-mix(in srgb, var(--hud-accent) 15%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--hud-accent) 50%, transparent)',
                                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                fontFamily: FR,
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                fontWeight: 700,
                                color: canAfford ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : GOLD_DIM,
                                padding: '6px 16px',
                                cursor: canAfford ? 'pointer' : 'not-allowed',
                                opacity: canAfford ? 1 : 0.5
                            },
                            children: [
                                "Spend ",
                                cost,
                                " XP"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 561,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 545,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
            lineNumber: 484,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
        lineNumber: 474,
        columnNumber: 5
    }, this);
}
_c2 = PurchasePopover;
/* ═══════════════════════════════════════════════════════ */ /*  LOCKED PREVIEW POPOVER                                */ /* ═══════════════════════════════════════════════════════ */ function LockedInfoPopover({ node, onClose, isPreview }) {
    const cost = ROW_COSTS[node.row];
    const actColor = ACTIVATION_COLORS[node.activation] ?? DIM;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
        open: true,
        onClose: onClose,
        maxWidth: 320,
        zIndex: 500,
        backdrop: "rgba(0,0,0,0.4)",
        borderColor: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border,
        shadow: "0 8px 32px rgba(0,0,0,0.7)",
        panelBackground: "var(--hud-surface-hi)",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: '14px 16px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: isPreview ? 'var(--hud-surface-lo)' : 'transparent',
                        border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                        padding: '5px 10px',
                        marginBottom: 10
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label
                            },
                            children: isPreview ? '👁' : '🔒'
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 621,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: FR,
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                fontWeight: 700,
                                color: isPreview ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : FAINT,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase'
                            },
                            children: isPreview ? 'Spec Preview — read-only' : 'Locked — purchase adjacent talents first'
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 622,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 614,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                        color: TEXT,
                        marginBottom: 4
                    },
                    children: [
                        node.name,
                        node.isRanked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: FR,
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                color: DIM,
                                marginLeft: 6
                            },
                            children: "· Ranked"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 631,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 628,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 8
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivationDot, {
                                    activation: node.activation
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                    lineNumber: 638,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontFamily: FR,
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                        color: actColor,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em'
                                    },
                                    children: node.activation
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                    lineNumber: 639,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 637,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: FR,
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                color: GOLD_DIM,
                                marginLeft: 'auto'
                            },
                            children: [
                                cost,
                                " XP when unlocked"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 643,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 636,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: 1,
                        background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border,
                        marginBottom: 10
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 646,
                    columnNumber: 9
                }, this),
                node.description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: DIM,
                        lineHeight: 1.5,
                        maxHeight: 140,
                        overflowY: 'auto',
                        marginBottom: 12
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                        text: node.description
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 654,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 650,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: FAINT,
                        fontStyle: 'italic',
                        marginBottom: 12
                    },
                    children: "No description available."
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 657,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    style: {
                        width: '100%',
                        background: 'transparent',
                        border: `1px solid ${BORDER}`,
                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                        fontFamily: FR,
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: DIM,
                        padding: '6px 16px',
                        cursor: 'pointer'
                    },
                    children: "Close"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 662,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
            lineNumber: 612,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
        lineNumber: 602,
        columnNumber: 5
    }, this);
}
_c3 = LockedInfoPopover;
/* ═══════════════════════════════════════════════════════ */ /*  SVG CONNECTION LINES                                  */ /* ═══════════════════════════════════════════════════════ */ function ConnectionLines({ connections, nodeMap }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 800 800",
        preserveAspectRatio: "none",
        style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].base
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("filter", {
                    id: "glow-line",
                    x: "-20%",
                    y: "-20%",
                    width: "140%",
                    height: "140%",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feGaussianBlur", {
                            in: "SourceGraphic",
                            stdDeviation: "2",
                            result: "blur"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 705,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feComposite", {
                            in: "SourceGraphic",
                            in2: "blur",
                            operator: "over"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                            lineNumber: 706,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 704,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                lineNumber: 703,
                columnNumber: 7
            }, this),
            connections.map((conn, i)=>{
                const fromNode = nodeMap.get(`${conn.fromRow}-${conn.fromCol}`);
                const toNode = nodeMap.get(`${conn.toRow}-${conn.toCol}`);
                const bothPurchased = !!(fromNode?.purchased && toNode?.purchased);
                const onePurchased = !!(fromNode?.purchased || toNode?.purchased);
                const stroke = bothPurchased ? 'color-mix(in srgb, var(--hud-accent) 70%, transparent)' : onePurchased ? 'color-mix(in srgb, var(--hud-accent) 35%, transparent)' : 'color-mix(in srgb, var(--hud-accent) 15%, transparent)';
                const strokeWidth = bothPurchased ? 2 : 1.5;
                const filter = bothPurchased ? 'url(#glow-line)' : undefined;
                const isHorizontal = conn.fromRow === conn.toRow;
                const isVertical = conn.fromCol === conn.toCol;
                let x1, y1, x2, y2;
                if (isHorizontal) {
                    const rowCenter = ROW_CENTERS[conn.fromRow];
                    x1 = COL_CENTERS[conn.fromCol] + NODE_HALF_W;
                    x2 = COL_CENTERS[conn.toCol] - NODE_HALF_W;
                    y1 = rowCenter;
                    y2 = rowCenter;
                } else if (isVertical) {
                    const colCenter = COL_CENTERS[conn.fromCol];
                    x1 = colCenter;
                    x2 = colCenter;
                    y1 = ROW_CENTERS[conn.fromRow] + NODE_HALF_H;
                    y2 = ROW_CENTERS[conn.toRow] - NODE_HALF_H;
                } else {
                    // diagonal — connect edge midpoints
                    x1 = COL_CENTERS[conn.fromCol];
                    y1 = ROW_CENTERS[conn.fromRow] + NODE_HALF_H;
                    x2 = COL_CENTERS[conn.toCol];
                    y2 = ROW_CENTERS[conn.toRow] - NODE_HALF_H;
                }
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    stroke: stroke,
                    strokeWidth: strokeWidth,
                    strokeLinecap: "round",
                    filter: filter
                }, i, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                    lineNumber: 746,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
        lineNumber: 690,
        columnNumber: 5
    }, this);
}
_c4 = ConnectionLines;
function TalentTree({ specName, nodes, connections, onPurchase, onRemoveTalent, isGmMode, xpAvailable, previewMode }) {
    _s1();
    const [pendingNode, setPendingNode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [lockedPreview, setLockedPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const nodeMap = new Map();
    for (const node of nodes){
        nodeMap.set(`${node.row}-${node.col}`, node);
    }
    const handleConfirm = ()=>{
        if (pendingNode && onPurchase) {
            onPurchase(pendingNode.talentKey, pendingNode.row, pendingNode.col);
        }
        setPendingNode(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: BG,
            border: `1px solid ${BORDER}`,
            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
            overflow: 'hidden',
            fontFamily: FR
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: PANEL_BG,
                    borderBottom: `1px solid ${BORDER}`,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 700,
                    justifyContent: 'space-between'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FR,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                    lineHeight: 1.3
                                },
                                children: specName
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                lineNumber: 813,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FR,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: DIM,
                                    marginTop: 2
                                },
                                children: [
                                    "Specialization Tree · ",
                                    nodes.length,
                                    " Talents"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                lineNumber: 816,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 812,
                        columnNumber: 9
                    }, this),
                    xpAvailable !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'var(--hud-surface-lo)',
                            border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                            padding: '2px 10px',
                            fontFamily: FR,
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                        },
                        children: [
                            xpAvailable,
                            " XP"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 822,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                lineNumber: 801,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: 'var(--hud-surface-lo)',
                    padding: '8px 16px',
                    display: 'flex',
                    fontWeight: 600,
                    gap: 16,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    display: 'inline-block',
                                    width: 8,
                                    height: 8,
                                    background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                lineNumber: 852,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FR,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: DIM
                                },
                                children: "Purchased"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                lineNumber: 860,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 851,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    display: 'inline-block',
                                    width: 8,
                                    height: 8,
                                    background: 'transparent',
                                    border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                lineNumber: 864,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FR,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: DIM
                                },
                                children: "Available"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                lineNumber: 873,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 863,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    display: 'inline-block',
                                    width: 8,
                                    height: 8,
                                    background: 'color-mix(in srgb, var(--hud-accent) 15%, transparent)',
                                    border: '1px dashed color-mix(in srgb, var(--hud-accent) 30%, transparent)',
                                    opacity: 0.5
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                lineNumber: 877,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FR,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: DIM
                                },
                                children: "Locked (click to preview)"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                lineNumber: 887,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 876,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginLeft: 'auto',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        },
                        children: [
                            {
                                label: 'Passive',
                                color: BLUE
                            },
                            {
                                label: 'Action',
                                color: RED
                            },
                            {
                                label: 'Maneuver',
                                color: ORANGE
                            },
                            {
                                label: 'Incidental',
                                color: GREEN
                            }
                        ].map(({ label, color })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            display: 'inline-block',
                                            width: 8,
                                            height: 8,
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].full,
                                            background: color
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                        lineNumber: 899,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FR,
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: DIM
                                        },
                                        children: label
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                        lineNumber: 908,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, label, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                lineNumber: 898,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 891,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                lineNumber: 839,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'relative',
                    overflow: 'visible',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gridTemplateRows: 'repeat(5, 160px)',
                    gap: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConnectionLines, {
                        connections: connections,
                        nodeMap: nodeMap
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                        lineNumber: 926,
                        columnNumber: 9
                    }, this),
                    Array.from({
                        length: 5
                    }, (_, row)=>Array.from({
                            length: 4
                        }, (_, col)=>{
                            const node = nodeMap.get(`${row}-${col}`);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: 'relative',
                                    padding: 10,
                                    zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].raised,
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    justifyContent: 'stretch'
                                },
                                children: node ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NodeCard, {
                                    node: node,
                                    xpAvailable: xpAvailable,
                                    isGmMode: isGmMode,
                                    previewMode: previewMode,
                                    onClickAvailable: (n)=>setPendingNode(n),
                                    onClickLocked: (n)=>setLockedPreview(n),
                                    onClickRemove: (n)=>{
                                        if (onRemoveTalent) {
                                            onRemoveTalent(n.talentKey, ROW_COSTS[n.row]);
                                        }
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                    lineNumber: 945,
                                    columnNumber: 19
                                }, this) : /* Empty cell */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                        border: `1px dashed ${FAINT}`,
                                        opacity: 0.3
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                    lineNumber: 960,
                                    columnNumber: 19
                                }, this)
                            }, `${row}-${col}`, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                                lineNumber: 933,
                                columnNumber: 15
                            }, this);
                        }))
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                lineNumber: 915,
                columnNumber: 7
            }, this),
            pendingNode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PurchasePopover, {
                node: pendingNode,
                xpAvailable: xpAvailable,
                onConfirm: handleConfirm,
                onCancel: ()=>setPendingNode(null)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                lineNumber: 978,
                columnNumber: 9
            }, this),
            lockedPreview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LockedInfoPopover, {
                node: lockedPreview,
                onClose: ()=>setLockedPreview(null),
                isPreview: previewMode
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
                lineNumber: 988,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/TalentTree.tsx",
        lineNumber: 791,
        columnNumber: 5
    }, this);
}
_s1(TalentTree, "tCJrrWrXOum3r0M/FO7d0inxiS0=");
_c5 = TalentTree;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "ActivationDot");
__turbopack_context__.k.register(_c1, "NodeCard");
__turbopack_context__.k.register(_c2, "PurchasePopover");
__turbopack_context__.k.register(_c3, "LockedInfoPopover");
__turbopack_context__.k.register(_c4, "ConnectionLines");
__turbopack_context__.k.register(_c5, "TalentTree");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/PanelSearchInput.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PanelSearchInput",
    ()=>PanelSearchInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function PanelSearchInput({ value, onChange, placeholder = 'Search...' }) {
    _s();
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative mb-2.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none leading-none",
                style: {
                    color: 'var(--hud-text-faint)',
                    fontSize: 14
                },
                children: "🔍"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/PanelSearchInput.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: inputRef,
                className: `hud-input${value ? ' hud-input--padded-r' : ''}`,
                type: "text",
                value: value,
                onChange: (e)=>onChange(e.target.value),
                placeholder: placeholder
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/PanelSearchInput.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onMouseDown: (e)=>{
                    e.preventDefault();
                    onChange('');
                    inputRef.current?.focus();
                },
                className: "hov-gold-text absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer leading-none p-0",
                style: {
                    color: 'var(--hud-text-faint)',
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm
                },
                children: "✕"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/PanelSearchInput.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/PanelSearchInput.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_s(PanelSearchInput, "iD9XNNsNOlNDckBemnvlLS+aHYk=");
_c = PanelSearchInput;
var _c;
__turbopack_context__.k.register(_c, "PanelSearchInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ForcePowerTree",
    ()=>ForcePowerTree
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$MarkupText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/MarkupText.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/Modal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
/* ═══════════════════════════════════════════════════════ */ /*  THEME CONSTANTS                                       */ /* ═══════════════════════════════════════════════════════ */ const BG = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].bg;
// GOLD_DIM: faint text used for locked-state XP label; maps to textFaint token
const GOLD_DIM = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint;
const GOLD_BR = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold;
const TEXT = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text;
const DIM = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim;
// FAINT was 'var(--hud-border-hi)' in original — maps to HUD.borderHi
const FAINT = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].borderHi;
const BORDER = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border;
// Pre-approved hex exceptions: no CSS vars for these specific type-identity swatches
const BLUE = '#5AAAE0';
const GREEN = '#4EC87A';
const RED = '#E05050';
const PANEL_BG = 'var(--hud-surface-lo)';
const COLS = 4;
/* ═══════════════════════════════════════════════════════ */ /*  PURCHASE POPOVER                                      */ /* ═══════════════════════════════════════════════════════ */ function PurchasePopover({ node, xpAvailable, onConfirm, onCancel }) {
    const remaining = (xpAvailable ?? 0) - node.cost;
    const canAfford = xpAvailable === undefined || xpAvailable >= node.cost;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
        open: true,
        onClose: onCancel,
        maxWidth: 320,
        zIndex: 500,
        backdrop: "rgba(0,0,0,0.4)",
        borderColor: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].borderHi,
        shadow: "0 8px 32px rgba(0,0,0,0.7)",
        panelBackground: "var(--hud-surface-hi)",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: '14px 16px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                        marginBottom: 4
                    },
                    children: node.name
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: DIM,
                        marginBottom: 2
                    },
                    children: [
                        "Spend ",
                        node.cost,
                        " XP"
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, this),
                xpAvailable !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: remaining >= 0 ? GREEN : RED,
                        marginBottom: 10
                    },
                    children: [
                        "Remaining after: ",
                        remaining,
                        " XP"
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 95,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: 1,
                        background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border,
                        marginBottom: 10
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 99,
                    columnNumber: 9
                }, this),
                node.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: DIM,
                        lineHeight: 1.5,
                        maxHeight: 100,
                        overflowY: 'auto',
                        marginBottom: 10
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$MarkupText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MarkupText"], {
                        text: node.description
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                        lineNumber: 102,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 101,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: 1,
                        background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border,
                        marginBottom: 10
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onCancel,
                            style: {
                                background: 'transparent',
                                border: `1px solid ${BORDER}`,
                                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                color: DIM,
                                padding: '6px 16px',
                                cursor: 'pointer'
                            },
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: canAfford ? onConfirm : undefined,
                            disabled: !canAfford,
                            style: {
                                // rgba(224,58,30,*) — force identity accent, pre-approved
                                background: 'rgba(224,58,30,0.15)',
                                border: '1px solid rgba(224,58,30,0.5)',
                                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                fontWeight: 700,
                                color: canAfford ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : GOLD_DIM,
                                padding: '6px 16px',
                                cursor: canAfford ? 'pointer' : 'not-allowed',
                                opacity: canAfford ? 1 : 0.5
                            },
                            children: [
                                "Spend ",
                                node.cost,
                                " XP"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
            lineNumber: 87,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
_c = PurchasePopover;
/* ═══════════════════════════════════════════════════════ */ /*  TOOLTIP                                               */ /* ═══════════════════════════════════════════════════════ */ const TOOLTIP_W = 300;
function ForceTooltip({ node, pos }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            left: pos.left,
            ...pos.top !== undefined ? {
                top: pos.top
            } : {},
            ...pos.bottom !== undefined ? {
                bottom: pos.bottom
            } : {},
            zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].tooltip,
            width: TOOLTIP_W,
            background: 'var(--hud-surface-hi)',
            // HUD.gold + hex alpha suffix: dynamic alpha construction — kept as template
            border: `1px solid color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 25%, transparent)`,
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,.5)',
            pointerEvents: 'none',
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: node.purchased ? GOLD_BR : TEXT,
                    marginBottom: '6px'
                },
                children: node.name
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontWeight: 700,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                    },
                    children: [
                        node.cost,
                        " XP"
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 191,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 186,
                columnNumber: 7
            }, this),
            node.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    color: DIM,
                    lineHeight: '1.6'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$MarkupText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MarkupText"], {
                    text: node.description
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 197,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 196,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: '8px',
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: node.purchased ? GREEN : node.canPurchase ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : DIM
                },
                children: node.purchased ? 'PURCHASED' : node.canPurchase ? 'CLICK TO PURCHASE' : 'LOCKED'
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
_c1 = ForceTooltip;
/* ═══════════════════════════════════════════════════════ */ /*  NODE                                                  */ /* ═══════════════════════════════════════════════════════ */ function ForceNode({ node, onClickPurchase, xpAvailable, onHoverChange }) {
    _s();
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [tooltipPos, setTooltipPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        left: 0,
        top: 0
    });
    const nodeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canAfford = xpAvailable !== undefined ? xpAvailable >= node.cost : true;
    const isClickable = node.canPurchase && !node.purchased;
    const handleMouseEnter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ForceNode.useCallback[handleMouseEnter]": ()=>{
            setHovered(true);
            onHoverChange?.(true);
            if (nodeRef.current) {
                const r = nodeRef.current.getBoundingClientRect();
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const left = Math.max(8, Math.min(r.left + r.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - 8));
                if (vh - r.bottom >= 200) {
                    setTooltipPos({
                        left,
                        top: r.bottom + 8
                    });
                } else {
                    setTooltipPos({
                        left,
                        bottom: vh - r.top + 8
                    });
                }
            }
        }
    }["ForceNode.useCallback[handleMouseEnter]"], [
        onHoverChange
    ]);
    const handleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ForceNode.useCallback[handleClick]": ()=>{
            if (!node.canPurchase || node.purchased) return;
            if (!canAfford) {
                __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(`Not enough XP — need ${node.cost}, have ${xpAvailable ?? 0}`);
                return;
            }
            onClickPurchase?.(node);
        }
    }["ForceNode.useCallback[handleClick]"], [
        node,
        canAfford,
        xpAvailable,
        onClickPurchase
    ]);
    const isPurchased = node.purchased;
    const isAvailable = node.canPurchase && !node.purchased;
    let nodeStyle;
    if (isPurchased) {
        nodeStyle = {
            // rgba(224,58,30,*) — force identity accent, pre-approved
            background: 'rgba(224,58,30,0.10)',
            border: `1.5px solid rgba(224,58,30,0.55)`,
            boxShadow: '0 0 14px rgba(224,58,30,0.12), inset 0 1px 0 rgba(224,58,30,0.18)'
        };
    } else if (isAvailable) {
        nodeStyle = {
            // Dynamic hover: rgba(224,58,30,*) — force identity, pre-approved
            background: hovered ? 'rgba(224,58,30,0.07)' : 'transparent',
            border: `1.5px dashed ${hovered ? 'rgba(224,58,30,0.5)' : 'rgba(224,58,30,0.22)'}`
        };
    } else {
        nodeStyle = {
            background: 'transparent',
            border: `1px dashed ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
            opacity: 0.5
        };
    }
    const nameColor = isPurchased ? GOLD_BR : isAvailable ? TEXT : FAINT;
    let costColor;
    if (isPurchased) {
        costColor = GREEN;
    } else if (isAvailable && !canAfford) {
        costColor = RED;
    } else {
        costColor = GOLD_DIM;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: nodeRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: ()=>{
            setHovered(false);
            onHoverChange?.(false);
        },
        onClick: handleClick,
        style: {
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            ...nodeStyle,
            padding: '8px 6px',
            cursor: isClickable ? 'pointer' : 'default',
            transition: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default,
            transform: hovered && isAvailable ? 'scale(1.05)' : 'scale(1)',
            // Z.dropdown (20) for hovered node — elevated within grid but below overlays
            zIndex: hovered ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].dropdown : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].raised,
            overflow: 'visible',
            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md
        },
        children: [
            isPurchased && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: '-1px',
                    right: '-1px',
                    width: '12px',
                    height: '12px',
                    background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 313,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                    fontWeight: 700,
                    color: nameColor,
                    textAlign: 'center',
                    lineHeight: 1.3,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                },
                children: node.name
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 321,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    fontWeight: 700,
                    marginTop: '4px',
                    color: costColor
                },
                children: isPurchased ? '✓' : `${node.cost} XP`
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 334,
                columnNumber: 7
            }, this),
            hovered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ForceTooltip, {
                node: node,
                pos: tooltipPos
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 343,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
        lineNumber: 292,
        columnNumber: 5
    }, this);
}
_s(ForceNode, "JFyNCVFa7X+8ThhbfKJUNM7qtK8=");
_c2 = ForceNode;
/* ═══════════════════════════════════════════════════════ */ /*  SVG CONNECTIONS                                       */ /* ═══════════════════════════════════════════════════════ */ function ForceConnectionLines({ connections, nodeMap, gridRef }) {
    _s1();
    const [lines, setLines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const computeLines = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ForceConnectionLines.useCallback[computeLines]": ()=>{
            const grid = gridRef.current;
            if (!grid) return;
            const gridRect = grid.getBoundingClientRect();
            const newLines = [];
            for (const conn of connections){
                const fromEl = grid.querySelector(`[data-cell="${conn.fromRow}-${conn.fromCol}"]`);
                const toEl = grid.querySelector(`[data-cell="${conn.toRow}-${conn.toCol}"]`);
                if (!fromEl || !toEl) continue;
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();
                let x1, y1, x2, y2;
                const isVertical = conn.fromCol === conn.toCol;
                if (isVertical) {
                    x1 = fromRect.left + fromRect.width / 2 - gridRect.left;
                    y1 = fromRect.bottom - gridRect.top;
                    x2 = toRect.left + toRect.width / 2 - gridRect.left;
                    y2 = toRect.top - gridRect.top;
                } else {
                    const goingRight = conn.toCol > conn.fromCol;
                    x1 = (goingRight ? fromRect.right : fromRect.left) - gridRect.left;
                    y1 = fromRect.top + fromRect.height / 2 - gridRect.top;
                    x2 = (goingRight ? toRect.left : toRect.right) - gridRect.left;
                    y2 = toRect.top + toRect.height / 2 - gridRect.top;
                }
                newLines.push({
                    x1,
                    y1,
                    x2,
                    y2,
                    from: `${conn.fromRow}-${conn.fromCol}`,
                    to: `${conn.toRow}-${conn.toCol}`
                });
            }
            setLines(newLines);
        }
    }["ForceConnectionLines.useCallback[computeLines]"], [
        connections,
        gridRef
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ForceConnectionLines.useEffect": ()=>{
            computeLines();
            window.addEventListener('resize', computeLines);
            return ({
                "ForceConnectionLines.useEffect": ()=>window.removeEventListener('resize', computeLines)
            })["ForceConnectionLines.useEffect"];
        }
    }["ForceConnectionLines.useEffect"], [
        computeLines
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].base,
            overflow: 'visible'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("filter", {
                    id: "force-conn-glow",
                    x: "-20%",
                    y: "-20%",
                    width: "140%",
                    height: "140%",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feGaussianBlur", {
                            in: "SourceGraphic",
                            stdDeviation: "2",
                            result: "blur"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                            lineNumber: 408,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feComposite", {
                            in: "SourceGraphic",
                            in2: "blur",
                            operator: "over"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                            lineNumber: 409,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 407,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 406,
                columnNumber: 7
            }, this),
            lines.map((ln, i)=>{
                const fromNode = nodeMap.get(ln.from);
                const toNode = nodeMap.get(ln.to);
                const bothPurchased = fromNode?.purchased && toNode?.purchased;
                const onePurchased = fromNode?.purchased || toNode?.purchased;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: ln.x1,
                    y1: ln.y1,
                    x2: ln.x2,
                    y2: ln.y2,
                    // rgba(224,58,30,*) — force identity accent strokes, pre-approved
                    stroke: bothPurchased ? 'rgba(224,58,30,0.7)' : onePurchased ? 'rgba(224,58,30,0.35)' : 'rgba(224,58,30,0.15)',
                    strokeWidth: bothPurchased ? 2 : 1.5,
                    strokeLinecap: "round",
                    filter: bothPurchased ? 'url(#force-conn-glow)' : undefined
                }, i, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 418,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
        lineNumber: 405,
        columnNumber: 5
    }, this);
}
_s1(ForceConnectionLines, "ACmrOqyKTc6bSBW1p/n47H2K+u0=");
_c3 = ForceConnectionLines;
function ForcePowerTree({ powerName, nodes, connections, onPurchase, xpAvailable, purchasedCount, totalCount }) {
    _s2();
    const [confirmNode, setConfirmNode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hoveredCell, setHoveredCell] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const gridRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const nodeMap = new Map();
    for (const node of nodes){
        nodeMap.set(`${node.row}-${node.col}`, node);
    }
    // Determine rows from nodes
    const maxRow = nodes.reduce((max, n)=>Math.max(max, n.row), 0);
    const rows = maxRow + 1;
    const handleConfirmPurchase = ()=>{
        if (confirmNode && onPurchase) {
            onPurchase(confirmNode.abilityKey, confirmNode.row, confirmNode.col, confirmNode.cost);
        }
        setConfirmNode(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: BG,
            border: `1px solid ${BORDER}`,
            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
            overflow: 'hidden',
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"]
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: PANEL_BG,
                    borderBottom: `1px solid ${BORDER}`,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    fontWeight: 700,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                },
                                children: powerName
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                                lineNumber: 475,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: DIM,
                                    marginTop: 2
                                },
                                children: [
                                    purchasedCount,
                                    "/",
                                    totalCount,
                                    " abilities"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                                lineNumber: 481,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                        lineNumber: 474,
                        columnNumber: 9
                    }, this),
                    xpAvailable !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'var(--hud-surface-lo)',
                            border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                            padding: '2px 10px',
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                        },
                        children: [
                            xpAvailable,
                            " XP"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                        lineNumber: 489,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 468,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '16px'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: gridRef,
                    style: {
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                        gap: '8px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'absolute',
                                inset: 0,
                                zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].base,
                                pointerEvents: 'none'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ForceConnectionLines, {
                                connections: connections,
                                nodeMap: nodeMap,
                                gridRef: gridRef
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                                lineNumber: 515,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                            lineNumber: 514,
                            columnNumber: 11
                        }, this),
                        Array.from({
                            length: rows
                        }, (_, row)=>Array.from({
                                length: COLS
                            }, (_, col)=>{
                                const node = nodeMap.get(`${row}-${col}`);
                                if (!node) {
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        "data-cell": `${row}-${col}`,
                                        style: {
                                            minHeight: '160px'
                                        }
                                    }, `${row}-${col}`, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                                        lineNumber: 522,
                                        columnNumber: 24
                                    }, this);
                                }
                                // Skip cells that are covered by a span (span === 0)
                                if (node.span === 0) {
                                    return null;
                                }
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    "data-cell": `${row}-${col}`,
                                    style: {
                                        gridColumn: node.span > 1 ? `${col + 1} / span ${node.span}` : col + 1,
                                        gridRow: row + 1,
                                        // Z.overlay (100) for the hovered cell to clear other grid cells;
                                        // original used 50 which sits between Z.dropdown(20) and Z.overlay(100).
                                        // Z.overlay is the correct token-scale choice for elevated grid content.
                                        zIndex: hoveredCell === `${row}-${col}` ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].overlay : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].raised,
                                        minHeight: '160px',
                                        position: 'relative'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ForceNode, {
                                        node: node,
                                        onClickPurchase: (n)=>setConfirmNode(n),
                                        xpAvailable: xpAvailable,
                                        onHoverChange: (h)=>setHoveredCell(h ? `${row}-${col}` : null)
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                                        lineNumber: 543,
                                        columnNumber: 19
                                    }, this)
                                }, `${row}-${col}`, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                                    lineNumber: 529,
                                    columnNumber: 17
                                }, this);
                            }))
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                    lineNumber: 504,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 503,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    // rgba(0,0,0,0.2) — pre-approved rgba(0,0,0,*) overlay tint; no token for this specific shade
                    background: 'rgba(0,0,0,0.2)',
                    padding: '8px 16px',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                },
                children: [
                    // rgba(224,58,30,*) — force identity accent, pre-approved
                    {
                        color: 'rgba(224,58,30,0.55)',
                        label: 'Purchased',
                        style: 'solid'
                    },
                    {
                        color: 'rgba(224,58,30,0.22)',
                        label: 'Available',
                        style: 'dashed'
                    },
                    {
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border,
                        label: 'Locked',
                        style: 'dashed'
                    }
                ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '14px',
                                    height: '14px',
                                    border: `1.5px ${item.style} ${item.color}`,
                                    opacity: item.label === 'Locked' ? 0.5 : 1,
                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                                lineNumber: 570,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: DIM
                                },
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                                lineNumber: 571,
                                columnNumber: 13
                            }, this)
                        ]
                    }, item.label, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                        lineNumber: 569,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 557,
                columnNumber: 7
            }, this),
            confirmNode !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PurchasePopover, {
                node: confirmNode,
                xpAvailable: xpAvailable,
                onConfirm: handleConfirmPurchase,
                onCancel: ()=>setConfirmNode(null)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
                lineNumber: 578,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/ForcePowerTree.tsx",
        lineNumber: 460,
        columnNumber: 5
    }, this);
}
_s2(ForcePowerTree, "r1wGRLEBbO6VjCrrU9pDqKp1iHc=");
_c4 = ForcePowerTree;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "PurchasePopover");
__turbopack_context__.k.register(_c1, "ForceTooltip");
__turbopack_context__.k.register(_c2, "ForceNode");
__turbopack_context__.k.register(_c3, "ForceConnectionLines");
__turbopack_context__.k.register(_c4, "ForcePowerTree");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/QualityBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QualityBadge",
    ()=>QualityBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/Tooltip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
function QualityBadge({ quality, refQualityMap, variant = 'desktop' }) {
    const ref = refQualityMap[quality.key];
    const baseName = ref?.name ?? quality.key;
    const displayName = quality.count != null ? `${baseName} ${quality.count}` : baseName;
    const description = ref?.description ?? '';
    const chipStyle = variant === 'desktop' ? {
        background: 'var(--hud-surface-mid)',
        border: '1px solid var(--hud-border)',
        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].xl,
        padding: '1px 7px',
        cursor: description ? 'help' : 'default',
        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
        fontSize: 'clamp(0.55rem, 0.9vw, 0.65rem)',
        color: 'var(--hud-gold)',
        whiteSpace: 'nowrap'
    } : {
        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
        fontSize: 'clamp(0.55rem, 2vw, 0.65rem)',
        color: 'var(--hud-accent)',
        background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
        border: '1px solid color-mix(in srgb, var(--hud-accent) 20%, transparent)',
        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
        padding: '1px 6px',
        cursor: description ? 'help' : 'default',
        whiteSpace: 'nowrap'
    };
    const chip = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: chipStyle,
        children: displayName
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/character/QualityBadge.tsx",
        lineNumber: 45,
        columnNumber: 16
    }, this);
    if (!description) return chip;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
        placement: "top",
        maxWidth: 280,
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipLabel"], {
                    children: displayName
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/QualityBadge.tsx",
                    lineNumber: 55,
                    columnNumber: 11
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipBody"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                        text: description
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/QualityBadge.tsx",
                        lineNumber: 56,
                        columnNumber: 20
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/QualityBadge.tsx",
                    lineNumber: 56,
                    columnNumber: 11
                }, void 0)
            ]
        }, void 0, true),
        children: chip
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/character/QualityBadge.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_c = QualityBadge;
var _c;
__turbopack_context__.k.register(_c, "QualityBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SkillRollPopover",
    ()=>SkillRollPopover
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/design-tokens.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/dice/DiceFace.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/dice-engine.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
// ── Local tokens ──────────────────────────────────────────────────────────────
const POP_BG = 'var(--hud-surface-hi)';
const BORDER = 'var(--hud-border-hi)';
const SEC_LABEL = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim;
const DIM = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border;
// ── Difficulty presets ────────────────────────────────────────────────────────
const DIFF_PRESETS = [
    {
        label: 'Simple',
        dif: 0
    },
    {
        label: 'Easy',
        dif: 1
    },
    {
        label: 'Average',
        dif: 2
    },
    {
        label: 'Hard',
        dif: 3
    },
    {
        label: 'Daunting',
        dif: 4
    },
    {
        label: 'Formidable',
        dif: 5
    }
];
// ── Adjustable dice (display order: 2×2 grid) ─────────────────────────────────
const ADJ_DICE = [
    {
        key: 'difficulty'
    },
    {
        key: 'challenge'
    },
    {
        key: 'boost'
    },
    {
        key: 'setback'
    }
];
// ── ± button ──────────────────────────────────────────────────────────────────
function AdjBtn({ label, disabled, onClick }) {
    _s();
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        disabled: disabled,
        onMouseEnter: ()=>setHovered(true),
        onMouseLeave: ()=>setHovered(false),
        style: {
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--hud-surface-mid)',
            border: `1px solid ${hovered && !disabled ? 'color-mix(in srgb, var(--hud-accent) 40%, transparent)' : DIM}`,
            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: disabled ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
            fontSize: 15,
            lineHeight: 1,
            opacity: disabled ? 0.4 : 1,
            transition: `border-color ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`,
            flexShrink: 0
        },
        children: label
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_s(AdjBtn, "V8YbV+gTZxGliGj1g0fftBlvsq4=");
_c = AdjBtn;
const ACTIVATION_SHORT = {
    taPassive: 'Passive',
    taAction: 'Action',
    taManeuver: 'Maneuver',
    taIncidental: 'Incidental',
    taIncidentalOOT: 'OOT Incidental'
};
function SkillRollPopover({ skill, anchor, talentHints, onRoll, onClose }) {
    _s1();
    const [difficulty, setDifficulty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [challenge, setChallenge] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [boost, setBoost] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [setback, setSetback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Position state — null = not yet measured (render hidden first)
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const popoverRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { proficiency, ability } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSkillPool"])(skill.charVal, skill.rank);
    // Measure after first paint, then position
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "SkillRollPopover.useLayoutEffect": ()=>{
            const el = popoverRef.current;
            if (!el) return;
            const h = el.offsetHeight;
            const w = el.offsetWidth;
            const MARGIN = 8;
            const top = anchor.top > h + 16 ? anchor.top - h - MARGIN // above
             : anchor.bottom + MARGIN // below
            ;
            const left = Math.min(Math.max(8, anchor.left), window.innerWidth - w - 16);
            setPos({
                top,
                left
            });
            requestAnimationFrame({
                "SkillRollPopover.useLayoutEffect": ()=>setVisible(true)
            }["SkillRollPopover.useLayoutEffect"]);
        }
    }["SkillRollPopover.useLayoutEffect"], [
        anchor
    ]);
    // Click-outside and Escape
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SkillRollPopover.useEffect": ()=>{
            const onMouseDown = {
                "SkillRollPopover.useEffect.onMouseDown": (e)=>{
                    if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                        onClose();
                    }
                }
            }["SkillRollPopover.useEffect.onMouseDown"];
            const onKeyDown = {
                "SkillRollPopover.useEffect.onKeyDown": (e)=>{
                    if (e.key === 'Escape') onClose();
                }
            }["SkillRollPopover.useEffect.onKeyDown"];
            document.addEventListener('mousedown', onMouseDown);
            document.addEventListener('keydown', onKeyDown);
            return ({
                "SkillRollPopover.useEffect": ()=>{
                    document.removeEventListener('mousedown', onMouseDown);
                    document.removeEventListener('keydown', onKeyDown);
                }
            })["SkillRollPopover.useEffect"];
        }
    }["SkillRollPopover.useEffect"], [
        onClose
    ]);
    const handleRoll = ()=>{
        const pool = {
            proficiency,
            ability,
            difficulty,
            challenge,
            boost,
            setback,
            force: 0
        };
        onRoll((0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rollPool"])(pool), skill.name, pool);
    };
    // Map dice key → count + setter
    const getAdj = (key)=>{
        if (key === 'difficulty') return [
            difficulty,
            setDifficulty
        ];
        if (key === 'challenge') return [
            challenge,
            setChallenge
        ];
        if (key === 'boost') return [
            boost,
            setBoost
        ];
        return [
            setback,
            setSetback
        ];
    };
    const isActiveDiffPreset = (dif)=>difficulty === dif && challenge === 0;
    const popover = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: popoverRef,
        style: {
            position: 'fixed',
            top: pos?.top ?? anchor.top,
            left: pos?.left ?? anchor.left,
            zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].overlay,
            width: 'clamp(280px, 30vw, 360px)',
            background: POP_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].xl,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            // rgba(0,0,0,*) shadow overlay — pre-approved exception
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            padding: 16,
            visibility: pos ? 'visible' : 'hidden',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 150ms ease-out, transform 150ms ease-out'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 6,
                    marginBottom: 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                            fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                            fontWeight: 700,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                        },
                        children: skill.name
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: 'color-mix(in srgb, var(--hud-accent) 40%, transparent)',
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)'
                        },
                        children: "·"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                        lineNumber: 198,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
                            color: 'color-mix(in srgb, var(--hud-accent) 50%, transparent)'
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_ABBR3"][skill.charKey]
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                lineNumber: 189,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                text: "Your Dice"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 10
                },
                children: proficiency === 0 && ability === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: 'clamp(0.65rem, 1.1vw, 0.75rem)',
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                        fontStyle: 'italic'
                    },
                    children: "No dice — characteristic is 0"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                    lineNumber: 212,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        gap: 14,
                        alignItems: 'center'
                    },
                    children: [
                        proficiency > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        gap: 3
                                    },
                                    children: Array.from({
                                        length: proficiency
                                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                                            type: "proficiency",
                                            size: 10
                                        }, i, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                            lineNumber: 226,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                    lineNumber: 224,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                        fontSize: 'clamp(0.58rem, 1vw, 0.68rem)',
                                        color: 'rgba(245,197,24,0.65)'
                                    },
                                    children: "PRF"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                    lineNumber: 230,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                            lineNumber: 223,
                            columnNumber: 15
                        }, this),
                        ability > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        gap: 3
                                    },
                                    children: Array.from({
                                        length: ability
                                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                                            type: "ability",
                                            size: 10
                                        }, i, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                            lineNumber: 239,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                    lineNumber: 237,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                        fontSize: 'clamp(0.58rem, 1vw, 0.68rem)',
                                        color: 'rgba(76,175,80,0.65)'
                                    },
                                    children: "ABL"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                    lineNumber: 243,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                            lineNumber: 236,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                    lineNumber: 221,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                lineNumber: 210,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    marginBottom: 12,
                    paddingBottom: 2
                },
                children: DIFF_PRESETS.map((p)=>{
                    const active = isActiveDiffPreset(p.dif);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setDifficulty(p.dif);
                            setChallenge(0);
                        },
                        style: {
                            display: 'inline-block',
                            marginRight: 4,
                            padding: '3px 7px',
                            // Difficulty dice identity colour — pre-approved exception
                            background: active ? 'rgba(123,31,162,0.3)' : 'rgba(123,31,162,0.12)',
                            border: `1px solid ${active ? 'rgba(123,31,162,0.9)' : 'rgba(123,31,162,0.4)'}`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                            cursor: 'pointer',
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: 'clamp(0.55rem, 0.9vw, 0.65rem)',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            // Active tint tied to difficulty die identity — pre-approved exception
                            color: active ? '#CE93D8' : 'color-mix(in srgb, var(--hud-accent) 50%, transparent)',
                            transition: `border-color ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}, background ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`,
                            whiteSpace: 'nowrap'
                        },
                        children: p.label
                    }, p.label, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                        lineNumber: 257,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                text: "Add Dice"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                lineNumber: 286,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px 20px',
                    marginBottom: 14
                },
                children: ADJ_DICE.map(({ key })=>{
                    const [count, setCount] = getAdj(key);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                                type: key,
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                lineNumber: 292,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdjBtn, {
                                label: "-",
                                disabled: count <= 0,
                                onClick: ()=>setCount(Math.max(0, count - 1))
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                lineNumber: 293,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: 'clamp(0.8rem, 1.3vw, 0.95rem)',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                    minWidth: 24,
                                    textAlign: 'center'
                                },
                                children: count
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                lineNumber: 294,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdjBtn, {
                                label: "+",
                                disabled: false,
                                onClick: ()=>setCount(count + 1)
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                lineNumber: 303,
                                columnNumber: 15
                            }, this)
                        ]
                    }, key, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                        lineNumber: 291,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                lineNumber: 287,
                columnNumber: 7
            }, this),
            talentHints && talentHints.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            height: 1,
                            background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border,
                            marginBottom: 10
                        }
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                        lineNumber: 312,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                        text: "Relevant Talents"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                        lineNumber: 313,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            marginBottom: 12
                        },
                        children: talentHints.map((hint, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'var(--hud-surface-lo)',
                                    border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                                    padding: '6px 8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginBottom: 3
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: 'clamp(0.65rem, 1.1vw, 0.75rem)',
                                                    fontWeight: 700,
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                                },
                                                children: hint.name
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                                lineNumber: 323,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: 'clamp(0.55rem, 0.9vw, 0.62rem)',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase',
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                                    border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                    padding: '0 4px'
                                                },
                                                children: ACTIVATION_SHORT[hint.activation] ?? hint.activation
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                                lineNumber: 331,
                                                columnNumber: 19
                                            }, this),
                                            hint.ranks > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: 'clamp(0.55rem, 0.9vw, 0.62rem)',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.06em',
                                                    textTransform: 'uppercase',
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
                                                    background: 'var(--hud-surface-mid)',
                                                    border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                    padding: '0 5px'
                                                },
                                                children: [
                                                    "Rank ",
                                                    hint.ranks
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                                lineNumber: 345,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                        lineNumber: 322,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: 'clamp(0.55rem, 0.95vw, 0.65rem)',
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                            lineHeight: 1.45
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                            text: hint.description
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                            lineNumber: 367,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                        lineNumber: 361,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                                lineNumber: 316,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                        lineNumber: 314,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 1,
                    background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border,
                    marginBottom: 12
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                lineNumber: 376,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleRoll,
                style: {
                    width: '100%',
                    height: 40,
                    background: `linear-gradient(135deg, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 0%, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 100%)`,
                    border: 'none',
                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                    cursor: 'pointer',
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                    fontSize: 'clamp(0.75rem, 1.3vw, 0.9rem)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--hud-vital-text)'
                },
                children: "Roll"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
                lineNumber: 379,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
        lineNumber: 166,
        columnNumber: 5
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(popover, document.body);
}
_s1(SkillRollPopover, "cqq9+HuAtbvQCeBZWYvp1MP2EqY=");
_c1 = SkillRollPopover;
// ── Shared section label ──────────────────────────────────────────────────────
function SectionLabel({ text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
            fontSize: 'clamp(0.55rem, 1vw, 0.65rem)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: SEC_LABEL,
            marginBottom: 6
        },
        children: text
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/character/SkillRollPopover.tsx",
        lineNumber: 407,
        columnNumber: 5
    }, this);
}
_c2 = SectionLabel;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "AdjBtn");
__turbopack_context__.k.register(_c1, "SkillRollPopover");
__turbopack_context__.k.register(_c2, "SectionLabel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/DutyCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DutyCard",
    ()=>DutyCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
const panelStyle = {
    position: 'relative',
    background: 'var(--hud-surface-lo)',
    backdropFilter: 'blur(12px)',
    border: `1px solid rgba(79,195,247,0.2)`,
    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
    padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3]} ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][4]}`
};
function contributionRank(value) {
    if (value >= 90) return {
        rank: 5,
        label: 'Hero of the Alliance'
    };
    if (value >= 70) return {
        rank: 4,
        label: 'Distinguished Service'
    };
    if (value >= 50) return {
        rank: 3,
        label: 'Proven Rebel'
    };
    if (value >= 30) return {
        rank: 2,
        label: 'Trusted Operative'
    };
    return {
        rank: 1,
        label: 'Recruit'
    };
}
function DutyCard({ dutyType, dutyValue, dutyLore, dutyCustomName, resolvedTypeName }) {
    const displayName = dutyCustomName || resolvedTypeName || dutyType;
    const progress = Math.min(100, Math.max(0, dutyValue));
    const { rank, label } = contributionRank(progress);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: panelStyle,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    fontWeight: 700,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].blue,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    marginBottom: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]
                                },
                                children: "Duty"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    fontWeight: 700,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                                },
                                children: displayName
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'right'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h3,
                                    fontWeight: 700,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].blue,
                                    lineHeight: 1
                                },
                                children: dutyValue
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]
                                },
                                children: "/ 100"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 4,
                    background: 'rgba(79,195,247,0.12)',
                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                    marginBottom: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2],
                    overflow: 'hidden'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: '100%',
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, rgba(79,195,247,0.5), ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].blue})`,
                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                        transition: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2],
                    marginBottom: dutyLore ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2] : 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]
                        },
                        children: [
                            1,
                            2,
                            3,
                            4,
                            5
                        ].map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 8,
                                    height: 8,
                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                    background: r <= rank ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].blue : 'rgba(79,195,247,0.12)',
                                    border: `1px solid ${r <= rank ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].blue : 'rgba(79,195,247,0.2)'}`
                                }
                            }, r, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                            letterSpacing: '0.06em'
                        },
                        children: [
                            "CR",
                            rank,
                            " — ",
                            label
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            dutyLore && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    borderTop: '1px solid rgba(79,195,247,0.12)',
                    paddingTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2],
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                },
                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stripBBCode"])(dutyLore)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
                lineNumber: 87,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/DutyCard.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_c = DutyCard;
var _c;
__turbopack_context__.k.register(_c, "DutyCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/ObligationCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ObligationCard",
    ()=>ObligationCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// ── Local text tokens ─────────────────────────────────────────────────────────
const TEXT = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text;
const DIM = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim;
// ── Threat tier colours ───────────────────────────────────────────────────────
// These are semantic severity colours for the obligation threat scale.
// No CSS custom property equivalents exist for this rarity/severity palette,
// so the hex/rgba values are kept as pre-approved exceptions (same rule as rarity scale).
function getThreatTier(value) {
    if (value >= 100) return {
        color: '#C878F0',
        bg: 'rgba(160,80,220,0.08)',
        border: 'rgba(160,80,220,0.45)',
        label: 'Critical',
        warning: 'OBLIGATION MAXED — Triggered every session until reduced.'
    };
    if (value >= 67) return {
        color: '#E05050',
        bg: 'rgba(224,80,80,0.07)',
        border: 'rgba(224,80,80,0.3)',
        label: 'Severe',
        warning: 'High risk — this obligation is likely to trigger this session.'
    };
    if (value >= 34) return {
        color: '#E09050',
        bg: 'rgba(224,144,80,0.07)',
        border: 'rgba(224,144,80,0.28)',
        label: 'Elevated',
        warning: undefined
    };
    return {
        color: '#4EC87A',
        bg: 'rgba(78,200,122,0.06)',
        border: 'rgba(78,200,122,0.2)',
        label: 'Low',
        warning: undefined
    };
}
function ObligationCard({ obligationType, obligationValue, obligationLore, obligationCustomName, resolvedTypeName }) {
    _s();
    const displayName = obligationCustomName || resolvedTypeName || obligationType;
    const value = Math.min(100, Math.max(0, obligationValue));
    const tier = getThreatTier(value);
    const [pulse, setPulse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Pulsing animation only at 100
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ObligationCard.useEffect": ()=>{
            if (value < 100) {
                setPulse(false);
                return;
            }
            const id = setInterval({
                "ObligationCard.useEffect.id": ()=>setPulse({
                        "ObligationCard.useEffect.id": (p)=>!p
                    }["ObligationCard.useEffect.id"])
            }["ObligationCard.useEffect.id"], 900);
            return ({
                "ObligationCard.useEffect": ()=>clearInterval(id)
            })["ObligationCard.useEffect"];
        }
    }["ObligationCard.useEffect"], [
        value
    ]);
    const panelStyle = {
        position: 'relative',
        background: tier.bg,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${pulse ? tier.color : tier.border}`,
        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
        padding: '14px 16px',
        transition: 'border-color 0.4s ease'
    };
    // Threat bar: 5 segments
    const filled = Math.ceil(value / 100 * 5);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: panelStyle,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 10
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    fontWeight: 700,
                                    color: tier.color,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    marginBottom: 2
                                },
                                children: "Obligation"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    fontWeight: 700,
                                    color: TEXT
                                },
                                children: displayName
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'right'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h3,
                                    fontWeight: 700,
                                    color: tier.color,
                                    lineHeight: 1
                                },
                                children: obligationValue
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                                lineNumber: 99,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    color: DIM,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    marginTop: 2
                                },
                                children: "/ 100"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                                lineNumber: 102,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 3,
                    marginBottom: 10
                },
                children: [
                    1,
                    2,
                    3,
                    4,
                    5
                ].map((seg)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            height: 5,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                            background: seg <= filled ? tier.color : `${tier.color}18`,
                            border: `1px solid ${seg <= filled ? tier.color : `${tier.color}30`}`,
                            transition: 'background 0.3s'
                        }
                    }, seg, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: tier.warning ? 8 : obligationLore ? 10 : 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            fontWeight: 700,
                            color: tier.color,
                            background: `${tier.color}18`,
                            border: `1px solid ${tier.color}40`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                            padding: '1px 6px',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase'
                        },
                        children: tier.label
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                            color: DIM
                        },
                        children: "Threat Level"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this),
            tier.warning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: `${tier.color}12`,
                    border: `1px solid ${tier.color}35`,
                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                    padding: '6px 10px',
                    marginBottom: obligationLore ? 10 : 0,
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    color: tier.color,
                    letterSpacing: '0.04em',
                    lineHeight: 1.4
                },
                children: [
                    "⚠ ",
                    tier.warning
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                lineNumber: 136,
                columnNumber: 9
            }, this),
            obligationLore && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    borderTop: `1px solid ${tier.color}18`,
                    paddingTop: 8,
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    color: DIM,
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                },
                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stripBBCode"])(obligationLore)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
                lineNumber: 154,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/ObligationCard.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, this);
}
_s(ObligationCard, "wo1NH3tNn5J1Ap+tPb0MnQnWl2A=");
_c = ObligationCard;
var _c;
__turbopack_context__.k.register(_c, "ObligationCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/LoreContent.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoreContent",
    ()=>LoreContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/Tooltip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$DutyCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/DutyCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$ObligationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/ObligationCard.tsx [app-client] (ecmascript)");
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
// ─── Auto-save hook ───────────────────────────────────────────────────────────
function useDebounced(init, onSave) {
    _s();
    const [val, setVal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(init);
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const onChange = (v)=>{
        setVal(v);
        if (t.current) clearTimeout(t.current);
        t.current = setTimeout(()=>onSave(v), 800);
    };
    return [
        val,
        onChange
    ];
}
_s(useDebounced, "mrvZ99rZUGzD72DKKcO7uYyJ1ds=");
// ─── Shared style factories ───────────────────────────────────────────────────
const panelStyle = {
    position: 'relative',
    background: 'var(--hud-surface-lo)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--hud-border)',
    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg
};
// ─── Sub-components ───────────────────────────────────────────────────────────
/** Four absolute corner brackets */ function CornerBrackets() {
    const base = {
        position: 'absolute',
        width: 8,
        height: 8
    };
    const color = 'var(--hud-border-hi)';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...base,
                    top: 0,
                    left: 0,
                    borderTop: `1px solid ${color}`,
                    borderLeft: `1px solid ${color}`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...base,
                    top: 0,
                    right: 0,
                    borderTop: `1px solid ${color}`,
                    borderRight: `1px solid ${color}`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...base,
                    bottom: 0,
                    left: 0,
                    borderBottom: `1px solid ${color}`,
                    borderLeft: `1px solid ${color}`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...base,
                    bottom: 0,
                    right: 0,
                    borderBottom: `1px solid ${color}`,
                    borderRight: `1px solid ${color}`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c = CornerBrackets;
/** Gradient-line + uppercase label row */ function SectionLabel({ label }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: 14,
                    height: 1,
                    background: 'linear-gradient(90deg,transparent,var(--hud-border-hi))'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_c1 = SectionLabel;
/** Decorative divider used between backstory sections */ function SectionDivider() {
    const line = {
        flex: 1,
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--hud-border), transparent)'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '18px 0'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: line
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption
                },
                children: "◈"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: line
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
_c2 = SectionDivider;
function ConflictCard({ entries }) {
    const total = entries.reduce((s, e)=>s + e.value, 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            ...panelStyle,
            padding: '14px 16px',
            border: '1px solid rgba(224,80,80,0.2)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CornerBrackets, {}, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                label: "Conflict"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginBottom: 10
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h4,
                            fontWeight: 700,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].red,
                            lineHeight: 1
                        },
                        children: total
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em'
                        },
                        children: "total active"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 127,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this),
            entries.map((entry, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '5px 0',
                        borderBottom: idx < entries.length - 1 ? '1px solid var(--hud-border)' : 'none'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: 7,
                                height: 7,
                                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].full,
                                background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].red,
                                boxShadow: '0 0 6px rgba(224,80,80,0.5)',
                                flexShrink: 0
                            }
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                            lineNumber: 142,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: 1,
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                            },
                            children: entry.label
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                            lineNumber: 150,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                fontWeight: 700,
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].red
                            },
                            children: entry.value
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                            lineNumber: 153,
                            columnNumber: 11
                        }, this)
                    ]
                }, idx, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                    lineNumber: 132,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
        lineNumber: 120,
        columnNumber: 5
    }, this);
}
_c3 = ConflictCard;
/** Drop-cap rendered backstory */ function BackstoryView({ backstory }) {
    const trimmed = backstory.trimStart();
    if (!trimmed) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                fontStyle: 'italic'
            },
            children: "No backstory recorded."
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
            lineNumber: 168,
            columnNumber: 7
        }, this);
    }
    // Split on OggDude paragraph markers so each chunk renders independently.
    const segments = backstory.split(/\[P\]/gi).filter((s)=>s.trim().length > 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: segments.map((seg, idx)=>{
            const segTrimmed = seg.trimStart();
            if (idx === 0 && segTrimmed.length > 0) {
                // First segment: extract drop-cap character, render remainder via RichText
                const firstChar = segTrimmed[0];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: 52,
                                fontWeight: 700,
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                float: 'left',
                                lineHeight: 0.85,
                                marginRight: 10,
                                textShadow: '0 0 20px rgba(224,58,30,0.3)'
                            },
                            children: firstChar
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                            lineNumber: 187,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                            text: segTrimmed.slice(1),
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                lineHeight: 1.9,
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                            }
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                            lineNumber: 199,
                            columnNumber: 15
                        }, this)
                    ]
                }, idx, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                    lineNumber: 186,
                    columnNumber: 13
                }, this);
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    idx > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionDivider, {}, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 209,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                        text: seg,
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                            lineHeight: 1.9,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                        }
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 210,
                        columnNumber: 13
                    }, this)
                ]
            }, idx, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 208,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
        lineNumber: 178,
        columnNumber: 5
    }, this);
}
_c4 = BackstoryView;
function LoreContent({ characterName, careerName, speciesName, gender, backstory, notes, speciesRef, motivationType, motivationSpecific, motivationDesc, motivationConfigured, dutyType, dutyValue, dutyLore, dutyCustomName, dutyResolvedType, obligationType, obligationValue, obligationLore, obligationCustomName, obligationResolvedType, dutyObligationConfigured, conflictEntries, isForceUser, onBackstoryChange, onNotesChange }) {
    _s1();
    const [editingBackstory, setEditingBackstory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [localBackstory, handleBackstoryChange] = useDebounced(backstory, onBackstoryChange);
    const [localNotes, handleNotesChange] = useDebounced(notes, onNotesChange);
    const specialAbilities = Array.isArray(speciesRef?.special_abilities) ? speciesRef.special_abilities : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'row',
            gap: 20,
            width: '100%',
            minHeight: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...panelStyle,
                            padding: '14px 18px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CornerBrackets, {}, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 265,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h4,
                                                    fontWeight: 700,
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                                    lineHeight: 1.1
                                                },
                                                children: characterName
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                lineNumber: 268,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                    fontWeight: 700,
                                                    letterSpacing: '0.18em',
                                                    textTransform: 'uppercase',
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                                    marginTop: 4
                                                },
                                                children: "Character Background & History"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                lineNumber: 271,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                        lineNumber: 267,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setEditingBackstory((e)=>!e),
                                        style: {
                                            border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].borderHi}`,
                                            background: 'color-mix(in srgb, var(--hud-accent) 10%, transparent)',
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                            padding: '5px 11px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                            fontWeight: 700,
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm
                                                },
                                                children: "✎"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                lineNumber: 303,
                                                columnNumber: 15
                                            }, this),
                                            editingBackstory ? 'Preview' : 'Edit Background'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                        lineNumber: 284,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 266,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 264,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...panelStyle,
                            padding: '20px 22px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CornerBrackets, {}, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 311,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                                label: "Origin Story"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 312,
                                columnNumber: 11
                            }, this),
                            editingBackstory ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        value: localBackstory,
                                        onChange: (e)=>handleBackstoryChange(e.target.value),
                                        placeholder: "Write your character's backstory... (OggDude markup supported)",
                                        className: "hud-textarea",
                                        style: {
                                            minHeight: 240
                                        },
                                        autoFocus: true
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                        lineNumber: 316,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                            marginTop: 6,
                                            textAlign: 'right',
                                            letterSpacing: '0.06em'
                                        },
                                        children: "Auto-saves on pause"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                        lineNumber: 323,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BackstoryView, {
                                backstory: localBackstory
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 335,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 310,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...panelStyle,
                            padding: '20px 22px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CornerBrackets, {}, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 341,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                                label: "Field Notes"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 342,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: localNotes,
                                onChange: (e)=>handleNotesChange(e.target.value),
                                placeholder: "Session notes, reminders, contacts, safehouses...",
                                className: "hud-textarea",
                                style: {
                                    minHeight: 120
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 343,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].blue,
                                    marginTop: 6,
                                    textAlign: 'right',
                                    letterSpacing: '0.06em'
                                },
                                children: "Auto-saves on pause"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 349,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 340,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 261,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: 320,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...panelStyle,
                            padding: '14px 16px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CornerBrackets, {}, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 367,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                                label: "Intelligence File"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 368,
                                columnNumber: 11
                            }, this),
                            [
                                [
                                    'Designation',
                                    characterName
                                ],
                                [
                                    'Species',
                                    speciesName
                                ],
                                [
                                    'Career',
                                    careerName
                                ],
                                [
                                    'Gender',
                                    gender || '—'
                                ]
                            ].map(([label, value], idx, arr)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '6px 0',
                                        borderBottom: idx < arr.length - 1 ? '1px solid var(--hud-border)' : 'none'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                                letterSpacing: '0.1em'
                                            },
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                            lineNumber: 388,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                fontWeight: 600,
                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                                            },
                                            children: value
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                            lineNumber: 398,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, label, true, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                    lineNumber: 378,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 366,
                        columnNumber: 9
                    }, this),
                    speciesRef && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...panelStyle,
                            padding: '14px 16px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CornerBrackets, {}, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 408,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'rgba(90,170,224,0.1)',
                                    border: '1px solid rgba(90,170,224,0.3)',
                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].xl,
                                    padding: '2px 10px',
                                    display: 'inline-block',
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].blue,
                                    letterSpacing: '0.1em'
                                },
                                children: "SPECIES"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 411,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h4,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
                                    marginTop: 6
                                },
                                children: speciesRef.name
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 428,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                    marginTop: 2,
                                    letterSpacing: '0.1em'
                                },
                                children: speciesRef.source_book || 'Core Rulebook'
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 433,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 6,
                                    margin: '12px 0'
                                },
                                children: [
                                    [
                                        'Starting XP',
                                        speciesRef.starting_xp
                                    ],
                                    [
                                        'Wound Base',
                                        speciesRef.wound_threshold
                                    ],
                                    [
                                        'Strain Base',
                                        speciesRef.strain_threshold
                                    ],
                                    [
                                        'Source',
                                        speciesRef.source_book || 'Core'
                                    ]
                                ].map(([statLabel, statValue])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: 'var(--hud-surface-mid)',
                                            border: '1px solid var(--hud-border)',
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                            padding: '8px 6px',
                                            textAlign: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h4,
                                                    fontWeight: 600,
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                                    lineHeight: 1
                                                },
                                                children: statValue
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                lineNumber: 470,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                                    marginTop: 3,
                                                    letterSpacing: '0.08em'
                                                },
                                                children: statLabel
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                lineNumber: 473,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, statLabel, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                        lineNumber: 460,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 446,
                                columnNumber: 13
                            }, this),
                            specialAbilities.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                                        label: "Special Abilities"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                        lineNumber: 491,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 5
                                        },
                                        children: specialAbilities.map((ability, idx)=>{
                                            const isCond = ability.is_conditional;
                                            const pillStyle = {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
                                                textTransform: 'uppercase',
                                                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].xl,
                                                padding: '3px 10px',
                                                cursor: 'help',
                                                whiteSpace: 'nowrap',
                                                ...isCond ? {
                                                    border: '1px solid rgba(255,152,0,0.4)',
                                                    background: 'rgba(255,152,0,0.08)',
                                                    color: '#FF9800'
                                                } : {
                                                    border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].borderHi}`,
                                                    background: 'var(--hud-surface-lo)',
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                                }
                                            };
                                            const tipContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipLabel"], {
                                                        children: ability.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                        lineNumber: 517,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipBody"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                                            text: ability.description
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                            lineNumber: 518,
                                                            columnNumber: 34
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                        lineNumber: 518,
                                                        columnNumber: 25
                                                    }, this),
                                                    Array.isArray(ability.affected_skills) && ability.affected_skills.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipDivider"], {}, void 0, false, {
                                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                                lineNumber: 521,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipBody"], {
                                                                children: [
                                                                    "Affects: ",
                                                                    ability.affected_skills.join(', ')
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                                lineNumber: 522,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true),
                                                    isCond && (ability.condition_note ?? '') !== '' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipDivider"], {}, void 0, false, {
                                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                                lineNumber: 527,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                                    color: '#FF9800',
                                                                    fontStyle: 'italic',
                                                                    lineHeight: 1.5
                                                                },
                                                                children: [
                                                                    "⚠ Conditional: ",
                                                                    ability.condition_note ?? ''
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                                lineNumber: 528,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true)
                                                ]
                                            }, void 0, true);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                content: tipContent,
                                                placement: "top",
                                                maxWidth: 300,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: pillStyle,
                                                    children: isCond ? `⚠ ${ability.name}` : ability.name
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                    lineNumber: 543,
                                                    columnNumber: 25
                                                }, this)
                                            }, idx, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                lineNumber: 542,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                        lineNumber: 492,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 490,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 407,
                        columnNumber: 11
                    }, this),
                    isForceUser && conflictEntries && conflictEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConflictCard, {
                        entries: conflictEntries
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 557,
                        columnNumber: 11
                    }, this),
                    motivationConfigured && motivationType ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...panelStyle,
                            padding: '14px 16px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CornerBrackets, {}, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 563,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                                label: "Motivation"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 564,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                                    fontWeight: 700,
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].blue,
                                                    letterSpacing: '0.18em',
                                                    textTransform: 'uppercase',
                                                    marginBottom: 2
                                                },
                                                children: motivationType
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                lineNumber: 567,
                                                columnNumber: 17
                                            }, this),
                                            motivationSpecific && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                                    fontWeight: 700,
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                                                },
                                                children: motivationSpecific
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                                lineNumber: 571,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                        lineNumber: 566,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].blue,
                                            background: 'rgba(90,170,224,0.1)',
                                            border: '1px solid rgba(90,170,224,0.3)',
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                            padding: '2px 8px',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Motivation"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                        lineNumber: 576,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 565,
                                columnNumber: 13
                            }, this),
                            motivationDesc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                    lineHeight: 1.6,
                                    borderTop: '1px solid rgba(90,170,224,0.1)',
                                    paddingTop: 8
                                },
                                children: motivationDesc
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 581,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 562,
                        columnNumber: 11
                    }, this) : !dutyObligationConfigured && motivationType ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...panelStyle,
                            padding: '14px 16px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CornerBrackets, {}, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 588,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                                label: "Motivation"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 589,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                    marginBottom: motivationDesc ? 8 : 0
                                },
                                children: motivationType
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 590,
                                columnNumber: 13
                            }, this),
                            motivationDesc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                    lineHeight: 1.6
                                },
                                children: motivationDesc
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 594,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 587,
                        columnNumber: 11
                    }, this) : motivationConfigured === false ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...panelStyle,
                            padding: '12px 16px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CornerBrackets, {}, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 601,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                                label: "Motivation"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 602,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                    fontStyle: 'italic'
                                },
                                children: "Motivation not yet set."
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                                lineNumber: 603,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 600,
                        columnNumber: 11
                    }, this) : null,
                    dutyObligationConfigured && dutyType && dutyValue !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$DutyCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DutyCard"], {
                        dutyType: dutyType,
                        dutyValue: dutyValue,
                        dutyLore: dutyLore,
                        dutyCustomName: dutyCustomName,
                        resolvedTypeName: dutyResolvedType
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 611,
                        columnNumber: 11
                    }, this),
                    dutyObligationConfigured && obligationType && obligationValue !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$ObligationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ObligationCard"], {
                        obligationType: obligationType,
                        obligationValue: obligationValue,
                        obligationLore: obligationLore,
                        obligationCustomName: obligationCustomName,
                        resolvedTypeName: obligationResolvedType
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                        lineNumber: 620,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
                lineNumber: 363,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/LoreContent.tsx",
        lineNumber: 258,
        columnNumber: 5
    }, this);
}
_s1(LoreContent, "+s7kzbIOAMVfVvt2QaohCo4gmRg=", false, function() {
    return [
        useDebounced,
        useDebounced
    ];
});
_c5 = LoreContent;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "CornerBrackets");
__turbopack_context__.k.register(_c1, "SectionLabel");
__turbopack_context__.k.register(_c2, "SectionDivider");
__turbopack_context__.k.register(_c3, "ConflictCard");
__turbopack_context__.k.register(_c4, "BackstoryView");
__turbopack_context__.k.register(_c5, "LoreContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CriticalInjuryPip",
    ()=>CriticalInjuryPip,
    "CriticalInjuryPips",
    ()=>CriticalInjuryPips,
    "normalizeSeverity",
    ()=>normalizeSeverity
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function normalizeSeverity(sev) {
    const s = sev.toLowerCase();
    if (s === 'minor' || s === 'easy') return 'minor';
    if (s === 'moderate' || s === 'average') return 'moderate';
    if (s === 'serious' || s === 'hard') return 'serious';
    return 'grievous' // daunting, deadly, grievous
    ;
}
const SEV_COLOR = {
    minor: 'rgba(255,152,0,0.7)',
    moderate: 'rgba(224,82,82,0.8)',
    serious: '#DC143C',
    grievous: 'rgba(139,0,0,0.9)'
};
const SEV_LABEL = {
    minor: 'Minor',
    moderate: 'Moderate',
    serious: 'Serious',
    grievous: 'Grievous'
};
const TOOLTIP_W = 260;
function CriticalInjuryPip({ pip, onHeal }) {
    _s();
    const [tooltipOpen, setTooltipOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [tipPos, setTipPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        left: 0,
        openUp: true,
        anchorY: 0,
        vh: 0
    });
    const [confirmingHeal, setConfirmingHeal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const btnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sev = normalizeSeverity(pip.severity);
    const color = SEV_COLOR[sev];
    const isGrievous = sev === 'grievous';
    const handleToggle = ()=>{
        if (tooltipOpen) {
            setTooltipOpen(false);
            setConfirmingHeal(false);
            return;
        }
        if (btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            // Centre tooltip on pip, clamped so it never bleeds past viewport edges
            const left = Math.max(8, Math.min(r.left + r.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - 8));
            // Open upward if there's room (≥220 px above), otherwise downward
            const openUp = r.top >= 220;
            setTipPos({
                left,
                openUp,
                anchorY: openUp ? r.top : r.bottom,
                vh
            });
        }
        setTooltipOpen(true);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative',
            display: 'inline-block'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                ref: btnRef,
                onClick: handleToggle,
                "aria-label": `${pip.name} (${SEV_LABEL[sev]})`,
                style: {
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'block',
                    animation: isGrievous ? 'critGrievousPulse 2s ease-in-out infinite' : undefined
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    width: "16",
                    height: "18",
                    viewBox: "0 0 16 18",
                    xmlns: "http://www.w3.org/2000/svg",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M 8 2 C 8 2 14 8 14 11 A 6 6 0 0 1 2 11 C 2 8 8 2 8 2 Z",
                        fill: color
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                    lineNumber: 96,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            tooltipOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: 'fixed',
                            inset: 0,
                            zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].backdrop
                        },
                        onClick: ()=>{
                            setTooltipOpen(false);
                            setConfirmingHeal(false);
                        }
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: 'fixed',
                            left: tipPos.left,
                            // When opening upward, anchor bottom edge above the pip; downward, anchor top below it
                            ...tipPos.openUp ? {
                                bottom: tipPos.vh - tipPos.anchorY + 10
                            } : {
                                top: tipPos.anchorY + 10
                            },
                            zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].tooltip,
                            width: TOOLTIP_W,
                            background: 'var(--hud-surface-hi)',
                            backdropFilter: 'blur(14px)',
                            WebkitBackdropFilter: 'blur(14px)',
                            border: `1px solid rgba(220,20,60,0.35)`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                            padding: '10px 12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    setTooltipOpen(false);
                                    setConfirmingHeal(false);
                                },
                                className: "crit-pip-close",
                                style: {
                                    position: 'absolute',
                                    top: 6,
                                    right: 6,
                                    background: 'none',
                                    border: 'none',
                                    padding: '2px 4px',
                                    cursor: 'pointer',
                                    lineHeight: 1,
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: '0.7rem',
                                    color: 'rgba(220,20,60,0.5)'
                                },
                                "aria-label": "Close",
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                lineNumber: 127,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: 'clamp(0.55rem, 0.85vw, 0.62rem)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    color,
                                    marginBottom: 3
                                },
                                children: [
                                    SEV_LABEL[sev],
                                    " Critical Injury"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                lineNumber: 140,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
                                    color: '#DC143C',
                                    fontWeight: 700,
                                    marginBottom: 6
                                },
                                children: pip.name
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                lineNumber: 152,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    height: 1,
                                    background: 'rgba(220,20,60,0.2)',
                                    marginBottom: 6
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                lineNumber: 162,
                                columnNumber: 13
                            }, this),
                            pip.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                                    color: 'var(--hud-text)',
                                    lineHeight: 1.5,
                                    marginBottom: 6
                                },
                                children: pip.description
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                lineNumber: 166,
                                columnNumber: 15
                            }, this),
                            (pip.sessionLabel || pip.rollResult != null) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            height: 1,
                                            background: 'rgba(220,20,60,0.15)',
                                            marginBottom: 6
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                        lineNumber: 180,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: 'clamp(0.52rem, 0.82vw, 0.6rem)',
                                            color: 'var(--hud-text-faint)',
                                            display: 'flex',
                                            gap: 6,
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            pip.sessionLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: pip.sessionLabel
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                                lineNumber: 187,
                                                columnNumber: 40
                                            }, this),
                                            pip.rollResult != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Roll: ",
                                                    pip.rollResult
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                                lineNumber: 188,
                                                columnNumber: 46
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                        lineNumber: 181,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true),
                            onHeal && !confirmingHeal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    setConfirmingHeal(true);
                                },
                                style: {
                                    marginTop: 8,
                                    width: '100%',
                                    background: 'rgba(78,200,122,0.1)',
                                    border: '1px solid rgba(78,200,122,0.3)',
                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                    padding: '4px 0',
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: 'clamp(0.7rem, 1.1vw, 0.8rem)',
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    color: '#4EC87A',
                                    cursor: 'pointer'
                                },
                                children: "✓ Heal Injury"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                lineNumber: 195,
                                columnNumber: 15
                            }, this),
                            onHeal && confirmingHeal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: 'clamp(0.78rem, 1.2vw, 0.88rem)',
                                            color: 'var(--hud-text)',
                                            textAlign: 'center',
                                            marginBottom: 6
                                        },
                                        children: [
                                            "Heal ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: '#DC143C'
                                                },
                                                children: pip.name
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                                lineNumber: 220,
                                                columnNumber: 24
                                            }, this),
                                            "?"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                        lineNumber: 213,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            gap: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    onHeal(pip.id);
                                                    setTooltipOpen(false);
                                                    setConfirmingHeal(false);
                                                },
                                                style: {
                                                    flex: 1,
                                                    padding: '4px 0',
                                                    background: 'rgba(78,200,122,0.12)',
                                                    border: '1px solid rgba(78,200,122,0.4)',
                                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: 'clamp(0.7rem, 1.1vw, 0.78rem)',
                                                    fontWeight: 700,
                                                    color: '#4EC87A',
                                                    cursor: 'pointer'
                                                },
                                                children: "Confirm"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                                lineNumber: 223,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    setConfirmingHeal(false);
                                                },
                                                style: {
                                                    flex: 1,
                                                    padding: '4px 0',
                                                    background: 'transparent',
                                                    border: '1px solid rgba(150,168,180,0.2)',
                                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: 'clamp(0.7rem, 1.1vw, 0.78rem)',
                                                    fontWeight: 700,
                                                    color: 'rgba(150,168,180,0.5)',
                                                    cursor: 'pointer'
                                                },
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                                lineNumber: 236,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                        lineNumber: 222,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                                lineNumber: 212,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true), document.body)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
_s(CriticalInjuryPip, "GplwgdhlaHTNVmK+LzYkp8l5pi4=");
_c = CriticalInjuryPip;
function CriticalInjuryPips({ crits, onHeal }) {
    if (crits.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @keyframes critGrievousPulse {
          0%, 100% { opacity: 0.75; filter: brightness(1); }
          50%       { opacity: 1;   filter: brightness(1.5) drop-shadow(0 0 4px rgba(139,0,0,0.9)); }
        }
        .crit-pip-close:hover { color: #DC143C !important; }
      `
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                lineNumber: 271,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginTop: 10
                },
                children: crits.map((pip)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CriticalInjuryPip, {
                        pip: pip,
                        onHeal: onHeal
                    }, pip.id, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                        lineNumber: 280,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryPip.tsx",
                lineNumber: 278,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c1 = CriticalInjuryPips;
var _c, _c1;
__turbopack_context__.k.register(_c, "CriticalInjuryPip");
__turbopack_context__.k.register(_c1, "CriticalInjuryPips");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EncumbranceBar",
    ()=>EncumbranceBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/Tooltip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
const ENC_WARN = 'var(--state-threat)';
const ENC_OK = 'rgba(90,170,224,0.7)';
/** Tooltip shown when the character is over their encumbrance threshold. */ function OverencumberedTooltip({ current, threshold, brawn }) {
    const over = current - threshold;
    const losesManeuver = brawn != null && over >= brawn;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipLabel"], {
                children: [
                    "Over-Encumbered (",
                    over,
                    " over limit)"
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipDivider"], {}, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipBody"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                    text: `Add [setback:${over}] to all Brawn and Agility checks.`
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            losesManeuver && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipBody"], {
                children: "No free maneuver each turn — each maneuver costs 2 strain."
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this),
            !losesManeuver && brawn != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipBody"], {
                children: [
                    "Free maneuver lost if encumbrance exceeds threshold by ",
                    brawn,
                    " or more (current Brawn)."
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                lineNumber: 39,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_c = OverencumberedTooltip;
function EncumbranceBar({ current, threshold, brawn, compact = false, labelFontSize }) {
    const pct = threshold > 0 ? Math.min(100, current / threshold * 100) : 0;
    const over = current > threshold;
    const fill = over ? ENC_WARN : ENC_OK;
    const warningIcon = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(OverencumberedTooltip, {
            current: current,
            threshold: threshold,
            brawn: brawn
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
            lineNumber: 54,
            columnNumber: 16
        }, void 0),
        placement: "top",
        maxWidth: 280,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                cursor: 'help'
            },
            children: "⚠"
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
            lineNumber: 58,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
    if (compact) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: 6
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: labelFontSize ?? 'clamp(0.6rem, 2.4vw, 0.72rem)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--hud-vital-text-dim)'
                    },
                    children: "ENC"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: 'clamp(0.65rem, 2.5vw, 0.78rem)',
                        color: over ? ENC_WARN : 'var(--hud-vital-text)'
                    },
                    children: [
                        current,
                        "/",
                        threshold
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this),
                over && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: '0.65rem',
                        color: ENC_WARN
                    },
                    children: warningIcon
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                    lineNumber: 80,
                    columnNumber: 18
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
            lineNumber: 64,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: labelFontSize ?? 'clamp(0.58rem, 0.9vw, 0.68rem)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            color: 'var(--hud-text-faint)'
                        },
                        children: "ENC"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: 'clamp(0.68rem, 1.0vw, 0.8rem)',
                            color: over ? ENC_WARN : 'var(--hud-text-dim)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                        },
                        children: [
                            current,
                            "/",
                            threshold,
                            over && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    ' ',
                                    warningIcon
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 6,
                    background: 'var(--hud-border)',
                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md - 1,
                    overflow: 'hidden'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: '100%',
                        width: `${pct}%`,
                        background: fill,
                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md - 1,
                        transition: `width 300ms ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
_c1 = EncumbranceBar;
var _c, _c1;
__turbopack_context__.k.register(_c, "OverencumberedTooltip");
__turbopack_context__.k.register(_c1, "EncumbranceBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/WeaponDamageDisplay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MELEE_SKILL_KEYS",
    ()=>MELEE_SKILL_KEYS,
    "WeaponDamageDisplay",
    ()=>WeaponDamageDisplay,
    "buildWeaponDamageInfo",
    ()=>buildWeaponDamageInfo,
    "isMeleeSkill",
    ()=>isMeleeSkill
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
const MELEE_SKILL_KEYS = [
    'MELEE',
    'BRAWL',
    'LTSABER'
];
function isMeleeSkill(skillKey) {
    return MELEE_SKILL_KEYS.includes(skillKey ?? '');
}
function WeaponDamageDisplay({ baseDamage, isMelee, brawn }) {
    if (!isMelee) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: baseDamage
    }, void 0, false);
    const total = baseDamage + brawn;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex items-baseline",
        style: {
            gap: 2
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: [
                    baseDamage,
                    "+",
                    brawn
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/WeaponDamageDisplay.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: '0.75em',
                    opacity: 0.6,
                    marginLeft: 1
                },
                children: [
                    "(",
                    total,
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/WeaponDamageDisplay.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/WeaponDamageDisplay.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_c = WeaponDamageDisplay;
function buildWeaponDamageInfo(skillKey, damage, damage_add, brawn) {
    const isMeleeWeapon = isMeleeSkill(skillKey);
    const hasBrawnScale = isMeleeWeapon && damage_add != null;
    return {
        baseDamage: hasBrawnScale ? damage_add ?? 0 : damage ?? 0,
        isMelee: hasBrawnScale,
        brawn: hasBrawnScale ? brawn : 0
    };
}
var _c;
__turbopack_context__.k.register(_c, "WeaponDamageDisplay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CriticalInjuryModal",
    ()=>CriticalInjuryModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/Modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const CRIMSON = '#DC143C';
function CriticalInjuryModal({ request, characterId, characterName, refCrits, currentCrits, sessionLabel, onDismiss }) {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    // Dropdown values: tens (0-9) and ones (0-0)
    // Result 00 → 100
    const [tens, setTens] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ones, setOnes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const rolled = tens !== null && ones !== null;
    const baseRoll = rolled ? tens === 0 && ones === 0 ? 100 : tens * 10 + ones : null;
    const finalResult = baseRoll != null ? baseRoll + request.total_modifier : null;
    const lookupInjury = (total)=>{
        // Clamp to the highest entry if total exceeds max
        const sorted = [
            ...refCrits
        ].sort((a, b)=>b.roll_min - a.roll_min);
        return refCrits.find((c)=>total >= c.roll_min && total <= c.roll_max) ?? sorted[0];
    };
    const previewInjury = finalResult != null ? lookupInjury(finalResult) : undefined;
    const handleRollForMe = ()=>{
        const d100 = Math.floor(Math.random() * 100) + 1;
        const t = d100 === 100 ? 0 : Math.floor(d100 / 10);
        const o = d100 === 100 ? 0 : d100 % 10;
        setTens(t);
        setOnes(o);
    };
    const handleSubmit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CriticalInjuryModal.useCallback[handleSubmit]": async ()=>{
            if (baseRoll == null || finalResult == null) return;
            setBusy(true);
            try {
                const injury = lookupInjury(finalResult);
                // 1. Update request: mark as rolled
                await supabase.from('critical_injury_requests').update({
                    status: 'rolled',
                    roll_result: baseRoll,
                    final_result: finalResult,
                    injury_key: injury?.id ?? null,
                    resolved_at: new Date().toISOString()
                }).eq('id', request.id);
                // 2. Insert new character_critical_injury row
                if (injury) {
                    await supabase.from('character_critical_injuries').insert({
                        character_id: characterId,
                        injury_id: injury.id,
                        custom_name: injury.name,
                        severity: injury.severity,
                        description: injury.description,
                        is_healed: false,
                        roll_result: baseRoll,
                        total_roll: finalResult,
                        session_label: sessionLabel ?? null,
                        vicious_mod: request.vicious_mod,
                        lethal_mod: request.lethal_mod,
                        gm_modifier: request.gm_modifier
                    });
                }
                onDismiss();
            } finally{
                setBusy(false);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["CriticalInjuryModal.useCallback[handleSubmit]"], [
        baseRoll,
        finalResult,
        request,
        characterId,
        sessionLabel
    ]);
    const modBreakdown = [
        {
            label: 'Existing injuries',
            value: request.existing_mod
        },
        {
            label: 'Vicious',
            value: request.vicious_mod
        },
        {
            label: 'Lethal Blows',
            value: request.lethal_mod
        },
        {
            label: 'Additional',
            value: request.gm_modifier
        }
    ].filter((m)=>m.value > 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
        open: true,
        maxWidth: 460,
        borderColor: "rgba(220,20,60,0.5)",
        shadow: "0 16px 48px rgba(0,0,0,0.8), 0 0 32px rgba(220,20,60,0.08)",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
                            fontWeight: 700,
                            color: CRIMSON,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            marginBottom: 4
                        },
                        children: "⚡ Critical Injury"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: 'clamp(0.82rem, 1.3vw, 0.95rem)',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                        },
                        children: [
                            characterName,
                            ", your GM has requested a Critical Injury roll."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                        lineNumber: 128,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                lineNumber: 116,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 1,
                    background: 'rgba(220,20,60,0.2)'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                lineNumber: 133,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                            marginBottom: 8
                        },
                        children: "Roll Modifier"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                        lineNumber: 137,
                        columnNumber: 11
                    }, this),
                    modBreakdown.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: 'clamp(0.82rem, 1.3vw, 0.9rem)',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                        },
                        children: "No modifier — roll d100 straight."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                        lineNumber: 141,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4
                        },
                        children: [
                            modBreakdown.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                        fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)',
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: m.label
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                            lineNumber: 148,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: CRIMSON,
                                                fontWeight: 700
                                            },
                                            children: [
                                                "+",
                                                m.value
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                            lineNumber: 149,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, m.label, true, {
                                    fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                    lineNumber: 147,
                                    columnNumber: 17
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    height: 1,
                                    background: 'var(--hud-border)',
                                    margin: '4px 0'
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                lineNumber: 152,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Total modifier"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                        lineNumber: 154,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontWeight: 700
                                        },
                                        children: [
                                            "+",
                                            request.total_modifier
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                        lineNumber: 155,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                lineNumber: 153,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                        lineNumber: 145,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                lineNumber: 136,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 1,
                    background: 'rgba(220,20,60,0.2)'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                lineNumber: 161,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                            marginBottom: 10
                        },
                        children: "Roll two ten-sided dice (d100)"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                        lineNumber: 165,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                    flex: 1
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: 'clamp(0.52rem, 0.8vw, 0.62rem)',
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        },
                                        children: "Tens"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                        lineNumber: 171,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: tens ?? '',
                                        onChange: (e)=>setTens(e.target.value === '' ? null : parseInt(e.target.value, 10)),
                                        style: {
                                            background: 'var(--hud-surface-lo)',
                                            border: `1px solid rgba(220,20,60,0.3)`,
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                                            padding: '8px 12px',
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
                                            textAlign: 'center',
                                            cursor: 'pointer'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "—"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                                lineNumber: 186,
                                                columnNumber: 17
                                            }, this),
                                            Array.from({
                                                length: 10
                                            }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: i,
                                                    children: i
                                                }, i, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                                    lineNumber: 188,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                        lineNumber: 174,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                    marginTop: 18
                                },
                                children: "×"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                lineNumber: 193,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                    flex: 1
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: 'clamp(0.52rem, 0.8vw, 0.62rem)',
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        },
                                        children: "Ones"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                        lineNumber: 197,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: ones ?? '',
                                        onChange: (e)=>setOnes(e.target.value === '' ? null : parseInt(e.target.value, 10)),
                                        style: {
                                            background: 'var(--hud-surface-lo)',
                                            border: `1px solid rgba(220,20,60,0.3)`,
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                                            padding: '8px 12px',
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
                                            textAlign: 'center',
                                            cursor: 'pointer'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "—"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                                lineNumber: 212,
                                                columnNumber: 17
                                            }, this),
                                            Array.from({
                                                length: 10
                                            }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: i,
                                                    children: i
                                                }, i, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                                    lineNumber: 214,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                        lineNumber: 200,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                lineNumber: 196,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                        lineNumber: 168,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleRollForMe,
                        style: {
                            width: '100%',
                            background: 'rgba(220,20,60,0.08)',
                            border: `1px solid rgba(220,20,60,0.3)`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                            padding: '9px 0',
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: 'clamp(0.82rem, 1.2vw, 0.9rem)',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: CRIMSON,
                            cursor: 'pointer',
                            marginBottom: rolled ? 12 : 0
                        },
                        children: "🎲 Roll for Me"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                        lineNumber: 221,
                        columnNumber: 11
                    }, this),
                    rolled && baseRoll != null && finalResult != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'rgba(220,20,60,0.06)',
                            border: `1px solid rgba(220,20,60,0.25)`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                            padding: '10px 14px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: 'clamp(0.72rem, 1.1vw, 0.85rem)',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                    marginBottom: 4
                                },
                                children: "Result"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                lineNumber: 244,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    flexWrap: 'wrap'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)',
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
                                            fontWeight: 700
                                        },
                                        children: baseRoll
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                        lineNumber: 248,
                                        columnNumber: 17
                                    }, this),
                                    request.total_modifier > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: 'clamp(0.82rem, 1.2vw, 0.9rem)',
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                                                },
                                                children: "+"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                                lineNumber: 253,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                                                    color: CRIMSON
                                                },
                                                children: request.total_modifier
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                                lineNumber: 254,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: 'clamp(0.82rem, 1.2vw, 0.9rem)',
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                                                },
                                                children: "="
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                                lineNumber: 257,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)',
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                                    fontWeight: 700
                                                },
                                                children: finalResult
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                                lineNumber: 258,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                lineNumber: 247,
                                columnNumber: 15
                            }, this),
                            previewInjury && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8,
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: CRIMSON,
                                            fontWeight: 700
                                        },
                                        children: previewInjury.name
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                        lineNumber: 266,
                                        columnNumber: 19
                                    }, this),
                                    ' ',
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                            fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)'
                                        },
                                        children: [
                                            "(",
                                            previewInjury.severity,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                        lineNumber: 268,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                                lineNumber: 265,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                        lineNumber: 239,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                lineNumber: 164,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                disabled: !rolled || busy,
                onClick: handleSubmit,
                style: {
                    background: rolled ? 'rgba(220,20,60,0.15)' : 'rgba(100,100,100,0.1)',
                    border: `1px solid ${rolled ? 'rgba(220,20,60,0.5)' : 'rgba(100,100,100,0.2)'}`,
                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                    padding: '12px 0',
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: 'clamp(0.88rem, 1.3vw, 1rem)',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: rolled ? CRIMSON : 'rgba(150,150,150,0.5)',
                    cursor: rolled ? 'pointer' : 'not-allowed',
                    transition: '.15s'
                },
                children: busy ? 'Submitting…' : 'Submit Result'
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                lineNumber: 276,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: 'clamp(0.5rem, 0.78vw, 0.6rem)',
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                    textAlign: 'center',
                    letterSpacing: '0.1em'
                },
                children: "This roll is mandatory — you must submit a result."
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
                lineNumber: 293,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/CriticalInjuryModal.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
_s(CriticalInjuryModal, "4w80xmHy+YdFxMPHeni/Kz1P5kY=");
_c = CriticalInjuryModal;
var _c;
__turbopack_context__.k.register(_c, "CriticalInjuryModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/character/ForceCheckButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ForceCheckButton",
    ()=>ForceCheckButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
function ForceCheckButton({ onOpen, compact = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: [
            'force-check-btn',
            compact ? 'force-check-btn--compact' : 'force-check-btn--full force-check-btn-pulse'
        ].join(' '),
        onClick: onOpen,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    opacity: 0.85,
                    fontSize: compact ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label : 'clamp(13px, 1.1vw, 16px)'
                },
                children: "✦"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/character/ForceCheckButton.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            "Force Check"
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/character/ForceCheckButton.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = ForceCheckButton;
var _c;
__turbopack_context__.k.register(_c, "ForceCheckButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=star-wars-rpg_src_components_character_4d855546._.js.map