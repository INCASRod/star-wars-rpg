(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/AssetExtension.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
;
const assetKeyMap = {
    loader: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].LoadParser,
    resolver: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].ResolveParser,
    cache: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].CacheParser,
    detection: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].DetectionParser
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].handle(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].Asset, (extension)=>{
    const ref = extension.ref;
    Object.entries(assetKeyMap).filter(([key])=>!!ref[key]).forEach(([key, type])=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(Object.assign(ref[key], // Allow the function to optionally define it's own
        // ExtensionMetadata, the use cases here is priority for LoaderParsers
        {
            extension: ref[key].extension ?? type
        })));
}, (extension)=>{
    const ref = extension.ref;
    Object.keys(assetKeyMap).filter((key)=>!!ref[key]).forEach((key)=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].remove(ref[key]));
}); //# sourceMappingURL=AssetExtension.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/BackgroundLoader.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BackgroundLoader",
    ()=>BackgroundLoader
]);
class BackgroundLoader {
    /**
   * @param loader
   * @param verbose - should the loader log to the console
   */ constructor(loader, verbose = !1){
        this._loader = loader, this._assetList = [], this._isLoading = !1, this._maxConcurrent = 1, this.verbose = verbose;
    }
    /**
   * Adds an array of assets to load.
   * @param assetUrls - assets to load
   */ add(assetUrls) {
        assetUrls.forEach((a)=>{
            this._assetList.push(a);
        }), this.verbose && console.log("[BackgroundLoader] assets: ", this._assetList), this._isActive && !this._isLoading && this._next();
    }
    /**
   * Loads the next set of assets. Will try to load as many assets as it can at the same time.
   *
   * The max assets it will try to load at one time will be 4.
   */ async _next() {
        if (this._assetList.length && this._isActive) {
            this._isLoading = !0;
            const toLoad = [], toLoadAmount = Math.min(this._assetList.length, this._maxConcurrent);
            for(let i = 0; i < toLoadAmount; i++)toLoad.push(this._assetList.pop());
            await this._loader.load(toLoad), this._isLoading = !1, this._next();
        }
    }
    /**
   * Activate/Deactivate the loading. If set to true then it will immediately continue to load the next asset.
   * @returns whether the class is active
   */ get active() {
        return this._isActive;
    }
    set active(value) {
        this._isActive !== value && (this._isActive = value, value && !this._isLoading && this._next());
    }
}
;
 //# sourceMappingURL=BackgroundLoader.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkDataUrl.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkDataUrl",
    ()=>checkDataUrl
]);
function checkDataUrl(url, mimes) {
    if (Array.isArray(mimes)) {
        for (const mime of mimes)if (url.startsWith(`data:${mime}`)) return !0;
        return !1;
    }
    return url.startsWith(`data:${mimes}`);
}
;
 //# sourceMappingURL=checkDataUrl.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkExtension.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkExtension",
    ()=>checkExtension
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <export * as utils>");
;
function checkExtension(url, extension) {
    const tempURL = url.split("?")[0], ext = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].path.extname(tempURL).toLowerCase();
    return Array.isArray(extension) ? extension.includes(ext) : ext === extension;
}
;
 //# sourceMappingURL=checkExtension.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/convertToList.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertToList",
    ()=>convertToList
]);
const convertToList = (input, transform, forceTransform = !1)=>(Array.isArray(input) || (input = [
        input
    ]), transform ? input.map((item)=>typeof item == "string" || forceTransform ? transform(item) : item) : input);
;
 //# sourceMappingURL=convertToList.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/copySearchParams.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "copySearchParams",
    ()=>copySearchParams
]);
const copySearchParams = (targetUrl, sourceUrl)=>{
    const searchParams = sourceUrl.split("?")[1];
    return searchParams && (targetUrl += `?${searchParams}`), targetUrl;
};
;
 //# sourceMappingURL=copySearchParams.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/createStringVariations.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createStringVariations",
    ()=>createStringVariations
]);
function processX(base, ids, depth, result, tags) {
    const id = ids[depth];
    for(let i = 0; i < id.length; i++){
        const value = id[i];
        depth < ids.length - 1 ? processX(base.replace(result[depth], value), ids, depth + 1, result, tags) : tags.push(base.replace(result[depth], value));
    }
}
function createStringVariations(string) {
    const regex = /\{(.*?)\}/g, result = string.match(regex), tags = [];
    if (result) {
        const ids = [];
        result.forEach((vars)=>{
            const split = vars.substring(1, vars.length - 1).split(",");
            ids.push(split);
        }), processX(string, ids, 0, result, tags);
    } else tags.push(string);
    return tags;
}
;
 //# sourceMappingURL=createStringVariations.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/isSingleItem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isSingleItem",
    ()=>isSingleItem
]);
const isSingleItem = (item)=>!Array.isArray(item);
;
 //# sourceMappingURL=isSingleItem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkDataUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkExtension.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/convertToList.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$copySearchParams$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/copySearchParams.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$createStringVariations$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/createStringVariations.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/isSingleItem.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/Cache.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Cache",
    ()=>Cache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/Texture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/convertToList.mjs [app-client] (ecmascript)");
;
;
;
class CacheClass {
    constructor(){
        this._parsers = [], this._cache = /* @__PURE__ */ new Map(), this._cacheMap = /* @__PURE__ */ new Map();
    }
    /** Clear all entries. */ reset() {
        this._cacheMap.clear(), this._cache.clear();
    }
    /**
   * Check if the key exists
   * @param key - The key to check
   */ has(key) {
        return this._cache.has(key);
    }
    /**
   * Fetch entry by key
   * @param key - The key of the entry to get
   */ get(key) {
        const result = this._cache.get(key);
        return result || console.warn(`[Assets] Asset id ${key} was not found in the Cache`), result;
    }
    /**
   * Set a value by key or keys name
   * @param key - The key or keys to set
   * @param value - The value to store in the cache or from which cacheable assets will be derived.
   */ set(key, value) {
        const keys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(key);
        let cacheableAssets;
        for(let i = 0; i < this.parsers.length; i++){
            const parser = this.parsers[i];
            if (parser.test(value)) {
                cacheableAssets = parser.getCacheableAssets(keys, value);
                break;
            }
        }
        cacheableAssets || (cacheableAssets = {}, keys.forEach((key2)=>{
            cacheableAssets[key2] = value;
        }));
        const cacheKeys = Object.keys(cacheableAssets), cachedAssets = {
            cacheKeys,
            keys
        };
        if (keys.forEach((key2)=>{
            this._cacheMap.set(key2, cachedAssets);
        }), cacheKeys.forEach((key2)=>{
            const val = cacheableAssets ? cacheableAssets[key2] : value;
            this._cache.has(key2) && this._cache.get(key2) !== val && console.warn("[Cache] already has key:", key2), this._cache.set(key2, cacheableAssets[key2]);
        }), value instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Texture"]) {
            const texture = value;
            keys.forEach((key2)=>{
                texture.baseTexture !== __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Texture"].EMPTY.baseTexture && __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].addToCache(texture.baseTexture, key2), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Texture"].addToCache(texture, key2);
            });
        }
    }
    /**
   * Remove entry by key
   *
   * This function will also remove any associated alias from the cache also.
   * @param key - The key of the entry to remove
   */ remove(key) {
        if (!this._cacheMap.has(key)) {
            console.warn(`[Assets] Asset id ${key} was not found in the Cache`);
            return;
        }
        const cacheMap = this._cacheMap.get(key);
        cacheMap.cacheKeys.forEach((key2)=>{
            this._cache.delete(key2);
        }), cacheMap.keys.forEach((key2)=>{
            this._cacheMap.delete(key2);
        });
    }
    /** All loader parsers registered */ get parsers() {
        return this._parsers;
    }
}
const Cache = new CacheClass();
;
 //# sourceMappingURL=Cache.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/Loader.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Loader",
    ()=>Loader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <export * as utils>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/isSingleItem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/convertToList.mjs [app-client] (ecmascript)");
;
;
;
;
class Loader {
    constructor(){
        this._parsers = [], this._parsersValidated = !1, this.parsers = new Proxy(this._parsers, {
            set: (target, key, value)=>(this._parsersValidated = !1, target[key] = value, !0)
        }), this.promiseCache = {};
    }
    /** function used for testing */ reset() {
        this._parsersValidated = !1, this.promiseCache = {};
    }
    /**
   * Used internally to generate a promise for the asset to be loaded.
   * @param url - The URL to be loaded
   * @param data - any custom additional information relevant to the asset being loaded
   * @returns - a promise that will resolve to an Asset for example a Texture of a JSON object
   */ _getLoadPromiseAndParser(url, data) {
        const result = {
            promise: null,
            parser: null
        };
        return result.promise = (async ()=>{
            let asset = null, parser = null;
            if (data.loadParser && (parser = this._parserHash[data.loadParser], parser || console.warn(`[Assets] specified load parser "${data.loadParser}" not found while loading ${url}`)), !parser) {
                for(let i = 0; i < this.parsers.length; i++){
                    const parserX = this.parsers[i];
                    if (parserX.load && parserX.test?.(url, data, this)) {
                        parser = parserX;
                        break;
                    }
                }
                if (!parser) return console.warn(`[Assets] ${url} could not be loaded as we don't know how to parse it, ensure the correct parser has been added`), null;
            }
            asset = await parser.load(url, data, this), result.parser = parser;
            for(let i = 0; i < this.parsers.length; i++){
                const parser2 = this.parsers[i];
                parser2.parse && parser2.parse && await parser2.testParse?.(asset, data, this) && (asset = await parser2.parse(asset, data, this) || asset, result.parser = parser2);
            }
            return asset;
        })(), result;
    }
    async load(assetsToLoadIn, onProgress) {
        this._parsersValidated || this._validateParsers();
        let count = 0;
        const assets = {}, singleAsset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSingleItem"])(assetsToLoadIn), assetsToLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(assetsToLoadIn, (item)=>({
                alias: [
                    item
                ],
                src: item
            })), total = assetsToLoad.length, promises = assetsToLoad.map(async (asset)=>{
            const url = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].path.toAbsolute(asset.src);
            if (!assets[asset.src]) try {
                this.promiseCache[url] || (this.promiseCache[url] = this._getLoadPromiseAndParser(url, asset)), assets[asset.src] = await this.promiseCache[url].promise, onProgress && onProgress(++count / total);
            } catch (e) {
                throw delete this.promiseCache[url], delete assets[asset.src], new Error(`[Loader.load] Failed to load ${url}.
${e}`);
            }
        });
        return await Promise.all(promises), singleAsset ? assets[assetsToLoad[0].src] : assets;
    }
    /**
   * Unloads one or more assets. Any unloaded assets will be destroyed, freeing up memory for your app.
   * The parser that created the asset, will be the one that unloads it.
   * @example
   * // Single asset:
   * const asset = await Loader.load('cool.png');
   *
   * await Loader.unload('cool.png');
   *
   * console.log(asset.destroyed); // true
   * @param assetsToUnloadIn - urls that you want to unload, or a single one!
   */ async unload(assetsToUnloadIn) {
        const promises = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(assetsToUnloadIn, (item)=>({
                alias: [
                    item
                ],
                src: item
            })).map(async (asset)=>{
            const url = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].path.toAbsolute(asset.src), loadPromise = this.promiseCache[url];
            if (loadPromise) {
                const loadedAsset = await loadPromise.promise;
                delete this.promiseCache[url], loadPromise.parser?.unload?.(loadedAsset, asset, this);
            }
        });
        await Promise.all(promises);
    }
    /** validates our parsers, right now it only checks for name conflicts but we can add more here as required! */ _validateParsers() {
        this._parsersValidated = !0, this._parserHash = this._parsers.filter((parser)=>parser.name).reduce((hash, parser)=>(hash[parser.name] && console.warn(`[Assets] loadParser name conflict "${parser.name}"`), {
                ...hash,
                [parser.name]: parser
            }), {});
    }
}
;
 //# sourceMappingURL=Loader.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/LoaderParser.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoaderParserPriority",
    ()=>LoaderParserPriority
]);
var LoaderParserPriority = /* @__PURE__ */ ((LoaderParserPriority2)=>(LoaderParserPriority2[LoaderParserPriority2.Low = 0] = "Low", LoaderParserPriority2[LoaderParserPriority2.Normal = 1] = "Normal", LoaderParserPriority2[LoaderParserPriority2.High = 2] = "High", LoaderParserPriority2))(LoaderParserPriority || {});
;
 //# sourceMappingURL=LoaderParser.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadJson.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadJson",
    ()=>loadJson
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkDataUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkExtension.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/LoaderParser.mjs [app-client] (ecmascript)");
;
;
;
;
const validJSONExtension = ".json", validJSONMIME = "application/json", loadJson = {
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].LoadParser,
        priority: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoaderParserPriority"].Low
    },
    name: "loadJson",
    test (url) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkDataUrl"])(url, validJSONMIME) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkExtension"])(url, validJSONExtension);
    },
    async load (url) {
        return await (await __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.fetch(url)).json();
    }
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(loadJson);
;
 //# sourceMappingURL=loadJson.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadTxt.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadTxt",
    ()=>loadTxt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkDataUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkExtension.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/LoaderParser.mjs [app-client] (ecmascript)");
;
;
;
;
const validTXTExtension = ".txt", validTXTMIME = "text/plain", loadTxt = {
    name: "loadTxt",
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].LoadParser,
        priority: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoaderParserPriority"].Low
    },
    test (url) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkDataUrl"])(url, validTXTMIME) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkExtension"])(url, validTXTExtension);
    },
    async load (url) {
        return await (await __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.fetch(url)).text();
    }
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(loadTxt);
;
 //# sourceMappingURL=loadTxt.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadWebFont.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getFontFamilyName",
    ()=>getFontFamilyName,
    "loadWebFont",
    ()=>loadWebFont
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <export * as utils>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkDataUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkExtension.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/LoaderParser.mjs [app-client] (ecmascript)");
;
;
;
;
const validWeights = [
    "normal",
    "bold",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
], validFontExtensions = [
    ".ttf",
    ".otf",
    ".woff",
    ".woff2"
], validFontMIMEs = [
    "font/ttf",
    "font/otf",
    "font/woff",
    "font/woff2"
], CSS_IDENT_TOKEN_REGEX = /^(--|-?[A-Z_])[0-9A-Z_-]*$/i;
function getFontFamilyName(url) {
    const ext = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].path.extname(url), nameTokens = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].path.basename(url, ext).replace(/(-|_)/g, " ").toLowerCase().split(" ").map((word)=>word.charAt(0).toUpperCase() + word.slice(1));
    let valid = nameTokens.length > 0;
    for (const token of nameTokens)if (!token.match(CSS_IDENT_TOKEN_REGEX)) {
        valid = !1;
        break;
    }
    let fontFamilyName = nameTokens.join(" ");
    return valid || (fontFamilyName = `"${fontFamilyName.replace(/[\\"]/g, "\\$&")}"`), fontFamilyName;
}
const validURICharactersRegex = /^[0-9A-Za-z%:/?#\[\]@!\$&'()\*\+,;=\-._~]*$/;
function encodeURIWhenNeeded(uri) {
    return validURICharactersRegex.test(uri) ? uri : encodeURI(uri);
}
const loadWebFont = {
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].LoadParser,
        priority: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoaderParserPriority"].Low
    },
    name: "loadWebFont",
    test (url) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkDataUrl"])(url, validFontMIMEs) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkExtension"])(url, validFontExtensions);
    },
    async load (url, options) {
        const fonts = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.getFontFaceSet();
        if (fonts) {
            const fontFaces = [], name = options.data?.family ?? getFontFamilyName(url), weights = options.data?.weights?.filter((weight)=>validWeights.includes(weight)) ?? [
                "normal"
            ], data = options.data ?? {};
            for(let i = 0; i < weights.length; i++){
                const weight = weights[i], font = new FontFace(name, `url(${encodeURIWhenNeeded(url)})`, {
                    ...data,
                    weight
                });
                await font.load(), fonts.add(font), fontFaces.push(font);
            }
            return fontFaces.length === 1 ? fontFaces[0] : fontFaces;
        }
        return console.warn("[loadWebFont] FontFace API is not supported. Skipping loading font"), null;
    },
    unload (font) {
        (Array.isArray(font) ? font : [
            font
        ]).forEach((t)=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.getFontFaceSet().delete(t));
    }
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(loadWebFont);
;
 //# sourceMappingURL=loadWebFont.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/_virtual/checkImageBitmap.worker.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WorkerInstance
]);
const WORKER_CODE = `(function() {
  "use strict";
  const WHITE_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
  async function checkImageBitmap() {
    try {
      if (typeof createImageBitmap != "function")
        return !1;
      const imageBlob = await (await fetch(WHITE_PNG)).blob(), imageBitmap = await createImageBitmap(imageBlob);
      return imageBitmap.width === 1 && imageBitmap.height === 1;
    } catch {
      return !1;
    }
  }
  checkImageBitmap().then((result) => {
    self.postMessage(result);
  });
})();
`;
let WORKER_URL = null;
class WorkerInstance {
    constructor(){
        WORKER_URL || (WORKER_URL = URL.createObjectURL(new Blob([
            WORKER_CODE
        ], {
            type: "application/javascript"
        }))), this.worker = new Worker(WORKER_URL);
    }
}
WorkerInstance.revokeObjectURL = function() {
    WORKER_URL && (URL.revokeObjectURL(WORKER_URL), WORKER_URL = null);
};
;
 //# sourceMappingURL=checkImageBitmap.worker.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/_virtual/loadImageBitmap.worker.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WorkerInstance
]);
const WORKER_CODE = `(function() {
  "use strict";
  async function loadImageBitmap(url) {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(\`[WorkerManager.loadImageBitmap] Failed to fetch \${url}: \${response.status} \${response.statusText}\`);
    const imageBlob = await response.blob();
    return await createImageBitmap(imageBlob);
  }
  self.onmessage = async (event) => {
    try {
      const imageBitmap = await loadImageBitmap(event.data.data[0]);
      self.postMessage({
        data: imageBitmap,
        uuid: event.data.uuid,
        id: event.data.id
      }, [imageBitmap]);
    } catch (e) {
      self.postMessage({
        error: e,
        uuid: event.data.uuid,
        id: event.data.id
      });
    }
  };
})();
`;
let WORKER_URL = null;
class WorkerInstance {
    constructor(){
        WORKER_URL || (WORKER_URL = URL.createObjectURL(new Blob([
            WORKER_CODE
        ], {
            type: "application/javascript"
        }))), this.worker = new Worker(WORKER_URL);
    }
}
WorkerInstance.revokeObjectURL = function() {
    WORKER_URL && (URL.revokeObjectURL(WORKER_URL), WORKER_URL = null);
};
;
 //# sourceMappingURL=loadImageBitmap.worker.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/WorkerManager.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkerManager",
    ()=>WorkerManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$_virtual$2f$checkImageBitmap$2e$worker$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/_virtual/checkImageBitmap.worker.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$_virtual$2f$loadImageBitmap$2e$worker$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/_virtual/loadImageBitmap.worker.mjs [app-client] (ecmascript)");
;
;
let UUID = 0, MAX_WORKERS;
class WorkerManagerClass {
    constructor(){
        this._initialized = !1, this._createdWorkers = 0, this.workerPool = [], this.queue = [], this.resolveHash = {};
    }
    isImageBitmapSupported() {
        return this._isImageBitmapSupported !== void 0 ? this._isImageBitmapSupported : (this._isImageBitmapSupported = new Promise((resolve)=>{
            const { worker } = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$_virtual$2f$checkImageBitmap$2e$worker$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
            worker.addEventListener("message", (event)=>{
                worker.terminate(), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$_virtual$2f$checkImageBitmap$2e$worker$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].revokeObjectURL(), resolve(event.data);
            });
        }), this._isImageBitmapSupported);
    }
    loadImageBitmap(src) {
        return this._run("loadImageBitmap", [
            src
        ]);
    }
    async _initWorkers() {
        this._initialized || (this._initialized = !0);
    }
    getWorker() {
        MAX_WORKERS === void 0 && (MAX_WORKERS = navigator.hardwareConcurrency || 4);
        let worker = this.workerPool.pop();
        return !worker && this._createdWorkers < MAX_WORKERS && (this._createdWorkers++, worker = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$_virtual$2f$loadImageBitmap$2e$worker$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]().worker, worker.addEventListener("message", (event)=>{
            this.complete(event.data), this.returnWorker(event.target), this.next();
        })), worker;
    }
    returnWorker(worker) {
        this.workerPool.push(worker);
    }
    complete(data) {
        data.error !== void 0 ? this.resolveHash[data.uuid].reject(data.error) : this.resolveHash[data.uuid].resolve(data.data), this.resolveHash[data.uuid] = null;
    }
    async _run(id, args) {
        await this._initWorkers();
        const promise = new Promise((resolve, reject)=>{
            this.queue.push({
                id,
                arguments: args,
                resolve,
                reject
            });
        });
        return this.next(), promise;
    }
    next() {
        if (!this.queue.length) return;
        const worker = this.getWorker();
        if (!worker) return;
        const toDo = this.queue.pop(), id = toDo.id;
        this.resolveHash[UUID] = {
            resolve: toDo.resolve,
            reject: toDo.reject
        }, worker.postMessage({
            data: toDo.arguments,
            uuid: UUID++,
            id
        });
    }
}
const WorkerManager = new WorkerManagerClass();
;
 //# sourceMappingURL=WorkerManager.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/utils/createTexture.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTexture",
    ()=>createTexture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/Texture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/Cache.mjs [app-client] (ecmascript)");
;
;
function createTexture(base, loader, url) {
    base.resource.internal = !0;
    const texture = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Texture"](base), unload = ()=>{
        delete loader.promiseCache[url], __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cache"].has(url) && __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cache"].remove(url);
    };
    return texture.baseTexture.once("destroyed", ()=>{
        url in loader.promiseCache && (console.warn("[Assets] A BaseTexture managed by Assets was destroyed instead of unloaded! Use Assets.unload() instead of destroying the BaseTexture."), unload());
    }), texture.once("destroyed", ()=>{
        base.destroyed || (console.warn("[Assets] A Texture managed by Assets was destroyed instead of unloaded! Use Assets.unload() instead of destroying the Texture."), unload());
    }), texture;
}
;
 //# sourceMappingURL=createTexture.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadTextures.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadImageBitmap",
    ()=>loadImageBitmap,
    "loadTextures",
    ()=>loadTextures
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <export * as utils>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkDataUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkExtension.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/LoaderParser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$WorkerManager$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/WorkerManager.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$createTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/utils/createTexture.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
const validImageExtensions = [
    ".jpeg",
    ".jpg",
    ".png",
    ".webp",
    ".avif"
], validImageMIMEs = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif"
];
async function loadImageBitmap(url) {
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.fetch(url);
    if (!response.ok) throw new Error(`[loadImageBitmap] Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    const imageBlob = await response.blob();
    return await createImageBitmap(imageBlob);
}
const loadTextures = {
    name: "loadTextures",
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].LoadParser,
        priority: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoaderParserPriority"].High
    },
    config: {
        preferWorkers: !0,
        preferCreateImageBitmap: !0,
        crossOrigin: "anonymous"
    },
    test (url) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkDataUrl"])(url, validImageMIMEs) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkExtension"])(url, validImageExtensions);
    },
    async load (url, asset, loader) {
        const useImageBitmap = globalThis.createImageBitmap && this.config.preferCreateImageBitmap;
        let src;
        useImageBitmap ? this.config.preferWorkers && await __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$WorkerManager$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WorkerManager"].isImageBitmapSupported() ? src = await __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$WorkerManager$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WorkerManager"].loadImageBitmap(url) : src = await loadImageBitmap(url) : src = await new Promise((resolve, reject)=>{
            const src2 = new Image();
            src2.crossOrigin = this.config.crossOrigin, src2.src = url, src2.complete ? resolve(src2) : (src2.onload = ()=>resolve(src2), src2.onerror = (e)=>reject(e));
        });
        const options = {
            ...asset.data
        };
        options.resolution ?? (options.resolution = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].getResolutionOfUrl(url)), useImageBitmap && options.resourceOptions?.ownsImageBitmap === void 0 && (options.resourceOptions = {
            ...options.resourceOptions
        }, options.resourceOptions.ownsImageBitmap = !0);
        const base = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"](src, options);
        return base.resource.src = url, (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$createTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTexture"])(base, loader, url);
    },
    unload (texture) {
        texture.destroy(!0);
    }
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(loadTextures);
;
 //# sourceMappingURL=loadTextures.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadSVG.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadSVG",
    ()=>loadSVG
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$SVGResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/SVGResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <export * as utils>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkDataUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkExtension.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/LoaderParser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadTextures.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$createTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/utils/createTexture.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
const validSVGExtension = ".svg", validSVGMIME = "image/svg+xml", loadSVG = {
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].LoadParser,
        priority: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoaderParserPriority"].High
    },
    name: "loadSVG",
    test (url) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkDataUrl"])(url, validSVGMIME) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkExtension"])(url, validSVGExtension);
    },
    async testParse (data) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$SVGResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SVGResource"].test(data);
    },
    async parse (asset, data, loader) {
        const src = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$SVGResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SVGResource"](asset, data?.data?.resourceOptions);
        await src.load();
        const base = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"](src, {
            resolution: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].getResolutionOfUrl(asset),
            ...data?.data
        });
        return base.resource.src = data.src, (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$createTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTexture"])(base, loader, data.src);
    },
    async load (url, _options) {
        return (await __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.fetch(url)).text();
    },
    unload: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadTextures"].unload
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(loadSVG);
;
 //# sourceMappingURL=loadSVG.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadVideo.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadVideo",
    ()=>loadVideo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$VideoResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/VideoResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <export * as utils>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkDataUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkExtension.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/LoaderParser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$createTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/utils/createTexture.mjs [app-client] (ecmascript)");
;
;
;
;
;
const validVideoExtensions = [
    ".mp4",
    ".m4v",
    ".webm",
    ".ogv"
], validVideoMIMEs = [
    "video/mp4",
    "video/webm",
    "video/ogg"
], loadVideo = {
    name: "loadVideo",
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].LoadParser,
        priority: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoaderParserPriority"].High
    },
    config: {
        defaultAutoPlay: !0,
        defaultUpdateFPS: 0,
        defaultLoop: !1,
        defaultMuted: !1,
        defaultPlaysinline: !0
    },
    test (url) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkDataUrl"])(url, validVideoMIMEs) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkExtension"])(url, validVideoExtensions);
    },
    async load (url, loadAsset, loader) {
        let texture;
        const blob = await (await __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.fetch(url)).blob(), blobURL = URL.createObjectURL(blob);
        try {
            const options = {
                autoPlay: this.config.defaultAutoPlay,
                updateFPS: this.config.defaultUpdateFPS,
                loop: this.config.defaultLoop,
                muted: this.config.defaultMuted,
                playsinline: this.config.defaultPlaysinline,
                ...loadAsset?.data?.resourceOptions,
                autoLoad: !0
            }, src = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$VideoResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VideoResource"](blobURL, options);
            await src.load();
            const base = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"](src, {
                alphaMode: await __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].detectVideoAlphaMode(),
                resolution: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].getResolutionOfUrl(url),
                ...loadAsset?.data
            });
            base.resource.src = url, texture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$createTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTexture"])(base, loader, url), texture.baseTexture.once("destroyed", ()=>{
                URL.revokeObjectURL(blobURL);
            });
        } catch (e) {
            throw URL.revokeObjectURL(blobURL), e;
        }
        return texture;
    },
    unload (texture) {
        texture.destroy(!0);
    }
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(loadVideo);
;
 //# sourceMappingURL=loadVideo.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/utils/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$createTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/utils/createTexture.mjs [app-client] (ecmascript)");
;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadSVG$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadSVG.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadTextures.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadVideo$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadVideo.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/utils/index.mjs [app-client] (ecmascript) <locals>");
;
;
;
;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/LoaderParser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadJson$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadJson.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadTxt$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadTxt.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadWebFont$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadWebFont.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/index.mjs [app-client] (ecmascript) <locals>");
;
;
;
;
;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/Resolver.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Resolver",
    ()=>Resolver
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <export * as utils>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/convertToList.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$createStringVariations$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/createStringVariations.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/isSingleItem.mjs [app-client] (ecmascript)");
;
;
;
;
class Resolver {
    constructor(){
        this._defaultBundleIdentifierOptions = {
            connector: "-",
            createBundleAssetId: (bundleId, assetId)=>`${bundleId}${this._bundleIdConnector}${assetId}`,
            extractAssetIdFromBundle: (bundleId, assetBundleId)=>assetBundleId.replace(`${bundleId}${this._bundleIdConnector}`, "")
        }, this._bundleIdConnector = this._defaultBundleIdentifierOptions.connector, this._createBundleAssetId = this._defaultBundleIdentifierOptions.createBundleAssetId, this._extractAssetIdFromBundle = this._defaultBundleIdentifierOptions.extractAssetIdFromBundle, this._assetMap = {}, this._preferredOrder = [], this._parsers = [], this._resolverHash = {}, this._bundles = {};
    }
    /**
   * Override how the resolver deals with generating bundle ids.
   * must be called before any bundles are added
   * @param bundleIdentifier - the bundle identifier options
   */ setBundleIdentifier(bundleIdentifier) {
        if (this._bundleIdConnector = bundleIdentifier.connector ?? this._bundleIdConnector, this._createBundleAssetId = bundleIdentifier.createBundleAssetId ?? this._createBundleAssetId, this._extractAssetIdFromBundle = bundleIdentifier.extractAssetIdFromBundle ?? this._extractAssetIdFromBundle, this._extractAssetIdFromBundle("foo", this._createBundleAssetId("foo", "bar")) !== "bar") throw new Error("[Resolver] GenerateBundleAssetId are not working correctly");
    }
    /**
   * Let the resolver know which assets you prefer to use when resolving assets.
   * Multiple prefer user defined rules can be added.
   * @example
   * resolver.prefer({
   *     // first look for something with the correct format, and then then correct resolution
   *     priority: ['format', 'resolution'],
   *     params:{
   *         format:'webp', // prefer webp images
   *         resolution: 2, // prefer a resolution of 2
   *     }
   * })
   * resolver.add('foo', ['bar@2x.webp', 'bar@2x.png', 'bar.webp', 'bar.png']);
   * resolver.resolveUrl('foo') // => 'bar@2x.webp'
   * @param preferOrders - the prefer options
   */ prefer(...preferOrders) {
        preferOrders.forEach((prefer)=>{
            this._preferredOrder.push(prefer), prefer.priority || (prefer.priority = Object.keys(prefer.params));
        }), this._resolverHash = {};
    }
    /**
   * Set the base path to prepend to all urls when resolving
   * @example
   * resolver.basePath = 'https://home.com/';
   * resolver.add('foo', 'bar.ong');
   * resolver.resolveUrl('foo', 'bar.png'); // => 'https://home.com/bar.png'
   * @param basePath - the base path to use
   */ set basePath(basePath) {
        this._basePath = basePath;
    }
    get basePath() {
        return this._basePath;
    }
    /**
   * Set the root path for root-relative URLs. By default the `basePath`'s root is used. If no `basePath` is set, then the
   * default value for browsers is `window.location.origin`
   * @example
   * // Application hosted on https://home.com/some-path/index.html
   * resolver.basePath = 'https://home.com/some-path/';
   * resolver.rootPath = 'https://home.com/';
   * resolver.add('foo', '/bar.png');
   * resolver.resolveUrl('foo', '/bar.png'); // => 'https://home.com/bar.png'
   * @param rootPath - the root path to use
   */ set rootPath(rootPath) {
        this._rootPath = rootPath;
    }
    get rootPath() {
        return this._rootPath;
    }
    /**
   * All the active URL parsers that help the parser to extract information and create
   * an asset object-based on parsing the URL itself.
   *
   * Can be added using the extensions API
   * @example
   * resolver.add('foo', [
   *     {
   *         resolution: 2,
   *         format: 'png',
   *         src: 'image@2x.png',
   *     },
   *     {
   *         resolution:1,
   *         format:'png',
   *         src: 'image.png',
   *     },
   * ]);
   *
   * // With a url parser the information such as resolution and file format could extracted from the url itself:
   * extensions.add({
   *     extension: ExtensionType.ResolveParser,
   *     test: loadTextures.test, // test if url ends in an image
   *     parse: (value: string) =>
   *     ({
   *         resolution: parseFloat(settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
   *         format: value.split('.').pop(),
   *         src: value,
   *     }),
   * });
   *
   * // Now resolution and format can be extracted from the url
   * resolver.add('foo', [
   *     'image@2x.png',
   *     'image.png',
   * ]);
   */ get parsers() {
        return this._parsers;
    }
    /** Used for testing, this resets the resolver to its initial state */ reset() {
        this.setBundleIdentifier(this._defaultBundleIdentifierOptions), this._assetMap = {}, this._preferredOrder = [], this._resolverHash = {}, this._rootPath = null, this._basePath = null, this._manifest = null, this._bundles = {}, this._defaultSearchParams = null;
    }
    /**
   * Sets the default URL search parameters for the URL resolver. The urls can be specified as a string or an object.
   * @param searchParams - the default url parameters to append when resolving urls
   */ setDefaultSearchParams(searchParams) {
        if (typeof searchParams == "string") this._defaultSearchParams = searchParams;
        else {
            const queryValues = searchParams;
            this._defaultSearchParams = Object.keys(queryValues).map((key)=>`${encodeURIComponent(key)}=${encodeURIComponent(queryValues[key])}`).join("&");
        }
    }
    /**
   * Returns the aliases for a given asset
   * @param asset - the asset to get the aliases for
   */ getAlias(asset) {
        const { alias, name, src, srcs } = asset;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(alias || name || src || srcs, (value)=>typeof value == "string" ? value : Array.isArray(value) ? value.map((v)=>v?.src ?? v?.srcs ?? v) : value?.src || value?.srcs ? value.src ?? value.srcs : value, !0);
    }
    /**
   * Add a manifest to the asset resolver. This is a nice way to add all the asset information in one go.
   * generally a manifest would be built using a tool.
   * @param manifest - the manifest to add to the resolver
   */ addManifest(manifest) {
        this._manifest && console.warn("[Resolver] Manifest already exists, this will be overwritten"), this._manifest = manifest, manifest.bundles.forEach((bundle)=>{
            this.addBundle(bundle.name, bundle.assets);
        });
    }
    /**
   * This adds a bundle of assets in one go so that you can resolve them as a group.
   * For example you could add a bundle for each screen in you pixi app
   * @example
   * resolver.addBundle('animals', {
   *     bunny: 'bunny.png',
   *     chicken: 'chicken.png',
   *     thumper: 'thumper.png',
   * });
   *
   * const resolvedAssets = await resolver.resolveBundle('animals');
   * @param bundleId - The id of the bundle to add
   * @param assets - A record of the asset or assets that will be chosen from when loading via the specified key
   */ addBundle(bundleId, assets) {
        const assetNames = [];
        Array.isArray(assets) ? assets.forEach((asset)=>{
            const srcs = asset.src ?? asset.srcs, aliases = asset.alias ?? asset.name;
            let ids;
            if (typeof aliases == "string") {
                const bundleAssetId = this._createBundleAssetId(bundleId, aliases);
                assetNames.push(bundleAssetId), ids = [
                    aliases,
                    bundleAssetId
                ];
            } else {
                const bundleIds = aliases.map((name)=>this._createBundleAssetId(bundleId, name));
                assetNames.push(...bundleIds), ids = [
                    ...aliases,
                    ...bundleIds
                ];
            }
            this.add({
                ...asset,
                alias: ids,
                src: srcs
            });
        }) : Object.keys(assets).forEach((key)=>{
            const aliases = [
                key,
                this._createBundleAssetId(bundleId, key)
            ];
            if (typeof assets[key] == "string") this.add({
                alias: aliases,
                src: assets[key]
            });
            else if (Array.isArray(assets[key])) this.add({
                alias: aliases,
                src: assets[key]
            });
            else {
                const asset = assets[key], assetSrc = asset.src ?? asset.srcs;
                this.add({
                    ...asset,
                    alias: aliases,
                    src: Array.isArray(assetSrc) ? assetSrc : [
                        assetSrc
                    ]
                });
            }
            assetNames.push(...aliases);
        }), this._bundles[bundleId] = assetNames;
    }
    add(aliases, srcs, data, format, loadParser) {
        const assets = [];
        typeof aliases == "string" || Array.isArray(aliases) && typeof aliases[0] == "string" ? (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].deprecation("7.2.0", `Assets.add now uses an object instead of individual parameters.
Please use Assets.add({ alias, src, data, format, loadParser }) instead.`), assets.push({
            alias: aliases,
            src: srcs,
            data,
            format,
            loadParser
        })) : Array.isArray(aliases) ? assets.push(...aliases) : assets.push(aliases);
        let keyCheck;
        keyCheck = (key)=>{
            this.hasKey(key) && console.warn(`[Resolver] already has key: ${key} overwriting`);
        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(assets).forEach((asset)=>{
            const { src, srcs: srcs2 } = asset;
            let { data: data2, format: format2, loadParser: loadParser2 } = asset;
            const srcsToUse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(src || srcs2).map((src2)=>typeof src2 == "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$createStringVariations$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createStringVariations"])(src2) : Array.isArray(src2) ? src2 : [
                    src2
                ]), aliasesToUse = this.getAlias(asset);
            Array.isArray(aliasesToUse) ? aliasesToUse.forEach(keyCheck) : keyCheck(aliasesToUse);
            const resolvedAssets = [];
            srcsToUse.forEach((srcs3)=>{
                srcs3.forEach((src2)=>{
                    let formattedAsset = {};
                    if (typeof src2 != "object") {
                        formattedAsset.src = src2;
                        for(let i = 0; i < this._parsers.length; i++){
                            const parser = this._parsers[i];
                            if (parser.test(src2)) {
                                formattedAsset = parser.parse(src2);
                                break;
                            }
                        }
                    } else data2 = src2.data ?? data2, format2 = src2.format ?? format2, loadParser2 = src2.loadParser ?? loadParser2, formattedAsset = {
                        ...formattedAsset,
                        ...src2
                    };
                    if (!aliasesToUse) throw new Error(`[Resolver] alias is undefined for this asset: ${formattedAsset.src}`);
                    formattedAsset = this.buildResolvedAsset(formattedAsset, {
                        aliases: aliasesToUse,
                        data: data2,
                        format: format2,
                        loadParser: loadParser2
                    }), resolvedAssets.push(formattedAsset);
                });
            }), aliasesToUse.forEach((alias)=>{
                this._assetMap[alias] = resolvedAssets;
            });
        });
    }
    // TODO: this needs an overload like load did in Assets
    /**
   * If the resolver has had a manifest set via setManifest, this will return the assets urls for
   * a given bundleId or bundleIds.
   * @example
   * // Manifest Example
   * const manifest = {
   *     bundles: [
   *         {
   *             name: 'load-screen',
   *             assets: [
   *                 {
   *                     alias: 'background',
   *                     src: 'sunset.png',
   *                 },
   *                 {
   *                     alias: 'bar',
   *                     src: 'load-bar.{png,webp}',
   *                 },
   *             ],
   *         },
   *         {
   *             name: 'game-screen',
   *             assets: [
   *                 {
   *                     alias: 'character',
   *                     src: 'robot.png',
   *                 },
   *                 {
   *                     alias: 'enemy',
   *                     src: 'bad-guy.png',
   *                 },
   *             ],
   *         },
   *     ]
   * };
   *
   * resolver.setManifest(manifest);
   * const resolved = resolver.resolveBundle('load-screen');
   * @param bundleIds - The bundle ids to resolve
   * @returns All the bundles assets or a hash of assets for each bundle specified
   */ resolveBundle(bundleIds) {
        const singleAsset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSingleItem"])(bundleIds);
        bundleIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(bundleIds);
        const out = {};
        return bundleIds.forEach((bundleId)=>{
            const assetNames = this._bundles[bundleId];
            if (assetNames) {
                const results = this.resolve(assetNames), assets = {};
                for(const key in results){
                    const asset = results[key];
                    assets[this._extractAssetIdFromBundle(bundleId, key)] = asset;
                }
                out[bundleId] = assets;
            }
        }), singleAsset ? out[bundleIds[0]] : out;
    }
    /**
   * Does exactly what resolve does, but returns just the URL rather than the whole asset object
   * @param key - The key or keys to resolve
   * @returns - The URLs associated with the key(s)
   */ resolveUrl(key) {
        const result = this.resolve(key);
        if (typeof key != "string") {
            const out = {};
            for(const i in result)out[i] = result[i].src;
            return out;
        }
        return result.src;
    }
    resolve(keys) {
        const singleAsset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSingleItem"])(keys);
        keys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(keys);
        const result = {};
        return keys.forEach((key)=>{
            if (!this._resolverHash[key]) if (this._assetMap[key]) {
                let assets = this._assetMap[key];
                const bestAsset = assets[0], preferredOrder = this._getPreferredOrder(assets);
                preferredOrder?.priority.forEach((priorityKey)=>{
                    preferredOrder.params[priorityKey].forEach((value)=>{
                        const filteredAssets = assets.filter((asset)=>asset[priorityKey] ? asset[priorityKey] === value : !1);
                        filteredAssets.length && (assets = filteredAssets);
                    });
                }), this._resolverHash[key] = assets[0] ?? bestAsset;
            } else this._resolverHash[key] = this.buildResolvedAsset({
                alias: [
                    key
                ],
                src: key
            }, {});
            result[key] = this._resolverHash[key];
        }), singleAsset ? result[keys[0]] : result;
    }
    /**
   * Checks if an asset with a given key exists in the resolver
   * @param key - The key of the asset
   */ hasKey(key) {
        return !!this._assetMap[key];
    }
    /**
   * Checks if a bundle with the given key exists in the resolver
   * @param key - The key of the bundle
   */ hasBundle(key) {
        return !!this._bundles[key];
    }
    /**
   * Internal function for figuring out what prefer criteria an asset should use.
   * @param assets
   */ _getPreferredOrder(assets) {
        for(let i = 0; i < assets.length; i++){
            const asset = assets[0], preferred = this._preferredOrder.find((preference)=>preference.params.format.includes(asset.format));
            if (preferred) return preferred;
        }
        return this._preferredOrder[0];
    }
    /**
   * Appends the default url parameters to the url
   * @param url - The url to append the default parameters to
   * @returns - The url with the default parameters appended
   */ _appendDefaultSearchParams(url) {
        if (!this._defaultSearchParams) return url;
        const paramConnector = /\?/.test(url) ? "&" : "?";
        return `${url}${paramConnector}${this._defaultSearchParams}`;
    }
    buildResolvedAsset(formattedAsset, data) {
        const { aliases, data: assetData, loadParser, format } = data;
        return (this._basePath || this._rootPath) && (formattedAsset.src = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].path.toAbsolute(formattedAsset.src, this._basePath, this._rootPath)), formattedAsset.alias = aliases ?? formattedAsset.alias ?? [
            formattedAsset.src
        ], formattedAsset.src = this._appendDefaultSearchParams(formattedAsset.src), formattedAsset.data = {
            ...assetData || {},
            ...formattedAsset.data
        }, formattedAsset.loadParser = loadParser ?? formattedAsset.loadParser, formattedAsset.format = format ?? formattedAsset.format ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].path.extname(formattedAsset.src).slice(1), formattedAsset.srcs = formattedAsset.src, formattedAsset.name = formattedAsset.alias, formattedAsset;
    }
}
;
 //# sourceMappingURL=Resolver.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/Assets.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Assets",
    ()=>Assets,
    "AssetsClass",
    ()=>AssetsClass
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <export * as utils>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$BackgroundLoader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/BackgroundLoader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/Cache.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$Loader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/Loader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$resolver$2f$Resolver$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/Resolver.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/convertToList.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/isSingleItem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadTextures.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
class AssetsClass {
    constructor(){
        this._detections = [], this._initialized = !1, this.resolver = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$resolver$2f$Resolver$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resolver"](), this.loader = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$Loader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Loader"](), this.cache = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cache"], this._backgroundLoader = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$BackgroundLoader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BackgroundLoader"](this.loader), this._backgroundLoader.active = !0, this.reset();
    }
    /**
   * Best practice is to call this function before any loading commences
   * Initiating is the best time to add any customization to the way things are loaded.
   *
   * you do not need to call this for the Asset class to work, only if you want to set any initial properties
   * @param options - options to initialize the Asset manager with
   */ async init(options = {}) {
        if (this._initialized) {
            console.warn("[Assets]AssetManager already initialized, did you load before calling this Assets.init()?");
            return;
        }
        if (this._initialized = !0, options.defaultSearchParams && this.resolver.setDefaultSearchParams(options.defaultSearchParams), options.basePath && (this.resolver.basePath = options.basePath), options.bundleIdentifier && this.resolver.setBundleIdentifier(options.bundleIdentifier), options.manifest) {
            let manifest = options.manifest;
            typeof manifest == "string" && (manifest = await this.load(manifest)), this.resolver.addManifest(manifest);
        }
        const resolutionPref = options.texturePreference?.resolution ?? 1, resolution = typeof resolutionPref == "number" ? [
            resolutionPref
        ] : resolutionPref, formats = await this._detectFormats({
            preferredFormats: options.texturePreference?.format,
            skipDetections: options.skipDetections,
            detections: this._detections
        });
        this.resolver.prefer({
            params: {
                format: formats,
                resolution
            }
        }), options.preferences && this.setPreferences(options.preferences);
    }
    add(aliases, srcs, data, format, loadParser) {
        this.resolver.add(aliases, srcs, data, format, loadParser);
    }
    async load(urls, onProgress) {
        this._initialized || await this.init();
        const singleAsset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSingleItem"])(urls), urlArray = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(urls).map((url)=>{
            if (typeof url != "string") {
                const aliases = this.resolver.getAlias(url);
                return aliases.some((alias)=>!this.resolver.hasKey(alias)) && this.add(url), Array.isArray(aliases) ? aliases[0] : aliases;
            }
            return this.resolver.hasKey(url) || this.add({
                alias: url,
                src: url
            }), url;
        }), resolveResults = this.resolver.resolve(urlArray), out = await this._mapLoadToResolve(resolveResults, onProgress);
        return singleAsset ? out[urlArray[0]] : out;
    }
    /**
   * This adds a bundle of assets in one go so that you can load them as a group.
   * For example you could add a bundle for each screen in you pixi app
   * @example
   * import { Assets } from 'pixi.js';
   *
   * Assets.addBundle('animals', {
   *     bunny: 'bunny.png',
   *     chicken: 'chicken.png',
   *     thumper: 'thumper.png',
   * });
   *
   * const assets = await Assets.loadBundle('animals');
   * @param bundleId - the id of the bundle to add
   * @param assets - a record of the asset or assets that will be chosen from when loading via the specified key
   */ addBundle(bundleId, assets) {
        this.resolver.addBundle(bundleId, assets);
    }
    /**
   * Bundles are a way to load multiple assets at once.
   * If a manifest has been provided to the init function then you can load a bundle, or bundles.
   * you can also add bundles via `addBundle`
   * @example
   * import { Assets } from 'pixi.js';
   *
   * // Manifest Example
   * const manifest = {
   *     bundles: [
   *         {
   *             name: 'load-screen',
   *             assets: [
   *                 {
   *                     alias: 'background',
   *                     src: 'sunset.png',
   *                 },
   *                 {
   *                     alias: 'bar',
   *                     src: 'load-bar.{png,webp}',
   *                 },
   *             ],
   *         },
   *         {
   *             name: 'game-screen',
   *             assets: [
   *                 {
   *                     alias: 'character',
   *                     src: 'robot.png',
   *                 },
   *                 {
   *                     alias: 'enemy',
   *                     src: 'bad-guy.png',
   *                 },
   *             ],
   *         },
   *     ]
   * };
   *
   * await Assets.init({ manifest });
   *
   * // Load a bundle...
   * loadScreenAssets = await Assets.loadBundle('load-screen');
   * // Load another bundle...
   * gameScreenAssets = await Assets.loadBundle('game-screen');
   * @param bundleIds - the bundle id or ids to load
   * @param onProgress - Optional function that is called when progress on asset loading is made.
   * The function is passed a single parameter, `progress`, which represents the percentage (0.0 - 1.0)
   * of the assets loaded. Do not use this function to detect when assets are complete and available,
   * instead use the Promise returned by this function.
   * @returns all the bundles assets or a hash of assets for each bundle specified
   */ async loadBundle(bundleIds, onProgress) {
        this._initialized || await this.init();
        let singleAsset = !1;
        typeof bundleIds == "string" && (singleAsset = !0, bundleIds = [
            bundleIds
        ]);
        const resolveResults = this.resolver.resolveBundle(bundleIds), out = {}, keys = Object.keys(resolveResults);
        let count = 0, total = 0;
        const _onProgress = ()=>{
            onProgress?.(++count / total);
        }, promises = keys.map((bundleId)=>{
            const resolveResult = resolveResults[bundleId];
            return total += Object.keys(resolveResult).length, this._mapLoadToResolve(resolveResult, _onProgress).then((resolveResult2)=>{
                out[bundleId] = resolveResult2;
            });
        });
        return await Promise.all(promises), singleAsset ? out[bundleIds[0]] : out;
    }
    /**
   * Initiate a background load of some assets. It will passively begin to load these assets in the background.
   * So when you actually come to loading them you will get a promise that resolves to the loaded assets immediately
   *
   * An example of this might be that you would background load game assets after your inital load.
   * then when you got to actually load your game screen assets when a player goes to the game - the loading
   * would already have stared or may even be complete, saving you having to show an interim load bar.
   * @example
   * import { Assets } from 'pixi.js';
   *
   * Assets.backgroundLoad('bunny.png');
   *
   * // later on in your app...
   * await Assets.loadBundle('bunny.png'); // Will resolve quicker as loading may have completed!
   * @param urls - the url / urls you want to background load
   */ async backgroundLoad(urls) {
        this._initialized || await this.init(), typeof urls == "string" && (urls = [
            urls
        ]);
        const resolveResults = this.resolver.resolve(urls);
        this._backgroundLoader.add(Object.values(resolveResults));
    }
    /**
   * Initiate a background of a bundle, works exactly like backgroundLoad but for bundles.
   * this can only be used if the loader has been initiated with a manifest
   * @example
   * import { Assets } from 'pixi.js';
   *
   * await Assets.init({
   *     manifest: {
   *         bundles: [
   *             {
   *                 name: 'load-screen',
   *                 assets: [...],
   *             },
   *             ...
   *         ],
   *     },
   * });
   *
   * Assets.backgroundLoadBundle('load-screen');
   *
   * // Later on in your app...
   * await Assets.loadBundle('load-screen'); // Will resolve quicker as loading may have completed!
   * @param bundleIds - the bundleId / bundleIds you want to background load
   */ async backgroundLoadBundle(bundleIds) {
        this._initialized || await this.init(), typeof bundleIds == "string" && (bundleIds = [
            bundleIds
        ]);
        const resolveResults = this.resolver.resolveBundle(bundleIds);
        Object.values(resolveResults).forEach((resolveResult)=>{
            this._backgroundLoader.add(Object.values(resolveResult));
        });
    }
    /**
   * Only intended for development purposes.
   * This will wipe the resolver and caches.
   * You will need to reinitialize the Asset
   */ reset() {
        this.resolver.reset(), this.loader.reset(), this.cache.reset(), this._initialized = !1;
    }
    get(keys) {
        if (typeof keys == "string") return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cache"].get(keys);
        const assets = {};
        for(let i = 0; i < keys.length; i++)assets[i] = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cache"].get(keys[i]);
        return assets;
    }
    /**
   * helper function to map resolved assets back to loaded assets
   * @param resolveResults - the resolve results from the resolver
   * @param onProgress - the progress callback
   */ async _mapLoadToResolve(resolveResults, onProgress) {
        const resolveArray = Object.values(resolveResults), resolveKeys = Object.keys(resolveResults);
        this._backgroundLoader.active = !1;
        const loadedAssets = await this.loader.load(resolveArray, onProgress);
        this._backgroundLoader.active = !0;
        const out = {};
        return resolveArray.forEach((resolveResult, i)=>{
            const asset = loadedAssets[resolveResult.src], keys = [
                resolveResult.src
            ];
            resolveResult.alias && keys.push(...resolveResult.alias), out[resolveKeys[i]] = asset, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cache"].set(keys, asset);
        }), out;
    }
    /**
   * Unload an asset or assets. As the Assets class is responsible for creating the assets via the `load` function
   * this will make sure to destroy any assets and release them from memory.
   * Once unloaded, you will need to load the asset again.
   *
   * Use this to help manage assets if you find that you have a large app and you want to free up memory.
   *
   * - it's up to you as the developer to make sure that textures are not actively being used when you unload them,
   * Pixi won't break but you will end up with missing assets. Not a good look for the user!
   * @example
   * import { Assets } from 'pixi.js';
   *
   * // Load a URL:
   * const myImageTexture = await Assets.load('http://some.url.com/image.png'); // => returns a texture
   *
   * await Assets.unload('http://some.url.com/image.png')
   *
   * // myImageTexture will be destroyed now.
   *
   * // Unload multiple assets:
   * const textures = await Assets.unload(['thumper', 'chicko']);
   * @param urls - the urls to unload
   */ async unload(urls) {
        this._initialized || await this.init();
        const urlArray = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(urls).map((url)=>typeof url != "string" ? url.src : url), resolveResults = this.resolver.resolve(urlArray);
        await this._unloadFromResolved(resolveResults);
    }
    /**
   * Bundles are a way to manage multiple assets at once.
   * this will unload all files in a bundle.
   *
   * once a bundle has been unloaded, you need to load it again to have access to the assets.
   * @example
   * import { Assets } from 'pixi.js';
   *
   * Assets.addBundle({
   *     'thumper': 'http://some.url.com/thumper.png',
   * })
   *
   * const assets = await Assets.loadBundle('thumper');
   *
   * // Now to unload...
   *
   * await Assets.unloadBundle('thumper');
   *
   * // All assets in the assets object will now have been destroyed and purged from the cache
   * @param bundleIds - the bundle id or ids to unload
   */ async unloadBundle(bundleIds) {
        this._initialized || await this.init(), bundleIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"])(bundleIds);
        const resolveResults = this.resolver.resolveBundle(bundleIds), promises = Object.keys(resolveResults).map((bundleId)=>this._unloadFromResolved(resolveResults[bundleId]));
        await Promise.all(promises);
    }
    async _unloadFromResolved(resolveResult) {
        const resolveArray = Object.values(resolveResult);
        resolveArray.forEach((resolveResult2)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cache"].remove(resolveResult2.src);
        }), await this.loader.unload(resolveArray);
    }
    /**
   * Detects the supported formats for the browser, and returns an array of supported formats, respecting
   * the users preferred formats order.
   * @param options - the options to use when detecting formats
   * @param options.preferredFormats - the preferred formats to use
   * @param options.skipDetections - if we should skip the detections altogether
   * @param options.detections - the detections to use
   * @returns - the detected formats
   */ async _detectFormats(options) {
        let formats = [];
        options.preferredFormats && (formats = Array.isArray(options.preferredFormats) ? options.preferredFormats : [
            options.preferredFormats
        ]);
        for (const detection of options.detections)options.skipDetections || await detection.test() ? formats = await detection.add(formats) : options.skipDetections || (formats = await detection.remove(formats));
        return formats = formats.filter((format, index)=>formats.indexOf(format) === index), formats;
    }
    /** All the detection parsers currently added to the Assets class. */ get detections() {
        return this._detections;
    }
    /**
   * @deprecated since 7.2.0
   * @see {@link Assets.setPreferences}
   */ get preferWorkers() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadTextures"].config.preferWorkers;
    }
    set preferWorkers(value) {
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].deprecation("7.2.0", "Assets.prefersWorkers is deprecated, use Assets.setPreferences({ preferWorkers: true }) instead."), this.setPreferences({
            preferWorkers: value
        });
    }
    /**
   * General setter for preferences. This is a helper function to set preferences on all parsers.
   * @param preferences - the preferences to set
   */ setPreferences(preferences) {
        this.loader.parsers.forEach((parser)=>{
            parser.config && Object.keys(parser.config).filter((key)=>key in preferences).forEach((key)=>{
                parser.config[key] = preferences[key];
            });
        });
    }
}
const Assets = new AssetsClass();
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].handleByList(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].LoadParser, Assets.loader.parsers).handleByList(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].ResolveParser, Assets.resolver.parsers).handleByList(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].CacheParser, Assets.cache.parsers).handleByList(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].DetectionParser, Assets.detections);
;
 //# sourceMappingURL=Assets.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/CacheParser.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//# sourceMappingURL=CacheParser.mjs.map
__turbopack_context__.s([]);
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/parsers/cacheTextureArray.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cacheTextureArray",
    ()=>cacheTextureArray
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/Texture.mjs [app-client] (ecmascript)");
;
const cacheTextureArray = {
    extension: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].CacheParser,
    test: (asset)=>Array.isArray(asset) && asset.every((t)=>t instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Texture"]),
    getCacheableAssets: (keys, asset)=>{
        const out = {};
        return keys.forEach((key)=>{
            asset.forEach((item, i)=>{
                out[key + (i === 0 ? "" : i + 1)] = item;
            });
        }), out;
    }
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(cacheTextureArray);
;
 //# sourceMappingURL=cacheTextureArray.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/parsers/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$parsers$2f$cacheTextureArray$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/parsers/cacheTextureArray.mjs [app-client] (ecmascript)");
;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/Cache.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$CacheParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/CacheParser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$parsers$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/parsers/index.mjs [app-client] (ecmascript) <locals>");
;
;
;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/utils/testImageFormat.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "testImageFormat",
    ()=>testImageFormat
]);
async function testImageFormat(imageData) {
    if ("Image" in globalThis) return new Promise((resolve)=>{
        const image = new Image();
        image.onload = ()=>{
            resolve(!0);
        }, image.onerror = ()=>{
            resolve(!1);
        }, image.src = imageData;
    });
    if ("createImageBitmap" in globalThis && "fetch" in globalThis) {
        try {
            const blob = await (await fetch(imageData)).blob();
            await createImageBitmap(blob);
        } catch  {
            return !1;
        }
        return !0;
    }
    return !1;
}
;
 //# sourceMappingURL=testImageFormat.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectAvif.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectAvif",
    ()=>detectAvif
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$utils$2f$testImageFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/utils/testImageFormat.mjs [app-client] (ecmascript)");
;
;
const detectAvif = {
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].DetectionParser,
        priority: 1
    },
    test: async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$utils$2f$testImageFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["testImageFormat"])(// eslint-disable-next-line max-len
        "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A="),
    add: async (formats)=>[
            ...formats,
            "avif"
        ],
    remove: async (formats)=>formats.filter((f)=>f !== "avif")
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(detectAvif);
;
 //# sourceMappingURL=detectAvif.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectWebp.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectWebp",
    ()=>detectWebp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$utils$2f$testImageFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/utils/testImageFormat.mjs [app-client] (ecmascript)");
;
;
const detectWebp = {
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].DetectionParser,
        priority: 0
    },
    test: async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$utils$2f$testImageFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["testImageFormat"])("data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="),
    add: async (formats)=>[
            ...formats,
            "webp"
        ],
    remove: async (formats)=>formats.filter((f)=>f !== "webp")
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(detectWebp);
;
 //# sourceMappingURL=detectWebp.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectDefaults.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectDefaults",
    ()=>detectDefaults
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
;
const imageFormats = [
    "png",
    "jpg",
    "jpeg"
], detectDefaults = {
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].DetectionParser,
        priority: -1
    },
    test: ()=>Promise.resolve(!0),
    add: async (formats)=>[
            ...formats,
            ...imageFormats
        ],
    remove: async (formats)=>formats.filter((f)=>!imageFormats.includes(f))
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(detectDefaults);
;
 //# sourceMappingURL=detectDefaults.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/utils/testVideoFormat.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "testVideoFormat",
    ()=>testVideoFormat
]);
const inWorker = "WorkerGlobalScope" in globalThis && globalThis instanceof globalThis.WorkerGlobalScope;
function testVideoFormat(mimeType) {
    return inWorker ? !1 : document.createElement("video").canPlayType(mimeType) !== "";
}
;
 //# sourceMappingURL=testVideoFormat.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectWebm.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectWebm",
    ()=>detectWebm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$utils$2f$testVideoFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/utils/testVideoFormat.mjs [app-client] (ecmascript)");
;
;
const detectWebm = {
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].DetectionParser,
        priority: 0
    },
    test: async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$utils$2f$testVideoFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["testVideoFormat"])("video/webm"),
    add: async (formats)=>[
            ...formats,
            "webm"
        ],
    remove: async (formats)=>formats.filter((f)=>f !== "webm")
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(detectWebm);
;
 //# sourceMappingURL=detectWebm.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectMp4.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectMp4",
    ()=>detectMp4
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$utils$2f$testVideoFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/utils/testVideoFormat.mjs [app-client] (ecmascript)");
;
;
const detectMp4 = {
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].DetectionParser,
        priority: 0
    },
    test: async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$utils$2f$testVideoFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["testVideoFormat"])("video/mp4"),
    add: async (formats)=>[
            ...formats,
            "mp4",
            "m4v"
        ],
    remove: async (formats)=>formats.filter((f)=>f !== "mp4" && f !== "m4v")
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(detectMp4);
;
 //# sourceMappingURL=detectMp4.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectOgv.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectOgv",
    ()=>detectOgv
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$utils$2f$testVideoFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/utils/testVideoFormat.mjs [app-client] (ecmascript)");
;
;
const detectOgv = {
    extension: {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].DetectionParser,
        priority: 0
    },
    test: async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$utils$2f$testVideoFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["testVideoFormat"])("video/ogg"),
    add: async (formats)=>[
            ...formats,
            "ogv"
        ],
    remove: async (formats)=>formats.filter((f)=>f !== "ogv")
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(detectOgv);
;
 //# sourceMappingURL=detectOgv.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectAvif$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectAvif.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectWebp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectWebp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectDefaults$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectDefaults.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectWebm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectWebm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectMp4$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectMp4.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectOgv$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectOgv.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/index.mjs [app-client] (ecmascript) <locals>"); //# sourceMappingURL=index.mjs.map
;
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/index.mjs [app-client] (ecmascript) <locals>"); //# sourceMappingURL=index.mjs.map
;
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/parsers/resolveTextureUrl.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveTextureUrl",
    ()=>resolveTextureUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <export * as utils>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadTextures.mjs [app-client] (ecmascript)");
;
;
;
const resolveTextureUrl = {
    extension: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].ResolveParser,
    test: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadTextures"].test,
    parse: (value)=>({
            resolution: parseFloat(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].RETINA_PREFIX.exec(value)?.[1] ?? "1"),
            format: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__utils$3e$__["utils"].path.extname(value).slice(1),
            src: value
        })
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(resolveTextureUrl);
;
 //# sourceMappingURL=resolveTextureUrl.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/parsers/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$resolver$2f$parsers$2f$resolveTextureUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/parsers/resolveTextureUrl.mjs [app-client] (ecmascript)");
;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/types.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//# sourceMappingURL=types.mjs.map
__turbopack_context__.s([]);
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$resolver$2f$parsers$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/parsers/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$resolver$2f$types$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/types.mjs [app-client] (ecmascript)"); //# sourceMappingURL=index.mjs.map
;
;
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/types.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//# sourceMappingURL=types.mjs.map
__turbopack_context__.s([]);
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$AssetExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/AssetExtension.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$Assets$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/Assets.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$resolver$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$types$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/types.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/Cache.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$parsers$2f$cacheTextureArray$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/parsers/cacheTextureArray.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectAvif$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectAvif.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectWebp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectWebp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectDefaults$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectDefaults.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectWebm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectWebm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectMp4$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectMp4.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectOgv$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectOgv.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/LoaderParser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadJson$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadJson.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadTxt$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadTxt.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadWebFont$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadWebFont.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadSVG$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadSVG.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadTextures.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadVideo$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadVideo.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$createTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/utils/createTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$resolver$2f$parsers$2f$resolveTextureUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/parsers/resolveTextureUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkDataUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkExtension.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/convertToList.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$copySearchParams$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/copySearchParams.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$createStringVariations$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/createStringVariations.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/isSingleItem.mjs [app-client] (ecmascript)");
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
;
;
;
;
;
;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/assets/lib/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Assets",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$Assets$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Assets"],
    "AssetsClass",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$Assets$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AssetsClass"],
    "Cache",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cache"],
    "LoaderParserPriority",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoaderParserPriority"],
    "cacheTextureArray",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$parsers$2f$cacheTextureArray$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cacheTextureArray"],
    "checkDataUrl",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkDataUrl"],
    "checkExtension",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkExtension"],
    "convertToList",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToList"],
    "copySearchParams",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$copySearchParams$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copySearchParams"],
    "createStringVariations",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$createStringVariations$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createStringVariations"],
    "createTexture",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$createTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTexture"],
    "detectAvif",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectAvif$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectAvif"],
    "detectDefaults",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectDefaults$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectDefaults"],
    "detectMp4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectMp4$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectMp4"],
    "detectOgv",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectOgv$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectOgv"],
    "detectWebm",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectWebm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectWebm"],
    "detectWebp",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectWebp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectWebp"],
    "getFontFamilyName",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadWebFont$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFontFamilyName"],
    "isSingleItem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSingleItem"],
    "loadImageBitmap",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadImageBitmap"],
    "loadJson",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadJson$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadJson"],
    "loadSVG",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadSVG$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadSVG"],
    "loadTextures",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadTextures"],
    "loadTxt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadTxt$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadTxt"],
    "loadVideo",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadVideo$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadVideo"],
    "loadWebFont",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadWebFont$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadWebFont"],
    "resolveTextureUrl",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$resolver$2f$parsers$2f$resolveTextureUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveTextureUrl"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$Assets$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/Assets.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$Cache$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/Cache.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$cache$2f$parsers$2f$cacheTextureArray$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/cache/parsers/cacheTextureArray.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectAvif$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectAvif.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectWebp$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectWebp.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectDefaults$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectDefaults.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectWebm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectWebm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectMp4$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectMp4.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$detections$2f$parsers$2f$detectOgv$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/detections/parsers/detectOgv.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$LoaderParser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/LoaderParser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadJson$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadJson.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadTxt$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadTxt.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$loadWebFont$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/loadWebFont.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadSVG$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadSVG.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadTextures.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$loadVideo$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/loadVideo.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$loader$2f$parsers$2f$textures$2f$utils$2f$createTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/loader/parsers/textures/utils/createTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$resolver$2f$parsers$2f$resolveTextureUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/resolver/parsers/resolveTextureUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkDataUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkDataUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$checkExtension$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/checkExtension.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$convertToList$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/convertToList.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$copySearchParams$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/copySearchParams.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$createStringVariations$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/createStringVariations.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$assets$2f$lib$2f$utils$2f$isSingleItem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/assets/lib/utils/isSingleItem.mjs [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=e14d1_%40pixi_assets_lib_0d92cd3c._.js.map