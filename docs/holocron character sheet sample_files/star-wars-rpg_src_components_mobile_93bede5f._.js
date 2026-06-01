(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DiceRollerSheet",
    ()=>DiceRollerSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/design-tokens.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/dice/DiceFace.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/dice-engine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$logRoll$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/logRoll.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-dim)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
const BORDER = 'var(--hud-border)';
const FONT_C = 'var(--font-body)';
const FONT_M = 'var(--font-body)';
const LIGHT_COL = '#E8E870';
const DARK_COL = '#8070D8';
// ─── Dice types shown in the sheet ───────────────────────────────────────────
const ADJUSTABLE = [
    'difficulty',
    'challenge',
    'boost',
    'setback'
];
// ─── Small +/- stepper for a single dice type ────────────────────────────────
function DiceStepper({ type, count, locked, onAdd, onRemove }) {
    const meta = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DICE_META"][type];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                    type: type,
                    size: 24
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: FONT_M,
                    fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                    color: meta.color,
                    width: 28
                },
                children: meta.label
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            locked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: FONT_C,
                    fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                    fontWeight: 700,
                    color: meta.color,
                    minWidth: 32,
                    textAlign: 'center'
                },
                children: count
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                lineNumber: 65,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onRemove,
                        disabled: count <= 0,
                        style: {
                            width: 44,
                            height: 44,
                            background: 'transparent',
                            border: `1px solid ${BORDER}`,
                            borderRadius: '8px 0 0 8px',
                            cursor: count > 0 ? 'pointer' : 'not-allowed',
                            fontFamily: FONT_C,
                            fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                            color: count > 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : 'var(--hud-text-faint)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        children: "−"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            minWidth: 36,
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: FONT_C,
                            fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                            fontWeight: 700,
                            color: meta.color,
                            background: `${meta.color}0C`,
                            border: `1px solid ${BORDER}`,
                            borderLeft: 'none',
                            borderRight: 'none'
                        },
                        children: count
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onAdd,
                        style: {
                            width: 44,
                            height: 44,
                            background: 'transparent',
                            border: `1px solid ${BORDER}`,
                            borderRadius: '0 8px 8px 0',
                            cursor: 'pointer',
                            fontFamily: FONT_C,
                            fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        children: "+"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 107,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                lineNumber: 76,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_c = DiceStepper;
// ─── Roll result display ──────────────────────────────────────────────────────
function ResultDisplay({ result }) {
    const { success, advantage, triumph, despair } = result.net;
    const succeeded = success > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            marginTop: 16,
            padding: '12px 16px',
            background: succeeded ? 'rgba(78,200,122,0.08)' : 'rgba(224,80,80,0.08)',
            border: `1px solid ${succeeded ? 'rgba(78,200,122,0.3)' : 'rgba(224,80,80,0.3)'}`,
            borderRadius: 10
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 16,
                    marginBottom: 10
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_C,
                                    fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
                                    fontWeight: 700,
                                    color: succeeded ? '#4EC87A' : '#E05050',
                                    lineHeight: 1
                                },
                                children: succeeded ? `+${success}` : success
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)',
                                    color: TEXT_DIM,
                                    marginTop: 2
                                },
                                children: succeeded ? 'SUCCESS' : 'FAILURE'
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    advantage !== 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_C,
                                    fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
                                    fontWeight: 700,
                                    color: advantage > 0 ? '#70C8E8' : '#B060D0',
                                    lineHeight: 1
                                },
                                children: advantage > 0 ? `+${advantage}` : advantage
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 161,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)',
                                    color: TEXT_DIM,
                                    marginTop: 2
                                },
                                children: advantage > 0 ? 'ADV' : 'THREAT'
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                lineNumber: 143,
                columnNumber: 7
            }, this),
            (triumph > 0 || despair > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 12
                },
                children: [
                    triumph > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: FONT_M,
                            fontSize: 'clamp(0.65rem, 2.6vw, 0.8rem)',
                            color: '#D4B840'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                className: "ffi ffi-swrpg-triumph"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 182,
                                columnNumber: 15
                            }, this),
                            ' TRIUMPH ×',
                            triumph
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 181,
                        columnNumber: 13
                    }, this),
                    despair > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: FONT_M,
                            fontSize: 'clamp(0.65rem, 2.6vw, 0.8rem)',
                            color: '#FF6060'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                className: "ffi ffi-swrpg-despair"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 187,
                                columnNumber: 15
                            }, this),
                            ' DESPAIR ×',
                            despair
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 186,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                lineNumber: 179,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 10,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4,
                    justifyContent: 'center'
                },
                children: result.dice.map((die, i)=>{
                    const meta = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DICE_META"][die.type];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '2px 6px',
                            background: `${meta.color}10`,
                            border: `1px solid ${meta.color}30`,
                            borderRadius: 6
                        },
                        children: die.symbols.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: FONT_M,
                                fontSize: 10,
                                color: TEXT_DIM
                            },
                            children: "—"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                            lineNumber: 214,
                            columnNumber: 17
                        }, this) : die.symbols.map((sym, j)=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM"][sym]?.icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                className: `ffi ffi-${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM"][sym].icon}`,
                                style: {
                                    fontSize: 12,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM"][sym].color,
                                    filter: `drop-shadow(0 0 3px ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM"][sym].color}60)`
                                }
                            }, j, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 218,
                                columnNumber: 23
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: 12,
                                    color: TEXT
                                },
                                children: sym
                            }, j, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 219,
                                columnNumber: 23
                            }, this))
                    }, i, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 204,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                lineNumber: 194,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
        lineNumber: 135,
        columnNumber: 5
    }, this);
}
_c1 = ResultDisplay;
// ─── Force result display ─────────────────────────────────────────────────────
function ForceResult({ result }) {
    const { dice, totalLight, totalDark } = result;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            marginTop: 16,
            padding: '12px 16px',
            background: 'rgba(0,0,0,0.2)',
            border: `1px solid ${BORDER}`,
            borderRadius: 10
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 24,
                    marginBottom: 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_C,
                                    fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
                                    fontWeight: 700,
                                    color: LIGHT_COL,
                                    lineHeight: 1
                                },
                                children: totalLight
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 243,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)',
                                    color: TEXT_DIM,
                                    marginTop: 2
                                },
                                children: "LIGHT"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 246,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 242,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: 1,
                            background: BORDER,
                            alignSelf: 'stretch'
                        }
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 250,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_C,
                                    fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
                                    fontWeight: 700,
                                    color: DARK_COL,
                                    lineHeight: 1
                                },
                                children: totalDark
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 252,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.55rem, 2.2vw, 0.7rem)',
                                    color: TEXT_DIM,
                                    marginTop: 2
                                },
                                children: "DARK"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 255,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 251,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    justifyContent: 'center'
                },
                children: dice.map((die, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                                type: "force",
                                size: 28
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 263,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 3,
                                    minHeight: 8
                                },
                                children: [
                                    Array.from({
                                        length: die.light
                                    }).map((_, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: 7,
                                                height: 7,
                                                borderRadius: '50%',
                                                background: LIGHT_COL
                                            }
                                        }, `l${j}`, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                            lineNumber: 266,
                                            columnNumber: 17
                                        }, this)),
                                    Array.from({
                                        length: die.dark
                                    }).map((_, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: 7,
                                                height: 7,
                                                borderRadius: '50%',
                                                background: DARK_COL
                                            }
                                        }, `k${j}`, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                            lineNumber: 269,
                                            columnNumber: 17
                                        }, this)),
                                    die.light === 0 && die.dark === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_M,
                                            fontSize: 9,
                                            color: TEXT_DIM
                                        },
                                        children: "—"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                        lineNumber: 272,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 264,
                                columnNumber: 13
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 262,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                lineNumber: 260,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
        lineNumber: 234,
        columnNumber: 5
    }, this);
}
_c2 = ForceResult;
function DiceRollerSheet({ prePopSkill, characterId, characterName, campaignId }) {
    _s();
    const initPool = ()=>{
        if (!prePopSkill) return {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMPTY_POOL"]
        };
        return {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMPTY_POOL"],
            proficiency: prePopSkill.proficiency,
            ability: prePopSkill.ability
        };
    };
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('pool');
    const [pool, setPool] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initPool);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [forceCount, setForceCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [forceResult, setForceResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const addDie = (type)=>setPool((p)=>({
                ...p,
                [type]: p[type] + 1
            }));
    const removeDie = (type)=>setPool((p)=>({
                ...p,
                [type]: Math.max(0, p[type] - 1)
            }));
    const handleRoll = ()=>{
        const rolled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rollPool"])(pool);
        setResult(rolled);
        if (campaignId) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$logRoll$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logRoll"])({
                campaignId,
                characterId,
                characterName,
                label: prePopSkill?.name,
                pool,
                result: rolled
            });
        }
    };
    const handleRollForce = ()=>{
        setForceResult((0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rollForceDice"])(forceCount));
    };
    const isEmpty = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["poolSize"])(pool) === 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '8px 16px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    borderBottom: `1px solid ${BORDER}`,
                    marginBottom: 4
                },
                children: [
                    'pool',
                    'force'
                ].map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setMode(m),
                        style: {
                            flex: 1,
                            padding: '8px 0',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: `2px solid ${mode === m ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : 'transparent'}`,
                            cursor: 'pointer',
                            fontFamily: FONT_M,
                            fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: mode === m ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : GOLD_DIM,
                            marginBottom: -1,
                            transition: 'color 0.15s'
                        },
                        children: m === 'pool' ? 'Dice Pool' : 'Force Dice'
                    }, m, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 329,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                lineNumber: 327,
                columnNumber: 7
            }, this),
            mode === 'pool' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    prePopSkill ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center',
                            marginBottom: 4
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_C,
                                    fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                                    fontWeight: 700,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                },
                                children: prePopSkill.name
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 359,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                                    color: GOLD_DIM,
                                    marginTop: 2
                                },
                                children: prePopSkill.charAbbr
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 362,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 358,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: FONT_C,
                            fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                            fontWeight: 700,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            textAlign: 'center',
                            marginBottom: 4
                        },
                        children: "Dice Roller"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 367,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.55rem, 2.2vw, 0.68rem)',
                                    color: GOLD_DIM,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: 8
                                },
                                children: "Positive"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 374,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DiceStepper, {
                                        type: "proficiency",
                                        count: pool.proficiency,
                                        locked: !!prePopSkill,
                                        onAdd: ()=>addDie('proficiency'),
                                        onRemove: ()=>removeDie('proficiency')
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                        lineNumber: 378,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DiceStepper, {
                                        type: "ability",
                                        count: pool.ability,
                                        locked: !!prePopSkill,
                                        onAdd: ()=>addDie('ability'),
                                        onRemove: ()=>removeDie('ability')
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                        lineNumber: 385,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DiceStepper, {
                                        type: "boost",
                                        count: pool.boost,
                                        onAdd: ()=>addDie('boost'),
                                        onRemove: ()=>removeDie('boost')
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                        lineNumber: 392,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 377,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 373,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            height: 1,
                            background: BORDER
                        }
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 402,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.55rem, 2.2vw, 0.68rem)',
                                    color: GOLD_DIM,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: 8
                                },
                                children: "Negative"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 406,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8
                                },
                                children: ADJUSTABLE.filter((t)=>t !== 'boost').map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DiceStepper, {
                                        type: type,
                                        count: pool[type],
                                        onAdd: ()=>addDie(type),
                                        onRemove: ()=>removeDie(type)
                                    }, type, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                        lineNumber: 411,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 409,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 405,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleRoll,
                        disabled: isEmpty,
                        style: {
                            width: '100%',
                            height: 52,
                            background: isEmpty ? 'var(--hud-surface-lo)' : 'linear-gradient(135deg, #C8AA50, #8B7430)',
                            border: 'none',
                            borderRadius: 10,
                            cursor: isEmpty ? 'not-allowed' : 'pointer',
                            fontFamily: FONT_C,
                            fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: isEmpty ? 'var(--hud-text-faint)' : 'var(--hud-text)',
                            marginTop: 4,
                            transition: 'background 0.2s, color 0.2s'
                        },
                        children: isEmpty ? 'Add Dice to Roll' : `Roll ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["poolSize"])(pool)} Dice`
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 423,
                        columnNumber: 11
                    }, this),
                    result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResultDisplay, {
                        result: result
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 448,
                        columnNumber: 22
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 16,
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                                type: "force",
                                size: 40,
                                active: true
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 454,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setForceCount((c)=>Math.max(1, c - 1)),
                                        disabled: forceCount <= 1,
                                        style: {
                                            width: 44,
                                            height: 44,
                                            background: 'transparent',
                                            border: `1px solid ${BORDER}`,
                                            borderRadius: '8px 0 0 8px',
                                            cursor: forceCount > 1 ? 'pointer' : 'not-allowed',
                                            fontFamily: FONT_C,
                                            fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                                            color: forceCount > 1 ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : 'var(--hud-text-faint)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        },
                                        children: "−"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                        lineNumber: 457,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            minWidth: 44,
                                            height: 44,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontFamily: FONT_C,
                                            fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                                            fontWeight: 700,
                                            color: TEXT,
                                            background: 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${BORDER}`,
                                            borderLeft: 'none',
                                            borderRight: 'none'
                                        },
                                        children: forceCount
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                        lineNumber: 472,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setForceCount((c)=>Math.min(8, c + 1)),
                                        disabled: forceCount >= 8,
                                        style: {
                                            width: 44,
                                            height: 44,
                                            background: 'transparent',
                                            border: `1px solid ${BORDER}`,
                                            borderRadius: '0 8px 8px 0',
                                            cursor: forceCount < 8 ? 'pointer' : 'not-allowed',
                                            fontFamily: FONT_C,
                                            fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                                            color: forceCount < 8 ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : 'var(--hud-text-faint)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        },
                                        children: "+"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                        lineNumber: 485,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 456,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                                    color: GOLD_DIM
                                },
                                children: forceCount === 1 ? '1 die' : `${forceCount} dice`
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                                lineNumber: 502,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 453,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleRollForce,
                        style: {
                            width: '100%',
                            height: 52,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: 10,
                            cursor: 'pointer',
                            fontFamily: FONT_C,
                            fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: TEXT,
                            marginTop: 4
                        },
                        children: "Roll Force"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 508,
                        columnNumber: 11
                    }, this),
                    forceResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ForceResult, {
                        result: forceResult
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
                        lineNumber: 529,
                        columnNumber: 27
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx",
        lineNumber: 324,
        columnNumber: 5
    }, this);
}
_s(DiceRollerSheet, "h9S2t1ZJzv0dbnSGuD3e5seoiYY=");
_c3 = DiceRollerSheet;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "DiceStepper");
__turbopack_context__.k.register(_c1, "ResultDisplay");
__turbopack_context__.k.register(_c2, "ForceResult");
__turbopack_context__.k.register(_c3, "DiceRollerSheet");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/mobile/MobileHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MobileHeader",
    ()=>MobileHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
// ─── Tokens ──────────────────────────────────────────────────────────────────
const PANEL = 'var(--hud-surface-hi)';
const BORDER = 'var(--hud-border)';
const FONT_C = 'var(--font-body)';
const FONT_R = 'var(--font-body)';
function MobileHeader({ characterName, onOpenDiceRoller }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 56,
            background: PANEL,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            flexShrink: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: FONT_C,
                    fontSize: 'clamp(0.85rem, 3vw, 1rem)',
                    fontWeight: 700,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                },
                children: characterName
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileHeader.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onOpenDiceRoller,
                "aria-label": "Open dice roller",
                style: {
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--hud-surface-lo)',
                    border: `1px solid var(--hud-border)`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 20,
                    lineHeight: 1,
                    fontFamily: FONT_R,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                    transition: 'background 0.15s'
                },
                children: "🎲"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileHeader.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileHeader.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = MobileHeader;
var _c;
__turbopack_context__.k.register(_c, "MobileHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/mobile/MobileTabBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MobileTabBar",
    ()=>MobileTabBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
// ─── Tokens ──────────────────────────────────────────────────────────────────
const PANEL = 'var(--hud-surface-hi)';
const BORDER = 'var(--hud-border)';
const GOLD_I = 'var(--hud-text-dim)';
const FORCE_BLUE = '#7EC8E3';
const FONT_R = 'var(--font-body)';
const BASE_TABS = [
    {
        id: 'status',
        label: 'Vitals',
        icon: '⚔️'
    },
    {
        id: 'skills',
        label: 'Skills',
        icon: '🎯'
    },
    {
        id: 'gear',
        label: 'Gear',
        icon: '🎒'
    }
];
function MobileTabBar({ activeTab, onTabChange, hasCampaign, hasForce }) {
    const tabs = [
        ...BASE_TABS,
        ...hasCampaign ? [
            {
                id: 'combat',
                label: 'Combat',
                icon: '⚡'
            },
            {
                id: 'feed',
                label: 'Feed',
                icon: '📡'
            }
        ] : [],
        ...hasForce ? [
            {
                id: 'force',
                label: 'Force',
                icon: '✦'
            }
        ] : []
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'sticky',
            bottom: 0,
            zIndex: 40,
            height: 64,
            background: PANEL,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: `1px solid ${BORDER}`,
            display: 'flex',
            flexShrink: 0,
            overflowX: 'auto',
            scrollbarWidth: 'none'
        },
        children: tabs.map((tab)=>{
            const active = tab.id === activeTab;
            const isForceTab = tab.id === 'force';
            const accentColor = isForceTab ? FORCE_BLUE : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold;
            const inactiveColor = isForceTab ? 'rgba(126,200,227,0.4)' : GOLD_I;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onTabChange(tab.id),
                "aria-label": tab.label,
                style: {
                    flex: '1 0 64px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px 4px',
                    position: 'relative',
                    minWidth: 0
                },
                children: [
                    active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: 'absolute',
                            top: 0,
                            left: '10%',
                            right: '10%',
                            height: 2,
                            background: accentColor,
                            borderRadius: '0 0 2px 2px'
                        }
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileTabBar.tsx",
                        lineNumber: 78,
                        columnNumber: 15
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 16,
                            lineHeight: 1
                        },
                        children: tab.icon
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileTabBar.tsx",
                        lineNumber: 87,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: FONT_R,
                            fontSize: 'clamp(0.52rem, 2vw, 0.67rem)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: active ? accentColor : inactiveColor,
                            lineHeight: 1,
                            whiteSpace: 'nowrap'
                        },
                        children: tab.label
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileTabBar.tsx",
                        lineNumber: 88,
                        columnNumber: 13
                    }, this)
                ]
            }, tab.id, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileTabBar.tsx",
                lineNumber: 57,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileTabBar.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
_c = MobileTabBar;
var _c;
__turbopack_context__.k.register(_c, "MobileTabBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/mobile/shared/BottomSheet.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BottomSheet",
    ()=>BottomSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
// ─── Tokens ──────────────────────────────────────────────────────────────────
const PANEL = 'var(--hud-surface-hi)';
const BORDER = 'var(--hud-border-hi)';
const SCRIM = 'rgba(0,0,0,0.6)';
function BottomSheet({ open, onClose, children, maxHeight = '85dvh' }) {
    _s();
    const startYRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    // Prevent body scroll when open
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BottomSheet.useEffect": ()=>{
            document.body.style.overflow = open ? 'hidden' : '';
            return ({
                "BottomSheet.useEffect": ()=>{
                    document.body.style.overflow = '';
                }
            })["BottomSheet.useEffect"];
        }
    }["BottomSheet.useEffect"], [
        open
    ]);
    const handleTouchStart = (e)=>{
        startYRef.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e)=>{
        const delta = e.changedTouches[0].clientY - startYRef.current;
        if (delta > 80) onClose();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: onClose,
                style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 90,
                    background: SCRIM,
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? 'auto' : 'none',
                    transition: 'opacity 200ms ease'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/shared/BottomSheet.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: PANEL,
                    borderTop: `1px solid ${BORDER}`,
                    borderRadius: '16px 16px 0 0',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    maxHeight,
                    display: 'flex',
                    flexDirection: 'column',
                    transform: open ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 250ms ease-out',
                    touchAction: 'pan-y'
                },
                onTouchStart: handleTouchStart,
                onTouchEnd: handleTouchEnd,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '12px 0 4px',
                            display: 'flex',
                            justifyContent: 'center',
                            flexShrink: 0
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: 32,
                                height: 4,
                                background: 'var(--hud-border-hi)',
                                borderRadius: 2
                            }
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/mobile/shared/BottomSheet.tsx",
                            lineNumber: 69,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/shared/BottomSheet.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: 'auto',
                            overscrollBehavior: 'contain'
                        },
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/shared/BottomSheet.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/shared/BottomSheet.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(BottomSheet, "ToUtqb5bCZ60FW5oZvbR9mIdeX0=");
_c = BottomSheet;
var _c;
__turbopack_context__.k.register(_c, "BottomSheet");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusTab",
    ()=>StatusTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$WeaponDamageDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/WeaponDamageDisplay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$weaponHandedness$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/weaponHandedness.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
;
// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-dim)';
const GOLD_BD = 'var(--hud-border)';
const BORDER = 'var(--hud-border)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
const CARD_BG = 'var(--hud-surface-lo)';
const FONT_C = 'var(--font-body)';
const FONT_R = 'var(--font-body)';
const FONT_M = 'var(--font-body)';
const CHAR_ENTRIES = [
    {
        key: 'brawn',
        label: 'Brawn'
    },
    {
        key: 'agility',
        label: 'Agility'
    },
    {
        key: 'cunning',
        label: 'Cunning'
    },
    {
        key: 'intellect',
        label: 'Intellect'
    },
    {
        key: 'willpower',
        label: 'Willpower'
    },
    {
        key: 'presence',
        label: 'Presence'
    }
];
const SEV_COLOR = {
    Minor: '#4CAF50',
    Moderate: '#FF9800',
    Serious: '#f44336',
    Critical: '#9C27B0'
};
function SectionHeader({ label }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: FONT_C,
            fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
            fontWeight: 700,
            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '12px 16px 6px',
            borderBottom: `1px solid ${BORDER}`,
            marginBottom: 8
        },
        children: label
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_c = SectionHeader;
function StatusTab({ character, weapons, crits, refWeaponMap, refSkillMap, effectiveStats }) {
    const equippedWeapons = (Array.isArray(weapons) ? weapons : []).filter((w)=>w.equip_state === 'equipped' || w.is_equipped);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            paddingBottom: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                label: "Characteristics"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                    padding: '0 16px 12px'
                },
                children: CHAR_ENTRIES.map(({ key, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: CARD_BG,
                            border: `1px solid ${GOLD_BD}`,
                            borderRadius: 8,
                            padding: '8px 6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FONT_R,
                                    fontSize: 'clamp(0.5rem, 2vw, 0.65rem)',
                                    textTransform: 'uppercase',
                                    color: GOLD_DIM,
                                    letterSpacing: '0.06em',
                                    lineHeight: 1
                                },
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FONT_C,
                                    fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
                                    fontWeight: 700,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                    lineHeight: 1
                                },
                                children: character[key]
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                lineNumber: 95,
                                columnNumber: 13
                            }, this)
                        ]
                    }, key, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                label: "Derived"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 8,
                    padding: '0 16px 12px',
                    flexWrap: 'wrap'
                },
                children: [
                    {
                        label: 'Soak',
                        value: effectiveStats?.soak ?? character.soak
                    },
                    {
                        label: 'Def (M)',
                        value: effectiveStats?.defenseMelee ?? character.defense_melee
                    },
                    {
                        label: 'Def (R)',
                        value: effectiveStats?.defenseRanged ?? character.defense_ranged
                    }
                ].map(({ label, value })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'var(--hud-surface-lo)',
                            border: `1px solid ${GOLD_BD}`,
                            borderRadius: 20,
                            padding: '5px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)',
                                    color: TEXT_DIM
                                },
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                lineNumber: 125,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FONT_C,
                                    fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                                    fontWeight: 700,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                },
                                children: value
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                lineNumber: 126,
                                columnNumber: 13
                            }, this)
                        ]
                    }, label, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            equippedWeapons.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                        label: "Weapons"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                        lineNumber: 134,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '0 16px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0
                        },
                        children: [
                            equippedWeapons.map((cw, i)=>{
                                const ref = refWeaponMap[cw.weapon_key];
                                if (!ref) return null;
                                const skillRef = refSkillMap[ref.skill_key];
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        i > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                height: 1,
                                                background: BORDER,
                                                margin: '6px 0'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                            lineNumber: 142,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                padding: '4px 0'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontFamily: FONT_C,
                                                        fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
                                                        fontWeight: 700,
                                                        color: TEXT,
                                                        marginBottom: 2
                                                    },
                                                    children: cw.custom_name || ref.name
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontFamily: FONT_R,
                                                        fontSize: 'clamp(0.7rem, 2.8vw, 0.85rem)',
                                                        color: TEXT_DIM,
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '0 10px'
                                                    },
                                                    children: [
                                                        skillRef && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: skillRef.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                            lineNumber: 161,
                                                            columnNumber: 36
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#E07855'
                                                            },
                                                            children: [
                                                                "DMG ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$WeaponDamageDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WeaponDamageDisplay"], {
                                                                    baseDamage: ref.damage_add != null ? ref.damage_add : ref.damage,
                                                                    isMelee: ref.damage_add != null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$WeaponDamageDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMeleeSkill"])(ref.skill_key),
                                                                    brawn: character.brawn
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                                    lineNumber: 163,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                            lineNumber: 162,
                                                            columnNumber: 23
                                                        }, this),
                                                        ref.crit > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#E05050'
                                                            },
                                                            children: [
                                                                "CRIT ",
                                                                ref.crit
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                            lineNumber: 169,
                                                            columnNumber: 40
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_LABELS"][ref.range_value] ?? ref.range_value
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                            lineNumber: 170,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                    lineNumber: 153,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                            lineNumber: 143,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, cw.id, true, {
                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                    lineNumber: 141,
                                    columnNumber: 17
                                }, this);
                            }),
                            (()=>{
                                if (equippedWeapons.length < 2) return null;
                                const entries = equippedWeapons.map((cw)=>{
                                    const ref = refWeaponMap[cw.weapon_key];
                                    if (!ref) return null;
                                    return {
                                        id: cw.id,
                                        name: cw.custom_name || ref.name,
                                        skill_key: ref.skill_key,
                                        is_one_handed_override: cw.is_one_handed_override,
                                        is_two_handed_override: cw.is_two_handed_override
                                    };
                                }).filter(Boolean);
                                const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$weaponHandedness$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateLoadout"])(entries);
                                const isDualWield = entries.length === 2 && entries.every((e)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$weaponHandedness$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canDualWield"])(e));
                                if (validation.valid && isDualWield) {
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 8,
                                            paddingTop: 6,
                                            borderTop: `1px solid ${BORDER}`,
                                            fontFamily: FONT_M,
                                            fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
                                            color: '#4CAF50',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "✓"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                lineNumber: 205,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Dual Wield loadout · Two one-handed weapons equipped"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                lineNumber: 206,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                        lineNumber: 197,
                                        columnNumber: 19
                                    }, this);
                                }
                                if (!validation.valid) {
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 8,
                                            paddingTop: 6,
                                            borderTop: `1px solid ${BORDER}`,
                                            fontFamily: FONT_M,
                                            fontSize: 'clamp(0.62rem, 0.95vw, 0.72rem)',
                                            color: '#FF9800',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "⚠"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                lineNumber: 220,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Invalid loadout — review your equipped weapons"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                lineNumber: 221,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                        lineNumber: 212,
                                        columnNumber: 19
                                    }, this);
                                }
                                return null;
                            })()
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                        lineNumber: 135,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            crits.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                        label: "Critical Injuries"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                        lineNumber: 234,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '0 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                        },
                        children: (Array.isArray(crits) ? crits : []).map((crit)=>{
                            const sevColor = SEV_COLOR[crit.severity] ?? '#888';
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: `${sevColor}10`,
                                    border: `1px solid ${sevColor}40`,
                                    borderRadius: 8,
                                    padding: '8px 12px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            marginBottom: 3
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: FONT_M,
                                                    fontSize: 'clamp(0.55rem, 2vw, 0.65rem)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em',
                                                    color: sevColor,
                                                    background: `${sevColor}20`,
                                                    border: `1px solid ${sevColor}50`,
                                                    borderRadius: 4,
                                                    padding: '1px 6px'
                                                },
                                                children: crit.severity
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                lineNumber: 246,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: FONT_C,
                                                    fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
                                                    fontWeight: 700,
                                                    color: TEXT
                                                },
                                                children: crit.custom_name
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                                lineNumber: 259,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                        lineNumber: 245,
                                        columnNumber: 19
                                    }, this),
                                    crit.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontFamily: FONT_R,
                                            fontSize: 'clamp(0.7rem, 2.8vw, 0.85rem)',
                                            color: TEXT_DIM,
                                            margin: 0,
                                            lineHeight: 1.4
                                        },
                                        children: crit.description
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                        lineNumber: 269,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, crit.id, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                                lineNumber: 239,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
                        lineNumber: 235,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_c1 = StatusTab;
var _c, _c1;
__turbopack_context__.k.register(_c, "SectionHeader");
__turbopack_context__.k.register(_c1, "StatusTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SkillsTab",
    ()=>SkillsTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/design-tokens.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/dice/DiceFace.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/dice-engine.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-dim)';
const GOLD_BD = 'var(--hud-border-hi)';
const BORDER = 'var(--hud-border)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
const STICKY_BG = 'var(--hud-surface-hi)';
const INPUT_BG = 'var(--hud-surface-mid)';
const FONT_C = 'var(--font-body)';
const FONT_R = 'var(--font-body)';
const FONT_M = 'var(--font-body)';
const FONT_CINZEL_REAL = 'var(--font-body)';
const RED = 'rgba(244,67,54,0.8)';
const GROUP_LABELS = {
    stGeneral: 'General Skills',
    stCombat: 'Combat Skills',
    stKnowledge: 'Knowledge Skills'
};
const GROUP_ORDER = [
    'stGeneral',
    'stCombat',
    'stKnowledge'
];
function RankPips({ rank }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            gap: 3,
            alignItems: 'center'
        },
        children: Array.from({
            length: 5
        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: i < rank ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : 'transparent',
                    border: `1px solid ${i < rank ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : GOLD_BD}`
                }
            }, i, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_c = RankPips;
const POOL_CAP = 6;
const POOL_OVERFLOW_FONT = 'var(--font-body)';
function PoolPips({ proficiency, ability }) {
    const total = proficiency + ability;
    if (total === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                gap: 3,
                alignItems: 'center'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                type: "ability",
                size: 18,
                dimmed: true
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
            lineNumber: 56,
            columnNumber: 7
        }, this);
    }
    const shown = Math.min(total, POOL_CAP);
    const overflow = total - shown;
    const proShown = Math.min(proficiency, shown);
    const ablShown = shown - proShown;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            gap: 3,
            alignItems: 'center'
        },
        children: [
            Array.from({
                length: proShown
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                    type: "proficiency",
                    size: 18
                }, `p${i}`, false, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this)),
            Array.from({
                length: ablShown
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                    type: "ability",
                    size: 18
                }, `a${i}`, false, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this)),
            overflow > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: POOL_OVERFLOW_FONT,
                    fontSize: 'clamp(0.58rem, 0.85vw, 0.68rem)',
                    color: 'var(--hud-text-faint)'
                },
                children: [
                    "+",
                    overflow
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                lineNumber: 76,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_c1 = PoolPips;
// ── Skill dice modifier indicators (mobile) ───────────────────────────────
function SetbackRemovalBadge({ count }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 2
        },
        children: [
            Array.from({
                length: Math.min(count, 3)
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'relative',
                        display: 'inline-block',
                        width: 16,
                        height: 16
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                            type: "setback",
                            size: 16,
                            active: false,
                            dimmed: true
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            style: {
                                position: 'absolute',
                                inset: 0
                            },
                            viewBox: "0 0 16 16",
                            width: 16,
                            height: 16,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                x1: "3",
                                y1: "3",
                                x2: "13",
                                y2: "13",
                                stroke: "#e05252",
                                strokeWidth: "2",
                                strokeLinecap: "round"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this)),
            count > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: POOL_OVERFLOW_FONT,
                    fontSize: 'clamp(0.55rem, 0.8vw, 0.65rem)',
                    color: '#e05252'
                },
                children: [
                    "×",
                    count
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                lineNumber: 102,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_c2 = SetbackRemovalBadge;
function BoostAddBadge({ count }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 2
        },
        children: [
            Array.from({
                length: Math.min(count, 3)
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                    type: "boost",
                    size: 16,
                    active: false
                }, i, false, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this)),
            count > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: POOL_OVERFLOW_FONT,
                    fontSize: 'clamp(0.55rem, 0.8vw, 0.65rem)',
                    color: 'var(--hud-text-faint)'
                },
                children: [
                    "×",
                    count
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                lineNumber: 119,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
_c3 = BoostAddBadge;
// ── Upgrade helpers ───────────────────────────────────────────────────────
function getSkillUpgradeCost(currentRank, isCareer) {
    const newRank = currentRank + 1;
    return isCareer ? 5 * newRank : 5 * newRank + 5;
}
// ── Mobile inline confirmation ────────────────────────────────────────────
function MobileInlineConfirmation({ name, newRank, cost, xpAvailable, onConfirm, onCancel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            padding: '8px 16px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    minWidth: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: FONT_R,
                            fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
                            fontWeight: 600,
                            color: TEXT,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        },
                        children: [
                            name,
                            " → Rank ",
                            newRank
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: FONT_M,
                            fontSize: 'clamp(0.65rem, 2.5vw, 0.78rem)',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                        },
                        children: [
                            cost,
                            " XP · ",
                            xpAvailable,
                            " available"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 6,
                    flexShrink: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: (e)=>{
                            e.stopPropagation();
                            onCancel();
                        },
                        style: {
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            background: 'rgba(244,67,54,0.08)',
                            border: '1px solid rgba(244,67,54,0.35)',
                            color: RED,
                            cursor: 'pointer',
                            fontFamily: FONT_R,
                            fontSize: 'clamp(0.85rem, 3.5vw, 1rem)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                        },
                        children: "✗"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: (e)=>{
                            e.stopPropagation();
                            onConfirm();
                        },
                        style: {
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            background: 'var(--hud-surface-lo)',
                            border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            cursor: 'pointer',
                            fontFamily: FONT_R,
                            fontSize: 'clamp(0.85rem, 3.5vw, 1rem)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                        },
                        children: "✓"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
        lineNumber: 147,
        columnNumber: 5
    }, this);
}
_c4 = MobileInlineConfirmation;
function SkillsTab({ character, charSkills, refSkills, onSkillTap, skillModifiers = {}, xpAvailable, onUpgradeSkill }) {
    _s();
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [confirmingKey, setConfirmingKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const confirmTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const skillMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SkillsTab.useMemo[skillMap]": ()=>Object.fromEntries((Array.isArray(charSkills) ? charSkills : []).map({
                "SkillsTab.useMemo[skillMap]": (s)=>[
                        s.skill_key,
                        s
                    ]
            }["SkillsTab.useMemo[skillMap]"]))
    }["SkillsTab.useMemo[skillMap]"], [
        charSkills
    ]);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SkillsTab.useMemo[filtered]": ()=>{
            const safeRefSkills = Array.isArray(refSkills) ? refSkills : [];
            const q = query.toLowerCase().trim();
            if (!q) return safeRefSkills;
            return safeRefSkills.filter({
                "SkillsTab.useMemo[filtered]": (rs)=>{
                    const charAbbr = rs.characteristic_key.toLowerCase();
                    return rs.name.toLowerCase().includes(q) || charAbbr.includes(q);
                }
            }["SkillsTab.useMemo[filtered]"]);
        }
    }["SkillsTab.useMemo[filtered]"], [
        refSkills,
        query
    ]);
    const grouped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SkillsTab.useMemo[grouped]": ()=>{
            const groups = {};
            for (const g of GROUP_ORDER){
                const skills = filtered.filter({
                    "SkillsTab.useMemo[grouped].skills": (rs)=>rs.type === g
                }["SkillsTab.useMemo[grouped].skills"]).sort({
                    "SkillsTab.useMemo[grouped].skills": (a, b)=>a.name.localeCompare(b.name)
                }["SkillsTab.useMemo[grouped].skills"]);
                if (skills.length > 0) groups[g] = skills;
            }
            return groups;
        }
    }["SkillsTab.useMemo[grouped]"], [
        filtered
    ]);
    const toggle = (g)=>setCollapsed((prev)=>({
                ...prev,
                [g]: !prev[g]
            }));
    const startConfirm = (skillKey)=>{
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        setConfirmingKey(skillKey);
        confirmTimerRef.current = setTimeout(()=>setConfirmingKey(null), 5000);
    };
    const cancelConfirm = ()=>{
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        setConfirmingKey(null);
    };
    const executeUpgrade = (skillKey, rank, isCareer)=>{
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        setConfirmingKey(null);
        onUpgradeSkill?.(skillKey, rank, isCareer);
    };
    const handleSkillTap = (rs)=>{
        const cs = skillMap[rs.key];
        const rank = cs?.rank ?? 0;
        const charKey = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_REF_MAP"][rs.characteristic_key];
        const charVal = character[charKey] ?? 0;
        const { proficiency, ability } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSkillPool"])(charVal, rank);
        const charAbbr = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_ABBR3"][charKey] ?? rs.characteristic_key;
        onSkillTap({
            name: rs.name,
            charAbbr,
            proficiency,
            ability
        });
    };
    const xpColor = xpAvailable !== undefined ? xpAvailable > 20 ? GOLD_DIM : xpAvailable > 0 ? '#FF9800' : 'rgba(244,67,54,0.7)' : GOLD_DIM;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    padding: '8px 16px',
                    background: STICKY_BG,
                    borderBottom: `1px solid ${BORDER}`
                },
                children: [
                    xpAvailable !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginBottom: 5
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: FONT_M,
                                fontSize: 'clamp(0.65rem, 2.5vw, 0.78rem)',
                                color: xpColor
                            },
                            children: [
                                "Available XP: ",
                                xpAvailable
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                            lineNumber: 284,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                        lineNumber: 283,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: 'relative'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    position: 'absolute',
                                    left: 10,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: GOLD_DIM,
                                    fontSize: 14,
                                    pointerEvents: 'none'
                                },
                                children: "🔍"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                lineNumber: 295,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: query,
                                onChange: (e)=>setQuery(e.target.value),
                                placeholder: "Search skills…",
                                style: {
                                    width: '100%',
                                    background: INPUT_BG,
                                    border: `1px solid ${GOLD_BD}`,
                                    borderRadius: 6,
                                    padding: '8px 10px 8px 32px',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                lineNumber: 299,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                        lineNumber: 294,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                lineNumber: 275,
                columnNumber: 7
            }, this),
            GROUP_ORDER.map((g)=>{
                const skills = grouped[g];
                if (!skills) return null;
                const isCollapsed = !!collapsed[g];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>toggle(g),
                            style: {
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 16px',
                                background: 'var(--hud-surface-lo)',
                                border: 'none',
                                borderBottom: `1px solid ${BORDER}`,
                                cursor: 'pointer'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontFamily: FONT_C,
                                        fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                                        fontWeight: 700,
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    },
                                    children: GROUP_LABELS[g]
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                    lineNumber: 339,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: GOLD_DIM,
                                        fontSize: 12
                                    },
                                    children: isCollapsed ? '▲' : '▼'
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                    lineNumber: 349,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                            lineNumber: 328,
                            columnNumber: 13
                        }, this),
                        !isCollapsed && skills.map((rs)=>{
                            const cs = skillMap[rs.key];
                            const rank = cs?.rank ?? 0;
                            const isCareer = cs?.is_career ?? false;
                            const charKey = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_REF_MAP"][rs.characteristic_key];
                            const charVal = character[charKey] ?? 0;
                            const { proficiency, ability } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSkillPool"])(charVal, rank);
                            const charAbbr = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_ABBR3"][charKey] ?? rs.characteristic_key;
                            const isMaxRank = rank >= 5;
                            const isConfirming = confirmingKey === rs.key;
                            const cost = !isMaxRank ? getSkillUpgradeCost(rank, isCareer) : 0;
                            const canAfford = xpAvailable !== undefined && xpAvailable >= cost;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    minHeight: 44,
                                    borderBottom: `1px solid ${BORDER}`,
                                    background: isConfirming ? 'var(--hud-surface-lo)' : 'transparent'
                                },
                                children: isConfirming ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MobileInlineConfirmation, {
                                    name: rs.name,
                                    newRank: rank + 1,
                                    cost: cost,
                                    xpAvailable: xpAvailable ?? 0,
                                    onConfirm: ()=>executeUpgrade(rs.key, rank, isCareer),
                                    onCancel: cancelConfirm
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                    lineNumber: 379,
                                    columnNumber: 21
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            role: "button",
                                            tabIndex: 0,
                                            onClick: ()=>handleSkillTap(rs),
                                            onKeyDown: (e)=>e.key === 'Enter' && handleSkillTap(rs),
                                            style: {
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '8px 0 8px 16px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                minWidth: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: '50%',
                                                        flexShrink: 0,
                                                        background: isCareer ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : 'transparent',
                                                        border: `1px solid ${isCareer ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : GOLD_BD}`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                    lineNumber: 407,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: FONT_R,
                                                        fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
                                                        fontWeight: 600,
                                                        color: TEXT,
                                                        flex: 1,
                                                        minWidth: 0,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    },
                                                    children: rs.name
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                    lineNumber: 414,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: FONT_M,
                                                        fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                                                        color: GOLD_DIM,
                                                        flexShrink: 0,
                                                        width: 30,
                                                        textAlign: 'center'
                                                    },
                                                    children: charAbbr
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                    lineNumber: 429,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                            lineNumber: 390,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '0 16px 0 6px',
                                                flexShrink: 0
                                            },
                                            children: [
                                                !isMaxRank && onUpgradeSkill && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: (e)=>{
                                                        e.stopPropagation();
                                                        if (canAfford) startConfirm(rs.key);
                                                    },
                                                    title: `Upgrade to Rank ${rank + 1} — Cost: ${cost} XP${!canAfford ? ' (Not enough XP)' : ''}`,
                                                    style: {
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: 6,
                                                        background: canAfford ? 'var(--hud-surface-lo)' : 'transparent',
                                                        border: `1px solid ${canAfford ? 'var(--hud-border-hi)' : 'var(--hud-border)'}`,
                                                        color: canAfford ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : 'var(--hud-text-faint)',
                                                        fontFamily: FONT_CINZEL_REAL,
                                                        fontSize: 'clamp(0.75rem, 3vw, 0.85rem)',
                                                        cursor: canAfford ? 'pointer' : 'not-allowed',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0,
                                                        flexShrink: 0
                                                    },
                                                    children: "+"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                    lineNumber: 448,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        flexShrink: 0
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RankPips, {
                                                        rank: rank
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                        lineNumber: 469,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                    lineNumber: 468,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        flexShrink: 0,
                                                        minWidth: 48
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PoolPips, {
                                                        proficiency: proficiency,
                                                        ability: ability
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                        lineNumber: 474,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                    lineNumber: 473,
                                                    columnNumber: 25
                                                }, this),
                                                skillModifiers[rs.key] && (skillModifiers[rs.key].boostAdd > 0 || skillModifiers[rs.key].setbackRemove > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 3,
                                                        borderLeft: `1px solid ${BORDER}`,
                                                        paddingLeft: 4,
                                                        flexShrink: 0
                                                    },
                                                    children: [
                                                        skillModifiers[rs.key].boostAdd > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BoostAddBadge, {
                                                            count: skillModifiers[rs.key].boostAdd
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                            lineNumber: 486,
                                                            columnNumber: 31
                                                        }, this),
                                                        skillModifiers[rs.key].setbackRemove > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SetbackRemovalBadge, {
                                                            count: skillModifiers[rs.key].setbackRemove
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                            lineNumber: 489,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                                    lineNumber: 479,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                            lineNumber: 442,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, rs.key, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                                lineNumber: 367,
                                columnNumber: 17
                            }, this);
                        })
                    ]
                }, g, true, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                    lineNumber: 326,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 16
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
                lineNumber: 503,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx",
        lineNumber: 273,
        columnNumber: 5
    }, this);
}
_s(SkillsTab, "YwW/fcClOC4Y4x//JMSG8ThDKsU=");
_c5 = SkillsTab;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "RankPips");
__turbopack_context__.k.register(_c1, "PoolPips");
__turbopack_context__.k.register(_c2, "SetbackRemovalBadge");
__turbopack_context__.k.register(_c3, "BoostAddBadge");
__turbopack_context__.k.register(_c4, "MobileInlineConfirmation");
__turbopack_context__.k.register(_c5, "SkillsTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GearTab",
    ()=>GearTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$WeaponDamageDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/WeaponDamageDisplay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$QualityBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/QualityBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-dim)';
const GOLD_BD = 'var(--hud-border-hi)';
const BORDER = 'var(--hud-border)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
const CARD_BG = 'var(--hud-surface-lo)';
const FONT_C = 'var(--font-body)';
const FONT_R = 'var(--font-body)';
const FONT_M = 'var(--font-body)';
const EQUIP_STATES = [
    'stowed',
    'carrying',
    'equipped'
];
const EQUIP_LABELS = {
    stowed: 'STOW',
    carrying: 'CARRY',
    equipped: 'EQUIP'
};
const EQUIP_ACTIVE = {
    stowed: {
        background: 'var(--hud-surface-lo)',
        borderColor: 'var(--hud-border-hi)',
        color: 'var(--hud-text)'
    },
    carrying: {
        background: 'var(--hud-surface-lo)',
        borderColor: 'var(--hud-border-hi)',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
    },
    equipped: {
        background: 'rgba(78,200,122,0.18)',
        borderColor: '#4EC87A',
        color: 'var(--hud-text-faint)'
    }
};
function EquipStateButtons({ equipState, onSet }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            gap: 4,
            flexShrink: 0
        },
        children: EQUIP_STATES.map((s)=>{
            const isActive = equipState === s;
            const active = EQUIP_ACTIVE[s];
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>{
                    if (!isActive && onSet) onSet(s);
                },
                disabled: !onSet,
                style: {
                    height: 28,
                    borderRadius: 5,
                    padding: '0 10px',
                    fontFamily: FONT_M,
                    fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)',
                    textTransform: 'uppercase',
                    cursor: !onSet || isActive ? 'default' : 'pointer',
                    border: '1px solid',
                    ...isActive ? active : {
                        background: 'var(--hud-surface-lo)',
                        borderColor: 'var(--hud-border)',
                        color: 'var(--hud-text-faint)'
                    }
                },
                children: EQUIP_LABELS[s]
            }, s, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                lineNumber: 41,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_c = EquipStateButtons;
function SectionHeader({ label }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: FONT_C,
            fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
            fontWeight: 700,
            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '12px 16px 6px',
            borderBottom: `1px solid ${BORDER}`,
            marginBottom: 8
        },
        children: label
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_c1 = SectionHeader;
function StatPill({ label, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            fontFamily: FONT_M,
            fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
            color: TEXT_DIM,
            background: 'var(--hud-surface-lo)',
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: '2px 8px',
            whiteSpace: 'nowrap'
        },
        children: [
            label,
            " ",
            value
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, this);
}
_c2 = StatPill;
function GearTab({ weapons, armor, gear, brawn, refWeaponMap, refArmorMap, refGearMap, refSkillMap, refDescriptorMap, refWeaponQualityMap, onSetWeaponState, onSetArmorState, onSetGearState, onDiscardWeapon, onDiscardArmor, onDiscardGear }) {
    _s();
    const [expandedItems, setExpandedItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const toggleExpand = (id)=>setExpandedItems((prev)=>({
                ...prev,
                [id]: !prev[id]
            }));
    const [confirmingDiscard, setConfirmingDiscard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const discardTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const startDiscard = (id, type)=>{
        if (discardTimerRef.current) clearTimeout(discardTimerRef.current);
        setConfirmingDiscard({
            id,
            type
        });
        discardTimerRef.current = setTimeout(()=>setConfirmingDiscard(null), 5000);
    };
    const cancelDiscard = ()=>{
        if (discardTimerRef.current) clearTimeout(discardTimerRef.current);
        setConfirmingDiscard(null);
    };
    const executeDiscard = ()=>{
        if (!confirmingDiscard) return;
        if (discardTimerRef.current) clearTimeout(discardTimerRef.current);
        if (confirmingDiscard.type === 'weapon') onDiscardWeapon?.(confirmingDiscard.id);
        else if (confirmingDiscard.type === 'armor') onDiscardArmor?.(confirmingDiscard.id);
        else onDiscardGear?.(confirmingDiscard.id);
        setConfirmingDiscard(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            paddingBottom: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                label: "Weapons"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                lineNumber: 155,
                columnNumber: 7
            }, this),
            weapons.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontFamily: FONT_R,
                    color: GOLD_DIM,
                    fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                    padding: '4px 16px 12px'
                },
                children: "None."
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                lineNumber: 157,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '0 16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                },
                children: (Array.isArray(weapons) ? weapons : []).map((cw)=>{
                    const ref = refWeaponMap[cw.weapon_key];
                    if (!ref) return null;
                    const skillRef = refSkillMap[ref.skill_key];
                    const qualities = Array.isArray(ref.qualities) ? ref.qualities : [];
                    const equip = cw.equip_state ?? (cw.is_equipped ? 'equipped' : 'stowed');
                    const isExpanded = !!expandedItems[cw.id];
                    const descText = ref.description ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stripBBCode"])(ref.description).trim() : '';
                    const qualDescs = qualities.map((q)=>({
                            q,
                            qref: refWeaponQualityMap[q.key]
                        })).filter(({ qref })=>qref?.description?.trim());
                    const hasContent = !!(descText || qualDescs.length);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: CARD_BG,
                            border: `1px solid ${equip === 'equipped' ? GOLD_BD : BORDER}`,
                            borderRadius: 8,
                            padding: '10px 12px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: 6,
                                    gap: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_C,
                                            fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
                                            fontWeight: 700,
                                            color: TEXT
                                        },
                                        children: cw.custom_name || ref.name
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 180,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EquipStateButtons, {
                                                equipState: equip,
                                                onSet: onSetWeaponState ? (s)=>onSetWeaponState(cw.id, s) : undefined
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                                lineNumber: 184,
                                                columnNumber: 19
                                            }, this),
                                            onDiscardWeapon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>confirmingDiscard?.id === cw.id ? cancelDiscard() : startDiscard(cw.id, 'weapon'),
                                                style: {
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: '2px 6px',
                                                    cursor: 'pointer',
                                                    lineHeight: 1,
                                                    flexShrink: 0,
                                                    color: confirmingDiscard?.id === cw.id ? GOLD_DIM : 'var(--hud-text-faint)',
                                                    fontSize: 18
                                                },
                                                children: "×"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                                lineNumber: 186,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 183,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 179,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 6
                                },
                                children: [
                                    skillRef && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        label: "Skill",
                                        value: skillRef.name
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 199,
                                        columnNumber: 30
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        label: "DMG",
                                        value: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$WeaponDamageDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WeaponDamageDisplay"], {
                                            baseDamage: ref.damage_add != null ? ref.damage_add : ref.damage,
                                            isMelee: ref.damage_add != null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$WeaponDamageDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMeleeSkill"])(ref.skill_key),
                                            brawn: brawn
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                            lineNumber: 201,
                                            columnNumber: 19
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 200,
                                        columnNumber: 17
                                    }, this),
                                    ref.crit > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        label: "CRIT",
                                        value: ref.crit
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 207,
                                        columnNumber: 34
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        label: "Range",
                                        value: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_LABELS"][ref.range_value] ?? ref.range_value
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 208,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        label: "ENC",
                                        value: ref.encumbrance
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 209,
                                        columnNumber: 17
                                    }, this),
                                    ref.hard_points > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        label: "HP",
                                        value: ref.hard_points
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 210,
                                        columnNumber: 41
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 198,
                                columnNumber: 15
                            }, this),
                            qualities.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 6,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 4
                                },
                                children: qualities.map((q, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$QualityBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QualityBadge"], {
                                        quality: q,
                                        refQualityMap: refWeaponQualityMap,
                                        variant: "mobile"
                                    }, i, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 215,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 213,
                                columnNumber: 17
                            }, this),
                            hasContent && isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8,
                                    paddingTop: 8,
                                    borderTop: `1px solid ${BORDER}`
                                },
                                children: [
                                    descText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                        text: descText,
                                        style: {
                                            fontFamily: FONT_R,
                                            fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)',
                                            color: TEXT_DIM,
                                            lineHeight: 1.55,
                                            whiteSpace: 'pre-wrap'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 222,
                                        columnNumber: 21
                                    }, this),
                                    qualDescs.map(({ q, qref }, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: descText && i === 0 ? 8 : 4
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: FONT_C,
                                                        fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)',
                                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                                        fontWeight: 600
                                                    },
                                                    children: [
                                                        qref.name,
                                                        qref.is_ranked && q.count && q.count > 1 ? ` ${q.count}` : '',
                                                        ":",
                                                        ' '
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                                    lineNumber: 229,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                                    text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stripBBCode"])(qref.description),
                                                    style: {
                                                        fontFamily: FONT_R,
                                                        fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)',
                                                        color: TEXT_DIM,
                                                        lineHeight: 1.55
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                                    lineNumber: 232,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                            lineNumber: 228,
                                            columnNumber: 21
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 220,
                                columnNumber: 17
                            }, this),
                            onDiscardWeapon && confirmingDiscard?.id === cw.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8,
                                    paddingTop: 8,
                                    borderTop: `1px solid ${BORDER}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_R,
                                            fontSize: 'clamp(0.7rem, 2.8vw, 0.82rem)',
                                            color: TEXT_DIM,
                                            flex: 1
                                        },
                                        children: "Drop this item?"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 242,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: cancelDiscard,
                                        style: {
                                            height: 26,
                                            padding: '0 10px',
                                            borderRadius: 5,
                                            cursor: 'pointer',
                                            fontFamily: FONT_M,
                                            fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)',
                                            background: 'transparent',
                                            border: `1px solid ${BORDER}`,
                                            color: TEXT_DIM
                                        },
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 243,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: executeDiscard,
                                        style: {
                                            height: 26,
                                            padding: '0 10px',
                                            borderRadius: 5,
                                            cursor: 'pointer',
                                            fontFamily: FONT_M,
                                            fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)',
                                            fontWeight: 700,
                                            background: 'rgba(244,67,54,0.12)',
                                            border: '1px solid rgba(244,67,54,0.5)',
                                            color: '#E05050'
                                        },
                                        children: "Drop"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 244,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 241,
                                columnNumber: 17
                            }, this),
                            hasContent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>toggleExpand(cw.id),
                                style: {
                                    display: 'block',
                                    width: '100%',
                                    marginTop: 6,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: TEXT_DIM,
                                    fontSize: '0.6rem',
                                    textAlign: 'center',
                                    padding: '2px 0'
                                },
                                children: isExpanded ? '▲' : '▼'
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 248,
                                columnNumber: 17
                            }, this)
                        ]
                    }, cw.id, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                        lineNumber: 173,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                label: "Armor"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                lineNumber: 266,
                columnNumber: 7
            }, this),
            armor.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontFamily: FONT_R,
                    color: GOLD_DIM,
                    fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                    padding: '4px 16px 12px'
                },
                children: "None."
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                lineNumber: 268,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '0 16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                },
                children: (Array.isArray(armor) ? armor : []).map((ca)=>{
                    const ref = refArmorMap[ca.armor_key];
                    if (!ref) return null;
                    const equip = ca.equip_state ?? (ca.is_equipped ? 'equipped' : 'stowed');
                    const isExpanded = !!expandedItems[ca.id];
                    const descText = ref.description ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stripBBCode"])(ref.description).trim() : '';
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: CARD_BG,
                            border: `1px solid ${equip === 'equipped' ? GOLD_BD : BORDER}`,
                            borderRadius: 8,
                            padding: '10px 12px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 6,
                                    gap: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_C,
                                            fontSize: 'clamp(0.8rem, 3.2vw, 0.95rem)',
                                            fontWeight: 700,
                                            color: TEXT
                                        },
                                        children: ca.custom_name || ref.name
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 285,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EquipStateButtons, {
                                                equipState: equip,
                                                onSet: onSetArmorState ? (s)=>onSetArmorState(ca.id, s) : undefined
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                                lineNumber: 289,
                                                columnNumber: 19
                                            }, this),
                                            onDiscardArmor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>confirmingDiscard?.id === ca.id ? cancelDiscard() : startDiscard(ca.id, 'armor'),
                                                style: {
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: '2px 6px',
                                                    cursor: 'pointer',
                                                    lineHeight: 1,
                                                    flexShrink: 0,
                                                    color: confirmingDiscard?.id === ca.id ? GOLD_DIM : 'var(--hud-text-faint)',
                                                    fontSize: 18
                                                },
                                                children: "×"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                                lineNumber: 291,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 288,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 284,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        label: "Soak",
                                        value: ref.soak
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 304,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        label: "Def",
                                        value: ref.defense
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 305,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        label: "ENC",
                                        value: ref.encumbrance
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 306,
                                        columnNumber: 17
                                    }, this),
                                    ref.hard_points > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatPill, {
                                        label: "HP",
                                        value: ref.hard_points
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 307,
                                        columnNumber: 41
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 303,
                                columnNumber: 15
                            }, this),
                            descText && isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8,
                                    paddingTop: 8,
                                    borderTop: `1px solid ${BORDER}`
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                    text: descText,
                                    style: {
                                        fontFamily: FONT_R,
                                        fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)',
                                        color: TEXT_DIM,
                                        lineHeight: 1.55,
                                        whiteSpace: 'pre-wrap'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                    lineNumber: 311,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 310,
                                columnNumber: 17
                            }, this),
                            onDiscardArmor && confirmingDiscard?.id === ca.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8,
                                    paddingTop: 8,
                                    borderTop: `1px solid ${BORDER}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_R,
                                            fontSize: 'clamp(0.7rem, 2.8vw, 0.82rem)',
                                            color: TEXT_DIM,
                                            flex: 1
                                        },
                                        children: "Drop this item?"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 319,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: cancelDiscard,
                                        style: {
                                            height: 26,
                                            padding: '0 10px',
                                            borderRadius: 5,
                                            cursor: 'pointer',
                                            fontFamily: FONT_M,
                                            fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)',
                                            background: 'transparent',
                                            border: `1px solid ${BORDER}`,
                                            color: TEXT_DIM
                                        },
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 320,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: executeDiscard,
                                        style: {
                                            height: 26,
                                            padding: '0 10px',
                                            borderRadius: 5,
                                            cursor: 'pointer',
                                            fontFamily: FONT_M,
                                            fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)',
                                            fontWeight: 700,
                                            background: 'rgba(244,67,54,0.12)',
                                            border: '1px solid rgba(244,67,54,0.5)',
                                            color: '#E05050'
                                        },
                                        children: "Drop"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 321,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 318,
                                columnNumber: 17
                            }, this),
                            descText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>toggleExpand(ca.id),
                                style: {
                                    display: 'block',
                                    width: '100%',
                                    marginTop: 6,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: TEXT_DIM,
                                    fontSize: '0.6rem',
                                    textAlign: 'center',
                                    padding: '2px 0'
                                },
                                children: isExpanded ? '▲' : '▼'
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 325,
                                columnNumber: 17
                            }, this)
                        ]
                    }, ca.id, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                        lineNumber: 278,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                lineNumber: 270,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                label: "Personal Gear"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                lineNumber: 343,
                columnNumber: 7
            }, this),
            gear.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontFamily: FONT_R,
                    color: GOLD_DIM,
                    fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                    padding: '4px 16px 12px'
                },
                children: "None."
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                lineNumber: 345,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '0 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                },
                children: (Array.isArray(gear) ? gear : []).map((cg)=>{
                    const ref = refGearMap[cg.gear_key];
                    if (!ref) return null;
                    const isExpanded = !!expandedItems[cg.id];
                    const descText = ref.description ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stripBBCode"])(ref.description).trim() : '';
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            borderBottom: `1px solid ${BORDER}`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 0'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_R,
                                            fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                                            color: TEXT,
                                            flex: 1
                                        },
                                        children: [
                                            cg.custom_name || ref.name,
                                            cg.quantity > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: GOLD_DIM,
                                                    marginLeft: 6
                                                },
                                                children: [
                                                    "×",
                                                    cg.quantity
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                                lineNumber: 364,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 361,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            flexShrink: 0,
                                            marginLeft: 10
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: FONT_M,
                                                    fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                                                    color: TEXT_DIM
                                                },
                                                children: [
                                                    "ENC ",
                                                    ref.encumbrance
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                                lineNumber: 368,
                                                columnNumber: 19
                                            }, this),
                                            descText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>toggleExpand(cg.id),
                                                style: {
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: TEXT_DIM,
                                                    fontSize: '0.6rem',
                                                    padding: '0 4px'
                                                },
                                                children: isExpanded ? '▲' : '▼'
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                                lineNumber: 372,
                                                columnNumber: 21
                                            }, this),
                                            onDiscardGear && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>confirmingDiscard?.id === cg.id ? cancelDiscard() : startDiscard(cg.id, 'gear'),
                                                style: {
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: '2px 4px',
                                                    cursor: 'pointer',
                                                    lineHeight: 1,
                                                    flexShrink: 0,
                                                    color: confirmingDiscard?.id === cg.id ? GOLD_DIM : 'var(--hud-text-faint)',
                                                    fontSize: 16
                                                },
                                                children: "×"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                                lineNumber: 383,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 367,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 355,
                                columnNumber: 15
                            }, this),
                            descText && isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '0 0 8px'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                    text: descText,
                                    style: {
                                        fontFamily: FONT_R,
                                        fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)',
                                        color: TEXT_DIM,
                                        lineHeight: 1.55,
                                        whiteSpace: 'pre-wrap'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                    lineNumber: 397,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 396,
                                columnNumber: 17
                            }, this),
                            onDiscardGear && confirmingDiscard?.id === cg.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    paddingBottom: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_R,
                                            fontSize: 'clamp(0.7rem, 2.8vw, 0.82rem)',
                                            color: TEXT_DIM,
                                            flex: 1
                                        },
                                        children: "Drop this item?"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 405,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: cancelDiscard,
                                        style: {
                                            height: 24,
                                            padding: '0 8px',
                                            borderRadius: 5,
                                            cursor: 'pointer',
                                            fontFamily: FONT_M,
                                            fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)',
                                            background: 'transparent',
                                            border: `1px solid ${BORDER}`,
                                            color: TEXT_DIM
                                        },
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 406,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: executeDiscard,
                                        style: {
                                            height: 24,
                                            padding: '0 8px',
                                            borderRadius: 5,
                                            cursor: 'pointer',
                                            fontFamily: FONT_M,
                                            fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)',
                                            fontWeight: 700,
                                            background: 'rgba(244,67,54,0.12)',
                                            border: '1px solid rgba(244,67,54,0.5)',
                                            color: '#E05050'
                                        },
                                        children: "Drop"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                        lineNumber: 407,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                                lineNumber: 404,
                                columnNumber: 17
                            }, this)
                        ]
                    }, cg.id, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                        lineNumber: 354,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
                lineNumber: 347,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx",
        lineNumber: 152,
        columnNumber: 5
    }, this);
}
_s(GearTab, "YldwU0KivS3My4PgQe0ZmGC+0Jo=");
_c3 = GearTab;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "EquipStateButtons");
__turbopack_context__.k.register(_c1, "SectionHeader");
__turbopack_context__.k.register(_c2, "StatPill");
__turbopack_context__.k.register(_c3, "GearTab");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WoundsStrainFab",
    ()=>WoundsStrainFab,
    "WoundsStrainOverlay",
    ()=>WoundsStrainOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$EncumbranceBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/EncumbranceBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
// ─── Tokens ──────────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-dim)';
const GOLD_BD = 'var(--hud-border-hi)';
const TEXT = 'var(--hud-text)';
const BORDER = 'var(--hud-border)';
const FONT_C = 'var(--font-body)';
const FONT_R = 'var(--font-body)';
const FONT_M = 'var(--font-body)';
const WOUND_DANGER = '#f44336';
const STRAIN_WARN = '#FF9800';
function VitalBtn({ label, disabled, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        disabled: disabled,
        style: {
            width: 56,
            height: 56,
            minWidth: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: disabled ? 'var(--hud-surface-lo)' : 'var(--hud-surface-mid)',
            border: `1px solid ${disabled ? BORDER : GOLD_BD}`,
            borderRadius: 12,
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontFamily: FONT_C,
            fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
            fontWeight: 700,
            color: disabled ? 'var(--hud-text-faint)' : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
            transition: 'background 0.15s'
        },
        children: label
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c = VitalBtn;
function VitalSection({ label, current, threshold, onDecrement, onIncrement, dangerColor }) {
    const atDanger = current >= threshold;
    const valueColor = atDanger ? dangerColor : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            padding: '0 12px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: FONT_R,
                    fontSize: 'clamp(0.65rem, 2.6vw, 0.8rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: GOLD_DIM
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(VitalBtn, {
                        label: "−",
                        disabled: current <= 0,
                        onClick: onDecrement
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_C,
                                    fontSize: 'clamp(1.6rem, 6vw, 2rem)',
                                    fontWeight: 700,
                                    color: valueColor,
                                    lineHeight: 1,
                                    transition: 'color 0.2s'
                                },
                                children: current
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_M,
                                    fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                                    color: GOLD_DIM,
                                    marginTop: 2
                                },
                                children: [
                                    "/ ",
                                    threshold
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(VitalBtn, {
                        label: "+",
                        disabled: current >= threshold,
                        onClick: onIncrement
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_c1 = VitalSection;
function WoundsStrainFab({ character, woundBonus = 0 }) {
    const effectiveWound = character.wound_threshold + woundBonus;
    const woundPct = effectiveWound > 0 ? character.wound_current / effectiveWound : 0;
    const strainPct = character.strain_threshold > 0 ? character.strain_current / character.strain_threshold : 0;
    const woundDanger = woundPct >= 0.8;
    const strainDanger = strainPct >= 0.8;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            fontFamily: FONT_M,
            fontSize: 'clamp(0.7rem, 2.8vw, 0.85rem)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    color: woundDanger ? WOUND_DANGER : TEXT
                },
                children: [
                    "❤️ ",
                    character.wound_current,
                    "/",
                    character.wound_threshold,
                    woundBonus > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: FONT_M,
                            fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            marginLeft: 2
                        },
                        children: [
                            "+",
                            woundBonus
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                        lineNumber: 129,
                        columnNumber: 28
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    color: GOLD_BD
                },
                children: "·"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    color: strainDanger ? STRAIN_WARN : TEXT
                },
                children: [
                    "🧠 ",
                    character.strain_current,
                    "/",
                    character.strain_threshold
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                lineNumber: 132,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
        lineNumber: 119,
        columnNumber: 5
    }, this);
}
_c2 = WoundsStrainFab;
function WoundsStrainOverlay({ character, onVitalChange, woundBonus = 0, encumbranceCurrent, encumbranceThreshold }) {
    // FAB and Sheet are split — the parent controls open state
    // This component is the sheet content only; use WoundsStrainFab for the trigger
    const effectiveWoundThreshold = character.wound_threshold + woundBonus;
    const showEnc = encumbranceCurrent !== undefined && encumbranceThreshold !== undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '8px 16px 32px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                style: {
                    fontFamily: FONT_C,
                    fontSize: 'clamp(0.8rem, 3.2vw, 1rem)',
                    fontWeight: 700,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    textAlign: 'center',
                    margin: '0 0 20px'
                },
                children: [
                    "Vitals",
                    woundBonus > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: FONT_M,
                            fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            marginLeft: 8,
                            opacity: 0.8
                        },
                        children: [
                            "Duty +",
                            woundBonus,
                            " WT"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                        lineNumber: 158,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 0,
                    position: 'relative'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(VitalSection, {
                        label: "Wounds",
                        current: character.wound_current,
                        threshold: effectiveWoundThreshold,
                        onDecrement: ()=>onVitalChange('wound_current', -1),
                        onIncrement: ()=>onVitalChange('wound_current', 1),
                        dangerColor: WOUND_DANGER
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: 1,
                            background: BORDER,
                            alignSelf: 'stretch'
                        }
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(VitalSection, {
                        label: "Strain",
                        current: character.strain_current,
                        threshold: character.strain_threshold,
                        onDecrement: ()=>onVitalChange('strain_current', -1),
                        onIncrement: ()=>onVitalChange('strain_current', 1),
                        dangerColor: STRAIN_WARN
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this),
            showEnc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: `1px solid ${BORDER}`
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$EncumbranceBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EncumbranceBar"], {
                    current: encumbranceCurrent,
                    threshold: encumbranceThreshold,
                    brawn: character.brawn,
                    labelFontSize: "clamp(0.65rem, 2.6vw, 0.8rem)"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                    lineNumber: 189,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
                lineNumber: 188,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx",
        lineNumber: 145,
        columnNumber: 5
    }, this);
}
_c3 = WoundsStrainOverlay;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "VitalBtn");
__turbopack_context__.k.register(_c1, "VitalSection");
__turbopack_context__.k.register(_c2, "WoundsStrainFab");
__turbopack_context__.k.register(_c3, "WoundsStrainOverlay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MobileSessionCompanion",
    ()=>MobileSessionCompanion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useCharacterData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/hooks/useCharacterData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$HolocronLoader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$MobileHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/mobile/MobileHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$MobileTabBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/mobile/MobileTabBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$shared$2f$BottomSheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/mobile/shared/BottomSheet.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$tabs$2f$StatusTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/mobile/tabs/StatusTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$tabs$2f$SkillsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/mobile/tabs/SkillsTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$tabs$2f$GearTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/mobile/tabs/GearTab.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$overlays$2f$WoundsStrainOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/mobile/overlays/WoundsStrainOverlay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$overlays$2f$DiceRollerSheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/mobile/overlays/DiceRollerSheet.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useSessionRollState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/hooks/useSessionRollState.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2f$SessionStatusBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useDerivedStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/hooks/useDerivedStats.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$derivedStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/derivedStats.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useRollFeed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/hooks/useRollFeed.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$RollFeedPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/RollFeedPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2f$CombatTracker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player/CombatTracker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$ForcePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/ForcePanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$ForceCheckButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/ForceCheckButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$ForceCheckOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$forceUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/forceUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$dathomiriUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/dathomiriUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// ─── Tokens ──────────────────────────────────────────────────────────────────
const BG = 'var(--hud-bg)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
const BORDER = 'var(--hud-border)';
const FONT_C = 'var(--font-body)';
const FONT_M = 'var(--font-body)';
const FONT_R = 'var(--font-body)';
function MobileSessionCompanion({ characterId, campaignId }) {
    _s();
    const { character, skills, talents, weapons, armor, gear, crits, refSkills, refTalentMap, refSkillMap, refWeaponMap, refArmorMap, refGearMap, refDescriptorMap, refWeaponQualityMap, refAttachmentMap, charForceAbilities, refForcePowers, refForcePowerMap, refForceAbilityMap, forceRating, handleVitalChange, handleSetEquipState, handleBuySkill, handleRemoveWeapon, handleRemoveEquipment, loading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useCharacterData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterData"])(characterId);
    // ── Derived stats engine (called unconditionally before early returns) ──
    const derivedStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useDerivedStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDerivedStats"])({
        character: character ?? null,
        forceRatingBase: forceRating,
        talents,
        refTalentMap,
        armor,
        refArmorMap,
        refAttachmentMap,
        weapons,
        refWeaponMap,
        refWeaponQualityMap
    });
    const effectiveStats = derivedStats?.effectiveStats;
    const skillModifiers = derivedStats?.modifiers.skillModifiers ?? {};
    const encStats = character ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$derivedStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeEncumbranceStats"])(character, armor, refArmorMap, gear, refGearMap, weapons, refWeaponMap) : null;
    const effectiveCampaignId = campaignId ?? character?.campaign_id ?? null;
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('status');
    const [woundsOpen, setWoundsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [diceOpen, setDiceOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [diceSkill, setDiceSkill] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [forceCheckOpen, setForceCheckOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Must be called unconditionally before any early returns
    const sessionRollState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useSessionRollState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSessionRollState"])(effectiveCampaignId);
    const rolls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useRollFeed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRollFeed"])(effectiveCampaignId);
    // Wake lock — silent, no UI
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MobileSessionCompanion.useEffect": ()=>{
            if (!('wakeLock' in navigator)) return;
            let lock = null;
            navigator.wakeLock.request('screen').then({
                "MobileSessionCompanion.useEffect": (l)=>{
                    lock = l;
                }
            }["MobileSessionCompanion.useEffect"]).catch({
                "MobileSessionCompanion.useEffect": ()=>{}
            }["MobileSessionCompanion.useEffect"]);
            return ({
                "MobileSessionCompanion.useEffect": ()=>{
                    lock?.release().catch({
                        "MobileSessionCompanion.useEffect": ()=>{}
                    }["MobileSessionCompanion.useEffect"]);
                }
            })["MobileSessionCompanion.useEffect"];
        }
    }["MobileSessionCompanion.useEffect"], []);
    // ── Force powers computation (mirrors desktop) ──────────────────────────
    const allForcePowers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MobileSessionCompanion.useMemo[allForcePowers]": ()=>{
            if (!charForceAbilities || !refForcePowers || !refForceAbilityMap) return [];
            const purchaseCount = new Map();
            for (const a of charForceAbilities){
                const k = `${a.force_power_key}:${a.force_ability_key}`;
                purchaseCount.set(k, (purchaseCount.get(k) ?? 0) + 1);
            }
            return refForcePowers.filter({
                "MobileSessionCompanion.useMemo[allForcePowers]": (fp)=>fp.ability_tree?.rows?.length
            }["MobileSessionCompanion.useMemo[allForcePowers]"]).map({
                "MobileSessionCompanion.useMemo[allForcePowers]": (fp)=>{
                    const abilityMap = new Map();
                    for (const row of fp.ability_tree?.rows ?? []){
                        for(let col = 0; col < (row.abilities || []).length; col++){
                            const aKey = row.abilities[col];
                            const cost = (row.costs || [])[col] ?? 0;
                            if (!aKey || cost === 0) continue;
                            const ref = refForceAbilityMap[aKey];
                            if (!ref) continue;
                            const existing = abilityMap.get(aKey);
                            if (existing) {
                                existing.totalRanks++;
                            } else {
                                const purchased = purchaseCount.get(`${fp.key}:${aKey}`) ?? 0;
                                abilityMap.set(aKey, {
                                    key: aKey,
                                    name: ref.name,
                                    description: ref.description,
                                    purchasedRanks: purchased,
                                    totalRanks: 1,
                                    cost
                                });
                            }
                        }
                    }
                    // Build tree nodes for ForcePowerCard
                    const treeNodes = [];
                    const treeConnections = [];
                    const purchasedSet = new Set(charForceAbilities.filter({
                        "MobileSessionCompanion.useMemo[allForcePowers]": (a)=>a.force_power_key === fp.key
                    }["MobileSessionCompanion.useMemo[allForcePowers]"]).map({
                        "MobileSessionCompanion.useMemo[allForcePowers]": (a)=>`${a.tree_row}-${a.tree_col}`
                    }["MobileSessionCompanion.useMemo[allForcePowers]"]));
                    const refPower = refForcePowerMap?.[fp.key];
                    if (refPower?.ability_tree?.rows) {
                        for (const row of refPower.ability_tree.rows){
                            const abils = row.abilities || [];
                            const dirs = row.directions || [];
                            const spans = row.spans || [];
                            const costs = row.costs || [];
                            for(let col = 0; col < abils.length; col++){
                                const aKey = abils[col];
                                const ref = refForceAbilityMap[aKey];
                                const span = spans[col] ?? 1;
                                const cost = costs[col] ?? 0;
                                const isPurchased = purchasedSet.has(`${row.index}-${col}`);
                                const dir = dirs[col] || {};
                                let canPurchase = false;
                                if (!isPurchased && cost > 0) {
                                    if (row.index === 0) canPurchase = true;
                                    else {
                                        if (dir.up) canPurchase = canPurchase || purchasedSet.has(`${row.index - 1}-${col}`);
                                        if (dir.left && col > 0) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col - 1}`);
                                        if (dir.right && col < 3) canPurchase = canPurchase || purchasedSet.has(`${row.index}-${col + 1}`);
                                        if (dir.down) canPurchase = canPurchase || purchasedSet.has(`${row.index + 1}-${col}`);
                                    }
                                }
                                treeNodes.push({
                                    abilityKey: aKey,
                                    name: ref?.name || aKey,
                                    description: ref?.description,
                                    row: row.index,
                                    col,
                                    span,
                                    cost,
                                    purchased: isPurchased,
                                    canPurchase
                                });
                                if (span > 0) {
                                    if (dir.right && col < 3) treeConnections.push({
                                        fromRow: row.index,
                                        fromCol: col,
                                        toRow: row.index,
                                        toCol: col + 1
                                    });
                                    if (dir.down) treeConnections.push({
                                        fromRow: row.index,
                                        fromCol: col,
                                        toRow: row.index + 1,
                                        toCol: col
                                    });
                                }
                            }
                        }
                    }
                    const abilities = Array.from(abilityMap.values());
                    const purchasedCount = abilities.reduce({
                        "MobileSessionCompanion.useMemo[allForcePowers].purchasedCount": (s, a)=>s + Math.min(a.purchasedRanks, a.totalRanks)
                    }["MobileSessionCompanion.useMemo[allForcePowers].purchasedCount"], 0);
                    const totalCount = abilities.reduce({
                        "MobileSessionCompanion.useMemo[allForcePowers].totalCount": (s, a)=>s + a.totalRanks
                    }["MobileSessionCompanion.useMemo[allForcePowers].totalCount"], 0);
                    return {
                        powerKey: fp.key,
                        powerName: fp.name,
                        description: fp.description,
                        purchasedCount,
                        totalCount,
                        abilities,
                        treeNodes,
                        treeConnections
                    };
                }
            }["MobileSessionCompanion.useMemo[allForcePowers]"]).sort({
                "MobileSessionCompanion.useMemo[allForcePowers]": (a, b)=>{
                    if (a.purchasedCount > 0 && b.purchasedCount === 0) return -1;
                    if (a.purchasedCount === 0 && b.purchasedCount > 0) return 1;
                    return a.powerName.localeCompare(b.powerName);
                }
            }["MobileSessionCompanion.useMemo[allForcePowers]"]);
        }
    }["MobileSessionCompanion.useMemo[allForcePowers]"], [
        charForceAbilities,
        refForcePowers,
        refForceAbilityMap,
        refForcePowerMap
    ]);
    const openSkillDice = (skill)=>{
        setDiceSkill(skill);
        setDiceOpen(true);
    };
    const openFreeDice = ()=>{
        setDiceSkill(null);
        setDiceOpen(true);
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                width: '100vw',
                height: '100dvh',
                background: BG,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$HolocronLoader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HolocronLoader"], {}, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                lineNumber: 196,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
            lineNumber: 191,
            columnNumber: 7
        }, this);
    }
    if (error || !character) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                width: '100vw',
                height: '100dvh',
                background: BG,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: 24
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: 32
                    },
                    children: "⚠️"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                    lineNumber: 209,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontFamily: FONT_C,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                        textAlign: 'center',
                        fontSize: 'clamp(0.9rem, 3.5vw, 1rem)'
                    },
                    children: error ?? 'Character not found.'
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                    lineNumber: 210,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
            lineNumber: 203,
            columnNumber: 7
        }, this);
    }
    const woundBonus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useSessionRollState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWoundThresholdBonus"])(character.id, sessionRollState);
    const woundPct = character.wound_threshold > 0 ? character.wound_current / character.wound_threshold : 0;
    const fabBorderColor = woundPct >= 0.8 ? 'rgba(244,67,54,0.7)' : 'var(--hud-border-hi)';
    const isForceUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$forceUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isForceUserSensitive"])(character, effectiveStats?.forceRating ?? forceRating);
    const hasCampaign = !!effectiveCampaignId;
    // Equipped weapons for the Combat tab weapon strip
    const equippedWeapons = weapons.filter((w)=>w.equip_state === 'equipped' || w.is_equipped);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '100vw',
            height: '100dvh',
            background: BG,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$MobileHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MobileHeader"], {
                characterName: character.name,
                onOpenDiceRoller: openFreeDice
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2f$SessionStatusBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SessionStatusBanner"], {
                sessionRollState: sessionRollState,
                characterId: character.id,
                characterNames: {
                    [character.id]: character.name
                },
                triggeredObligationType: character.obligation_type,
                ownObligationValue: character.obligation_value
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                lineNumber: 247,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                    position: 'relative'
                },
                children: [
                    activeTab === 'status' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$tabs$2f$StatusTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatusTab"], {
                        character: character,
                        weapons: weapons,
                        crits: crits,
                        refWeaponMap: refWeaponMap,
                        refSkillMap: refSkillMap,
                        effectiveStats: effectiveStats
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                        lineNumber: 258,
                        columnNumber: 11
                    }, this),
                    activeTab === 'skills' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$tabs$2f$SkillsTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SkillsTab"], {
                        character: character,
                        charSkills: skills,
                        refSkills: refSkills,
                        onSkillTap: openSkillDice,
                        skillModifiers: skillModifiers,
                        xpAvailable: character.xp_available,
                        onUpgradeSkill: handleBuySkill
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                        lineNumber: 268,
                        columnNumber: 11
                    }, this),
                    activeTab === 'gear' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$tabs$2f$GearTab$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GearTab"], {
                        weapons: weapons,
                        armor: armor,
                        gear: gear,
                        brawn: character.brawn,
                        refWeaponMap: refWeaponMap,
                        refArmorMap: refArmorMap,
                        refGearMap: refGearMap,
                        refSkillMap: refSkillMap,
                        refDescriptorMap: refDescriptorMap,
                        refWeaponQualityMap: refWeaponQualityMap,
                        onSetWeaponState: (id, s)=>handleSetEquipState(id, 'weapon', s),
                        onSetArmorState: (id, s)=>handleSetEquipState(id, 'armor', s),
                        onSetGearState: (id, s)=>handleSetEquipState(id, 'gear', s),
                        onDiscardWeapon: (id)=>handleRemoveWeapon(id, 'player'),
                        onDiscardArmor: (id)=>handleRemoveEquipment(id, 'armor', 'player'),
                        onDiscardGear: (id)=>handleRemoveEquipment(id, 'gear', 'player')
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                        lineNumber: 279,
                        columnNumber: 11
                    }, this),
                    activeTab === 'combat' && hasCampaign && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            paddingBottom: 16
                        },
                        children: [
                            equippedWeapons.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '10px 16px 0'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: FONT_C,
                                            fontSize: 'clamp(0.6rem, 2.4vw, 0.75rem)',
                                            fontWeight: 700,
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            paddingBottom: 6,
                                            borderBottom: `1px solid ${BORDER}`,
                                            marginBottom: 8
                                        },
                                        children: "Your Weapons"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                        lineNumber: 303,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 6
                                        },
                                        children: equippedWeapons.map((cw)=>{
                                            const ref = refWeaponMap[cw.weapon_key];
                                            if (!ref) return null;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    background: 'var(--hud-surface-lo)',
                                                    border: `1px solid ${BORDER}`,
                                                    borderRadius: 6,
                                                    padding: '7px 10px',
                                                    minHeight: 44
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontFamily: FONT_R,
                                                            fontSize: 'clamp(0.65rem, 2.5vw, 0.78rem)',
                                                            fontWeight: 700,
                                                            color: TEXT,
                                                            flex: 1,
                                                            minWidth: 0,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        },
                                                        children: cw.custom_name || ref.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                                        lineNumber: 329,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: 8,
                                                            flexShrink: 0,
                                                            alignItems: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontFamily: FONT_M,
                                                                    fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)',
                                                                    color: '#E07855'
                                                                },
                                                                children: [
                                                                    "DMG ",
                                                                    ref.damage_add != null ? `+${ref.damage_add}` : ref.damage
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                                                lineNumber: 343,
                                                                columnNumber: 27
                                                            }, this),
                                                            ref.crit > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontFamily: FONT_M,
                                                                    fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)',
                                                                    color: '#E05050'
                                                                },
                                                                children: [
                                                                    "CRIT ",
                                                                    ref.crit
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                                                lineNumber: 349,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontFamily: FONT_M,
                                                                    fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)',
                                                                    color: TEXT_DIM
                                                                },
                                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_LABELS"][ref.range_value] ?? ref.range_value
                                                            }, void 0, false, {
                                                                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                                                lineNumber: 353,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                                        lineNumber: 342,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, cw.id, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                                lineNumber: 321,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                        lineNumber: 316,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                lineNumber: 302,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    height: 'calc(100dvh - 200px)',
                                    marginTop: equippedWeapons.length > 0 ? 12 : 0
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2f$CombatTracker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CombatTracker"], {
                                    character: character,
                                    campaignId: effectiveCampaignId
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                    lineNumber: 366,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                lineNumber: 365,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                        lineNumber: 299,
                        columnNumber: 11
                    }, this),
                    activeTab === 'feed' && hasCampaign && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '12px 16px',
                            paddingBottom: 24
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$RollFeedPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RollFeedPanel"], {
                            rolls: rolls,
                            ownCharacterId: character.id,
                            isGm: false
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                            lineNumber: 375,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                        lineNumber: 374,
                        columnNumber: 11
                    }, this),
                    activeTab === 'force' && isForceUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '12px 16px',
                            paddingBottom: 24,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$ForcePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ForcePanel"], {
                                forceRating: effectiveStats?.forceRating ?? forceRating,
                                committedForce: character.force_rating_committed ?? 0,
                                moralityValue: character.morality_value ?? 50,
                                moralityStrength: character.morality_strength_key || '',
                                moralityWeakness: character.morality_weakness_key || '',
                                moralityConfigured: character.morality_configured,
                                forcePowers: allForcePowers.filter((fp)=>fp.purchasedCount > 0),
                                xpAvailable: character.xp_available,
                                onViewPower: ()=>{},
                                onAdd: ()=>{},
                                isFallen: character.is_dark_side_fallen === true
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                lineNumber: 384,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$ForceCheckButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ForceCheckButton"], {
                                onOpen: ()=>setForceCheckOpen(true)
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                                lineNumber: 397,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                        lineNumber: 383,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                lineNumber: 256,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$MobileTabBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MobileTabBar"], {
                activeTab: activeTab,
                onTabChange: setActiveTab,
                hasCampaign: hasCampaign,
                hasForce: isForceUser
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                lineNumber: 403,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setWoundsOpen(true),
                "aria-label": "Open wounds and strain tracker",
                style: {
                    position: 'fixed',
                    bottom: 80,
                    right: 16,
                    zIndex: 50,
                    background: 'var(--hud-surface-hi)',
                    border: `1px solid ${fabBorderColor}`,
                    borderRadius: 24,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$overlays$2f$WoundsStrainOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WoundsStrainFab"], {
                    character: character,
                    woundBonus: woundBonus
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                    lineNumber: 430,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                lineNumber: 411,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$shared$2f$BottomSheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BottomSheet"], {
                open: woundsOpen,
                onClose: ()=>setWoundsOpen(false),
                maxHeight: "60dvh",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$overlays$2f$WoundsStrainOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WoundsStrainOverlay"], {
                    character: character,
                    onVitalChange: handleVitalChange,
                    woundBonus: woundBonus,
                    encumbranceCurrent: encStats?.current,
                    encumbranceThreshold: encStats?.threshold
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                    lineNumber: 439,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                lineNumber: 434,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$shared$2f$BottomSheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BottomSheet"], {
                open: diceOpen,
                onClose: ()=>setDiceOpen(false),
                maxHeight: "85dvh",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$mobile$2f$overlays$2f$DiceRollerSheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceRollerSheet"], {
                    prePopSkill: diceSkill,
                    characterId: characterId,
                    characterName: character.name,
                    campaignId: campaignId
                }, diceSkill ? `${diceSkill.name}-${diceSkill.proficiency}` : 'free', false, {
                    fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                    lineNumber: 454,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                lineNumber: 449,
                columnNumber: 7
            }, this),
            isForceUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$ForceCheckOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ForceCheckOverlay"], {
                open: forceCheckOpen,
                onClose: ()=>setForceCheckOpen(false),
                character: character,
                forceRating: effectiveStats?.forceRating ?? forceRating,
                committedForce: character.force_rating_committed ?? 0,
                forcePowers: allForcePowers,
                isDathomiri: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$dathomiriUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isDathomiri"])(character),
                isCombat: false,
                campaignId: effectiveCampaignId,
                characterId: character.id
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
                lineNumber: 465,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/mobile/MobileSessionCompanion.tsx",
        lineNumber: 232,
        columnNumber: 5
    }, this);
}
_s(MobileSessionCompanion, "lZhFBIUQvCE8rkSuRynmOVed66U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useCharacterData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterData"],
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useDerivedStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDerivedStats"],
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useSessionRollState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSessionRollState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useRollFeed$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRollFeed"]
    ];
});
_c = MobileSessionCompanion;
var _c;
__turbopack_context__.k.register(_c, "MobileSessionCompanion");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=star-wars-rpg_src_components_mobile_93bede5f._.js.map