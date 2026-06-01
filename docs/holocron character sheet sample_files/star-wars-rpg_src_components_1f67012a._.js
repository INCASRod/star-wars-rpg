(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/src/components/ui/Modal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>Modal
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
// Module-scope — never recreated on render.
const BACKDROP = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MODAL"].backdrop,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][4]
};
function Modal({ open, onClose, children, maxWidth = '30rem', zIndex = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].modal, borderColor, shadow, backdrop, panelBackground }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Modal.useEffect": ()=>{
            if (!open || !onClose) return;
            const handler = {
                "Modal.useEffect.handler": (e)=>{
                    if (e.key === 'Escape') onClose();
                }
            }["Modal.useEffect.handler"];
            window.addEventListener('keydown', handler);
            return ({
                "Modal.useEffect": ()=>window.removeEventListener('keydown', handler)
            })["Modal.useEffect"];
        }
    }["Modal.useEffect"], [
        open,
        onClose
    ]);
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            ...BACKDROP,
            zIndex,
            background: backdrop ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MODAL"].backdrop
        },
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                width: '100%',
                maxWidth,
                maxHeight: '90vh',
                overflowY: 'auto',
                background: panelBackground ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].panel,
                border: `1px solid ${borderColor ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].borderHi}`,
                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].xl,
                boxShadow: shadow ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MODAL"].shadow
            },
            onClick: (e)=>e.stopPropagation(),
            children: children
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/ui/Modal.tsx",
            lineNumber: 61,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/ui/Modal.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this), document.body);
}
_s(Modal, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Modal;
var _c;
__turbopack_context__.k.register(_c, "Modal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/ui/TickerText.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TickerText",
    ()=>TickerText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useTicker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/hooks/useTicker.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function TickerText({ text, isOpen, delayMs, className }) {
    _s();
    const spanRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [shouldAnimate, setShouldAnimate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TickerText.useEffect": ()=>{
            if (!isOpen) {
                setShouldAnimate(false);
                return;
            }
            // Gate check: only animate when a [data-ticker-pass="true"] ancestor is
            // present. HudFullPanel sets that attribute via useLayoutEffect (which
            // fires before children's useEffect), so it is guaranteed to be present
            // here when the panel has just opened. If the panel has been open for
            // longer than the gate window (600ms), the attribute is already gone and
            // the text renders settled — preventing re-animation inside already-open
            // panels when accordions or sub-panels open.
            const gated = !!spanRef.current?.closest('[data-ticker-pass="true"]');
            setShouldAnimate(gated);
        }
    }["TickerText.useEffect"], [
        isOpen
    ]);
    const { chars } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useTicker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTicker"])(text, isOpen && shouldAnimate, delayMs);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        ref: spanRef,
        className: `ticker-ready${className ? ` ${className}` : ''}`,
        children: [
            chars.map((char)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "ticker-char",
                    style: {
                        opacity: char.settled ? 1 : 0.5
                    },
                    "aria-hidden": !char.settled,
                    children: char.display
                }, char.key, false, {
                    fileName: "[project]/star-wars-rpg/src/components/ui/TickerText.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sr-only",
                children: text
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/ui/TickerText.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/ui/TickerText.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_s(TickerText, "LOV4UGWc/1pjPjVKWe6abeyxQrU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useTicker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTicker"]
    ];
});
_c = TickerText;
var _c;
__turbopack_context__.k.register(_c, "TickerText");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RichText",
    ()=>RichText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$parseSymbols$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/parseSymbols.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/dice/DiceFace.tsx [app-client] (ecmascript)");
'use client';
;
;
;
const CSS_ICON = {
    success: 'ffi-swrpg-success',
    failure: 'ffi-swrpg-failure',
    advantage: 'ffi-swrpg-advantage',
    threat: 'ffi-swrpg-threat',
    triumph: 'ffi-swrpg-triumph',
    despair: 'ffi-swrpg-despair'
};
const FORCE_PIP_COLOR = {
    light: '#FFFFFF',
    dark: '#333333'
};
const DICE_FACE_KEYS = new Set([
    'boost',
    'ability',
    'proficiency',
    'setback',
    'difficulty',
    'challenge',
    'force'
]);
const LABEL = {
    success: 'Success',
    failure: 'Failure',
    advantage: 'Advantage',
    threat: 'Threat',
    triumph: 'Triumph',
    despair: 'Despair',
    light: 'Light side Force pip',
    dark: 'Dark side Force pip',
    boost: 'Boost die',
    ability: 'Ability die',
    proficiency: 'Proficiency die',
    setback: 'Setback die',
    difficulty: 'Difficulty die',
    challenge: 'Challenge die',
    force: 'Force die'
};
const INLINE = {
    display: 'inline',
    verticalAlign: 'middle',
    lineHeight: 1
};
function RichText({ text, className, style }) {
    const segments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$parseSymbols$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSymbols"])(text);
    const nodes = [];
    // Formatting state tracked across segments
    let isBold = false;
    let isItalic = false;
    let heading = 0;
    for(let i = 0; i < segments.length; i++){
        const seg = segments[i];
        const k = String(i);
        if (seg.type === 'text') {
            const hasFormat = isBold || isItalic || heading > 0;
            if (!hasFormat) {
                nodes.push(seg.value);
            } else {
                const s = {};
                if (isBold || heading > 0) s.fontWeight = 700;
                if (isItalic) s.fontStyle = 'italic';
                if (heading === 3) s.fontSize = '1.05em';
                nodes.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: s,
                    children: seg.value
                }, k, false, {
                    fileName: "[project]/star-wars-rpg/src/components/ui/RichText.tsx",
                    lineNumber: 82,
                    columnNumber: 20
                }, this));
            }
            continue;
        }
        if (seg.type === 'format') {
            switch(seg.tag){
                case 'bold-open':
                    isBold = true;
                    break;
                case 'bold-close':
                    isBold = false;
                    break;
                case 'italic-open':
                    isItalic = true;
                    break;
                case 'italic-close':
                    isItalic = false;
                    break;
                case 'h3-open':
                    heading = 3;
                    break;
                case 'h3-close':
                    heading = 0;
                    break;
                case 'h4-open':
                    heading = 4;
                    break;
                case 'h4-close':
                    heading = 0;
                    break;
                case 'paragraph':
                    nodes.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, k, false, {
                        fileName: "[project]/star-wars-rpg/src/components/ui/RichText.tsx",
                        lineNumber: 98,
                        columnNumber: 22
                    }, this), /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, k + '_', false, {
                        fileName: "[project]/star-wars-rpg/src/components/ui/RichText.tsx",
                        lineNumber: 98,
                        columnNumber: 38
                    }, this));
                    break;
                case 'linebreak':
                    nodes.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, k, false, {
                        fileName: "[project]/star-wars-rpg/src/components/ui/RichText.tsx",
                        lineNumber: 101,
                        columnNumber: 22
                    }, this));
                    break;
            }
            continue;
        }
        // seg.type === 'symbol'
        const { key, count } = seg;
        const label = LABEL[key] ?? key;
        for(let iconIdx = 0; iconIdx < count; iconIdx++){
            const ik = `${k}-${iconIdx}`;
            if (key in CSS_ICON) {
                nodes.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                    className: `ffi ${CSS_ICON[key]}`,
                    "aria-hidden": "true",
                    title: label,
                    style: INLINE
                }, ik, false, {
                    fileName: "[project]/star-wars-rpg/src/components/ui/RichText.tsx",
                    lineNumber: 116,
                    columnNumber: 11
                }, this));
                continue;
            }
            if (key in FORCE_PIP_COLOR) {
                nodes.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                    className: "ffi ffi-swrpg-force",
                    "aria-hidden": "true",
                    title: label,
                    style: {
                        ...INLINE,
                        color: FORCE_PIP_COLOR[key]
                    }
                }, ik, false, {
                    fileName: "[project]/star-wars-rpg/src/components/ui/RichText.tsx",
                    lineNumber: 123,
                    columnNumber: 11
                }, this));
                continue;
            }
            if (DICE_FACE_KEYS.has(key)) {
                nodes.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    "aria-hidden": "true",
                    title: label,
                    style: {
                        ...INLINE,
                        display: 'inline-block'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                        type: key,
                        size: 14,
                        style: {
                            verticalAlign: 'middle'
                        }
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/ui/RichText.tsx",
                        lineNumber: 132,
                        columnNumber: 13
                    }, this)
                }, ik, false, {
                    fileName: "[project]/star-wars-rpg/src/components/ui/RichText.tsx",
                    lineNumber: 131,
                    columnNumber: 11
                }, this));
            }
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: className,
        style: style,
        children: nodes
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/ui/RichText.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
_c = RichText;
var _c;
__turbopack_context__.k.register(_c, "RichText");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/ui/Tooltip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TipBody",
    ()=>TipBody,
    "TipDivider",
    ()=>TipDivider,
    "TipLabel",
    ()=>TipLabel,
    "Tooltip",
    ()=>Tooltip
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
const BG = 'var(--hud-surface-hi)';
const BORDER = 'var(--hud-border-hi)';
function CornerBrackets() {
    const s = {
        position: 'absolute',
        width: '0.375rem',
        height: '0.375rem'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...s,
                    top: 0,
                    left: 0,
                    borderTop: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`,
                    borderLeft: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...s,
                    top: 0,
                    right: 0,
                    borderTop: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`,
                    borderRight: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...s,
                    bottom: 0,
                    left: 0,
                    borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`,
                    borderLeft: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    ...s,
                    bottom: 0,
                    right: 0,
                    borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`,
                    borderRight: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold}`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_c = CornerBrackets;
function Tooltip({ content, children, placement = 'top', maxWidth = 280, delay = 300 }) {
    _s();
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pos, setPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const triggerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const tooltipRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Tooltip.useEffect": ()=>{
            setMounted(true);
        }
    }["Tooltip.useEffect"], []);
    const calcPos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tooltip.useCallback[calcPos]": ()=>{
            if (!triggerRef.current) return;
            const r = triggerRef.current.getBoundingClientRect();
            const gap = 10;
            let top = 0, left = 0;
            let actualPlacement = placement;
            const tw = maxWidth;
            const th = 120 // estimated tooltip height
            ;
            if (placement === 'right') {
                if (r.right + gap + tw > window.innerWidth) actualPlacement = 'left';
            } else if (placement === 'left') {
                if (r.left - gap - tw < 0) actualPlacement = 'right';
            } else if (placement === 'top') {
                if (r.top - gap - th < 0) actualPlacement = 'bottom';
            } else {
                if (r.bottom + gap + th > window.innerHeight) actualPlacement = 'top';
            }
            if (actualPlacement === 'top') {
                top = r.top - gap;
                left = r.left + r.width / 2;
            } else if (actualPlacement === 'bottom') {
                top = r.bottom + gap;
                left = r.left + r.width / 2;
            } else if (actualPlacement === 'right') {
                top = r.top + r.height / 2;
                left = r.right + gap;
            } else {
                top = r.top + r.height / 2;
                left = r.left - gap;
            }
            setPos({
                top,
                left,
                actualPlacement
            });
        }
    }["Tooltip.useCallback[calcPos]"], [
        placement,
        maxWidth
    ]);
    const show = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tooltip.useCallback[show]": ()=>{
            timerRef.current = setTimeout({
                "Tooltip.useCallback[show]": ()=>{
                    calcPos();
                    setVisible(true);
                }
            }["Tooltip.useCallback[show]"], delay);
        }
    }["Tooltip.useCallback[show]"], [
        calcPos,
        delay
    ]);
    const hide = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Tooltip.useCallback[hide]": ()=>{
            if (timerRef.current) clearTimeout(timerRef.current);
            setVisible(false);
        }
    }["Tooltip.useCallback[hide]"], []);
    // Clone child to attach ref + handlers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child = children;
    const trigger = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].cloneElement(child, {
        ref: triggerRef,
        onMouseEnter: (e)=>{
            show();
            child.props?.onMouseEnter?.(e);
        },
        onMouseLeave: (e)=>{
            hide();
            child.props?.onMouseLeave?.(e);
        }
    });
    if (!mounted) return child;
    const getTransform = (p)=>{
        if (p.actualPlacement === 'top') return 'translate(-50%, -100%)';
        if (p.actualPlacement === 'bottom') return 'translate(-50%, 0)';
        if (p.actualPlacement === 'right') return 'translate(0, -50%)';
        return 'translate(-100%, -50%)';
    };
    const arrowStyle = (p)=>{
        const base = {
            position: 'absolute',
            width: 0,
            height: 0,
            border: '0.375rem solid transparent'
        };
        if (p.actualPlacement === 'top') return {
            ...base,
            bottom: '-0.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            borderTopColor: BORDER
        };
        if (p.actualPlacement === 'bottom') return {
            ...base,
            top: '-0.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            borderBottomColor: BORDER
        };
        if (p.actualPlacement === 'right') return {
            ...base,
            left: '-0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            borderRightColor: BORDER
        };
        return {
            ...base,
            right: '-0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            borderLeftColor: BORDER
        };
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            trigger,
            visible && pos && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: tooltipRef,
                className: "holo-tooltip",
                style: {
                    position: 'fixed',
                    top: pos.top,
                    left: pos.left,
                    transform: getTransform(pos),
                    zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].tooltip,
                    maxWidth,
                    background: BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px var(--hud-border)`,
                    padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3]} 0.875rem`,
                    pointerEvents: 'none',
                    animation: 'tooltipIn 0.15s ease forwards'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CornerBrackets, {}, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
                        lineNumber: 151,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            arrow: undefined
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: arrowStyle(pos)
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
                            lineNumber: 153,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this),
                    content
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
                lineNumber: 132,
                columnNumber: 9
            }, this), document.body)
        ]
    }, void 0, true);
}
_s(Tooltip, "RFtJmUuo94BgOBYE2X2DRI+bPTY=");
_c1 = Tooltip;
function TipLabel({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
            marginBottom: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
        lineNumber: 166,
        columnNumber: 5
    }, this);
}
_c2 = TipLabel;
function TipBody({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
            color: 'var(--hud-text)',
            lineHeight: 1.55
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
        lineNumber: 178,
        columnNumber: 5
    }, this);
}
_c3 = TipBody;
function TipDivider() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            height: '1px',
            background: 'var(--hud-border)',
            margin: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]} 0`
        }
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/ui/Tooltip.tsx",
        lineNumber: 188,
        columnNumber: 10
    }, this);
}
_c4 = TipDivider;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "CornerBrackets");
__turbopack_context__.k.register(_c1, "Tooltip");
__turbopack_context__.k.register(_c2, "TipLabel");
__turbopack_context__.k.register(_c3, "TipBody");
__turbopack_context__.k.register(_c4, "TipDivider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/ui/MarkupText.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MarkupText",
    ()=>MarkupText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
'use client';
;
;
function MarkupText({ text, className, style }) {
    if (!text) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
        text: text,
        className: className,
        style: style
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/ui/MarkupText.tsx",
        lineNumber: 19,
        columnNumber: 10
    }, this);
}
_c = MarkupText;
var _c;
__turbopack_context__.k.register(_c, "MarkupText");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/ui/EquipmentImage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EquipmentImage",
    ()=>EquipmentImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$equipment$2d$icons$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/equipment-icons.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
// Lazy-load manifest once
let manifestCache = null;
let manifestPromise = null;
function loadManifest() {
    if (manifestCache) return Promise.resolve(manifestCache);
    if (manifestPromise) return manifestPromise;
    manifestPromise = fetch('/images/manifest.json').then((r)=>r.json()).then((data)=>{
        manifestCache = data;
        return data;
    }).catch(()=>{
        manifestCache = {
            weapons: {},
            armor: {},
            gear: {},
            species: {}
        };
        return manifestCache;
    });
    return manifestPromise;
}
const TYPE_TO_SECTION = {
    weapon: 'weapons',
    armor: 'armor',
    gear: 'gear',
    species: 'species'
};
const SIZE_REM = {
    sm: '1.5rem',
    md: '3rem',
    lg: '4.5rem'
};
function EquipmentImage({ itemKey, itemType, categories, gearType, size = 'md', className, style }) {
    _s();
    const [imageSrc, setImageSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [useFallback, setUseFallback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loaded, setLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const px = SIZE_REM[size];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EquipmentImage.useEffect": ()=>{
            let cancelled = false;
            loadManifest().then({
                "EquipmentImage.useEffect": (manifest)=>{
                    if (cancelled) return;
                    const section = TYPE_TO_SECTION[itemType];
                    const path = manifest[section]?.[itemKey];
                    if (path) {
                        setImageSrc(path);
                    } else {
                        setUseFallback(true);
                    }
                    setLoaded(true);
                }
            }["EquipmentImage.useEffect"]);
            return ({
                "EquipmentImage.useEffect": ()=>{
                    cancelled = true;
                }
            })["EquipmentImage.useEffect"];
        }
    }["EquipmentImage.useEffect"], [
        itemKey,
        itemType
    ]);
    const containerStyle = {
        width: px,
        height: px,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        ...style
    };
    // Not loaded yet — empty placeholder
    if (!loaded) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: containerStyle,
            className: className
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/ui/EquipmentImage.tsx",
            lineNumber: 90,
            columnNumber: 12
        }, this);
    }
    // Has OggDude PNG image
    if (imageSrc && !useFallback) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: containerStyle,
            className: className,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: imageSrc,
                alt: "",
                onError: ()=>setUseFallback(true),
                style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/ui/EquipmentImage.tsx",
                lineNumber: 97,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/ui/EquipmentImage.tsx",
            lineNumber: 96,
            columnNumber: 7
        }, this);
    }
    // Fallback SVG — render as <img> with currentColor via CSS filter
    if (itemType === 'species') {
        // No fallback for species — show empty
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: containerStyle,
            className: className
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/ui/EquipmentImage.tsx",
            lineNumber: 114,
            columnNumber: 12
        }, this);
    }
    const fallbackName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$equipment$2d$icons$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveFallbackIcon"])(itemType, categories, gearType);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: containerStyle,
        className: className,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: `/images/fallback/${fallbackName}.svg`,
            alt: "",
            style: {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 0.6
            }
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/ui/EquipmentImage.tsx",
            lineNumber: 120,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/ui/EquipmentImage.tsx",
        lineNumber: 119,
        columnNumber: 5
    }, this);
}
_s(EquipmentImage, "ZyP7nV/1T14JV4LAAqCknvTB0zc=");
_c = EquipmentImage;
var _c;
__turbopack_context__.k.register(_c, "EquipmentImage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HolocronLoader",
    ()=>HolocronLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
// Raw hex for use in <style> keyframe strings — CSS vars can't be alpha-suffixed
const ACCENT = '#E03A1E';
const STEPS = [
    'CONNECTING TO HOLONET…',
    'DECRYPTING IMPERIAL RECORDS…',
    'LOADING CHARACTER DATA…',
    'SYNCING FORCE POWERS…',
    'CALIBRATING DICE ENGINE…',
    'HOLOCRON READY…'
];
const STEP_DURATION = 1.8 // seconds per step
;
const TOTAL = STEPS.length * STEP_DURATION // 10.8 s
;
function HolocronLoader() {
    _s();
    const [pct, setPct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [stepIdx, setStepIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HolocronLoader.useEffect": ()=>{
            const start = Date.now();
            const totalMs = TOTAL * 1000;
            const tick = setInterval({
                "HolocronLoader.useEffect.tick": ()=>{
                    const elapsed = Date.now() - start;
                    const progress = Math.min(elapsed / totalMs, 1);
                    setPct(Math.round(progress * 100));
                    setStepIdx(Math.min(Math.floor(elapsed / (STEP_DURATION * 1000)), STEPS.length - 1));
                    if (progress >= 1) clearInterval(tick);
                }
            }["HolocronLoader.useEffect.tick"], 80);
            return ({
                "HolocronLoader.useEffect": ()=>clearInterval(tick)
            })["HolocronLoader.useEffect"];
        }
    }["HolocronLoader.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].bg,
            gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][8],
            position: 'relative',
            overflow: 'hidden'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    opacity: 0.03,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l20 20M40 0L20 20M0 40l20-20M40 40L20 20' stroke='%23A82010' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h1,
                    fontWeight: 700,
                    letterSpacing: '0.55em',
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                    textTransform: 'uppercase',
                    animation: 'holo-pulse 2.4s ease-in-out infinite'
                },
                children: "HOLOCRON"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3],
                    width: '20rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: '100%',
                            height: '0.125rem',
                            background: `${ACCENT}18`,
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                            overflow: 'hidden',
                            position: 'relative'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    background: `linear-gradient(90deg, ${ACCENT}80, ${ACCENT})`,
                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                    boxShadow: `0 0 10px ${ACCENT}60`,
                                    animation: `holo-bar ${TOTAL}s cubic-bezier(0.4, 0, 0.2, 1) forwards`
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: '-60%',
                                    height: '100%',
                                    width: '60%',
                                    background: `linear-gradient(90deg, transparent, ${ACCENT}50, transparent)`,
                                    animation: 'holo-shimmer 1.6s ease-in-out infinite'
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h4,
                            fontWeight: 600,
                            letterSpacing: '0.25em',
                            color: `${ACCENT}CC`,
                            fontVariantNumeric: 'tabular-nums'
                        },
                        children: [
                            "— ",
                            pct,
                            "% —"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                    letterSpacing: '0.2em',
                    color: `${ACCENT}88`,
                    textTransform: 'uppercase',
                    height: '1.25rem',
                    textAlign: 'center',
                    animation: 'holo-fade 0.3s ease forwards'
                },
                children: STEPS[stepIdx]
            }, stepIdx, false, {
                fileName: "[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @keyframes holo-pulse {
          0%, 100% { opacity: 0.7; text-shadow: 0 0 12px ${ACCENT}40; }
          50%       { opacity: 1;   text-shadow: 0 0 28px ${ACCENT}90; }
        }
        @keyframes holo-bar {
          0%   { width: 0% }
          15%  { width: 22% }
          30%  { width: 40% }
          50%  { width: 58% }
          65%  { width: 72% }
          80%  { width: 84% }
          95%  { width: 94% }
          100% { width: 100% }
        }
        @keyframes holo-shimmer {
          0%   { left: -60% }
          100% { left: 110% }
        }
        @keyframes holo-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/ui/HolocronLoader.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(HolocronLoader, "DyruNiAlD5BENHnAb4WMeBMOQvs=");
_c = HolocronLoader;
var _c;
__turbopack_context__.k.register(_c, "HolocronLoader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DestinyPoolDisplay",
    ()=>DestinyPoolDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT_C = 'var(--font-body)';
const FONT_M = 'var(--font-body)';
const DIM = 'var(--hud-text-faint)';
const LIGHT_CLR = '#0EA5E9' // sky-blue — vivid on dark, legible on parchment
;
const DARK_CLR = '#A845F5' // vivid Sith-violet
;
const FS_OVER = 'var(--text-overline)';
const FS_CAP = 'var(--text-caption)';
const MAX_VISIBLE = 10;
const LIGHT_IMG = '/images/factions/LightSymbol.png';
const DARK_IMG = '/images/factions/DarkSymbol.png';
// ── Destiny symbol icon (transparent PNG masked to a colour) ──────────────────
function DestinyIcon({ side, size, color }) {
    const src = side === 'light' ? LIGHT_IMG : DARK_IMG;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            display: 'inline-block',
            flexShrink: 0,
            width: size,
            height: size,
            WebkitMask: `url('${src}') center/contain no-repeat`,
            mask: `url('${src}') center/contain no-repeat`,
            background: color
        }
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_c = DestinyIcon;
// ── Token button ──────────────────────────────────────────────────────────────
function TokenButton({ side, color, canClick, tooltip, onClick }) {
    _s();
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        title: tooltip,
        onClick: canClick ? onClick : undefined,
        onMouseEnter: ()=>setHovered(true),
        onMouseLeave: ()=>setHovered(false),
        style: {
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: `1.5px solid ${canClick ? `${color}70` : `${color}30`}`,
            background: canClick ? `${color}18` : 'transparent',
            cursor: canClick ? 'pointer' : 'not-allowed',
            opacity: canClick ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            flexShrink: 0,
            transition: 'box-shadow .15s, opacity .15s',
            boxShadow: hovered && canClick ? `0 0 10px ${color}70` : 'none'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DestinyIcon, {
            side: side,
            size: 14,
            color: color
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_s(TokenButton, "V8YbV+gTZxGliGj1g0fftBlvsq4=");
_c1 = TokenButton;
function DestinyPoolDisplay({ poolRecord, isGm, onClickLight, onClickDark, compact = false }) {
    if (!poolRecord) {
        if (compact) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                fontFamily: FONT_C,
                fontSize: FS_CAP,
                color: DIM,
                letterSpacing: '0.06em'
            },
            children: "◈ No Destiny Pool · Ask your GM to generate one"
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
            lineNumber: 95,
            columnNumber: 7
        }, this);
    }
    const { light_count, dark_count, session_label } = poolRecord;
    const total = light_count + dark_count;
    const renderTokens = (count, side)=>{
        const color = side === 'light' ? LIGHT_CLR : DARK_CLR;
        const canClick = side === 'light' ? !isGm && !!onClickLight && count > 0 : isGm && !!onClickDark && count > 0;
        const tooltip = side === 'light' ? isGm ? 'Players spend Light Side Destiny Points' : count > 0 ? 'Click to spend a Light Side Destiny Point' : 'No Light Side points' : !isGm ? 'Only the GM can spend Dark Side Destiny Points' : count > 0 ? 'Click to spend a Dark Side Destiny Point' : 'No Dark Side points';
        const visible = Math.min(count, MAX_VISIBLE);
        const overflow = count - MAX_VISIBLE;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                Array.from({
                    length: visible
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TokenButton, {
                        side: side,
                        color: color,
                        canClick: canClick,
                        tooltip: tooltip,
                        onClick: side === 'light' ? onClickLight : onClickDark
                    }, `${side}-${i}`, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this)),
                overflow > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontFamily: FONT_M,
                        fontSize: FS_OVER,
                        color,
                        opacity: 0.7
                    },
                    children: [
                        "+",
                        overflow
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                    lineNumber: 128,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 4
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FONT_C,
                                    fontSize: FS_OVER,
                                    color: LIGHT_CLR,
                                    letterSpacing: '0.1em',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DestinyIcon, {
                                        side: "light",
                                        size: 11,
                                        color: LIGHT_CLR
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                                        lineNumber: 142,
                                        columnNumber: 13
                                    }, this),
                                    light_count
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                                lineNumber: 141,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 3,
                                    alignItems: 'center'
                                },
                                children: renderTokens(light_count, 'light')
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: FONT_M,
                            fontSize: FS_OVER,
                            color: DIM
                        },
                        children: "·"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: FONT_C,
                                    fontSize: FS_OVER,
                                    color: DARK_CLR,
                                    letterSpacing: '0.1em',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DestinyIcon, {
                                        side: "dark",
                                        size: 11,
                                        color: DARK_CLR
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                                        lineNumber: 155,
                                        columnNumber: 13
                                    }, this),
                                    dark_count
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 3,
                                    alignItems: 'center'
                                },
                                children: renderTokens(dark_count, 'dark')
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, this),
            !compact && session_label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: FONT_M,
                    fontSize: FS_OVER,
                    color: 'var(--hud-text-faint)',
                    letterSpacing: '0.06em'
                },
                children: [
                    session_label,
                    " · ",
                    total,
                    " Destiny ",
                    total === 1 ? 'Point' : 'Points'
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
                lineNumber: 166,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyPoolDisplay.tsx",
        lineNumber: 137,
        columnNumber: 5
    }, this);
}
_c2 = DestinyPoolDisplay;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "DestinyIcon");
__turbopack_context__.k.register(_c1, "TokenButton");
__turbopack_context__.k.register(_c2, "DestinyPoolDisplay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DestinyRollModal",
    ()=>DestinyRollModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$forceRoll$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/forceRoll.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/dice-engine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/Modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT_C = 'var(--font-body)';
const FONT_R = 'var(--font-body)';
const FONT_M = 'var(--font-body)';
const GOLD_BD = 'var(--hud-border-hi)';
const GOLD_DIM = 'var(--hud-text-faint)';
const TEXT = 'var(--hud-text)';
const DIM = 'var(--hud-text-faint)';
const BORDER = 'var(--hud-border)';
const LIGHT_CLR = '#1A78A0';
const DARK_CLR = '#8B2BE2';
const BG = 'var(--hud-surface-hi)';
const FS_OVER = 'var(--text-overline)';
const FS_CAP = 'var(--text-caption)';
const FS_LABEL = 'var(--text-label)';
const FS_SM = 'var(--text-sm)';
const FS_H4 = 'var(--text-h4)';
function DestinyRollModal({ poolId, campaignId, characterId, characterName, supabase, onSubmitted }) {
    _s();
    const [lightRolled, setLightRolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [darkRolled, setDarkRolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [manualLight, setManualLight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [manualDark, setManualDark] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [useManual, setUseManual] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [rolling, setRolling] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dieSpinning, setDieSpinning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const hasResult = useManual ? manualLight + manualDark > 0 || manualLight !== null : lightRolled !== null;
    const finalLight = useManual ? manualLight : lightRolled ?? 0;
    const finalDark = useManual ? manualDark : darkRolled ?? 0;
    const handleRoll = ()=>{
        setRolling(true);
        setDieSpinning(true);
        setTimeout(()=>{
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rollForceDice"])(1);
            setLightRolled(result.totalLight);
            setDarkRolled(result.totalDark);
            setUseManual(false);
            setDieSpinning(false);
            setRolling(false);
        }, 600);
    };
    const handleSubmit = async ()=>{
        setBusy(true);
        try {
            // Insert roll record
            await supabase.from('destiny_pool_rolls').insert({
                campaign_id: campaignId,
                pool_id: poolId,
                character_id: characterId,
                character_name: characterName,
                light_rolled: finalLight,
                dark_rolled: finalDark,
                die_result: useManual ? {
                    manual: true
                } : {
                    light: finalLight,
                    dark: finalDark
                }
            });
            // Increment pool totals
            const { data: pool } = await supabase.from('destiny_pool').select('light_count, dark_count').eq('id', poolId).single();
            if (pool) {
                await supabase.from('destiny_pool').update({
                    light_count: pool.light_count + finalLight,
                    dark_count: pool.dark_count + finalDark
                }).eq('id', poolId);
            }
            onSubmitted();
        } finally{
            setBusy(false);
        }
    };
    const modal = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
        open: true,
        maxWidth: 480,
        borderColor: "rgba(126,200,227,0.4)",
        shadow: "0 16px 48px rgba(0,0,0,0.8), 0 0 40px rgba(126,200,227,0.08)",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '18px 24px 14px',
                    borderBottom: `1px solid ${BORDER}`,
                    background: 'rgba(126,200,227,0.04)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: FONT_C,
                            fontSize: FS_H4,
                            fontWeight: 700,
                            color: LIGHT_CLR,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: 6
                        },
                        children: "◈ Destiny Pool Generation"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: FONT_R,
                            fontSize: FS_SM,
                            color: TEXT
                        },
                        children: [
                            "Your GM has started a new Destiny Pool.",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                lineNumber: 120,
                                columnNumber: 52
                            }, this),
                            "Roll your Force die to contribute."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                        lineNumber: 119,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                lineNumber: 111,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'center'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                border: `3px solid ${LIGHT_CLR}60`,
                                background: 'rgba(126,200,227,0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
                                transition: 'transform 600ms ease',
                                transform: dieSpinning ? 'rotate(720deg) scale(1.15)' : 'rotate(0deg) scale(1)'
                            },
                            children: "◯"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                            lineNumber: 128,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, this),
                    lightRolled !== null && !useManual && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '12px 16px',
                            background: 'rgba(126,200,227,0.05)',
                            border: `1px solid rgba(126,200,227,0.25)`,
                            borderRadius: 6,
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_R,
                                    fontSize: FS_CAP,
                                    color: DIM,
                                    marginBottom: 4,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase'
                                },
                                children: "You rolled"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                lineNumber: 149,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_M,
                                            fontSize: FS_SM,
                                            color: LIGHT_CLR
                                        },
                                        children: [
                                            "○ ",
                                            lightRolled,
                                            " light"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                        lineNumber: 153,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_M,
                                            fontSize: FS_SM,
                                            color: DARK_CLR
                                        },
                                        children: [
                                            "● ",
                                            darkRolled,
                                            " dark"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                        lineNumber: 156,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                lineNumber: 152,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                        lineNumber: 143,
                        columnNumber: 13
                    }, this),
                    !useManual && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleRoll,
                        disabled: rolling || busy,
                        style: {
                            fontFamily: FONT_R,
                            fontSize: FS_SM,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            padding: 'clamp(8px, 1.5vh, 12px) 20px',
                            borderRadius: 6,
                            cursor: rolling || busy ? 'wait' : 'pointer',
                            background: 'rgba(126,200,227,0.12)',
                            border: `1px solid rgba(126,200,227,0.4)`,
                            color: LIGHT_CLR,
                            transition: '.15s',
                            opacity: rolling || busy ? 0.6 : 1
                        },
                        children: rolling ? 'Rolling…' : lightRolled !== null ? '🎲 Re-Roll' : '🎲 Roll Force Die'
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                        lineNumber: 165,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    height: 1,
                                    background: BORDER
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                lineNumber: 185,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setUseManual(!useManual),
                                style: {
                                    fontFamily: FONT_R,
                                    fontSize: FS_CAP,
                                    color: DIM,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    letterSpacing: '0.06em'
                                },
                                children: useManual ? 'Use app roll instead' : 'Enter manually'
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                lineNumber: 186,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    height: 1,
                                    background: BORDER
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                lineNumber: 192,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                        lineNumber: 184,
                        columnNumber: 11
                    }, this),
                    useManual && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: 20,
                            justifyContent: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_R,
                                            fontSize: FS_OVER,
                                            fontWeight: 700,
                                            color: LIGHT_CLR,
                                            letterSpacing: '0.12em',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Light pips ○"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                        lineNumber: 199,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: 0,
                                        max: 5,
                                        value: manualLight,
                                        onChange: (e)=>setManualLight(Math.min(5, Math.max(0, parseInt(e.target.value) || 0))),
                                        style: {
                                            width: 64,
                                            textAlign: 'center',
                                            background: 'var(--hud-surface-lo)',
                                            border: `1px solid rgba(126,200,227,0.3)`,
                                            color: LIGHT_CLR,
                                            fontFamily: FONT_M,
                                            fontSize: FS_H4,
                                            padding: '8px 4px',
                                            borderRadius: 4,
                                            outline: 'none'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                        lineNumber: 202,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                lineNumber: 198,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_R,
                                            fontSize: FS_OVER,
                                            fontWeight: 700,
                                            color: DARK_CLR,
                                            letterSpacing: '0.12em',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Dark pips ●"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                        lineNumber: 215,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: 0,
                                        max: 5,
                                        value: manualDark,
                                        onChange: (e)=>setManualDark(Math.min(5, Math.max(0, parseInt(e.target.value) || 0))),
                                        style: {
                                            width: 64,
                                            textAlign: 'center',
                                            background: 'rgba(0,0,0,0.4)',
                                            border: `1px solid rgba(139,43,226,0.3)`,
                                            color: DARK_CLR,
                                            fontFamily: FONT_M,
                                            fontSize: FS_H4,
                                            padding: '8px 4px',
                                            borderRadius: 4,
                                            outline: 'none'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                        lineNumber: 218,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                                lineNumber: 214,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                        lineNumber: 197,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                lineNumber: 125,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '12px 24px 20px',
                    borderTop: `1px solid ${BORDER}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSubmit,
                        disabled: !hasResult || busy,
                        style: {
                            fontFamily: FONT_R,
                            fontSize: FS_SM,
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            padding: 'clamp(9px, 1.5vh, 13px) 24px',
                            borderRadius: 6,
                            cursor: !hasResult || busy ? 'not-allowed' : 'pointer',
                            background: 'var(--hud-surface-lo)',
                            border: `1px solid ${GOLD_BD}`,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            opacity: !hasResult || busy ? 0.4 : 1,
                            transition: '.15s'
                        },
                        children: busy ? 'Submitting…' : 'Submit'
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                        lineNumber: 240,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: FONT_R,
                            fontSize: FS_CAP,
                            color: GOLD_DIM,
                            textAlign: 'center',
                            fontStyle: 'italic'
                        },
                        children: "This roll is mandatory — you must submit a result."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                        lineNumber: 257,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
                lineNumber: 235,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyRollModal.tsx",
        lineNumber: 104,
        columnNumber: 5
    }, this);
    return modal;
}
_s(DestinyRollModal, "AyqP1VEGP0ymhx3ktD0lw6rU9mo=");
_c = DestinyRollModal;
var _c;
__turbopack_context__.k.register(_c, "DestinyRollModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DestinySpendConfirmModal",
    ()=>DestinySpendConfirmModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/Modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT_C = 'var(--font-body)';
const FONT_R = 'var(--font-body)';
const FONT_M = 'var(--font-body)';
const GOLD_BD = 'var(--hud-border-hi)';
const TEXT = 'var(--hud-text)';
const DIM = 'var(--hud-text-faint)';
const BORDER = 'var(--hud-border)';
const LIGHT_CLR = '#1A78A0';
const DARK_CLR = '#8B2BE2';
const WARN = '#E03A1E';
const BG = 'var(--hud-surface-hi)';
const FS_OVER = 'var(--text-overline)';
const FS_CAP = 'var(--text-caption)';
const FS_LABEL = 'var(--text-label)';
const FS_SM = 'var(--text-sm)';
const FS_H4 = 'var(--text-h4)';
function DestinySpendConfirmModal({ pool, characterName, campaignId, characterId, supabase, onClose, onConfirmed }) {
    _s();
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Broadcast "considering" when modal opens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DestinySpendConfirmModal.useEffect": ()=>{
            supabase.channel(`destiny-${campaignId}`).send({
                type: 'broadcast',
                event: 'destiny_considering',
                payload: {
                    characterName
                }
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["DestinySpendConfirmModal.useEffect"], []);
    const handleCancel = ()=>{
        supabase.channel(`destiny-${campaignId}`).send({
            type: 'broadcast',
            event: 'destiny_cancelled',
            payload: {
                characterName
            }
        });
        onClose();
    };
    const handleConfirm = async ()=>{
        if (pool.light_count < 1) return;
        setBusy(true);
        try {
            const newLight = pool.light_count - 1;
            const newDark = pool.dark_count + 1;
            // Update pool counts
            await supabase.from('destiny_pool').update({
                light_count: newLight,
                dark_count: newDark
            }).eq('id', pool.id);
            // Log the spend
            await supabase.from('destiny_spend_log').insert({
                campaign_id: campaignId,
                pool_id: pool.id,
                spent_by: characterName,
                spent_by_id: characterId,
                side_spent: 'light'
            });
            // Broadcast to all
            supabase.channel(`destiny-${campaignId}`).send({
                type: 'broadcast',
                event: 'destiny_spent',
                payload: {
                    characterName,
                    side: 'light',
                    newLightCount: newLight,
                    newDarkCount: newDark
                }
            });
            onConfirmed();
        } finally{
            setBusy(false);
        }
    };
    const afterLight = pool.light_count - 1;
    const afterDark = pool.dark_count + 1;
    const TokenRow = ({ count, color, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: 6
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontFamily: FONT_R,
                        fontSize: FS_CAP,
                        color: DIM,
                        width: 80
                    },
                    children: label
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                    lineNumber: 105,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        gap: 3,
                        flex: 1,
                        flexWrap: 'wrap'
                    },
                    children: [
                        Array.from({
                            length: Math.min(count, 8)
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    background: `${color}30`,
                                    border: `1.5px solid ${color}80`,
                                    display: 'inline-block'
                                }
                            }, i, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this)),
                        count > 8 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: FONT_M,
                                fontSize: FS_CAP,
                                color
                            },
                            children: [
                                " +",
                                count - 8
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                            lineNumber: 110,
                            columnNumber: 23
                        }, this),
                        count === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontFamily: FONT_M,
                                fontSize: FS_CAP,
                                color: DIM
                            },
                            children: "—"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                            lineNumber: 111,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                    lineNumber: 106,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontFamily: FONT_M,
                        fontSize: FS_SM,
                        color,
                        fontWeight: 700,
                        minWidth: 20
                    },
                    children: count
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                    lineNumber: 113,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
            lineNumber: 104,
            columnNumber: 5
        }, this);
    const modal = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
        open: true,
        onClose: handleCancel,
        maxWidth: 500,
        borderColor: "rgba(126,200,227,0.4)",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '18px 24px 14px',
                    borderBottom: `1px solid ${BORDER}`,
                    background: 'rgba(126,200,227,0.03)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: FONT_C,
                        fontSize: FS_H4,
                        fontWeight: 700,
                        color: LIGHT_CLR,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    },
                    children: "◈ Spend Destiny Point?"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                    lineNumber: 130,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                lineNumber: 125,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: FONT_R,
                            fontSize: FS_SM,
                            color: TEXT
                        },
                        children: "You are about to spend a Light Side Destiny Point."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                        lineNumber: 137,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '10px 14px',
                            borderRadius: 6,
                            background: 'rgba(224,58,30,0.06)',
                            border: '1px solid rgba(224,58,30,0.2)'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: FONT_R,
                                fontSize: FS_LABEL,
                                color: WARN,
                                fontStyle: 'italic',
                                lineHeight: 1.5
                            },
                            children: "⚠ This will give the GM a Dark Side Destiny Point to use against the party."
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                            lineNumber: 146,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            padding: '12px 14px',
                            background: 'var(--hud-surface-lo)',
                            borderRadius: 6,
                            border: `1px solid ${BORDER}`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FONT_R,
                                    fontSize: FS_OVER,
                                    fontWeight: 700,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    marginBottom: 4
                                },
                                children: "After spending"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TokenRow, {
                                count: afterLight,
                                color: LIGHT_CLR,
                                label: "Light Side:"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TokenRow, {
                                count: afterDark,
                                color: DARK_CLR,
                                label: "Dark Side:"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: FONT_R,
                            fontSize: FS_CAP,
                            color: DIM,
                            fontStyle: 'italic'
                        },
                        children: "Other players can see this request."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                lineNumber: 136,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '12px 24px 20px',
                    borderTop: `1px solid ${BORDER}`,
                    display: 'flex',
                    gap: 10,
                    justifyContent: 'flex-end'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleCancel,
                        disabled: busy,
                        style: {
                            fontFamily: FONT_R,
                            fontSize: FS_CAP,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            padding: 'clamp(7px, 1.2vh, 10px) 16px',
                            borderRadius: 5,
                            cursor: 'pointer',
                            background: 'transparent',
                            border: `1px solid ${BORDER}`,
                            color: DIM
                        },
                        children: "Cancel — Keep It"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                        lineNumber: 171,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleConfirm,
                        disabled: busy || pool.light_count < 1,
                        style: {
                            fontFamily: FONT_R,
                            fontSize: FS_CAP,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            padding: 'clamp(7px, 1.2vh, 10px) 20px',
                            borderRadius: 5,
                            cursor: busy ? 'wait' : 'pointer',
                            background: 'var(--hud-surface-lo)',
                            border: `1px solid ${GOLD_BD}`,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            opacity: busy || pool.light_count < 1 ? 0.4 : 1,
                            transition: '.15s'
                        },
                        children: busy ? 'Spending…' : 'Spend Destiny Point'
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                        lineNumber: 183,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
                lineNumber: 166,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinySpendConfirmModal.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
    return modal;
}
_s(DestinySpendConfirmModal, "jyqPIKDXdE5g/nNgU+6ZFCXmsvY=");
_c = DestinySpendConfirmModal;
var _c;
__turbopack_context__.k.register(_c, "DestinySpendConfirmModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DestinyConsideringBanner",
    ()=>DestinyConsideringBanner,
    "DestinyGMFlash",
    ()=>DestinyGMFlash
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT_C = 'var(--font-body)';
const FONT_R = 'var(--font-body)';
const FONT_M = 'var(--font-body)';
const DARK_CLR = '#A845F5' // vivid Sith-violet
;
const LIGHT_CLR = '#0EA5E9' // sky-blue — vivid on dark, legible on parchment
;
const LIGHT_IMG = '/images/factions/LightSymbol.png';
const DARK_IMG = '/images/factions/DarkSymbol.png';
const TEXT = 'var(--hud-text)';
const DIM = 'var(--hud-text-faint)';
const FS_OVER = 'var(--text-overline)';
const FS_CAP = 'var(--text-caption)';
const FS_LABEL = 'var(--text-label)';
const FS_SM = 'var(--text-sm)';
const FS_H4 = 'var(--text-h4)';
function DestinyGMFlash({ prevLightCount, prevDarkCount, newLightCount, newDarkCount, onDismiss }) {
    _s();
    const [flashOpacity, setFlashOpacity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [bannerVisible, setBannerVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bannerOut, setBannerOut] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DestinyGMFlash.useEffect": ()=>{
            // Flash: fade out quickly
            const t1 = setTimeout({
                "DestinyGMFlash.useEffect.t1": ()=>setFlashOpacity(0)
            }["DestinyGMFlash.useEffect.t1"], 50);
            // Banner: slide in
            const t2 = setTimeout({
                "DestinyGMFlash.useEffect.t2": ()=>setBannerVisible(true)
            }["DestinyGMFlash.useEffect.t2"], 80);
            // Auto-dismiss after 4 seconds
            const t3 = setTimeout({
                "DestinyGMFlash.useEffect.t3": ()=>{
                    setBannerOut(true);
                    setTimeout(onDismiss, 350);
                }
            }["DestinyGMFlash.useEffect.t3"], 4000);
            return ({
                "DestinyGMFlash.useEffect": ()=>{
                    clearTimeout(t1);
                    clearTimeout(t2);
                    clearTimeout(t3);
                }
            })["DestinyGMFlash.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["DestinyGMFlash.useEffect"], []);
    const TokenDots = ({ count, color, side })=>{
        const src = side === 'light' ? LIGHT_IMG : DARK_IMG;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                display: 'inline-flex',
                gap: 3,
                alignItems: 'center'
            },
            children: [
                Array.from({
                    length: Math.min(count, 6)
                }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            display: 'inline-block',
                            flexShrink: 0,
                            width: 13,
                            height: 13,
                            WebkitMask: `url('${src}') center/contain no-repeat`,
                            mask: `url('${src}') center/contain no-repeat`,
                            background: color
                        }
                    }, i, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                        lineNumber: 60,
                        columnNumber: 11
                    }, this)),
                count > 6 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontFamily: FONT_M,
                        fontSize: FS_OVER,
                        color
                    },
                    children: [
                        "+",
                        count - 6
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                    lineNumber: 68,
                    columnNumber: 23
                }, this),
                count === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontFamily: FONT_M,
                        fontSize: FS_CAP,
                        color: DIM
                    },
                    children: "—"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                    lineNumber: 69,
                    columnNumber: 25
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
            lineNumber: 58,
            columnNumber: 7
        }, this);
    };
    const content = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 990,
                    background: 'rgba(139,43,226,0.18)',
                    pointerEvents: 'none',
                    opacity: flashOpacity,
                    transition: 'opacity 600ms ease-out'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: onDismiss,
                style: {
                    position: 'fixed',
                    top: 0,
                    left: '50%',
                    zIndex: 991,
                    transform: `translateX(-50%) translateY(${bannerVisible && !bannerOut ? '0' : '-110%'})`,
                    transition: 'transform 300ms ease-out, opacity 300ms ease-out',
                    opacity: bannerOut ? 0 : 1,
                    background: 'rgba(139,43,226,0.14)',
                    border: `1px solid rgba(139,43,226,0.55)`,
                    borderTop: 'none',
                    borderRadius: '0 0 10px 10px',
                    padding: 'clamp(12px, 2vh, 18px) clamp(20px, 3vw, 32px)',
                    boxShadow: '0 8px 32px rgba(139,43,226,0.3)',
                    cursor: 'pointer',
                    minWidth: 'clamp(260px, 50vw, 420px)',
                    textAlign: 'center'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: FONT_C,
                            fontSize: FS_H4,
                            fontWeight: 700,
                            color: DARK_CLR,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: 10
                        },
                        children: "⚡ GM Has Used a Destiny Point!"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    justifyContent: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_R,
                                            fontSize: FS_LABEL,
                                            color: DARK_CLR,
                                            fontWeight: 700,
                                            minWidth: 80,
                                            textAlign: 'right'
                                        },
                                        children: "Dark Side:"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                                        lineNumber: 118,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TokenDots, {
                                        count: prevDarkCount,
                                        color: DARK_CLR,
                                        side: "dark"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_M,
                                            fontSize: FS_CAP,
                                            color: DIM
                                        },
                                        children: "→"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TokenDots, {
                                        count: newDarkCount,
                                        color: DARK_CLR,
                                        side: "dark"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    justifyContent: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_R,
                                            fontSize: FS_LABEL,
                                            color: LIGHT_CLR,
                                            fontWeight: 700,
                                            minWidth: 80,
                                            textAlign: 'right'
                                        },
                                        children: "Light Side:"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                                        lineNumber: 126,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TokenDots, {
                                        count: prevLightCount,
                                        color: LIGHT_CLR,
                                        side: "light"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                                        lineNumber: 129,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FONT_M,
                                            fontSize: FS_CAP,
                                            color: DIM
                                        },
                                        children: "→"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                                        lineNumber: 130,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TokenDots, {
                                        count: newLightCount,
                                        color: LIGHT_CLR,
                                        side: "light"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                                        lineNumber: 131,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: FONT_R,
                            fontSize: FS_CAP,
                            color: 'rgba(139,43,226,0.6)',
                            marginTop: 10,
                            letterSpacing: '0.06em'
                        },
                        children: "Tap to dismiss"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(content, document.body);
}
_s(DestinyGMFlash, "jC/DLhKvrVq21iqeJhrK/zK/x8k=");
_c = DestinyGMFlash;
function DestinyConsideringBanner({ characterName, onDismiss }) {
    _s1();
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [out, setOut] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DestinyConsideringBanner.useEffect": ()=>{
            const t1 = setTimeout({
                "DestinyConsideringBanner.useEffect.t1": ()=>setVisible(true)
            }["DestinyConsideringBanner.useEffect.t1"], 30);
            const t2 = setTimeout({
                "DestinyConsideringBanner.useEffect.t2": ()=>{
                    setOut(true);
                    setTimeout(onDismiss, 350);
                }
            }["DestinyConsideringBanner.useEffect.t2"], 10000);
            return ({
                "DestinyConsideringBanner.useEffect": ()=>{
                    clearTimeout(t1);
                    clearTimeout(t2);
                }
            })["DestinyConsideringBanner.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["DestinyConsideringBanner.useEffect"], []);
    const banner = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 300,
            background: 'rgba(126,200,227,0.07)',
            borderBottom: '1px solid rgba(126,200,227,0.22)',
            padding: 'clamp(6px, 1vh, 10px) clamp(12px, 2vw, 20px)',
            transform: `translateY(${visible && !out ? '0' : '-100%'})`,
            transition: 'transform 300ms ease-out, opacity 300ms ease-out',
            opacity: out ? 0 : 1,
            textAlign: 'center'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                fontFamily: FONT_R,
                fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)',
                color: 'var(--hud-text)',
                fontStyle: 'italic',
                letterSpacing: '0.04em'
            },
            children: [
                "⚠ ",
                characterName,
                " is considering spending a Destiny Point"
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
            lineNumber: 174,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/destiny/DestinyGMFlash.tsx",
        lineNumber: 164,
        columnNumber: 5
    }, this);
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(banner, document.body);
}
_s1(DestinyConsideringBanner, "PBVu12jVLsjVdefzpxrSJw/t7mg=");
_c1 = DestinyConsideringBanner;
var _c, _c1;
__turbopack_context__.k.register(_c, "DestinyGMFlash");
__turbopack_context__.k.register(_c1, "DestinyConsideringBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/dice/DiceFace.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DICE_COLORS",
    ()=>DICE_COLORS,
    "DiceFace",
    ()=>DiceFace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
const DICE_COLORS = {
    proficiency: '#C8961A',
    ability: '#4A7A30',
    boost: '#1A78A0',
    challenge: '#C62828',
    difficulty: '#7B1FA2',
    setback: '#455A64',
    force: '#FFFFFF'
};
// Rounded octagon for Proficiency / Challenge (physical d12 shape)
const OCTAGON_PATH = 'M 18.1 4.9 Q 20.6 4.9 22.4 6.7 L 25.3 9.6 Q 27.1 11.4 27.1 13.9 ' + 'L 27.1 18.1 Q 27.1 20.6 25.3 22.4 L 22.4 25.3 Q 20.6 27.1 18.1 27.1 ' + 'L 13.9 27.1 Q 11.4 27.1 9.6 25.3 L 6.7 22.4 Q 4.9 20.6 4.9 18.1 ' + 'L 4.9 13.9 Q 4.9 11.4 6.7 9.6 L 9.6 6.7 Q 11.4 4.9 13.9 4.9 Z';
function DiceFace({ type, size = 32, active = true, dimmed = false, solid = false, style }) {
    const color = DICE_COLORS[type];
    const fill = solid ? color : active ? `${color}28` : `${color}0E`;
    const stroke = active ? color : `${color}70`;
    const sw = size < 16 ? 1 : 1.5;
    let shape;
    if (type === 'proficiency' || type === 'challenge' || type === 'force') {
        shape = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: OCTAGON_PATH,
            fill: fill,
            stroke: stroke,
            strokeWidth: sw
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/dice/DiceFace.tsx",
            lineNumber: 45,
            columnNumber: 13
        }, this);
    } else if (type === 'ability' || type === 'difficulty') {
        shape = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
            points: "16,2 30,16 16,30 2,16",
            fill: fill,
            stroke: stroke,
            strokeWidth: sw
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/dice/DiceFace.tsx",
            lineNumber: 48,
            columnNumber: 7
        }, this);
    } else {
        // boost / setback — rounded square
        shape = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
            x: "3",
            y: "3",
            width: "26",
            height: "26",
            rx: "5",
            fill: fill,
            stroke: stroke,
            strokeWidth: sw
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/dice/DiceFace.tsx",
            lineNumber: 58,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: size,
        height: size,
        viewBox: "0 0 32 32",
        style: {
            flexShrink: 0,
            display: 'block',
            opacity: dimmed ? 0.3 : 1,
            ...style
        },
        children: shape
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/dice/DiceFace.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_c = DiceFace;
var _c;
__turbopack_context__.k.register(_c, "DiceFace");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SpecSelectorList",
    ()=>SpecSelectorList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
// ─────────────────────────────────────────────────────────────────────────────
// SpecSelectorList — shared specialisation search + card list
//
// Used by:
//   • PlayerHUDDesktop  BuySpecButton overlay (in-play purchase)
//   • create/page.tsx   SpecStep additional-spec section (creation)
//
// The caller supplies cost / affordability logic so each context can use its
// own XP formula without duplicating the rendering.
// ─────────────────────────────────────────────────────────────────────────────
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/Tooltip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$TalentTree$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/TalentTree.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$buildTalentTree$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/buildTalentTree.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
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
const FR = 'var(--font-body)';
const FM = 'var(--font-body)';
const BORDER = 'var(--hud-border)';
const BORDER_HI = 'var(--hud-border-hi)';
const TEXT = 'var(--hud-text)';
const DIM = 'var(--hud-text-faint)';
const FAINT = 'var(--hud-text-faint)';
const EDITOR_BG = 'var(--hud-surface-hi)';
const RED = '#E05050';
const SKILL_LABEL = {
    ATHL: 'Athletics',
    BRAWL: 'Brawl',
    MELEE: 'Melee',
    LTSABER: 'Lightsaber',
    RANGLT: 'Ranged (Light)',
    RANGHVY: 'Ranged (Heavy)',
    GUNN: 'Gunnery',
    PILOTPL: 'Piloting (Planetary)',
    PILOTSP: 'Piloting (Space)',
    MECH: 'Mechanics',
    COMP: 'Computers',
    MEDIC: 'Medicine',
    ASTRO: 'Astrogation',
    PERC: 'Perception',
    VIGIL: 'Vigilance',
    COOL: 'Cool',
    DISC: 'Discipline',
    COORD: 'Coordination',
    RESIL: 'Resilience',
    STEALTH: 'Stealth',
    SKUL: 'Skulduggery',
    DECEP: 'Deception',
    CHARM: 'Charm',
    COERC: 'Coercion',
    NEG: 'Negotiation',
    SW: 'Streetwise',
    LEAD: 'Leadership',
    SURV: 'Survival',
    XENOL: 'Xenology',
    LOREI: 'Lore',
    KNOW_CORE: 'Core Worlds',
    KNOW_ED: 'Education',
    KNOW_LORE: 'Lore',
    KNOW_OUT: 'Outer Rim',
    KNOW_UW: 'Underworld',
    KNOW_WAR: 'Warfare',
    KNOW_XEN: 'Xenology'
};
function fmtSkill(key) {
    return SKILL_LABEL[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c)=>c.toUpperCase());
}
function SpecTreePreviewModal({ spec, refTalentMap, onClose }) {
    _s();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SpecTreePreviewModal.useEffect": ()=>{
            setMounted(true);
            requestAnimationFrame({
                "SpecTreePreviewModal.useEffect": ()=>requestAnimationFrame({
                        "SpecTreePreviewModal.useEffect": ()=>setVisible(true)
                    }["SpecTreePreviewModal.useEffect"])
            }["SpecTreePreviewModal.useEffect"]);
        }
    }["SpecTreePreviewModal.useEffect"], []);
    const close = ()=>{
        setVisible(false);
        setTimeout(onClose, 200);
    };
    if (!mounted) return null;
    const treeData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$buildTalentTree$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildTalentTree"])(spec, refTalentMap, new Set());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            zIndex: 700,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.2s'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    flexShrink: 0,
                    background: 'var(--hud-surface-hi)',
                    borderBottom: `1px solid ${BORDER}`
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FR,
                                    fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                                    fontWeight: 700,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                    letterSpacing: '0.06em'
                                },
                                children: spec.name
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: FM,
                                    fontSize: 'clamp(0.62rem, 0.85vw, 0.7rem)',
                                    color: DIM,
                                    marginTop: 3,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase'
                                },
                                children: "Specialization Tree — Preview"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: close,
                        style: {
                            background: 'var(--hud-surface-lo)',
                            border: `1px solid ${BORDER_HI}`,
                            borderRadius: 4,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            fontFamily: FR,
                            fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
                            fontWeight: 700,
                            padding: '5px 14px',
                            cursor: 'pointer',
                            transition: 'background 0.15s'
                        },
                        onMouseEnter: (e)=>{
                            e.currentTarget.style.background = 'var(--hud-surface-mid)';
                        },
                        onMouseLeave: (e)=>{
                            e.currentTarget.style.background = 'var(--hud-surface-lo)';
                        },
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    padding: 'clamp(12px, 2vw, 24px)'
                },
                children: treeData ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$TalentTree$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TalentTree"], {
                    specName: treeData.specName,
                    nodes: treeData.nodes,
                    connections: treeData.connections,
                    previewMode: true
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                    lineNumber: 129,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        textAlign: 'center',
                        padding: '48px 0',
                        fontFamily: FR,
                        fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
                        color: DIM
                    },
                    children: "No talent tree data available for this specialization."
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                    lineNumber: 136,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, this), document.body);
}
_s(SpecTreePreviewModal, "CAhS00pZqEA/78/5LiTucdS/gWo=");
_c = SpecTreePreviewModal;
function SpecDetailPanel({ spec, cost, affordable, onBuy, onClose, refTalentMap }) {
    _s1();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showTree, setShowTree] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SpecDetailPanel.useEffect": ()=>{
            setMounted(true);
            requestAnimationFrame({
                "SpecDetailPanel.useEffect": ()=>requestAnimationFrame({
                        "SpecDetailPanel.useEffect": ()=>setVisible(true)
                    }["SpecDetailPanel.useEffect"])
            }["SpecDetailPanel.useEffect"]);
        }
    }["SpecDetailPanel.useEffect"], []);
    const close = ()=>{
        setVisible(false);
        setTimeout(onClose, 260);
    };
    const buy = ()=>{
        setVisible(false);
        setTimeout(onBuy, 260);
    };
    if (!mounted) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: close,
                style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 600,
                    background: 'rgba(0,0,0,0.35)',
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.26s'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                lineNumber: 187,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 610,
                    width: 'clamp(320px, 42vw, 580px)',
                    background: EDITOR_BG,
                    borderLeft: `1px solid ${BORDER_HI}`,
                    boxShadow: '-8px 0 40px rgba(0,0,0,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: visible ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            padding: '16px 20px',
                            borderBottom: `1px solid ${BORDER}`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: FR,
                                            fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                                            fontWeight: 700,
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                            letterSpacing: '0.06em'
                                        },
                                        children: spec.name
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 216,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginTop: 5,
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: FR,
                                                    fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                                    background: `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 7%, transparent)`,
                                                    border: `1px solid color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 19%, transparent)`,
                                                    borderRadius: 3,
                                                    padding: '1px 7px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em'
                                                },
                                                children: spec.career_key
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                                lineNumber: 223,
                                                columnNumber: 15
                                            }, this),
                                            spec.is_force_sensitive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: FM,
                                                    fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                                                    color: '#7EC8E3',
                                                    background: 'rgba(126,200,227,0.1)',
                                                    border: '1px solid rgba(126,200,227,0.3)',
                                                    borderRadius: 3,
                                                    padding: '1px 7px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em'
                                                },
                                                children: "◈ Force"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                                lineNumber: 233,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 222,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                lineNumber: 215,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: close,
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    color: DIM,
                                    cursor: 'pointer',
                                    fontFamily: FR,
                                    fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
                                    lineHeight: 1,
                                    padding: '2px 4px',
                                    flexShrink: 0
                                },
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                lineNumber: 245,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                        lineNumber: 210,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflowY: 'auto',
                            padding: 'var(--space-4, 20px)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    marginBottom: 16,
                                    background: 'var(--hud-surface-lo)',
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 4,
                                    padding: '8px 12px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FR,
                                            fontSize: 'clamp(0.75rem, 1vw, 0.82rem)',
                                            color: DIM,
                                            flex: 1
                                        },
                                        children: "XP Cost"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 267,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FM,
                                            fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
                                            color: affordable ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : RED,
                                            fontWeight: 700
                                        },
                                        children: [
                                            cost,
                                            " XP"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 273,
                                        columnNumber: 13
                                    }, this),
                                    !affordable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: FR,
                                            fontSize: 'clamp(0.62rem, 0.82vw, 0.68rem)',
                                            color: RED,
                                            background: 'rgba(224,80,80,0.08)',
                                            border: '1px solid rgba(224,80,80,0.28)',
                                            borderRadius: 3,
                                            padding: '1px 7px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em'
                                        },
                                        children: "Cannot Afford"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 281,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                lineNumber: 260,
                                columnNumber: 11
                            }, this),
                            spec.career_skill_keys?.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginBottom: 18
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: FR,
                                            fontSize: 'clamp(0.62rem, 0.85vw, 0.7rem)',
                                            fontWeight: 700,
                                            letterSpacing: '0.16em',
                                            textTransform: 'uppercase',
                                            color: 'var(--hud-text-dim)',
                                            marginBottom: 8
                                        },
                                        children: "Career Skills"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 296,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 6
                                        },
                                        children: spec.career_skill_keys.map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: FR,
                                                    fontSize: 'clamp(0.72rem, 0.95vw, 0.8rem)',
                                                    color: TEXT,
                                                    background: 'var(--hud-surface-lo)',
                                                    border: `1px solid ${BORDER}`,
                                                    borderRadius: 3,
                                                    padding: '2px 9px'
                                                },
                                                children: fmtSkill(k)
                                            }, k, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                                lineNumber: 305,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 303,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                lineNumber: 295,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: FR,
                                            fontSize: 'clamp(0.62rem, 0.85vw, 0.7rem)',
                                            fontWeight: 700,
                                            letterSpacing: '0.16em',
                                            textTransform: 'uppercase',
                                            color: 'var(--hud-text-dim)',
                                            marginBottom: 8
                                        },
                                        children: "Description"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 320,
                                        columnNumber: 13
                                    }, this),
                                    spec.description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: FR,
                                            fontSize: 'clamp(0.8rem, 1.1vw, 0.88rem)',
                                            color: TEXT,
                                            lineHeight: 1.65
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                            text: spec.description
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                            lineNumber: 329,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 328,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: FR,
                                            fontSize: 'clamp(0.8rem, 1.1vw, 0.88rem)',
                                            color: DIM,
                                            fontStyle: 'italic'
                                        },
                                        children: "No description available."
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 332,
                                        columnNumber: 15
                                    }, this),
                                    refTalentMap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowTree(true),
                                        style: {
                                            marginTop: 16,
                                            width: '100%',
                                            background: 'rgba(90,170,224,0.07)',
                                            border: '1px solid rgba(90,170,224,0.3)',
                                            borderRadius: 4,
                                            padding: '9px',
                                            fontFamily: FR,
                                            fontSize: 'clamp(0.78rem, 1.05vw, 0.88rem)',
                                            fontWeight: 700,
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: '#7EC8E3',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s'
                                        },
                                        onMouseEnter: (e)=>{
                                            e.currentTarget.style.background = 'rgba(90,170,224,0.14)';
                                        },
                                        onMouseLeave: (e)=>{
                                            e.currentTarget.style.background = 'rgba(90,170,224,0.07)';
                                        },
                                        children: "Preview Spec Tree"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                        lineNumber: 342,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                lineNumber: 319,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                        lineNumber: 257,
                        columnNumber: 9
                    }, this),
                    affordable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '12px 20px',
                            borderTop: `1px solid ${BORDER}`
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: buy,
                            style: {
                                width: '100%',
                                background: 'var(--hud-surface-lo)',
                                border: `1px solid color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 33%, transparent)`,
                                borderRadius: 4,
                                padding: '10px',
                                fontFamily: FR,
                                fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
                                fontWeight: 700,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                cursor: 'pointer',
                                transition: 'background 0.15s'
                            },
                            onMouseEnter: (e)=>{
                                e.currentTarget.style.background = 'var(--hud-surface-mid)';
                            },
                            onMouseLeave: (e)=>{
                                e.currentTarget.style.background = 'var(--hud-surface-lo)';
                            },
                            children: [
                                "Buy Specialization — ",
                                cost,
                                " XP"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                            lineNumber: 366,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                        lineNumber: 365,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, this),
            showTree && refTalentMap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SpecTreePreviewModal, {
                spec: spec,
                refTalentMap: refTalentMap,
                onClose: ()=>setShowTree(false)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                lineNumber: 389,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true), document.body);
}
_s1(SpecDetailPanel, "NP4eM4SesLpJQgoJrGL/e+Eg0P4=");
_c1 = SpecDetailPanel;
function SpecSelectorList({ refSpecs, ownedKeys, careerKey, getSpecCost, canAfford, onSelect, searchPlaceholder = 'Search specializations…', autoFocus = false, refTalentMap }) {
    _s2();
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedSpec, setSelectedSpec] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const available = refSpecs.filter((s)=>!ownedKeys.has(s.key) && s.talent_tree?.rows?.length).sort((a, b)=>{
        const ac = a.career_key === careerKey ? 0 : 1;
        const bc = b.career_key === careerKey ? 0 : 1;
        return ac !== bc ? ac - bc : a.name.localeCompare(b.name);
    });
    const filtered = search ? available.filter((s)=>s.name.toLowerCase().includes(search.toLowerCase())) : available;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            flex: 1,
            minHeight: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                placeholder: searchPlaceholder,
                value: search,
                onChange: (e)=>setSearch(e.target.value),
                autoFocus: autoFocus,
                style: {
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '7px 10px',
                    background: 'var(--hud-surface-lo)',
                    border: `1px solid ${BORDER}`,
                    borderRadius: 4,
                    fontFamily: FR,
                    fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
                    color: TEXT,
                    outline: 'none'
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                lineNumber: 452,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    overflowY: 'auto',
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                },
                children: [
                    filtered.map((spec)=>{
                        const isCareer = spec.career_key === careerKey;
                        const cost = getSpecCost(spec);
                        const affordable = canAfford(spec);
                        const btn = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setSelectedSpec(spec),
                            style: {
                                width: '100%',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                background: isCareer ? 'var(--hud-surface-lo)' : 'transparent',
                                border: `1px solid ${isCareer ? `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 19%, transparent)` : BORDER}`,
                                borderRadius: 4,
                                cursor: 'pointer',
                                transition: 'border-color 0.15s, background 0.15s'
                            },
                            onMouseEnter: (e)=>{
                                const el = e.currentTarget;
                                el.style.background = isCareer ? 'var(--hud-surface-mid)' : 'var(--hud-surface-lo)';
                                el.style.borderColor = isCareer ? `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 33%, transparent)` : `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 15%, transparent)`;
                            },
                            onMouseLeave: (e)=>{
                                const el = e.currentTarget;
                                el.style.background = isCareer ? 'var(--hud-surface-lo)' : 'transparent';
                                el.style.borderColor = isCareer ? `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 19%, transparent)` : BORDER;
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        minWidth: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontFamily: FR,
                                                fontSize: 'clamp(0.85rem, 1.15vw, 0.95rem)',
                                                fontWeight: 700,
                                                color: TEXT,
                                                letterSpacing: '0.04em',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            },
                                            children: spec.name
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                            lineNumber: 508,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                marginTop: 2
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: FR,
                                                        fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                                                        color: isCareer ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : FAINT,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.1em'
                                                    },
                                                    children: isCareer ? '★ Career' : spec.career_key
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                                    lineNumber: 521,
                                                    columnNumber: 19
                                                }, this),
                                                spec.is_force_sensitive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontFamily: FM,
                                                        fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
                                                        color: '#7EC8E3',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.1em'
                                                    },
                                                    children: "◈ Force"
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                                    lineNumber: 531,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                            lineNumber: 520,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                    lineNumber: 507,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontFamily: FM,
                                        fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
                                        color: affordable ? 'var(--hud-text-dim)' : RED,
                                        whiteSpace: 'nowrap',
                                        marginLeft: 12,
                                        flexShrink: 0
                                    },
                                    children: [
                                        cost,
                                        " XP"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                    lineNumber: 545,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                            lineNumber: 480,
                            columnNumber: 13
                        }, this);
                        if (!affordable) {
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$Tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TipBody"], {
                                    children: "Cannot afford new spec"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                    lineNumber: 562,
                                    columnNumber: 26
                                }, void 0),
                                placement: "top",
                                maxWidth: 200,
                                children: btn
                            }, spec.key, false, {
                                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                                lineNumber: 560,
                                columnNumber: 15
                            }, this);
                        }
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: btn
                        }, spec.key, false, {
                            fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                            lineNumber: 572,
                            columnNumber: 13
                        }, this);
                    }),
                    filtered.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center',
                            padding: '24px 0',
                            fontFamily: FR,
                            fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)',
                            color: FAINT
                        },
                        children: "No specializations found."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                        lineNumber: 579,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                lineNumber: 473,
                columnNumber: 7
            }, this),
            selectedSpec && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SpecDetailPanel, {
                spec: selectedSpec,
                cost: getSpecCost(selectedSpec),
                affordable: canAfford(selectedSpec),
                onBuy: ()=>{
                    onSelect(selectedSpec);
                    setSelectedSpec(null);
                },
                onClose: ()=>setSelectedSpec(null),
                refTalentMap: refTalentMap
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
                lineNumber: 593,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/shared/SpecSelectorList.tsx",
        lineNumber: 450,
        columnNumber: 5
    }, this);
}
_s2(SpecSelectorList, "PLxQIuprsJejQwO4wWBOKBB8zVM=");
_c2 = SpecSelectorList;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "SpecTreePreviewModal");
__turbopack_context__.k.register(_c1, "SpecDetailPanel");
__turbopack_context__.k.register(_c2, "SpecSelectorList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TalentsPanel",
    ()=>TalentsPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/design-tokens.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript) <export HUD as C>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript) <export FONT as FONT_CINZEL>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript) <export FONT as FONT_RAJDHANI>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$PanelSearchInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/PanelSearchInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// ── Placeholder data ──────────────────────────────────────────────────────────
const STATIC_TALENTS = [
    {
        id: 'toughened',
        name: 'Toughened',
        activation: 'Passive',
        ranked: true,
        rank: 2,
        description: 'Increase wound threshold by 2 per rank.',
        statBonus: {
            stat: 'Wound Threshold',
            value: 4
        }
    },
    {
        id: 'enduring',
        name: 'Enduring',
        activation: 'Passive',
        ranked: true,
        rank: 1,
        description: 'Increase soak value by 1 per rank.',
        statBonus: {
            stat: 'Soak',
            value: 1
        }
    },
    {
        id: 'grit',
        name: 'Grit',
        activation: 'Passive',
        ranked: true,
        rank: 1,
        description: 'Increase strain threshold by 1 per rank.',
        statBonus: {
            stat: 'Strain Threshold',
            value: 1
        }
    },
    {
        id: 'barrage',
        name: 'Barrage',
        activation: 'Passive',
        ranked: true,
        rank: 2,
        description: 'Add +1 damage per rank to ranged attacks at Long or Extreme range.'
    },
    {
        id: 'quick-strike',
        name: 'Quick Strike',
        activation: 'Passive',
        ranked: true,
        rank: 2,
        description: 'Add one Boost die per rank to combat checks against targets who have not yet acted this encounter.'
    },
    {
        id: 'second-wind',
        name: 'Second Wind',
        activation: 'Incidental',
        ranked: true,
        rank: 1,
        description: 'Once per encounter, recover strain equal to ranks in Second Wind.'
    },
    {
        id: 'nat-marks',
        name: 'Natural Marksman',
        activation: 'Incidental',
        ranked: false,
        description: 'Once per session, reroll any one Ranged (Heavy) or Ranged (Light) check.'
    },
    {
        id: 'prec-aim',
        name: 'Precise Aim',
        activation: 'Maneuver',
        ranked: true,
        rank: 1,
        description: 'Spend a maneuver to reduce the penalty from Called Shot by 1 per rank.'
    },
    {
        id: 'take-cover',
        name: 'Take Cover',
        activation: 'Maneuver',
        ranked: false,
        description: 'Spend a maneuver to gain cover (+1 Ranged Defense) until start of your next turn.'
    },
    {
        id: 'supp-fire',
        name: 'Suppressive Fire',
        activation: 'Action',
        ranked: false,
        description: 'Make a ranged attack; add Disorient 2 to all enemies engaged with the primary target.'
    },
    {
        id: 'field-cmd',
        name: 'Field Commander',
        activation: 'Action',
        ranked: false,
        description: 'Average Leadership check; allies equal to Presence may use your Initiative slot.'
    },
    {
        id: 'rapid-react',
        name: 'Rapid Reaction',
        activation: 'Out of Turn',
        ranked: true,
        rank: 1,
        description: 'When an enemy acts, suffer 1 strain to add 2 successes to your next Initiative result.'
    },
    {
        id: 'dodge',
        name: 'Dodge',
        activation: 'Out of Turn',
        ranked: true,
        rank: 1,
        description: 'When targeted by a combat check, suffer strain up to Dodge rank to upgrade difficulty by that amount.'
    },
    {
        id: 'return-fire',
        name: 'Return Fire',
        activation: 'Out of Turn',
        ranked: false,
        description: 'Once per encounter, make a free ranged attack against an attacker immediately after being targeted.'
    }
];
const TABS = [
    {
        key: 'Passive',
        label: 'Passive'
    },
    {
        key: 'Incidental',
        label: 'Incidental'
    },
    {
        key: 'Maneuver',
        label: 'Maneuver'
    },
    {
        key: 'Action',
        label: 'Action'
    },
    {
        key: 'Out of Turn',
        label: '⚡ OOT',
        special: true
    }
];
// ── Activation type → accent color ───────────────────────────────────────────
const ACTIVATION_COLOR = {
    'Passive': __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
    'Incidental': '#5AAAE0',
    'Maneuver': '#4EC87A',
    'Action': __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
    'Out of Turn': '#D87060'
};
// ── Known passive stat bonuses ────────────────────────────────────────────────
const PASSIVE_STAT_BONUSES = {
    'Toughened': (rank)=>({
            stat: 'Wound Threshold',
            value: rank * 2
        }),
    'Enduring': (rank)=>({
            stat: 'Soak',
            value: rank
        }),
    'Grit': (rank)=>({
            stat: 'Strain Threshold',
            value: rank
        }),
    'Dedication': (rank)=>({
            stat: 'Characteristic',
            value: rank
        })
};
function mapActivation(raw) {
    if (raw === 'Incidental (OOT)') return 'Out of Turn';
    if ([
        'Passive',
        'Incidental',
        'Maneuver',
        'Action',
        'Out of Turn'
    ].includes(raw)) return raw;
    return 'Passive';
}
function toWfTalent(t) {
    const activation = mapActivation(t.activation);
    const fn = PASSIVE_STAT_BONUSES[t.name];
    const statBonus = activation === 'Passive' && fn != null && t.rank > 0 ? fn(t.rank) : undefined;
    return {
        id: t.key,
        name: t.name,
        activation,
        ranked: t.rank > 1,
        rank: t.rank > 0 ? t.rank : undefined,
        description: t.description || 'No description available.',
        statBonus
    };
}
// ── Talent card ───────────────────────────────────────────────────────────────
function TalentCard({ t }) {
    const color = ACTIVATION_COLOR[t.activation];
    const isOOT = t.activation === 'Out of Turn';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["panelBase"],
            borderLeft: `2px solid ${color}60`,
            padding: '10px 12px',
            ...isOOT ? {
                borderStyle: 'solid',
                borderColor: `${color}50`
            } : {}
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 6
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_LABEL"],
                            fontWeight: 600,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].text,
                            lineHeight: 1.2
                        },
                        children: t.name
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            flexShrink: 0
                        },
                        children: [
                            t.ranked && t.rank !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontWeight: 700,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_LABEL"],
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                    border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                                    borderRadius: 2,
                                    padding: '1px 4px'
                                },
                                children: [
                                    "RANK ",
                                    t.rank
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontWeight: 700,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_LABEL"],
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color,
                                    border: `1px solid ${color}40`,
                                    borderRadius: 2,
                                    padding: '1px 4px',
                                    background: `${color}10`
                                },
                                children: t.activation.toUpperCase()
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                lineNumber: 121,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                    lineHeight: 1.45
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                    text: t.description
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            t.statBonus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    borderLeft: `2px solid color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 25%, transparent)`,
                    paddingLeft: 6,
                    marginTop: 6,
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim
                },
                children: [
                    "↑ ",
                    t.statBonus.stat,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        style: {
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold
                        },
                        children: [
                            "+",
                            t.statBonus.value
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 135,
                        columnNumber: 32
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                lineNumber: 134,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
        lineNumber: 104,
        columnNumber: 5
    }, this);
}
_c = TalentCard;
function TalentsPanel({ liveTalents, characterName, characterId }) {
    _s();
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Passive');
    const [talentSearch, setTalentSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Reset search when character changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TalentsPanel.useEffect": ()=>{
            setTalentSearch('');
        }
    }["TalentsPanel.useEffect"], [
        characterId
    ]);
    const TALENTS = liveTalents ? liveTalents.map(toWfTalent) : STATIC_TALENTS;
    const passiveBonuses = TALENTS.filter((t)=>t.activation === 'Passive' && t.statBonus).map((t)=>`+${t.statBonus.value} ${t.statBonus.stat} (${t.name})`);
    const searchQuery = talentSearch.toLowerCase().trim();
    // When searching: show all matching talents flat (bypass tab filter)
    // When not searching: apply tab filter as before
    const filtered = searchQuery ? TALENTS.filter((t)=>t.name.toLowerCase().includes(searchQuery) || t.description.toLowerCase().includes(searchQuery) || t.activation.toLowerCase().includes(searchQuery)) : TALENTS.filter((t)=>t.activation === tab);
    const counts = Object.fromEntries(TABS.map((t)=>[
            t.key,
            TALENTS.filter((x)=>x.activation === t.key).length
        ]));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["panelBase"],
            overflow: 'hidden'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '8px 14px',
                    borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                            fontWeight: 700,
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                            marginBottom: 2
                        },
                        children: "TALENTS — QUICK REFERENCE"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_LABEL"],
                            fontWeight: 600,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold
                        },
                        children: [
                            (characterName ?? 'KIRA VOSS').toUpperCase(),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                    marginLeft: 8,
                                    fontWeight: 400,
                                    letterSpacing: '0.05em'
                                },
                                children: [
                                    TALENTS.length,
                                    " talents · ",
                                    passiveBonuses.length,
                                    " passive bonuses"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                lineNumber: 187,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 185,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                lineNumber: 181,
                columnNumber: 7
            }, this),
            !searchQuery && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                    overflowX: 'auto'
                },
                children: TABS.map(({ key, label, special })=>{
                    const active = tab === key;
                    const color = ACTIVATION_COLOR[key];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setTab(key),
                        style: {
                            flex: 1,
                            minWidth: 'fit-content',
                            whiteSpace: 'nowrap',
                            padding: '7px 10px',
                            background: active ? `${color}18` : 'transparent',
                            borderRight: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                            borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
                            cursor: 'pointer',
                            transition: '.15s',
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                            fontWeight: 700,
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: active ? color : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                            ...special && !active ? {
                                borderBottom: `2px dashed ${color}50`
                            } : {}
                        },
                        children: [
                            label,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    marginLeft: 4,
                                    opacity: 0.6
                                },
                                children: [
                                    "(",
                                    counts[key],
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                lineNumber: 217,
                                columnNumber: 17
                            }, this)
                        ]
                    }, key, true, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 200,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                lineNumber: 195,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$PanelSearchInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PanelSearchInput"], {
                        value: talentSearch,
                        onChange: setTalentSearch,
                        placeholder: "Search talents..."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 227,
                        columnNumber: 9
                    }, this),
                    !searchQuery && tab === 'Passive' && passiveBonuses.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 3%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold} 19%, transparent)`,
                            borderRadius: 4,
                            padding: '7px 10px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontWeight: 700,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].gold,
                                    marginBottom: 4
                                },
                                children: "■ Passive Bonuses Applied"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                lineNumber: 236,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                    lineHeight: 1.4
                                },
                                children: passiveBonuses.join('  ·  ')
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                lineNumber: 239,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 235,
                        columnNumber: 11
                    }, this),
                    !searchQuery && tab === 'Out of Turn' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'rgba(216,112,96,0.08)',
                            border: '1px dashed rgba(216,112,96,0.4)',
                            borderRadius: 4,
                            padding: '7px 10px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_CINZEL$3e$__["FONT_CINZEL"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    color: '#D87060',
                                    marginBottom: 4
                                },
                                children: "⚡ REACTION WINDOW"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                lineNumber: 248,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_CAPTION"],
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textDim,
                                    lineHeight: 1.45
                                },
                                children: [
                                    "These talents activate on ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        style: {
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].text
                                        },
                                        children: "other players' turns"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                        lineNumber: 252,
                                        columnNumber: 41
                                    }, this),
                                    ". Watch the combat order and be ready to trigger them when opponents act."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                lineNumber: 251,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 247,
                        columnNumber: 11
                    }, this),
                    filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center',
                            padding: '28px 16px'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_LABEL"],
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].textFaint,
                                fontStyle: 'italic'
                            },
                            children: searchQuery ? `No talents matching \u201c${talentSearch}\u201d` : 'No talents in this category'
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                            lineNumber: 260,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 259,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 8
                        },
                        children: filtered.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TalentCard, {
                                t: t
                            }, t.id, false, {
                                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                lineNumber: 266,
                                columnNumber: 32
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 265,
                        columnNumber: 11
                    }, this),
                    !searchQuery && filtered.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            borderTop: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__HUD__as__C$3e$__["C"].border}`,
                            paddingTop: 8,
                            display: 'flex',
                            gap: 12,
                            flexWrap: 'wrap'
                        },
                        children: TABS.map(({ key, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__FONT__as__FONT_RAJDHANI$3e$__["FONT_RAJDHANI"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FS_OVERLINE"],
                                    color: ACTIVATION_COLOR[key],
                                    letterSpacing: '0.06em'
                                },
                                children: label
                            }, key, false, {
                                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                                lineNumber: 274,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                        lineNumber: 272,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
                lineNumber: 224,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/wireframe/TalentsPanel.tsx",
        lineNumber: 178,
        columnNumber: 5
    }, this);
}
_s(TalentsPanel, "+6rhRhv1t0KU00phQZl/m0Lzo4c=");
_c1 = TalentsPanel;
var _c, _c1;
__turbopack_context__.k.register(_c, "TalentCard");
__turbopack_context__.k.register(_c1, "TalentsPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/map/MapCanvas.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MapCanvas",
    ()=>MapCanvas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$mapWipe$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/mapWipe.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokenHover$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokenHover.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// Pixi.js v7 — loaded dynamically to avoid SSR issues
let PIXI = null;
const BORDER_COLOURS = {
    pc: 0xC8AA50,
    allied_npc: 0x5AAAE0,
    minion: 0xE05252,
    rival: 0xFF9800,
    nemesis: 0x9060D0,
    enemy: 0xE05252
};
const POINTER_COLOURS = {
    pointer_green: 0x22c55e,
    pointer_red: 0xef4444,
    pointer_orange: 0xf97316
};
const MapCanvas = /*#__PURE__*/ _s((0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(_c = _s(function MapCanvas({ mapImageUrl, tokens, isGM, currentCharacterId, onTokenMove, gridEnabled, gridSize, onTokenContextMenu, tokenScale = 1, initialScale = 1, bottomOverlayRef, onTokenHover, onTokenHoverEnd, onTokenDragStart, onTokenDragEnd }) {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const appRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const tokensRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const draggingTokenIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const wipeInProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Map image bounds within the canvas (updated by rebuildMap)
    const mapWRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(800);
    const mapHRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(600);
    const mapOffsetXRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const mapOffsetYRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    // Always-current props ref — the async init closure reads this after it resolves
    const propsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        mapImageUrl,
        gridEnabled,
        gridSize,
        tokens,
        isGM,
        currentCharacterId,
        tokenScale
    });
    propsRef.current = {
        mapImageUrl,
        gridEnabled,
        gridSize,
        tokens,
        isGM,
        currentCharacterId,
        tokenScale
    };
    const onTokenHoverRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onTokenHover);
    onTokenHoverRef.current = onTokenHover;
    const onTokenHoverEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onTokenHoverEnd);
    onTokenHoverEndRef.current = onTokenHoverEnd;
    const onTokenDragStartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onTokenDragStart);
    onTokenDragStartRef.current = onTokenDragStart;
    const onTokenDragEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onTokenDragEnd);
    onTokenDragEndRef.current = onTokenDragEnd;
    // ── Pixi bootstrap ──────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapCanvas.MapCanvas.useEffect": ()=>{
            if (!containerRef.current) return;
            let destroyed = false;
            __turbopack_context__.A("[project]/star-wars-rpg/node_modules/pixi.js/lib/index.mjs [app-client] (ecmascript, async loader)").then({
                "MapCanvas.MapCanvas.useEffect": async (px)=>{
                    if (destroyed || !containerRef.current) return;
                    PIXI = px;
                    const app = new px.Application({
                        resizeTo: containerRef.current,
                        backgroundColor: 0x060D09,
                        antialias: true,
                        resolution: window.devicePixelRatio || 1,
                        autoDensity: true
                    });
                    containerRef.current.appendChild(app.view);
                    appRef.current = app;
                    app.stage.sortableChildren = true;
                    setupPan(app);
                    setupZoom(app, containerRef.current);
                    // Await rebuildMap so map dimensions are set before syncing tokens.
                    // The sync effect already fired once (when app was null) and won't
                    // re-fire unless tokens change — so we sync explicitly here.
                    const { mapImageUrl: url, gridEnabled: ge, gridSize: gs } = propsRef.current;
                    if (url) {
                        await rebuildMap(app, px, url, ge, gs, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef);
                        if (initialScale !== 1) {
                            app.stage.scale.set(initialScale);
                            const cw = app.screen.width;
                            const ch = app.screen.height;
                            // Re-centre: at scale < 1 the stage origin drifts; shift by the
                            // gap that opens up on each side so the map stays centred in the
                            // visible area. If a bottom overlay (e.g. initiative strip) is
                            // present, its rendered height shifts the vertical centre upward.
                            const overlayH = bottomOverlayRef?.current?.offsetHeight ?? 0;
                            app.stage.x = cw * (1 - initialScale) / 2;
                            app.stage.y = ch * (1 - initialScale) / 2 - overlayH / 2;
                        }
                    }
                    if (!destroyed) {
                        const { tokens: t, isGM: gm, currentCharacterId: cid, tokenScale: ts } = propsRef.current;
                        syncTokens(app, px, t, gm, cid, onTokenMoveRef, onContextRef, onTokenHoverRef, onTokenHoverEndRef, onTokenDragStartRef, onTokenDragEndRef, containerRef, tokensRef, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef, draggingTokenIdRef, ts);
                    }
                }
            }["MapCanvas.MapCanvas.useEffect"]);
            return ({
                "MapCanvas.MapCanvas.useEffect": ()=>{
                    destroyed = true;
                    const app = appRef.current;
                    if (app) {
                        app.destroy(true, {
                            children: true,
                            texture: true
                        });
                        appRef.current = null;
                    }
                    tokensRef.current.clear();
                }
            })["MapCanvas.MapCanvas.useEffect"];
        }
    }["MapCanvas.MapCanvas.useEffect"], []); // eslint-disable-line react-hooks/exhaustive-deps
    // ── Rebuild when props change (Pixi already initialised) ────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapCanvas.MapCanvas.useEffect": ()=>{
            const app = appRef.current;
            if (!app || !PIXI || !mapImageUrl) return;
            rebuildMap(app, PIXI, mapImageUrl, gridEnabled, gridSize, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef, wipeInProgress);
        }
    }["MapCanvas.MapCanvas.useEffect"], [
        mapImageUrl,
        gridEnabled,
        gridSize
    ]);
    // ── Sync tokens ─────────────────────────────────────────────
    const onTokenMoveRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onTokenMove);
    onTokenMoveRef.current = onTokenMove;
    const onContextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onTokenContextMenu);
    onContextRef.current = onTokenContextMenu;
    // Delta sync: skip full sweep when only positions/visibility changed
    const prevTokensMapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const prevScaleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(tokenScale);
    const syncTokensCb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MapCanvas.MapCanvas.useCallback[syncTokensCb]": ()=>{
            const app = appRef.current;
            if (!app || !PIXI) return;
            const prevMap = prevTokensMapRef.current;
            const scaleChanged = tokenScale !== prevScaleRef.current;
            prevScaleRef.current = tokenScale;
            // Fast path: same token IDs + same image URLs → direct property updates only
            let fastPath = tokens.length === prevMap.size;
            if (fastPath) {
                for (const t of tokens){
                    const p = prevMap.get(t.id);
                    if (!p || (t.token_image_url ?? null) !== (p.token_image_url ?? null)) {
                        fastPath = false;
                        break;
                    }
                }
            }
            if (fastPath) {
                for (const token of tokens){
                    const c = tokensRef.current.get(token.id);
                    if (!c) continue;
                    if (draggingTokenIdRef.current !== token.id) {
                        const p = prevMap.get(token.id);
                        if (token.x !== p.x || token.y !== p.y) {
                            c.x = mapOffsetXRef.current + token.x * mapWRef.current;
                            c.y = mapOffsetYRef.current + token.y * mapHRef.current;
                        }
                    }
                    if (scaleChanged) {
                        // Only reset scale if not hovering (hover animation manages scale)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if (!c._hoverActive) {
                            c.scale.set(tokenScale);
                        }
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ;
                        c.__applyLabelScale?.(tokenScale);
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ;
                    c.alpha = !isGM && !token.is_visible ? 0 : isGM && !token.is_visible ? 0.4 : 1;
                    prevMap.set(token.id, token);
                }
                return;
            }
            // Slow path: rebuild map and do full sync (token added/removed/image changed)
            prevTokensMapRef.current = new Map(tokens.map({
                "MapCanvas.MapCanvas.useCallback[syncTokensCb]": (t)=>[
                        t.id,
                        t
                    ]
            }["MapCanvas.MapCanvas.useCallback[syncTokensCb]"]));
            syncTokens(app, PIXI, tokens, isGM, currentCharacterId, onTokenMoveRef, onContextRef, onTokenHoverRef, onTokenHoverEndRef, onTokenDragStartRef, onTokenDragEndRef, containerRef, tokensRef, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef, draggingTokenIdRef, tokenScale);
        }
    }["MapCanvas.MapCanvas.useCallback[syncTokensCb]"], [
        tokens,
        isGM,
        currentCharacterId,
        tokenScale
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapCanvas.MapCanvas.useEffect": ()=>{
            syncTokensCb();
        }
    }["MapCanvas.MapCanvas.useEffect"], [
        syncTokensCb
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        style: {
            width: '100%',
            height: '100%',
            cursor: 'grab',
            overflow: 'hidden'
        }
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/map/MapCanvas.tsx",
        lineNumber: 215,
        columnNumber: 5
    }, this);
}, "OLbKewtYVZxLn9LUu/Of0g8m7Cs=")), "OLbKewtYVZxLn9LUu/Of0g8m7Cs=");
_c1 = MapCanvas;
// ── Pan ──────────────────────────────────────────────────────
function setupPan(app) {
    let panning = false;
    let panStart = {
        x: 0,
        y: 0
    };
    let stageStart = {
        x: 0,
        y: 0
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stage = app.stage;
    stage.eventMode = 'static';
    stage.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
    stage.on('pointerdown', (e)=>{
        const tname = e.target?.name ?? '';
        if (tname === '' || tname === 'mapBg' || tname === 'grid') {
            panning = true;
            panStart = {
                x: e.globalX,
                y: e.globalY
            };
            stageStart = {
                x: app.stage.x,
                y: app.stage.y
            };
        }
    });
    stage.on('pointermove', (e)=>{
        if (!panning) return;
        app.stage.x = stageStart.x + (e.globalX - panStart.x);
        app.stage.y = stageStart.y + (e.globalY - panStart.y);
    });
    const stopPan = ()=>{
        panning = false;
    };
    stage.on('pointerup', stopPan);
    stage.on('pointerupoutside', stopPan);
}
// ── Zoom ──────────────────────────────────────────────────────
function setupZoom(app, el) {
    el.addEventListener('wheel', (e)=>{
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(4, Math.max(0.25, app.stage.scale.x * factor));
        const rect = app.view.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldX = (mouseX - app.stage.x) / app.stage.scale.x;
        const worldY = (mouseY - app.stage.y) / app.stage.scale.y;
        app.stage.scale.set(newScale);
        app.stage.x = mouseX - worldX * newScale;
        app.stage.y = mouseY - worldY * newScale;
    }, {
        passive: false
    });
}
// ── Rebuild map background + grid ────────────────────────────
// Scales the image with Math.min (contain) so aspect ratio is preserved,
// then centres it. mapWRef/mapHRef track the rendered image dimensions;
// mapOffsetXRef/mapOffsetYRef track the top-left corner position within
// the canvas. Token normalised coords (0-1) are relative to the image bounds.
async function rebuildMap(app, px, imageUrl, gridEnabled, gridSize, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef, wipeInProgressRef) {
    // Check if there is a previous map to wipe from
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hadPreviousMap = app.stage.children.some((c)=>c.name === 'mapBg');
    // Remove old bg/grid layers
    const toRemove = app.stage.children.filter(// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c)=>c.name === 'mapBg' || c.name === 'grid');
    toRemove.forEach((c)=>app.stage.removeChild(c));
    // Skip wipe on first load (no previous map)
    if (!hadPreviousMap || !wipeInProgressRef) {
        const cw = app.screen.width;
        const ch = app.screen.height;
        try {
            const texture = await px.Assets.load(imageUrl);
            const scaleX = cw / texture.width;
            const scaleY = ch / texture.height;
            const scale = Math.min(scaleX, scaleY);
            const mapW = Math.round(texture.width * scale);
            const mapH = Math.round(texture.height * scale);
            const offsetX = Math.round((cw - mapW) / 2);
            const offsetY = Math.round((ch - mapH) / 2);
            mapWRef.current = mapW;
            mapHRef.current = mapH;
            mapOffsetXRef.current = offsetX;
            mapOffsetYRef.current = offsetY;
            const bg = new px.Sprite(texture);
            bg.name = 'mapBg';
            bg.x = offsetX;
            bg.y = offsetY;
            bg.width = mapW;
            bg.height = mapH;
            bg.zIndex = 0;
            app.stage.addChild(bg);
            if (gridEnabled && gridSize > 0) {
                const g = new px.Graphics();
                g.name = 'grid';
                g.zIndex = 1;
                g.lineStyle(1, 0xffffff, 0.12);
                for(let x = offsetX; x <= offsetX + mapW; x += gridSize){
                    g.moveTo(x, offsetY);
                    g.lineTo(x, offsetY + mapH);
                }
                for(let y = offsetY; y <= offsetY + mapH; y += gridSize){
                    g.moveTo(offsetX, y);
                    g.lineTo(offsetX + mapW, y);
                }
                app.stage.addChild(g);
            }
        } catch (err) {
            console.error('[MapCanvas] Failed to load map texture:', err);
        }
        return;
    }
    // Guard against concurrent wipes
    if (wipeInProgressRef.current) return;
    wipeInProgressRef.current = true;
    const cw = app.screen.width;
    const ch = app.screen.height;
    try {
        // Start wipe IN — runs concurrently with texture load
        const wipe = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$mapWipe$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runMapWipe"])(app, px);
        const texture = await px.Assets.load(imageUrl);
        const scaleX = cw / texture.width;
        const scaleY = ch / texture.height;
        const scale = Math.min(scaleX, scaleY);
        const mapW = Math.round(texture.width * scale);
        const mapH = Math.round(texture.height * scale);
        const offsetX = Math.round((cw - mapW) / 2);
        const offsetY = Math.round((ch - mapH) / 2);
        mapWRef.current = mapW;
        mapHRef.current = mapH;
        mapOffsetXRef.current = offsetX;
        mapOffsetYRef.current = offsetY;
        const bg = new px.Sprite(texture);
        bg.name = 'mapBg';
        bg.x = offsetX;
        bg.y = offsetY;
        bg.width = mapW;
        bg.height = mapH;
        bg.zIndex = 0;
        app.stage.addChild(bg);
        if (gridEnabled && gridSize > 0) {
            const g = new px.Graphics();
            g.name = 'grid';
            g.zIndex = 1;
            g.lineStyle(1, 0xffffff, 0.12);
            for(let x = offsetX; x <= offsetX + mapW; x += gridSize){
                g.moveTo(x, offsetY);
                g.lineTo(x, offsetY + mapH);
            }
            for(let y = offsetY; y <= offsetY + mapH; y += gridSize){
                g.moveTo(offsetX, y);
                g.lineTo(offsetX + mapW, y);
            }
            app.stage.addChild(g);
        }
        // Wipe OUT — reveal the new map
        wipe.reveal();
        await wipe.done;
    } catch (err) {
        console.error('[MapCanvas] Failed to load map texture:', err);
    } finally{
        wipeInProgressRef.current = false;
    }
}
// ── Sync token sprites ────────────────────────────────────────
function syncTokens(app, px, tokens, isGM, currentCharId, onMoveRef, onContextRef, onHoverRef, onHoverEndRef, onDragStartRef, onDragEndRef, containerRef, tokensRef, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef, draggingTokenIdRef, tokenScale) {
    const existing = new Set(tokensRef.current.keys());
    for (const token of tokens){
        const mapW = mapWRef.current;
        const mapH = mapHRef.current;
        const offsetX = mapOffsetXRef.current;
        const offsetY = mapOffsetYRef.current;
        if (tokensRef.current.has(token.id)) {
            const c = tokensRef.current.get(token.id);
            // If token_image_url changed, destroy and rebuild the sprite so the new
            // image is displayed (e.g. after uploading a token image for an existing token).
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (c.__imageUrl !== (token.token_image_url ?? null)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokenHover$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["destroyTokenHover"])(c, app.ticker);
                app.stage.removeChild(c);
                c.destroy({
                    children: true
                });
                tokensRef.current.delete(token.id);
            // Fall through to the build-new-sprite path below
            } else {
                // Skip position update for the token currently being dragged — remote
                // realtime events would otherwise snap it back to the last persisted position.
                if (draggingTokenIdRef.current !== token.id) {
                    c.x = offsetX + token.x * mapW;
                    c.y = offsetY + token.y * mapH;
                }
                c.scale.set(tokenScale);
                c.__applyLabelScale?.(tokenScale);
                c.alpha = !isGM && !token.is_visible ? 0 : isGM && !token.is_visible ? 0.4 : 1;
                existing.delete(token.id);
                continue;
            }
        }
        const canDrag = isGM || token.participant_type === 'pc' && token.character_id === currentCharId;
        const sprite = buildTokenSprite(px, token, canDrag, mapW, mapH, offsetX, offsetY, onMoveRef, onContextRef, onHoverRef, onHoverEndRef, onDragStartRef, onDragEndRef, containerRef, draggingTokenIdRef, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef, tokenScale, app.ticker);
        sprite.__imageUrl = token.token_image_url ?? null;
        sprite.scale.set(tokenScale);
        app.stage.addChild(sprite);
        tokensRef.current.set(token.id, sprite);
        existing.delete(token.id);
    }
    for (const staleId of existing){
        const c = tokensRef.current.get(staleId);
        if (c) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokenHover$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["destroyTokenHover"])(c, app.ticker);
            app.stage.removeChild(c);
            c.destroy({
                children: true
            });
        }
        tokensRef.current.delete(staleId);
    }
}
// ── Build a single token container ───────────────────────────
function buildTokenSprite(px, token, canDrag, mapW, mapH, offsetX, offsetY, onMoveRef, onContextRef, onHoverRef, onHoverEndRef, onDragStartRef, onDragEndRef, containerRef, draggingTokenIdRef, mapWRef, mapHRef, mapOffsetXRef, mapOffsetYRef, tokenScale, ticker) {
    // ── Pointer tokens — distinct shape, skip all standard rendering ──────────
    if (token.token_type?.startsWith('pointer_')) {
        const SIZE = 24 * (token.token_size ?? 1);
        const HALF = SIZE / 2;
        const color = POINTER_COLOURS[token.token_type] ?? 0xffffff;
        const c = new px.Container();
        c.name = `token-${token.id}`;
        c.zIndex = 10;
        const g = new px.Graphics();
        // Diamond: low-opacity fill + solid outline stroke
        g.lineStyle(2, color, 1);
        g.beginFill(color, 0.18);
        g.drawPolygon([
            0,
            -HALF,
            HALF,
            0,
            0,
            HALF,
            -HALF,
            0
        ]);
        g.endFill();
        // Corner brackets: L-shapes just outside the diamond bounding box
        const BL = Math.max(5, HALF * 0.38) // bracket leg length, scales with token
        ;
        const BO = HALF + 4 // bracket offset from centre
        ;
        g.lineStyle(2.5, color, 1);
        // top-left
        g.moveTo(-BO, -BO + BL);
        g.lineTo(-BO, -BO);
        g.lineTo(-BO + BL, -BO);
        // top-right
        g.moveTo(BO - BL, -BO);
        g.lineTo(BO, -BO);
        g.lineTo(BO, -BO + BL);
        // bottom-right
        g.moveTo(BO, BO - BL);
        g.lineTo(BO, BO);
        g.lineTo(BO - BL, BO);
        // bottom-left
        g.moveTo(-BO + BL, BO);
        g.lineTo(-BO, BO);
        g.lineTo(-BO, BO - BL);
        // Centre dot
        g.lineStyle(0);
        g.beginFill(color, 1);
        g.drawCircle(0, 0, 3);
        g.endFill();
        c.addChild(g);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokenHover$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["attachTokenHover"])(c, px, 0xffffff, ticker, SIZE, false);
        c.x = offsetX + token.x * mapW;
        c.y = offsetY + token.y * mapH;
        c.scale.set(tokenScale);
        c.alpha = 1 // fast-path sync loop corrects visibility on next update
        ;
        c.eventMode = 'static';
        c.cursor = canDrag ? 'pointer' : 'default';
        c.on('pointerover', ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokenHover$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onTokenPointerOver"])(c, ticker);
        });
        c.on('pointerout', ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokenHover$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onTokenPointerOut"])(c, ticker);
        });
        if (!canDrag) return c;
        // GM drag — identical logic to standard tokens
        let dragging = false;
        let offX = 0, offY = 0;
        const onStageMove = (e)=>{
            if (!dragging) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const local = c.parent.toLocal({
                x: e.globalX,
                y: e.globalY
            });
            c.x = local.x - offX;
            c.y = local.y - offY;
        };
        const onStageUp = ()=>{
            if (!dragging) return;
            dragging = false;
            draggingTokenIdRef.current = null;
            onDragEndRef.current?.(token.id);
            c.zIndex = 10;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stage = c.parent;
            stage.off('pointermove', onStageMove);
            stage.off('pointerup', onStageUp);
            stage.off('pointerupoutside', onStageUp);
            const nx = Math.max(0, Math.min(1, (c.x - mapOffsetXRef.current) / mapWRef.current));
            const ny = Math.max(0, Math.min(1, (c.y - mapOffsetYRef.current) / mapHRef.current));
            onMoveRef.current(token.id, nx, ny);
        };
        c.on('pointerdown', (e)=>{
            e.stopPropagation();
            dragging = true;
            draggingTokenIdRef.current = token.id;
            onDragStartRef.current?.(token.id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const local = c.parent.toLocal({
                x: e.globalX,
                y: e.globalY
            });
            offX = local.x - c.x;
            offY = local.y - c.y;
            c.zIndex = 20;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stage = c.parent;
            stage.on('pointermove', onStageMove);
            stage.on('pointerup', onStageUp);
            stage.on('pointerupoutside', onStageUp);
        });
        return c;
    }
    const SIZE = 24 * (token.token_size ?? 1);
    const RADIUS = SIZE / 2;
    const colour = BORDER_COLOURS[token.alignment ?? 'pc'] ?? 0xffffff;
    const isRect = token.token_shape === 'rectangle';
    const c = new px.Container();
    c.name = `token-${token.id}`;
    c.zIndex = 10;
    c.sortableChildren = true;
    const ring = new px.Graphics();
    ring.lineStyle(2, colour, 1);
    if (isRect) {
        ring.drawRoundedRect(-SIZE / 2 - 1, -SIZE / 2 - 1, SIZE + 2, SIZE + 2, 4);
    } else {
        ring.drawCircle(0, 0, RADIUS + 1);
    }
    ring.zIndex = 2;
    c.addChild(ring);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokenHover$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["attachTokenHover"])(c, px, colour, ticker, SIZE, isRect);
    if (token.token_image_url) {
        const mask = new px.Graphics();
        mask.beginFill(0xffffff);
        if (isRect) {
            mask.drawRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE);
        } else {
            mask.drawCircle(0, 0, RADIUS);
        }
        mask.endFill();
        const sprite = px.Sprite.from(token.token_image_url);
        sprite.width = SIZE;
        sprite.height = SIZE;
        sprite.anchor.set(0.5);
        sprite.mask = mask;
        sprite.zIndex = 1;
        mask.zIndex = 1;
        c.addChild(mask, sprite);
    } else {
        const bg = new px.Graphics();
        bg.beginFill(colour, 0.2);
        if (isRect) {
            bg.drawRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE);
        } else {
            bg.drawCircle(0, 0, RADIUS);
        }
        bg.endFill();
        bg.zIndex = 1;
        const initial = new px.Text((token.label ?? '?')[0].toUpperCase(), {
            fontFamily: 'Cinzel, serif',
            fontSize: Math.round(RADIUS * 0.85),
            fill: colour
        });
        initial.anchor.set(0.5);
        initial.zIndex = 2;
        c.addChild(bg, initial);
    }
    if (token.wound_pct && token.wound_pct > 0) {
        const arc = new px.Graphics();
        arc.lineStyle(2, 0xe05252, 0.85);
        arc.arc(0, 0, RADIUS + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * token.wound_pct);
        arc.zIndex = 3;
        c.addChild(arc);
    }
    // Label — crisp text on a solid pill background for readability against any map.
    // The label group is counter-scaled by 1/tokenScale so text stays at a fixed
    // screen size regardless of how large the token is. Its y position is adjusted
    // so the gap between the ring edge and the label top is always 4 screen pixels.
    const lbl = new px.Text(token.label ?? '', {
        fontFamily: 'Rajdhani, sans-serif',
        fontWeight: '700',
        fontSize: 10,
        fill: 0xF0E8C8,
        align: 'center'
    });
    lbl.resolution = 2;
    lbl.anchor.set(0.5, 0.5);
    const PAD_X = 5;
    const PAD_Y = 2;
    const lblW = lbl.width + PAD_X * 2;
    const lblH = lbl.height + PAD_Y * 2;
    const lblBg = new px.Graphics();
    lblBg.beginFill(0x060D09, 0.82);
    lblBg.lineStyle(0.75, colour, 0.55);
    lblBg.drawRoundedRect(-lblW / 2, -lblH / 2, lblW, lblH, 3);
    lblBg.endFill();
    const lblGroup = new px.Container();
    lblGroup.addChild(lblBg, lbl);
    lblGroup.zIndex = 4;
    // Keeps label at constant screen size and a fixed 4px gap below the ring.
    const applyLabelScale = (s)=>{
        lblGroup.scale.set(1 / s);
        lblGroup.y = RADIUS + (4 + lblH / 2) / s;
    };
    applyLabelScale(tokenScale);
    c.__applyLabelScale = applyLabelScale;
    c.addChild(lblGroup);
    // Position using map image bounds (not canvas bounds)
    c.x = offsetX + token.x * mapW;
    c.y = offsetY + token.y * mapH;
    c.alpha = 1;
    c.eventMode = 'static';
    c.cursor = canDrag ? 'pointer' : 'default';
    c.on('rightclick', (e)=>{
        onContextRef.current?.(token.id, e.nativeEvent);
    });
    c.on('pointerover', (e)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokenHover$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onTokenPointerOver"])(c, ticker);
        if (!onHoverRef.current) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        onHoverRef.current(token.id, rect.left + e.globalX, rect.top + e.globalY);
    });
    c.on('pointerout', ()=>{
        onHoverEndRef.current?.();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokenHover$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onTokenPointerOut"])(c, ticker);
    });
    if (!canDrag) return c;
    let dragging = false;
    let offX = 0, offY = 0;
    // ── Stage-level handlers attached/detached per drag ──────────
    // Using the stage (c.parent) for pointermove/pointerup means the token
    // follows the cursor even when it moves faster than the token's hit area,
    // and coordinate conversion via toLocal() accounts for stage pan/zoom so
    // there is no speed mismatch between pointer and token.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onStageMove = (e)=>{
        if (!dragging) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const local = c.parent.toLocal({
            x: e.globalX,
            y: e.globalY
        });
        c.x = local.x - offX;
        c.y = local.y - offY;
    };
    const onStageUp = ()=>{
        if (!dragging) return;
        dragging = false;
        draggingTokenIdRef.current = null;
        onDragEndRef.current?.(token.id);
        c.zIndex = 10;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stage = c.parent;
        stage.off('pointermove', onStageMove);
        stage.off('pointerup', onStageUp);
        stage.off('pointerupoutside', onStageUp);
        // Use live ref values — captures current map bounds even if canvas resized since build
        const mW = mapWRef.current;
        const mH = mapHRef.current;
        const ox = mapOffsetXRef.current;
        const oy = mapOffsetYRef.current;
        const nx = Math.max(0, Math.min(1, (c.x - ox) / mW));
        const ny = Math.max(0, Math.min(1, (c.y - oy) / mH));
        onMoveRef.current(token.id, nx, ny);
    };
    c.on('pointerdown', (e)=>{
        e.stopPropagation();
        dragging = true;
        draggingTokenIdRef.current = token.id;
        onDragStartRef.current?.(token.id);
        // Convert the pointer's canvas-pixel position into stage-local space so
        // offX/offY are in the same coordinate system as c.x/c.y.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const local = c.parent.toLocal({
            x: e.globalX,
            y: e.globalY
        });
        offX = local.x - c.x;
        offY = local.y - c.y;
        c.zIndex = 999;
        // Attach move/up to the stage so events keep firing even when the
        // cursor leaves the token's hit area during a fast drag.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stage = c.parent;
        stage.on('pointermove', onStageMove);
        stage.on('pointerup', onStageUp);
        stage.on('pointerupoutside', onStageUp);
    });
    return c;
}
var _c, _c1;
__turbopack_context__.k.register(_c, "MapCanvas$memo");
__turbopack_context__.k.register(_c1, "MapCanvas");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=star-wars-rpg_src_components_1f67012a._.js.map