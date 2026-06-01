(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InitiativeStrip",
    ()=>InitiativeStrip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useCombatParticipants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/hooks/useCombatParticipants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useCharacterPortraits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/hooks/useCharacterPortraits.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useAdversaryTokenImages$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/hooks/useAdversaryTokenImages.ts [app-client] (ecmascript)");
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
// ── Design tokens ──
const PANEL_BG = 'var(--hud-surface-lo)';
const BORDER = 'var(--hud-border)';
const BORDER_MD = 'var(--hud-border-hi)';
const CHAR_BR = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].brawn // adversary slots — vivid red-sun (#E03A1E)
;
const CHAR_AG = '#F8DAD4' // PC/player slots — red-pale hex required for alpha-suffix tinting
;
const CHAR_WIL = 'var(--hud-text-dim)' // "acted" checkmark badge
;
const TEXT_MUTED = 'var(--hud-text-faint)';
const BG = 'var(--hud-bg)';
function InitiativeStrip({ encounter, character, gmControls, compact = false }) {
    _s();
    const [swapAnchor, setSwapAnchor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { combatParticipants } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useCombatParticipants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCombatParticipants"])(encounter.campaign_id ?? '');
    const slotAssignments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "InitiativeStrip.useMemo[slotAssignments]": ()=>{
            const map = {};
            for (const row of Object.values(combatParticipants)){
                if (row.slot_type === 'pc') map[row.character_id] = row.active_character_name;
            }
            return map;
        }
    }["InitiativeStrip.useMemo[slotAssignments]"], [
        combatParticipants
    ]);
    const pcSlotIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "InitiativeStrip.useMemo[pcSlotIds]": ()=>encounter.initiative_slots.filter({
                "InitiativeStrip.useMemo[pcSlotIds]": (s)=>s.type === 'pc' && s.characterId
            }["InitiativeStrip.useMemo[pcSlotIds]"]).map({
                "InitiativeStrip.useMemo[pcSlotIds]": (s)=>s.characterId
            }["InitiativeStrip.useMemo[pcSlotIds]"])
    }["InitiativeStrip.useMemo[pcSlotIds]"], [
        encounter.initiative_slots
    ]);
    const portraits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useCharacterPortraits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterPortraits"])(pcSlotIds);
    const { tokenImages: advTokenImages } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useAdversaryTokenImages$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAdversaryTokenImages"])();
    function getSwapTargets(slotId) {
        const slot = encounter.initiative_slots.find((s)=>s.id === slotId);
        if (!slot || slot.acted) return [];
        return encounter.initiative_slots.filter((s)=>s.id !== slotId && s.type === slot.type && !s.acted);
    }
    function openSwapPicker(slotId, e) {
        if (swapAnchor?.slotId === slotId) {
            setSwapAnchor(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setSwapAnchor({
            slotId,
            top: rect.bottom + 6,
            left: rect.left + rect.width / 2
        });
    }
    const slots = encounter.initiative_slots;
    const lastIdx = slots.length - 1;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].raised,
                    borderBottom: `1px solid ${BORDER}`,
                    padding: compact ? `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]} ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3]}` : `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3]} ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][4]}`,
                    overflowX: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                    background: PANEL_BG
                },
                children: slots.map((slot, i)=>{
                    const isPC = slot.type === 'pc';
                    const isCurrent = slot.current;
                    const isActed = slot.acted;
                    const activeName = isPC && slot.characterId ? slotAssignments[slot.characterId] ?? slot.name : slot.name;
                    const isMe = isPC && (slot.characterId === character.id || activeName === character.name);
                    const adv = slot.adversaryInstanceId ? encounter.adversaries.find((a)=>a.instanceId === slot.adversaryInstanceId) : null;
                    const isRevealed = adv?.revealed ?? true;
                    const displayName = !isPC && !isRevealed ? '???' : activeName;
                    const ringColor = isCurrent ? isPC ? CHAR_AG : CHAR_BR : 'transparent';
                    const showControls = !!gmControls && !isActed;
                    const canMoveLeft = showControls && i > 0 && !slots[i - 1].acted;
                    const canMoveRight = showControls && i < lastIdx && !slots[i + 1].acted;
                    const swapTargets = showControls ? getSwapTargets(slot.id) : [];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: showControls ? 'init-slot-card' : undefined,
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: compact ? '0.1875rem' : '0.3125rem',
                                    minWidth: compact ? '4rem' : '4.75rem',
                                    padding: `0 ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]}`
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: compact ? '2.75rem' : '3.25rem',
                                            height: compact ? '2.75rem' : '3.25rem',
                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].full,
                                            flexShrink: 0,
                                            background: isActed ? 'var(--hud-surface-hi)' : isPC ? `${CHAR_AG}20` : `${CHAR_BR}20`,
                                            border: isCurrent ? `2px solid ${ringColor}` : `1px solid ${isPC ? `${CHAR_AG}40` : `${CHAR_BR}40`}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                            fontWeight: 700,
                                            color: isActed ? 'var(--hud-text-faint)' : isPC ? CHAR_AG : CHAR_BR,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            filter: isActed ? 'grayscale(100%)' : 'none',
                                            boxShadow: isCurrent ? `0 0 14px ${ringColor}70` : 'none',
                                            transition: `all ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`
                                        },
                                        children: [
                                            isPC && slot.characterId && portraits[slot.characterId] ? // eslint-disable-next-line @next/next/no-img-element
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: portraits[slot.characterId],
                                                alt: displayName,
                                                style: {
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    display: 'block'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                                lineNumber: 129,
                                                columnNumber: 21
                                            }, this) : !isPC && (isRevealed || !!gmControls) && advTokenImages[slot.name] ? // eslint-disable-next-line @next/next/no-img-element
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: advTokenImages[slot.name],
                                                alt: displayName,
                                                style: {
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    display: 'block'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                                lineNumber: 136,
                                                columnNumber: 21
                                            }, this) : displayName.charAt(0).toUpperCase(),
                                            isActed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: 'absolute',
                                                    top: -1,
                                                    right: -1,
                                                    width: '1.0625rem',
                                                    height: '1.0625rem',
                                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].full,
                                                    background: CHAR_WIL,
                                                    border: `1px solid ${BG}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                                    color: BG,
                                                    fontWeight: 700
                                                },
                                                children: "✓"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                                lineNumber: 146,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                        lineNumber: 113,
                                        columnNumber: 17
                                    }, this),
                                    isCurrent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            fontWeight: 700,
                                            color: isPC ? CHAR_AG : CHAR_BR,
                                            animation: 'pulse-dot 1.2s ease-in-out infinite',
                                            lineHeight: 1
                                        },
                                        children: "▲"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                        lineNumber: 158,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                            fontWeight: 700,
                                            color: isMe ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : TEXT_MUTED,
                                            textAlign: 'center',
                                            maxWidth: '4.5rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        },
                                        children: isMe ? 'YOU' : displayName
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                        lineNumber: 164,
                                        columnNumber: 17
                                    }, this),
                                    showControls && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "init-slot-gm-bar",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: !canMoveLeft,
                                                onClick: ()=>gmControls.onMoveLeft(i),
                                                title: "Move left",
                                                children: "←"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                                lineNumber: 171,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: swapTargets.length === 0,
                                                onClick: (e)=>openSwapPicker(slot.id, e),
                                                title: "Swap with…",
                                                children: "⇄"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                                lineNumber: 176,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: !canMoveRight,
                                                onClick: ()=>gmControls.onMoveRight(i),
                                                title: "Move right",
                                                children: "→"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                                lineNumber: 181,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                        lineNumber: 170,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                lineNumber: 108,
                                columnNumber: 15
                            }, this),
                            i < lastIdx && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: compact ? '0.75rem' : '1rem',
                                    height: compact ? 1 : 2,
                                    background: BORDER_MD,
                                    flexShrink: 0
                                }
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                lineNumber: 192,
                                columnNumber: 17
                            }, this)
                        ]
                    }, slot.id, true, {
                        fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                        lineNumber: 107,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            swapAnchor && gmControls && ("TURBOPACK compile-time value", "object") !== 'undefined' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onClick: ()=>setSwapAnchor(null),
                        style: {
                            position: 'fixed',
                            inset: 0,
                            zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].backdrop
                        }
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                        lineNumber: 203,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: 'fixed',
                            top: swapAnchor.top,
                            left: swapAnchor.left,
                            transform: 'translateX(-50%)',
                            zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].tooltip,
                            background: 'var(--hud-panel)',
                            border: '1px solid var(--hud-border-hi)',
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                            padding: '0.375rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.1875rem',
                            minWidth: '6.875rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.55)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: 'var(--hud-text-dim)',
                                    paddingBottom: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1],
                                    borderBottom: '1px solid var(--hud-border)',
                                    marginBottom: '0.125rem'
                                },
                                children: "Swap with…"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                lineNumber: 223,
                                columnNumber: 13
                            }, this),
                            getSwapTargets(swapAnchor.slotId).map((target)=>{
                                const tName = target.type === 'pc' && target.characterId ? slotAssignments[target.characterId] ?? target.name : target.name;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "init-swap-target",
                                    onClick: ()=>{
                                        gmControls.onSwap(swapAnchor.slotId, target.id);
                                        setSwapAnchor(null);
                                    },
                                    children: tName
                                }, target.id, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                                    lineNumber: 241,
                                    columnNumber: 17
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx",
                        lineNumber: 207,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true), document.body)
        ]
    }, void 0, true);
}
_s(InitiativeStrip, "5yelYCENUWEKRof0k/PkLopjUoA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useCombatParticipants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCombatParticipants"],
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useCharacterPortraits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCharacterPortraits"],
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useAdversaryTokenImages$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAdversaryTokenImages"]
    ];
});
_c = InitiativeStrip;
var _c;
__turbopack_context__.k.register(_c, "InitiativeStrip");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdversaryCardList",
    ()=>AdversaryCardList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$resolve$2d$weapon$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/resolve-weapon.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
// ── Design tokens ──
const PANEL_BG = 'var(--hud-surface-lo)';
const BORDER = 'var(--hud-border)';
const BORDER_MD = 'var(--hud-border-hi)';
const TEXT = 'var(--hud-text)';
const TEXT_SEC = 'var(--hud-text-dim)';
const TEXT_MUTED = 'var(--hud-text-faint)';
// Characteristic colors — use CHAR_COLOR from tokens
const CHAR_BR = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].brawn;
const CHAR_AG = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].agility;
const CHAR_CUN = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].cunning;
const CHAR_INT = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].intellect;
const CHAR_WIL = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].willpower;
const CHAR_PR = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].presence;
const CHAR_COLORS = [
    CHAR_BR,
    CHAR_AG,
    CHAR_INT,
    CHAR_CUN,
    CHAR_WIL,
    CHAR_PR
];
const CHAR_KEYS = [
    'brawn',
    'agility',
    'intellect',
    'cunning',
    'willpower',
    'presence'
];
const CHAR_ABBR_LABELS = [
    'BR',
    'AG',
    'INT',
    'CUN',
    'WIL',
    'PR'
];
const TALENT_COLORS = {
    passive: TEXT_MUTED,
    incidental: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
    maneuver: CHAR_AG,
    action: CHAR_BR,
    'out of turn': CHAR_WIL
};
function TypeBadge({ type }) {
    const colors = {
        minion: TEXT_MUTED,
        rival: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
        nemesis: CHAR_BR,
        pc: CHAR_AG,
        npc: CHAR_BR
    };
    const color = colors[type] ?? TEXT_MUTED;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
            color,
            border: `1px solid ${color}50`,
            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
            padding: `1px 0.3125rem`,
            background: `${color}15`
        },
        children: type.toUpperCase()
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_c = TypeBadge;
function AdversaryCardList({ revealedAdversaries, currentSlot, initiativeSlots, cardCollapsed, setCardCollapsed, weaponRef }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            flex: 1,
            overflowY: 'auto',
            padding: `0.875rem 1rem`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.625rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            fontWeight: 600,
                            letterSpacing: '0.25em',
                            textTransform: 'uppercase',
                            color: `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 70%, transparent)`,
                            flex: 1
                        },
                        children: "Adversaries"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    revealedAdversaries.length > 0 && (()=>{
                        const anyExpanded = revealedAdversaries.some((a)=>currentSlot?.adversaryInstanceId !== a.instanceId && !cardCollapsed[a.instanceId]);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setCardCollapsed(anyExpanded ? Object.fromEntries(revealedAdversaries.map((a)=>[
                                        a.instanceId,
                                        true
                                    ])) : {}),
                            className: "hov-gold",
                            style: {
                                height: '1.75rem',
                                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                padding: `0 0.625rem`,
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: 'clamp(0.6rem, 0.92vw, 0.72rem)',
                                textTransform: 'uppercase',
                                background: 'transparent',
                                border: '1px solid var(--hud-border)',
                                color: 'var(--hud-text-faint)',
                                cursor: 'pointer'
                            },
                            children: anyExpanded ? 'Collapse All' : 'Expand All'
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                            lineNumber: 78,
                            columnNumber: 13
                        }, this);
                    })()
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            revealedAdversaries.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    color: TEXT_MUTED,
                    fontStyle: 'italic'
                },
                children: "No adversaries revealed yet"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                lineNumber: 103,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem'
                },
                children: revealedAdversaries.map((adv)=>{
                    const isActiveTurn = currentSlot?.adversaryInstanceId === adv.instanceId;
                    const isExpanded = isActiveTurn || !cardCollapsed[adv.instanceId];
                    const advSlot = initiativeSlots.find((s)=>s.adversaryInstanceId === adv.instanceId);
                    const alignment = advSlot?.alignment ?? 'enemy';
                    const advColor = alignment === 'allied_npc' ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].green : CHAR_BR;
                    // Inline wound display for collapsed header
                    const woundsCur = adv.woundsCurrent ?? 0;
                    const woundsMax = adv.type === 'minion' ? adv.woundThreshold * adv.groupSize : adv.woundThreshold;
                    const strainCur = adv.strainCurrent ?? 0;
                    const strainMax = adv.strainThreshold ?? 0;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: PANEL_BG,
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                            position: 'relative',
                            borderTop: `2px solid ${advColor}80`,
                            borderRight: `1px solid ${isActiveTurn ? 'var(--hud-border-hi)' : BORDER}`,
                            borderBottom: `1px solid ${isActiveTurn ? 'var(--hud-border-hi)' : BORDER}`,
                            borderLeft: `3px solid ${advColor}`,
                            overflow: 'hidden',
                            animation: isActiveTurn ? 'activeTurnPulse 2s ease-in-out infinite' : 'none',
                            minHeight: '2.75rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>{
                                    if (!isActiveTurn) setCardCollapsed((prev)=>({
                                            ...prev,
                                            [adv.instanceId]: !prev[adv.instanceId]
                                        }));
                                },
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: `0.625rem 0.875rem`,
                                    cursor: isActiveTurn ? 'default' : 'pointer',
                                    minHeight: '2.75rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                            fontWeight: 700,
                                            color: advColor,
                                            flex: 1,
                                            minWidth: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        },
                                        children: adv.name
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                        lineNumber: 149,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: 'var(--hud-text)',
                                            flexShrink: 0
                                        },
                                        children: [
                                            "❤ ",
                                            woundsCur,
                                            "/",
                                            woundsMax
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                        lineNumber: 153,
                                        columnNumber: 17
                                    }, this),
                                    adv.type === 'nemesis' && strainMax > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: 'var(--hud-text-dim)',
                                            flexShrink: 0
                                        },
                                        children: [
                                            "🧠 ",
                                            strainCur,
                                            "/",
                                            strainMax
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                        lineNumber: 158,
                                        columnNumber: 19
                                    }, this),
                                    adv.type === 'minion' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: CHAR_BR,
                                            flexShrink: 0
                                        },
                                        children: [
                                            "👤 ",
                                            adv.groupRemaining
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                        lineNumber: 164,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: 'var(--hud-text-faint)',
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            flexShrink: 0,
                                            transition: `transform ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`
                                        },
                                        children: isExpanded ? '▼' : '▶'
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                        lineNumber: 168,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                lineNumber: 140,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    maxHeight: isExpanded ? '2000px' : 0,
                                    overflow: 'hidden',
                                    transition: `max-height 250ms ease-out`,
                                    padding: isExpanded ? `0 0.875rem 0.75rem` : `0 0.875rem`,
                                    borderTop: isExpanded ? `1px solid ${BORDER}` : 'none'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.625rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                                    fontWeight: 700,
                                                    color: TEXT
                                                },
                                                children: adv.name
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                lineNumber: 182,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TypeBadge, {
                                                type: adv.type
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                lineNumber: 183,
                                                columnNumber: 19
                                            }, this),
                                            adv.type === 'minion' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                                    color: CHAR_BR
                                                },
                                                children: [
                                                    adv.groupRemaining,
                                                    "/",
                                                    adv.groupSize
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                lineNumber: 185,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                        lineNumber: 181,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.625rem',
                                            flexWrap: 'nowrap'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: '0.1875rem',
                                                    flexShrink: 0
                                                },
                                                children: CHAR_KEYS.map((key, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: `${CHAR_COLORS[i]}12`,
                                                            border: `1px solid ${CHAR_COLORS[i]}35`,
                                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                            padding: `0.1875rem 0.3125rem`,
                                                            textAlign: 'center',
                                                            minWidth: '1.875rem'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h4,
                                                                    fontWeight: 700,
                                                                    color: CHAR_COLORS[i],
                                                                    lineHeight: 1
                                                                },
                                                                children: adv.characteristics[key]
                                                            }, void 0, false, {
                                                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                                lineNumber: 200,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                                    color: TEXT_MUTED,
                                                                    marginTop: 1
                                                                },
                                                                children: CHAR_ABBR_LABELS[i]
                                                            }, void 0, false, {
                                                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                                lineNumber: 203,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, key, true, {
                                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                        lineNumber: 195,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                lineNumber: 193,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: 1,
                                                    height: '2.375rem',
                                                    background: BORDER_MD,
                                                    flexShrink: 0
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                lineNumber: 209,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                    alignItems: 'center',
                                                    flexShrink: 0
                                                },
                                                children: [
                                                    [
                                                        {
                                                            label: 'SOAK',
                                                            value: adv.soak,
                                                            color: CHAR_WIL
                                                        },
                                                        {
                                                            label: 'M.DEF',
                                                            value: adv.defense.melee,
                                                            color: CHAR_CUN
                                                        },
                                                        {
                                                            label: 'R.DEF',
                                                            value: adv.defense.ranged,
                                                            color: CHAR_INT
                                                        }
                                                    ].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                textAlign: 'center'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h4,
                                                                        fontWeight: 700,
                                                                        color: s.color,
                                                                        lineHeight: 1
                                                                    },
                                                                    children: s.value
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                                    lineNumber: 219,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                                        color: TEXT_MUTED
                                                                    },
                                                                    children: s.label
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                                    lineNumber: 220,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, s.label, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                            lineNumber: 218,
                                                            columnNumber: 23
                                                        }, this)),
                                                    adv.type !== 'minion' && (()=>{
                                                        const cur = adv.woundsCurrent ?? 0;
                                                        const max = adv.woundThreshold;
                                                        const dead = cur >= max;
                                                        const crit = cur > 0 && cur >= max * 0.75;
                                                        const woundColor = dead ? CHAR_BR : crit ? CHAR_CUN : CHAR_BR;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                textAlign: 'center'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h4,
                                                                        fontWeight: 700,
                                                                        lineHeight: 1,
                                                                        color: dead ? CHAR_BR : TEXT
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                color: dead ? CHAR_BR : crit ? CHAR_CUN : TEXT
                                                                            },
                                                                            children: cur
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                                            lineNumber: 233,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                color: TEXT_MUTED,
                                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label
                                                                            },
                                                                            children: "/"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                                            lineNumber: 234,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                color: woundColor
                                                                            },
                                                                            children: max
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                                            lineNumber: 235,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                                    lineNumber: 232,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                                        color: dead ? CHAR_BR : TEXT_MUTED
                                                                    },
                                                                    children: dead ? '☠ KILLED' : 'WOUNDS'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                                    lineNumber: 237,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                            lineNumber: 231,
                                                            columnNumber: 25
                                                        }, this);
                                                    })()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                lineNumber: 212,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                        lineNumber: 190,
                                        columnNumber: 17
                                    }, this),
                                    adv.type !== 'minion' && (()=>{
                                        const cur = adv.woundsCurrent ?? 0;
                                        const max = adv.woundThreshold;
                                        const pct = max > 0 ? Math.min(1, cur / max) : 0;
                                        // Bar threshold colors: critical=purple(#9C27B0), danger=red(#f44336), warning=amber(#FF9800)
                                        const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: '0.625rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        height: '0.3125rem',
                                                        background: 'var(--hud-border)',
                                                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                        overflow: 'hidden'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: `${pct * 100}%`,
                                                            height: '100%',
                                                            background: barColor,
                                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                            transition: `width 300ms ease`,
                                                            animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                        lineNumber: 256,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                    lineNumber: 255,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                        fontSize: 'clamp(0.62rem,0.9vw,0.72rem)',
                                                        color: 'var(--hud-text-faint)',
                                                        textAlign: 'right',
                                                        marginTop: 2
                                                    },
                                                    children: [
                                                        cur,
                                                        " / ",
                                                        max,
                                                        " wounds"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                    lineNumber: 262,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                            lineNumber: 254,
                                            columnNumber: 21
                                        }, this);
                                    })(),
                                    adv.type === 'minion' && (()=>{
                                        const cur = adv.woundsCurrent ?? 0;
                                        const groupAlive = adv.groupRemaining;
                                        const groupInitial = adv.groupSize;
                                        const minionWoundTotal = adv.woundThreshold * groupAlive;
                                        const pct = groupAlive === 0 ? 1 : minionWoundTotal > 0 ? Math.min(1, cur / minionWoundTotal) : 0;
                                        // Bar threshold colors: critical=purple(#9C27B0), danger=red(#f44336), warning=amber(#FF9800)
                                        const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR;
                                        const skillRank = Math.max(0, groupAlive - 1);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: '0.625rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        height: '0.3125rem',
                                                        background: 'var(--hud-border)',
                                                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                        overflow: 'hidden'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: `${pct * 100}%`,
                                                            height: '100%',
                                                            background: barColor,
                                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                            transition: `width 300ms ease`,
                                                            animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                        lineNumber: 286,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                    lineNumber: 285,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                        fontSize: 'clamp(0.62rem,0.9vw,0.72rem)',
                                                        color: 'var(--hud-text-faint)',
                                                        textAlign: 'right',
                                                        marginTop: 2
                                                    },
                                                    children: [
                                                        cur,
                                                        " / ",
                                                        minionWoundTotal,
                                                        " wounds"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                    lineNumber: 292,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                        color: TEXT_MUTED,
                                                        marginTop: '0.1875rem',
                                                        display: 'flex',
                                                        gap: '0.625rem'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: groupAlive === 0 ? CHAR_BR : TEXT_SEC
                                                                    },
                                                                    children: groupAlive
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                                    lineNumber: 304,
                                                                    columnNumber: 27
                                                                }, this),
                                                                ' remaining (of ',
                                                                groupInitial,
                                                                ')'
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                            lineNumber: 303,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: TEXT_MUTED
                                                            },
                                                            children: [
                                                                "· Skill rank: ",
                                                                skillRank
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                            lineNumber: 307,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                    lineNumber: 299,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                            lineNumber: 284,
                                            columnNumber: 21
                                        }, this);
                                    })(),
                                    adv.talents && adv.talents.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.25rem',
                                            marginBottom: '0.5rem'
                                        },
                                        children: adv.talents.map((t, i)=>{
                                            const color = TALENT_COLORS[(t.activation ?? 'passive').toLowerCase()] ?? TEXT_MUTED;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                    color,
                                                    background: `${color}15`,
                                                    border: `1px solid ${color}40`,
                                                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                    padding: `2px 0.375rem`
                                                },
                                                title: t.description,
                                                children: t.name
                                            }, i, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                lineNumber: 319,
                                                columnNumber: 25
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                        lineNumber: 315,
                                        columnNumber: 19
                                    }, this),
                                    adv.weapons && adv.weapons.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: adv.weapons.map((w, i)=>{
                                            const { dmg, range, crit } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$resolve$2d$weapon$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveWeapon"])(w, adv.characteristics.brawn, weaponRef);
                                            const quals = w.qualities?.length ? ` — ${w.qualities.join(', ')}` : '';
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].green
                                                },
                                                children: [
                                                    w.name,
                                                    " — DMG ",
                                                    dmg,
                                                    crit !== undefined ? ` — Crit ${crit}` : '',
                                                    " — ",
                                                    range,
                                                    quals
                                                ]
                                            }, i, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                                lineNumber: 334,
                                                columnNumber: 25
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                        lineNumber: 329,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                                lineNumber: 174,
                                columnNumber: 15
                            }, this)
                        ]
                    }, adv.instanceId, true, {
                        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                        lineNumber: 125,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_c1 = AdversaryCardList;
var _c, _c1;
__turbopack_context__.k.register(_c, "TypeBadge");
__turbopack_context__.k.register(_c1, "AdversaryCardList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VehicleCardList",
    ()=>VehicleCardList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$vehicles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/vehicles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
// ── Design tokens ──
const PANEL_BG = 'var(--hud-surface-lo)';
const BORDER = 'var(--hud-border)';
const BORDER_MD = 'var(--hud-border-hi)';
const TEXT = 'var(--hud-text)';
const TEXT_MUTED = 'var(--hud-text-faint)';
// Characteristic colors — use CHAR_COLOR from tokens
const CHAR_AG = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].agility;
const CHAR_BR = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].brawn;
const CHAR_CUN = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].cunning;
const CHAR_WIL = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_COLOR"].willpower;
function VehicleBadge() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
            color: CHAR_AG,
            border: `1px solid ${CHAR_AG}50`,
            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
            padding: `1px 0.3125rem`,
            background: `${CHAR_AG}15`
        },
        children: "VEHICLE"
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c = VehicleBadge;
function VehicleCardList({ vehicles, currentSlot, initiativeSlots, cardCollapsed, setCardCollapsed, onAdjustHullTrauma, onAdjustSystemStrain }) {
    if (vehicles.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: `0 1rem 0.875rem`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.625rem',
                    marginTop: '0.875rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            fontWeight: 600,
                            letterSpacing: '0.25em',
                            textTransform: 'uppercase',
                            color: `${CHAR_AG}b3`,
                            flex: 1
                        },
                        children: "Vehicles"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    vehicles.length > 0 && (()=>{
                        const anyExpanded = vehicles.some((v)=>currentSlot?.vehicleInstanceId !== v.instanceId && !cardCollapsed[v.instanceId]);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setCardCollapsed(anyExpanded ? Object.fromEntries(vehicles.map((v)=>[
                                        v.instanceId,
                                        true
                                    ])) : Object.fromEntries(vehicles.map((v)=>[
                                        v.instanceId,
                                        false
                                    ]))),
                            className: "hov-ag hov-ag-base",
                            style: {
                                height: '1.75rem',
                                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                padding: `0 0.625rem`,
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: 'clamp(0.6rem, 0.92vw, 0.72rem)',
                                textTransform: 'uppercase',
                                background: 'transparent',
                                border: '1px solid',
                                cursor: 'pointer'
                            },
                            children: anyExpanded ? 'Collapse All' : 'Expand All'
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                            lineNumber: 69,
                            columnNumber: 13
                        }, this);
                    })()
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem'
                },
                children: vehicles.map((v)=>{
                    const isActiveTurn = currentSlot?.vehicleInstanceId === v.instanceId;
                    const isExpanded = isActiveTurn || !cardCollapsed[v.instanceId];
                    const vSlot = initiativeSlots.find((s)=>s.vehicleInstanceId === v.instanceId);
                    const alignment = vSlot?.alignment ?? v.alignment ?? 'enemy';
                    const vColor = alignment === 'allied_npc' ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].green : CHAR_BR;
                    const htCur = v.hullTraumaCurrent;
                    const htMax = v.hullTraumaThreshold;
                    const ssCur = v.systemStrainCurrent;
                    const ssMax = v.systemStrainThreshold;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: PANEL_BG,
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].lg,
                            position: 'relative',
                            borderTop: `2px solid ${vColor}80`,
                            borderRight: `1px solid ${isActiveTurn ? 'var(--hud-border-hi)' : BORDER}`,
                            borderBottom: `1px solid ${isActiveTurn ? 'var(--hud-border-hi)' : BORDER}`,
                            borderLeft: `3px solid ${vColor}`,
                            overflow: 'hidden',
                            animation: isActiveTurn ? 'activeTurnPulse 2s ease-in-out infinite' : 'none',
                            minHeight: '2.75rem'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>{
                                    if (!isActiveTurn) setCardCollapsed((prev)=>({
                                            ...prev,
                                            [v.instanceId]: !prev[v.instanceId]
                                        }));
                                },
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: `0.625rem 0.875rem`,
                                    cursor: isActiveTurn ? 'default' : 'pointer',
                                    minHeight: '2.75rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                            fontWeight: 700,
                                            color: vColor,
                                            flex: 1,
                                            minWidth: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        },
                                        children: v.name
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                        lineNumber: 130,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: 'var(--hud-text)',
                                            flexShrink: 0
                                        },
                                        children: [
                                            "🛡 ",
                                            htCur,
                                            "/",
                                            htMax
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                        lineNumber: 134,
                                        columnNumber: 17
                                    }, this),
                                    ssMax > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            color: 'var(--hud-text-dim)',
                                            flexShrink: 0
                                        },
                                        children: [
                                            "⚡ ",
                                            ssCur,
                                            "/",
                                            ssMax
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                        lineNumber: 139,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: 'var(--hud-text-faint)',
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            flexShrink: 0,
                                            transition: `transform ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EASE"].default}`
                                        },
                                        children: isExpanded ? '▼' : '▶'
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                        lineNumber: 143,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                lineNumber: 121,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    maxHeight: isExpanded ? '2000px' : 0,
                                    overflow: 'hidden',
                                    transition: `max-height 250ms ease-out`,
                                    padding: isExpanded ? `0 0.875rem 0.75rem` : `0 0.875rem`,
                                    borderTop: isExpanded ? `1px solid ${BORDER}` : 'none'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.625rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                                    fontWeight: 700,
                                                    color: TEXT
                                                },
                                                children: v.name
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                lineNumber: 158,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(VehicleBadge, {}, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                lineNumber: 159,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                        lineNumber: 157,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            gap: '0.625rem',
                                            alignItems: 'center',
                                            marginBottom: '0.625rem',
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            {
                                                label: 'SIL',
                                                value: v.silhouette,
                                                color: CHAR_AG
                                            },
                                            {
                                                label: 'SPD',
                                                value: v.speed,
                                                color: CHAR_AG
                                            },
                                            {
                                                label: 'HDL',
                                                value: v.handling >= 0 ? `+${v.handling}` : `${v.handling}`,
                                                color: CHAR_WIL
                                            },
                                            {
                                                label: 'ARMOR',
                                                value: v.armor,
                                                color: CHAR_WIL
                                            },
                                            {
                                                label: 'F.DEF',
                                                value: v.defense.fore,
                                                color: CHAR_CUN
                                            },
                                            {
                                                label: 'A.DEF',
                                                value: v.defense.aft,
                                                color: CHAR_CUN
                                            },
                                            {
                                                label: 'P.DEF',
                                                value: v.defense.port,
                                                color: CHAR_CUN
                                            },
                                            {
                                                label: 'S.DEF',
                                                value: v.defense.starboard,
                                                color: CHAR_CUN
                                            }
                                        ].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    textAlign: 'center'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h4,
                                                            fontWeight: 700,
                                                            color: s.color,
                                                            lineHeight: 1
                                                        },
                                                        children: s.value
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                        lineNumber: 175,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                            color: TEXT_MUTED
                                                        },
                                                        children: s.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                        lineNumber: 176,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, s.label, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                lineNumber: 174,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                        lineNumber: 163,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            height: 1,
                                            background: BORDER_MD,
                                            marginBottom: '0.625rem'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                        lineNumber: 182,
                                        columnNumber: 17
                                    }, this),
                                    (()=>{
                                        const pct = htMax > 0 ? Math.min(1, htCur / htMax) : 0;
                                        // Bar threshold colors: critical=purple(#9C27B0), danger=red(#f44336), warning=amber(#FF9800)
                                        const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_BR;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: '0.5rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        marginBottom: '0.25rem'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                                                color: TEXT_MUTED,
                                                                flex: 1
                                                            },
                                                            children: [
                                                                "Hull Trauma",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                        color: pct >= 1 ? CHAR_BR : TEXT,
                                                                        marginLeft: '0.375rem'
                                                                    },
                                                                    children: [
                                                                        htCur,
                                                                        "/",
                                                                        htMax
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                                    lineNumber: 194,
                                                                    columnNumber: 27
                                                                }, this),
                                                                pct >= 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: CHAR_BR,
                                                                        marginLeft: '0.375rem'
                                                                    },
                                                                    children: "☠ DISABLED"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                                    lineNumber: 197,
                                                                    columnNumber: 40
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                            lineNumber: 192,
                                                            columnNumber: 25
                                                        }, this),
                                                        onAdjustHullTrauma && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                gap: '0.25rem'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>onAdjustHullTrauma(v.instanceId, -1),
                                                                    style: {
                                                                        width: '1.25rem',
                                                                        height: '1.25rem',
                                                                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                                        cursor: 'pointer',
                                                                        background: 'transparent',
                                                                        border: `1px solid ${BORDER_MD}`,
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                                                        color: TEXT,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        lineHeight: 1
                                                                    },
                                                                    children: "−"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                                    lineNumber: 201,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>onAdjustHullTrauma(v.instanceId, 1),
                                                                    style: {
                                                                        width: '1.25rem',
                                                                        height: '1.25rem',
                                                                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                                        cursor: 'pointer',
                                                                        background: `${CHAR_BR}18`,
                                                                        border: `1px solid ${BORDER_MD}`,
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                                                        color: CHAR_BR,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        lineHeight: 1
                                                                    },
                                                                    children: "+"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                                    lineNumber: 205,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                            lineNumber: 200,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        height: '0.3125rem',
                                                        background: 'var(--hud-border)',
                                                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                        overflow: 'hidden'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: `${pct * 100}%`,
                                                            height: '100%',
                                                            background: barColor,
                                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                            transition: `width 300ms ease`,
                                                            animation: pct >= 1 ? 'pulse-dot 1.4s ease-in-out infinite' : 'none'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                        lineNumber: 213,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                    lineNumber: 212,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                            lineNumber: 190,
                                            columnNumber: 21
                                        }, this);
                                    })(),
                                    ssMax > 0 && (()=>{
                                        const pct = Math.min(1, ssCur / ssMax);
                                        // Bar threshold colors: critical=purple(#9C27B0), danger=red(#f44336), warning=amber(#FF9800)
                                        const barColor = pct >= 1 ? '#9C27B0' : pct >= 0.8 ? '#f44336' : pct >= 0.5 ? '#FF9800' : CHAR_WIL;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: '0.5rem'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        marginBottom: '0.25rem'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                                                color: TEXT_MUTED,
                                                                flex: 1
                                                            },
                                                            children: [
                                                                "System Strain",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                        color: pct >= 1 ? CHAR_BR : TEXT,
                                                                        marginLeft: '0.375rem'
                                                                    },
                                                                    children: [
                                                                        ssCur,
                                                                        "/",
                                                                        ssMax
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                                    lineNumber: 233,
                                                                    columnNumber: 27
                                                                }, this),
                                                                pct >= 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: CHAR_BR,
                                                                        marginLeft: '0.375rem'
                                                                    },
                                                                    children: "⚠ STRAINED"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                                    lineNumber: 236,
                                                                    columnNumber: 40
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                            lineNumber: 231,
                                                            columnNumber: 25
                                                        }, this),
                                                        onAdjustSystemStrain && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                gap: '0.25rem'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>onAdjustSystemStrain(v.instanceId, -1),
                                                                    style: {
                                                                        width: '1.25rem',
                                                                        height: '1.25rem',
                                                                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                                        cursor: 'pointer',
                                                                        background: 'transparent',
                                                                        border: `1px solid ${BORDER_MD}`,
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                                                        color: TEXT,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        lineHeight: 1
                                                                    },
                                                                    children: "−"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                                    lineNumber: 240,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>onAdjustSystemStrain(v.instanceId, 1),
                                                                    style: {
                                                                        width: '1.25rem',
                                                                        height: '1.25rem',
                                                                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                                        cursor: 'pointer',
                                                                        background: `${CHAR_WIL}18`,
                                                                        border: `1px solid ${BORDER_MD}`,
                                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                                                        color: CHAR_WIL,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        lineHeight: 1
                                                                    },
                                                                    children: "+"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                                    lineNumber: 244,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                            lineNumber: 239,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        height: '0.3125rem',
                                                        background: 'var(--hud-border)',
                                                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                        overflow: 'hidden'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: `${pct * 100}%`,
                                                            height: '100%',
                                                            background: barColor,
                                                            borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                            transition: `width 300ms ease`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                        lineNumber: 252,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                    lineNumber: 251,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                            lineNumber: 229,
                                            columnNumber: 21
                                        }, this);
                                    })(),
                                    v.weapons && v.weapons.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: '0.375rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                    color: TEXT_MUTED,
                                                    letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                    marginBottom: '0.25rem'
                                                },
                                                children: "Weapons"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                lineNumber: 264,
                                                columnNumber: 21
                                            }, this),
                                            v.weapons.map((w, i)=>{
                                                const displayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$vehicles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["vehicleWeaponDisplayName"])(w.weaponKey);
                                                const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$vehicles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["vehicleWeaponStats"])(w.weaponKey);
                                                const count = w.count > 1 ? `${w.count}× ` : '';
                                                const turret = w.turret ? ' (Turret)' : '';
                                                const dmgStr = stats ? ` — DMG ${stats.damage} — ${stats.range}${stats.crit ? ` — Crit ${stats.crit}` : ''}` : '';
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].green,
                                                        marginBottom: 2
                                                    },
                                                    children: [
                                                        count,
                                                        displayName,
                                                        turret,
                                                        dmgStr
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                                    lineNumber: 272,
                                                    columnNumber: 25
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                        lineNumber: 263,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                                lineNumber: 149,
                                columnNumber: 15
                            }, this)
                        ]
                    }, v.instanceId, true, {
                        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                        lineNumber: 106,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/player/VehicleCardList.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_c1 = VehicleCardList;
var _c, _c1;
__turbopack_context__.k.register(_c, "VehicleBadge");
__turbopack_context__.k.register(_c1, "VehicleCardList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SessionStatusBanner",
    ()=>SessionStatusBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
// ── Design tokens ─────────────────────────────────────────────────────────────
const baseStyle = {
    padding: `0.4375rem ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][4]}`,
    display: 'flex',
    flexDirection: 'column',
    gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1],
    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"]
};
function getObligationBannerColor(value) {
    if (value === undefined) return {
        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].amber,
        bg: 'rgba(224,144,80,0.07)',
        border: '1px solid rgba(224,144,80,0.25)'
    };
    if (value >= 100) return {
        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].accentPurple,
        bg: 'rgba(160,80,220,0.08)',
        border: '1px solid rgba(160,80,220,0.3)'
    };
    if (value >= 67) return {
        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].red,
        bg: 'rgba(224,80,80,0.08)',
        border: '1px solid rgba(224,80,80,0.3)'
    };
    if (value >= 34) return {
        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].amber,
        bg: 'rgba(224,144,80,0.07)',
        border: '1px solid rgba(224,144,80,0.25)'
    };
    return {
        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR"].green,
        bg: 'rgba(78,200,122,0.06)',
        border: '1px solid rgba(78,200,122,0.2)'
    };
}
function SessionStatusBanner({ sessionRollState: s, characterId, characterNames, triggeredObligationType, ownObligationValue }) {
    if (!s) return null;
    const showDuty = s.duty_revealed;
    const showObl = s.obligation_revealed;
    if (!showDuty && !showObl) return null;
    const dutyTriggeredName = s.duty_triggered_char_id ? characterNames[s.duty_triggered_char_id] ?? 'A character' : null;
    const oblTriggeredName = s.obligation_triggered_char_id ? characterNames[s.obligation_triggered_char_id] ?? 'A character' : null;
    const isMyDuty = s.duty_triggered_char_id === characterId;
    const isMyObl = s.obligation_triggered_char_id === characterId;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column'
        },
        children: [
            showDuty && (()=>{
                if (!s.duty_triggered) {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...baseStyle,
                            background: 'rgba(76,175,80,0.06)',
                            borderBottom: '1px solid rgba(76,175,80,0.2)',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim
                        },
                        children: "✦ Duty Check: No Duty triggered this session."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                        lineNumber: 59,
                        columnNumber: 13
                    }, this);
                }
                if (isMyDuty) {
                    const bonus = s.duty_is_doubles ? 4 : 2;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...baseStyle,
                            background: 'var(--hud-surface-lo)',
                            borderBottom: '1px solid var(--hud-border-hi)',
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontWeight: 700
                                },
                                children: "✦ YOUR Duty is triggered this session!"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                                lineNumber: 79,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                                    color: 'var(--hud-text-dim)'
                                },
                                children: [
                                    "+",
                                    bonus,
                                    " Wound Threshold active for this session.",
                                    s.duty_is_doubles && ' (Doubles)'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                                lineNumber: 80,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                        lineNumber: 72,
                        columnNumber: 13
                    }, this);
                }
                // Another character's duty
                const bonus = s.duty_is_doubles ? 2 : 1;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        ...baseStyle,
                        background: 'rgba(78,200,122,0.08)',
                        borderBottom: '1px solid rgba(78,200,122,0.3)',
                        color: 'rgba(78,200,122,0.85)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                "✦ Duty triggered — ",
                                dutyTriggeredName,
                                "'s Duty activates!"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                            lineNumber: 96,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                                color: 'rgba(78,200,122,0.65)'
                            },
                            children: [
                                "All characters: +",
                                bonus,
                                " Wound Threshold active for this session.",
                                s.duty_is_doubles && ' (Doubles)'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                            lineNumber: 97,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                    lineNumber: 90,
                    columnNumber: 11
                }, this);
            })(),
            showObl && (()=>{
                if (!s.obligation_triggered) {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...baseStyle,
                            background: 'var(--hud-surface-lo)',
                            borderBottom: '1px solid var(--hud-border)',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim
                        },
                        children: "⚠ Obligation Check: No Obligation triggered this session."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                        lineNumber: 109,
                        columnNumber: 13
                    }, this);
                }
                if (isMyObl) {
                    const { color, bg, border } = getObligationBannerColor(ownObligationValue);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            ...baseStyle,
                            background: bg,
                            borderBottom: border,
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            color
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontWeight: 700
                                },
                                children: "⚠ YOUR Obligation is triggered this session."
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                                lineNumber: 129,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
                                    color: `${color}bb`
                                },
                                children: [
                                    "Expect complications relating to your ",
                                    triggeredObligationType ?? 'Obligation',
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                                lineNumber: 130,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                        lineNumber: 122,
                        columnNumber: 13
                    }, this);
                }
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        ...baseStyle,
                        background: 'rgba(224,144,80,0.06)',
                        borderBottom: '1px solid rgba(224,144,80,0.2)',
                        color: 'rgba(224,144,80,0.75)'
                    },
                    children: [
                        "⚠ Obligation triggered — ",
                        oblTriggeredName,
                        "'s Obligation activates."
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
                    lineNumber: 137,
                    columnNumber: 11
                }, this);
            })()
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/player/SessionStatusBanner.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c = SessionStatusBanner;
var _c;
__turbopack_context__.k.register(_c, "SessionStatusBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TalentQuickReference",
    ()=>TalentQuickReference
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/ui/RichText.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
;
// ── Activation UI colors — semantic palette, not characteristic stats ──
// No clean token mappings exist for these three; kept as design-stable hex.
const ACT_BLUE = '#52a8e0' // maneuver / action
;
const ACT_RED = '#e05252' // action (danger)
;
const ACT_TEAL = '#52e0a8' // out-of-turn
;
const ACTIVATION_ORDER = [
    'incidental',
    'out of turn',
    'maneuver',
    'action'
];
const ACTIVATION_COLORS = {
    passive: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
    incidental: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
    maneuver: ACT_BLUE,
    action: ACT_RED,
    'out of turn': ACT_TEAL,
    'incidental (oot)': ACT_TEAL
};
function TalentQuickReference({ talents }) {
    const talentGroups = ACTIVATION_ORDER.map((act)=>({
            activation: act,
            color: ACTIVATION_COLORS[act] ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
            items: talents.filter((t)=>t.activation.toLowerCase() === act || act === 'out of turn' && t.activation.toLowerCase() === 'incidental (oot)')
        })).filter((g)=>g.items.length > 0);
    const passiveTalents = talents.filter((t)=>t.activation.toLowerCase() === 'passive' && t.statBonus);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '18.75rem',
            flexShrink: 0,
            overflowY: 'auto',
            padding: '0.875rem'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    fontWeight: 600,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 70%, transparent)`,
                    marginBottom: '0.625rem'
                },
                children: "Talent Quick Reference"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: `${ACT_TEAL}12`,
                    border: `1px solid ${ACT_TEAL}50`,
                    borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                    padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]} 0.625rem`,
                    marginBottom: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3]
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            fontWeight: 700,
                            color: ACT_TEAL,
                            marginBottom: '0.1875rem'
                        },
                        children: "⚡ Out-of-Turn"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                            lineHeight: 1.4
                        },
                        children: "Out-of-Turn talents can trigger on ANY player's turn — watch for them."
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            talentGroups.map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginBottom: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3]
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: group.color,
                                marginBottom: '0.375rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem'
                            },
                            children: [
                                group.activation,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                        background: 'var(--hud-surface-lo)',
                                        border: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                                        borderRadius: '0.625rem',
                                        padding: '0 0.3125rem'
                                    },
                                    children: group.activation === 'incidental' || group.activation === 'out of turn' ? 'No action cost' : 'Costs action/maneuver'
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                                    lineNumber: 69,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.3125rem'
                            },
                            children: group.items.map((t, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: group.activation === 'incidental' ? `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 3%, transparent)` : group.activation === 'out of turn' ? `${ACT_TEAL}08` : 'var(--hud-surface-lo)',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)',
                                        borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].md,
                                        position: 'relative',
                                        borderTop: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                                        borderRight: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                                        borderBottom: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                                        borderLeft: `2px solid ${group.color}60`,
                                        padding: `${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2]} 0.625rem`
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                fontWeight: 700,
                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].text,
                                                marginBottom: '0.125rem'
                                            },
                                            children: t.name
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                                            lineNumber: 89,
                                            columnNumber: 17
                                        }, this),
                                        t.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                                lineHeight: 1.4
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$ui$2f$RichText$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RichText"], {
                                                text: t.description
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                                                lineNumber: 91,
                                                columnNumber: 117
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                                            lineNumber: 91,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                display: 'inline-block',
                                                marginTop: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1],
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                color: group.color,
                                                border: `1px solid ${group.color}40`,
                                                borderRadius: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RADIUS"].sm,
                                                padding: `0 ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]}`,
                                                background: `${group.color}10`
                                            },
                                            children: group.activation.toUpperCase()
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                                            lineNumber: 93,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                                    lineNumber: 75,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this)
                    ]
                }, group.activation, true, {
                    fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this)),
            passiveTalents.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                            marginBottom: '0.375rem'
                        },
                        children: "Passive Bonuses"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]
                        },
                        children: passiveTalents.map((t, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim,
                                    display: 'flex',
                                    gap: '0.375rem'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                        },
                                        children: [
                                            "+",
                                            t.statBonus.value,
                                            " ",
                                            t.statBonus.stat
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                                        },
                                        children: [
                                            "· ",
                                            t.name
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                                        lineNumber: 115,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                                lineNumber: 113,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                lineNumber: 107,
                columnNumber: 9
            }, this),
            talentGroups.length === 0 && passiveTalents.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '1.25rem 0'
                },
                children: "No active talents to display"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
                lineNumber: 123,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_c = TalentQuickReference;
var _c;
__turbopack_context__.k.register(_c, "TalentQuickReference");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/player/CombatTracker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CombatTracker",
    ()=>CombatTracker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2f$TalentQuickReference$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player/TalentQuickReference.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2f$AdversaryCardList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player/AdversaryCardList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2f$InitiativeStrip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player/InitiativeStrip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useEncounterState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/hooks/useEncounterState.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useRefWeapons$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/hooks/useRefWeapons.ts [app-client] (ecmascript)");
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
// ── Outcome colors (not characteristic stats — no clean CHAR_COLOR mapping) ──
const OUTCOME_FAIL = 'var(--state-wounds)' // red: fail/hit entries
;
const OUTCOME_SUCC = 'var(--state-success)' // green: success entries
;
function CombatTracker({ character, campaignId, talents = [] }) {
    _s();
    const { encounter } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useEncounterState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEncounterState"])(campaignId);
    const weaponRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useRefWeapons$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRefWeapons"])();
    // Collapsed state for adversary cards (true = collapsed; active-turn card overrides)
    const [cardCollapsed, setCardCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    if (!encounter || !encounter.is_active) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                flexDirection: 'column',
                gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][3],
                background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].bg
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h3,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                    },
                    children: "NO ACTIVE COMBAT"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint
                    },
                    children: "Waiting for DM to start combat…"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
            lineNumber: 31,
            columnNumber: 7
        }, this);
    }
    const currentSlot = encounter.initiative_slots[encounter.current_slot_index];
    const revealedAdversaries = encounter.adversaries.filter((a)=>a.revealed);
    const publicLog = encounter.log_entries.filter((e)=>!e.dmOnly);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].bg,
            overflow: 'hidden',
            position: 'relative'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].base,
                    opacity: 0.015,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 0l20 20M20 0L0 20' stroke='%23C8AA50' stroke-width='0.5'/%3E%3C/svg%3E")`
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2f$InitiativeStrip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InitiativeStrip"], {
                encounter: encounter,
                character: character
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    display: 'flex',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Z"].raised
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            borderRight: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2f$AdversaryCardList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdversaryCardList"], {
                                revealedAdversaries: revealedAdversaries,
                                currentSlot: currentSlot,
                                initiativeSlots: encounter.initiative_slots,
                                cardCollapsed: cardCollapsed,
                                setCardCollapsed: setCardCollapsed,
                                weaponRef: weaponRef
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flexShrink: 0,
                                    borderTop: `1px solid ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].border}`,
                                    maxHeight: '11.25rem',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: `0.375rem ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][4]} 0`,
                                            flexShrink: 0
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                fontWeight: 600,
                                                letterSpacing: '0.25em',
                                                textTransform: 'uppercase',
                                                color: `color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 70%, transparent)`,
                                                marginBottom: '0.375rem'
                                            },
                                            children: "Combat Log"
                                        }, void 0, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                                            lineNumber: 74,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                                        lineNumber: 73,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1,
                                            overflowY: 'auto',
                                            padding: `0 ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][4]} 0.625rem`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][1]
                                        },
                                        children: [
                                            publicLog.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                                    fontStyle: 'italic'
                                                },
                                                children: "No entries yet"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                                                lineNumber: 80,
                                                columnNumber: 17
                                            }, this),
                                            publicLog.map((entry)=>{
                                                const leftColor = entry.text.toLowerCase().includes('fail') || entry.text.toLowerCase().includes('hit') ? OUTCOME_FAIL : entry.text.toLowerCase().includes('success') ? OUTCOME_SUCC : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].borderHi;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        borderLeft: `2px solid ${leftColor}`,
                                                        paddingLeft: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2],
                                                        display: 'flex',
                                                        gap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SP"][2],
                                                        alignItems: 'flex-start'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                                                                flexShrink: 0
                                                            },
                                                            children: [
                                                                "R",
                                                                entry.round,
                                                                "·S",
                                                                entry.slot
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                                                            lineNumber: 91,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                                                flexShrink: 0,
                                                                minWidth: '5rem'
                                                            },
                                                            children: entry.actor
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                                                            lineNumber: 92,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textDim
                                                            },
                                                            children: entry.text
                                                        }, void 0, false, {
                                                            fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                                                            lineNumber: 93,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, entry.id, true, {
                                                    fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                                                    lineNumber: 87,
                                                    columnNumber: 19
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                                        lineNumber: 78,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                                lineNumber: 72,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2f$TalentQuickReference$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TalentQuickReference"], {
                        talents: talents
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(224,82,82,0); }
          50% { box-shadow: 0 0 8px 2px rgba(224,82,82,0.25); }
        }
        @keyframes activeTurnPulse {
          0%, 100% { border-color: var(--hud-border); }
          50%       { border-color: var(--hud-border-hi); }
        }
      `
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/player/CombatTracker.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_s(CombatTracker, "v+XchgTBh3YE7BYkjuWFBPW3e3w=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useEncounterState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEncounterState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$hooks$2f$useRefWeapons$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRefWeapons"]
    ];
});
_c = CombatTracker;
var _c;
__turbopack_context__.k.register(_c, "CombatTracker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=star-wars-rpg_src_components_player_8de25a23._.js.map