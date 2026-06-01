(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/src/hooks/useCharacterData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCharacterData",
    ()=>useCharacterData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/types.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function useCharacterData(characterId) {
    _s();
    // Track self-initiated DB writes so we don't toast our own changes
    const selfMutatingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const markSelf = ()=>{
        selfMutatingRef.current = true;
        setTimeout(()=>{
            selfMutatingRef.current = false;
        }, 2000);
    };
    const [character, setCharacter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [skills, setSkills] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [talents, setTalents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [weapons, setWeapons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [armor, setArmor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [gear, setGear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [crits, setCrits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [charSpecs, setCharSpecs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refSkills, setRefSkills] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refTalents, setRefTalents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refWeapons, setRefWeapons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refArmor, setRefArmor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refGear, setRefGear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refCrits, setRefCrits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refSpecs, setRefSpecs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refDescriptors, setRefDescriptors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refCareers, setRefCareers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refSpeciesAll, setRefSpeciesAll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [charForceAbilities, setCharForceAbilities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refForcePowers, setRefForcePowers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refForceAbilities, setRefForceAbilities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refWeaponQualities, setRefWeaponQualities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refItemAttachments, setRefItemAttachments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refObligationTypes, setRefObligationTypes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [refDutyTypes, setRefDutyTypes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [playerName, setPlayerName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Player');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const loadCharacter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCharacterData.useCallback[loadCharacter]": async (silent = false)=>{
            if (!silent) setLoading(true);
            try {
                const [charRes, skillsRes, talentsRes, weaponsRes, armorRes, gearRes, critsRes, specsRes, refSkRes, refTalRes, refWpnRes, refArmRes, refGearRes, refCritRes, refSpecRes, refDescRes, refCareerRes, refSpeciesRes, forceAbilRes, refFpRes, refFaRes, refWqRes, refAttRes, refOblTypesRes, refDutyTypesRes] = await Promise.all([
                    supabase.from('characters').select('*').eq('id', characterId).single(),
                    supabase.from('character_skills').select('*').eq('character_id', characterId),
                    supabase.from('character_talents').select('*').eq('character_id', characterId),
                    supabase.from('character_weapons').select('*').eq('character_id', characterId).eq('is_dropped', false),
                    supabase.from('character_armor').select('*').eq('character_id', characterId).eq('is_dropped', false),
                    supabase.from('character_gear').select('*').eq('character_id', characterId).eq('is_dropped', false),
                    supabase.from('character_critical_injuries').select('*').eq('character_id', characterId).eq('is_healed', false),
                    supabase.from('character_specializations').select('*').eq('character_id', characterId),
                    supabase.from('ref_skills').select('*'),
                    supabase.from('ref_talents').select('*'),
                    supabase.from('ref_weapons').select('*'),
                    supabase.from('ref_armor').select('*'),
                    supabase.from('ref_gear').select('*'),
                    supabase.from('ref_critical_injuries').select('*').order('roll_min'),
                    supabase.from('ref_specializations').select('*'),
                    supabase.from('ref_item_descriptors').select('*'),
                    supabase.from('ref_careers').select('*'),
                    supabase.from('ref_species').select('*'),
                    supabase.from('character_force_abilities').select('*').eq('character_id', characterId),
                    supabase.from('ref_force_powers').select('*'),
                    supabase.from('ref_force_abilities').select('*'),
                    supabase.from('ref_weapon_qualities').select('*'),
                    supabase.from('ref_item_attachments').select('*'),
                    supabase.from('ref_obligation_types').select('key, name'),
                    supabase.from('ref_duty_types').select('key, name')
                ]);
                if (charRes.error) throw new Error(charRes.error.message);
                setCharacter(charRes.data);
                setSkills(skillsRes.data || []);
                setTalents(talentsRes.data || []);
                setWeapons(weaponsRes.data || []);
                setArmor(armorRes.data || []);
                setGear(gearRes.data || []);
                setCrits(critsRes.data || []);
                setCharSpecs(specsRes.data || []);
                setRefSkills(refSkRes.data || []);
                setRefTalents(refTalRes.data || []);
                setRefWeapons(refWpnRes.data || []);
                setRefArmor(refArmRes.data || []);
                setRefGear(refGearRes.data || []);
                setRefCrits(refCritRes.data || []);
                setRefSpecs(refSpecRes.data || []);
                setRefDescriptors(refDescRes.data || []);
                setRefCareers(refCareerRes.data || []);
                setRefSpeciesAll(refSpeciesRes.data || []);
                setCharForceAbilities(forceAbilRes.data || []);
                setRefForcePowers(refFpRes.data || []);
                setRefForceAbilities(refFaRes.data || []);
                setRefWeaponQualities(refWqRes.data || []);
                setRefItemAttachments(refAttRes.data || []);
                setRefObligationTypes(refOblTypesRes.data || []);
                setRefDutyTypes(refDutyTypesRes.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            }
            setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useCharacterData.useCallback[loadCharacter]"], [
        characterId
    ]);
    // Initial load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCharacterData.useEffect": ()=>{
            loadCharacter();
        }
    }["useCharacterData.useEffect"], [
        loadCharacter
    ]);
    // ── Realtime subscription ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCharacterData.useEffect": ()=>{
            const channel = supabase.channel(`character-${characterId}`).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'characters',
                filter: `id=eq.${characterId}`
            }, {
                "useCharacterData.useEffect.channel": ()=>{
                    if (!selfMutatingRef.current) (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Character sheet updated');
                    loadCharacter(true);
                }
            }["useCharacterData.useEffect.channel"]).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'character_critical_injuries',
                filter: `character_id=eq.${characterId}`
            }, {
                "useCharacterData.useEffect.channel": ()=>{
                    if (!selfMutatingRef.current) (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Critical injuries updated');
                    loadCharacter(true);
                }
            }["useCharacterData.useEffect.channel"]).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'character_skills',
                filter: `character_id=eq.${characterId}`
            }, {
                "useCharacterData.useEffect.channel": ()=>{
                    if (!selfMutatingRef.current) (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Skills updated');
                    loadCharacter(true);
                }
            }["useCharacterData.useEffect.channel"]).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'character_talents',
                filter: `character_id=eq.${characterId}`
            }, {
                "useCharacterData.useEffect.channel": ()=>{
                    if (!selfMutatingRef.current) (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Talents updated');
                    loadCharacter(true);
                }
            }["useCharacterData.useEffect.channel"]).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'character_weapons',
                filter: `character_id=eq.${characterId}`
            }, {
                "useCharacterData.useEffect.channel": ()=>{
                    if (!selfMutatingRef.current) (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Weapons updated');
                    loadCharacter(true);
                }
            }["useCharacterData.useEffect.channel"]).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'character_armor',
                filter: `character_id=eq.${characterId}`
            }, {
                "useCharacterData.useEffect.channel": ()=>{
                    if (!selfMutatingRef.current) (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Armor updated');
                    loadCharacter(true);
                }
            }["useCharacterData.useEffect.channel"]).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'character_gear',
                filter: `character_id=eq.${characterId}`
            }, {
                "useCharacterData.useEffect.channel": ()=>{
                    if (!selfMutatingRef.current) (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Gear updated');
                    loadCharacter(true);
                }
            }["useCharacterData.useEffect.channel"]).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'character_force_abilities',
                filter: `character_id=eq.${characterId}`
            }, {
                "useCharacterData.useEffect.channel": ()=>{
                    if (!selfMutatingRef.current) (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('Force abilities updated');
                    loadCharacter(true);
                }
            }["useCharacterData.useEffect.channel"]).subscribe();
            return ({
                "useCharacterData.useEffect": ()=>{
                    supabase.removeChannel(channel);
                }
            })["useCharacterData.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useCharacterData.useEffect"], [
        characterId
    ]);
    // ── Ref data maps ──
    const refSkillMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refSkillMap]": ()=>Object.fromEntries(refSkills.map({
                "useCharacterData.useMemo[refSkillMap]": (s)=>[
                        s.key,
                        s
                    ]
            }["useCharacterData.useMemo[refSkillMap]"]))
    }["useCharacterData.useMemo[refSkillMap]"], [
        refSkills
    ]);
    const refTalentMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refTalentMap]": ()=>Object.fromEntries(refTalents.map({
                "useCharacterData.useMemo[refTalentMap]": (t)=>[
                        t.key,
                        t
                    ]
            }["useCharacterData.useMemo[refTalentMap]"]))
    }["useCharacterData.useMemo[refTalentMap]"], [
        refTalents
    ]);
    const refWeaponMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refWeaponMap]": ()=>Object.fromEntries(refWeapons.map({
                "useCharacterData.useMemo[refWeaponMap]": (w)=>[
                        w.key,
                        w
                    ]
            }["useCharacterData.useMemo[refWeaponMap]"]))
    }["useCharacterData.useMemo[refWeaponMap]"], [
        refWeapons
    ]);
    const refArmorMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refArmorMap]": ()=>Object.fromEntries(refArmor.map({
                "useCharacterData.useMemo[refArmorMap]": (a)=>[
                        a.key,
                        a
                    ]
            }["useCharacterData.useMemo[refArmorMap]"]))
    }["useCharacterData.useMemo[refArmorMap]"], [
        refArmor
    ]);
    const refGearMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refGearMap]": ()=>Object.fromEntries(refGear.map({
                "useCharacterData.useMemo[refGearMap]": (g)=>[
                        g.key,
                        g
                    ]
            }["useCharacterData.useMemo[refGearMap]"]))
    }["useCharacterData.useMemo[refGearMap]"], [
        refGear
    ]);
    const refSpecMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refSpecMap]": ()=>Object.fromEntries(refSpecs.map({
                "useCharacterData.useMemo[refSpecMap]": (s)=>[
                        s.key,
                        s
                    ]
            }["useCharacterData.useMemo[refSpecMap]"]))
    }["useCharacterData.useMemo[refSpecMap]"], [
        refSpecs
    ]);
    const refDescriptorMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refDescriptorMap]": ()=>Object.fromEntries(refDescriptors.map({
                "useCharacterData.useMemo[refDescriptorMap]": (d)=>[
                        d.key,
                        d
                    ]
            }["useCharacterData.useMemo[refDescriptorMap]"]))
    }["useCharacterData.useMemo[refDescriptorMap]"], [
        refDescriptors
    ]);
    const refForcePowerMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refForcePowerMap]": ()=>Object.fromEntries(refForcePowers.map({
                "useCharacterData.useMemo[refForcePowerMap]": (fp)=>[
                        fp.key,
                        fp
                    ]
            }["useCharacterData.useMemo[refForcePowerMap]"]))
    }["useCharacterData.useMemo[refForcePowerMap]"], [
        refForcePowers
    ]);
    const refForceAbilityMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refForceAbilityMap]": ()=>Object.fromEntries(refForceAbilities.map({
                "useCharacterData.useMemo[refForceAbilityMap]": (fa)=>[
                        fa.key,
                        fa
                    ]
            }["useCharacterData.useMemo[refForceAbilityMap]"]))
    }["useCharacterData.useMemo[refForceAbilityMap]"], [
        refForceAbilities
    ]);
    const refWeaponQualityMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refWeaponQualityMap]": ()=>Object.fromEntries(refWeaponQualities.map({
                "useCharacterData.useMemo[refWeaponQualityMap]": (q)=>[
                        q.key,
                        q
                    ]
            }["useCharacterData.useMemo[refWeaponQualityMap]"]))
    }["useCharacterData.useMemo[refWeaponQualityMap]"], [
        refWeaponQualities
    ]);
    const refAttachmentMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[refAttachmentMap]": ()=>Object.fromEntries(refItemAttachments.map({
                "useCharacterData.useMemo[refAttachmentMap]": (a)=>[
                        a.key,
                        a
                    ]
            }["useCharacterData.useMemo[refAttachmentMap]"]))
    }["useCharacterData.useMemo[refAttachmentMap]"], [
        refItemAttachments
    ]);
    // ── Derive force rating from career, FORCERAT talents, and Force-sensitive specs ──
    const forceRating = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[forceRating]": ()=>{
            const careerBase = refCareers.find({
                "useCharacterData.useMemo[forceRating]": (c)=>c.key === character?.career_key
            }["useCharacterData.useMemo[forceRating]"])?.force_rating ?? 0;
            const talentBonus = talents.filter({
                "useCharacterData.useMemo[forceRating].talentBonus": (t)=>t.talent_key === 'FORCERAT'
            }["useCharacterData.useMemo[forceRating].talentBonus"]).reduce({
                "useCharacterData.useMemo[forceRating].talentBonus": (sum, t)=>sum + (t.ranks || 1)
            }["useCharacterData.useMemo[forceRating].talentBonus"], 0);
            // Any Force-sensitive specialisation (e.g. FORCESENSITIVEEMERGENT) grants FR 1 at minimum
            const hasForceSpec = charSpecs.some({
                "useCharacterData.useMemo[forceRating].hasForceSpec": (cs)=>refSpecMap[cs.specialization_key]?.is_force_sensitive
            }["useCharacterData.useMemo[forceRating].hasForceSpec"]);
            const base = careerBase + talentBonus;
            return hasForceSpec ? Math.max(base, 1) : base;
        }
    }["useCharacterData.useMemo[forceRating]"], [
        talents,
        refCareers,
        character?.career_key,
        charSpecs,
        refSpecMap
    ]);
    // ── Apply talent stat modifiers to character (positive or negative delta) ──
    const applyTalentModifiers = (talentKey, direction)=>{
        const ref = refTalentMap[talentKey];
        if (!ref?.modifiers || !character) return {};
        const mods = ref.modifiers;
        const updates = {};
        if (mods.wound_threshold) updates.wound_threshold = character.wound_threshold + mods.wound_threshold * direction;
        if (mods.strain_threshold) updates.strain_threshold = character.strain_threshold + mods.strain_threshold * direction;
        if (mods.soak) updates.soak = character.soak + mods.soak * direction;
        if (mods.defense_ranged) updates.defense_ranged = character.defense_ranged + mods.defense_ranged * direction;
        if (mods.defense_melee) updates.defense_melee = character.defense_melee + mods.defense_melee * direction;
        return updates;
    };
    // ═══════════════════════════════════════
    // MUTATION HANDLERS
    // ═══════════════════════════════════════
    const handleVitalChange = async (field, delta)=>{
        if (!character) return;
        markSelf();
        const maxField = field === 'wound_current' ? 'wound_threshold' : 'strain_threshold';
        const newValue = Math.max(0, Math.min(character[field] + delta, character[maxField]));
        setCharacter({
            ...character,
            [field]: newValue
        });
        await supabase.from('characters').update({
            [field]: newValue
        }).eq('id', character.id);
    };
    /** Like handleVitalChange but with no upper cap — wounds/strain can exceed threshold. */ const handleVitalAdjust = async (field, delta)=>{
        if (!character) return;
        markSelf();
        const newValue = Math.max(0, character[field] + delta);
        setCharacter({
            ...character,
            [field]: newValue
        });
        await supabase.from('characters').update({
            [field]: newValue
        }).eq('id', character.id);
    };
    const handleBuySkill = async (skillKey, currentRank, isCareer)=>{
        if (!character) return;
        markSelf();
        const newRank = currentRank + 1;
        if (newRank > 5) return;
        const cost = newRank * 5 + (isCareer ? 0 : 5);
        if (character.xp_available < cost) return;
        const newXp = character.xp_available - cost;
        setCharacter({
            ...character,
            xp_available: newXp
        });
        setSkills((prev)=>prev.map((s)=>s.skill_key === skillKey ? {
                    ...s,
                    rank: newRank
                } : s));
        await Promise.all([
            supabase.from('character_skills').update({
                rank: newRank
            }).eq('character_id', character.id).eq('skill_key', skillKey),
            supabase.from('characters').update({
                xp_available: newXp
            }).eq('id', character.id),
            supabase.from('xp_transactions').insert({
                character_id: character.id,
                amount: -cost,
                reason: `Bought skill rank: ${skillKey} ${newRank}`
            })
        ]);
    };
    const cycleEquipState = (current)=>{
        if (current === 'equipped') return 'carrying';
        if (current === 'carrying') return 'stowed';
        return 'equipped';
    };
    const handleToggleWeaponEquipped = async (id)=>{
        const w = weapons.find((w)=>w.id === id);
        if (!w) return;
        markSelf();
        const next = cycleEquipState(w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying'));
        setWeapons((prev)=>prev.map((x)=>x.id === id ? {
                    ...x,
                    equip_state: next,
                    is_equipped: next === 'equipped'
                } : x));
        await supabase.from('character_weapons').update({
            equip_state: next,
            is_equipped: next === 'equipped'
        }).eq('id', id);
    };
    const handleSetEquipState = async (id, type, state, location)=>{
        markSelf();
        const locFields = state === 'stowed' && location ? {
            stow_location_id: location.id,
            stow_location_name: location.name,
            stow_location_type: location.type
        } : {
            stow_location_id: null,
            stow_location_name: null,
            stow_location_type: null
        };
        if (type === 'weapon') {
            setWeapons((prev)=>prev.map((x)=>x.id === id ? {
                        ...x,
                        equip_state: state,
                        is_equipped: state === 'equipped',
                        ...locFields
                    } : x));
            await supabase.from('character_weapons').update({
                equip_state: state,
                is_equipped: state === 'equipped',
                ...locFields
            }).eq('id', id);
        } else if (type === 'armor') {
            setArmor((prev)=>prev.map((x)=>x.id === id ? {
                        ...x,
                        equip_state: state,
                        is_equipped: state === 'equipped',
                        ...locFields
                    } : x));
            await supabase.from('character_armor').update({
                equip_state: state,
                is_equipped: state === 'equipped',
                ...locFields
            }).eq('id', id);
        } else {
            setGear((prev)=>prev.map((x)=>x.id === id ? {
                        ...x,
                        equip_state: state,
                        is_equipped: state === 'equipped',
                        ...locFields
                    } : x));
            await supabase.from('character_gear').update({
                equip_state: state,
                is_equipped: state === 'equipped',
                ...locFields
            }).eq('id', id);
        }
    };
    const handleToggleEquippedById = async (id, type)=>{
        markSelf();
        if (type === 'weapon') {
            const w = weapons.find((w)=>w.id === id);
            if (!w) return;
            const next = cycleEquipState(w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying'));
            setWeapons((prev)=>prev.map((x)=>x.id === id ? {
                        ...x,
                        equip_state: next,
                        is_equipped: next === 'equipped'
                    } : x));
            await supabase.from('character_weapons').update({
                equip_state: next,
                is_equipped: next === 'equipped'
            }).eq('id', id);
        } else if (type === 'armor') {
            const a = armor.find((a)=>a.id === id);
            if (!a) return;
            const next = cycleEquipState(a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying'));
            setArmor((prev)=>prev.map((x)=>x.id === id ? {
                        ...x,
                        equip_state: next,
                        is_equipped: next === 'equipped'
                    } : x));
            await supabase.from('character_armor').update({
                equip_state: next,
                is_equipped: next === 'equipped'
            }).eq('id', id);
        } else {
            const g = gear.find((g)=>g.id === id);
            if (!g) return;
            const next = cycleEquipState(g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying'));
            setGear((prev)=>prev.map((x)=>x.id === id ? {
                        ...x,
                        equip_state: next,
                        is_equipped: next === 'equipped'
                    } : x));
            await supabase.from('character_gear').update({
                equip_state: next,
                is_equipped: next === 'equipped'
            }).eq('id', id);
        }
    };
    const handleRollCrit = async ()=>{
        if (!character) return;
        markSelf();
        const roll = Math.floor(Math.random() * 100) + 1;
        const activeCrits = crits.filter((c)=>!c.is_healed).length;
        const adjustedRoll = roll + activeCrits * 10;
        const injury = refCrits.find((c)=>adjustedRoll >= c.roll_min && adjustedRoll <= c.roll_max) || refCrits[refCrits.length - 1];
        if (!injury) return;
        const newCrit = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["randomUUID"])(),
            character_id: character.id,
            injury_id: injury.id,
            custom_name: injury.name,
            severity: injury.severity,
            description: injury.description,
            is_healed: false,
            received_at: new Date().toISOString()
        };
        setCrits((prev)=>[
                ...prev,
                newCrit
            ]);
        await supabase.from('character_critical_injuries').insert({
            character_id: character.id,
            injury_id: injury.id,
            custom_name: injury.name,
            severity: injury.severity,
            description: injury.description,
            is_healed: false
        });
        alert(`Rolled ${roll}${activeCrits > 0 ? ` + ${activeCrits * 10} (${activeCrits} existing)` : ''} = ${adjustedRoll}\n\n${injury.severity}: ${injury.name}\n${injury.description || ''}`);
    };
    const handleHealCrit = async (critId)=>{
        markSelf();
        setCrits((prev)=>prev.filter((c)=>c.id !== critId));
        await supabase.from('character_critical_injuries').update({
            is_healed: true
        }).eq('id', critId);
    };
    const handlePortraitUpload = async (file)=>{
        if (!character) return;
        markSelf();
        const ext = file.name.split('.').pop() || 'png';
        const path = `${character.id}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('portraits').upload(path, file, {
            upsert: true
        });
        if (uploadErr) {
            alert('Upload failed: ' + uploadErr.message);
            return;
        }
        const { data: urlData } = supabase.storage.from('portraits').getPublicUrl(path);
        const publicUrl = urlData.publicUrl + '?t=' + Date.now();
        await supabase.from('characters').update({
            portrait_url: publicUrl
        }).eq('id', character.id);
        setCharacter({
            ...character,
            portrait_url: publicUrl
        });
    };
    const handlePortraitDelete = async ()=>{
        if (!character) return;
        markSelf();
        const url = character.portrait_url || '';
        const match = url.match(/portraits\/([^?]+)/);
        if (match) {
            await supabase.storage.from('portraits').remove([
                match[1]
            ]);
        }
        await supabase.from('characters').update({
            portrait_url: null
        }).eq('id', character.id);
        setCharacter({
            ...character,
            portrait_url: undefined
        });
    };
    const handleCharacteristicChange = async (field, delta)=>{
        if (!character) return;
        markSelf();
        const key = field;
        const current = character[key] || 0;
        const newValue = Math.max(0, Math.min(current + delta, 7));
        if (newValue === current) return;
        setCharacter({
            ...character,
            [key]: newValue
        });
        await supabase.from('characters').update({
            [key]: newValue
        }).eq('id', character.id);
    };
    const handleSoakChange = async (delta)=>{
        if (!character) return;
        markSelf();
        const newValue = Math.max(0, character.soak + delta);
        setCharacter({
            ...character,
            soak: newValue
        });
        await supabase.from('characters').update({
            soak: newValue
        }).eq('id', character.id);
    };
    const handleDefenseChange = async (type, delta)=>{
        if (!character) return;
        markSelf();
        const field = type === 'ranged' ? 'defense_ranged' : 'defense_melee';
        const current = character[field];
        const newValue = Math.max(0, Math.min(current + delta, 5));
        if (newValue === current) return;
        setCharacter({
            ...character,
            [field]: newValue
        });
        await supabase.from('characters').update({
            [field]: newValue
        }).eq('id', character.id);
    };
    const handleMoralityChange = async (delta)=>{
        if (!character) return;
        markSelf();
        const current = character.morality_value || 50;
        const newValue = Math.max(0, Math.min(current + delta, 100));
        setCharacter({
            ...character,
            morality_value: newValue
        });
        await supabase.from('characters').update({
            morality_value: newValue
        }).eq('id', character.id);
    };
    const handleMoralityKeyChange = async (field, value)=>{
        if (!character) return;
        markSelf();
        const dbField = field === 'strength' ? 'morality_strength_key' : 'morality_weakness_key';
        setCharacter({
            ...character,
            [dbField]: value
        });
        await supabase.from('characters').update({
            [dbField]: value
        }).eq('id', character.id);
    };
    const handleObligationChange = async (field, val)=>{
        if (!character) return;
        markSelf();
        const dbField = field === 'type' ? 'obligation_type' : 'obligation_value';
        setCharacter({
            ...character,
            [dbField]: val
        });
        await supabase.from('characters').update({
            [dbField]: val
        }).eq('id', character.id);
    };
    const handleDutyChange = async (field, val)=>{
        if (!character) return;
        markSelf();
        const dbField = field === 'type' ? 'duty_type' : 'duty_value';
        setCharacter({
            ...character,
            [dbField]: val
        });
        await supabase.from('characters').update({
            [dbField]: val
        }).eq('id', character.id);
    };
    const handleRemoveWeapon = async (id, droppedBy = 'player', droppedNote)=>{
        markSelf();
        setWeapons((prev)=>prev.filter((w)=>w.id !== id));
        await supabase.from('character_weapons').update({
            is_dropped: true,
            dropped_at: new Date().toISOString(),
            dropped_by: droppedBy,
            ...droppedNote ? {
                dropped_note: droppedNote
            } : {}
        }).eq('id', id);
    };
    const handleRemoveEquipment = async (id, type, droppedBy = 'player', droppedNote)=>{
        markSelf();
        if (type === 'armor') {
            setArmor((prev)=>prev.filter((a)=>a.id !== id));
            await supabase.from('character_armor').update({
                is_dropped: true,
                dropped_at: new Date().toISOString(),
                dropped_by: droppedBy,
                ...droppedNote ? {
                    dropped_note: droppedNote
                } : {}
            }).eq('id', id);
        } else {
            setGear((prev)=>prev.filter((g)=>g.id !== id));
            await supabase.from('character_gear').update({
                is_dropped: true,
                dropped_at: new Date().toISOString(),
                dropped_by: droppedBy,
                ...droppedNote ? {
                    dropped_note: droppedNote
                } : {}
            }).eq('id', id);
        }
    };
    const handleRemoveTalent = async (talentId, xpCost)=>{
        if (!character) return;
        markSelf();
        const ct = talents.find((t)=>t.talent_key === talentId);
        if (!ct) return;
        const statUpdates = applyTalentModifiers(talentId, -1);
        const newXp = character.xp_available + xpCost;
        setCharacter({
            ...character,
            xp_available: newXp,
            ...statUpdates
        });
        setTalents((prev)=>prev.filter((t)=>t.id !== ct.id));
        await Promise.all([
            supabase.from('character_talents').delete().eq('id', ct.id),
            supabase.from('characters').update({
                xp_available: newXp,
                ...statUpdates
            }).eq('id', character.id),
            supabase.from('xp_transactions').insert({
                character_id: character.id,
                amount: xpCost,
                reason: `GM refund: removed talent ${talentId}`
            })
        ]);
    };
    const handleReduceSkill = async (skillKey, currentRank, isCareer)=>{
        if (!character || currentRank <= 0) return;
        markSelf();
        const refund = currentRank * 5 + (isCareer ? 0 : 5);
        const newRank = currentRank - 1;
        const newXp = character.xp_available + refund;
        setCharacter({
            ...character,
            xp_available: newXp
        });
        setSkills((prev)=>prev.map((s)=>s.skill_key === skillKey ? {
                    ...s,
                    rank: newRank
                } : s));
        await Promise.all([
            supabase.from('character_skills').update({
                rank: newRank
            }).eq('character_id', character.id).eq('skill_key', skillKey),
            supabase.from('characters').update({
                xp_available: newXp
            }).eq('id', character.id),
            supabase.from('xp_transactions').insert({
                character_id: character.id,
                amount: refund,
                reason: `GM refund: reduced skill ${skillKey} ${currentRank} → ${newRank}`
            })
        ]);
    };
    const handlePurchaseTalent = async (talentKey, row, col, activeSpecKey)=>{
        if (!character) return;
        markSelf();
        const cost = (row + 1) * 5;
        if (character.xp_available < cost) return;
        const statUpdates = applyTalentModifiers(talentKey, 1);
        const newXp = character.xp_available - cost;
        const newId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["randomUUID"])();
        setCharacter({
            ...character,
            xp_available: newXp,
            ...statUpdates
        });
        setTalents((prev)=>[
                ...prev,
                {
                    id: newId,
                    character_id: character.id,
                    talent_key: talentKey,
                    specialization_key: activeSpecKey,
                    tree_row: row,
                    tree_col: col,
                    ranks: 1,
                    xp_cost: cost
                }
            ]);
        await Promise.all([
            supabase.from('character_talents').insert({
                id: newId,
                character_id: character.id,
                talent_key: talentKey,
                specialization_key: activeSpecKey,
                tree_row: row,
                tree_col: col,
                ranks: 1,
                xp_cost: cost
            }),
            supabase.from('characters').update({
                xp_available: newXp,
                ...statUpdates
            }).eq('id', character.id),
            supabase.from('xp_transactions').insert({
                character_id: character.id,
                amount: -cost,
                reason: `Bought talent: ${talentKey} (row ${row})`
            })
        ]);
        return newId;
    };
    /** Deduct credits and log the spend to the roll feed. */ const handleCreditSpend = async (amount, campaignId)=>{
        if (!character) return;
        markSelf();
        const newCredits = character.credits - amount;
        setCharacter({
            ...character,
            credits: newCredits
        });
        await Promise.all([
            supabase.from('characters').update({
                credits: newCredits
            }).eq('id', character.id),
            supabase.from('roll_log').insert({
                campaign_id: campaignId,
                character_id: character.id,
                character_name: character.name,
                roll_label: `Spent ${amount.toLocaleString()} credits`,
                roll_type: 'Credit Spend',
                alignment: 'player',
                pool: {
                    proficiency: 0,
                    ability: 0,
                    boost: 0,
                    challenge: 0,
                    difficulty: 0,
                    setback: 0,
                    force: 0
                },
                result: {
                    netSuccess: 0,
                    netAdvantage: 0,
                    triumph: 0,
                    despair: 0,
                    succeeded: false
                },
                is_dm: false,
                hidden: false,
                is_visible_to_players: true
            })
        ]);
    };
    /** Save the characteristic chosen for a Dedication purchase and apply the +1. */ const handleResolveDedication = async (talentId, charKey)=>{
        if (!character) return;
        markSelf();
        const current = character[charKey] ?? 2;
        const newVal = Math.min(current + 1, 6);
        setCharacter({
            ...character,
            [charKey]: newVal
        });
        setTalents((prev)=>prev.map((t)=>t.id === talentId ? {
                    ...t,
                    dedication_characteristic: charKey
                } : t));
        await Promise.all([
            supabase.from('character_talents').update({
                dedication_characteristic: charKey
            }).eq('id', talentId),
            supabase.from('characters').update({
                [charKey]: newVal
            }).eq('id', character.id)
        ]);
    };
    const handleBackstoryChange = async (newBackstory)=>{
        if (!character) return;
        markSelf();
        setCharacter({
            ...character,
            backstory: newBackstory
        });
        await supabase.from('characters').update({
            backstory: newBackstory
        }).eq('id', character.id);
    };
    const handleNotesChange = async (newNotes)=>{
        if (!character) return;
        markSelf();
        setCharacter({
            ...character,
            notes: newNotes
        });
        await supabase.from('characters').update({
            notes: newNotes
        }).eq('id', character.id);
    };
    const handlePurchaseForceAbility = async (abilityKey, row, col, cost, activeForcePowerKey)=>{
        if (!character) return;
        if (character.xp_available < cost) return;
        markSelf();
        const newXp = character.xp_available - cost;
        setCharacter({
            ...character,
            xp_available: newXp
        });
        setCharForceAbilities((prev)=>[
                ...prev,
                {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["randomUUID"])(),
                    character_id: character.id,
                    force_power_key: activeForcePowerKey,
                    force_ability_key: abilityKey,
                    tree_row: row,
                    tree_col: col,
                    xp_cost: cost
                }
            ]);
        await Promise.all([
            supabase.from('character_force_abilities').insert({
                character_id: character.id,
                force_power_key: activeForcePowerKey,
                force_ability_key: abilityKey,
                tree_row: row,
                tree_col: col,
                xp_cost: cost
            }),
            supabase.from('characters').update({
                xp_available: newXp
            }).eq('id', character.id),
            supabase.from('xp_transactions').insert({
                character_id: character.id,
                amount: -cost,
                reason: `Bought force ability: ${abilityKey}`
            })
        ]);
    };
    // ── HUD transforms ──────────────────────────────────────────────────────────
    const speciesAbilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[speciesAbilities]": ()=>{
            const sp = refSpeciesAll.find({
                "useCharacterData.useMemo[speciesAbilities].sp": (s)=>s.key === character?.species_key
            }["useCharacterData.useMemo[speciesAbilities].sp"]);
            return sp?.special_abilities ?? [];
        }
    }["useCharacterData.useMemo[speciesAbilities]"], [
        refSpeciesAll,
        character?.species_key
    ]);
    const hudSkills = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[hudSkills]": ()=>{
            if (!character) return [];
            const charSkillMap = Object.fromEntries(skills.map({
                "useCharacterData.useMemo[hudSkills].charSkillMap": (s)=>[
                        s.skill_key,
                        s
                    ]
            }["useCharacterData.useMemo[hudSkills].charSkillMap"]));
            return refSkills.map({
                "useCharacterData.useMemo[hudSkills]": (rs)=>{
                    const cs = charSkillMap[rs.key];
                    const charKey = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CHARACTERISTIC_ABBR"][rs.characteristic_key];
                    const charVal = character[charKey] || 0;
                    return {
                        key: rs.key,
                        name: rs.name,
                        charKey,
                        charVal,
                        rank: cs?.rank || 0,
                        isCareer: cs?.is_career || false,
                        type: rs.type
                    };
                }
            }["useCharacterData.useMemo[hudSkills]"]).sort({
                "useCharacterData.useMemo[hudSkills]": (a, b)=>a.name.localeCompare(b.name)
            }["useCharacterData.useMemo[hudSkills]"]);
        }
    }["useCharacterData.useMemo[hudSkills]"], [
        character,
        skills,
        refSkills
    ]);
    const hudTalents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[hudTalents]": ()=>{
            const map = new Map();
            for (const t of talents){
                const ref = refTalentMap[t.talent_key];
                const existing = map.get(t.talent_key);
                if (existing) {
                    existing.rank = (existing.rank ?? 0) + (t.ranks ?? 1);
                } else {
                    map.set(t.talent_key, {
                        key: t.talent_key,
                        name: ref?.name || t.talent_key,
                        rank: t.ranks ?? 1,
                        activation: ref ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACTIVATION_LABELS"][ref.activation] || ref.activation : 'Passive',
                        description: ref?.description
                    });
                }
            }
            for (const sa of speciesAbilities){
                if (sa.mechanical_type !== 'talent_rank' || !sa.talent_key) continue;
                const ref = refTalentMap[sa.talent_key];
                if (!ref) continue;
                const existing = map.get(sa.talent_key);
                if (existing) {
                    existing.rank = (existing.rank ?? 0) + (sa.rank_add ?? 1);
                } else {
                    map.set(sa.talent_key, {
                        key: `species_${sa.talent_key}`,
                        name: ref.name,
                        rank: sa.rank_add ?? 1,
                        activation: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACTIVATION_LABELS"][ref.activation] || ref.activation,
                        description: ref.description,
                        isSpeciesGranted: true
                    });
                }
            }
            for (const sa of speciesAbilities){
                if (sa.mechanical_type !== 'die_modifier') continue;
                if (!Array.isArray(sa.affected_skills) || sa.affected_skills.length === 0) continue;
                const cardKey = `species_die_${sa.key}`;
                if (!map.has(cardKey)) {
                    map.set(cardKey, {
                        key: cardKey,
                        name: sa.name,
                        rank: 1,
                        activation: 'Passive',
                        description: sa.description,
                        isSpeciesGranted: true
                    });
                }
            }
            return Array.from(map.values());
        }
    }["useCharacterData.useMemo[hudTalents]"], [
        talents,
        refTalentMap,
        speciesAbilities
    ]);
    const VALID_CONDITIONS = new Set([
        'undamaged',
        'minor',
        'moderate',
        'major',
        'destroyed'
    ]);
    const hudWeapons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[hudWeapons]": ()=>weapons.map({
                "useCharacterData.useMemo[hudWeapons]": (w)=>{
                    const ref = w.weapon_key ? refWeaponMap[w.weapon_key] : null;
                    const isMeleeSkill = [
                        'MELEE',
                        'BRAWL',
                        'LTSABER'
                    ].includes(ref?.skill_key || '');
                    const hasBrawnScale = isMeleeSkill && ref?.damage_add != null;
                    const baseDamage = hasBrawnScale ? ref.damage_add ?? 0 : ref?.damage || 0;
                    const quals = Array.isArray(ref?.qualities) ? ref.qualities.map({
                        "useCharacterData.useMemo[hudWeapons]": (q)=>({
                                key: q.key,
                                count: q.count
                            })
                    }["useCharacterData.useMemo[hudWeapons]"]) : [];
                    return {
                        id: w.id,
                        name: w.custom_name || ref?.name || w.weapon_key || 'Unknown',
                        damage: {
                            baseDamage,
                            isMelee: hasBrawnScale,
                            brawn: hasBrawnScale ? character?.brawn ?? 0 : 0
                        },
                        crit: ref?.crit || 0,
                        range: ref?.range_value ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RANGE_LABELS"][ref.range_value] || '' : '',
                        enc: ref?.encumbrance || 0,
                        hardPoints: ref?.hard_points || 0,
                        qualities: quals,
                        equipState: w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying'),
                        skillName: ref?.skill_key ? refSkillMap[ref.skill_key]?.name || '' : '',
                        description: ref?.description ?? null,
                        condition: VALID_CONDITIONS.has(w.condition ?? '') ? w.condition : 'undamaged',
                        item_image_url: w.item_image_url ?? null,
                        stowLocation: w.equip_state === 'stowed' && w.stow_location_id && w.stow_location_type ? {
                            id: w.stow_location_id,
                            name: w.stow_location_name ?? '',
                            type: w.stow_location_type
                        } : null
                    };
                }
            }["useCharacterData.useMemo[hudWeapons]"])
    }["useCharacterData.useMemo[hudWeapons]"], [
        weapons,
        refWeaponMap,
        refSkillMap,
        character?.brawn
    ]);
    const hudArmor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[hudArmor]": ()=>armor.map({
                "useCharacterData.useMemo[hudArmor]": (a)=>{
                    const ref = a.armor_key ? refArmorMap[a.armor_key] : null;
                    return {
                        id: a.id,
                        name: a.custom_name || ref?.name || a.armor_key || 'Armor',
                        soak: ref?.soak || 0,
                        defense: ref?.defense || 0,
                        enc: ref?.encumbrance || 0,
                        hardPoints: ref?.hard_points || 0,
                        rarity: ref?.rarity || 0,
                        equipState: a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying'),
                        description: ref?.description ?? null,
                        condition: VALID_CONDITIONS.has(a.condition ?? '') ? a.condition : 'undamaged',
                        item_image_url: a.item_image_url ?? null,
                        stowLocation: a.equip_state === 'stowed' && a.stow_location_id && a.stow_location_type ? {
                            id: a.stow_location_id,
                            name: a.stow_location_name ?? '',
                            type: a.stow_location_type
                        } : null
                    };
                }
            }["useCharacterData.useMemo[hudArmor]"])
    }["useCharacterData.useMemo[hudArmor]"], [
        armor,
        refArmorMap
    ]);
    const hudGear = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[hudGear]": ()=>gear.map({
                "useCharacterData.useMemo[hudGear]": (g)=>{
                    const ref = g.gear_key ? refGearMap[g.gear_key] : null;
                    return {
                        id: g.id,
                        name: g.custom_name || ref?.name || g.gear_key || 'Gear',
                        qty: g.quantity,
                        enc: ref?.encumbrance || 0,
                        equipState: g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying'),
                        description: ref?.description ?? null,
                        condition: VALID_CONDITIONS.has(g.condition ?? '') ? g.condition : 'undamaged',
                        item_image_url: g.item_image_url ?? null,
                        stowLocation: g.equip_state === 'stowed' && g.stow_location_id && g.stow_location_type ? {
                            id: g.stow_location_id,
                            name: g.stow_location_name ?? '',
                            type: g.stow_location_type
                        } : null
                    };
                }
            }["useCharacterData.useMemo[hudGear]"])
    }["useCharacterData.useMemo[hudGear]"], [
        gear,
        refGearMap
    ]);
    const encumbranceCurrent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[encumbranceCurrent]": ()=>{
            let sum = 0;
            for (const a of armor){
                const state = a.equip_state ?? (a.is_equipped ? 'equipped' : 'carrying');
                if (state === 'stowed') continue;
                const enc = refArmorMap[a.armor_key]?.encumbrance || 0;
                sum += state === 'equipped' ? Math.max(0, enc - 3) : enc;
            }
            for (const g of gear){
                const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying');
                if (state === 'stowed') continue;
                sum += refGearMap[g.gear_key]?.encumbrance || 0;
            }
            for (const w of weapons){
                const state = w.equip_state ?? (w.is_equipped ? 'equipped' : 'carrying');
                if (state === 'stowed') continue;
                sum += refWeaponMap[w.weapon_key]?.encumbrance || 0;
            }
            return sum;
        }
    }["useCharacterData.useMemo[encumbranceCurrent]"], [
        armor,
        gear,
        weapons,
        refArmorMap,
        refGearMap,
        refWeaponMap
    ]);
    const encumbranceBonus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCharacterData.useMemo[encumbranceBonus]": ()=>gear.reduce({
                "useCharacterData.useMemo[encumbranceBonus]": (s, g)=>{
                    const state = g.equip_state ?? (g.is_equipped ? 'equipped' : 'carrying');
                    const ref = refGearMap[g.gear_key];
                    return s + (state === 'equipped' && ref?.encumbrance_bonus ? ref.encumbrance_bonus : 0);
                }
            }["useCharacterData.useMemo[encumbranceBonus]"], 0)
    }["useCharacterData.useMemo[encumbranceBonus]"], [
        gear,
        refGearMap
    ]);
    // ── End HUD transforms ───────────────────────────────────────────────────────
    const handleBuySpecialization = async (specKey, setActiveSpecKey)=>{
        if (!character) return;
        markSelf();
        const isCareer = refSpecs.find((s)=>s.key === specKey)?.career_key === character.career_key;
        const existingCount = charSpecs.length;
        const cost = isCareer ? existingCount * 10 : (existingCount + 1) * 10;
        if (character.xp_available < cost) {
            __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(`Not enough XP — need ${cost}, have ${character.xp_available}`);
            return;
        }
        const newXp = character.xp_available - cost;
        setCharacter({
            ...character,
            xp_available: newXp
        });
        const newSpec = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["randomUUID"])(),
            character_id: character.id,
            specialization_key: specKey,
            is_starting: false,
            purchase_order: existingCount
        };
        setCharSpecs((prev)=>[
                ...prev,
                newSpec
            ]);
        setActiveSpecKey(specKey);
        await Promise.all([
            supabase.from('character_specializations').insert({
                character_id: character.id,
                specialization_key: specKey,
                is_starting: false,
                purchase_order: existingCount
            }),
            supabase.from('characters').update({
                xp_available: newXp
            }).eq('id', character.id),
            supabase.from('xp_transactions').insert({
                character_id: character.id,
                amount: -cost,
                reason: `Bought specialization: ${specKey}`
            })
        ]);
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`Purchased ${refSpecMap[specKey]?.name || specKey}!`);
    };
    return {
        // State
        character,
        skills,
        talents,
        weapons,
        armor,
        gear,
        crits,
        charSpecs,
        charForceAbilities,
        playerName,
        loading,
        error,
        // Ref data
        refSkills,
        refTalents,
        refWeapons,
        refArmor,
        refGear,
        refCrits,
        refSpecs,
        refDescriptors,
        refCareers,
        refSpeciesAll,
        refForcePowers,
        refForceAbilities,
        refWeaponQualities,
        refObligationTypes,
        refDutyTypes,
        // Ref maps
        refSkillMap,
        refTalentMap,
        refWeaponMap,
        refArmorMap,
        refGearMap,
        refSpecMap,
        refDescriptorMap,
        refForcePowerMap,
        refForceAbilityMap,
        refWeaponQualityMap,
        refAttachmentMap,
        // Derived
        forceRating,
        // HUD transforms
        speciesAbilities,
        hudSkills,
        hudTalents,
        hudWeapons,
        hudArmor,
        hudGear,
        encumbranceCurrent,
        encumbranceBonus,
        // Supabase client (for broadcast listener in page)
        supabase,
        // Mutations
        handleVitalChange,
        handleVitalAdjust,
        handleBuySkill,
        handleToggleWeaponEquipped,
        handleToggleEquippedById,
        handleSetEquipState,
        handleRollCrit,
        handleHealCrit,
        handlePortraitUpload,
        handlePortraitDelete,
        handleCharacteristicChange,
        handleSoakChange,
        handleDefenseChange,
        handleMoralityChange,
        handleMoralityKeyChange,
        handleObligationChange,
        handleDutyChange,
        handleRemoveWeapon,
        handleRemoveEquipment,
        handleRemoveTalent,
        handleReduceSkill,
        handlePurchaseTalent,
        handleResolveDedication,
        handleCreditSpend,
        handleBackstoryChange,
        handleNotesChange,
        handlePurchaseForceAbility,
        handleBuySpecialization
    };
}
_s(useCharacterData, "DCR/TO71YdeZmCWrDWPNfEMC/70=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useTicker.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTicker",
    ()=>useTicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const STAGGER_MS = 28;
const CYCLE_INTERVAL_MS = 35;
const CYCLE_COUNT = 4;
function isScramblable(ch) {
    return /[A-Za-z0-9]/.test(ch);
}
function randomGlyph() {
    return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}
function buildSettledChars(text) {
    return text.split('').map((ch, i)=>({
            key: `char-${i}`,
            display: ch,
            settled: true
        }));
}
function useTicker(text, isOpen, delayMs = 60) {
    _s();
    const [chars, setChars] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "useTicker.useState": ()=>buildSettledChars(text)
    }["useTicker.useState"]);
    const timeoutIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const clearAllTimeouts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useTicker.useCallback[clearAllTimeouts]": ()=>{
            timeoutIds.current.forEach({
                "useTicker.useCallback[clearAllTimeouts]": (id)=>clearTimeout(id)
            }["useTicker.useCallback[clearAllTimeouts]"]);
            timeoutIds.current.clear();
        }
    }["useTicker.useCallback[clearAllTimeouts]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useTicker.useEffect": ()=>{
            if (!isOpen) {
                // Cancel any in-flight animation and reset to settled state immediately
                clearAllTimeouts();
                setChars(buildSettledChars(text));
                return;
            }
            // isOpen just became true — start the scramble after the initial delay
            const startId = setTimeout({
                "useTicker.useEffect.startId": ()=>{
                    timeoutIds.current.delete(startId);
                    text.split('').forEach({
                        "useTicker.useEffect.startId": (finalChar, charIndex)=>{
                            if (!isScramblable(finalChar)) {
                                // Spaces and special chars appear immediately at stagger time, settled
                                const staggerId = setTimeout({
                                    "useTicker.useEffect.startId.staggerId": ()=>{
                                        timeoutIds.current.delete(staggerId);
                                        setChars({
                                            "useTicker.useEffect.startId.staggerId": (prev)=>{
                                                const next = [
                                                    ...prev
                                                ];
                                                next[charIndex] = {
                                                    key: `char-${charIndex}`,
                                                    display: finalChar,
                                                    settled: true
                                                };
                                                return next;
                                            }
                                        }["useTicker.useEffect.startId.staggerId"]);
                                    }
                                }["useTicker.useEffect.startId.staggerId"], charIndex * STAGGER_MS);
                                timeoutIds.current.add(staggerId);
                                return;
                            }
                            const staggerOffset = charIndex * STAGGER_MS;
                            // Show first random glyph at stagger offset
                            const showId = setTimeout({
                                "useTicker.useEffect.startId.showId": ()=>{
                                    timeoutIds.current.delete(showId);
                                    setChars({
                                        "useTicker.useEffect.startId.showId": (prev)=>{
                                            const next = [
                                                ...prev
                                            ];
                                            next[charIndex] = {
                                                key: `char-${charIndex}`,
                                                display: randomGlyph(),
                                                settled: false
                                            };
                                            return next;
                                        }
                                    }["useTicker.useEffect.startId.showId"]);
                                    // Cycle through random glyphs
                                    for(let cycle = 1; cycle < CYCLE_COUNT; cycle++){
                                        const cycleId = setTimeout({
                                            "useTicker.useEffect.startId.showId.cycleId": ()=>{
                                                timeoutIds.current.delete(cycleId);
                                                setChars({
                                                    "useTicker.useEffect.startId.showId.cycleId": (prev)=>{
                                                        const next = [
                                                            ...prev
                                                        ];
                                                        next[charIndex] = {
                                                            key: `char-${charIndex}`,
                                                            display: randomGlyph(),
                                                            settled: false
                                                        };
                                                        return next;
                                                    }
                                                }["useTicker.useEffect.startId.showId.cycleId"]);
                                            }
                                        }["useTicker.useEffect.startId.showId.cycleId"], cycle * CYCLE_INTERVAL_MS);
                                        timeoutIds.current.add(cycleId);
                                    }
                                    // Land on final character after all cycles
                                    const landId = setTimeout({
                                        "useTicker.useEffect.startId.showId.landId": ()=>{
                                            timeoutIds.current.delete(landId);
                                            setChars({
                                                "useTicker.useEffect.startId.showId.landId": (prev)=>{
                                                    const next = [
                                                        ...prev
                                                    ];
                                                    next[charIndex] = {
                                                        key: `char-${charIndex}`,
                                                        display: finalChar,
                                                        settled: true
                                                    };
                                                    return next;
                                                }
                                            }["useTicker.useEffect.startId.showId.landId"]);
                                        }
                                    }["useTicker.useEffect.startId.showId.landId"], CYCLE_COUNT * CYCLE_INTERVAL_MS);
                                    timeoutIds.current.add(landId);
                                }
                            }["useTicker.useEffect.startId.showId"], staggerOffset);
                            timeoutIds.current.add(showId);
                        }
                    }["useTicker.useEffect.startId"]);
                }
            }["useTicker.useEffect.startId"], delayMs);
            timeoutIds.current.add(startId);
            return ({
                "useTicker.useEffect": ()=>{
                    clearAllTimeouts();
                }
            })["useTicker.useEffect"];
        }
    }["useTicker.useEffect"], [
        isOpen,
        text,
        delayMs,
        clearAllTimeouts
    ]);
    return {
        chars
    };
}
_s(useTicker, "s2dxKyD3+uQi+oS86abNGA1jp9U=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useCombatParticipants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCombatParticipants",
    ()=>useCombatParticipants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useCombatParticipants(campaignId) {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const [combatParticipants, setCombatParticipants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCombatParticipants.useEffect": ()=>{
            if (!campaignId) return;
            supabase.from('combat_participants').select('id, character_id, slot_type, active_weapon_key, active_weapon_name, secondary_weapon_name, secondary_weapon_key, default_character_id, active_character_id, active_character_name, has_acted_this_round').eq('campaign_id', campaignId).then({
                "useCombatParticipants.useEffect": ({ data })=>{
                    if (!data) return;
                    const map = {};
                    for (const r of data){
                        map[r.character_id] = r;
                    }
                    setCombatParticipants(map);
                }
            }["useCombatParticipants.useEffect"]);
            const ch = supabase.channel(`combat-participants-${campaignId}`).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'combat_participants',
                filter: `campaign_id=eq.${campaignId}`
            }, {
                "useCombatParticipants.useEffect.ch": (payload)=>{
                    if (payload.eventType === 'DELETE') {
                        const old = payload.old;
                        setCombatParticipants({
                            "useCombatParticipants.useEffect.ch": (prev)=>{
                                const next = {
                                    ...prev
                                };
                                delete next[old.character_id];
                                return next;
                            }
                        }["useCombatParticipants.useEffect.ch"]);
                    } else if (payload.new) {
                        const r = payload.new;
                        setCombatParticipants({
                            "useCombatParticipants.useEffect.ch": (prev)=>({
                                    ...prev,
                                    [r.character_id]: r
                                })
                        }["useCombatParticipants.useEffect.ch"]);
                    }
                }
            }["useCombatParticipants.useEffect.ch"]).subscribe();
            return ({
                "useCombatParticipants.useEffect": ()=>{
                    supabase.removeChannel(ch);
                }
            })["useCombatParticipants.useEffect"];
        }
    }["useCombatParticipants.useEffect"], [
        campaignId
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    return {
        combatParticipants,
        setCombatParticipants
    };
}
_s(useCombatParticipants, "7JYV+OnAdIlZAqBIre5i39wWFQA=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useCharacterPortraits.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCharacterPortraits",
    ()=>useCharacterPortraits
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
function useCharacterPortraits(characterIds) {
    _s();
    const [portraits, setPortraits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const key = characterIds.slice().sort().join(',');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCharacterPortraits.useEffect": ()=>{
            if (!key) return;
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            supabase.from('characters').select('id, portrait_url').in('id', characterIds).then({
                "useCharacterPortraits.useEffect": ({ data })=>{
                    if (!data) return;
                    const map = {};
                    for (const row of data){
                        if (row.portrait_url) map[row.id] = row.portrait_url;
                    }
                    setPortraits(map);
                }
            }["useCharacterPortraits.useEffect"]);
        }
    }["useCharacterPortraits.useEffect"], [
        key
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    return portraits;
}
_s(useCharacterPortraits, "Ai4kohx80wds9bljgiAy1Wr82kg=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useAdversaryTokenImages.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAdversaryTokenImages",
    ()=>useAdversaryTokenImages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useAdversaryTokenImages() {
    _s();
    const [tokenImages, setTokenImages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useAdversaryTokenImages.useEffect": ()=>{
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            supabase.from('adversary_token_images').select('adversary_key, token_image_url').then({
                "useAdversaryTokenImages.useEffect": ({ data })=>{
                    if (!data) return;
                    const map = {};
                    for (const row of data){
                        map[row.adversary_key] = row.token_image_url;
                    }
                    setTokenImages(map);
                }
            }["useAdversaryTokenImages.useEffect"]);
        }
    }["useAdversaryTokenImages.useEffect"], []); // load once on mount
    return {
        tokenImages,
        setTokenImages
    };
}
_s(useAdversaryTokenImages, "sRjN3bYGOcl0x9ZPXWBKlWQOCP8=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useCriticalInjuryRequest.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCriticalInjuryRequest",
    ()=>useCriticalInjuryRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function useCriticalInjuryRequest(characterId, supabase) {
    _s();
    const [pendingCritRequest, setPendingCritRequest] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCriticalInjuryRequest.useEffect": ()=>{
            if (!characterId) return;
            supabase.from('critical_injury_requests').select('*').eq('character_id', characterId).eq('status', 'pending').order('created_at', {
                ascending: false
            }).limit(1).then({
                "useCriticalInjuryRequest.useEffect": ({ data })=>{
                    if (data?.[0]) setPendingCritRequest(data[0]);
                }
            }["useCriticalInjuryRequest.useEffect"]);
            const ch = supabase.channel(`crit-req-${characterId}`).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'critical_injury_requests',
                filter: `character_id=eq.${characterId}`
            }, {
                "useCriticalInjuryRequest.useEffect.ch": (payload)=>{
                    const row = payload.new;
                    if (row?.status === 'pending') {
                        setPendingCritRequest(row);
                    } else {
                        setPendingCritRequest({
                            "useCriticalInjuryRequest.useEffect.ch": (prev)=>prev?.id === row?.id ? null : prev
                        }["useCriticalInjuryRequest.useEffect.ch"]);
                    }
                }
            }["useCriticalInjuryRequest.useEffect.ch"]).subscribe();
            return ({
                "useCriticalInjuryRequest.useEffect": ()=>{
                    supabase.removeChannel(ch);
                }
            })["useCriticalInjuryRequest.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useCriticalInjuryRequest.useEffect"], [
        characterId
    ]);
    return {
        pendingCritRequest,
        setPendingCritRequest
    };
}
_s(useCriticalInjuryRequest, "QH70tv+i0lEJR8Y0LHEi31PVUDc=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/usePlayerBroadcast.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePlayerBroadcast",
    ()=>usePlayerBroadcast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/navigation.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function usePlayerBroadcast({ characterId, campaignId, supabase, sessionMode, onDestinyRollRequest, onDestinyGmFlash }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const sessionModeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(sessionMode);
    sessionModeRef.current = sessionMode;
    const [broadcastSession, setBroadcastSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [broadcastTransition, setBroadcastTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        pending: false,
        prevMode: null
    });
    const [gmDialog, setGmDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [gmCritInjuryDialog, setGmCritInjuryDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [lootReveal, setLootReveal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [vendorOffer, setVendorOffer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [initRoll, setInitRoll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const campaignIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(campaignId);
    campaignIdRef.current = campaignId;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePlayerBroadcast.useEffect": ()=>{
            const channel = supabase.channel(`gm-notify-${characterId}`).on('broadcast', {
                event: 'gm-action'
            }, {
                "usePlayerBroadcast.useEffect.channel": ({ payload })=>{
                    if (payload.type === 'toast') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        __turbopack_context__.A("[project]/star-wars-rpg/node_modules/sonner/dist/index.mjs [app-client] (ecmascript, async loader)").then({
                            "usePlayerBroadcast.useEffect.channel": (m)=>m.toast(payload.message)
                        }["usePlayerBroadcast.useEffect.channel"]);
                    } else if (payload.type === 'combat-state') {
                        const newMode = payload.mode;
                        const newRound = payload.round;
                        const curMode = sessionModeRef.current;
                        if (newMode !== curMode) {
                            setBroadcastTransition({
                                pending: true,
                                prevMode: curMode
                            });
                            setTimeout({
                                "usePlayerBroadcast.useEffect.channel": ()=>{
                                    setBroadcastSession({
                                        mode: newMode,
                                        round: newRound
                                    });
                                    sessionModeRef.current = newMode;
                                    setBroadcastTransition({
                                        pending: false,
                                        prevMode: null
                                    });
                                }
                            }["usePlayerBroadcast.useEffect.channel"], 1200);
                        } else {
                            setBroadcastSession({
                                mode: newMode,
                                round: newRound
                            });
                            sessionModeRef.current = newMode;
                        }
                    } else if (payload.type === 'loot-reveal') {
                        setLootReveal(payload.item);
                    } else if (payload.type === 'loot-dismiss') {
                        setLootReveal(null);
                    } else if (payload.type === 'initiative-request') {
                        const cid = campaignIdRef.current;
                        if (cid) setInitRoll({
                            type: payload.initiativeType,
                            campaignId: cid
                        });
                    } else if (payload.type === 'destiny-roll-request') {
                        onDestinyRollRequest({
                            poolId: payload.poolId
                        });
                    } else if (payload.type === 'destiny-gm-spent') {
                        try {
                            const audio = new Audio('/sounds/laughing.mp3');
                            audio.volume = 0.7;
                            audio.play().catch({
                                "usePlayerBroadcast.useEffect.channel": ()=>{}
                            }["usePlayerBroadcast.useEffect.channel"]);
                        } catch (_) {}
                        onDestinyGmFlash({
                            prevLight: payload.prevLightCount,
                            prevDark: payload.prevDarkCount,
                            newLight: payload.newLightCount,
                            newDark: payload.newDarkCount
                        });
                    } else if (payload.type === 'vendor-purchase-offer') {
                        setVendorOffer(payload);
                    } else if (payload.type === 'force-logout') {
                        const key = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem('holocron_session_key') : "TURBOPACK unreachable";
                        const cid = campaignIdRef.current;
                        const doLogout = {
                            "usePlayerBroadcast.useEffect.channel.doLogout": async ()=>{
                                if (key && cid) {
                                    await supabase.from('character_sessions').delete().eq('session_key', key).eq('campaign_id', cid);
                                }
                                router.push('/');
                            }
                        }["usePlayerBroadcast.useEffect.channel.doLogout"];
                        void doLogout();
                    } else if (payload.type === 'crit-injury-added') {
                        setGmCritInjuryDialog({
                            name: payload.name,
                            severity: payload.severity,
                            description: payload.description
                        });
                    } else {
                        setGmDialog(payload.message);
                    }
                }
            }["usePlayerBroadcast.useEffect.channel"]).subscribe();
            return ({
                "usePlayerBroadcast.useEffect": ()=>{
                    supabase.removeChannel(channel);
                }
            })["usePlayerBroadcast.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["usePlayerBroadcast.useEffect"], [
        characterId
    ]);
    return {
        broadcastSession,
        setBroadcastSession,
        broadcastTransition,
        setBroadcastTransition,
        gmDialog,
        setGmDialog,
        gmCritInjuryDialog,
        setGmCritInjuryDialog,
        lootReveal,
        setLootReveal,
        vendorOffer,
        setVendorOffer,
        initRoll,
        setInitRoll
    };
}
_s(usePlayerBroadcast, "x0JyaRZ9QtkGFHp4HwYY0KN/vx0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useCharacterConflicts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCharacterConflicts",
    ()=>useCharacterConflicts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function useCharacterConflicts(characterId, supabase) {
    _s();
    const [conflicts, setConflicts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCharacterConflicts.useEffect": ()=>{
            if (!characterId) return;
            supabase.from('character_conflicts').select('id, description, narrative, session_label, is_resolved, player_acknowledged, created_at').eq('character_id', characterId).order('created_at', {
                ascending: false
            }).then({
                "useCharacterConflicts.useEffect": ({ data })=>{
                    if (data) setConflicts(data);
                }
            }["useCharacterConflicts.useEffect"]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useCharacterConflicts.useEffect"], [
        characterId
    ]);
    const pendingConflicts = conflicts.filter((c)=>c.player_acknowledged === false).sort((a, b)=>new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return {
        conflicts,
        setConflicts,
        pendingConflicts
    };
}
_s(useCharacterConflicts, "B4fa4Ml3X4Q4gXAM+5uY9TiMTsA=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useForcePowers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useForcePowers",
    ()=>useForcePowers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function useForcePowers({ charForceAbilities, refForcePowers, refForceAbilityMap, refForcePowerMap }) {
    _s();
    const buildForcePowerTree = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useForcePowers.useCallback[buildForcePowerTree]": (powerKey)=>{
            const refPower = refForcePowerMap[powerKey];
            if (!refPower?.ability_tree?.rows) return null;
            const purchasedSet = new Set(charForceAbilities.filter({
                "useForcePowers.useCallback[buildForcePowerTree]": (a)=>a.force_power_key === powerKey
            }["useForcePowers.useCallback[buildForcePowerTree]"]).map({
                "useForcePowers.useCallback[buildForcePowerTree]": (a)=>`${a.tree_row}-${a.tree_col}`
            }["useForcePowers.useCallback[buildForcePowerTree]"]));
            const nodes = [];
            const connections = [];
            for (const row of refPower.ability_tree.rows){
                const abilities = row.abilities || [];
                const dirs = row.directions || [];
                const spans = row.spans || [];
                const costs = row.costs || [];
                for(let col = 0; col < abilities.length; col++){
                    const aKey = abilities[col];
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
                    nodes.push({
                        abilityKey: aKey,
                        name: ref?.name || aKey,
                        description: ref?.description ?? undefined,
                        row: row.index,
                        col,
                        span,
                        cost,
                        purchased: isPurchased,
                        canPurchase
                    });
                    if (span > 0) {
                        if (dir.right && col < 3) connections.push({
                            fromRow: row.index,
                            fromCol: col,
                            toRow: row.index,
                            toCol: col + 1
                        });
                        if (dir.down) connections.push({
                            fromRow: row.index,
                            fromCol: col,
                            toRow: row.index + 1,
                            toCol: col
                        });
                    }
                }
            }
            const displayNodes = nodes.filter({
                "useForcePowers.useCallback[buildForcePowerTree].displayNodes": (n)=>n.span > 0
            }["useForcePowers.useCallback[buildForcePowerTree].displayNodes"]);
            return {
                powerName: refPower.name,
                nodes,
                connections,
                purchasedCount: displayNodes.filter({
                    "useForcePowers.useCallback[buildForcePowerTree]": (n)=>n.purchased
                }["useForcePowers.useCallback[buildForcePowerTree]"]).length,
                totalCount: displayNodes.filter({
                    "useForcePowers.useCallback[buildForcePowerTree]": (n)=>n.cost > 0
                }["useForcePowers.useCallback[buildForcePowerTree]"]).length
            };
        }
    }["useForcePowers.useCallback[buildForcePowerTree]"], [
        charForceAbilities,
        refForcePowerMap,
        refForceAbilityMap
    ]);
    const allForcePowers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useForcePowers.useMemo[allForcePowers]": ()=>{
            const purchaseCount = new Map();
            for (const a of charForceAbilities){
                const k = `${a.force_power_key}:${a.force_ability_key}`;
                purchaseCount.set(k, (purchaseCount.get(k) ?? 0) + 1);
            }
            return refForcePowers.filter({
                "useForcePowers.useMemo[allForcePowers]": (fp)=>fp.ability_tree?.rows?.length
            }["useForcePowers.useMemo[allForcePowers]"]).map({
                "useForcePowers.useMemo[allForcePowers]": (fp)=>{
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
                                    description: ref.description ?? undefined,
                                    purchasedRanks: purchased,
                                    totalRanks: 1,
                                    cost
                                });
                            }
                        }
                    }
                    const abilities = Array.from(abilityMap.values());
                    const purchasedCount = abilities.reduce({
                        "useForcePowers.useMemo[allForcePowers].purchasedCount": (s, a)=>s + Math.min(a.purchasedRanks, a.totalRanks)
                    }["useForcePowers.useMemo[allForcePowers].purchasedCount"], 0);
                    const totalCount = abilities.reduce({
                        "useForcePowers.useMemo[allForcePowers].totalCount": (s, a)=>s + a.totalRanks
                    }["useForcePowers.useMemo[allForcePowers].totalCount"], 0);
                    const treeData = buildForcePowerTree(fp.key);
                    return {
                        powerKey: fp.key,
                        powerName: fp.name,
                        description: fp.description ?? undefined,
                        purchasedCount,
                        totalCount,
                        abilities,
                        treeNodes: treeData?.nodes ?? [],
                        treeConnections: treeData?.connections ?? []
                    };
                }
            }["useForcePowers.useMemo[allForcePowers]"]).sort({
                "useForcePowers.useMemo[allForcePowers]": (a, b)=>{
                    if (a.purchasedCount > 0 && b.purchasedCount === 0) return -1;
                    if (a.purchasedCount === 0 && b.purchasedCount > 0) return 1;
                    return a.powerName.localeCompare(b.powerName);
                }
            }["useForcePowers.useMemo[allForcePowers]"]);
        }
    }["useForcePowers.useMemo[allForcePowers]"], [
        charForceAbilities,
        refForcePowers,
        refForceAbilityMap,
        buildForcePowerTree
    ]);
    return {
        allForcePowers,
        buildForcePowerTree
    };
}
_s(useForcePowers, "6DJQbxawqja5cYa6CHN9tCpjwVc=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useBonusSkillKeys.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useBonusSkillKeys",
    ()=>useBonusSkillKeys
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function useBonusSkillKeys(skillModifiers, talents, refTalentMap, speciesAbilities) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useBonusSkillKeys.useMemo": ()=>{
            const keys = new Set();
            for (const [key, mod] of Object.entries(skillModifiers)){
                if (mod.boostAdd > 0 || mod.setbackRemove > 0) keys.add(key);
            }
            for (const t of talents){
                const ref = refTalentMap[t.talent_key];
                const relevant = ref?.modifiers?.relevant_skills;
                if (Array.isArray(relevant)) {
                    for (const sk of relevant)keys.add(sk);
                }
            }
            for (const sa of speciesAbilities){
                if (sa.mechanical_type === 'talent_rank' && sa.talent_key) {
                    const relevant = refTalentMap[sa.talent_key]?.modifiers?.relevant_skills;
                    if (Array.isArray(relevant)) {
                        for (const sk of relevant)keys.add(sk);
                    }
                }
                if (sa.mechanical_type === 'die_modifier' && Array.isArray(sa.affected_skills)) {
                    for (const sk of sa.affected_skills){
                        if (sk) keys.add(sk);
                    }
                }
            }
            return keys;
        }
    }["useBonusSkillKeys.useMemo"], [
        skillModifiers,
        talents,
        refTalentMap,
        speciesAbilities
    ]);
}
_s(useBonusSkillKeys, "nwk+m61qLgjDVUp4IGV/072DDN4=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useSessionMode.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSessionMode",
    ()=>useSessionMode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useSessionMode(campaignId) {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        mode: 'exploration',
        round: 0,
        transitionPending: false,
        prevMode: null
    });
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSessionMode.useEffect": ()=>{
            if (!campaignId) return;
            // Initial fetch
            supabase.from('campaigns').select('session_mode, combat_round').eq('id', campaignId).single().then({
                "useSessionMode.useEffect": ({ data })=>{
                    if (data) {
                        setState({
                            "useSessionMode.useEffect": (s)=>({
                                    ...s,
                                    mode: data.session_mode ?? 'exploration',
                                    round: data.combat_round ?? 0
                                })
                        }["useSessionMode.useEffect"]);
                    }
                }
            }["useSessionMode.useEffect"]);
            // Realtime subscription
            const channel = supabase.channel(`campaign-mode-${campaignId}`).on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'campaigns',
                filter: `id=eq.${campaignId}`
            }, {
                "useSessionMode.useEffect.channel": (payload)=>{
                    const newMode = payload.new.session_mode;
                    const prevMode = payload.old.session_mode;
                    const newRound = payload.new.combat_round ?? 0;
                    if (newMode !== prevMode) {
                        setState({
                            "useSessionMode.useEffect.channel": (s)=>({
                                    ...s,
                                    transitionPending: true,
                                    prevMode
                                })
                        }["useSessionMode.useEffect.channel"]);
                        setTimeout({
                            "useSessionMode.useEffect.channel": ()=>{
                                setState({
                                    "useSessionMode.useEffect.channel": (s)=>({
                                            ...s,
                                            mode: newMode,
                                            round: newRound,
                                            transitionPending: false
                                        })
                                }["useSessionMode.useEffect.channel"]);
                            }
                        }["useSessionMode.useEffect.channel"], 1200);
                    } else {
                        setState({
                            "useSessionMode.useEffect.channel": (s)=>({
                                    ...s,
                                    round: newRound
                                })
                        }["useSessionMode.useEffect.channel"]);
                    }
                }
            }["useSessionMode.useEffect.channel"]).subscribe();
            return ({
                "useSessionMode.useEffect": ()=>{
                    supabase.removeChannel(channel);
                }
            })["useSessionMode.useEffect"];
        }
    }["useSessionMode.useEffect"], [
        campaignId
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    return state;
}
_s(useSessionMode, "uaI/TjmS3sFoqWoacCrzY+E4wMg=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useDestinyPool.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDestinyPool",
    ()=>useDestinyPool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function useDestinyPool(campaignId, characterId, characterName, supabase) {
    _s();
    const [destinyPool, setDestinyPool] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [pendingSpend, setPendingSpend] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const pendingTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const destinyChannelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [destinyPoolRecord, setDestinyPoolRecord] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [destinyRollRequest, setDestinyRollRequest] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [destinySpendOpen, setDestinySpendOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [destinyGmFlash, setDestinyGmFlash] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [destinyConsidering, setDestinyConsidering] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Keep a stable ref to campaignId for use in the spend callback
    const campaignIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(campaignId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDestinyPool.useEffect": ()=>{
            campaignIdRef.current = campaignId;
        }
    }["useDestinyPool.useEffect"], [
        campaignId
    ]);
    // ── Load pool on mount ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDestinyPool.useEffect": ()=>{
            if (!campaignId) return;
            supabase.from('campaigns').select('settings').eq('id', campaignId).single().then({
                "useDestinyPool.useEffect": ({ data })=>{
                    const pool = data?.settings?.destiny_pool;
                    if (Array.isArray(pool)) setDestinyPool(pool);
                }
            }["useDestinyPool.useEffect"]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useDestinyPool.useEffect"], [
        campaignId
    ]);
    // ── postgres_changes — pool syncs when GM or another player updates it ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDestinyPool.useEffect": ()=>{
            if (!campaignId) return;
            const ch = supabase.channel(`destiny-db-${campaignId}`).on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'campaigns',
                filter: `id=eq.${campaignId}`
            }, {
                "useDestinyPool.useEffect.ch": (payload)=>{
                    const pool = payload.new.settings?.destiny_pool;
                    if (Array.isArray(pool)) setDestinyPool(pool);
                }
            }["useDestinyPool.useEffect.ch"]).subscribe();
            return ({
                "useDestinyPool.useEffect": ()=>{
                    supabase.removeChannel(ch);
                }
            })["useDestinyPool.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useDestinyPool.useEffect"], [
        campaignId
    ]);
    // ── Campaign events — spend notifications from other players ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDestinyPool.useEffect": ()=>{
            if (!campaignId) return;
            const ch = supabase.channel(`campaign-events-${campaignId}`).on('broadcast', {
                event: 'destiny-spent'
            }, {
                "useDestinyPool.useEffect.ch": ({ payload })=>{
                    if (payload.characterId === characterId) return; // own spend, skip
                    const who = payload.characterName;
                    const side = payload.tokenType === 'light' ? '○ Light' : '● Dark';
                    __turbopack_context__.A("[project]/star-wars-rpg/node_modules/sonner/dist/index.mjs [app-client] (ecmascript, async loader)").then({
                        "useDestinyPool.useEffect.ch": (m)=>m.toast.info(`${who} spent a ${side} Side destiny point`)
                    }["useDestinyPool.useEffect.ch"]);
                }
            }["useDestinyPool.useEffect.ch"]).subscribe();
            destinyChannelRef.current = ch;
            return ({
                "useDestinyPool.useEffect": ()=>{
                    supabase.removeChannel(ch);
                    destinyChannelRef.current = null;
                }
            })["useDestinyPool.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useDestinyPool.useEffect"], [
        campaignId,
        characterId
    ]);
    // ── Destiny pool DB record + broadcast channel ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDestinyPool.useEffect": ()=>{
            if (!campaignId) return;
            // Load active pool record
            supabase.from('destiny_pool').select('*').eq('campaign_id', campaignId).eq('is_active', true).maybeSingle().then({
                "useDestinyPool.useEffect": ({ data })=>{
                    if (data) setDestinyPoolRecord(data);
                }
            }["useDestinyPool.useEffect"]);
            // Subscribe to pool table changes
            const poolCh = supabase.channel(`destiny-pool-player-${campaignId}`).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'destiny_pool',
                filter: `campaign_id=eq.${campaignId}`
            }, {
                "useDestinyPool.useEffect.poolCh": (payload)=>{
                    const row = payload.new;
                    if (row.is_active) setDestinyPoolRecord(row);
                    else setDestinyPoolRecord({
                        "useDestinyPool.useEffect.poolCh": (prev)=>prev?.id === row.id ? null : prev
                    }["useDestinyPool.useEffect.poolCh"]);
                }
            }["useDestinyPool.useEffect.poolCh"]).subscribe();
            // Subscribe to destiny broadcast channel (considering / gm-spent)
            const destCh = supabase.channel(`destiny-${campaignId}`).on('broadcast', {
                event: 'destiny_considering'
            }, {
                "useDestinyPool.useEffect.destCh": ({ payload })=>{
                    if (payload.characterName === characterName) return;
                    setDestinyConsidering(payload.characterName);
                }
            }["useDestinyPool.useEffect.destCh"]).on('broadcast', {
                event: 'destiny_cancelled'
            }, {
                "useDestinyPool.useEffect.destCh": ({ payload })=>{
                    setDestinyConsidering({
                        "useDestinyPool.useEffect.destCh": (prev)=>prev === payload.characterName ? null : prev
                    }["useDestinyPool.useEffect.destCh"]);
                }
            }["useDestinyPool.useEffect.destCh"]).on('broadcast', {
                event: 'destiny_spent'
            }, {
                "useDestinyPool.useEffect.destCh": ({ payload })=>{
                    setDestinyConsidering(null);
                    const who = payload.characterName;
                    const side = payload.side === 'light' ? '○ Light' : '● Dark';
                    __turbopack_context__.A("[project]/star-wars-rpg/node_modules/sonner/dist/index.mjs [app-client] (ecmascript, async loader)").then({
                        "useDestinyPool.useEffect.destCh": (m)=>m.toast.info(`${who} spent a ${side} Side destiny point`)
                    }["useDestinyPool.useEffect.destCh"]);
                }
            }["useDestinyPool.useEffect.destCh"]).subscribe();
            return ({
                "useDestinyPool.useEffect": ()=>{
                    supabase.removeChannel(poolCh);
                    supabase.removeChannel(destCh);
                }
            })["useDestinyPool.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useDestinyPool.useEffect"], [
        campaignId
    ]);
    const handleSpendDestiny = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDestinyPool.useCallback[handleSpendDestiny]": async (idx)=>{
            const cid = campaignIdRef.current;
            if (!cid) return;
            // Two-tap confirm: first tap highlights, second tap within 2s confirms
            if (pendingSpend !== idx) {
                setPendingSpend(idx);
                if (pendingTimer.current) clearTimeout(pendingTimer.current);
                pendingTimer.current = setTimeout({
                    "useDestinyPool.useCallback[handleSpendDestiny]": ()=>setPendingSpend(null)
                }["useDestinyPool.useCallback[handleSpendDestiny]"], 2000);
                return;
            }
            // Confirmed
            if (pendingTimer.current) clearTimeout(pendingTimer.current);
            setPendingSpend(null);
            const token = destinyPool[idx];
            const newPool = destinyPool.map({
                "useDestinyPool.useCallback[handleSpendDestiny].newPool": (t, i)=>i === idx ? t === 'light' ? 'dark' : 'light' : t
            }["useDestinyPool.useCallback[handleSpendDestiny].newPool"]);
            setDestinyPool(newPool);
            // Persist
            const { data: camp } = await supabase.from('campaigns').select('settings').eq('id', cid).single();
            const settings = camp?.settings ?? {};
            await supabase.from('campaigns').update({
                settings: {
                    ...settings,
                    destiny_pool: newPool
                }
            }).eq('id', cid);
            // Notify other players
            destinyChannelRef.current?.send({
                type: 'broadcast',
                event: 'destiny-spent',
                payload: {
                    characterId,
                    characterName,
                    tokenType: token
                }
            });
            const side = token === 'light' ? '○ Light' : '● Dark';
            __turbopack_context__.A("[project]/star-wars-rpg/node_modules/sonner/dist/index.mjs [app-client] (ecmascript, async loader)").then({
                "useDestinyPool.useCallback[handleSpendDestiny]": (m)=>m.toast.success(`Spent a ${side} Side destiny point`)
            }["useDestinyPool.useCallback[handleSpendDestiny]"]);
        }
    }["useDestinyPool.useCallback[handleSpendDestiny]"], [
        destinyPool,
        characterId,
        characterName,
        supabase,
        pendingSpend
    ]);
    return {
        destinyPool,
        pendingSpend,
        destinyPoolRecord,
        destinyRollRequest,
        setDestinyRollRequest,
        destinySpendOpen,
        setDestinySpendOpen,
        destinyGmFlash,
        setDestinyGmFlash,
        destinyConsidering,
        setDestinyConsidering,
        handleSpendDestiny
    };
}
_s(useDestinyPool, "paWAqnlpZ8viciaWhl92s2WGhMc=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useStowLocations.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useStowLocations",
    ()=>useStowLocations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useStowLocations(campaignId) {
    _s();
    const [stowableAssets, setStowableAssets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [baseOfOperationsName, setBaseOfOperationsName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useStowLocations.useEffect": ()=>{
            if (!campaignId) return;
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            supabase.from('group_assets').select('id, name, asset_type').eq('campaign_id', campaignId).eq('is_archived', false).in('asset_type', [
                'vehicle',
                'starship',
                'safe_house'
            ]).order('name', {
                ascending: true
            }).then({
                "useStowLocations.useEffect": ({ data })=>{
                    if (data) setStowableAssets(data.map({
                        "useStowLocations.useEffect": (a)=>({
                                id: a.id,
                                name: a.name,
                                type: a.asset_type
                            })
                    }["useStowLocations.useEffect"]));
                }
            }["useStowLocations.useEffect"]);
            supabase.from('campaigns').select('base_of_operations_name').eq('id', campaignId).maybeSingle().then({
                "useStowLocations.useEffect": ({ data })=>{
                    setBaseOfOperationsName(data?.base_of_operations_name ?? null);
                }
            }["useStowLocations.useEffect"]);
        }
    }["useStowLocations.useEffect"], [
        campaignId
    ]);
    return {
        stowableAssets,
        baseOfOperationsName
    };
}
_s(useStowLocations, "EOIoZWzPKyoy3ZTiKIrN/gir4AQ=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useRollFeed.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRollFeed",
    ()=>useRollFeed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useRollFeed(campaignId) {
    _s();
    const [rolls, setRolls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useRollFeed.useEffect": ()=>{
            if (!campaignId) return;
            // Load last 20 rolls
            supabase.from('roll_log').select('*').eq('campaign_id', campaignId).order('rolled_at', {
                ascending: false
            }).limit(20).then({
                "useRollFeed.useEffect": ({ data })=>{
                    if (data) setRolls(data.reverse());
                }
            }["useRollFeed.useEffect"]);
            // Subscribe to new rolls
            const channel = supabase.channel(`rolls-${campaignId}`).on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'roll_log',
                filter: `campaign_id=eq.${campaignId}`
            }, {
                "useRollFeed.useEffect.channel": (payload)=>{
                    setRolls({
                        "useRollFeed.useEffect.channel": (prev)=>[
                                ...prev.slice(-49),
                                payload.new
                            ]
                    }["useRollFeed.useEffect.channel"]);
                }
            }["useRollFeed.useEffect.channel"]).subscribe();
            return ({
                "useRollFeed.useEffect": ()=>{
                    supabase.removeChannel(channel);
                }
            })["useRollFeed.useEffect"];
        }
    }["useRollFeed.useEffect"], [
        campaignId
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    return rolls;
}
_s(useRollFeed, "4584esAGb88NkQecfq/u3L05G/o=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useSessionRollState.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getWoundThresholdBonus",
    ()=>getWoundThresholdBonus,
    "useSessionRollState",
    ()=>useSessionRollState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function getWoundThresholdBonus(characterId, state) {
    if (!state || !state.duty_revealed || !state.duty_triggered) return 0;
    const doubles = state.duty_is_doubles;
    if (state.duty_triggered_char_id === characterId) return doubles ? 4 : 2;
    return doubles ? 2 : 1;
}
function useSessionRollState(campaignId) {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])()).current;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSessionRollState.useEffect": ()=>{
            if (!campaignId) return;
            // Initial load
            supabase.from('session_roll_state').select('*').eq('campaign_id', campaignId).single().then({
                "useSessionRollState.useEffect": ({ data })=>{
                    if (data) setState(data);
                }
            }["useSessionRollState.useEffect"]);
            // Realtime subscription
            const channel = supabase.channel(`session-roll-${campaignId}`).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'session_roll_state',
                filter: `campaign_id=eq.${campaignId}`
            }, {
                "useSessionRollState.useEffect.channel": (payload)=>{
                    setState(payload.new);
                }
            }["useSessionRollState.useEffect.channel"]).subscribe();
            return ({
                "useSessionRollState.useEffect": ()=>{
                    supabase.removeChannel(channel);
                }
            })["useSessionRollState.useEffect"];
        }
    }["useSessionRollState.useEffect"], [
        campaignId,
        supabase
    ]);
    return state;
}
_s(useSessionRollState, "/6hdqzReoiFgolupG3u193sBrlU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useDerivedStats.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDerivedStats",
    ()=>useDerivedStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$derivedStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/derivedStats.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useDerivedStats({ character, forceRatingBase, talents, refTalentMap, armor, refArmorMap, refAttachmentMap, weapons = [], refWeaponMap = {}, refWeaponQualityMap = {}, speciesAbilities = [] }) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDerivedStats.useMemo": ()=>{
            if (!character) return null;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$derivedStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["computeDerivedStats"])(character, forceRatingBase, talents, refTalentMap, armor, refArmorMap, refAttachmentMap, weapons, refWeaponMap, refWeaponQualityMap, speciesAbilities);
        }
    }["useDerivedStats.useMemo"], [
        character,
        forceRatingBase,
        talents,
        refTalentMap,
        armor,
        refArmorMap,
        refAttachmentMap,
        weapons,
        refWeaponMap,
        refWeaponQualityMap,
        speciesAbilities
    ]);
}
_s(useDerivedStats, "nwk+m61qLgjDVUp4IGV/072DDN4=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useActiveMap.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useActiveMap",
    ()=>useActiveMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useActiveMap(campaignId) {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useActiveMap.useMemo[supabase]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])()
    }["useActiveMap.useMemo[supabase]"], []);
    const [allMaps, setAllMaps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useActiveMap.useEffect": ()=>{
            if (!campaignId) return;
            supabase.from('maps').select('*').eq('campaign_id', campaignId).order('created_at', {
                ascending: false
            }).then({
                "useActiveMap.useEffect": ({ data })=>{
                    if (data) setAllMaps(data);
                }
            }["useActiveMap.useEffect"]);
            const ch = supabase.channel(`maps-campaign-${campaignId}`).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'maps',
                filter: `campaign_id=eq.${campaignId}`
            }, {
                "useActiveMap.useEffect.ch": (payload)=>{
                    const { eventType, new: n, old: o } = payload;
                    setAllMaps({
                        "useActiveMap.useEffect.ch": (prev)=>{
                            if (eventType === 'INSERT') return [
                                n,
                                ...prev
                            ];
                            if (eventType === 'UPDATE') return prev.map({
                                "useActiveMap.useEffect.ch": (m)=>m.id === n.id ? n : m
                            }["useActiveMap.useEffect.ch"]);
                            if (eventType === 'DELETE') return prev.filter({
                                "useActiveMap.useEffect.ch": (m)=>m.id !== o.id
                            }["useActiveMap.useEffect.ch"]);
                            return prev;
                        }
                    }["useActiveMap.useEffect.ch"]);
                }
            }["useActiveMap.useEffect.ch"]).subscribe();
            return ({
                "useActiveMap.useEffect": ()=>{
                    supabase.removeChannel(ch);
                }
            })["useActiveMap.useEffect"];
        }
    }["useActiveMap.useEffect"], [
        campaignId
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    const activeMap = allMaps.find((m)=>m.is_active) ?? null;
    const visibleMap = allMaps.find((m)=>m.is_active && m.is_visible_to_players) ?? null;
    function removeMap(mapId) {
        setAllMaps((prev)=>prev.filter((m)=>m.id !== mapId));
    }
    return {
        activeMap,
        visibleMap,
        allMaps,
        supabase,
        removeMap
    };
}
_s(useActiveMap, "+DonGQPcIxuYVgG2lPYnbuBl2Ko=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useMapTokens.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useMapTokens",
    ()=>useMapTokens
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useMapTokens(mapId) {
    _s();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useMapTokens.useMemo[supabase]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])()
    }["useMapTokens.useMemo[supabase]"], []);
    // Unique suffix per hook instance so multiple callers with the same mapId
    // don't share a Realtime channel on the singleton client — unsubscribing one
    // would otherwise kill the other's subscription.
    const instanceId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(Math.random().toString(36).slice(2, 8)).current;
    const [tokens, setTokens] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useMapTokens.useEffect": ()=>{
            if (!mapId) {
                setTokens([]);
                return;
            }
            supabase.from('map_tokens').select('*').eq('map_id', mapId).then({
                "useMapTokens.useEffect": ({ data })=>{
                    if (data) setTokens(data);
                }
            }["useMapTokens.useEffect"]);
            const ch = supabase.channel(`map-tokens-${mapId}-${instanceId}`).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'map_tokens',
                filter: `map_id=eq.${mapId}`
            }, {
                "useMapTokens.useEffect.ch": (payload)=>{
                    const { eventType, new: n, old: o } = payload;
                    setTokens({
                        "useMapTokens.useEffect.ch": (prev)=>{
                            if (eventType === 'INSERT') {
                                const incoming = n;
                                return prev.some({
                                    "useMapTokens.useEffect.ch": (t)=>t.id === incoming.id
                                }["useMapTokens.useEffect.ch"]) ? prev : [
                                    ...prev,
                                    incoming
                                ];
                            }
                            if (eventType === 'UPDATE') return prev.map({
                                "useMapTokens.useEffect.ch": (t)=>t.id === n.id ? n : t
                            }["useMapTokens.useEffect.ch"]);
                            if (eventType === 'DELETE') return prev.filter({
                                "useMapTokens.useEffect.ch": (t)=>t.id !== o.id
                            }["useMapTokens.useEffect.ch"]);
                            return prev;
                        }
                    }["useMapTokens.useEffect.ch"]);
                }
            }["useMapTokens.useEffect.ch"]).subscribe();
            return ({
                "useMapTokens.useEffect": ()=>{
                    supabase.removeChannel(ch);
                }
            })["useMapTokens.useEffect"];
        }
    }["useMapTokens.useEffect"], [
        mapId
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    const moveToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMapTokens.useCallback[moveToken]": async (id, x, y)=>{
            // Optimistic update
            setTokens({
                "useMapTokens.useCallback[moveToken]": (prev)=>prev.map({
                        "useMapTokens.useCallback[moveToken]": (t)=>t.id === id ? {
                                ...t,
                                x,
                                y
                            } : t
                    }["useMapTokens.useCallback[moveToken]"])
            }["useMapTokens.useCallback[moveToken]"]);
            await supabase.from('map_tokens').update({
                x,
                y,
                updated_at: new Date().toISOString()
            }).eq('id', id);
        }
    }["useMapTokens.useCallback[moveToken]"], [
        supabase
    ]);
    const toggleVisibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMapTokens.useCallback[toggleVisibility]": async (id, visible)=>{
            setTokens({
                "useMapTokens.useCallback[toggleVisibility]": (prev)=>prev.map({
                        "useMapTokens.useCallback[toggleVisibility]": (t)=>t.id === id ? {
                                ...t,
                                is_visible: visible
                            } : t
                    }["useMapTokens.useCallback[toggleVisibility]"])
            }["useMapTokens.useCallback[toggleVisibility]"]);
            await supabase.from('map_tokens').update({
                is_visible: visible
            }).eq('id', id);
        }
    }["useMapTokens.useCallback[toggleVisibility]"], [
        supabase
    ]);
    const removeToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMapTokens.useCallback[removeToken]": async (id)=>{
            setTokens({
                "useMapTokens.useCallback[removeToken]": (prev)=>prev.filter({
                        "useMapTokens.useCallback[removeToken]": (t)=>t.id !== id
                    }["useMapTokens.useCallback[removeToken]"])
            }["useMapTokens.useCallback[removeToken]"]);
            await supabase.from('map_tokens').delete().eq('id', id);
        }
    }["useMapTokens.useCallback[removeToken]"], [
        supabase
    ]);
    const removeAllTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMapTokens.useCallback[removeAllTokens]": async ()=>{
            if (!mapId) return;
            setTokens([]);
            await supabase.from('map_tokens').delete().eq('map_id', mapId);
        }
    }["useMapTokens.useCallback[removeAllTokens]"], [
        mapId,
        supabase
    ]);
    const addToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMapTokens.useCallback[addToken]": async (token)=>{
            const { data } = await supabase.from('map_tokens').insert(token).select().single();
            if (data) setTokens({
                "useMapTokens.useCallback[addToken]": (prev)=>[
                        ...prev,
                        data
                    ]
            }["useMapTokens.useCallback[addToken]"]);
            return data;
        }
    }["useMapTokens.useCallback[addToken]"], [
        supabase
    ]);
    const updateWoundPct = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMapTokens.useCallback[updateWoundPct]": async (id, wound_pct)=>{
            setTokens({
                "useMapTokens.useCallback[updateWoundPct]": (prev)=>prev.map({
                        "useMapTokens.useCallback[updateWoundPct]": (t)=>t.id === id ? {
                                ...t,
                                wound_pct
                            } : t
                    }["useMapTokens.useCallback[updateWoundPct]"])
            }["useMapTokens.useCallback[updateWoundPct]"]);
            await supabase.from('map_tokens').update({
                wound_pct
            }).eq('id', id);
        }
    }["useMapTokens.useCallback[updateWoundPct]"], [
        supabase
    ]);
    return {
        tokens,
        moveToken,
        toggleVisibility,
        removeToken,
        removeAllTokens,
        addToken,
        updateWoundPct,
        supabase
    };
}
_s(useMapTokens, "cAMPtlcYoHfCdr3mjVwsLlTllM0=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useEncounterState.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useEncounterState",
    ()=>useEncounterState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
function useEncounterState(campaignId) {
    _s();
    const [encounter, setEncounter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    // Initial fetch — load the current active encounter
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useEncounterState.useEffect": ()=>{
            if (!campaignId) {
                setEncounter(null);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            supabase.from('combat_encounters').select('*').eq('campaign_id', campaignId).eq('is_active', true).order('created_at', {
                ascending: false
            }).limit(1).then({
                "useEncounterState.useEffect": ({ data })=>{
                    setEncounter(data && data.length > 0 ? data[0] : null);
                    setIsLoading(false);
                }
            }["useEncounterState.useEffect"]);
        }
    }["useEncounterState.useEffect"], [
        campaignId
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    // Realtime subscription — keep encounter in sync with DB changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useEncounterState.useEffect": ()=>{
            if (!campaignId) return;
            const channel = supabase.channel(`combat-player-${campaignId}`).on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'combat_encounters',
                filter: `campaign_id=eq.${campaignId}`
            }, {
                "useEncounterState.useEffect.channel": (payload)=>{
                    if (payload.new) {
                        const row = payload.new;
                        setEncounter(row.is_active ? row : null);
                    }
                }
            }["useEncounterState.useEffect.channel"]).subscribe();
            return ({
                "useEncounterState.useEffect": ()=>{
                    supabase.removeChannel(channel);
                }
            })["useEncounterState.useEffect"];
        }
    }["useEncounterState.useEffect"], [
        campaignId
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    return {
        encounter,
        isLoading
    };
}
_s(useEncounterState, "qhBqNU3jPgS6cD5EJqOBk3fZcWs=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useRefWeapons.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRefWeapons",
    ()=>useRefWeapons
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
function useRefWeapons() {
    _s();
    const [refWeapons, setRefWeapons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useRefWeapons.useEffect": ()=>{
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            supabase.from('ref_weapons').select('name, damage, damage_add, range_value').then({
                "useRefWeapons.useEffect": ({ data })=>{
                    if (!data) return;
                    const map = {};
                    for (const w of data){
                        map[w.name.toLowerCase()] = w;
                    }
                    setRefWeapons(map);
                }
            }["useRefWeapons.useEffect"]);
        }
    }["useRefWeapons.useEffect"], []); // load once on mount
    return refWeapons;
}
_s(useRefWeapons, "RJtqSqyMwlQru3o36fK/VkRHpPE=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/star-wars-rpg/src/hooks/useIsMobile.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useIsMobile",
    ()=>useIsMobile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useIsMobile(breakpoint = 768) {
    _s();
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useIsMobile.useEffect": ()=>{
            const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
            setIsMobile(mq.matches);
            const handler = {
                "useIsMobile.useEffect.handler": (e)=>setIsMobile(e.matches)
            }["useIsMobile.useEffect.handler"];
            mq.addEventListener('change', handler);
            return ({
                "useIsMobile.useEffect": ()=>mq.removeEventListener('change', handler)
            })["useIsMobile.useEffect"];
        }
    }["useIsMobile.useEffect"], [
        breakpoint
    ]);
    return isMobile;
}
_s(useIsMobile, "0VTTNJATKABQPGLm9RVT0tKGUgU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=star-wars-rpg_src_hooks_d27825aa._.js.map