(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SelectPowerStep",
    ()=>SelectPowerStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
const FORCE_BLUE = '#7EC8E3';
const FORCE_BLUE_DIM = 'rgba(126,200,227,0.15)';
const FORCE_BLUE_SEL = 'rgba(126,200,227,0.1)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
function SelectPowerStep({ powers, selectedPowerKey, onSelect }) {
    const purchased = powers.filter((p)=>p.purchasedCount > 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: "var(--font-body)",
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em'
                },
                children: "Which power will you use?"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            purchased.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: 'center',
                    padding: '32px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                            color: TEXT_DIM
                        },
                        children: "No Force powers purchased yet."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                        },
                        children: "Visit the Force tab to purchase powers."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                lineNumber: 35,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                },
                children: purchased.map((p)=>{
                    const selected = p.powerKey === selectedPowerKey;
                    const desc = p.description ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stripBBCode"])(p.description) : '';
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onSelect(p.powerKey),
                        style: {
                            textAlign: 'left',
                            padding: '12px 14px',
                            background: selected ? FORCE_BLUE_SEL : 'rgba(126,200,227,0.04)',
                            border: `${selected ? 2 : 1}px solid ${selected ? FORCE_BLUE : FORCE_BLUE_DIM}`,
                            borderRadius: 10,
                            cursor: 'pointer',
                            transition: 'all .15s'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: desc ? 6 : 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
                                            opacity: 0.8,
                                            fontSize: 11
                                        },
                                        children: "✦"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                                        lineNumber: 66,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                            fontWeight: 700,
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                                        },
                                        children: p.powerName
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                                        lineNumber: 67,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                                lineNumber: 65,
                                columnNumber: 17
                            }, this),
                            desc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: TEXT_DIM,
                                    lineHeight: 1.4,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    marginBottom: 4
                                },
                                children: desc
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                                lineNumber: 77,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "var(--font-body)",
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                                },
                                children: [
                                    p.purchasedCount,
                                    " upgrade",
                                    p.purchasedCount !== 1 ? 's' : '',
                                    " purchased"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                                lineNumber: 91,
                                columnNumber: 17
                            }, this)
                        ]
                    }, p.powerKey, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                        lineNumber: 52,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
                lineNumber: 47,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = SelectPowerStep;
var _c;
__turbopack_context__.k.register(_c, "SelectPowerStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RollForceDiceStep",
    ()=>RollForceDiceStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/dice-engine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/dice/DiceFace.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
const FORCE_BLUE = '#7EC8E3';
const FORCE_BLUE_DIM = 'rgba(126,200,227,0.35)';
const LIGHT_COLOR = '#E8E8FF';
const DARK_COLOR = 'rgba(80,40,120,0.9)';
const DARK_BORDER = '#6060A0';
function ForceDieFace({ die }) {
    const empty = die.light === 0 && die.dark === 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: 44,
            height: 44,
            borderRadius: 6,
            background: 'rgba(126,200,227,0.06)',
            border: `1.5px solid rgba(126,200,227,0.3)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 3,
            flexShrink: 0
        },
        children: [
            empty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                },
                children: "—"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                lineNumber: 35,
                columnNumber: 9
            }, this),
            die.light > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 2
                },
                children: Array.from({
                    length: die.light
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            background: LIGHT_COLOR,
                            boxShadow: `0 0 4px ${LIGHT_COLOR}80`
                        }
                    }, i, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 40,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this),
            die.dark > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 2
                },
                children: Array.from({
                    length: die.dark
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            background: DARK_COLOR,
                            border: `1px solid ${DARK_BORDER}`
                        }
                    }, i, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 47,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                lineNumber: 45,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_c = ForceDieFace;
function RollForceDiceStep({ forceRating, committedForce, result, isDathomiri, isFallen = false, onRoll }) {
    const available = Math.max(0, forceRating - committedForce);
    function handleRoll() {
        onRoll((0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rollForceDice"])(available));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                            textTransform: 'uppercase',
                            letterSpacing: '0.18em',
                            marginBottom: 10
                        },
                        children: "Your Force Dice Pool"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            marginBottom: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "var(--font-body)",
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                                },
                                children: [
                                    "Force Rating: ",
                                    forceRating
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this),
                            committedForce > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                    fontStyle: 'italic'
                                },
                                children: [
                                    "(",
                                    committedForce,
                                    " committed to ongoing effects)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                lineNumber: 83,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "var(--font-body)",
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                                },
                                children: [
                                    "Available: ",
                                    available
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap'
                        },
                        children: [
                            Array.from({
                                length: available
                            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                                    type: "force",
                                    size: 36,
                                    active: false
                                }, i, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                    lineNumber: 95,
                                    columnNumber: 13
                                }, this)),
                            available === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                    fontStyle: 'italic'
                                },
                                children: "No Force dice available"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            result === null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleRoll,
                disabled: available === 0,
                style: {
                    width: '100%',
                    height: 52,
                    borderRadius: 10,
                    background: available > 0 ? 'linear-gradient(135deg, rgba(126,200,227,0.3), rgba(126,200,227,0.15))' : 'rgba(126,200,227,0.05)',
                    border: `1px solid ${available > 0 ? 'rgba(126,200,227,0.6)' : FORCE_BLUE_DIM}`,
                    cursor: available > 0 ? 'pointer' : 'not-allowed',
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                    fontWeight: 700,
                    color: available > 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    transition: 'all .15s'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "✦"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, this),
                    "Roll ",
                    available,
                    " Force ",
                    available === 1 ? 'Die' : 'Dice'
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                lineNumber: 107,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                            textTransform: 'uppercase',
                            letterSpacing: '0.18em'
                        },
                        children: "Result"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap'
                        },
                        children: result.dice.map((die, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ForceDieFace, {
                                die: die
                            }, i, false, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                lineNumber: 139,
                                columnNumber: 42
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: 10,
                            flexDirection: isFallen ? 'row-reverse' : 'row'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    textAlign: 'center',
                                    padding: '10px 8px',
                                    background: isFallen ? 'rgba(126,200,227,0.04)' : 'rgba(232,232,255,0.05)',
                                    border: `1px solid ${isFallen ? 'rgba(126,200,227,0.2)' : 'rgba(232,232,255,0.15)'}`,
                                    borderRadius: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            gap: 4,
                                            justifyContent: 'center',
                                            marginBottom: 6,
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            Array.from({
                                                length: result.totalLight
                                            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: 11,
                                                        height: 11,
                                                        borderRadius: '50%',
                                                        background: LIGHT_COLOR,
                                                        boxShadow: `0 0 4px ${LIGHT_COLOR}`
                                                    }
                                                }, i, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                                    lineNumber: 153,
                                                    columnNumber: 19
                                                }, this)),
                                            result.totalLight === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    color: 'rgba(232,232,255,0.2)',
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption
                                                },
                                                children: "—"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                                lineNumber: 155,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                            fontWeight: 700,
                                            color: LIGHT_COLOR,
                                            lineHeight: 1
                                        },
                                        children: result.totalLight
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                        lineNumber: 157,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: isFallen ? 'rgba(126,200,227,0.5)' : 'rgba(232,232,255,0.5)',
                                            marginTop: 3
                                        },
                                        children: [
                                            "Light ○",
                                            isFallen ? ' (cost)' : ''
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                        lineNumber: 158,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    textAlign: 'center',
                                    padding: '10px 8px',
                                    background: isFallen ? 'rgba(139,43,226,0.1)' : 'rgba(96,96,160,0.08)',
                                    border: `1px solid ${isFallen ? 'rgba(139,43,226,0.35)' : 'rgba(96,96,160,0.25)'}`,
                                    borderRadius: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            gap: 4,
                                            justifyContent: 'center',
                                            marginBottom: 6,
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            Array.from({
                                                length: result.totalDark
                                            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: 11,
                                                        height: 11,
                                                        borderRadius: '50%',
                                                        background: DARK_COLOR,
                                                        border: `1px solid ${DARK_BORDER}`
                                                    }
                                                }, i, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                                    lineNumber: 171,
                                                    columnNumber: 19
                                                }, this)),
                                            result.totalDark === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    color: 'rgba(96,96,160,0.3)',
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption
                                                },
                                                children: "—"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                                lineNumber: 173,
                                                columnNumber: 44
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                        lineNumber: 169,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                            fontWeight: 700,
                                            color: isFallen ? '#8B2BE2' : DARK_BORDER,
                                            lineHeight: 1
                                        },
                                        children: result.totalDark
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                        lineNumber: 175,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: isFallen ? 'rgba(139,43,226,0.7)' : 'rgba(96,96,160,0.6)',
                                            marginTop: 3
                                        },
                                        children: [
                                            "Dark ●",
                                            isFallen ? ' (free)' : ''
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                        lineNumber: 176,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                                lineNumber: 163,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 143,
                        columnNumber: 11
                    }, this),
                    !isFallen && result.totalLight === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '8px 12px',
                            background: 'var(--hud-surface-lo)',
                            border: '1px solid var(--hud-border)',
                            borderRadius: 6
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                color: 'var(--hud-text-dim)',
                                lineHeight: 1.45
                            },
                            children: "⚠ No light side Force Points generated. The power activates but has no effect. You may still use dark side pips."
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                            lineNumber: 185,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 184,
                        columnNumber: 13
                    }, this),
                    isFallen && result.totalDark === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '8px 12px',
                            background: 'var(--hud-surface-lo)',
                            border: '1px solid var(--hud-border)',
                            borderRadius: 6
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                color: 'var(--hud-text-dim)',
                                lineHeight: 1.45
                            },
                            children: "⚠ No dark side Force Points generated. The power activates but has no effect. You may still use light side pips."
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                            lineNumber: 192,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 191,
                        columnNumber: 13
                    }, this),
                    !isFallen && result.totalDark > 0 && !isDathomiri && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '8px 12px',
                            background: 'rgba(224,58,30,0.07)',
                            border: '1px solid rgba(224,58,30,0.22)',
                            borderRadius: 6
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                color: 'rgba(224,58,30,0.85)',
                                fontStyle: 'italic',
                                lineHeight: 1.45
                            },
                            children: "⚠ Dark side Force Points available. Using them has consequences. See next step."
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                            lineNumber: 201,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 200,
                        columnNumber: 13
                    }, this),
                    isFallen && result.totalLight > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '8px 12px',
                            background: 'rgba(126,200,227,0.05)',
                            border: '1px solid rgba(126,200,227,0.2)',
                            borderRadius: 6
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                color: 'rgba(126,200,227,0.7)',
                                fontStyle: 'italic',
                                lineHeight: 1.45
                            },
                            children: "✦ Light side Force Points available. Using them costs Destiny + strain. See next step."
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                            lineNumber: 208,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                        lineNumber: 207,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
                lineNumber: 131,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_c1 = RollForceDiceStep;
var _c, _c1;
__turbopack_context__.k.register(_c, "ForceDieFace");
__turbopack_context__.k.register(_c1, "RollForceDiceStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DarkSidePipsStep",
    ()=>DarkSidePipsStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
const FORCE_BLUE = '#7EC8E3';
const DARK_PURPLE = '#8B2BE2';
function DarkSidePipsStep({ lightPips, darkPips, darkPipsUsed, onChangeDark, isFallen = false }) {
    const totalFP = lightPips + darkPipsUsed;
    const accentColor = isFallen ? FORCE_BLUE : '#E03A1E';
    const accentMuted = isFallen ? 'rgba(126,200,227,0.4)' : 'rgba(224,58,30,0.4)';
    const costlyLabel = isFallen ? 'light side' : 'dark side';
    const freeLabel = isFallen ? 'dark side' : 'light side';
    const destinyFlip = isFallen ? 'dark → light' : 'light → dark';
    const headerIcon = isFallen ? '✦' : '⚠';
    const headerTitle = isFallen ? 'Light Side Temptation' : 'Dark Side Temptation';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                            fontWeight: 700,
                            color: accentColor,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em'
                        },
                        children: [
                            headerIcon,
                            " ",
                            headerTitle
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: 40,
                            height: 2,
                            background: accentMuted
                        }
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
                    lineHeight: 1.6,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            "You rolled",
                            ' ',
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                style: {
                                    color: accentColor
                                },
                                children: [
                                    darkPips,
                                    " ",
                                    costlyLabel,
                                    " Force Point",
                                    darkPips !== 1 ? 's' : ''
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                lineNumber: 60,
                                columnNumber: 11
                            }, this),
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            "Using ",
                            costlyLabel,
                            " Force Points requires:"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            paddingLeft: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "• Flip 1 Destiny Point ",
                                    destinyFlip
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "• Suffer ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        style: {
                                            color: accentColor
                                        },
                                        children: [
                                            darkPipsUsed,
                                            " strain"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                        lineNumber: 67,
                                        columnNumber: 25
                                    }, this),
                                    " (1 per pip used)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                lineNumber: 67,
                                columnNumber: 11
                            }, this),
                            !isFallen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: "• Gain Conflict (your GM will be notified)"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                lineNumber: 68,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim
                        },
                        children: [
                            "You already have ",
                            lightPips,
                            " ",
                            freeLabel,
                            " Force Point",
                            lightPips !== 1 ? 's' : '',
                            " available without consequence."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em'
                        },
                        children: [
                            isFallen ? 'Light' : 'Dark',
                            " pips to use"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>onChangeDark(Math.max(0, darkPipsUsed - 1)),
                                style: {
                                    width: 36,
                                    height: 36,
                                    borderRadius: 6,
                                    background: 'var(--hud-surface-lo)',
                                    border: '1px solid var(--hud-border)',
                                    cursor: 'pointer',
                                    color: 'var(--hud-text-dim)',
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    fontFamily: "var(--font-body)"
                                },
                                children: "−"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    fontWeight: 700,
                                    color: darkPipsUsed > 0 ? accentColor : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                    minWidth: 32,
                                    textAlign: 'center'
                                },
                                children: darkPipsUsed
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>onChangeDark(Math.min(darkPips, darkPipsUsed + 1)),
                                style: {
                                    width: 36,
                                    height: 36,
                                    borderRadius: 6,
                                    background: 'var(--hud-surface-lo)',
                                    border: '1px solid var(--hud-border)',
                                    cursor: 'pointer',
                                    color: 'var(--hud-text-dim)',
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    fontFamily: "var(--font-body)"
                                },
                                children: "+"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                lineNumber: 88,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    darkPipsUsed > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '10px 12px',
                            background: isFallen ? 'rgba(126,200,227,0.06)' : 'rgba(144,96,208,0.08)',
                            border: `1px solid ${isFallen ? 'rgba(126,200,227,0.2)' : 'rgba(144,96,208,0.2)'}`,
                            borderRadius: 6,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim
                                },
                                children: [
                                    "Using ",
                                    darkPipsUsed,
                                    " ",
                                    costlyLabel,
                                    " pip",
                                    darkPipsUsed !== 1 ? 's' : '',
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "var(--font-body)",
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Strain cost:   ",
                                            darkPipsUsed
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                        lineNumber: 101,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Destiny flip:  1 ",
                                            destinyFlip
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                        lineNumber: 102,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                                        },
                                        children: [
                                            "Total FP:      ",
                                            totalFP
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 96,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginTop: 4
                },
                children: [
                    darkPipsUsed > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '8px 10px',
                            background: isFallen ? 'rgba(126,200,227,0.05)' : 'rgba(224,58,30,0.06)',
                            border: `1px solid ${isFallen ? 'rgba(126,200,227,0.2)' : 'rgba(224,58,30,0.2)'}`,
                            borderRadius: 6
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                color: isFallen ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim : 'rgba(224,58,30,0.75)',
                                lineHeight: 1.4
                            },
                            children: [
                                "Remember: suffer ",
                                darkPipsUsed,
                                " strain and flip 1 Destiny Point when the GM confirms."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                            lineNumber: 113,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 112,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                            fontStyle: 'italic'
                        },
                        children: "Adjust the selector above then click Continue to proceed."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c = DarkSidePipsStep;
var _c;
__turbopack_context__.k.register(_c, "DarkSidePipsStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ForceTargetStep",
    ()=>ForceTargetStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
const FORCE_BLUE = '#7EC8E3';
const FORCE_BLUE_DIM = 'rgba(126,200,227,0.15)';
function ForceTargetStep({ isCombat, campaignId, characterId, selectedTargets, targetContext, onSelectTargets, onTargetContext, campaignCharacters, encounterEnemies }) {
    _s();
    const [pcs, setPcs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [enemies, setEnemies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedIds = new Set(selectedTargets.map((t)=>t.instanceId));
    function toggleTarget(t) {
        if (selectedIds.has(t.instanceId)) {
            onSelectTargets(selectedTargets.filter((s)=>s.instanceId !== t.instanceId));
        } else {
            onSelectTargets([
                ...selectedTargets,
                t
            ]);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ForceTargetStep.useEffect": ()=>{
            // Use pre-fetched data if provided — skip DB
            if (campaignCharacters) {
                setPcs(campaignCharacters);
                setLoading(false);
            }
            if (encounterEnemies) {
                setEnemies(encounterEnemies);
                setLoading(false);
            }
            if (campaignCharacters || encounterEnemies) return;
            if (!campaignId) return;
            setLoading(true);
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const loadAll = {
                "ForceTargetStep.useEffect.loadAll": async ()=>{
                    const [{ data: chars }, { data: encounter }] = await Promise.all([
                        supabase.from('characters').select('id, name').eq('campaign_id', campaignId).eq('is_archived', false),
                        isCombat ? supabase.from('combat_encounters').select('adversaries').eq('campaign_id', campaignId).eq('is_active', true).limit(1).single() : Promise.resolve({
                            data: null
                        })
                    ]);
                    setPcs(chars ?? []);
                    if (isCombat && encounter) {
                        const adv = (encounter.adversaries ?? []).map({
                            "ForceTargetStep.useEffect.loadAll.adv": (a)=>({
                                    instanceId: a.instanceId,
                                    name: a.name,
                                    kind: 'enemy'
                                })
                        }["ForceTargetStep.useEffect.loadAll.adv"]);
                        setEnemies(adv);
                    }
                    setLoading(false);
                }
            }["ForceTargetStep.useEffect.loadAll"];
            loadAll();
        }
    }["ForceTargetStep.useEffect"], [
        campaignId,
        isCombat,
        campaignCharacters,
        encounterEnemies
    ]);
    if (!isCombat) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 16
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: "var(--font-body)",
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em'
                    },
                    children: "How will you use this power?"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this),
                [
                    'environment',
                    'character'
                ].map((ctx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onTargetContext(ctx),
                        style: {
                            textAlign: 'left',
                            padding: '14px 16px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            background: targetContext === ctx ? 'rgba(126,200,227,0.1)' : 'var(--hud-surface-lo)',
                            border: `${targetContext === ctx ? 2 : 1}px solid ${targetContext === ctx ? FORCE_BLUE : FORCE_BLUE_DIM}`,
                            transition: 'all .15s'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                    color: targetContext === ctx ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                    marginBottom: 4
                                },
                                children: ctx === 'environment' ? '🌍  Use on Environment' : '👤  Use on a Character'
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                                },
                                children: ctx === 'environment' ? 'Targeting an object, location, or environmental feature' : 'Target a PC or friendly NPC'
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this)
                        ]
                    }, ctx, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, this)),
                targetContext === 'character' && pcs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        paddingTop: 4
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: "var(--font-body)",
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em'
                            },
                            children: "Select character (optional)"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                            lineNumber: 110,
                            columnNumber: 13
                        }, this),
                        pcs.filter((c)=>c.id !== characterId).map((c)=>{
                            const t = {
                                instanceId: c.id,
                                name: c.name,
                                kind: 'pc'
                            };
                            const sel = selectedIds.has(c.id);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>toggleTarget(t),
                                style: {
                                    textAlign: 'left',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    background: sel ? 'rgba(126,200,227,0.08)' : 'transparent',
                                    border: `1px solid ${sel ? FORCE_BLUE : FORCE_BLUE_DIM}`,
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                    color: sel ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                    transition: 'all .15s'
                                },
                                children: [
                                    sel ? '● ' : '○ ',
                                    c.name
                                ]
                            }, c.id, true, {
                                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                                lineNumber: 117,
                                columnNumber: 17
                            }, this);
                        })
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                    lineNumber: 109,
                    columnNumber: 11
                }, this),
                enemies.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TargetSection, {
                    label: "Enemy Tokens",
                    targets: enemies,
                    selectedIds: selectedIds,
                    onToggle: toggleTarget,
                    color: "#E03A1E"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                    lineNumber: 131,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
            lineNumber: 83,
            columnNumber: 7
        }, this);
    }
    // Combat mode
    const pcTargets = pcs.map((c)=>({
            instanceId: c.id,
            name: c.name,
            kind: 'pc'
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: "var(--font-body)",
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em'
                },
                children: "Select Targets"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '7px 10px',
                    background: 'rgba(126,200,227,0.04)',
                    border: `1px solid ${FORCE_BLUE_DIM}`,
                    borderRadius: 6
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                        fontStyle: 'italic',
                        lineHeight: 1.45
                    },
                    children: "ℹ Force powers may target anyone. Select all applicable targets. The GM will determine valid targeting."
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                    lineNumber: 147,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                    textAlign: 'center',
                    padding: '16px 0'
                },
                children: "Loading participants…"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                lineNumber: 153,
                columnNumber: 9
            }, this),
            !loading && pcTargets.length === 0 && enemies.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: 'center',
                    padding: '24px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                        },
                        children: "No participants in the current encounter."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                        },
                        children: "Ask your GM to set up the initiative tracker."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                lineNumber: 159,
                columnNumber: 9
            }, this),
            pcTargets.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TargetSection, {
                label: "Player Characters",
                targets: pcTargets,
                selectedIds: selectedIds,
                onToggle: toggleTarget,
                color: FORCE_BLUE,
                textColor: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                lineNumber: 166,
                columnNumber: 9
            }, this),
            enemies.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TargetSection, {
                label: "Enemies",
                targets: enemies,
                selectedIds: selectedIds,
                onToggle: toggleTarget,
                color: "#E03A1E"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                lineNumber: 169,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
        lineNumber: 141,
        columnNumber: 5
    }, this);
}
_s(ForceTargetStep, "Y5yVYzuwMU2FeSxgeJJd3AeOrUk=");
_c = ForceTargetStep;
function TargetSection({ label, targets, selectedIds, onToggle, color, textColor }) {
    _s1();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const resolvedText = textColor ?? color;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setOpen((v)=>!v),
                style: {
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 0',
                    marginBottom: open ? 6 : 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                            fontSize: 10
                        },
                        children: open ? '▼' : '▶'
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                            color: `${color}90`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        },
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                        lineNumber: 193,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                        },
                        children: [
                            "(",
                            targets.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                lineNumber: 187,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5
                },
                children: targets.map((t)=>{
                    const sel = selectedIds.has(t.instanceId);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onToggle(t),
                        style: {
                            textAlign: 'left',
                            padding: '7px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: sel ? `${color}10` : 'transparent',
                            border: `1px solid ${sel ? `${color}60` : 'var(--hud-border)'}`,
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: sel ? resolvedText : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                            transition: 'all .15s'
                        },
                        children: [
                            sel ? '● ' : '○ ',
                            t.name
                        ]
                    }, t.instanceId, true, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                        lineNumber: 201,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
                lineNumber: 197,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx",
        lineNumber: 186,
        columnNumber: 5
    }, this);
}
_s1(TargetSection, "dVkDIfRb5RN4FjtonjBYYwpg89o=");
_c1 = TargetSection;
var _c, _c1;
__turbopack_context__.k.register(_c, "ForceTargetStep");
__turbopack_context__.k.register(_c1, "TargetSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ForceResolveStep",
    ()=>ForceResolveStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
const FORCE_BLUE = '#7EC8E3';
const LIGHT_COLOR = '#E8E8FF';
const DARK_COLOR = 'rgba(80,40,120,0.9)';
const DARK_BORDER = '#6060A0';
function PipRow({ light, dark }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3
        },
        children: [
            Array.from({
                length: light
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: LIGHT_COLOR,
                        boxShadow: `0 0 4px ${LIGHT_COLOR}`
                    }
                }, `l${i}`, false, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this)),
            Array.from({
                length: dark
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: DARK_COLOR,
                        border: `1px solid ${DARK_BORDER}`
                    }
                }, `d${i}`, false, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_c = PipRow;
function Field({ label, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 3
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: "var(--font-body)",
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em'
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text
                },
                children: children
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_c1 = Field;
function ForceResolveStep({ powerName, powerDesc, forceRoll, darkPipsUsed, targets, targetContext, isCombat, isFallen = false, onUseAgain, onDone }) {
    const desc = powerDesc ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stripBBCode"])(powerDesc) : '';
    const targetLabel = targets.length > 0 ? targets.map((t)=>t.name).join(', ') : isCombat ? 'None selected' : targetContext === 'environment' ? 'Environment' : 'No specific target';
    // For fallen: free FP = dark pips, costly FP = light pips used (darkPipsUsed tracks light used)
    const freePips = isFallen ? forceRoll.totalDark : forceRoll.totalLight;
    const costlyUsed = darkPipsUsed // same value — just renamed for clarity
    ;
    const totalFP = freePips + costlyUsed;
    const destinyFlip = isFallen ? 'dark → light' : 'light → dark';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: 'center',
                    paddingBottom: 12,
                    borderBottom: '1px solid rgba(126,200,227,0.15)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                        fontWeight: 700,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    },
                    children: "✦ Force Power Activated"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: '12px 14px',
                    background: 'rgba(126,200,227,0.04)',
                    border: '1px solid rgba(126,200,227,0.12)',
                    borderRadius: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                        label: "Power",
                        children: powerName
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                        label: "Force Points",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8
                            },
                            children: [
                                isFallen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PipRow, {
                                    light: 0,
                                    dark: freePips
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                                    lineNumber: 86,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PipRow, {
                                    light: freePips,
                                    dark: 0
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                                    lineNumber: 87,
                                    columnNumber: 17
                                }, this),
                                costlyUsed > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: isFallen ? 'rgba(126,200,227,0.8)' : 'rgba(144,96,208,0.8)',
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption
                                    },
                                    children: [
                                        "+ ",
                                        isFallen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PipRow, {
                                            light: costlyUsed,
                                            dark: 0
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                                            lineNumber: 92,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PipRow, {
                                            light: 0,
                                            dark: costlyUsed
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                                            lineNumber: 93,
                                            columnNumber: 21
                                        }, this),
                                        " ",
                                        isFallen ? 'light' : 'dark',
                                        " used"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                                    lineNumber: 90,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontFamily: "var(--font-body)",
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                                    },
                                    children: [
                                        "(",
                                        totalFP,
                                        " total FP)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                        label: "Target(s)",
                        children: targetLabel
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            desc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '10px 12px',
                    background: 'rgba(126,200,227,0.03)',
                    border: '1px solid rgba(126,200,227,0.1)',
                    borderRadius: 6
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                        lineHeight: 1.55
                    },
                    children: desc
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                    lineNumber: 108,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                lineNumber: 107,
                columnNumber: 9
            }, this),
            costlyUsed > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '8px 12px',
                    background: isFallen ? 'rgba(126,200,227,0.06)' : 'rgba(144,96,208,0.08)',
                    border: `1px solid ${isFallen ? 'rgba(126,200,227,0.22)' : 'rgba(144,96,208,0.22)'}`,
                    borderRadius: 6
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                        lineHeight: 1.45
                    },
                    children: [
                        "Reminder: suffer ",
                        costlyUsed,
                        " strain and flip 1 Destiny Point ",
                        destinyFlip,
                        "."
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                    lineNumber: 117,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                lineNumber: 116,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 10,
                    marginTop: 4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onUseAgain,
                        style: {
                            flex: 1,
                            height: 44,
                            borderRadius: 8,
                            cursor: 'pointer',
                            background: 'rgba(126,200,227,0.08)',
                            border: '1px solid rgba(126,200,227,0.3)',
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
                            transition: 'all .15s'
                        },
                        children: "✦ Use Again"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onDone,
                        style: {
                            flex: 1,
                            height: 44,
                            borderRadius: 8,
                            cursor: 'pointer',
                            background: 'rgba(224,58,30,0.12)',
                            border: '1px solid rgba(224,58,30,0.4)',
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--hud-gold)',
                            transition: 'all .15s'
                        },
                        children: "Done"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
_c2 = ForceResolveStep;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "PipRow");
__turbopack_context__.k.register(_c1, "Field");
__turbopack_context__.k.register(_c2, "ForceResolveStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ForceCheckOverlay",
    ()=>ForceCheckOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$steps$2f$SelectPowerStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/force-check/steps/SelectPowerStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$steps$2f$RollForceDiceStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/force-check/steps/RollForceDiceStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$steps$2f$DarkSidePipsStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/force-check/steps/DarkSidePipsStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$steps$2f$ForceTargetStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/force-check/steps/ForceTargetStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$steps$2f$ForceResolveStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/force-check/steps/ForceResolveStep.tsx [app-client] (ecmascript)");
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
const BG = 'var(--hud-surface-hi)';
const FORCE_BLUE = '#7EC8E3';
const FB_DIM = 'rgba(126,200,227,0.45)';
const FB_BD = 'rgba(126,200,227,0.25)';
const FB_BAR = 'rgba(126,200,227,0.6)';
const TEXT_DIM = 'var(--hud-text-dim)';
const STEP_LABELS_NORMAL = {
    1: 'Select Power',
    2: 'Roll Force Dice',
    3: 'Dark Side Pips',
    4: 'Select Target',
    5: 'Resolve'
};
const STEP_LABELS_FALLEN = {
    1: 'Select Power',
    2: 'Roll Force Dice',
    3: 'Light Side Temptation',
    4: 'Select Target',
    5: 'Resolve'
};
function makeInitialState() {
    return {
        currentStep: 1,
        selectedPowerKey: null,
        forceRoll: null,
        darkPipsUsed: 0,
        selectedTargets: [],
        targetContext: null,
        encounterId: null
    };
}
function ForceCheckOverlay({ open, onClose, character, forceRating, committedForce, forcePowers, isDathomiri, isCombat, campaignId, characterId, encounterId: propEncounterId, visibleEnemies }) {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(makeInitialState);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Reset on open ─────────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ForceCheckOverlay.useEffect": ()=>{
            if (open) {
                setState(makeInitialState());
                setBusy(false);
            }
        }
    }["ForceCheckOverlay.useEffect"], [
        open
    ]);
    // ── Derived ───────────────────────────────────────────────────────────────
    const isFallen = character.is_dark_side_fallen === true;
    const STEP_LABELS = isFallen ? STEP_LABELS_FALLEN : STEP_LABELS_NORMAL;
    const enemyTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ForceCheckOverlay.useMemo[enemyTargets]": ()=>(visibleEnemies ?? []).map({
                "ForceCheckOverlay.useMemo[enemyTargets]": (a)=>({
                        instanceId: a.instanceId,
                        name: a.name,
                        kind: 'enemy'
                    })
            }["ForceCheckOverlay.useMemo[enemyTargets]"])
    }["ForceCheckOverlay.useMemo[enemyTargets]"], [
        visibleEnemies
    ]);
    // Skip step 3 for Dathomiri (all pips free), or when the costly-pip count is 0
    const costlyPipsRolled = isFallen ? state.forceRoll?.totalLight ?? 0 : state.forceRoll?.totalDark ?? 0 // normal: dark pips are costly
    ;
    const showDarkStep = !isDathomiri && costlyPipsRolled > 0;
    function getNextStep(s) {
        if (s === 1) return 2;
        if (s === 2) return showDarkStep ? 3 : 4;
        if (s === 3) return 4;
        if (s === 4) return 5;
        return s;
    }
    function getPrevStep(s) {
        if (s === 2) return 1;
        if (s === 3) return 2;
        if (s === 4) return showDarkStep ? 3 : 2;
        if (s === 5) return 4;
        return s;
    }
    const selectedPower = forcePowers.find((p)=>p.powerKey === state.selectedPowerKey) ?? null;
    function canAdvance() {
        switch(state.currentStep){
            case 1:
                return state.selectedPowerKey !== null;
            case 2:
                return state.forceRoll !== null;
            case 3:
                return true // 0 dark pips is a valid choice
                ;
            case 4:
                return true // target is optional
                ;
            default:
                return false;
        }
    }
    // ── Navigation ────────────────────────────────────────────────────────────
    const goBack = ()=>{
        if (state.currentStep <= 1 || busy) return;
        setState((s)=>({
                ...s,
                currentStep: getPrevStep(s.currentStep)
            }));
    };
    const goNext = async ()=>{
        if (!canAdvance() || busy) return;
        setBusy(true);
        const nextStep = getNextStep(state.currentStep);
        let encounterId = state.encounterId;
        try {
            const supabase = campaignId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])() : null;
            // Step 3 → 4: notify GM for costly pip use (dark pips for normal chars; light pips for fallen)
            if (state.currentStep === 3 && state.darkPipsUsed > 0 && supabase && campaignId) {
                await supabase.from('force_notifications').insert({
                    campaign_id: campaignId,
                    character_id: characterId,
                    character_name: character.name,
                    type: 'dark_side_use',
                    dark_pips_used: state.darkPipsUsed,
                    power_name: selectedPower?.powerName ?? '',
                    strain_cost: state.darkPipsUsed,
                    status: 'pending'
                });
            }
            // Advancing to step 5: write combat_log entry
            if (nextStep === 5 && supabase && campaignId && state.forceRoll) {
                // Prefer prop-seeded id → cached state → DB lookup (last resort)
                if (!encounterId) encounterId = propEncounterId ?? null;
                if (!encounterId && isCombat) {
                    const { data } = await supabase.from('combat_encounters').select('id').eq('campaign_id', campaignId).eq('is_active', true).limit(1).single();
                    encounterId = data?.id ?? null;
                }
                const freeFP = isFallen ? state.forceRoll.totalDark : state.forceRoll.totalLight;
                const totalFP = freeFP + state.darkPipsUsed;
                const targetLabel = state.selectedTargets.length > 0 ? state.selectedTargets.map((t)=>t.name).join(', ') : isCombat ? '' : state.targetContext === 'environment' ? 'Environment' : '';
                await supabase.from('combat_log').insert({
                    campaign_id: campaignId,
                    encounter_id: encounterId,
                    participant_name: character.name,
                    alignment: 'player',
                    roll_type: 'force power',
                    weapon_name: selectedPower?.powerName ?? '',
                    dice_pool: {
                        force: Math.max(0, forceRating - committedForce)
                    },
                    result: {
                        totalLight: state.forceRoll.totalLight,
                        totalDark: state.forceRoll.totalDark,
                        darkPipsUsed: state.darkPipsUsed,
                        totalFP
                    },
                    result_summary: `Force Power: ${selectedPower?.powerName ?? ''}. ${totalFP} FP${targetLabel ? ` → ${targetLabel}` : ''}`,
                    is_visible_to_players: true
                });
                // Write to roll_log so the roll feed and Latest Rolls panel see this roll.
                // Encoding: netSuccess=totalLight, netAdvantage=totalDark, triumph=darkPipsUsed.
                // roll_type='force' triggers the ForceCard renderer; ACTIVATED is shown instead of SUCCESS/FAILURE.
                await supabase.from('roll_log').insert({
                    campaign_id: campaignId,
                    character_id: characterId,
                    character_name: character.name,
                    roll_label: selectedPower?.powerName ?? 'Force Power',
                    pool: {
                        force: Math.max(0, forceRating - committedForce),
                        proficiency: 0,
                        ability: 0,
                        boost: 0,
                        challenge: 0,
                        difficulty: 0,
                        setback: 0
                    },
                    result: {
                        netSuccess: state.forceRoll.totalLight,
                        netAdvantage: state.forceRoll.totalDark,
                        triumph: state.darkPipsUsed,
                        despair: 0,
                        succeeded: totalFP > 0
                    },
                    is_dm: false,
                    hidden: false,
                    roll_type: 'force',
                    weapon_name: selectedPower?.powerName ?? '',
                    target_name: targetLabel || null,
                    alignment: 'player',
                    is_visible_to_players: true
                });
            }
        } catch (_e) {
        // Non-blocking — still advance the step
        }
        setState((s)=>({
                ...s,
                currentStep: nextStep,
                encounterId
            }));
        setBusy(false);
    };
    const handleUseAgain = ()=>{
        setState(makeInitialState());
        setBusy(false);
    };
    const handleDone = ()=>onClose();
    const isResolve = state.currentStep === 5;
    const totalSteps = isDathomiri ? 4 : 5;
    const accentColor = isFallen ? '#8B2BE2' : FORCE_BLUE;
    const borderColor = isFallen ? 'rgba(139,43,226,0.3)' : 'rgba(126,200,227,0.25)';
    const barColor = isFallen ? 'rgba(139,43,226,0.6)' : FB_BAR;
    const dimColor = isFallen ? 'rgba(139,43,226,0.5)' : FB_DIM;
    const bdColor = isFallen ? 'rgba(139,43,226,0.15)' : FB_BD;
    // Text colors — use HUD tokens on dark overlay
    const textColor = isFallen ? '#8B2BE2' : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text;
    const textDimColor = isFallen ? 'rgba(139,43,226,0.5)' : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim;
    const textFaintColor = isFallen ? 'rgba(139,43,226,0.3)' : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `hud-quick-drawer${open ? ' open' : ''}`,
        style: {
            background: BG,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRight: `1px solid ${borderColor}`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '10px 14px',
                    borderBottom: `1px solid ${bdColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    flexShrink: 0
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: goBack,
                            style: {
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                color: textDimColor,
                                visibility: !isResolve && state.currentStep > 1 ? 'visible' : 'hidden'
                            },
                            children: "← Back"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                            lineNumber: 280,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: 1,
                                textAlign: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                        fontWeight: 700,
                                        color: textColor,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        textShadow: isFallen ? '0 0 12px rgba(139,43,226,0.4)' : 'none'
                                    },
                                    children: [
                                        isFallen ? '☠' : '✦',
                                        " Force Check"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                                    lineNumber: 293,
                                    columnNumber: 13
                                }, this),
                                !isResolve && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontFamily: 'var(--font-body)',
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                        color: textDimColor,
                                        marginTop: 2
                                    },
                                    children: STEP_LABELS[state.currentStep]
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                                    lineNumber: 301,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                            lineNumber: 292,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: {
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px 6px',
                                fontFamily: 'var(--font-body)',
                                fontSize: 15,
                                color: TEXT_DIM
                            },
                            children: "✕"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                            lineNumber: 308,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                    lineNumber: 278,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                lineNumber: 272,
                columnNumber: 7
            }, this),
            !isResolve && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 4,
                    background: isFallen ? 'rgba(139,43,226,0.1)' : 'rgba(126,200,227,0.1)',
                    flexShrink: 0
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: '100%',
                        width: `${state.currentStep / totalSteps * 100}%`,
                        background: barColor,
                        transition: 'width 200ms ease'
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                    lineNumber: 323,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                lineNumber: 322,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 16px',
                    overscrollBehavior: 'contain'
                },
                children: [
                    state.currentStep === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$steps$2f$SelectPowerStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectPowerStep"], {
                        powers: forcePowers,
                        selectedPowerKey: state.selectedPowerKey,
                        onSelect: (pk)=>setState((s)=>({
                                    ...s,
                                    selectedPowerKey: pk
                                }))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                        lineNumber: 336,
                        columnNumber: 11
                    }, this),
                    state.currentStep === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$steps$2f$RollForceDiceStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RollForceDiceStep"], {
                        forceRating: forceRating,
                        committedForce: committedForce,
                        result: state.forceRoll,
                        isDathomiri: isDathomiri,
                        isFallen: isFallen,
                        onRoll: (result)=>setState((s)=>({
                                    ...s,
                                    forceRoll: result,
                                    darkPipsUsed: 0
                                }))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                        lineNumber: 344,
                        columnNumber: 11
                    }, this),
                    state.currentStep === 3 && state.forceRoll && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$steps$2f$DarkSidePipsStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DarkSidePipsStep"], {
                        lightPips: isFallen ? state.forceRoll.totalDark : state.forceRoll.totalLight,
                        darkPips: isFallen ? state.forceRoll.totalLight : state.forceRoll.totalDark,
                        darkPipsUsed: state.darkPipsUsed,
                        onChangeDark: (n)=>setState((s)=>({
                                    ...s,
                                    darkPipsUsed: n
                                })),
                        isFallen: isFallen
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                        lineNumber: 355,
                        columnNumber: 11
                    }, this),
                    state.currentStep === 4 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$steps$2f$ForceTargetStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ForceTargetStep"], {
                        isCombat: isCombat,
                        campaignId: campaignId,
                        characterId: characterId,
                        selectedTargets: state.selectedTargets,
                        targetContext: state.targetContext,
                        onSelectTargets: (targets)=>setState((s)=>({
                                    ...s,
                                    selectedTargets: targets
                                })),
                        onTargetContext: (ctx)=>setState((s)=>({
                                    ...s,
                                    targetContext: ctx
                                })),
                        encounterEnemies: enemyTargets.length > 0 ? enemyTargets : undefined
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                        lineNumber: 365,
                        columnNumber: 11
                    }, this),
                    state.currentStep === 5 && state.forceRoll && selectedPower && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$force$2d$check$2f$steps$2f$ForceResolveStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ForceResolveStep"], {
                        powerName: selectedPower.powerName,
                        powerDesc: selectedPower.description,
                        forceRoll: state.forceRoll,
                        darkPipsUsed: state.darkPipsUsed,
                        targets: state.selectedTargets,
                        targetContext: state.targetContext,
                        isCombat: isCombat,
                        isFallen: isFallen,
                        onUseAgain: handleUseAgain,
                        onDone: handleDone
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                        lineNumber: 378,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                lineNumber: 333,
                columnNumber: 7
            }, this),
            !isResolve && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '12px 16px',
                    borderTop: `1px solid ${bdColor}`,
                    flexShrink: 0
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: goNext,
                    disabled: !canAdvance() || busy,
                    style: {
                        width: '100%',
                        height: 48,
                        borderRadius: 10,
                        border: 'none',
                        cursor: canAdvance() && !busy ? 'pointer' : 'not-allowed',
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                        fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        background: canAdvance() && !busy ? isFallen ? 'linear-gradient(135deg, rgba(139,43,226,0.35), rgba(139,43,226,0.2))' : 'linear-gradient(135deg, rgba(126,200,227,0.35), rgba(126,200,227,0.2))' : isFallen ? 'rgba(139,43,226,0.06)' : 'rgba(126,200,227,0.06)',
                        color: canAdvance() && !busy ? textColor : textFaintColor,
                        transition: 'background 150ms'
                    },
                    children: busy ? '…' : state.currentStep === 4 ? 'Resolve' : 'Continue'
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                    lineNumber: 396,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
                lineNumber: 395,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/force-check/ForceCheckOverlay.tsx",
        lineNumber: 261,
        columnNumber: 5
    }, this);
}
_s(ForceCheckOverlay, "u8AImOErJ8pfoqqWUcttpX+TSJQ=");
_c = ForceCheckOverlay;
var _c;
__turbopack_context__.k.register(_c, "ForceCheckOverlay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=star-wars-rpg_src_components_force-check_19de9669._.js.map