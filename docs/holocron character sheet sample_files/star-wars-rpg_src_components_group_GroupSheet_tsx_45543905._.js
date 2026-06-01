(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/src/components/group/GroupSheet.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GroupSheet",
    ()=>GroupSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/design-tokens.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript) <export HUD as C>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript) <export FONT as FONT_CINZEL>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript) <export FONT as FONT_RAJDHANI>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversaries$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/adversaries.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$vehicles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/vehicles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$resolve$2d$weapon$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/resolve-weapon.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
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
;
;
;
const FONT_MONO = 'var(--font-body)';
// ── Table 9-3 Contribution Rank data (Core Rulebook) ────────────────────────
const _R01 = {
    alliance: 'New recruit or untested collaborator, still under suspicion. Access to basic equipment and vehicles. Recruit to corporal rank.',
    empire: 'Faceless Rebel scum. Little intelligence value if captured. Re-education possible, otherwise imprisonment. Not worth the effort to hunt down individuals.'
};
const _R23 = {
    alliance: 'Veteran soldier or important collaborator. Very respected by the Alliance. Access to corvette/gunship-level starships and minor strategic intelligence. Lieutenant to captain rank.',
    empire: 'Moderate notoriety. Possible strategic intelligence value. Re-education not possible. Imprisonment and lifelong interrogation standard practice. Use of bounty hunters to capture is an option.'
};
const _R46 = {
    alliance: 'Top brass or vital collaborator. Highly respected by the Alliance. Minor but notable political power. Access to corvette/gunship-level starships and sensitive info. Major to colonel rank.',
    empire: 'Major notoriety. Extremely high intelligence value if captured. Use of bounty hunters and Imperial assassins authorized for capture/elimination. No chance of re-education. Failure to report whereabouts considered a severe crime.'
};
const _R7P = {
    alliance: 'Member of the Alliance High Command. Immense political power. Extremely revered and respected by allies. Access to capital-grade starships. Commander, general, or admiral ranking.',
    empire: "The Empire's Most Wanted. Entire fleets used to locate and eliminate. Capture or death key to destruction of the Rebellion. Immense intelligence value. Failure to report whereabouts is considered treason."
};
const CONTRIBUTION_RANK_TABLE = {
    0: _R01,
    1: _R01,
    2: _R23,
    3: _R23,
    4: _R46,
    5: _R46,
    6: _R46,
    7: _R7P,
    8: _R7P,
    9: _R7P,
    10: _R7P
};
/** Ranks 7+ are the maximum tier — no further progression text exists. */ const MAX_CONTRIBUTION_RANK_TIER = 7;
// ── Asset badge colours ─────────────────────────────────────────────────────
const ASSET_COLORS = {
    npc: '#4A90D9',
    vehicle: '#4EC87A',
    starship: '#40C4D4',
    safe_house: '#D4A84B',
    strategic_asset: '#9B59B6',
    other: 'var(--hud-text-dim)'
};
const ASSET_LABELS = {
    npc: 'NPC',
    vehicle: 'Vehicle',
    starship: 'Starship',
    safe_house: 'Safe House',
    strategic_asset: 'Strategic Asset',
    other: 'Other'
};
const REWARD_TYPES = [
    'equipment',
    'vehicle',
    'strategic_asset'
];
// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch  {
        return iso;
    }
}
function calcDutyRanges(rows) {
    const sorted = [
        ...rows
    ].sort((a, b)=>b.duty_value - a.duty_value);
    let cursor = 0;
    return sorted.map((r)=>{
        const start = cursor + 1;
        const end = cursor + r.duty_value;
        cursor = end;
        return {
            ...r,
            rangeStart: start,
            rangeEnd: end
        };
    });
}
// ── PIN Modal ─────────────────────────────────────────────────────────────────
function PinModal({ onConfirm, onCancel }) {
    _s();
    const [val, setVal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PinModal.useEffect": ()=>{
            inputRef.current?.focus();
        }
    }["PinModal.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
        open: true,
        zIndex: 200,
        maxWidth: 380,
        borderColor: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].borderHi,
        backdrop: "rgba(0,0,0,0.7)",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: '24px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_H4"],
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                        letterSpacing: '0.08em'
                    },
                    children: "GM VERIFICATION"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                    lineNumber: 147,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ref: inputRef,
                    type: "password",
                    placeholder: "Enter GM PIN",
                    value: val,
                    onChange: (e)=>setVal(e.target.value),
                    onKeyDown: (e)=>{
                        if (e.key === 'Enter') onConfirm(val);
                    },
                    style: {
                        background: 'var(--hud-surface-lo)',
                        border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                        borderRadius: 4,
                        padding: '8px 12px',
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].text,
                        outline: 'none',
                        letterSpacing: '0.2em'
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                    lineNumber: 150,
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
                            style: btnStyle(false),
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                            lineNumber: 165,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>onConfirm(val),
                            style: btnStyle(true),
                            children: "Unlock"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                            lineNumber: 166,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                    lineNumber: 164,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
            lineNumber: 146,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
        lineNumber: 145,
        columnNumber: 5
    }, this);
}
_s(PinModal, "/emH2k6r80B0N1MLh/XcwWfIj4k=");
_c = PinModal;
function btnStyle(primary) {
    return {
        padding: '6px 16px',
        background: primary ? 'rgba(224,58,30,0.15)' : 'transparent',
        border: `1px solid ${primary ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
        borderRadius: 4,
        color: primary ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_LABEL"],
        letterSpacing: '0.08em',
        cursor: 'pointer'
    };
}
function GroupSheet({ campaignId, characterName }) {
    _s1();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GroupSheet.useMemo[supabase]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])()
    }["GroupSheet.useMemo[supabase]"], []);
    // ── Data state ─────────────────────────────────────────────────────────────
    const [campaign, setCampaign] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [duties, setDuties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [assets, setAssets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [dutyTypes, setDutyTypes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // ── GM unlock state ────────────────────────────────────────────────────────
    const [gmUnlocked, setGmUnlocked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPinModal, setShowPinModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingAction, setPendingAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pinError, setPinError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // ── Edit states ────────────────────────────────────────────────────────────
    const [editingCampaignName, setEditingCampaignName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [campaignNameDraft, setCampaignNameDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editingGroupName, setEditingGroupName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [groupNameDraft, setGroupNameDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editingBoo, setEditingBoo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [booNameDraft, setBooNameDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [booDescDraft, setBooDescDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editingRewardDesc, setEditingRewardDesc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null) // rank number
    ;
    const [rewardDescDraft, setRewardDescDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editingDutyChar, setEditingDutyChar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dutyEditDraft, setDutyEditDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [hoveredDutyChar, setHoveredDutyChar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // (rank tooltip hover removed — cards are always expanded)
    // ── Add Asset modal ────────────────────────────────────────────────────────
    const [showAddAsset, setShowAddAsset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [assetTypeDraft, setAssetTypeDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('other');
    const [assetNameDraft, setAssetNameDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [assetDescDraft, setAssetDescDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [assetSearch, setAssetSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [adversaryLib, setAdversaryLib] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [vehicleLib, setVehicleLib] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [libLoading, setLibLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [viewingAsset, setViewingAsset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // ── Last Alliance Reward edit modal ───────────────────────────────────────
    const [showRewardModal, setShowRewardModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [rewardTypeDraft, setRewardTypeDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('equipment');
    const [rewardDescModalDraft, setRewardDescModalDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // ── Shared library loader ─────────────────────────────────────────────────
    const loadAdversaries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GroupSheet.useCallback[loadAdversaries]": ()=>{
            if (adversaryLib.length > 0) return;
            setLibLoading(true);
            Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$adversaries$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAdversaries"])(),
                supabase.from('ref_adversaries').select('*').order('name')
            ]).then({
                "GroupSheet.useCallback[loadAdversaries]": ([oggdude, customResult])=>{
                    const custom = (customResult.data ?? []).map({
                        "GroupSheet.useCallback[loadAdversaries].custom": (row)=>{
                            const r = row;
                            const skillRanks = r.skill_ranks ?? {};
                            return {
                                id: String(r.id),
                                name: String(r.name),
                                type: r.type,
                                brawn: Number(r.brawn ?? 2),
                                agility: Number(r.agility ?? 2),
                                intellect: Number(r.intellect ?? 2),
                                cunning: Number(r.cunning ?? 2),
                                willpower: Number(r.willpower ?? 2),
                                presence: Number(r.presence ?? 2),
                                soak: Number(r.soak ?? 2),
                                wound: Number(r.wound_threshold ?? 10),
                                strain: r.strain_threshold != null ? Number(r.strain_threshold) : undefined,
                                defense: [
                                    Number(r.defense_melee ?? 0),
                                    Number(r.defense_ranged ?? 0)
                                ],
                                skills: Object.keys(skillRanks),
                                skillRanks,
                                talents: r.talents ?? [],
                                abilities: r.abilities ?? [],
                                weapons: r.weapons ?? [],
                                gear: r.gear ?? [],
                                description: r.description ? String(r.description) : undefined,
                                _isCustom: true
                            };
                        }
                    }["GroupSheet.useCallback[loadAdversaries].custom"]);
                    setAdversaryLib([
                        ...oggdude,
                        ...custom
                    ]);
                    setLibLoading(false);
                }
            }["GroupSheet.useCallback[loadAdversaries]"]);
        }
    }["GroupSheet.useCallback[loadAdversaries]"], [
        adversaryLib.length,
        supabase
    ]) // eslint-disable-line react-hooks/exhaustive-deps
    ;
    const loadVehicles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GroupSheet.useCallback[loadVehicles]": ()=>{
            if (vehicleLib.length > 0) return;
            setLibLoading(true);
            Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$vehicles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchVehicles"])(),
                supabase.from('ref_vehicles').select('*').order('name')
            ]).then({
                "GroupSheet.useCallback[loadVehicles]": ([oggdude, customResult])=>{
                    const custom = (customResult.data ?? []).map({
                        "GroupSheet.useCallback[loadVehicles].custom": (r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$vehicles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dbRowToVehicle"])(r)
                    }["GroupSheet.useCallback[loadVehicles].custom"]);
                    setVehicleLib([
                        ...oggdude,
                        ...custom
                    ]);
                    setLibLoading(false);
                }
            }["GroupSheet.useCallback[loadVehicles]"]);
        }
    }["GroupSheet.useCallback[loadVehicles]"], [
        vehicleLib.length,
        supabase
    ]) // eslint-disable-line react-hooks/exhaustive-deps
    ;
    // ── Trigger library load when Add Asset modal or View modal needs it ──────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GroupSheet.useEffect": ()=>{
            const t = showAddAsset ? assetTypeDraft : viewingAsset?.asset_type;
            if (!t) return;
            if (t === 'npc') loadAdversaries();
            else if (t === 'vehicle' || t === 'starship') loadVehicles();
        }
    }["GroupSheet.useEffect"], [
        showAddAsset,
        assetTypeDraft,
        viewingAsset,
        loadAdversaries,
        loadVehicles
    ]);
    // ── Load data ──────────────────────────────────────────────────────────────
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GroupSheet.useCallback[load]": async ()=>{
            setLoading(true);
            const [campRes, dutyRes, assetRes, dutyTypesRes] = await Promise.all([
                supabase.from('campaigns').select('id,name,gm_pin,group_name,group_name_editable,base_of_operations_name,base_of_operations_description,contribution_rank,contribution_rank_descriptions,last_alliance_reward').eq('id', campaignId).single(),
                supabase.from('characters').select('id,name,duty_type,duty_custom_name,duty_lore,duty_value,is_archived').eq('campaign_id', campaignId).eq('is_archived', false),
                supabase.from('group_assets').select('*').eq('campaign_id', campaignId).eq('is_archived', false).order('created_at', {
                    ascending: false
                }),
                supabase.from('ref_duty_types').select('key,name').order('name')
            ]);
            if (campRes.data) setCampaign(campRes.data);
            if (dutyRes.data) setDuties(dutyRes.data);
            if (assetRes.data) setAssets(assetRes.data);
            if (dutyTypesRes.data) setDutyTypes(dutyTypesRes.data);
            setLoading(false);
        }
    }["GroupSheet.useCallback[load]"], [
        supabase,
        campaignId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GroupSheet.useEffect": ()=>{
            load();
        }
    }["GroupSheet.useEffect"], [
        load
    ]);
    // ── Realtime: campaigns ────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GroupSheet.useEffect": ()=>{
            const ch = supabase.channel(`group-campaign:${campaignId}`).on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'campaigns',
                filter: `id=eq.${campaignId}`
            }, {
                "GroupSheet.useEffect.ch": (payload)=>{
                    setCampaign({
                        "GroupSheet.useEffect.ch": (prev)=>prev ? {
                                ...prev,
                                ...payload.new
                            } : prev
                    }["GroupSheet.useEffect.ch"]);
                }
            }["GroupSheet.useEffect.ch"]).subscribe();
            return ({
                "GroupSheet.useEffect": ()=>{
                    supabase.removeChannel(ch);
                }
            })["GroupSheet.useEffect"];
        }
    }["GroupSheet.useEffect"], [
        supabase,
        campaignId
    ]);
    // ── Realtime: group_assets ─────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GroupSheet.useEffect": ()=>{
            const ch = supabase.channel(`group-assets:${campaignId}`).on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'group_assets',
                filter: `campaign_id=eq.${campaignId}`
            }, {
                "GroupSheet.useEffect.ch": (payload)=>{
                    const a = payload.new;
                    if (!a.is_archived) setAssets({
                        "GroupSheet.useEffect.ch": (prev)=>[
                                a,
                                ...prev
                            ]
                    }["GroupSheet.useEffect.ch"]);
                }
            }["GroupSheet.useEffect.ch"]).on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'group_assets',
                filter: `campaign_id=eq.${campaignId}`
            }, {
                "GroupSheet.useEffect.ch": (payload)=>{
                    const a = payload.new;
                    setAssets({
                        "GroupSheet.useEffect.ch": (prev)=>a.is_archived ? prev.filter({
                                "GroupSheet.useEffect.ch": (x)=>x.id !== a.id
                            }["GroupSheet.useEffect.ch"]) : prev.map({
                                "GroupSheet.useEffect.ch": (x)=>x.id === a.id ? a : x
                            }["GroupSheet.useEffect.ch"])
                    }["GroupSheet.useEffect.ch"]);
                }
            }["GroupSheet.useEffect.ch"]).subscribe();
            return ({
                "GroupSheet.useEffect": ()=>{
                    supabase.removeChannel(ch);
                }
            })["GroupSheet.useEffect"];
        }
    }["GroupSheet.useEffect"], [
        supabase,
        campaignId
    ]);
    // ── PIN verification ───────────────────────────────────────────────────────
    function requireGm(action) {
        if (gmUnlocked) {
            action();
            return;
        }
        setPendingAction(()=>action);
        setShowPinModal(true);
    }
    async function handlePinConfirm(pin) {
        if (!campaign) return;
        if (campaign.gm_pin === pin) {
            setGmUnlocked(true);
            setShowPinModal(false);
            setPinError(false);
            pendingAction?.();
            setPendingAction(null);
        } else {
            setPinError(true);
            setTimeout(()=>setPinError(false), 2000);
        }
    }
    // ── Campaign save helpers ──────────────────────────────────────────────────
    async function saveCampaignField(fields) {
        await supabase.from('campaigns').update(fields).eq('id', campaignId);
        setCampaign((prev)=>prev ? {
                ...prev,
                ...fields
            } : prev);
    }
    // ── Duty table helpers ─────────────────────────────────────────────────────
    async function saveDutyValue(charId, val) {
        const n = parseInt(val, 10);
        if (isNaN(n) || n < 0) return;
        await supabase.from('characters').update({
            duty_value: n
        }).eq('id', charId);
        setDuties((prev)=>prev.map((d)=>d.id === charId ? {
                    ...d,
                    duty_value: n
                } : d));
        setEditingDutyChar(null);
    }
    // ── Reset Group Duty (milestone) ──────────────────────────────────────────
    async function handleResetGroupDuty() {
        if (!campaign || dutyTotal < 100) return;
        const currentRank = campaign.contribution_rank ?? 0;
        const currentRankDesc = campaign.contribution_rank_descriptions?.[String(currentRank)] ?? null;
        const newRank = currentRank + 1;
        // Build updated rank descriptions with the current rank's entry cleared
        const updatedDescs = {
            ...campaign.contribution_rank_descriptions ?? {}
        };
        delete updatedDescs[String(currentRank)];
        // Promote current rank reward to Last Alliance Reward
        const newReward = currentRankDesc ? {
            type: 'strategic_asset',
            description: currentRankDesc,
            awarded_at: new Date().toISOString()
        } : campaign.last_alliance_reward;
        // Reset every active character's duty_value to 0
        const charIds = duties.map((d)=>d.id);
        if (charIds.length > 0) {
            await supabase.from('characters').update({
                duty_value: 0
            }).in('id', charIds);
        }
        // Update campaign: increment rank, clear rank reward, set last alliance reward
        await saveCampaignField({
            contribution_rank: newRank,
            contribution_rank_descriptions: updatedDescs,
            last_alliance_reward: newReward
        });
        // Reflect duty reset in local state
        setDuties((prev)=>prev.map((d)=>({
                    ...d,
                    duty_value: 0
                })));
    }
    // ── Asset helpers ──────────────────────────────────────────────────────────
    async function addAsset() {
        if (!assetNameDraft.trim()) return;
        const { data } = await supabase.from('group_assets').insert({
            campaign_id: campaignId,
            asset_type: assetTypeDraft,
            name: assetNameDraft.trim(),
            description: assetDescDraft.trim() || null
        }).select().single();
        setShowAddAsset(false);
        setAssetNameDraft('');
        setAssetDescDraft('');
        setAssetTypeDraft('other');
        setAssetSearch('');
    }
    async function archiveAsset(id) {
        await supabase.from('group_assets').update({
            is_archived: true
        }).eq('id', id);
        setAssets((prev)=>prev.filter((a)=>a.id !== id));
    }
    // ── Derived ────────────────────────────────────────────────────────────────
    const dutyRows = calcDutyRanges(duties);
    const dutyTotal = duties.reduce((s, d)=>s + (d.duty_value ?? 0), 0);
    const topContributor = duties.length > 0 ? duties.reduce((best, d)=>d.duty_value > best.duty_value ? d : best, duties[0]).id : null;
    const dutyPct = Math.min(100, dutyTotal);
    const milestone = dutyTotal >= 100;
    const rank = campaign?.contribution_rank ?? 0;
    const rankData = CONTRIBUTION_RANK_TABLE[rank] ?? CONTRIBUTION_RANK_TABLE[7];
    // Find the next tier boundary — skip ranks that share the same tier object
    const nextRankEntry = (()=>{
        if (rank >= MAX_CONTRIBUTION_RANK_TIER) return null;
        for(let r = rank + 1; r <= MAX_CONTRIBUTION_RANK_TIER; r++){
            const candidate = CONTRIBUTION_RANK_TABLE[r];
            if (candidate && candidate !== rankData) return candidate;
        }
        return null;
    })();
    const rankDesc = campaign?.contribution_rank_descriptions?.[String(rank)] ?? null;
    const filteredAdversaries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GroupSheet.useMemo[filteredAdversaries]": ()=>{
            const q = assetSearch.toLowerCase();
            return adversaryLib.filter({
                "GroupSheet.useMemo[filteredAdversaries]": (a)=>a.name.toLowerCase().includes(q)
            }["GroupSheet.useMemo[filteredAdversaries]"]);
        }
    }["GroupSheet.useMemo[filteredAdversaries]"], [
        adversaryLib,
        assetSearch
    ]);
    const filteredVehicles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GroupSheet.useMemo[filteredVehicles]": ()=>{
            const q = assetSearch.toLowerCase();
            return vehicleLib.filter({
                "GroupSheet.useMemo[filteredVehicles]": (v)=>assetTypeDraft === 'starship' ? v.isStarship : !v.isStarship
            }["GroupSheet.useMemo[filteredVehicles]"]).filter({
                "GroupSheet.useMemo[filteredVehicles]": (v)=>v.name.toLowerCase().includes(q)
            }["GroupSheet.useMemo[filteredVehicles]"]);
        }
    }["GroupSheet.useMemo[filteredVehicles]"], [
        vehicleLib,
        assetSearch,
        assetTypeDraft
    ]);
    const viewAdversary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GroupSheet.useMemo[viewAdversary]": ()=>{
            if (!viewingAsset || viewingAsset.asset_type !== 'npc') return null;
            const n = viewingAsset.name.toLowerCase();
            return adversaryLib.find({
                "GroupSheet.useMemo[viewAdversary]": (a)=>a.name.toLowerCase() === n
            }["GroupSheet.useMemo[viewAdversary]"]) ?? null;
        }
    }["GroupSheet.useMemo[viewAdversary]"], [
        viewingAsset,
        adversaryLib
    ]);
    const viewVehicle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "GroupSheet.useMemo[viewVehicle]": ()=>{
            if (!viewingAsset || viewingAsset.asset_type !== 'vehicle' && viewingAsset.asset_type !== 'starship') return null;
            const n = viewingAsset.name.toLowerCase();
            return vehicleLib.find({
                "GroupSheet.useMemo[viewVehicle]": (v)=>v.name.toLowerCase() === n
            }["GroupSheet.useMemo[viewVehicle]"]) ?? null;
        }
    }["GroupSheet.useMemo[viewVehicle]"], [
        viewingAsset,
        vehicleLib
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 60
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                    letterSpacing: '0.1em'
                },
                children: "LOADING GROUP DATA…"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 505,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
            lineNumber: 504,
            columnNumber: 7
        }, this);
    }
    if (!campaign) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 60
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim
                },
                children: "No campaign found."
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 515,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
            lineNumber: 514,
            columnNumber: 7
        }, this);
    }
    const groupName = campaign.group_name ?? campaign.name ?? 'Legacy of Rebellion';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-3)'
        },
        children: [
            showPinModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PinModal, {
                onConfirm: handlePinConfirm,
                onCancel: ()=>{
                    setShowPinModal(false);
                    setPendingAction(null);
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 527,
                columnNumber: 9
            }, this),
            pinError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 300,
                    background: 'rgba(200,50,50,0.9)',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                    color: '#fff'
                },
                children: "Invalid PIN"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 533,
                columnNumber: 9
            }, this),
            showAddAsset && (()=>{
                const useLibrary = assetTypeDraft === 'npc' || assetTypeDraft === 'vehicle' || assetTypeDraft === 'starship';
                const libraryItems = assetTypeDraft === 'npc' ? filteredAdversaries : filteredVehicles;
                const closeModal = ()=>{
                    setShowAddAsset(false);
                    setAssetSearch('');
                    setAssetNameDraft('');
                    setAssetDescDraft('');
                    setAssetTypeDraft('other');
                };
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'fixed',
                        inset: 0,
                        zIndex: 200,
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'var(--hud-surface-hi)',
                            border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].borderHi}`,
                            borderRadius: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '90vw',
                            maxWidth: useLibrary ? 520 : 480,
                            maxHeight: '88vh',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.8)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '18px 24px 14px',
                                    borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                                    flexShrink: 0
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_H4"],
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                        letterSpacing: '0.08em'
                                    },
                                    children: "ADD GROUP ASSET"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 564,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 563,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    overflowY: 'auto',
                                    padding: '16px 24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 14
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: labelStyle(),
                                                children: "Asset Type"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 573,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: assetTypeDraft,
                                                onChange: (e)=>{
                                                    setAssetTypeDraft(e.target.value);
                                                    setAssetNameDraft('');
                                                    setAssetSearch('');
                                                },
                                                style: inlineInputStyle(),
                                                children: Object.keys(ASSET_LABELS).map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: t,
                                                        children: ASSET_LABELS[t]
                                                    }, t, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 580,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 574,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 572,
                                        columnNumber: 17
                                    }, this),
                                    useLibrary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: labelStyle(),
                                                children: assetTypeDraft === 'npc' ? 'Select from Adversary Library' : 'Select from Vehicle Library'
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 588,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                autoFocus: true,
                                                value: assetSearch,
                                                onChange: (e)=>setAssetSearch(e.target.value),
                                                placeholder: assetTypeDraft === 'npc' ? 'Search adversaries…' : 'Search vehicles…',
                                                style: inlineInputStyle()
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 591,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    maxHeight: 220,
                                                    overflowY: 'auto',
                                                    border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                                                    borderRadius: 6,
                                                    background: 'var(--hud-surface-lo)'
                                                },
                                                children: [
                                                    libLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            padding: '16px',
                                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                                            textAlign: 'center'
                                                        },
                                                        children: "Loading…"
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 604,
                                                        columnNumber: 25
                                                    }, this),
                                                    !libLoading && libraryItems.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            padding: '16px',
                                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                                            textAlign: 'center'
                                                        },
                                                        children: "No results found"
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 609,
                                                        columnNumber: 25
                                                    }, this),
                                                    !libLoading && libraryItems.map((item, i)=>{
                                                        const itemName = item.name;
                                                        const isCustom = !!item._isCustom;
                                                        const subtitle = assetTypeDraft === 'npc' ? item.type : `${item.type} · Sil ${item.silhouette}`;
                                                        const isSelected = assetNameDraft === itemName;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setAssetNameDraft(itemName),
                                                            style: {
                                                                width: '100%',
                                                                textAlign: 'left',
                                                                background: isSelected ? `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 9%, transparent)` : 'transparent',
                                                                border: 'none',
                                                                borderBottom: i < libraryItems.length - 1 ? `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}` : 'none',
                                                                padding: '8px 12px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                gap: 8
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                                        color: isSelected ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].text,
                                                                        fontWeight: isSelected ? 600 : 400
                                                                    },
                                                                    children: [
                                                                        isCustom && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                                                                marginRight: 5,
                                                                                fontSize: '0.85em'
                                                                            },
                                                                            children: "★"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                            lineNumber: 634,
                                                                            columnNumber: 44
                                                                        }, this),
                                                                        itemName
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 633,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: FONT_MONO,
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                                                        textTransform: 'uppercase',
                                                                        flexShrink: 0
                                                                    },
                                                                    children: subtitle
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 637,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, 'id' in item ? item.id : item.key, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 621,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 598,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: labelStyle(),
                                                        children: "Name"
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 646,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: assetNameDraft,
                                                        onChange: (e)=>setAssetNameDraft(e.target.value),
                                                        placeholder: "Select above or type a custom name",
                                                        style: inlineInputStyle()
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 647,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 645,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 587,
                                        columnNumber: 19
                                    }, this),
                                    !useLibrary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: labelStyle(),
                                                children: "Name"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 660,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                autoFocus: true,
                                                value: assetNameDraft,
                                                onChange: (e)=>setAssetNameDraft(e.target.value),
                                                placeholder: "Asset name",
                                                style: inlineInputStyle()
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 661,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 659,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: labelStyle(),
                                                children: "Description (optional)"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 673,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                value: assetDescDraft,
                                                onChange: (e)=>setAssetDescDraft(e.target.value),
                                                placeholder: "Notes or description…",
                                                rows: 3,
                                                style: {
                                                    ...inlineInputStyle(),
                                                    resize: 'vertical'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 674,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 672,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 570,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '12px 24px 16px',
                                    borderTop: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                                    display: 'flex',
                                    gap: 8,
                                    justifyContent: 'flex-end',
                                    flexShrink: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: btnStyle(false),
                                        onClick: closeModal,
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 686,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: btnStyle(true),
                                        onClick: addAsset,
                                        disabled: !assetNameDraft.trim(),
                                        children: "Add Asset"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 687,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 685,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 553,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                    lineNumber: 548,
                    columnNumber: 11
                }, this);
            })(),
            viewingAsset && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AssetViewModal, {
                asset: viewingAsset,
                adversary: viewAdversary,
                vehicle: viewVehicle,
                loading: libLoading && (viewingAsset.asset_type === 'npc' || viewingAsset.asset_type === 'vehicle' || viewingAsset.asset_type === 'starship'),
                onClose: ()=>setViewingAsset(null)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 696,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["panelBase"],
                    borderRadius: 8,
                    padding: 'var(--space-3)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            marginBottom: 4
                        },
                        children: [
                            editingCampaignName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                autoFocus: true,
                                value: campaignNameDraft,
                                onChange: (e)=>setCampaignNameDraft(e.target.value),
                                onBlur: ()=>{
                                    saveCampaignField({
                                        name: campaignNameDraft
                                    });
                                    setEditingCampaignName(false);
                                },
                                onKeyDown: (e)=>{
                                    if (e.key === 'Enter') {
                                        saveCampaignField({
                                            name: campaignNameDraft
                                        });
                                        setEditingCampaignName(false);
                                    }
                                    if (e.key === 'Escape') setEditingCampaignName(false);
                                },
                                style: {
                                    fontFamily: FONT_MONO,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                    color: `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 40%, transparent)`,
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                                    outline: 'none',
                                    textAlign: 'center',
                                    letterSpacing: '0.14em',
                                    width: '16em'
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 711,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FONT_MONO,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                    color: `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 33%, transparent)`,
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase'
                                },
                                children: campaign.name
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 727,
                                columnNumber: 13
                            }, this),
                            gmUnlocked && !editingCampaignName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setCampaignNameDraft(campaign.name);
                                    setEditingCampaignName(true);
                                },
                                title: "Edit campaign name",
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 27%, transparent)`,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                                    padding: '0 2px',
                                    lineHeight: 1
                                },
                                children: "✎"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 732,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 709,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center',
                            marginBottom: 4
                        },
                        children: [
                            editingGroupName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                autoFocus: true,
                                value: groupNameDraft,
                                onChange: (e)=>setGroupNameDraft(e.target.value),
                                onBlur: ()=>{
                                    saveCampaignField({
                                        group_name: groupNameDraft
                                    });
                                    setEditingGroupName(false);
                                },
                                onKeyDown: (e)=>{
                                    if (e.key === 'Enter') {
                                        saveCampaignField({
                                            group_name: groupNameDraft
                                        });
                                        setEditingGroupName(false);
                                    }
                                    if (e.key === 'Escape') setEditingGroupName(false);
                                },
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_H3"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold}`,
                                    outline: 'none',
                                    textAlign: 'center',
                                    letterSpacing: '0.06em',
                                    width: '18em'
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 743,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_H3"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                    letterSpacing: '0.06em'
                                },
                                children: groupName
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 759,
                                columnNumber: 13
                            }, this),
                            (gmUnlocked || campaign.group_name_editable) && !editingGroupName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setGroupNameDraft(groupName);
                                    setEditingGroupName(true);
                                },
                                title: "Edit group name",
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                    marginLeft: 6,
                                    verticalAlign: 'middle'
                                },
                                children: "✎"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 764,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 741,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            marginBottom: 'var(--space-3)'
                        },
                        children: !gmUnlocked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>requireGm(()=>{}),
                            style: {
                                padding: '2px 10px',
                                background: 'transparent',
                                border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                                borderRadius: 3,
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                fontFamily: FONT_MONO,
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                                letterSpacing: '0.1em',
                                cursor: 'pointer'
                            },
                            children: "GM EDIT"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                            lineNumber: 775,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontFamily: FONT_MONO,
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                                        color: `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 60%, transparent)`,
                                        letterSpacing: '0.1em'
                                    },
                                    children: "★ GM UNLOCKED"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 788,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>saveCampaignField({
                                            group_name_editable: !campaign.group_name_editable
                                        }),
                                    title: campaign.group_name_editable ? 'Disable player name editing' : 'Allow players to edit name',
                                    style: {
                                        padding: '2px 8px',
                                        background: 'transparent',
                                        border: `1px solid ${campaign.group_name_editable ? `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 33%, transparent)` : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                                        borderRadius: 3,
                                        cursor: 'pointer',
                                        color: campaign.group_name_editable ? `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 60%, transparent)` : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                        fontFamily: FONT_MONO,
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                                        letterSpacing: '0.08em'
                                    },
                                    children: campaign.group_name_editable ? 'PLAYER EDIT ON' : 'PLAYER EDIT OFF'
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 791,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 773,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center',
                            marginBottom: 6
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: FONT_MONO,
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                color: `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 33%, transparent)`,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase'
                            },
                            children: "Base of Operations"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                            lineNumber: 812,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 811,
                        columnNumber: 9
                    }, this),
                    editingBoo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                autoFocus: true,
                                value: booNameDraft,
                                onChange: (e)=>setBooNameDraft(e.target.value),
                                placeholder: "Base of Operations name",
                                style: inlineInputStyle()
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 818,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: booDescDraft,
                                onChange: (e)=>setBooDescDraft(e.target.value),
                                placeholder: "Description (optional)",
                                rows: 3,
                                style: {
                                    ...inlineInputStyle(),
                                    resize: 'vertical'
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 825,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 8,
                                    justifyContent: 'flex-end'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: btnStyle(false),
                                        onClick: ()=>setEditingBoo(false),
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 833,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        style: btnStyle(true),
                                        onClick: ()=>{
                                            saveCampaignField({
                                                base_of_operations_name: booNameDraft || null,
                                                base_of_operations_description: booDescDraft || null
                                            });
                                            setEditingBoo(false);
                                        },
                                        children: "Save"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 834,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 832,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 817,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 14px',
                            background: 'var(--hud-surface-lo)',
                            border: `1px solid var(--hud-border)`,
                            borderRadius: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    minWidth: 0
                                },
                                children: campaign.base_of_operations_name ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                                fontWeight: 600,
                                                letterSpacing: '0.04em'
                                            },
                                            children: campaign.base_of_operations_name
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 851,
                                            columnNumber: 19
                                        }, this),
                                        campaign.base_of_operations_description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                                marginLeft: 8
                                            },
                                            children: campaign.base_of_operations_description
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 855,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                        fontStyle: 'italic'
                                    },
                                    children: "No base of operations recorded"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 861,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 848,
                                columnNumber: 13
                            }, this),
                            gmUnlocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setBooNameDraft(campaign.base_of_operations_name ?? '');
                                    setBooDescDraft(campaign.base_of_operations_description ?? '');
                                    setEditingBoo(true);
                                },
                                title: "Edit base of operations",
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                    flexShrink: 0,
                                    padding: '0 2px'
                                },
                                children: "✎"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 867,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 841,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 706,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["panelBase"],
                    borderRadius: 8,
                    padding: 'var(--space-3)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                        label: "GROUP DUTY"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 879,
                        columnNumber: 9
                    }, this),
                    duties.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                            padding: '8px 0'
                        },
                        children: "No active characters in this campaign."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 882,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        style: {
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        [
                                            'Duty Range',
                                            'Character',
                                            'Duty Type',
                                            'Duty Value'
                                        ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                                    letterSpacing: '0.08em',
                                                    textAlign: 'left',
                                                    paddingBottom: 6,
                                                    borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`
                                                },
                                                children: h
                                            }, h, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 890,
                                                columnNumber: 19
                                            }, this)),
                                        gmUnlocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {}, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 896,
                                            columnNumber: 32
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 888,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 887,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: dutyRows.map((row)=>{
                                    const isTop = row.id === topContributor && row.duty_value > 0;
                                    const loreText = row.duty_lore?.trim() || null;
                                    const isHovered = hoveredDutyChar === row.id;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                                            position: 'relative'
                                        },
                                        onMouseEnter: ()=>loreText ? setHoveredDutyChar(row.id) : undefined,
                                        onMouseLeave: ()=>setHoveredDutyChar(null),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle(),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: FONT_MONO,
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim
                                                    },
                                                    children: [
                                                        row.rangeStart,
                                                        "–",
                                                        row.rangeEnd
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 912,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 911,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    ...tdStyle(),
                                                    position: 'relative'
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
                                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].text
                                                                },
                                                                children: row.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                lineNumber: 918,
                                                                columnNumber: 25
                                                            }, this),
                                                            isTop && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 3,
                                                                    padding: '1px 6px',
                                                                    borderRadius: 10,
                                                                    background: 'var(--hud-surface-lo)',
                                                                    border: `1px solid color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 33%, transparent)`,
                                                                    fontFamily: FONT_MONO,
                                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                                                    letterSpacing: '0.06em',
                                                                    whiteSpace: 'nowrap'
                                                                },
                                                                children: "★ TOP CONTRIBUTOR"
                                                            }, void 0, false, {
                                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                lineNumber: 922,
                                                                columnNumber: 27
                                                            }, this),
                                                            loreText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontFamily: FONT_MONO,
                                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                                                    opacity: 0.5,
                                                                    cursor: 'default'
                                                                },
                                                                title: "",
                                                                children: "···"
                                                            }, void 0, false, {
                                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                lineNumber: 934,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 917,
                                                        columnNumber: 23
                                                    }, this),
                                                    isHovered && loreText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            position: 'absolute',
                                                            ...isTop ? {
                                                                top: 'calc(100% + 4px)'
                                                            } : {
                                                                bottom: 'calc(100% + 6px)'
                                                            },
                                                            left: 0,
                                                            zIndex: 50,
                                                            background: 'var(--hud-surface-hi)',
                                                            border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].borderHi}`,
                                                            borderRadius: 6,
                                                            padding: '10px 14px',
                                                            maxWidth: 320,
                                                            minWidth: 180,
                                                            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                                                            pointerEvents: 'none'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                                                    letterSpacing: '0.08em',
                                                                    marginBottom: 6
                                                                },
                                                                children: row.duty_custom_name || dutyTypes.find((d)=>d.key === row.duty_type)?.name || row.duty_type || 'Duty'
                                                            }, void 0, false, {
                                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                lineNumber: 952,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].text,
                                                                    lineHeight: 1.55
                                                                },
                                                                children: loreText
                                                            }, void 0, false, {
                                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                lineNumber: 955,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 942,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 916,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle(),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim
                                                    },
                                                    children: row.duty_custom_name || dutyTypes.find((d)=>d.key === row.duty_type)?.name || row.duty_type || '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 962,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 961,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle(),
                                                children: editingDutyChar === row.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    autoFocus: true,
                                                    type: "number",
                                                    min: 0,
                                                    value: dutyEditDraft,
                                                    onChange: (e)=>setDutyEditDraft(e.target.value),
                                                    onBlur: ()=>saveDutyValue(row.id, dutyEditDraft),
                                                    onKeyDown: (e)=>{
                                                        if (e.key === 'Enter') saveDutyValue(row.id, dutyEditDraft);
                                                        if (e.key === 'Escape') setEditingDutyChar(null);
                                                    },
                                                    style: {
                                                        ...inlineInputStyle(),
                                                        width: 60,
                                                        padding: '2px 6px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 968,
                                                    columnNumber: 25
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: FONT_MONO,
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold
                                                    },
                                                    children: row.duty_value
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 982,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 966,
                                                columnNumber: 21
                                            }, this),
                                            gmUnlocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle(),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        setDutyEditDraft(String(row.duty_value));
                                                        setEditingDutyChar(row.id);
                                                    },
                                                    style: {
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"]
                                                    },
                                                    children: "✎"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 989,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 988,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, row.id, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 905,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 899,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 886,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 4
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                            letterSpacing: '0.08em'
                                        },
                                        children: "GROUP DUTY"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1005,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: 'var(--font-body)',
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                            color: milestone ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim
                                        },
                                        children: [
                                            dutyTotal,
                                            " / 100"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1008,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1004,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    height: 8,
                                    borderRadius: 4,
                                    background: 'var(--hud-border)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        height: '100%',
                                        borderRadius: 4,
                                        width: `${dutyPct}%`,
                                        background: milestone ? `linear-gradient(90deg, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold}, #F5D77A)` : `linear-gradient(90deg, rgba(224,58,30,0.6), rgba(224,58,30,0.9))`,
                                        transition: 'width 0.4s ease',
                                        boxShadow: milestone ? `0 0 8px color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 53%, transparent)` : undefined
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 1016,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1012,
                                columnNumber: 11
                            }, this),
                            milestone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                            letterSpacing: '0.1em'
                                        },
                                        children: "★ CONTRIBUTION MILESTONE REACHED ★"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1028,
                                        columnNumber: 15
                                    }, this),
                                    gmUnlocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleResetGroupDuty(),
                                        style: {
                                            padding: '6px 20px',
                                            background: 'rgba(224,58,30,0.12)',
                                            border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold}`,
                                            borderRadius: 4,
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_LABEL"],
                                            letterSpacing: '0.1em',
                                            cursor: 'pointer',
                                            boxShadow: `0 0 10px rgba(224,58,30,0.2)`
                                        },
                                        children: "↑ RESET GROUP DUTY & ADVANCE RANK"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1035,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1027,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1003,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 878,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["panelBase"],
                    borderRadius: 8,
                    padding: 'var(--space-3)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                        label: "CONTRIBUTION RANK"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1060,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 12,
                            marginTop: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                    lineHeight: 1,
                                    letterSpacing: '-0.02em'
                                },
                                children: rank
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1064,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 6
                                },
                                children: Array.from({
                                    length: 5
                                }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: 18,
                                            height: 18,
                                            borderRadius: '50%',
                                            background: i < rank ? `radial-gradient(circle at 35% 35%, #F5D77A, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold})` : 'var(--hud-surface-mid)',
                                            border: `1px solid ${i < rank ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                                            boxShadow: i < rank ? `0 0 6px color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 40%, transparent)` : undefined,
                                            transition: 'all 0.2s'
                                        }
                                    }, i, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1073,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1071,
                                columnNumber: 11
                            }, this),
                            gmUnlocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 8,
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>saveCampaignField({
                                                contribution_rank: Math.max(0, rank - 1)
                                            }),
                                        style: btnStyle(false),
                                        children: "−"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1091,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                            letterSpacing: '0.08em'
                                        },
                                        children: "ADJUST RANK"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1092,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>saveCampaignField({
                                                contribution_rank: Math.min(10, rank + 1)
                                            }),
                                        style: btnStyle(false),
                                        children: "+"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1093,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1090,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 12,
                                    width: '100%',
                                    maxWidth: 560
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TooltipCard, {
                                        label: "ALLIANCE STANDING",
                                        color: "#4EC87A",
                                        text: rankData.alliance,
                                        nextText: nextRankEntry ? nextRankEntry.alliance : null,
                                        symbolSrc: "/images/factions/rebel.png",
                                        symbolCorner: "right"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1099,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TooltipCard, {
                                        label: "IMPERIAL THREAT",
                                        color: "#E05050",
                                        text: rankData.empire,
                                        nextText: nextRankEntry ? nextRankEntry.empire : null,
                                        symbolSrc: "/images/factions/empire.png",
                                        symbolCorner: "left",
                                        symbolFilter: "invert(1) opacity(0.15)"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1107,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1098,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '100%',
                                    maxWidth: 560
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            marginBottom: 4
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                                    letterSpacing: '0.08em'
                                                },
                                                children: "RANK REWARD"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 1121,
                                                columnNumber: 15
                                            }, this),
                                            gmUnlocked && editingRewardDesc !== rank && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    setRewardDescDraft(rankDesc ?? '');
                                                    setEditingRewardDesc(rank);
                                                },
                                                style: {
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"]
                                                },
                                                children: "✎"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 1125,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1120,
                                        columnNumber: 13
                                    }, this),
                                    editingRewardDesc === rank ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                autoFocus: true,
                                                value: rewardDescDraft,
                                                onChange: (e)=>setRewardDescDraft(e.target.value),
                                                placeholder: "Describe the reward for reaching this rank…",
                                                rows: 3,
                                                style: {
                                                    ...inlineInputStyle(),
                                                    resize: 'vertical',
                                                    width: '100%'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 1133,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: 8
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        style: btnStyle(false),
                                                        onClick: ()=>setEditingRewardDesc(null),
                                                        children: "Cancel"
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 1142,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        style: btnStyle(true),
                                                        onClick: async ()=>{
                                                            const updated = {
                                                                ...campaign.contribution_rank_descriptions ?? {},
                                                                [String(rank)]: rewardDescDraft
                                                            };
                                                            await saveCampaignField({
                                                                contribution_rank_descriptions: updated
                                                            });
                                                            setEditingRewardDesc(null);
                                                        },
                                                        children: "Save"
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 1143,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 1141,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1132,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                            color: rankDesc ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].text : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                            fontStyle: rankDesc ? 'normal' : 'italic',
                                            lineHeight: 1.5
                                        },
                                        children: rankDesc ?? 'Advance your Group Contribution Rank to see rewards.'
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1151,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1119,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1063,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1059,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["panelBase"],
                    borderRadius: 8,
                    padding: 'var(--space-3)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                                label: "GROUP ASSETS"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1165,
                                columnNumber: 11
                            }, this),
                            gmUnlocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowAddAsset(true),
                                style: {
                                    ...btnStyle(true),
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"]
                                },
                                children: "+ ADD ASSET"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1167,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1164,
                        columnNumber: 9
                    }, this),
                    assets.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                            fontStyle: 'italic'
                        },
                        children: "No assets recorded yet."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1177,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                        },
                        children: assets.map((asset)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AssetCard, {
                                asset: asset,
                                canArchive: gmUnlocked,
                                onView: ()=>setViewingAsset(asset),
                                onArchive: ()=>archiveAsset(asset.id)
                            }, asset.id, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1183,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1181,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1163,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["panelBase"],
                    borderRadius: 8,
                    padding: 'var(--space-3)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                                label: "LAST ALLIANCE REWARD"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1199,
                                columnNumber: 11
                            }, this),
                            gmUnlocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    const r = campaign.last_alliance_reward;
                                    setRewardTypeDraft(r?.type ?? 'equipment');
                                    setRewardDescModalDraft(r?.description ?? '');
                                    setShowRewardModal(true);
                                },
                                style: {
                                    ...btnStyle(false),
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"]
                                },
                                children: "✎ EDIT"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1201,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1198,
                        columnNumber: 9
                    }, this),
                    campaign.last_alliance_reward ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 8,
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            padding: '2px 10px',
                                            borderRadius: 12,
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                            letterSpacing: '0.06em',
                                            background: 'var(--hud-surface-lo)',
                                            border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold
                                        },
                                        children: ASSET_LABELS[campaign.last_alliance_reward.type] ?? campaign.last_alliance_reward.type
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1218,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim
                                        },
                                        children: formatDate(campaign.last_alliance_reward.awarded_at)
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1226,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1217,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].text,
                                    lineHeight: 1.5
                                },
                                children: campaign.last_alliance_reward.description
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1230,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1216,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                            fontStyle: 'italic'
                        },
                        children: "No Alliance reward recorded yet. Reach 100 combined Duty to earn your first reward."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1235,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1197,
                columnNumber: 7
            }, this),
            showRewardModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
                open: true,
                onClose: ()=>setShowRewardModal(false),
                zIndex: 200,
                maxWidth: 480,
                backdrop: "rgba(0,0,0,0.75)",
                borderColor: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].borderHi,
                shadow: "0 8px 40px rgba(0,0,0,0.8)",
                panelBackground: "var(--hud-surface-hi)",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '24px 32px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_H4"],
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                letterSpacing: '0.08em'
                            },
                            children: "SET ALLIANCE REWARD"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                            lineNumber: 1246,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle(),
                                    children: "Reward Type"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 1250,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: rewardTypeDraft,
                                    onChange: (e)=>setRewardTypeDraft(e.target.value),
                                    style: inlineInputStyle(),
                                    children: REWARD_TYPES.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: t,
                                            children: ASSET_LABELS[t] ?? t
                                        }, t, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1256,
                                            columnNumber: 38
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 1251,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                            lineNumber: 1249,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: labelStyle(),
                                    children: "Description"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 1260,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    autoFocus: true,
                                    value: rewardDescModalDraft,
                                    onChange: (e)=>setRewardDescModalDraft(e.target.value),
                                    placeholder: "Describe the reward the Alliance has provided…",
                                    rows: 4,
                                    style: {
                                        ...inlineInputStyle(),
                                        resize: 'vertical'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 1261,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                            lineNumber: 1259,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: 8,
                                justifyContent: 'flex-end'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    style: btnStyle(false),
                                    onClick: ()=>setShowRewardModal(false),
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 1271,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    style: btnStyle(true),
                                    onClick: async ()=>{
                                        const reward = {
                                            type: rewardTypeDraft,
                                            description: rewardDescModalDraft,
                                            awarded_at: new Date().toISOString()
                                        };
                                        await saveCampaignField({
                                            last_alliance_reward: reward
                                        });
                                        setShowRewardModal(false);
                                    },
                                    children: "Save Reward"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                    lineNumber: 1272,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                            lineNumber: 1270,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                    lineNumber: 1245,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1244,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
        lineNumber: 523,
        columnNumber: 5
    }, this);
}
_s1(GroupSheet, "OeLvT6t4ud7hnk4xASmYrb8CuHE=");
_c1 = GroupSheet;
// ── Sub-components ──────────────────────────────────────────────────────────────
function SectionHeader({ label }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_LABEL"],
            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
            letterSpacing: '0.12em',
            marginBottom: 4,
            borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
            paddingBottom: 4
        },
        children: label
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
        lineNumber: 1295,
        columnNumber: 5
    }, this);
}
_c2 = SectionHeader;
function TooltipCard({ label, color, text, nextText, symbolSrc, symbolCorner, symbolFilter }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            flex: 1,
            borderRadius: 6,
            padding: '10px 12px',
            background: 'var(--hud-surface-lo)',
            border: `1px solid ${color}66`,
            position: 'relative',
            overflow: 'hidden'
        },
        children: [
            symbolSrc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: symbolSrc,
                alt: "",
                style: {
                    position: 'absolute',
                    top: 6,
                    ...symbolCorner === 'right' ? {
                        right: 8
                    } : {
                        left: 8
                    },
                    width: 56,
                    height: 56,
                    objectFit: 'contain',
                    opacity: symbolFilter ? 1 : 0.18,
                    filter: symbolFilter,
                    pointerEvents: 'none',
                    userSelect: 'none'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1320,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                    color,
                    letterSpacing: '0.08em',
                    marginBottom: 4,
                    fontWeight: 700
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1338,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                    color: 'var(--hud-text)',
                    lineHeight: 1.5,
                    marginBottom: nextText !== undefined ? 8 : 0
                },
                children: text
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1341,
                columnNumber: 7
            }, this),
            nextText !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                            color: color + '88',
                            letterSpacing: '0.08em',
                            marginBottom: 3,
                            fontWeight: 600
                        },
                        children: "NEXT RANK"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1347,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                            color: 'var(--hud-text-dim)',
                            lineHeight: 1.5
                        },
                        children: nextText ?? 'Maximum rank achieved.'
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1350,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
        lineNumber: 1311,
        columnNumber: 5
    }, this);
}
_c3 = TooltipCard;
// ── Asset View Modal ─────────────────────────────────────────────────────────
const _VM_RAISED = 'var(--hud-surface-mid)';
const _VM_BORDER = 'var(--hud-border)';
const _VM_DIM = 'var(--hud-text-dim)';
const _VM_TEXT = 'var(--hud-text)';
const _VM_RED = '#E05050';
const _VM_GREEN = '#4EC87A';
const _VM_BLUE = '#5AAAE0';
function _VmSection({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--hud-text-dim)',
            borderBottom: `1px solid ${_VM_BORDER}`,
            paddingBottom: 4,
            marginBottom: 8
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
        lineNumber: 1371,
        columnNumber: 5
    }, this);
}
function _VmStat({ label, value, color }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: _VM_RAISED,
            border: `1px solid ${_VM_BORDER}`,
            borderRadius: 4,
            padding: '6px 10px',
            minWidth: 48
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                    color: _VM_DIM,
                    letterSpacing: '0.1em',
                    marginBottom: 3
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1387,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_H4"],
                    fontWeight: 700,
                    color: color ?? _VM_TEXT
                },
                children: value
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1388,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
        lineNumber: 1382,
        columnNumber: 5
    }, this);
}
function AssetViewModal({ asset, adversary, vehicle, loading, onClose }) {
    _s2();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AssetViewModal.useEffect": ()=>{
            setMounted(true);
            requestAnimationFrame({
                "AssetViewModal.useEffect": ()=>requestAnimationFrame({
                        "AssetViewModal.useEffect": ()=>setVisible(true)
                    }["AssetViewModal.useEffect"])
            }["AssetViewModal.useEffect"]);
        }
    }["AssetViewModal.useEffect"], []);
    const handleClose = ()=>{
        setVisible(false);
        setTimeout(onClose, 260);
    };
    const useLibrary = asset.asset_type === 'npc' || asset.asset_type === 'vehicle' || asset.asset_type === 'starship';
    const accentColor = ASSET_COLORS[asset.asset_type];
    if (!mounted) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: handleClose,
                style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10050,
                    background: 'rgba(0,0,0,0.5)',
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.26s'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1419,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10060,
                    width: 'clamp(340px, 42vw, 560px)',
                    background: 'var(--hud-surface-hi)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    borderLeft: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].borderHi}`,
                    boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: visible ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '16px 20px',
                            borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    padding: '2px 8px',
                                    borderRadius: 10,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                    letterSpacing: '0.06em',
                                    background: accentColor + '22',
                                    border: `1px solid ${accentColor}66`,
                                    color: accentColor
                                },
                                children: ASSET_LABELS[asset.asset_type]
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1447,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_H4"],
                                    fontWeight: 700,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                    letterSpacing: '0.05em',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                },
                                children: [
                                    (adversary?._isCustom || vehicle?._isCustom) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold
                                        },
                                        children: "★ "
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1455,
                                        columnNumber: 62
                                    }, this),
                                    asset.name
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1454,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleClose,
                                style: {
                                    background: 'transparent',
                                    border: 'none',
                                    color: _VM_DIM,
                                    cursor: 'pointer',
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_H4"],
                                    lineHeight: 1,
                                    padding: '0 4px',
                                    flexShrink: 0
                                },
                                children: "×"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1458,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1443,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 18
                        },
                        children: [
                            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                    textAlign: 'center',
                                    padding: '24px 0'
                                },
                                children: "Loading stat block…"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1466,
                                columnNumber: 13
                            }, this),
                            !loading && adversary && (()=>{
                                const adv = adversary;
                                const defense = Array.isArray(adv.defense) ? adv.defense : [
                                    0,
                                    0
                                ];
                                const skillEntries = Object.entries(adv.skillRanks ?? {}).filter(([, r])=>r > 0);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                gap: 8,
                                                alignItems: 'center'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: FONT_MONO,
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                    fontWeight: 700,
                                                    color: adv.type === 'nemesis' ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold : adv.type === 'rival' ? _VM_BLUE : _VM_DIM,
                                                    border: `1px solid currentColor`,
                                                    borderRadius: 3,
                                                    padding: '1px 7px',
                                                    letterSpacing: '0.1em',
                                                    background: adv.type === 'nemesis' ? `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 9%, transparent)` : adv.type === 'rival' ? `${_VM_BLUE}18` : `color-mix(in srgb, ${_VM_DIM} 9%, transparent)`
                                                },
                                                children: adv.type.toUpperCase()
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                lineNumber: 1480,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1479,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Characteristics"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1492,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        gap: 6,
                                                        flexWrap: 'wrap'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "BR",
                                                            value: adv.brawn
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1494,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "AG",
                                                            value: adv.agility
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1495,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "INT",
                                                            value: adv.intellect
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1496,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "CUN",
                                                            value: adv.cunning
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1497,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "WIL",
                                                            value: adv.willpower
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1498,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "PR",
                                                            value: adv.presence
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1499,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1493,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1491,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Derived Stats"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1505,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        gap: 6,
                                                        flexWrap: 'wrap'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Soak",
                                                            value: adv.soak
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1507,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "WT",
                                                            value: adv.wound
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1508,
                                                            columnNumber: 21
                                                        }, this),
                                                        adv.strain != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "ST",
                                                            value: adv.strain
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1509,
                                                            columnNumber: 44
                                                        }, this),
                                                        defense[0] > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Def M",
                                                            value: defense[0]
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1510,
                                                            columnNumber: 40
                                                        }, this),
                                                        defense[1] > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Def R",
                                                            value: defense[1]
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1511,
                                                            columnNumber: 40
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1506,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1504,
                                            columnNumber: 17
                                        }, this),
                                        skillEntries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Skills"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1518,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '4px 14px'
                                                    },
                                                    children: skillEntries.map(([skill, rank])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                                color: _VM_TEXT
                                                            },
                                                            children: [
                                                                skill,
                                                                " ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                                                        fontWeight: 700
                                                                    },
                                                                    children: rank
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1522,
                                                                    columnNumber: 35
                                                                }, this)
                                                            ]
                                                        }, skill, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1521,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1519,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1517,
                                            columnNumber: 19
                                        }, this),
                                        adv.weapons && adv.weapons.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Weapons"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1532,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 6
                                                    },
                                                    children: adv.weapons.map((w, i)=>{
                                                        const { dmg, range, crit } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$resolve$2d$weapon$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveWeapon"])(w, adv.brawn, {});
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                padding: '6px 10px',
                                                                background: _VM_RAISED,
                                                                borderRadius: 4,
                                                                border: `1px solid ${_VM_BORDER}`,
                                                                display: 'flex',
                                                                gap: 8,
                                                                alignItems: 'center',
                                                                flexWrap: 'wrap'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                                        fontWeight: 700,
                                                                        color: _VM_TEXT,
                                                                        minWidth: 100
                                                                    },
                                                                    children: w.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1538,
                                                                    columnNumber: 29
                                                                }, this),
                                                                w.skillCategory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: w.skillCategory
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1539,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: FONT_MONO,
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                        color: _VM_RED
                                                                    },
                                                                    children: [
                                                                        "Dmg ",
                                                                        dmg
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1540,
                                                                    columnNumber: 29
                                                                }, this),
                                                                crit !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: FONT_MONO,
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                        color: _VM_RED
                                                                    },
                                                                    children: [
                                                                        "Crit ",
                                                                        crit
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1541,
                                                                    columnNumber: 52
                                                                }, this),
                                                                range && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: range
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1542,
                                                                    columnNumber: 39
                                                                }, this),
                                                                w.qualities && w.qualities.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                                                        text: w.qualities.join(', ')
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                        lineNumber: 1545,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1544,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1537,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1533,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1531,
                                            columnNumber: 19
                                        }, this),
                                        (adv.talents && adv.talents.length > 0 || adv.abilities && adv.abilities.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Talents & Abilities"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1558,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 6
                                                    },
                                                    children: [
                                                        adv.talents?.map((t, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                                            fontWeight: 700,
                                                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold
                                                                        },
                                                                        children: t.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                        lineNumber: 1562,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    t.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                            color: _VM_DIM
                                                                        },
                                                                        children: [
                                                                            " — ",
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                                                                text: t.description
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                                lineNumber: 1563,
                                                                                columnNumber: 130
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                        lineNumber: 1563,
                                                                        columnNumber: 45
                                                                    }, this)
                                                                ]
                                                            }, i, true, {
                                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                lineNumber: 1561,
                                                                columnNumber: 25
                                                            }, this)),
                                                        adv.abilities?.map((a, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                                            fontWeight: 700,
                                                                            color: _VM_GREEN
                                                                        },
                                                                        children: a.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                        lineNumber: 1568,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    a.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                            color: _VM_DIM
                                                                        },
                                                                        children: [
                                                                            " — ",
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                                                                text: a.description
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                                lineNumber: 1569,
                                                                                columnNumber: 130
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                        lineNumber: 1569,
                                                                        columnNumber: 45
                                                                    }, this)
                                                                ]
                                                            }, i, true, {
                                                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                lineNumber: 1567,
                                                                columnNumber: 25
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1559,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1557,
                                            columnNumber: 19
                                        }, this),
                                        adv.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Description"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1579,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                        color: _VM_DIM,
                                                        lineHeight: 1.6
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                                        text: adv.description
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 1581,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1580,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1578,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true);
                            })(),
                            !loading && vehicle && (()=>{
                                const v = vehicle;
                                const handlingStr = v.handling >= 0 ? `+${v.handling}` : `${v.handling}`;
                                const handlingColor = v.handling < 0 ? _VM_RED : v.handling > 0 ? _VM_GREEN : _VM_TEXT;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: FONT_MONO,
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                        fontWeight: 700,
                                                        color: v.isStarship ? _VM_BLUE : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                                        border: `1px solid currentColor`,
                                                        borderRadius: 3,
                                                        padding: '1px 7px',
                                                        letterSpacing: '0.1em',
                                                        background: v.isStarship ? `${_VM_BLUE}18` : `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 9%, transparent)`
                                                    },
                                                    children: v.isStarship ? 'STARSHIP' : 'GROUND VEHICLE'
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1598,
                                                    columnNumber: 19
                                                }, this),
                                                v.type && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                        color: _VM_DIM,
                                                        marginLeft: 10
                                                    },
                                                    children: v.type
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1606,
                                                    columnNumber: 30
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1597,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Performance"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1611,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        gap: 6,
                                                        flexWrap: 'wrap'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Sil",
                                                            value: v.silhouette
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1613,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Speed",
                                                            value: v.speed
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1614,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Hdl",
                                                            value: handlingStr,
                                                            color: handlingColor
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1615,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1612,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1610,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Combat Stats"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1621,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        gap: 6,
                                                        flexWrap: 'wrap'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Armor",
                                                            value: v.armor
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1623,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Hull",
                                                            value: v.hullTrauma
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1624,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Sys",
                                                            value: v.systemStrain
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1625,
                                                            columnNumber: 21
                                                        }, this),
                                                        v.defFore > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Def F",
                                                            value: v.defFore
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1626,
                                                            columnNumber: 44
                                                        }, this),
                                                        v.defAft > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Def A",
                                                            value: v.defAft
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1627,
                                                            columnNumber: 44
                                                        }, this),
                                                        v.defPort > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Def P",
                                                            value: v.defPort
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1628,
                                                            columnNumber: 44
                                                        }, this),
                                                        v.defStarboard > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmStat, {
                                                            label: "Def S",
                                                            value: v.defStarboard
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1629,
                                                            columnNumber: 44
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1622,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1620,
                                            columnNumber: 17
                                        }, this),
                                        (v.crew || v.passengers != null || v.encumbranceCapacity != null || v.consumables) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Crew & Cargo"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1636,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 4,
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"]
                                                    },
                                                    children: [
                                                        v.crew && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: "Crew: "
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1638,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_TEXT
                                                                    },
                                                                    children: v.crew
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1638,
                                                                    columnNumber: 99
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1638,
                                                            columnNumber: 48
                                                        }, this),
                                                        v.passengers != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: "Passengers: "
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1639,
                                                                    columnNumber: 54
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_TEXT
                                                                    },
                                                                    children: v.passengers
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1639,
                                                                    columnNumber: 106
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1639,
                                                            columnNumber: 49
                                                        }, this),
                                                        v.encumbranceCapacity != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: "Cargo: "
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1640,
                                                                    columnNumber: 62
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_TEXT
                                                                    },
                                                                    children: [
                                                                        v.encumbranceCapacity,
                                                                        " enc."
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1640,
                                                                    columnNumber: 109
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1640,
                                                            columnNumber: 57
                                                        }, this),
                                                        v.consumables && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: "Consumables: "
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1641,
                                                                    columnNumber: 54
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_TEXT
                                                                    },
                                                                    children: v.consumables
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1641,
                                                                    columnNumber: 107
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1641,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1637,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1635,
                                            columnNumber: 19
                                        }, this),
                                        v.isStarship && (v.hyperdrivePrimary != null || v.naviComputer != null) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Hyperdrive"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1649,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 4,
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"]
                                                    },
                                                    children: [
                                                        v.hyperdrivePrimary != null && v.hyperdrivePrimary > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: "Primary: "
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1651,
                                                                    columnNumber: 87
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_TEXT
                                                                    },
                                                                    children: [
                                                                        "Class ",
                                                                        v.hyperdrivePrimary
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1651,
                                                                    columnNumber: 136
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1651,
                                                            columnNumber: 82
                                                        }, this),
                                                        v.hyperdriveBackup != null && v.hyperdriveBackup > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: "Backup: "
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1652,
                                                                    columnNumber: 87
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_TEXT
                                                                    },
                                                                    children: [
                                                                        "Class ",
                                                                        v.hyperdriveBackup
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1652,
                                                                    columnNumber: 135
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1652,
                                                            columnNumber: 82
                                                        }, this),
                                                        v.naviComputer != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: "Navicomputer: "
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1653,
                                                                    columnNumber: 55
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_TEXT
                                                                    },
                                                                    children: v.naviComputer ? 'Yes' : 'No'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1653,
                                                                    columnNumber: 109
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1653,
                                                            columnNumber: 50
                                                        }, this),
                                                        v.sensorRange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: "Sensors: "
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1654,
                                                                    columnNumber: 46
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: _VM_TEXT
                                                                    },
                                                                    children: v.sensorRange.replace('sr', '')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1654,
                                                                    columnNumber: 95
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1654,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1650,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1648,
                                            columnNumber: 19
                                        }, this),
                                        v.weapons && v.weapons.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Weapons"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1662,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 6
                                                    },
                                                    children: v.weapons.map((w, i)=>{
                                                        const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$vehicles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["vehicleWeaponStats"])(w.weaponKey);
                                                        const displayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$vehicles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["vehicleWeaponDisplayName"])(w.weaponKey);
                                                        const arcParts = [
                                                            w.firingArcs.fore && 'Fore',
                                                            w.firingArcs.aft && 'Aft',
                                                            w.firingArcs.port && 'Port',
                                                            w.firingArcs.starboard && 'Stbd',
                                                            w.firingArcs.dorsal && 'Dorsal',
                                                            w.firingArcs.ventral && 'Ventral'
                                                        ].filter(Boolean).join('/');
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                padding: '6px 10px',
                                                                background: _VM_RAISED,
                                                                borderRadius: 4,
                                                                border: `1px solid ${_VM_BORDER}`
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        gap: 8,
                                                                        alignItems: 'center',
                                                                        flexWrap: 'wrap'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                                                fontWeight: 700,
                                                                                color: _VM_TEXT,
                                                                                minWidth: 140
                                                                            },
                                                                            children: [
                                                                                w.count > 1 ? `${w.count}× ` : '',
                                                                                displayName,
                                                                                w.turret ? ' (Turret)' : ''
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                            lineNumber: 1678,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        stats && stats.damage > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontFamily: FONT_MONO,
                                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                                color: _VM_RED
                                                                            },
                                                                            children: [
                                                                                "Dmg ",
                                                                                stats.damage
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                            lineNumber: 1681,
                                                                            columnNumber: 61
                                                                        }, this),
                                                                        stats?.crit !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontFamily: FONT_MONO,
                                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                                color: _VM_RED
                                                                            },
                                                                            children: [
                                                                                "Crit ",
                                                                                stats.crit
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                            lineNumber: 1682,
                                                                            columnNumber: 61
                                                                        }, this),
                                                                        stats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                                color: _VM_DIM
                                                                            },
                                                                            children: stats.range
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                            lineNumber: 1683,
                                                                            columnNumber: 41
                                                                        }, this),
                                                                        arcParts && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                                color: _VM_DIM
                                                                            },
                                                                            children: [
                                                                                "[",
                                                                                arcParts,
                                                                                "]"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                            lineNumber: 1684,
                                                                            columnNumber: 44
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1677,
                                                                    columnNumber: 29
                                                                }, this),
                                                                w.qualities.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                        color: _VM_DIM,
                                                                        marginTop: 3
                                                                    },
                                                                    children: w.qualities.map((q)=>`${q.key}${q.count > 1 ? ` ${q.count}` : ''}`).join(', ')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1687,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1676,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1663,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1661,
                                            columnNumber: 19
                                        }, this),
                                        v.abilities && v.abilities.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Special Features"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1701,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 6
                                                    },
                                                    children: v.abilities.map((a, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                                        fontWeight: 700,
                                                                        color: _VM_GREEN
                                                                    },
                                                                    children: a.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1705,
                                                                    columnNumber: 27
                                                                }, this),
                                                                a.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                                                        color: _VM_DIM
                                                                    },
                                                                    children: [
                                                                        " — ",
                                                                        a.description
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                                    lineNumber: 1706,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                            lineNumber: 1704,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1702,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1700,
                                            columnNumber: 19
                                        }, this),
                                        v.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(_VmSection, {
                                                    children: "Description"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1716,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                                        color: _VM_DIM,
                                                        lineHeight: 1.6
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                                        text: v.description
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                        lineNumber: 1718,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                                    lineNumber: 1717,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                            lineNumber: 1715,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true);
                            })(),
                            !loading && useLibrary && !adversary && !vehicle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                    textAlign: 'center',
                                    padding: '16px 0'
                                },
                                children: [
                                    "No stat block found in library for “",
                                    asset.name,
                                    "”.",
                                    asset.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 12,
                                            textAlign: 'left',
                                            color: _VM_TEXT,
                                            lineHeight: 1.6
                                        },
                                        children: asset.description
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                        lineNumber: 1731,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1728,
                                columnNumber: 13
                            }, this),
                            !useLibrary && (asset.description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                    color: _VM_TEXT,
                                    lineHeight: 1.7
                                },
                                children: asset.description
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1741,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                    textAlign: 'center',
                                    padding: '16px 0'
                                },
                                children: "No description added."
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                                lineNumber: 1745,
                                columnNumber: 15
                            }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1462,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1430,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true), document.body);
}
_s2(AssetViewModal, "CAhS00pZqEA/78/5LiTucdS/gWo=");
_c4 = AssetViewModal;
function AssetCard({ asset, canArchive, onArchive, onView }) {
    const color = ASSET_COLORS[asset.asset_type];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            borderRadius: 6,
            padding: '10px 12px',
            background: 'var(--hud-surface-lo)',
            border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    padding: '2px 8px',
                    borderRadius: 10,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                    letterSpacing: '0.06em',
                    background: color + '22',
                    border: `1px solid ${color}66`,
                    color
                },
                children: ASSET_LABELS[asset.asset_type]
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1767,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    minWidth: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].text,
                            fontWeight: 600
                        },
                        children: asset.name
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1775,
                        columnNumber: 9
                    }, this),
                    asset.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                            marginTop: 2
                        },
                        children: asset.description
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1779,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1774,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 4,
                    flexShrink: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onView,
                        title: "View stat block",
                        style: {
                            background: `${color}10`,
                            border: `1px solid ${color}50`,
                            borderRadius: 4,
                            cursor: 'pointer',
                            color,
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                            fontWeight: 600,
                            padding: '2px 8px'
                        },
                        children: "View"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1785,
                        columnNumber: 9
                    }, this),
                    canArchive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onArchive,
                        title: "Remove asset",
                        style: {
                            background: 'none',
                            border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                            borderRadius: 4,
                            cursor: 'pointer',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                            padding: '2px 6px'
                        },
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                        lineNumber: 1797,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
                lineNumber: 1784,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/group/GroupSheet.tsx",
        lineNumber: 1762,
        columnNumber: 5
    }, this);
}
_c5 = AssetCard;
// ── Style helpers ───────────────────────────────────────────────────────────────
function tdStyle() {
    return {
        padding: '6px 8px 6px 0',
        verticalAlign: 'middle'
    };
}
function inlineInputStyle() {
    return {
        background: 'var(--hud-surface-lo)',
        border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
        borderRadius: 4,
        padding: '6px 10px',
        width: '100%',
        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_SM"],
        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].text,
        outline: 'none',
        boxSizing: 'border-box'
    };
}
function labelStyle() {
    return {
        display: 'block',
        marginBottom: 4,
        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
        letterSpacing: '0.08em'
    };
}
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "PinModal");
__turbopack_context__.k.register(_c1, "GroupSheet");
__turbopack_context__.k.register(_c2, "SectionHeader");
__turbopack_context__.k.register(_c3, "TooltipCard");
__turbopack_context__.k.register(_c4, "AssetViewModal");
__turbopack_context__.k.register(_c5, "AssetCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=star-wars-rpg_src_components_group_GroupSheet_tsx_45543905._.js.map