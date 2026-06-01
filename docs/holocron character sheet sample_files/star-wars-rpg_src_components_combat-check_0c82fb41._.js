(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/src/components/combat-check/steps/AttackTypeStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AttackTypeStep",
    ()=>AttackTypeStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
const CARDS = [
    {
        type: 'ranged',
        label: 'Ranged',
        icon: '⊙',
        sub: 'Ranged Light · Ranged Heavy · Gunnery'
    },
    {
        type: 'melee',
        label: 'Melee',
        icon: '⚔',
        sub: 'Melee · Brawl · Lightsaber'
    }
];
function AttackTypeStep({ onSelect }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    color: 'var(--hud-text-dim)',
                    margin: '0 0 8px',
                    letterSpacing: '0.05em'
                },
                children: "Select the type of attack to make."
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/AttackTypeStep.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            CARDS.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>onSelect(card.type),
                    className: "hov-gold-border",
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '20px 20px',
                        background: 'rgba(224,58,30,0.04)',
                        border: `1px solid var(--hud-border)`,
                        borderRadius: 12,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 120ms, background 120ms',
                        width: '100%'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].h4,
                                lineHeight: 1,
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                flexShrink: 0,
                                width: 36,
                                textAlign: 'center'
                            },
                            children: card.icon
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/AttackTypeStep.tsx",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                        fontWeight: 700,
                                        color: 'var(--hud-text)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    },
                                    children: card.label
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/AttackTypeStep.tsx",
                                    lineNumber: 45,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontFamily: 'var(--font-body)',
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                        color: 'var(--hud-text-dim)',
                                        marginTop: 3
                                    },
                                    children: card.sub
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/AttackTypeStep.tsx",
                                    lineNumber: 51,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/AttackTypeStep.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this)
                    ]
                }, card.type, true, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/AttackTypeStep.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/AttackTypeStep.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = AttackTypeStep;
var _c;
__turbopack_context__.k.register(_c, "AttackTypeStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WeaponSelectStep",
    ()=>WeaponSelectStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$WeaponDamageDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/WeaponDamageDisplay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$QualityBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/character/QualityBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/dice-engine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/combatCheckUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$weaponHandedness$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/weaponHandedness.ts [app-client] (ecmascript)");
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
// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-faint)';
const GOLD_BD = 'var(--hud-border)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
const CARD_BG = 'var(--hud-surface-lo)';
const ORANGE = '#FF9800';
// ── Dual wield detection ──────────────────────────────────────────────────────
function findDualWieldPartner(selectedWeapon, allEquippedWeapons, refWeaponMap) {
    const selectedRef = refWeaponMap[selectedWeapon.weapon_key];
    if (!selectedRef) return null;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$weaponHandedness$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canDualWield"])({
        skill_key: selectedRef.skill_key,
        weapon_key: selectedWeapon.weapon_key,
        is_one_handed_override: selectedWeapon.is_one_handed_override,
        is_two_handed_override: selectedWeapon.is_two_handed_override
    })) return null;
    // Find one-handed partners that are the same attack type (both ranged or both melee).
    // Weapons of the opposite type (e.g. a blaster when looking for a melee partner)
    // are ignored so they don't block dual-wield detection.
    const selectedIsRanged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isRangedSkill"])(selectedRef.skill_key);
    const candidates = allEquippedWeapons.filter((w)=>w.id !== selectedWeapon.id).filter((w)=>{
        const ref = refWeaponMap[w.weapon_key];
        if (!ref) return false;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isRangedSkill"])(ref.skill_key) !== selectedIsRanged) return false;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$weaponHandedness$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canDualWield"])({
            skill_key: ref.skill_key,
            weapon_key: w.weapon_key,
            is_one_handed_override: w.is_one_handed_override,
            is_two_handed_override: w.is_two_handed_override
        });
    });
    // Exactly one same-type one-handed partner = valid dual-wield loadout
    if (candidates.length !== 1) return null;
    return candidates[0];
}
function SectionLabel({ text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
            fontWeight: 700,
            color: GOLD_DIM,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            margin: '12px 0 6px'
        },
        children: text
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
_c = SectionLabel;
/** Fake weapon entry for Unarmed/Brawl */ const UNARMED_WEAPON = {
    id: '__unarmed__',
    character_id: '',
    weapon_key: '__unarmed__',
    custom_name: 'Unarmed / Brawl',
    is_equipped: true,
    equip_state: 'equipped',
    attachments: [],
    notes: '',
    _isUnarmed: true
};
function WeaponSelectStep({ attackType, character, weapons, refWeaponMap, refSkillMap, refWeaponQualityMap, charSkills, selectedWeapon, onSelect, onNext, isGmMode, onEquipWeapon, onDualWieldSelect }) {
    _s();
    const [maneuverWarningFor, setManeuverWarningFor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [equipping, setEquipping] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const skillMap = Object.fromEntries(charSkills.map((s)=>[
            s.skill_key,
            s
        ]));
    function weaponMatchesType(w) {
        const ref = refWeaponMap[w.weapon_key];
        if (!ref?.skill_key) return false;
        if (attackType === 'ranged') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isRangedSkill"])(ref.skill_key);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMeleeSkill"])(ref.skill_key);
    }
    const matchingWeapons = weapons.filter(weaponMatchesType);
    const equipped = matchingWeapons.filter((w)=>w.equip_state === 'equipped' || w.is_equipped);
    const stowed = matchingWeapons.filter((w)=>w.equip_state !== 'equipped' && !w.is_equipped);
    function getPool(w) {
        if (w._isUnarmed) {
            const rank = skillMap['BRAWL']?.rank ?? 0;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSkillPool"])(character.brawn, rank);
        }
        const ref = refWeaponMap[w.weapon_key];
        const skill = ref?.skill_key ? refSkillMap[ref.skill_key] : null;
        const charKey = skill?.characteristic_key;
        const charVal = charKey ? character[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_FIELD_MAP"][charKey]] ?? 0 : 0;
        const rank = ref?.skill_key ? skillMap[ref.skill_key]?.rank ?? 0 : 0;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSkillPool"])(charVal, rank);
    }
    async function equipWeapon(w) {
        if (!onEquipWeapon) return;
        setEquipping(true);
        const idsToUnequip = equipped.filter((e)=>e.id !== w.id).map((e)=>e.id);
        await onEquipWeapon(w.id, idsToUnequip);
        setEquipping(false);
        setManeuverWarningFor(null);
        onSelect(w);
        onNext();
    }
    function renderWeaponCard(w, isStowed = false) {
        const isUnarmed = w._isUnarmed;
        const ref = isUnarmed ? null : refWeaponMap[w.weapon_key];
        const skill = ref?.skill_key ? refSkillMap[ref.skill_key] : null;
        const name = isUnarmed ? 'Unarmed / Brawl' : w.custom_name || ref?.name || 'Weapon';
        const isSelected = selectedWeapon?.id === w.id;
        const showWarning = maneuverWarningFor === w.id;
        const { proficiency, ability } = getPool(w);
        const isRangedType = ref?.skill_key ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isRangedSkill"])(ref.skill_key) : false;
        // A melee weapon is only brawn-scaled when damage_add is explicitly set;
        // fixed-damage melee weapons (e.g. lightsabers) have damage_add == null.
        const hasBrawnScale = !isRangedType && ref?.damage_add != null;
        const baseDmg = hasBrawnScale ? ref?.damage_add ?? 0 : ref?.damage ?? 0;
        const isMelee = hasBrawnScale;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>{
                        if (isStowed && !showWarning) {
                            setManeuverWarningFor(w.id);
                            return;
                        }
                        if (!isStowed) {
                            onSelect(isSelected ? null : w);
                        }
                    },
                    style: {
                        width: '100%',
                        padding: '10px 12px',
                        background: isSelected ? 'rgba(224,58,30,0.06)' : CARD_BG,
                        border: `${isSelected ? 2 : 1}px solid ${isSelected ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : GOLD_BD}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        textAlign: 'left',
                        opacity: isStowed ? 0.65 : 1,
                        transition: 'border-color 120ms, background 120ms'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 8
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
                                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                            fontWeight: 700,
                                            color: isSelected ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : TEXT,
                                            marginBottom: 4
                                        },
                                        children: name
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                        lineNumber: 197,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: "var(--font-body)",
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                            color: TEXT_DIM,
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '2px 10px',
                                            marginBottom: ref?.qualities?.length ? 6 : 0
                                        },
                                        children: [
                                            skill && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: skill.name
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                                lineNumber: 217,
                                                columnNumber: 27
                                            }, this),
                                            !isUnarmed && ref && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                                },
                                                children: [
                                                    "DMG ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$WeaponDamageDisplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WeaponDamageDisplay"], {
                                                        baseDamage: baseDmg,
                                                        isMelee: isMelee,
                                                        brawn: character.brawn
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                                        lineNumber: 220,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                                lineNumber: 219,
                                                columnNumber: 19
                                            }, this),
                                            isUnarmed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                                },
                                                children: "DMG +0+Br"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                                lineNumber: 227,
                                                columnNumber: 31
                                            }, this),
                                            !isUnarmed && ref && ref.crit > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM_COLOR"].failure
                                                },
                                                children: [
                                                    "CRIT ",
                                                    ref.crit
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                                lineNumber: 229,
                                                columnNumber: 19
                                            }, this),
                                            isUnarmed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM_COLOR"].failure
                                                },
                                                children: "CRIT 5"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                                lineNumber: 231,
                                                columnNumber: 31
                                            }, this),
                                            !isUnarmed && ref?.range_value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_LABELS"][ref.range_value] ?? ref.range_value
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                                lineNumber: 233,
                                                columnNumber: 19
                                            }, this),
                                            isUnarmed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Engaged"
                                            }, void 0, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                                lineNumber: 235,
                                                columnNumber: 31
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                        lineNumber: 208,
                                        columnNumber: 15
                                    }, this),
                                    !isUnarmed && ref?.qualities && ref.qualities.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 4
                                        },
                                        children: ref.qualities.map((q, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$character$2f$QualityBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QualityBadge"], {
                                                quality: q,
                                                refQualityMap: refWeaponQualityMap,
                                                variant: "desktop"
                                            }, i, false, {
                                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                                lineNumber: 242,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                        lineNumber: 240,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 2,
                                    flexShrink: 0,
                                    alignItems: 'center'
                                },
                                children: [
                                    Array.from({
                                        length: proficiency
                                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: 12,
                                                height: 12,
                                                background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DICE_COLOR"].proficiency,
                                                clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)'
                                            }
                                        }, `p${i}`, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                            lineNumber: 251,
                                            columnNumber: 17
                                        }, this)),
                                    Array.from({
                                        length: ability
                                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: 12,
                                                height: 12,
                                                background: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DICE_COLOR"].ability,
                                                transform: 'rotate(45deg)'
                                            }
                                        }, `a${i}`, false, {
                                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                            lineNumber: 257,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                lineNumber: 249,
                                columnNumber: 13
                            }, this),
                            isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: "var(--font-body)",
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                    flexShrink: 0,
                                    paddingLeft: 6
                                },
                                children: "✓ SELECTED"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                lineNumber: 265,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                        lineNumber: 194,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                    lineNumber: 172,
                    columnNumber: 9
                }, this),
                showWarning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: 'rgba(255,152,0,0.06)',
                        border: `1px solid ${ORANGE}50`,
                        borderRadius: '0 0 8px 8px',
                        borderTop: 'none',
                        padding: '12px 14px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                color: ORANGE,
                                marginBottom: 8,
                                fontWeight: 700
                            },
                            children: "⚠ Equipping costs a Maneuver"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                            lineNumber: 287,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                color: TEXT_DIM,
                                marginBottom: 12,
                                lineHeight: 1.4
                            },
                            children: [
                                "Equipping ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        color: TEXT
                                    },
                                    children: name
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                    lineNumber: 303,
                                    columnNumber: 25
                                }, this),
                                " will use one of your maneuvers this turn. You may pay for an extra maneuver by suffering 2 strain."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                            lineNumber: 296,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: 8
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setManeuverWarningFor(null),
                                    style: {
                                        flex: 1,
                                        padding: '8px 0',
                                        background: 'transparent',
                                        border: `1px solid var(--hud-border)`,
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                        color: TEXT_DIM
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                    lineNumber: 307,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>equipWeapon(w),
                                    disabled: equipping,
                                    style: {
                                        flex: 2,
                                        padding: '8px 0',
                                        background: equipping ? 'rgba(224,58,30,0.15)' : 'rgba(224,58,30,0.15)',
                                        border: `1px solid color-mix(in srgb, ${__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold} 38%, transparent)`,
                                        borderRadius: 6,
                                        cursor: equipping ? 'wait' : 'pointer',
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                    },
                                    children: equipping ? 'Equipping…' : 'Equip & Continue'
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                    lineNumber: 321,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                            lineNumber: 306,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                    lineNumber: 280,
                    columnNumber: 11
                }, this)
            ]
        }, w.id, true, {
            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
            lineNumber: 171,
            columnNumber: 7
        }, this);
    }
    const hasAnyWeapon = matchingWeapons.length > 0 || attackType === 'melee';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column'
        },
        children: [
            attackType === 'melee' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                        text: "Always Available"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                        lineNumber: 350,
                        columnNumber: 11
                    }, this),
                    renderWeaponCard(UNARMED_WEAPON)
                ]
            }, void 0, true),
            equipped.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                        text: "Equipped"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                        lineNumber: 358,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        },
                        children: equipped.map((w)=>renderWeaponCard(w, false))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                        lineNumber: 359,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            stowed.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                        text: "Stowed"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                        lineNumber: 368,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        },
                        children: stowed.map((w)=>renderWeaponCard(w, true))
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                        lineNumber: 369,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            !hasAnyWeapon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '40px 16px',
                    textAlign: 'center',
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    color: TEXT_DIM
                },
                children: [
                    "No ",
                    attackType === 'ranged' ? 'ranged' : 'melee',
                    " weapons found.",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                        lineNumber: 385,
                        columnNumber: 11
                    }, this),
                    "Add weapons to your inventory to make combat checks."
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                lineNumber: 377,
                columnNumber: 9
            }, this),
            (()=>{
                if (!selectedWeapon || !onDualWieldSelect) return null;
                const allEquipped = weapons.filter((w)=>w.equip_state === 'equipped' || w.is_equipped);
                const partner = findDualWieldPartner(selectedWeapon, allEquipped, refWeaponMap);
                if (!partner) return null;
                const partnerRef = refWeaponMap[partner.weapon_key];
                const partnerSkillName = partnerRef?.skill_key ? refSkillMap[partnerRef.skill_key]?.name ?? partnerRef.skill_key : 'Unknown';
                const partnerName = partner.custom_name || partnerRef?.name || 'Weapon';
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginTop: 16,
                        background: 'var(--hud-surface-lo)',
                        border: '1px solid var(--hud-border)',
                        borderRadius: 10,
                        padding: '14px 16px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                                fontWeight: 700,
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                marginBottom: 8
                            },
                            children: "⚔⚔  Dual Wield Available"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                            lineNumber: 409,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                color: 'var(--hud-text-dim)',
                                lineHeight: 1.4,
                                marginBottom: 14
                            },
                            children: [
                                "You also have ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        color: 'var(--hud-text)'
                                    },
                                    children: partnerName
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                    lineNumber: 427,
                                    columnNumber: 29
                                }, this),
                                " equipped (",
                                partnerSkillName,
                                ").",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                    lineNumber: 428,
                                    columnNumber: 15
                                }, this),
                                "Would you like to attack with both weapons?"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                            lineNumber: 420,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: 8
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onNext,
                                    style: {
                                        flex: 1,
                                        padding: '9px 0',
                                        background: 'transparent',
                                        border: '1px solid rgba(224,58,30,0.2)',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                        color: TEXT_DIM
                                    },
                                    children: "Single Weapon Attack"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                    lineNumber: 432,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>onDualWieldSelect(selectedWeapon, partner),
                                    style: {
                                        flex: 2,
                                        padding: '9px 0',
                                        background: 'linear-gradient(135deg, #E03A1E, #A02010)',
                                        border: 'none',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                        fontWeight: 700,
                                        color: 'var(--hud-bg)',
                                        letterSpacing: '0.08em'
                                    },
                                    children: "Dual Wield Attack"
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                                    lineNumber: 446,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                            lineNumber: 431,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
                    lineNumber: 402,
                    columnNumber: 11
                }, this);
            })()
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx",
        lineNumber: 346,
        columnNumber: 5
    }, this);
}
_s(WeaponSelectStep, "if3vFXG1HjPgL0D5hArOEd3OKws=");
_c1 = WeaponSelectStep;
var _c, _c1;
__turbopack_context__.k.register(_c, "SectionLabel");
__turbopack_context__.k.register(_c1, "WeaponSelectStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TargetSelectStep",
    ()=>TargetSelectStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-faint)';
const GOLD_BD = 'var(--hud-border)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
const CARD_BG = 'var(--hud-surface-lo)';
const TYPE_COLORS = {
    minion: 'rgba(224,58,30,0.4)',
    rival: '#FF9800',
    nemesis: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM_COLOR"].failure
};
function WoundBar({ current, max }) {
    const pct = max > 0 ? Math.min(1, current / max) : 0;
    const color = pct >= 0.75 ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM_COLOR"].failure : pct >= 0.5 ? '#FF9800' : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM_COLOR"].success;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 6
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    height: 4,
                    background: 'var(--hud-border)',
                    borderRadius: 2,
                    overflow: 'hidden'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        width: `${pct * 100}%`,
                        height: '100%',
                        background: color,
                        transition: 'width 200ms'
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: "var(--font-body)",
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: TEXT_DIM,
                    whiteSpace: 'nowrap'
                },
                children: [
                    current,
                    "/",
                    max
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_c = WoundBar;
function TargetSelectStep({ campaignId, attackType, selectedTargets, onSelect, gmTargets, enemies: propEnemies }) {
    _s();
    const [enemies, setEnemies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [encounterId, setEncounterId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TargetSelectStep.useEffect": ()=>{
            // GM mode: targets are provided directly — skip DB fetch
            if (gmTargets) {
                setEnemies(gmTargets);
                return;
            }
            // Parent pre-fetched enemies — skip DB fetch
            if (propEnemies) {
                setEnemies(propEnemies.filter({
                    "TargetSelectStep.useEffect": (a)=>a.revealed !== false
                }["TargetSelectStep.useEffect"]));
                return;
            }
            if (!campaignId) return;
            setLoading(true);
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            supabase.from('combat_encounters').select('id, adversaries').eq('campaign_id', campaignId).eq('is_active', true).limit(1).single().then({
                "TargetSelectStep.useEffect": ({ data, error: err })=>{
                    if (!err && data) {
                        setEncounterId(data.id);
                        const all = data.adversaries ?? [];
                        setEnemies(all.filter({
                            "TargetSelectStep.useEffect": (a)=>a.revealed !== false
                        }["TargetSelectStep.useEffect"]));
                    }
                    setLoading(false);
                }
            }["TargetSelectStep.useEffect"]);
        }
    }["TargetSelectStep.useEffect"], [
        campaignId,
        gmTargets,
        propEnemies
    ]);
    function toggleTarget(enemy) {
        const already = selectedTargets.find((t)=>t.instanceId === enemy.instanceId);
        if (already) {
            onSelect(selectedTargets.filter((t)=>t.instanceId !== enemy.instanceId));
        } else {
            onSelect([
                ...selectedTargets,
                enemy
            ]);
        }
    }
    function getWoundsDisplay(enemy) {
        if (enemy.type === 'minion') {
            const remaining = enemy.groupRemaining ?? enemy.groupSize ?? 1;
            const total = enemy.groupSize ?? 1;
            const wounds = (enemy.minionWounds ?? [])[0] ?? 0;
            return {
                current: wounds,
                max: enemy.woundThreshold,
                extra: `${remaining}/${total} remain`
            };
        }
        const current = enemy.woundsCurrent ?? 0;
        return {
            current,
            max: enemy.woundThreshold
        };
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: '32px 16px',
                textAlign: 'center',
                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                color: GOLD_DIM
            },
            children: "Loading encounter…"
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
            lineNumber: 106,
            columnNumber: 7
        }, this);
    }
    if (!campaignId) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: '32px 16px',
                textAlign: 'center'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: TEXT_DIM,
                        lineHeight: 1.5
                    },
                    children: "No campaign selected. Join a campaign to see combat targets."
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                    lineNumber: 115,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>onSelect([]),
                    style: {
                        marginTop: 16,
                        padding: '8px 20px',
                        background: 'rgba(224,58,30,0.1)',
                        border: `1px solid ${GOLD_BD}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                    },
                    children: "Skip Target"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
            lineNumber: 114,
            columnNumber: 7
        }, this);
    }
    if (enemies.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: '32px 16px',
                textAlign: 'center'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                        color: TEXT_DIM,
                        lineHeight: 1.5,
                        marginBottom: 16
                    },
                    children: [
                        "No enemies in the current encounter.",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                            lineNumber: 138,
                            columnNumber: 11
                        }, this),
                        "Ask your GM to add enemies to the initiative tracker."
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                    lineNumber: 136,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>onSelect([]),
                    style: {
                        padding: '10px 24px',
                        background: 'rgba(224,58,30,0.1)',
                        border: `1px solid ${GOLD_BD}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                    },
                    children: "Skip Target"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                    lineNumber: 141,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
            lineNumber: 135,
            columnNumber: 7
        }, this);
    }
    const multipleSelected = selectedTargets.length > 1;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            multipleSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: 'var(--hud-surface-lo)',
                    border: `1px solid var(--hud-border)`,
                    borderRadius: 6,
                    padding: '8px 12px',
                    marginBottom: 12,
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    color: GOLD_DIM
                },
                children: "ℹ Multiple targets selected. The GM will determine valid targeting."
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                lineNumber: 161,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                },
                children: enemies.map((enemy)=>{
                    const isSelected = selectedTargets.some((t)=>t.instanceId === enemy.instanceId);
                    const typeColor = TYPE_COLORS[enemy.type] ?? TEXT_DIM;
                    const wounds = getWoundsDisplay(enemy);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>toggleTarget(enemy),
                        style: {
                            width: '100%',
                            padding: '10px 12px',
                            background: isSelected ? 'rgba(224,58,30,0.06)' : CARD_BG,
                            border: `${isSelected ? 2 : 1}px solid ${isSelected ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : GOLD_BD}`,
                            borderRadius: 8,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'border-color 120ms, background 120ms'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    marginBottom: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: 28,
                                            height: 28,
                                            borderRadius: 4,
                                            background: `${typeColor}15`,
                                            border: `1px solid ${typeColor}40`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            fontFamily: "var(--font-body)",
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                            color: typeColor
                                        },
                                        children: [
                                            enemy.type === 'minion' && 'MIN',
                                            enemy.type === 'rival' && 'RVL',
                                            enemy.type === 'nemesis' && 'NEM'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                                        lineNumber: 192,
                                        columnNumber: 17
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
                                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                                                    fontWeight: 700,
                                                    color: isSelected ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : TEXT,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: [
                                                    enemy.name,
                                                    enemy.type === 'minion' && enemy.groupRemaining != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontFamily: "var(--font-body)",
                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                            color: TEXT_DIM,
                                                            marginLeft: 6
                                                        },
                                                        children: [
                                                            "×",
                                                            enemy.groupRemaining
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                                                        lineNumber: 216,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                                                lineNumber: 207,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    marginTop: 1
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontFamily: "var(--font-body)",
                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                            color: typeColor,
                                                            textTransform: 'capitalize'
                                                        },
                                                        children: enemy.type
                                                    }, void 0, false, {
                                                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                                                        lineNumber: 222,
                                                        columnNumber: 21
                                                    }, this),
                                                    enemy.soak > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontFamily: "var(--font-body)",
                                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                                            color: TEXT_DIM
                                                        },
                                                        children: [
                                                            "· Soak ",
                                                            enemy.soak
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                                                        lineNumber: 231,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                                                lineNumber: 221,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                                        lineNumber: 206,
                                        columnNumber: 17
                                    }, this),
                                    isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: "var(--font-body)",
                                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                            flexShrink: 0
                                        },
                                        children: "✓"
                                    }, void 0, false, {
                                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                                        lineNumber: 243,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                                lineNumber: 190,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WoundBar, {
                                current: wounds.current,
                                max: wounds.max
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                                lineNumber: 250,
                                columnNumber: 15
                            }, this)
                        ]
                    }, enemy.instanceId, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                        lineNumber: 178,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this),
            enemies.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onSelect([]),
                style: {
                    marginTop: 12,
                    width: '100%',
                    padding: '8px 0',
                    background: 'transparent',
                    border: `1px solid var(--hud-border)`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    color: TEXT_DIM
                },
                children: "Skip Target (GM will handle)"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
                lineNumber: 257,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx",
        lineNumber: 159,
        columnNumber: 5
    }, this);
}
_s(TargetSelectStep, "ZzsPWmVrvGS3eR1FcM55shkOEzA=");
_c1 = TargetSelectStep;
var _c, _c1;
__turbopack_context__.k.register(_c, "WoundBar");
__turbopack_context__.k.register(_c1, "TargetSelectStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RangeBandStep",
    ()=>RangeBandStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/dice/DiceFace.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/combatCheckUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-faint)';
const GOLD_BD = 'var(--hud-border)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
const CARD_BG = 'var(--hud-surface-lo)';
const PURPLE = '#9060D0';
function DifficultyDice({ count, challenge = 0, opposedLabel }) {
    if (opposedLabel) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                fontFamily: "var(--font-body)",
                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                color: GOLD_DIM
            },
            children: opposedLabel
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
            lineNumber: 34,
            columnNumber: 12
        }, this);
    }
    if (count === 0 && challenge === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                fontFamily: "var(--font-body)",
                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                color: TEXT_DIM
            },
            children: "Simple (—)"
        }, void 0, false, {
            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
            lineNumber: 37,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            gap: 3,
            alignItems: 'center',
            flexWrap: 'wrap'
        },
        children: [
            Array.from({
                length: count
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                    type: "difficulty",
                    size: 16
                }, `d${i}`, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)),
            Array.from({
                length: challenge
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                    type: "challenge",
                    size: 16
                }, `c${i}`, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                    lineNumber: 45,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_c = DifficultyDice;
function RangeBandStep({ attackType, weapon, selectedBand, onSelect }) {
    _s();
    // Derive melee range capability at top level (before any conditional returns)
    const meleeRefW = weapon?.refWeapon;
    const meleeMaxRange = meleeRefW?.range_value ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_VALUE_MAP"][meleeRefW.range_value] ?? 'engaged' : 'engaged';
    const canReachShort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bandIndex"])(meleeMaxRange) >= (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bandIndex"])('short');
    // Auto-select 'engaged' for melee weapons that can only reach engaged range.
    // Must be in useEffect — calling onSelect during render causes
    // "Cannot update a component while rendering a different component".
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RangeBandStep.useEffect": ()=>{
            if (attackType === 'melee' && !canReachShort && selectedBand !== 'engaged') {
                onSelect('engaged');
            }
        }
    }["RangeBandStep.useEffect"], [
        attackType,
        canReachShort,
        selectedBand,
        onSelect
    ]);
    // For melee, simplified view
    if (attackType === 'melee') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 8
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BandCard, {
                    band: "engaged",
                    label: "Engaged",
                    difficultyDice: 0,
                    challengeDice: 0,
                    notes: [
                        'Opposed check — difficulty set by target\'s Melee skill'
                    ],
                    blocked: false,
                    selected: selectedBand === 'engaged' || !canReachShort,
                    dimmed: false,
                    onSelect: onSelect,
                    isOnly: !canReachShort,
                    opposedLabel: "vs. Melee Skill"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this),
                canReachShort && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BandCard, {
                    band: "short",
                    label: "Short",
                    difficultyDice: 0,
                    challengeDice: 0,
                    notes: [
                        'Extended reach — opposed check difficulty unchanged'
                    ],
                    blocked: false,
                    selected: selectedBand === 'short',
                    dimmed: false,
                    onSelect: onSelect,
                    opposedLabel: "vs. Melee Skill"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                    lineNumber: 84,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
            lineNumber: 69,
            columnNumber: 7
        }, this);
    }
    // Ranged
    const refW = weapon?.refWeapon;
    const skillKey = weapon?.skillKey ?? 'RANGLT';
    const maxRange = refW?.range_value ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_VALUE_MAP"][refW.range_value] ?? 'extreme' : 'extreme';
    const DIFF_LABELS = [
        '—',
        'Easy',
        'Average',
        'Hard',
        'Daunting',
        'Formidable'
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 6
        },
        children: [
            __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_BAND_ORDER"].map((band)=>{
                const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRangedDifficulty"])(band, skillKey, maxRange);
                const blocked = result.blocked;
                const label = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_BAND_LABELS"][band];
                const diffLabel = blocked ? 'Out of range' : DIFF_LABELS[result.difficultyDice] ?? `${result.difficultyDice} Diff`;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BandCard, {
                    band: band,
                    label: label,
                    difficultyDice: result.difficultyDice,
                    challengeDice: result.challengeDice,
                    notes: result.notes,
                    blocked: blocked,
                    selected: selectedBand === band,
                    dimmed: blocked,
                    onSelect: onSelect,
                    diffLabel: diffLabel
                }, band, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                    lineNumber: 117,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 8,
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: TEXT_DIM,
                    lineHeight: 1.4,
                    padding: '8px 10px',
                    background: 'var(--hud-surface-lo)',
                    borderRadius: 6,
                    border: `1px solid var(--hud-border)`
                },
                children: [
                    "Max range: ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        style: {
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                        },
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_BAND_LABELS"][maxRange]
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                        lineNumber: 144,
                        columnNumber: 20
                    }, this),
                    ". Difficulty dice represent the check's inherent challenge."
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                lineNumber: 133,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
_s(RangeBandStep, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c1 = RangeBandStep;
function BandCard({ band, label, difficultyDice, challengeDice, notes, blocked, selected, dimmed, onSelect, diffLabel, isOnly, opposedLabel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: ()=>!blocked && onSelect(band),
        disabled: blocked,
        style: {
            width: '100%',
            padding: '10px 14px',
            background: selected ? 'rgba(224,58,30,0.06)' : 'rgba(224,58,30,0.01)',
            border: `${selected ? 2 : 1}px solid ${selected ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : 'rgba(224,58,30,0.12)'}`,
            borderRadius: 8,
            cursor: blocked ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            opacity: dimmed ? 0.35 : 1,
            transition: 'border-color 120ms, background 120ms',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
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
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            fontWeight: 700,
                            color: blocked ? TEXT_DIM : selected ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : TEXT,
                            marginBottom: notes.length > 0 ? 4 : 0
                        },
                        children: [
                            label,
                            isOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: "var(--font-body)",
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    color: GOLD_DIM,
                                    marginLeft: 8
                                },
                                children: "AUTO-SELECTED"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                                lineNumber: 196,
                                columnNumber: 22
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this),
                    notes.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: blocked ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM_COLOR"].failure : GOLD_DIM,
                            lineHeight: 1.3
                        },
                        children: notes.join(' · ')
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                        lineNumber: 199,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                lineNumber: 187,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flexShrink: 0,
                    textAlign: 'right'
                },
                children: [
                    !blocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DifficultyDice, {
                        count: difficultyDice,
                        challenge: challengeDice,
                        opposedLabel: opposedLabel
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                        lineNumber: 210,
                        columnNumber: 22
                    }, this),
                    blocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM_COLOR"].failure
                        },
                        children: diffLabel ?? 'Blocked'
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                        lineNumber: 212,
                        columnNumber: 11
                    }, this),
                    !blocked && diffLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: TEXT_DIM,
                            marginTop: 2
                        },
                        children: diffLabel
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                        lineNumber: 217,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
_c2 = BandCard;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "DifficultyDice");
__turbopack_context__.k.register(_c1, "RangeBandStep");
__turbopack_context__.k.register(_c2, "BandCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DicePoolReviewStep",
    ()=>DicePoolReviewStep,
    "EMPTY_ADJUSTMENTS",
    ()=>EMPTY_ADJUSTMENTS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/dice/DiceFace.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/dice-engine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/combatCheckUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-faint)';
const GOLD_BD = 'var(--hud-border)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
const EMPTY_ADJUSTMENTS = {
    boostAdd: 0,
    setbackAdd: 0,
    difficultyAdd: 0,
    abilityUpgrades: 0,
    difficultyUpgrades: 0
};
function SectionLabel({ text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
            fontWeight: 700,
            color: GOLD_DIM,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            margin: '16px 0 8px',
            borderBottom: `1px solid ${GOLD_BD}`,
            paddingBottom: 6
        },
        children: text
    }, void 0, false, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_c = SectionLabel;
function DiceRow({ label, types }) {
    const total = types.reduce((s, t)=>s + t.count, 0);
    if (total === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: "var(--font-body)",
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: TEXT_DIM,
                    width: 80,
                    flexShrink: 0
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 4,
                    flexWrap: 'wrap'
                },
                children: types.flatMap(({ type, count })=>Array.from({
                        length: count
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                            type: type,
                            size: 22
                        }, `${type}-${i}`, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                            lineNumber: 98,
                            columnNumber: 13
                        }, this)))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_c1 = DiceRow;
function AdjustControl({ label, value, onAdd, onRemove, min = 0 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 0',
            borderBottom: `1px solid var(--hud-border)`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    color: TEXT_DIM,
                    flex: 1
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onRemove,
                        disabled: value <= min,
                        style: {
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            cursor: value <= min ? 'not-allowed' : 'pointer',
                            background: 'transparent',
                            border: `1px solid ${GOLD_BD}`,
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: value <= min ? 'var(--hud-border-hi)' : GOLD_DIM,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        children: "−"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            width: 20,
                            textAlign: 'center'
                        },
                        children: value
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onAdd,
                        style: {
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            cursor: 'pointer',
                            background: 'rgba(224,58,30,0.1)',
                            border: `1px solid ${GOLD_BD}`,
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        children: "+"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                        lineNumber: 134,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
_c2 = AdjustControl;
function DicePoolReviewStep({ attackType, character, weapon, refWeapon, refSkill, charSkills, targets, rangeBand, skillModifiers, adjustments, onAdjustChange, onRoll, dualWield, refWeaponMap, refSkillMap, speciesAbilities = [], speciesName }) {
    _s();
    const [breakdownOpen, setBreakdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isUnarmed = weapon?.id === '__unarmed__';
    const skillKey = isUnarmed ? 'BRAWL' : refWeapon?.skill_key ?? '';
    // ── Determine if dual wield mode is active ────────────────────────────────
    const isDualWield = dualWield?.enabled === true && refWeaponMap && refSkillMap;
    // ── Standard pool (used when not dual wield) ──────────────────────────────
    const charKey = refSkill?.characteristic_key;
    const charVal = charKey ? character[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_FIELD_MAP"][charKey]] ?? 0 : isUnarmed ? character.brawn : 0;
    const skillData = charSkills.find((s)=>s.skill_key === skillKey);
    const rank = skillData?.rank ?? 0;
    let { proficiency: stdPro, ability: stdAbl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSkillPool"])(charVal, rank);
    // ── Dual wield pool calculation ───────────────────────────────────────────
    let dwPrimarySkillKey = '';
    let dwSecondarySkillKey = '';
    let dwUsedSkillRank = 0;
    let dwUsedChar = 0;
    let dwBaseDifficulty = 0;
    let dwPenaltyLabel = '';
    let dwPrimarySkillLabel = '';
    let dwSecondarySkillLabel = '';
    let dwPrimarySkillRank = 0;
    let dwSecondarySkillRank = 0;
    let dwPrimaryCharVal = 0;
    let dwSecondaryCharVal = 0;
    if (isDualWield && dualWield && refWeaponMap && refSkillMap) {
        const primaryRef = refWeaponMap[dualWield.primaryWeapon.weapon_key];
        const secondaryRef = refWeaponMap[dualWield.secondaryWeapon.weapon_key];
        dwPrimarySkillKey = primaryRef?.skill_key ?? '';
        dwSecondarySkillKey = secondaryRef?.skill_key ?? '';
        const primarySkillRef = refSkillMap[dwPrimarySkillKey];
        const secondarySkillRef = refSkillMap[dwSecondarySkillKey];
        const primaryCharKey = primarySkillRef?.characteristic_key ?? '';
        const secondaryCharKey = secondarySkillRef?.characteristic_key ?? '';
        dwPrimaryCharVal = primaryCharKey ? character[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_FIELD_MAP"][primaryCharKey]] ?? 0 : 0;
        dwSecondaryCharVal = secondaryCharKey ? character[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHAR_FIELD_MAP"][secondaryCharKey]] ?? 0 : 0;
        dwPrimarySkillRank = charSkills.find((s)=>s.skill_key === dwPrimarySkillKey)?.rank ?? 0;
        dwSecondarySkillRank = charSkills.find((s)=>s.skill_key === dwSecondarySkillKey)?.rank ?? 0;
        dwUsedSkillRank = Math.min(dwPrimarySkillRank, dwSecondarySkillRank);
        dwUsedChar = Math.min(dwPrimaryCharVal, dwSecondaryCharVal);
        // Base difficulty: higher of two attacks
        const primaryWeaponMaxRange = primaryRef?.range_value ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_VALUE_MAP"][primaryRef.range_value] ?? 'extreme' : 'extreme';
        const secondaryWeaponMaxRange = secondaryRef?.range_value ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_VALUE_MAP"][secondaryRef.range_value] ?? 'extreme' : 'extreme';
        const primaryDiff = rangeBand ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRangedDifficulty"])(rangeBand, dwPrimarySkillKey, primaryWeaponMaxRange) : {
            difficultyDice: 0
        };
        const secondaryDiff = rangeBand ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRangedDifficulty"])(rangeBand, dwSecondarySkillKey, secondaryWeaponMaxRange) : {
            difficultyDice: 0
        };
        dwBaseDifficulty = Math.max(primaryDiff.difficultyDice, secondaryDiff.difficultyDice);
        // Penalty
        const sameSkill = dwPrimarySkillKey === dwSecondarySkillKey;
        dwPenaltyLabel = sameSkill ? `+1 difficulty (same skill: ${primarySkillRef?.name ?? dwPrimarySkillKey})` : '+2 difficulty (different skills)';
        dwPrimarySkillLabel = primarySkillRef?.name ?? dwPrimarySkillKey;
        dwSecondarySkillLabel = secondarySkillRef?.name ?? dwSecondarySkillKey;
    }
    // ── Final pool values ─────────────────────────────────────────────────────
    let baseProf, baseAbl, baseDiff, baseChal;
    if (isDualWield) {
        const { proficiency, ability } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSkillPool"])(dwUsedChar, dwUsedSkillRank);
        const sameSkill = dwPrimarySkillKey === dwSecondarySkillKey;
        baseDiff = dwBaseDifficulty + (sameSkill ? 1 : 2) + adjustments.difficultyAdd;
        baseChal = 0;
        baseProf = proficiency;
        baseAbl = ability;
    } else {
        baseProf = stdPro;
        baseAbl = stdAbl;
        let difficultyDice = 0;
        let challengeDice = 0;
        if (attackType === 'ranged' && rangeBand) {
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRangedDifficulty"])(rangeBand, skillKey, refWeapon?.range_value ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_VALUE_MAP"][refWeapon.range_value] ?? 'extreme' : 'extreme');
            difficultyDice = result.difficultyDice;
            challengeDice = result.challengeDice;
        } else if (attackType === 'melee') {
            const primaryTarget = targets[0] ?? null;
            if (primaryTarget) {
                const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMeleeDifficulty"])(primaryTarget);
                difficultyDice = result.difficultyDice;
                challengeDice = result.challengeDice;
            } else {
                difficultyDice = 2;
            }
        }
        baseDiff = difficultyDice;
        baseChal = challengeDice;
    }
    // Apply ability upgrades
    const upgrades = Math.min(adjustments.abilityUpgrades, baseAbl);
    const finalPro = baseProf + upgrades;
    const finalAbl = baseAbl - upgrades;
    // Talent bonuses (use primary skill key for dual wield)
    const activeSk = isDualWield ? dwPrimarySkillKey : skillKey;
    const talentMod = skillModifiers[activeSk];
    const talentBoost = talentMod?.boostAdd ?? 0;
    const talentSbRemove = talentMod?.setbackRemove ?? 0;
    // Apply difficulty upgrades (for standard non-dual mode)
    let finalDiff, finalChal;
    if (isDualWield) {
        const diffUpgrades = Math.min(adjustments.difficultyUpgrades, baseDiff);
        finalDiff = baseDiff - diffUpgrades;
        finalChal = diffUpgrades;
    } else {
        const diffUpgrades = Math.min(adjustments.difficultyUpgrades, baseDiff);
        finalDiff = baseDiff - diffUpgrades + adjustments.difficultyAdd;
        finalChal = baseChal + diffUpgrades;
    }
    const netSetback = Math.max(0, adjustments.setbackAdd - talentSbRemove);
    const finalPool = {
        proficiency: finalPro,
        ability: finalAbl,
        boost: talentBoost + adjustments.boostAdd,
        difficulty: finalDiff,
        challenge: finalChal,
        setback: netSetback,
        force: 0
    };
    function adj(key, delta) {
        onAdjustChange({
            ...adjustments,
            [key]: Math.max(0, adjustments[key] + delta)
        });
    }
    const weaponName = isDualWield && dualWield ? `${dualWield.primaryWeapon.custom_name || refWeaponMap?.[dualWield.primaryWeapon.weapon_key]?.name || 'Primary'} + ${dualWield.secondaryWeapon.custom_name || refWeaponMap?.[dualWield.secondaryWeapon.weapon_key]?.name || 'Secondary'}` : isUnarmed ? 'Unarmed (Brawl)' : weapon?.custom_name || refWeapon?.name || 'Weapon';
    const targetName = targets.length === 1 ? targets[0].name : targets.length > 1 ? `${targets.length} targets` : undefined;
    // ── Melee difficulty labels (standard mode only) ──────────────────────────
    let meleeDifficultyNote;
    let meleeDiffDefault;
    let meleeRankDefaulted = false;
    if (!isDualWield && attackType === 'melee') {
        const primaryTarget = targets[0] ?? null;
        if (primaryTarget) {
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMeleeDifficulty"])(primaryTarget);
            meleeDifficultyNote = `Opposed check vs ${primaryTarget.name}'s Melee`;
            if (result.isDefault) {
                meleeDiffDefault = result.defaultNote;
                meleeRankDefaulted = true;
            }
        } else {
            meleeDifficultyNote = 'No target selected — using Average difficulty (2 difficulty dice)';
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: "var(--font-body)",
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: 'var(--hud-text-faint)',
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginBottom: 4
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: weaponName
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                        lineNumber: 331,
                        columnNumber: 9
                    }, this),
                    targetName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: 'var(--hud-text-faint)'
                                },
                                children: "→"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                                lineNumber: 332,
                                columnNumber: 26
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: targetName
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                                lineNumber: 332,
                                columnNumber: 83
                            }, this)
                        ]
                    }, void 0, true),
                    rangeBand && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: 'var(--hud-text-faint)'
                                },
                                children: "→"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                                lineNumber: 333,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_BAND_LABELS"][rangeBand]
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                                lineNumber: 333,
                                columnNumber: 82
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 324,
                columnNumber: 7
            }, this),
            isDualWield && dualWield && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 10,
                    padding: '8px 12px',
                    background: 'var(--hud-surface-lo)',
                    border: '1px solid var(--hud-border)',
                    borderRadius: 8,
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    color: 'var(--hud-text-dim)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: 'var(--hud-gold)',
                            fontWeight: 700
                        },
                        children: "DUAL WIELD ATTACK"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                        lineNumber: 348,
                        columnNumber: 11
                    }, this),
                    '  ',
                    "Primary: ",
                    dualWield.primaryWeapon.custom_name || refWeaponMap?.[dualWield.primaryWeapon.weapon_key]?.name || 'Primary',
                    " (",
                    dwPrimarySkillLabel,
                    ")",
                    '  ',
                    "·",
                    '  ',
                    "Secondary: ",
                    dualWield.secondaryWeapon.custom_name || refWeaponMap?.[dualWield.secondaryWeapon.weapon_key]?.name || 'Secondary',
                    " (",
                    dwSecondarySkillLabel,
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 338,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                text: "Your Dice"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 356,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DiceRow, {
                label: "Attack",
                types: [
                    {
                        type: 'proficiency',
                        count: finalPro
                    },
                    {
                        type: 'ability',
                        count: finalAbl
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 357,
                columnNumber: 7
            }, this),
            talentBoost + adjustments.boostAdd > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DiceRow, {
                label: "Bonus",
                types: [
                    {
                        type: 'boost',
                        count: talentBoost + adjustments.boostAdd
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 362,
                columnNumber: 9
            }, this),
            talentMod?.sources && talentMod.sources.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: 'rgba(41,182,246,0.7)',
                    marginBottom: 6
                },
                children: [
                    "Talent bonus: ",
                    talentMod.sources.join(', ')
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 365,
                columnNumber: 9
            }, this),
            talentSbRemove > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: 'var(--hud-text-faint)',
                    marginBottom: 6
                },
                children: [
                    "⊘ ",
                    talentSbRemove,
                    " setback removed by talent"
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 375,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                text: "Difficulty"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 386,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DiceRow, {
                label: "Difficulty",
                types: [
                    {
                        type: 'difficulty',
                        count: finalDiff
                    },
                    {
                        type: 'challenge',
                        count: finalChal
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 387,
                columnNumber: 7
            }, this),
            isDualWield && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: 'rgba(255,152,0,0.7)',
                    marginBottom: 6
                },
                children: dwPenaltyLabel
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 392,
                columnNumber: 9
            }, this),
            netSetback > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DiceRow, {
                label: "Setback",
                types: [
                    {
                        type: 'setback',
                        count: netSetback
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 402,
                columnNumber: 9
            }, this),
            meleeDifficultyNote && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: TEXT_DIM,
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                    marginBottom: 4
                },
                children: meleeDifficultyNote
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 405,
                columnNumber: 9
            }, this),
            meleeDiffDefault && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: 'rgba(255,152,0,0.7)',
                    marginBottom: 6
                },
                children: meleeDiffDefault
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 417,
                columnNumber: 9
            }, this),
            meleeRankDefaulted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].textFaint,
                    fontStyle: 'italic',
                    marginBottom: 6
                },
                children: "Melee: rank 0 (not listed — defaulting to Brawn)"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 427,
                columnNumber: 9
            }, this),
            isDualWield && dualWield && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setBreakdownOpen((v)=>!v),
                        style: {
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                            color: 'var(--hud-gold)',
                            textDecoration: 'underline',
                            marginBottom: breakdownOpen ? 8 : 0
                        },
                        children: [
                            breakdownOpen ? '▼' : '▶',
                            " Combined Check Breakdown"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                        lineNumber: 441,
                        columnNumber: 11
                    }, this),
                    breakdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: TEXT_DIM,
                            lineHeight: 1.8,
                            padding: '8px 10px',
                            background: 'transparent',
                            border: '1px solid var(--hud-border)',
                            borderRadius: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "Skill rank used:        ",
                                    dwUsedSkillRank,
                                    " (lower of ",
                                    dwPrimarySkillRank,
                                    " / ",
                                    dwSecondarySkillRank,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                                lineNumber: 466,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "Characteristic used:    ",
                                    dwUsedChar,
                                    " (lower of ",
                                    dwPrimarySkillLabel,
                                    " ",
                                    dwPrimaryCharVal,
                                    " / ",
                                    dwSecondarySkillLabel,
                                    " ",
                                    dwSecondaryCharVal,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                                lineNumber: 467,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "Base difficulty:        ",
                                    dwBaseDifficulty,
                                    " (",
                                    rangeBand ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_BAND_LABELS"][rangeBand] : '—',
                                    " range)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                                lineNumber: 468,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: dwPrimarySkillKey === dwSecondarySkillKey ? `Same-skill penalty: &nbsp;&nbsp;&nbsp;+1` : `Diff-skill penalty: &nbsp;&nbsp;&nbsp;&nbsp;+2`
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                                lineNumber: 469,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: '1px solid var(--hud-border)',
                                    marginTop: 4,
                                    paddingTop: 4
                                },
                                children: [
                                    "Final difficulty:       ",
                                    finalDiff + finalChal
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                                lineNumber: 474,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                        lineNumber: 456,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 440,
                columnNumber: 9
            }, this),
            speciesAbilities.filter((a)=>a.is_conditional && Array.isArray(a.affected_skills) && a.affected_skills.includes(activeSk)).map((a, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                        color: 'rgba(255,152,0,0.7)',
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                        marginBottom: 8,
                        padding: '6px 10px',
                        background: 'rgba(255,152,0,0.04)',
                        border: '1px solid rgba(255,152,0,0.18)',
                        borderRadius: 6
                    },
                    children: [
                        "⚠ ",
                        speciesName ? `${speciesName} — ` : '',
                        a.name,
                        ": ",
                        a.description,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: 4,
                                fontStyle: 'normal',
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                color: 'rgba(255,152,0,0.5)'
                            },
                            children: "Use manual adjustments above if this applies."
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                            lineNumber: 499,
                            columnNumber: 13
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                    lineNumber: 486,
                    columnNumber: 11
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionLabel, {
                text: "Manual Adjustments (GM Discretion)"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 507,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdjustControl, {
                label: "Additional Boost dice",
                value: adjustments.boostAdd,
                onAdd: ()=>adj('boostAdd', 1),
                onRemove: ()=>adj('boostAdd', -1)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 508,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdjustControl, {
                label: "Additional Setback dice",
                value: adjustments.setbackAdd,
                onAdd: ()=>adj('setbackAdd', 1),
                onRemove: ()=>adj('setbackAdd', -1)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 514,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdjustControl, {
                label: "Additional Difficulty dice",
                value: adjustments.difficultyAdd,
                onAdd: ()=>adj('difficultyAdd', 1),
                onRemove: ()=>adj('difficultyAdd', -1)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 520,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdjustControl, {
                label: "Upgrade Ability → Proficiency",
                value: adjustments.abilityUpgrades,
                onAdd: ()=>adj('abilityUpgrades', 1),
                onRemove: ()=>adj('abilityUpgrades', -1)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 526,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdjustControl, {
                label: "Upgrade Difficulty → Challenge",
                value: adjustments.difficultyUpgrades,
                onAdd: ()=>adj('difficultyUpgrades', 1),
                onRemove: ()=>adj('difficultyUpgrades', -1)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 532,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 16
                }
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 539,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onRoll(finalPool),
                style: {
                    width: '100%',
                    height: 48,
                    background: 'linear-gradient(135deg, #E03A1E, #A02010)',
                    border: 'none',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                    fontWeight: 700,
                    color: 'var(--hud-bg)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 16px rgba(224,58,30,0.3)'
                },
                children: isDualWield ? 'Roll Dual Wield Attack' : 'Roll Attack'
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
                lineNumber: 542,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx",
        lineNumber: 322,
        columnNumber: 5
    }, this);
}
_s(DicePoolReviewStep, "eOyJh4Jlcj+CCbrL5/DEORaGELU=");
_c3 = DicePoolReviewStep;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "SectionLabel");
__turbopack_context__.k.register(_c1, "DiceRow");
__turbopack_context__.k.register(_c2, "AdjustControl");
__turbopack_context__.k.register(_c3, "DicePoolReviewStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DualWieldReviewStep",
    ()=>DualWieldReviewStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
'use client';
;
;
// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-faint)';
const GOLD_BD = 'var(--hud-border)';
const GOLD_BG = 'var(--hud-surface-lo)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
const TEXT_MUTED = 'var(--hud-text-faint)';
function WeaponCard({ label, weapon, refWeapon }) {
    const name = weapon.custom_name || refWeapon?.name || 'Weapon';
    const skillName = refWeapon?.skill_key ? refWeapon.skill_key.replace('RANGLT', 'Ranged (Light)').replace('RANGHVY', 'Ranged (Heavy)').replace('BRAWL', 'Brawl').replace('MELEE', 'Melee').replace('GUNN', 'Gunnery').replace('LTSABER', 'Lightsaber') : 'Unknown';
    const isPrimary = label === 'PRIMARY';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            flex: 1,
            border: `1px solid ${isPrimary ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : GOLD_BD}`,
            borderRadius: 10,
            padding: '12px 14px',
            background: isPrimary ? GOLD_BG : 'transparent'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    fontWeight: 700,
                    color: isPrimary ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : GOLD_DIM,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    marginBottom: 8
                },
                children: [
                    label,
                    " WEAPON"
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    fontWeight: 700,
                    color: isPrimary ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold : TEXT,
                    marginBottom: 6,
                    lineHeight: 1.2
                },
                children: name
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: "var(--font-body)",
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: TEXT_DIM,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: skillName
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    refWeapon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                },
                                children: [
                                    "DMG ",
                                    refWeapon.damage_add != null ? `+${refWeapon.damage_add}` : refWeapon.damage
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM_COLOR"].failure
                                },
                                children: [
                                    "Crit ",
                                    refWeapon.crit
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_c = WeaponCard;
function DualWieldReviewStep({ primaryWeapon, secondaryWeapon, primaryRef, secondaryRef, onSwap }) {
    const sameSkill = primaryRef?.skill_key === secondaryRef?.skill_key;
    const primarySkillLabel = primaryRef?.skill_key ? primaryRef.skill_key.replace('RANGLT', 'Ranged Light').replace('RANGHVY', 'Ranged Heavy').replace('BRAWL', 'Brawl').replace('MELEE', 'Melee') : 'Unknown';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WeaponCard, {
                        label: "PRIMARY",
                        weapon: primaryWeapon,
                        refWeapon: primaryRef
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onSwap,
                        title: "Swap primary and secondary",
                        style: {
                            flexShrink: 0,
                            background: 'rgba(224,58,30,0.08)',
                            border: `1px solid ${GOLD_BD}`,
                            borderRadius: 8,
                            width: 36,
                            height: 36,
                            cursor: 'pointer',
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: GOLD_DIM,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        children: "⇄"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WeaponCard, {
                        label: "SECONDARY",
                        weapon: secondaryWeapon,
                        refWeapon: secondaryRef
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: GOLD_BG,
                    border: `1px solid ${GOLD_BD}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 14
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                        color: TEXT,
                        lineHeight: 1.5
                    },
                    children: [
                        "Primary hits on success.",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                            lineNumber: 143,
                            columnNumber: 35
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: GOLD_DIM
                            },
                            children: "Secondary hits by spending "
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                            lineNumber: 144,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                            className: "ffi ffi-swrpg-advantage",
                            style: {
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                            }
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                            lineNumber: 145,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                            className: "ffi ffi-swrpg-advantage",
                            style: {
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                            }
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                            lineNumber: 145,
                            columnNumber: 80
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                            },
                            children: ' or '
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                            lineNumber: 145,
                            columnNumber: 149
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                            className: "ffi ffi-swrpg-triumph",
                            style: {
                                color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                            }
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                            lineNumber: 145,
                            columnNumber: 198
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: GOLD_DIM
                            },
                            children: "."
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                            lineNumber: 146,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                lineNumber: 130,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontStyle: 'italic',
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    color: TEXT_MUTED,
                    lineHeight: 1.5
                },
                children: [
                    "Combined check uses lower skill rank and lower characteristic.",
                    ' ',
                    sameSkill ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            "Difficulty +1 (same skill: ",
                            primarySkillLabel,
                            ")."
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: "Difficulty +2 (different skills)."
                    }, void 0, false)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onSwap,
                style: {
                    marginTop: 16,
                    width: '100%',
                    padding: '8px 0',
                    background: 'transparent',
                    border: `1px solid ${GOLD_BD}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                    color: GOLD_DIM,
                    letterSpacing: '0.05em'
                },
                children: "⇄ Swap Primary / Secondary"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx",
        lineNumber: 102,
        columnNumber: 5
    }, this);
}
_c1 = DualWieldReviewStep;
var _c, _c1;
__turbopack_context__.k.register(_c, "WeaponCard");
__turbopack_context__.k.register(_c1, "DualWieldReviewStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RollResultStep",
    ()=>RollResultStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/dice/DiceFace.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$design$2d$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/design-tokens.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/combatCheckUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$criticalUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/criticalUtils.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
;
;
// ── Design tokens ──────────────────────────────────────────────────────────────
const GOLD_DIM = 'var(--hud-text-faint)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
function DieChip({ die }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative',
            width: 36,
            height: 36,
            flexShrink: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$dice$2f$DiceFace$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiceFace"], {
                type: die.type,
                size: 36
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0,
                    pointerEvents: 'none'
                },
                children: die.symbols.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: 11
                    },
                    children: "—"
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                    lineNumber: 47,
                    columnNumber: 13
                }, this) : die.symbols.map((s, j)=>{
                    const sym = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM"][s];
                    return sym ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                        className: `ffi ffi-${sym.icon}`,
                        style: {
                            fontSize: 11,
                            color: sym.color
                        }
                    }, j, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 51,
                        columnNumber: 19
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: 11
                        },
                        children: s
                    }, j, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 52,
                        columnNumber: 19
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
_c = DieChip;
function NetPill({ count, symKey }) {
    if (count === 0) return null;
    const { icon, color } = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM"][symKey];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 4,
            background: `${color}18`,
            border: `1px solid ${color}50`,
            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
            fontWeight: 700,
            color
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                className: `ffi ffi-${icon}`
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            Math.abs(count),
            " ",
            symKey === 'S' ? count > 0 ? 'Success' : 'Failure' : symKey === 'A' ? count > 0 ? 'Advantage' : 'Threat' : symKey === 'T' ? 'Triumph' : 'Despair'
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
_c1 = NetPill;
function CritBlock({ label, eligibility, result }) {
    if (!eligibility.isEligible) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            marginBottom: 8,
            padding: '8px 12px',
            background: 'rgba(255,152,0,0.06)',
            border: '1px solid rgba(255,152,0,0.35)',
            borderRadius: 7
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    fontWeight: 700,
                    color: '#FF9800',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 3
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                    color: 'rgba(255,152,0,0.85)',
                    lineHeight: 1.4
                },
                children: [
                    eligibility.triggeredByTriumph && eligibility.triggeredByAdvantage ? `Triumph + ${result.net.advantage} Advantages (≥ Crit ${eligibility.critRating})` : eligibility.triggeredByTriumph ? 'Triggered by Triumph — no advantage cost' : `${result.net.advantage} Advantages vs Crit Rating ${eligibility.critRating}`,
                    eligibility.totalCritModifier > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            marginLeft: 8,
                            color: '#FF9800',
                            fontWeight: 600
                        },
                        children: [
                            "· Roll +",
                            eligibility.totalCritModifier,
                            eligibility.viciousRating > 0 && ` (Vicious ${eligibility.viciousRating})`
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_c2 = CritBlock;
function RollResultStep({ result, attackType, weapon, refWeapon, targets, rangeBand, characterBrawn, critEligibility, onRollAgain, onNewAttack, dualWield, dualWieldSecondaryRef }) {
    const net = result.net;
    const succeeded = net.success > 0;
    const isDualWield = dualWield?.enabled === true;
    const isUnarmed = weapon?.id === '__unarmed__';
    const skillKey = isUnarmed ? 'BRAWL' : refWeapon?.skill_key ?? '';
    const isMelee = !(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isRangedSkill"])(skillKey);
    // ── Primary damage ────────────────────────────────────────────────────────
    // hasBrawnScale: only true when damage_add is explicitly set (brawn-scaled melee).
    // Fixed-damage melee weapons (lightsabers etc.) have damage_add == null → use damage directly.
    const primaryRef = isDualWield ? refWeapon : refWeapon;
    const hasBrawnScale = !isUnarmed && isMelee && primaryRef?.damage_add != null;
    const baseDmg = isUnarmed ? 0 : hasBrawnScale ? primaryRef?.damage_add ?? 0 : primaryRef?.damage ?? 0;
    const brawnBonus = hasBrawnScale ? characterBrawn : 0;
    const totalDmg = baseDmg + brawnBonus + (succeeded ? net.success : 0);
    // ── Secondary damage (dual wield) ─────────────────────────────────────────
    const secRef = dualWieldSecondaryRef ?? null;
    const secIsMelee = secRef ? !(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isRangedSkill"])(secRef.skill_key ?? '') : false;
    const secHasBrawnScale = secRef != null && secIsMelee && secRef.damage_add != null;
    const secBase = secRef ? secHasBrawnScale ? secRef.damage_add ?? 0 : secRef.damage ?? 0 : 0;
    const secBrawn = secHasBrawnScale ? characterBrawn : 0;
    const secTotalDmg = secBase + secBrawn + (succeeded ? net.success : 0);
    // Secondary crit eligibility
    const secCritElig = isDualWield && secRef && succeeded ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$criticalUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkCriticalEligibility"])(result, secRef, Math.max(0, secTotalDmg - (targets[0]?.soak ?? 0))) : null;
    const weaponName = isUnarmed ? 'Unarmed (Brawl)' : weapon?.custom_name || refWeapon?.name || 'Weapon';
    const targetName = targets.length === 1 ? targets[0].name : targets.length > 1 ? `${targets.length} targets` : null;
    const secWeaponName = dualWield?.secondaryWeapon ? dualWield.secondaryWeapon.custom_name || secRef?.name || 'Secondary' : 'Secondary';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '14px 16px',
                    background: succeeded ? 'rgba(76,175,80,0.08)' : 'rgba(224,80,80,0.08)',
                    border: `1px solid ${succeeded ? 'rgba(76,175,80,0.3)' : 'rgba(224,80,80,0.3)'}`,
                    borderRadius: 10,
                    textAlign: 'center',
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                            fontWeight: 700,
                            color: succeeded ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM_COLOR"].success : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYM_COLOR"].failure,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: 4
                        },
                        children: [
                            isDualWield ? succeeded ? '✦ PRIMARY HIT' : 'Miss' : succeeded ? 'Hit!' : 'Miss',
                            isDualWield && succeeded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    display: 'block',
                                    color: 'rgba(76,175,80,0.8)',
                                    textTransform: 'none',
                                    letterSpacing: 0,
                                    marginTop: 2
                                },
                                children: weaponName
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    succeeded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].sm,
                            color: TEXT
                        },
                        children: [
                            "Damage: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                style: {
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                },
                                children: totalDmg
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 177,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    color: TEXT_DIM,
                                    marginLeft: 6
                                },
                                children: [
                                    "(",
                                    hasBrawnScale ? `${baseDmg >= 0 ? '+' : ''}${baseDmg}+${characterBrawn} Brawn` : String(baseDmg),
                                    " + ",
                                    net.success,
                                    " success)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 178,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 176,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this),
            isDualWield && succeeded && secRef && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 16,
                    padding: '12px 14px',
                    background: 'var(--hud-surface-lo)',
                    border: '1px solid var(--hud-border)',
                    borderRadius: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                            fontWeight: 700,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            marginBottom: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                className: "ffi ffi-swrpg-advantage"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 203,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                className: "ffi ffi-swrpg-advantage"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 203,
                                columnNumber: 54
                            }, this),
                            " available — secondary: ",
                            secWeaponName
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 194,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: "var(--font-body)",
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: TEXT,
                            marginBottom: 4
                        },
                        children: [
                            "Secondary damage if hit: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                style: {
                                    color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold
                                },
                                children: secTotalDmg
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 206,
                                columnNumber: 38
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                    color: TEXT_DIM,
                                    marginLeft: 6
                                },
                                children: [
                                    "(",
                                    secBase >= 0 ? '' : '',
                                    secHasBrawnScale ? `+${secBase}+${characterBrawn} Brawn` : String(secBase),
                                    " + ",
                                    net.success,
                                    " success)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontStyle: 'italic',
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                            color: 'var(--hud-text-faint)'
                        },
                        children: [
                            "Secondary hit requires ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                className: "ffi ffi-swrpg-advantage"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 212,
                                columnNumber: 36
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                className: "ffi ffi-swrpg-advantage"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 212,
                                columnNumber: 77
                            }, this),
                            " or ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                className: "ffi ffi-swrpg-triumph"
                            }, void 0, false, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 212,
                                columnNumber: 122
                            }, this),
                            " — GM/player decides."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 211,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 187,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginBottom: 16
                },
                children: [
                    net.success !== 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NetPill, {
                        count: net.success,
                        symKey: net.success > 0 ? 'S' : 'F'
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 220,
                        columnNumber: 11
                    }, this),
                    net.advantage !== 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NetPill, {
                        count: net.advantage,
                        symKey: net.advantage > 0 ? 'A' : 'H'
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 223,
                        columnNumber: 11
                    }, this),
                    net.triumph > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NetPill, {
                        count: net.triumph,
                        symKey: "T"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 225,
                        columnNumber: 29
                    }, this),
                    net.despair > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NetPill, {
                        count: net.despair,
                        symKey: "D"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 226,
                        columnNumber: 29
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: "var(--font-body)",
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: GOLD_DIM,
                    marginBottom: 12
                },
                children: [
                    weaponName,
                    targetName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            " → ",
                            targetName
                        ]
                    }, void 0, true),
                    rangeBand && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            " · ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_BAND_LABELS"][rangeBand]
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 230,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                    color: GOLD_DIM,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: 8
                },
                children: "Dice rolled"
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 242,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginBottom: 20
                },
                children: result.dice.map((die, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DieChip, {
                        die: die
                    }, i, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 254,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 252,
                columnNumber: 7
            }, this),
            isDualWield && succeeded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 16
                },
                children: critEligibility?.isEligible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '10px 14px',
                        background: 'rgba(255,152,0,0.08)',
                        border: '1px solid rgba(255,152,0,0.45)',
                        borderRadius: 8,
                        marginBottom: 8
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                                fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                                fontWeight: 700,
                                color: '#FF9800',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                marginBottom: 4
                            },
                            children: "⚠ Critical Eligible"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                            lineNumber: 269,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CritBlock, {
                            label: `Primary (${weaponName}) · Crit ${critEligibility.critRating}`,
                            eligibility: critEligibility,
                            result: result
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                            lineNumber: 272,
                            columnNumber: 15
                        }, this),
                        secCritElig?.isEligible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CritBlock, {
                            label: `Secondary (${secWeaponName}) · Crit ${secCritElig.critRating} (if secondary hits)`,
                            eligibility: secCritElig,
                            result: result
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                            lineNumber: 274,
                            columnNumber: 17
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                    lineNumber: 262,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 260,
                columnNumber: 9
            }, this) : critEligibility?.isEligible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 16,
                    padding: '10px 14px',
                    background: 'rgba(255,152,0,0.08)',
                    border: '1px solid rgba(255,152,0,0.45)',
                    borderRadius: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                            fontWeight: 700,
                            color: '#FF9800',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: 4
                        },
                        children: "⚠ Critical Hit Available"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 288,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].caption,
                            color: 'rgba(255,152,0,0.85)',
                            lineHeight: 1.4
                        },
                        children: [
                            critEligibility.triggeredByTriumph && critEligibility.triggeredByAdvantage ? `Triumph + ${result.net.advantage} Advantages (≥ Crit ${critEligibility.critRating})` : critEligibility.triggeredByTriumph ? 'Triggered by Triumph — no advantage cost' : `${result.net.advantage} Advantages vs Crit Rating ${critEligibility.critRating}`,
                            critEligibility.totalCritModifier > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    marginLeft: 8,
                                    color: '#FF9800',
                                    fontWeight: 600
                                },
                                children: [
                                    "· Roll +",
                                    critEligibility.totalCritModifier,
                                    critEligibility.viciousRating > 0 && ` (Vicious ${critEligibility.viciousRating})`
                                ]
                            }, void 0, true, {
                                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                                lineNumber: 312,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 299,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 281,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onRollAgain,
                        style: {
                            width: '100%',
                            height: 44,
                            background: 'rgba(224,58,30,0.1)',
                            border: `1px solid ${GOLD_DIM}`,
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase'
                        },
                        children: "Roll Again"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 324,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onNewAttack,
                        style: {
                            width: '100%',
                            height: 44,
                            background: 'transparent',
                            border: `1px solid var(--hud-border)`,
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_BODY"],
                            fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].label,
                            color: TEXT_DIM
                        },
                        children: "New Attack"
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                        lineNumber: 339,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
                lineNumber: 323,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx",
        lineNumber: 149,
        columnNumber: 5
    }, this);
}
_c3 = RollResultStep;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "DieChip");
__turbopack_context__.k.register(_c1, "NetPill");
__turbopack_context__.k.register(_c2, "CritBlock");
__turbopack_context__.k.register(_c3, "RollResultStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CombatCheckOverlay",
    ()=>CombatCheckOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/player-hud/dice-engine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/combatCheckUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$criticalUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/criticalUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$AttackTypeStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/combat-check/steps/AttackTypeStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$WeaponSelectStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/combat-check/steps/WeaponSelectStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$TargetSelectStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/combat-check/steps/TargetSelectStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$RangeBandStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/combat-check/steps/RangeBandStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$DicePoolReviewStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/combat-check/steps/DicePoolReviewStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$DualWieldReviewStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/combat-check/steps/DualWieldReviewStep.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$RollResultStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/components/combat-check/steps/RollResultStep.tsx [app-client] (ecmascript)");
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
// ── Design tokens ──────────────────────────────────────────────────────────────
const BG = 'var(--hud-surface-hi)';
const GOLD_DIM = 'var(--hud-text-dim)';
const GOLD_BD = 'var(--hud-border)';
const GOLD_BAR = 'rgba(224,58,30,0.6)';
const TEXT = 'var(--hud-text)';
const TEXT_DIM = 'var(--hud-text-dim)';
// ── Step labels ───────────────────────────────────────────────────────────────
const STEP_LABELS = {
    1: 'Attack Type',
    2: 'Weapon',
    3: 'Target',
    4: 'Range',
    5: 'Dice Pool'
};
function makeInitialState(initialAttackType) {
    return {
        currentStep: initialAttackType ? 2 : 1,
        attackType: initialAttackType,
        selectedWeapon: null,
        selectedTargets: [],
        selectedBand: null,
        adjustments: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$DicePoolReviewStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMPTY_ADJUSTMENTS"],
        rollResult: null,
        encounterId: null,
        dualWield: null,
        dualWieldReview: false
    };
}
function CombatCheckOverlay({ open, initialAttackType, onClose, character, weapons, charSkills, refWeaponMap, refSkillMap, refWeaponQualityMap, skillModifiers, campaignId, characterId, onRoll, gmOverrides, speciesAbilities = [], speciesName, encounterId: propEncounterId, encounterEnemies }) {
    _s();
    const { isGmMode, gmTargets, gmAlignment, gmHiddenFromPlayers } = gmOverrides ?? {};
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CombatCheckOverlay.useState": ()=>makeInitialState(initialAttackType)
    }["CombatCheckOverlay.useState"]);
    // Seed encounterId from prop so the combat_log write doesn't need a SELECT
    const seedEncounterId = propEncounterId ?? null;
    // ── Reset state when overlay opens ─────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CombatCheckOverlay.useEffect": ()=>{
            if (open) {
                setState(makeInitialState(initialAttackType));
            }
        }
    }["CombatCheckOverlay.useEffect"], [
        open,
        initialAttackType
    ]);
    // ── Derived ────────────────────────────────────────────────────────────────
    const totalSteps = state.attackType || state.currentStep > 1 ? 5 : 5;
    const initialStep = initialAttackType ? 2 : 1;
    const isResult = state.rollResult !== null;
    const refWeapon = state.selectedWeapon && state.selectedWeapon.id !== '__unarmed__' ? refWeaponMap[state.selectedWeapon.weapon_key] ?? null : null;
    const refSkill = refWeapon?.skill_key ? refSkillMap[refWeapon.skill_key] ?? null : null;
    // ── Derived crit eligibility (not state — pure function of existing state) ──
    const critEligibility = (()=>{
        if (!state.rollResult) return null;
        const isMelee = state.attackType === 'melee' || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MELEE_SKILL_KEYS"].includes(refWeapon?.skill_key ?? '');
        const rawDmg = (refWeapon?.damage ?? 0) + (isMelee ? character.brawn : 0) + Math.max(0, state.rollResult.net.success);
        const minSoak = state.selectedTargets.length > 0 ? Math.min(...state.selectedTargets.map((t)=>t.soak ?? 0)) : 0;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$criticalUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkCriticalEligibility"])(state.rollResult, refWeapon, Math.max(0, rawDmg - minSoak));
    })();
    // ── Navigation ────────────────────────────────────────────────────────────
    const goBack = ()=>{
        if (state.dualWieldReview) {
            // Back from Step 2b → return to weapon select, clear dual wield
            setState((s)=>({
                    ...s,
                    dualWieldReview: false,
                    dualWield: null
                }));
            return;
        }
        if (state.currentStep <= initialStep) return;
        setState((s)=>({
                ...s,
                currentStep: s.currentStep - 1,
                rollResult: null
            }));
    };
    const goNext = ()=>{
        if (state.dualWieldReview) {
            // Leaving Step 2b (dual wield confirmed) → write to DB then advance to Target
            const dw = state.dualWield;
            if (dw) {
                const primaryName = dw.primaryWeapon.custom_name || refWeaponMap[dw.primaryWeapon.weapon_key]?.name || null;
                const secondaryName = dw.secondaryWeapon.custom_name || refWeaponMap[dw.secondaryWeapon.weapon_key]?.name || null;
                void writeWeaponToParticipant(primaryName, secondaryName, dw.primaryWeapon.weapon_key, dw.secondaryWeapon.weapon_key);
            }
            setState((s)=>({
                    ...s,
                    dualWieldReview: false,
                    currentStep: 3
                }));
            return;
        }
        // Advancing past the weapon-select step → write to DB
        if (state.currentStep === 2 && state.selectedWeapon) {
            const w = state.selectedWeapon;
            const name = w.custom_name || refWeaponMap[w.weapon_key]?.name || null;
            void writeWeaponToParticipant(name, null, w.weapon_key, null);
        }
        setState((s)=>({
                ...s,
                currentStep: Math.min(s.currentStep + 1, totalSteps)
            }));
    };
    // ── Step change handlers ───────────────────────────────────────────────────
    const handleAttackType = (type)=>{
        setState((s)=>({
                ...s,
                attackType: type,
                currentStep: 2
            }));
    };
    // ── Write active weapon to combat_participants (GM view picks this up in real-time) ──
    const writeWeaponToParticipant = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CombatCheckOverlay.useCallback[writeWeaponToParticipant]": async (primaryName, secondaryName = null, primaryKey = null, secondaryKey = null)=>{
            if (isGmMode || !campaignId) return;
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            await supabase.from('combat_participants').update({
                active_weapon_name: primaryName,
                active_weapon_key: primaryKey,
                secondary_weapon_name: secondaryName,
                secondary_weapon_key: secondaryKey
            }).eq('campaign_id', campaignId).eq('character_id', characterId);
        }
    }["CombatCheckOverlay.useCallback[writeWeaponToParticipant]"], [
        isGmMode,
        campaignId,
        characterId
    ]);
    const handleEquipWeapon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CombatCheckOverlay.useCallback[handleEquipWeapon]": async (weaponId, idsToUnequip)=>{
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            for (const id of idsToUnequip){
                await supabase.from('character_weapons').update({
                    is_equipped: false,
                    equip_state: 'stowed'
                }).eq('id', id);
            }
            await supabase.from('character_weapons').update({
                is_equipped: true,
                equip_state: 'equipped'
            }).eq('id', weaponId);
        }
    }["CombatCheckOverlay.useCallback[handleEquipWeapon]"], []);
    // Clear selected weapon on close so the GM sees equipped baseline again
    const handleClose = ()=>{
        void writeWeaponToParticipant(null, null, null, null);
        onClose();
    };
    const handleWeaponSelect = (w)=>{
        // Only update local state — DB write happens when the player advances past this step
        setState((s)=>({
                ...s,
                selectedWeapon: w,
                selectedBand: null,
                dualWield: null,
                dualWieldReview: false
            }));
    };
    // ── Dual wield handlers ───────────────────────────────────────────────────
    const handleDualWieldSelect = (primary, secondary)=>{
        // Only update local state — DB write happens when the player confirms in DualWieldReviewStep
        setState((s)=>({
                ...s,
                dualWield: {
                    enabled: true,
                    primaryWeapon: primary,
                    secondaryWeapon: secondary
                },
                dualWieldReview: true
            }));
    };
    const handleDualWieldSwap = ()=>{
        // Only update local state — DB write happens when the player confirms in DualWieldReviewStep
        setState((s)=>{
            if (!s.dualWield) return s;
            return {
                ...s,
                dualWield: {
                    ...s.dualWield,
                    primaryWeapon: s.dualWield.secondaryWeapon,
                    secondaryWeapon: s.dualWield.primaryWeapon
                },
                selectedWeapon: s.dualWield.secondaryWeapon
            };
        });
    };
    const handleTargetSelect = (targets)=>{
        setState((s)=>({
                ...s,
                selectedTargets: targets
            }));
    };
    const handleBandSelect = (band)=>{
        setState((s)=>({
                ...s,
                selectedBand: band
            }));
    };
    const handleAdjustChange = (adj)=>{
        setState((s)=>({
                ...s,
                adjustments: adj
            }));
    };
    // ── Roll execution ─────────────────────────────────────────────────────────
    const handleRoll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CombatCheckOverlay.useCallback[handleRoll]": async (pool)=>{
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$player$2d$hud$2f$dice$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rollPool"])(pool);
            setState({
                "CombatCheckOverlay.useCallback[handleRoll]": (s)=>({
                        ...s,
                        rollResult: result
                    })
            }["CombatCheckOverlay.useCallback[handleRoll]"]);
            // ── Critical hit eligibility (for roll feed meta) ────────────────────────
            const isMeleeCheck = state.attackType === 'melee' || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MELEE_SKILL_KEYS"].includes(refWeapon?.skill_key ?? '');
            const rawDmgCheck = (refWeapon?.damage ?? 0) + (isMeleeCheck ? character.brawn : 0) + Math.max(0, result.net.success);
            const minSoak = state.selectedTargets.length > 0 ? Math.min(...state.selectedTargets.map({
                "CombatCheckOverlay.useCallback[handleRoll]": (t)=>t.soak ?? 0
            }["CombatCheckOverlay.useCallback[handleRoll]"])) : 0;
            const netDmgCheck = Math.max(0, rawDmgCheck - minSoak);
            const critEligibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$criticalUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkCriticalEligibility"])(result, refWeapon, netDmgCheck);
            const weaponName = state.selectedWeapon?.id === '__unarmed__' ? 'Unarmed (Brawl)' : state.selectedWeapon?.custom_name || refWeapon?.name || 'Attack';
            const targetName = state.selectedTargets.length === 1 ? state.selectedTargets[0].name : state.selectedTargets.length > 1 ? `${state.selectedTargets.length} targets` : undefined;
            const label = `${state.attackType === 'ranged' ? 'Ranged' : 'Melee'} Attack — ${weaponName}${targetName ? ` vs ${targetName}` : ''}`;
            // Fire to roll feed with combat-specific metadata for type-specific card rendering
            onRoll(result, label, pool, {
                rollType: 'combat',
                weaponName,
                targetName: targetName ?? undefined,
                rangeBand: state.selectedBand ?? undefined,
                weaponDamage: refWeapon?.damage ?? undefined,
                weaponDamageAdd: refWeapon?.damage_add ?? undefined,
                characterBrawn: character.brawn,
                attackType: state.attackType ?? 'ranged',
                critEligible: critEligibility.isEligible,
                critRating: critEligibility.critRating,
                critModifier: critEligibility.totalCritModifier
            });
            // Write to combat_log if in an encounter
            if (campaignId) {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
                // Prefer prop-seeded id → cached state → DB lookup (last resort)
                let encounterId = state.encounterId ?? seedEncounterId;
                if (!encounterId) {
                    const { data } = await supabase.from('combat_encounters').select('id').eq('campaign_id', campaignId).eq('is_active', true).limit(1).single();
                    encounterId = data?.id ?? null;
                    if (encounterId) setState({
                        "CombatCheckOverlay.useCallback[handleRoll]": (s)=>({
                                ...s,
                                encounterId
                            })
                    }["CombatCheckOverlay.useCallback[handleRoll]"]);
                }
                const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatResultSummary"])(result, weaponName, targetName, state.selectedBand ?? undefined);
                await supabase.from('combat_log').insert({
                    campaign_id: campaignId,
                    encounter_id: encounterId,
                    participant_name: character.name,
                    alignment: gmAlignment ?? 'player',
                    roll_type: `${state.attackType} attack`,
                    weapon_name: weaponName,
                    dice_pool: pool,
                    result: {
                        netSuccess: result.net.success,
                        netAdvantage: result.net.advantage,
                        triumph: result.net.triumph,
                        despair: result.net.despair,
                        succeeded: result.net.success > 0
                    },
                    result_summary: summary,
                    is_visible_to_players: isGmMode ? !gmHiddenFromPlayers : true
                });
                // ── Pending damage: create row(s) per target on a successful hit ─────────
                const netSuccesses = result.net.success;
                if (netSuccesses > 0 && state.selectedTargets.length > 0 && encounterId) {
                    const isMelee = state.attackType === 'melee' || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MELEE_SKILL_KEYS"].includes(refWeapon?.skill_key ?? '');
                    const baseDamage = refWeapon?.damage ?? 0;
                    const damageAdd = isMelee ? refWeapon?.damage_add ?? 0 : 0;
                    const brawnBonus = isMelee ? character.brawn : 0;
                    const pendingRows = [];
                    // Secondary weapon ref for dual wield
                    const secRef = state.dualWield?.enabled && state.dualWield.secondaryWeapon.weapon_key !== '__unarmed__' ? refWeaponMap[state.dualWield.secondaryWeapon.weapon_key] ?? null : null;
                    const secIsMelee = secRef ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$combatCheckUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MELEE_SKILL_KEYS"].includes(secRef.skill_key ?? '') : false;
                    const secBase = secRef ? secIsMelee ? secRef.damage_add ?? 0 : secRef.damage ?? 0 : 0;
                    const secBrawn = secIsMelee ? character.brawn : 0;
                    const secWeaponName = state.dualWield?.secondaryWeapon ? state.dualWield.secondaryWeapon.custom_name || secRef?.name || 'Secondary Weapon' : null;
                    for (const target of state.selectedTargets){
                        const rawDamage = baseDamage + brawnBonus + damageAdd + netSuccesses;
                        const soakValue = target.soak ?? 0;
                        const netDamage = Math.max(0, rawDamage - soakValue);
                        const critPerTarget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$criticalUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkCriticalEligibility"])(result, refWeapon, netDamage);
                        // Primary hit
                        pendingRows.push({
                            campaign_id: campaignId,
                            encounter_id: encounterId,
                            target_instance_id: target.instanceId,
                            attacker_name: character.name,
                            target_name: target.name,
                            raw_damage: rawDamage,
                            soak_value: soakValue,
                            net_damage: netDamage,
                            status: 'pending',
                            weapon_name: weaponName,
                            attack_type: state.attackType ?? 'ranged',
                            range_band: state.selectedBand ?? null,
                            crit_eligible: critPerTarget.isEligible,
                            crit_rating: critPerTarget.critRating,
                            crit_modifier: critPerTarget.totalCritModifier,
                            crit_triggered_by_triumph: critPerTarget.triggeredByTriumph
                        });
                        // Secondary hit (dual wield only)
                        if (state.dualWield?.enabled && secRef) {
                            const secRaw = secBase + secBrawn + netSuccesses;
                            const secNet = Math.max(0, secRaw - soakValue);
                            const secCrit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$criticalUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkCriticalEligibility"])(result, secRef, secNet);
                            pendingRows.push({
                                campaign_id: campaignId,
                                encounter_id: encounterId,
                                target_instance_id: target.instanceId,
                                attacker_name: character.name,
                                target_name: target.name,
                                raw_damage: secRaw,
                                soak_value: soakValue,
                                net_damage: secNet,
                                status: 'pending_secondary',
                                weapon_name: secWeaponName,
                                attack_type: state.attackType ?? 'ranged',
                                range_band: state.selectedBand ?? null,
                                crit_eligible: secCrit.isEligible,
                                crit_rating: secCrit.critRating,
                                crit_modifier: secCrit.totalCritModifier,
                                crit_triggered_by_triumph: secCrit.triggeredByTriumph
                            });
                        }
                    }
                    await supabase.from('pending_damage').insert(pendingRows);
                }
            }
        }
    }["CombatCheckOverlay.useCallback[handleRoll]"], [
        state,
        refWeapon,
        refWeaponMap,
        campaignId,
        character.name,
        character.brawn,
        onRoll,
        seedEncounterId
    ]);
    // ── Roll Again: reset to step 4, keep weapon/target/dual wield ───────────
    const handleRollAgain = ()=>{
        setState((s)=>({
                ...s,
                currentStep: 4,
                adjustments: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$DicePoolReviewStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMPTY_ADJUSTMENTS"],
                rollResult: null,
                dualWieldReview: false
            }));
    };
    // ── New Attack: reset everything and clear selected weapon from GM view ──────
    const handleNewAttack = ()=>{
        void writeWeaponToParticipant(null, null, null, null);
        setState(makeInitialState(initialAttackType));
    };
    // ── Can advance? ──────────────────────────────────────────────────────────
    function canAdvance() {
        if (state.dualWieldReview) return true // always can Continue from Step 2b
        ;
        switch(state.currentStep){
            case 1:
                return state.attackType !== null;
            case 2:
                return state.selectedWeapon !== null;
            case 3:
                return true // target is optional (skip allowed)
                ;
            case 4:
                return state.selectedBand !== null || state.attackType === 'melee';
            default:
                return false;
        }
    }
    // ── Derived: secondary refWeapon (for dual wield result display) ──────────
    const secondaryRefWeapon = state.dualWield?.secondaryWeapon && state.dualWield.secondaryWeapon.weapon_key !== '__unarmed__' ? refWeaponMap[state.dualWield.secondaryWeapon.weapon_key] ?? null : null;
    // ── Step label (with Step 2b support) ─────────────────────────────────────
    const currentStepLabel = state.dualWieldReview ? 'Dual Wield Review' : STEP_LABELS[state.currentStep] ?? '';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `hud-quick-drawer${open ? ' open' : ''}`,
        style: {
            background: BG,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRight: `1px solid var(--hud-border)`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '10px 14px',
                    borderBottom: `1px solid ${GOLD_BD}`,
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
                                color: GOLD_DIM,
                                visibility: !isResult && state.currentStep > initialStep ? 'visible' : 'hidden'
                            },
                            children: "← Back"
                        }, void 0, false, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                            lineNumber: 472,
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
                                        color: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HUD"].gold,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em'
                                    },
                                    children: isResult ? 'Attack Result' : state.dualWield?.enabled ? 'Dual Wield Attack' : state.attackType === 'ranged' ? 'Ranged Attack' : state.attackType === 'melee' ? 'Melee Attack' : 'Combat Check'
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                                    lineNumber: 485,
                                    columnNumber: 13
                                }, this),
                                !isResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontFamily: 'var(--font-body)',
                                        fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FS"].overline,
                                        color: GOLD_DIM,
                                        marginTop: 2
                                    },
                                    children: state.dualWieldReview ? `Step 2b of ${totalSteps} — ${currentStepLabel}` : `Step ${state.currentStep} of ${totalSteps} — ${currentStepLabel}`
                                }, void 0, false, {
                                    fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                                    lineNumber: 502,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                            lineNumber: 484,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleClose,
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
                            fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                            lineNumber: 516,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                    lineNumber: 470,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                lineNumber: 464,
                columnNumber: 7
            }, this),
            !isResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 4,
                    background: 'var(--hud-border)',
                    flexShrink: 0
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: '100%',
                        width: `${state.currentStep / totalSteps * 100}%`,
                        background: GOLD_BAR,
                        transition: 'width 200ms ease'
                    }
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                    lineNumber: 531,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                lineNumber: 530,
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
                    isResult && state.rollResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$RollResultStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RollResultStep"], {
                        result: state.rollResult,
                        attackType: state.attackType ?? 'ranged',
                        weapon: state.selectedWeapon,
                        refWeapon: refWeapon,
                        targets: state.selectedTargets,
                        rangeBand: state.selectedBand,
                        characterBrawn: character.brawn,
                        critEligibility: critEligibility,
                        onRollAgain: handleRollAgain,
                        onNewAttack: handleNewAttack,
                        dualWield: state.dualWield,
                        dualWieldSecondaryRef: secondaryRefWeapon
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                        lineNumber: 543,
                        columnNumber: 11
                    }, this),
                    !isResult && state.currentStep === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$AttackTypeStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AttackTypeStep"], {
                        onSelect: handleAttackType
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                        lineNumber: 560,
                        columnNumber: 11
                    }, this),
                    !isResult && state.currentStep === 2 && !state.dualWieldReview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$WeaponSelectStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WeaponSelectStep"], {
                        attackType: state.attackType ?? 'ranged',
                        character: character,
                        weapons: weapons,
                        refWeaponMap: refWeaponMap,
                        refSkillMap: refSkillMap,
                        refWeaponQualityMap: refWeaponQualityMap,
                        charSkills: charSkills,
                        selectedWeapon: state.selectedWeapon,
                        onSelect: handleWeaponSelect,
                        onNext: goNext,
                        isGmMode: isGmMode,
                        onEquipWeapon: handleEquipWeapon,
                        onDualWieldSelect: handleDualWieldSelect
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                        lineNumber: 564,
                        columnNumber: 11
                    }, this),
                    !isResult && state.currentStep === 2 && state.dualWieldReview && state.dualWield && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$DualWieldReviewStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DualWieldReviewStep"], {
                        primaryWeapon: state.dualWield.primaryWeapon,
                        secondaryWeapon: state.dualWield.secondaryWeapon,
                        primaryRef: refWeapon,
                        secondaryRef: secondaryRefWeapon,
                        onSwap: handleDualWieldSwap
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                        lineNumber: 582,
                        columnNumber: 11
                    }, this),
                    !isResult && state.currentStep === 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$TargetSelectStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TargetSelectStep"], {
                        campaignId: campaignId,
                        attackType: state.attackType ?? 'ranged',
                        selectedTargets: state.selectedTargets,
                        onSelect: handleTargetSelect,
                        gmTargets: gmTargets,
                        enemies: encounterEnemies
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                        lineNumber: 592,
                        columnNumber: 11
                    }, this),
                    !isResult && state.currentStep === 4 && state.attackType && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$RangeBandStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RangeBandStep"], {
                        attackType: state.attackType,
                        weapon: refWeapon ? {
                            skillKey: refWeapon.skill_key ?? '',
                            refWeapon
                        } : null,
                        selectedBand: state.selectedBand,
                        onSelect: handleBandSelect
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                        lineNumber: 603,
                        columnNumber: 11
                    }, this),
                    !isResult && state.currentStep === 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$components$2f$combat$2d$check$2f$steps$2f$DicePoolReviewStep$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DicePoolReviewStep"], {
                        attackType: state.attackType ?? 'ranged',
                        character: character,
                        weapon: state.selectedWeapon,
                        refWeapon: refWeapon,
                        refSkill: refSkill,
                        charSkills: charSkills,
                        targets: state.selectedTargets,
                        rangeBand: state.selectedBand,
                        skillModifiers: skillModifiers,
                        adjustments: state.adjustments,
                        onAdjustChange: handleAdjustChange,
                        onRoll: handleRoll,
                        dualWield: state.dualWield,
                        refWeaponMap: refWeaponMap,
                        refSkillMap: refSkillMap,
                        speciesAbilities: speciesAbilities,
                        speciesName: speciesName
                    }, void 0, false, {
                        fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                        lineNumber: 612,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                lineNumber: 541,
                columnNumber: 7
            }, this),
            !isResult && (state.dualWieldReview || state.currentStep >= 2 && state.currentStep <= 4) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '12px 16px',
                    borderTop: `1px solid ${GOLD_BD}`,
                    flexShrink: 0
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: goNext,
                    disabled: !canAdvance(),
                    style: {
                        width: '100%',
                        height: 48,
                        borderRadius: 10,
                        border: 'none',
                        cursor: canAdvance() ? 'pointer' : 'not-allowed',
                        fontFamily: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FONT_DISPLAY"],
                        fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        background: canAdvance() ? 'linear-gradient(135deg, #E03A1E, #A02010)' : 'rgba(224,58,30,0.15)',
                        color: canAdvance() ? 'var(--hud-bg)' : 'var(--hud-text-faint)',
                        transition: 'background 150ms'
                    },
                    children: state.dualWieldReview ? 'Continue →' : state.currentStep === 3 && state.selectedTargets.length === 0 ? 'Skip / Next' : 'Next'
                }, void 0, false, {
                    fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                    lineNumber: 637,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
                lineNumber: 636,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/star-wars-rpg/src/components/combat-check/CombatCheckOverlay.tsx",
        lineNumber: 454,
        columnNumber: 5
    }, this);
}
_s(CombatCheckOverlay, "EEXk23TtQFoDoTt0fstoB5SBgHA=");
_c = CombatCheckOverlay;
var _c;
__turbopack_context__.k.register(_c, "CombatCheckOverlay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=star-wars-rpg_src_components_combat-check_0c82fb41._.js.map