(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/ViewableBuffer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ViewableBuffer",
    ()=>ViewableBuffer
]);
class ViewableBuffer {
    constructor(sizeOrBuffer){
        typeof sizeOrBuffer == "number" ? this.rawBinaryData = new ArrayBuffer(sizeOrBuffer) : sizeOrBuffer instanceof Uint8Array ? this.rawBinaryData = sizeOrBuffer.buffer : this.rawBinaryData = sizeOrBuffer, this.uint32View = new Uint32Array(this.rawBinaryData), this.float32View = new Float32Array(this.rawBinaryData);
    }
    /** View on the raw binary data as a `Int8Array`. */ get int8View() {
        return this._int8View || (this._int8View = new Int8Array(this.rawBinaryData)), this._int8View;
    }
    /** View on the raw binary data as a `Uint8Array`. */ get uint8View() {
        return this._uint8View || (this._uint8View = new Uint8Array(this.rawBinaryData)), this._uint8View;
    }
    /**  View on the raw binary data as a `Int16Array`. */ get int16View() {
        return this._int16View || (this._int16View = new Int16Array(this.rawBinaryData)), this._int16View;
    }
    /** View on the raw binary data as a `Uint16Array`. */ get uint16View() {
        return this._uint16View || (this._uint16View = new Uint16Array(this.rawBinaryData)), this._uint16View;
    }
    /** View on the raw binary data as a `Int32Array`. */ get int32View() {
        return this._int32View || (this._int32View = new Int32Array(this.rawBinaryData)), this._int32View;
    }
    /**
   * Returns the view of the given type.
   * @param type - One of `int8`, `uint8`, `int16`,
   *    `uint16`, `int32`, `uint32`, and `float32`.
   * @returns - typed array of given type
   */ view(type) {
        return this[`${type}View`];
    }
    /** Destroys all buffer references. Do not use after calling this. */ destroy() {
        this.rawBinaryData = null, this._int8View = null, this._uint8View = null, this._int16View = null, this._uint16View = null, this._int32View = null, this.uint32View = null, this.float32View = null;
    }
    static sizeOf(type) {
        switch(type){
            case "int8":
            case "uint8":
                return 1;
            case "int16":
            case "uint16":
                return 2;
            case "int32":
            case "uint32":
            case "float32":
                return 4;
            default:
                throw new Error(`${type} isn't a valid view type`);
        }
    }
}
;
 //# sourceMappingURL=ViewableBuffer.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/checkMaxIfStatementsInShader.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkMaxIfStatementsInShader",
    ()=>checkMaxIfStatementsInShader
]);
const fragTemplate = [
    "precision mediump float;",
    "void main(void){",
    "float test = 0.1;",
    "%forloop%",
    "gl_FragColor = vec4(0.0);",
    "}"
].join(`
`);
function generateIfTestSrc(maxIfs) {
    let src = "";
    for(let i = 0; i < maxIfs; ++i)i > 0 && (src += `
else `), i < maxIfs - 1 && (src += `if(test == ${i}.0){}`);
    return src;
}
function checkMaxIfStatementsInShader(maxIfs, gl) {
    if (maxIfs === 0) throw new Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");
    const shader = gl.createShader(gl.FRAGMENT_SHADER);
    for(;;){
        const fragmentSrc = fragTemplate.replace(/%forloop%/gi, generateIfTestSrc(maxIfs));
        if (gl.shaderSource(shader, fragmentSrc), gl.compileShader(shader), !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) maxIfs = maxIfs / 2 | 0;
        else break;
    }
    return maxIfs;
}
;
 //# sourceMappingURL=checkMaxIfStatementsInShader.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/State.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "State",
    ()=>State
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
;
const BLEND = 0, OFFSET = 1, CULLING = 2, DEPTH_TEST = 3, WINDING = 4, DEPTH_MASK = 5;
class State {
    constructor(){
        this.data = 0, this.blendMode = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].NORMAL, this.polygonOffset = 0, this.blend = !0, this.depthMask = !0;
    }
    /**
   * Activates blending of the computed fragment color values.
   * @default true
   */ get blend() {
        return !!(this.data & 1 << BLEND);
    }
    set blend(value) {
        !!(this.data & 1 << BLEND) !== value && (this.data ^= 1 << BLEND);
    }
    /**
   * Activates adding an offset to depth values of polygon's fragments
   * @default false
   */ get offsets() {
        return !!(this.data & 1 << OFFSET);
    }
    set offsets(value) {
        !!(this.data & 1 << OFFSET) !== value && (this.data ^= 1 << OFFSET);
    }
    /**
   * Activates culling of polygons.
   * @default false
   */ get culling() {
        return !!(this.data & 1 << CULLING);
    }
    set culling(value) {
        !!(this.data & 1 << CULLING) !== value && (this.data ^= 1 << CULLING);
    }
    /**
   * Activates depth comparisons and updates to the depth buffer.
   * @default false
   */ get depthTest() {
        return !!(this.data & 1 << DEPTH_TEST);
    }
    set depthTest(value) {
        !!(this.data & 1 << DEPTH_TEST) !== value && (this.data ^= 1 << DEPTH_TEST);
    }
    /**
   * Enables or disables writing to the depth buffer.
   * @default true
   */ get depthMask() {
        return !!(this.data & 1 << DEPTH_MASK);
    }
    set depthMask(value) {
        !!(this.data & 1 << DEPTH_MASK) !== value && (this.data ^= 1 << DEPTH_MASK);
    }
    /**
   * Specifies whether or not front or back-facing polygons can be culled.
   * @default false
   */ get clockwiseFrontFace() {
        return !!(this.data & 1 << WINDING);
    }
    set clockwiseFrontFace(value) {
        !!(this.data & 1 << WINDING) !== value && (this.data ^= 1 << WINDING);
    }
    /**
   * The blend mode to be applied when this state is set. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
   * Setting this mode to anything other than NO_BLEND will automatically switch blending on.
   * @default PIXI.BLEND_MODES.NORMAL
   */ get blendMode() {
        return this._blendMode;
    }
    set blendMode(value) {
        this.blend = value !== __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].NONE, this._blendMode = value;
    }
    /**
   * The polygon offset. Setting this property to anything other than 0 will automatically enable polygon offset fill.
   * @default 0
   */ get polygonOffset() {
        return this._polygonOffset;
    }
    set polygonOffset(value) {
        this.offsets = !!value, this._polygonOffset = value;
    }
    static for2d() {
        const state = new State();
        return state.depthTest = !1, state.blend = !0, state;
    }
}
State.prototype.toString = function() {
    return `[@pixi/core:State blendMode=${this.blendMode} clockwiseFrontFace=${this.clockwiseFrontFace} culling=${this.culling} depthMask=${this.depthMask} polygonOffset=${this.polygonOffset}]`;
};
;
 //# sourceMappingURL=State.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/autoDetectResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INSTALLED",
    ()=>INSTALLED,
    "autoDetectResource",
    ()=>autoDetectResource
]);
const INSTALLED = [];
function autoDetectResource(source, options) {
    if (!source) return null;
    let extension = "";
    if (typeof source == "string") {
        const result = /\.(\w{3,4})(?:$|\?|#)/i.exec(source);
        result && (extension = result[1].toLowerCase());
    }
    for(let i = INSTALLED.length - 1; i >= 0; --i){
        const ResourcePlugin = INSTALLED[i];
        if (ResourcePlugin.test && ResourcePlugin.test(source, extension)) return new ResourcePlugin(source, options);
    }
    throw new Error("Unrecognized source type to auto-detect Resource");
}
;
 //# sourceMappingURL=autoDetectResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/Resource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Resource",
    ()=>Resource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/Runner.mjs [app-client] (ecmascript)");
;
class Resource {
    /**
   * @param width - Width of the resource
   * @param height - Height of the resource
   */ constructor(width = 0, height = 0){
        this._width = width, this._height = height, this.destroyed = !1, this.internal = !1, this.onResize = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Runner"]("setRealSize"), this.onUpdate = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Runner"]("update"), this.onError = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Runner"]("onError");
    }
    /**
   * Bind to a parent BaseTexture
   * @param baseTexture - Parent texture
   */ bind(baseTexture) {
        this.onResize.add(baseTexture), this.onUpdate.add(baseTexture), this.onError.add(baseTexture), (this._width || this._height) && this.onResize.emit(this._width, this._height);
    }
    /**
   * Unbind to a parent BaseTexture
   * @param baseTexture - Parent texture
   */ unbind(baseTexture) {
        this.onResize.remove(baseTexture), this.onUpdate.remove(baseTexture), this.onError.remove(baseTexture);
    }
    /**
   * Trigger a resize event
   * @param width - X dimension
   * @param height - Y dimension
   */ resize(width, height) {
        (width !== this._width || height !== this._height) && (this._width = width, this._height = height, this.onResize.emit(width, height));
    }
    /**
   * Has been validated
   * @readonly
   */ get valid() {
        return !!this._width && !!this._height;
    }
    /** Has been updated trigger event. */ update() {
        this.destroyed || this.onUpdate.emit();
    }
    /**
   * This can be overridden to start preloading a resource
   * or do any other prepare step.
   * @protected
   * @returns Handle the validate event
   */ load() {
        return Promise.resolve(this);
    }
    /**
   * The width of the resource.
   * @readonly
   */ get width() {
        return this._width;
    }
    /**
   * The height of the resource.
   * @readonly
   */ get height() {
        return this._height;
    }
    /**
   * Set the style, optional to override
   * @param _renderer - yeah, renderer!
   * @param _baseTexture - the texture
   * @param _glTexture - texture instance for this webgl context
   * @returns - `true` is success
   */ style(_renderer, _baseTexture, _glTexture) {
        return !1;
    }
    /** Clean up anything, this happens when destroying is ready. */ dispose() {}
    /**
   * Call when destroying resource, unbind any BaseTexture object
   * before calling this method, as reference counts are maintained
   * internally.
   */ destroy() {
        this.destroyed || (this.destroyed = !0, this.dispose(), this.onError.removeAll(), this.onError = null, this.onResize.removeAll(), this.onResize = null, this.onUpdate.removeAll(), this.onUpdate = null);
    }
    /**
   * Abstract, used to auto-detect resource type.
   * @param {*} _source - The source object
   * @param {string} _extension - The extension of source, if set
   */ static test(_source, _extension) {
        return !1;
    }
}
;
 //# sourceMappingURL=Resource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BufferResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BufferResource",
    ()=>BufferResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/Resource.mjs [app-client] (ecmascript)");
;
;
class BufferResource extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resource"] {
    /**
   * @param source - Source buffer
   * @param options - Options
   * @param {number} options.width - Width of the texture
   * @param {number} options.height - Height of the texture
   * @param {1|2|4|8} [options.unpackAlignment=4] - The alignment of the pixel rows.
   */ constructor(source, options){
        const { width, height } = options || {};
        if (!width || !height) throw new Error("BufferResource width or height invalid");
        super(width, height), this.data = source, this.unpackAlignment = options.unpackAlignment ?? 4;
    }
    /**
   * Upload the texture to the GPU.
   * @param renderer - Upload to the renderer
   * @param baseTexture - Reference to parent texture
   * @param glTexture - glTexture
   * @returns - true is success
   */ upload(renderer, baseTexture, glTexture) {
        const gl = renderer.gl;
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, this.unpackAlignment), gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ALPHA_MODES"].UNPACK);
        const width = baseTexture.realWidth, height = baseTexture.realHeight;
        return glTexture.width === width && glTexture.height === height ? gl.texSubImage2D(baseTexture.target, 0, 0, 0, width, height, baseTexture.format, glTexture.type, this.data) : (glTexture.width = width, glTexture.height = height, gl.texImage2D(baseTexture.target, 0, glTexture.internalFormat, width, height, 0, baseTexture.format, glTexture.type, this.data)), !0;
    }
    /** Destroy and don't use after this. */ dispose() {
        this.data = null;
    }
    /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if buffer source
   */ static test(source) {
        return source === null || source instanceof Int8Array || source instanceof Uint8Array || source instanceof Uint8ClampedArray || source instanceof Int16Array || source instanceof Uint16Array || source instanceof Int32Array || source instanceof Uint32Array || source instanceof Float32Array;
    }
}
;
 //# sourceMappingURL=BufferResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseTexture",
    ()=>BaseTexture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$eventemitter3$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EventEmitter$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/eventemitter3/index.js [app-client] (ecmascript) <export default as EventEmitter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$uid$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/data/uid.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/data/pow2.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/media/caches.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$autoDetectResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/autoDetectResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BufferResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BufferResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/Resource.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
const defaultBufferOptions = {
    scaleMode: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE_MODES"].NEAREST,
    alphaMode: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ALPHA_MODES"].NPM
}, _BaseTexture = class _BaseTexture2 extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$eventemitter3$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EventEmitter$3e$__["EventEmitter"] {
    /**
   * @param {PIXI.Resource|PIXI.ImageSource|string} [resource=null] -
   *        The current resource to use, for things that aren't Resource objects, will be converted
   *        into a Resource.
   * @param options - Collection of options, default options inherited from {@link PIXI.BaseTexture.defaultOptions}.
   * @param {PIXI.MIPMAP_MODES} [options.mipmap] - If mipmapping is enabled for texture
   * @param {number} [options.anisotropicLevel] - Anisotropic filtering level of texture
   * @param {PIXI.WRAP_MODES} [options.wrapMode] - Wrap mode for textures
   * @param {PIXI.SCALE_MODES} [options.scaleMode] - Default scale mode, linear, nearest
   * @param {PIXI.FORMATS} [options.format] - GL format type
   * @param {PIXI.TYPES} [options.type] - GL data type
   * @param {PIXI.TARGETS} [options.target] - GL texture target
   * @param {PIXI.ALPHA_MODES} [options.alphaMode] - Pre multiply the image alpha
   * @param {number} [options.width=0] - Width of the texture
   * @param {number} [options.height=0] - Height of the texture
   * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - Resolution of the base texture
   * @param {object} [options.resourceOptions] - Optional resource options,
   *        see {@link PIXI.autoDetectResource autoDetectResource}
   */ constructor(resource = null, options = null){
        super(), options = Object.assign({}, _BaseTexture2.defaultOptions, options);
        const { alphaMode, mipmap, anisotropicLevel, scaleMode, width, height, wrapMode, format, type, target, resolution, resourceOptions } = options;
        resource && !(resource instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resource"]) && (resource = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$autoDetectResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["autoDetectResource"])(resource, resourceOptions), resource.internal = !0), this.resolution = resolution || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].RESOLUTION, this.width = Math.round((width || 0) * this.resolution) / this.resolution, this.height = Math.round((height || 0) * this.resolution) / this.resolution, this._mipmap = mipmap, this.anisotropicLevel = anisotropicLevel, this._wrapMode = wrapMode, this._scaleMode = scaleMode, this.format = format, this.type = type, this.target = target, this.alphaMode = alphaMode, this.uid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$uid$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uid"])(), this.touched = 0, this.isPowerOfTwo = !1, this._refreshPOT(), this._glTextures = {}, this.dirtyId = 0, this.dirtyStyleId = 0, this.cacheId = null, this.valid = width > 0 && height > 0, this.textureCacheIds = [], this.destroyed = !1, this.resource = null, this._batchEnabled = 0, this._batchLocation = 0, this.parentTextureArray = null, this.setResource(resource);
    }
    /**
   * Pixel width of the source of this texture
   * @readonly
   */ get realWidth() {
        return Math.round(this.width * this.resolution);
    }
    /**
   * Pixel height of the source of this texture
   * @readonly
   */ get realHeight() {
        return Math.round(this.height * this.resolution);
    }
    /**
   * Mipmap mode of the texture, affects downscaled images
   * @default PIXI.MIPMAP_MODES.POW2
   */ get mipmap() {
        return this._mipmap;
    }
    set mipmap(value) {
        this._mipmap !== value && (this._mipmap = value, this.dirtyStyleId++);
    }
    /**
   * The scale mode to apply when scaling this texture
   * @default PIXI.SCALE_MODES.LINEAR
   */ get scaleMode() {
        return this._scaleMode;
    }
    set scaleMode(value) {
        this._scaleMode !== value && (this._scaleMode = value, this.dirtyStyleId++);
    }
    /**
   * How the texture wraps
   * @default PIXI.WRAP_MODES.CLAMP
   */ get wrapMode() {
        return this._wrapMode;
    }
    set wrapMode(value) {
        this._wrapMode !== value && (this._wrapMode = value, this.dirtyStyleId++);
    }
    /**
   * Changes style options of BaseTexture
   * @param scaleMode - Pixi scalemode
   * @param mipmap - enable mipmaps
   * @returns - this
   */ setStyle(scaleMode, mipmap) {
        let dirty;
        return scaleMode !== void 0 && scaleMode !== this.scaleMode && (this.scaleMode = scaleMode, dirty = !0), mipmap !== void 0 && mipmap !== this.mipmap && (this.mipmap = mipmap, dirty = !0), dirty && this.dirtyStyleId++, this;
    }
    /**
   * Changes w/h/resolution. Texture becomes valid if width and height are greater than zero.
   * @param desiredWidth - Desired visual width
   * @param desiredHeight - Desired visual height
   * @param resolution - Optionally set resolution
   * @returns - this
   */ setSize(desiredWidth, desiredHeight, resolution) {
        return resolution = resolution || this.resolution, this.setRealSize(desiredWidth * resolution, desiredHeight * resolution, resolution);
    }
    /**
   * Sets real size of baseTexture, preserves current resolution.
   * @param realWidth - Full rendered width
   * @param realHeight - Full rendered height
   * @param resolution - Optionally set resolution
   * @returns - this
   */ setRealSize(realWidth, realHeight, resolution) {
        return this.resolution = resolution || this.resolution, this.width = Math.round(realWidth) / this.resolution, this.height = Math.round(realHeight) / this.resolution, this._refreshPOT(), this.update(), this;
    }
    /**
   * Refresh check for isPowerOfTwo texture based on size
   * @private
   */ _refreshPOT() {
        this.isPowerOfTwo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPow2"])(this.realWidth) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPow2"])(this.realHeight);
    }
    /**
   * Changes resolution
   * @param resolution - res
   * @returns - this
   */ setResolution(resolution) {
        const oldResolution = this.resolution;
        return oldResolution === resolution ? this : (this.resolution = resolution, this.valid && (this.width = Math.round(this.width * oldResolution) / resolution, this.height = Math.round(this.height * oldResolution) / resolution, this.emit("update", this)), this._refreshPOT(), this);
    }
    /**
   * Sets the resource if it wasn't set. Throws error if resource already present
   * @param resource - that is managing this BaseTexture
   * @returns - this
   */ setResource(resource) {
        if (this.resource === resource) return this;
        if (this.resource) throw new Error("Resource can be set only once");
        return resource.bind(this), this.resource = resource, this;
    }
    /** Invalidates the object. Texture becomes valid if width and height are greater than zero. */ update() {
        this.valid ? (this.dirtyId++, this.dirtyStyleId++, this.emit("update", this)) : this.width > 0 && this.height > 0 && (this.valid = !0, this.emit("loaded", this), this.emit("update", this));
    }
    /**
   * Handle errors with resources.
   * @private
   * @param event - Error event emitted.
   */ onError(event) {
        this.emit("error", this, event);
    }
    /**
   * Destroys this base texture.
   * The method stops if resource doesn't want this texture to be destroyed.
   * Removes texture from all caches.
   * @fires PIXI.BaseTexture#destroyed
   */ destroy() {
        this.resource && (this.resource.unbind(this), this.resource.internal && this.resource.destroy(), this.resource = null), this.cacheId && (delete __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTextureCache"][this.cacheId], delete __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureCache"][this.cacheId], this.cacheId = null), this.valid = !1, this.dispose(), _BaseTexture2.removeFromCache(this), this.textureCacheIds = null, this.destroyed = !0, this.emit("destroyed", this), this.removeAllListeners();
    }
    /**
   * Frees the texture from WebGL memory without destroying this texture object.
   * This means you can still use the texture later which will upload it to GPU
   * memory again.
   * @fires PIXI.BaseTexture#dispose
   */ dispose() {
        this.emit("dispose", this);
    }
    /** Utility function for BaseTexture|Texture cast. */ castToBaseTexture() {
        return this;
    }
    /**
   * Helper function that creates a base texture based on the source you provide.
   * The source can be - image url, image element, canvas element. If the
   * source is an image url or an image element and not in the base texture
   * cache, it will be created and loaded.
   * @static
   * @param {PIXI.ImageSource|string|string[]} source - The
   *        source to create base texture from.
   * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
   * @param {string} [options.pixiIdPrefix=pixiid] - If a source has no id, this is the prefix of the generated id
   * @param {boolean} [strict] - Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
   * @returns {PIXI.BaseTexture} The new base texture.
   */ static from(source, options, strict = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].STRICT_TEXTURE_CACHE) {
        const isFrame = typeof source == "string";
        let cacheId = null;
        if (isFrame) cacheId = source;
        else {
            if (!source._pixiId) {
                const prefix = options?.pixiIdPrefix || "pixiid";
                source._pixiId = `${prefix}_${(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$uid$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uid"])()}`;
            }
            cacheId = source._pixiId;
        }
        let baseTexture = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTextureCache"][cacheId];
        if (isFrame && strict && !baseTexture) throw new Error(`The cacheId "${cacheId}" does not exist in BaseTextureCache.`);
        return baseTexture || (baseTexture = new _BaseTexture2(source, options), baseTexture.cacheId = cacheId, _BaseTexture2.addToCache(baseTexture, cacheId)), baseTexture;
    }
    /**
   * Create a new Texture with a BufferResource from a typed array.
   * @param buffer - The optional array to use. If no data is provided, a new Float32Array is created.
   * @param width - Width of the resource
   * @param height - Height of the resource
   * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
   *        Default properties are different from the constructor's defaults.
   * @param {PIXI.FORMATS} [options.format] - The format is not given, the type is inferred from the
   *        type of the buffer: `RGBA` if Float32Array, Int8Array, Uint8Array, or Uint8ClampedArray,
   *        otherwise `RGBA_INTEGER`.
   * @param {PIXI.TYPES} [options.type] - The type is not given, the type is inferred from the
   *        type of the buffer. Maps Float32Array to `FLOAT`, Int32Array to `INT`, Uint32Array to
   *        `UNSIGNED_INT`, Int16Array to `SHORT`, Uint16Array to `UNSIGNED_SHORT`, Int8Array to `BYTE`,
   *        Uint8Array/Uint8ClampedArray to `UNSIGNED_BYTE`.
   * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.NPM]
   * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.SCALE_MODES.NEAREST]
   * @returns - The resulting new BaseTexture
   */ static fromBuffer(buffer, width, height, options) {
        buffer = buffer || new Float32Array(width * height * 4);
        const resource = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BufferResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferResource"](buffer, {
            width,
            height,
            ...options?.resourceOptions
        });
        let format, type;
        return buffer instanceof Float32Array ? (format = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA, type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].FLOAT) : buffer instanceof Int32Array ? (format = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER, type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].INT) : buffer instanceof Uint32Array ? (format = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER, type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_INT) : buffer instanceof Int16Array ? (format = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER, type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].SHORT) : buffer instanceof Uint16Array ? (format = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER, type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_SHORT) : buffer instanceof Int8Array ? (format = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA, type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].BYTE) : (format = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA, type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_BYTE), resource.internal = !0, new _BaseTexture2(resource, Object.assign({}, defaultBufferOptions, {
            type,
            format
        }, options));
    }
    /**
   * Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
   * @param {PIXI.BaseTexture} baseTexture - The BaseTexture to add to the cache.
   * @param {string} id - The id that the BaseTexture will be stored against.
   */ static addToCache(baseTexture, id) {
        id && (baseTexture.textureCacheIds.includes(id) || baseTexture.textureCacheIds.push(id), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTextureCache"][id] && __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTextureCache"][id] !== baseTexture && console.warn(`BaseTexture added to the cache with an id [${id}] that already had an entry`), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTextureCache"][id] = baseTexture);
    }
    /**
   * Remove a BaseTexture from the global BaseTextureCache.
   * @param {string|PIXI.BaseTexture} baseTexture - id of a BaseTexture to be removed, or a BaseTexture instance itself.
   * @returns {PIXI.BaseTexture|null} The BaseTexture that was removed.
   */ static removeFromCache(baseTexture) {
        if (typeof baseTexture == "string") {
            const baseTextureFromCache = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTextureCache"][baseTexture];
            if (baseTextureFromCache) {
                const index = baseTextureFromCache.textureCacheIds.indexOf(baseTexture);
                return index > -1 && baseTextureFromCache.textureCacheIds.splice(index, 1), delete __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTextureCache"][baseTexture], baseTextureFromCache;
            }
        } else if (baseTexture?.textureCacheIds) {
            for(let i = 0; i < baseTexture.textureCacheIds.length; ++i)delete __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTextureCache"][baseTexture.textureCacheIds[i]];
            return baseTexture.textureCacheIds.length = 0, baseTexture;
        }
        return null;
    }
};
_BaseTexture.defaultOptions = {
    /**
   * If mipmapping is enabled for texture.
   * @type {PIXI.MIPMAP_MODES}
   * @default PIXI.MIPMAP_MODES.POW2
   */ mipmap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIPMAP_MODES"].POW2,
    /** Anisotropic filtering level of texture */ anisotropicLevel: 0,
    /**
   * Default scale mode, linear, nearest.
   * @type {PIXI.SCALE_MODES}
   * @default PIXI.SCALE_MODES.LINEAR
   */ scaleMode: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE_MODES"].LINEAR,
    /**
   * Wrap mode for textures.
   * @type {PIXI.WRAP_MODES}
   * @default PIXI.WRAP_MODES.CLAMP
   */ wrapMode: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WRAP_MODES"].CLAMP,
    /**
   * Pre multiply the image alpha
   * @type {PIXI.ALPHA_MODES}
   * @default PIXI.ALPHA_MODES.UNPACK
   */ alphaMode: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ALPHA_MODES"].UNPACK,
    /**
   * GL texture target
   * @type {PIXI.TARGETS}
   * @default PIXI.TARGETS.TEXTURE_2D
   */ target: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TARGETS"].TEXTURE_2D,
    /**
   * GL format type
   * @type {PIXI.FORMATS}
   * @default PIXI.FORMATS.RGBA
   */ format: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA,
    /**
   * GL data type
   * @type {PIXI.TYPES}
   * @default PIXI.TYPES.UNSIGNED_BYTE
   */ type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_BYTE
}, /** Global number of the texture batch, used by multi-texture renderers. */ _BaseTexture._globalBatch = 0;
let BaseTexture = _BaseTexture;
;
 //# sourceMappingURL=BaseTexture.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchDrawCall.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BatchDrawCall",
    ()=>BatchDrawCall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
;
class BatchDrawCall {
    constructor(){
        this.texArray = null, this.blend = 0, this.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DRAW_MODES"].TRIANGLES, this.start = 0, this.size = 0, this.data = null;
    }
}
;
 //# sourceMappingURL=BatchDrawCall.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Buffer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Buffer",
    ()=>Buffer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/Runner.mjs [app-client] (ecmascript)");
;
;
let UID = 0;
class Buffer {
    /**
   * @param {PIXI.IArrayBuffer} data - the data to store in the buffer.
   * @param _static - `true` for static buffer
   * @param index - `true` for index buffer
   */ constructor(data, _static = !0, index = !1){
        this.data = data || new Float32Array(1), this._glBuffers = {}, this._updateID = 0, this.index = index, this.static = _static, this.id = UID++, this.disposeRunner = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Runner"]("disposeBuffer");
    }
    // TODO could explore flagging only a partial upload?
    /**
   * Flags this buffer as requiring an upload to the GPU.
   * @param {PIXI.IArrayBuffer|number[]} [data] - the data to update in the buffer.
   */ update(data) {
        data instanceof Array && (data = new Float32Array(data)), this.data = data || this.data, this._updateID++;
    }
    /** Disposes WebGL resources that are connected to this geometry. */ dispose() {
        this.disposeRunner.emit(this, !1);
    }
    /** Destroys the buffer. */ destroy() {
        this.dispose(), this.data = null;
    }
    /**
   * Flags whether this is an index buffer.
   *
   * Index buffers are of type `ELEMENT_ARRAY_BUFFER`. Note that setting this property to false will make
   * the buffer of type `ARRAY_BUFFER`.
   *
   * For backwards compatibility.
   */ set index(value) {
        this.type = value ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_TYPE"].ELEMENT_ARRAY_BUFFER : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_TYPE"].ARRAY_BUFFER;
    }
    get index() {
        return this.type === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_TYPE"].ELEMENT_ARRAY_BUFFER;
    }
    /**
   * Helper function that creates a buffer based on an array or TypedArray
   * @param {ArrayBufferView | number[]} data - the TypedArray that the buffer will store. If this is a regular Array it will be converted to a Float32Array.
   * @returns - A new Buffer based on the data provided.
   */ static from(data) {
        return data instanceof Array && (data = new Float32Array(data)), new Buffer(data);
    }
}
;
 //# sourceMappingURL=Buffer.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Attribute.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Attribute",
    ()=>Attribute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
;
class Attribute {
    /**
   * @param buffer - the id of the buffer that this attribute will look for
   * @param size - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2.
   * @param normalized - should the data be normalized.
   * @param {PIXI.TYPES} [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
   * @param [stride=0] - How far apart, in bytes, the start of each value is. (used for interleaving data)
   * @param [start=0] - How far into the array to start reading values (used for interleaving data)
   * @param [instance=false] - Whether the geometry is instanced.
   * @param [divisor=1] - Divisor to use when doing instanced rendering
   */ constructor(buffer, size = 0, normalized = !1, type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].FLOAT, stride, start, instance, divisor = 1){
        this.buffer = buffer, this.size = size, this.normalized = normalized, this.type = type, this.stride = stride, this.start = start, this.instance = instance, this.divisor = divisor;
    }
    /** Destroys the Attribute. */ destroy() {
        this.buffer = null;
    }
    /**
   * Helper function that creates an Attribute based on the information provided
   * @param buffer - the id of the buffer that this attribute will look for
   * @param [size=0] - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
   * @param [normalized=false] - should the data be normalized.
   * @param [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
   * @param [stride=0] - How far apart, in bytes, the start of each value is. (used for interleaving data)
   * @returns - A new {@link PIXI.Attribute} based on the information provided
   */ static from(buffer, size, normalized, type, stride) {
        return new Attribute(buffer, size, normalized, type, stride);
    }
}
;
 //# sourceMappingURL=Attribute.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/utils/interleaveTypedArrays.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "interleaveTypedArrays",
    ()=>interleaveTypedArrays
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$getBufferType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/data/getBufferType.mjs [app-client] (ecmascript)");
;
const map = {
    Float32Array,
    Uint32Array,
    Int32Array,
    Uint8Array
};
function interleaveTypedArrays(arrays, sizes) {
    let outSize = 0, stride = 0;
    const views = {};
    for(let i = 0; i < arrays.length; i++)stride += sizes[i], outSize += arrays[i].length;
    const buffer = new ArrayBuffer(outSize * 4);
    let out = null, littleOffset = 0;
    for(let i = 0; i < arrays.length; i++){
        const size = sizes[i], array = arrays[i], type = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$getBufferType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBufferType"])(array);
        views[type] || (views[type] = new map[type](buffer)), out = views[type];
        for(let j = 0; j < array.length; j++){
            const indexStart = (j / size | 0) * stride + littleOffset, index = j % size;
            out[indexStart + index] = array[j];
        }
        littleOffset += size;
    }
    return new Float32Array(buffer);
}
;
 //# sourceMappingURL=interleaveTypedArrays.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Geometry.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Geometry",
    ()=>Geometry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/Runner.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$getBufferType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/data/getBufferType.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Attribute$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Attribute.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Buffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$utils$2f$interleaveTypedArrays$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/utils/interleaveTypedArrays.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
const byteSizeMap = {
    5126: 4,
    5123: 2,
    5121: 1
};
let UID = 0;
const map = {
    Float32Array,
    Uint32Array,
    Int32Array,
    Uint8Array,
    Uint16Array
};
class Geometry {
    /**
   * @param buffers - An array of buffers. optional.
   * @param attributes - Of the geometry, optional structure of the attributes layout
   */ constructor(buffers = [], attributes = {}){
        this.buffers = buffers, this.indexBuffer = null, this.attributes = attributes, this.glVertexArrayObjects = {}, this.id = UID++, this.instanced = !1, this.instanceCount = 1, this.disposeRunner = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Runner"]("disposeGeometry"), this.refCount = 0;
    }
    /**
   *
   * Adds an attribute to the geometry
   * Note: `stride` and `start` should be `undefined` if you dont know them, not 0!
   * @param id - the name of the attribute (matching up to a shader)
   * @param {PIXI.Buffer|number[]} buffer - the buffer that holds the data of the attribute . You can also provide an Array and a buffer will be created from it.
   * @param size - the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
   * @param normalized - should the data be normalized.
   * @param [type=PIXI.TYPES.FLOAT] - what type of number is the attribute. Check {@link PIXI.TYPES} to see the ones available
   * @param [stride=0] - How far apart, in bytes, the start of each value is. (used for interleaving data)
   * @param [start=0] - How far into the array to start reading values (used for interleaving data)
   * @param instance - Instancing flag
   * @returns - Returns self, useful for chaining.
   */ addAttribute(id, buffer, size = 0, normalized = !1, type, stride, start, instance = !1) {
        if (!buffer) throw new Error("You must pass a buffer when creating an attribute");
        buffer instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"] || (buffer instanceof Array && (buffer = new Float32Array(buffer)), buffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"](buffer));
        const ids = id.split("|");
        if (ids.length > 1) {
            for(let i = 0; i < ids.length; i++)this.addAttribute(ids[i], buffer, size, normalized, type);
            return this;
        }
        let bufferIndex = this.buffers.indexOf(buffer);
        return bufferIndex === -1 && (this.buffers.push(buffer), bufferIndex = this.buffers.length - 1), this.attributes[id] = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Attribute$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Attribute"](bufferIndex, size, normalized, type, stride, start, instance), this.instanced = this.instanced || instance, this;
    }
    /**
   * Returns the requested attribute.
   * @param id - The name of the attribute required
   * @returns - The attribute requested.
   */ getAttribute(id) {
        return this.attributes[id];
    }
    /**
   * Returns the requested buffer.
   * @param id - The name of the buffer required.
   * @returns - The buffer requested.
   */ getBuffer(id) {
        return this.buffers[this.getAttribute(id).buffer];
    }
    /**
   *
   * Adds an index buffer to the geometry
   * The index buffer contains integers, three for each triangle in the geometry, which reference the various attribute buffers (position, colour, UV coordinates, other UV coordinates, normal, …). There is only ONE index buffer.
   * @param {PIXI.Buffer|number[]} [buffer] - The buffer that holds the data of the index buffer. You can also provide an Array and a buffer will be created from it.
   * @returns - Returns self, useful for chaining.
   */ addIndex(buffer) {
        return buffer instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"] || (buffer instanceof Array && (buffer = new Uint16Array(buffer)), buffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"](buffer)), buffer.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_TYPE"].ELEMENT_ARRAY_BUFFER, this.indexBuffer = buffer, this.buffers.includes(buffer) || this.buffers.push(buffer), this;
    }
    /**
   * Returns the index buffer
   * @returns - The index buffer.
   */ getIndex() {
        return this.indexBuffer;
    }
    /**
   * This function modifies the structure so that all current attributes become interleaved into a single buffer
   * This can be useful if your model remains static as it offers a little performance boost
   * @returns - Returns self, useful for chaining.
   */ interleave() {
        if (this.buffers.length === 1 || this.buffers.length === 2 && this.indexBuffer) return this;
        const arrays = [], sizes = [], interleavedBuffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"]();
        let i;
        for(i in this.attributes){
            const attribute = this.attributes[i], buffer = this.buffers[attribute.buffer];
            arrays.push(buffer.data), sizes.push(attribute.size * byteSizeMap[attribute.type] / 4), attribute.buffer = 0;
        }
        for(interleavedBuffer.data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$utils$2f$interleaveTypedArrays$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interleaveTypedArrays"])(arrays, sizes), i = 0; i < this.buffers.length; i++)this.buffers[i] !== this.indexBuffer && this.buffers[i].destroy();
        return this.buffers = [
            interleavedBuffer
        ], this.indexBuffer && this.buffers.push(this.indexBuffer), this;
    }
    /** Get the size of the geometries, in vertices. */ getSize() {
        for(const i in this.attributes){
            const attribute = this.attributes[i];
            return this.buffers[attribute.buffer].data.length / (attribute.stride / 4 || attribute.size);
        }
        return 0;
    }
    /** Disposes WebGL resources that are connected to this geometry. */ dispose() {
        this.disposeRunner.emit(this, !1);
    }
    /** Destroys the geometry. */ destroy() {
        this.dispose(), this.buffers = null, this.indexBuffer = null, this.attributes = null;
    }
    /**
   * Returns a clone of the geometry.
   * @returns - A new clone of this geometry.
   */ clone() {
        const geometry = new Geometry();
        for(let i = 0; i < this.buffers.length; i++)geometry.buffers[i] = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"](this.buffers[i].data.slice(0));
        for(const i in this.attributes){
            const attrib = this.attributes[i];
            geometry.attributes[i] = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Attribute$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Attribute"](attrib.buffer, attrib.size, attrib.normalized, attrib.type, attrib.stride, attrib.start, attrib.instance);
        }
        return this.indexBuffer && (geometry.indexBuffer = geometry.buffers[this.buffers.indexOf(this.indexBuffer)], geometry.indexBuffer.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_TYPE"].ELEMENT_ARRAY_BUFFER), geometry;
    }
    /**
   * Merges an array of geometries into a new single one.
   *
   * Geometry attribute styles must match for this operation to work.
   * @param geometries - array of geometries to merge
   * @returns - Shiny new geometry!
   */ static merge(geometries) {
        const geometryOut = new Geometry(), arrays = [], sizes = [], offsets = [];
        let geometry;
        for(let i = 0; i < geometries.length; i++){
            geometry = geometries[i];
            for(let j = 0; j < geometry.buffers.length; j++)sizes[j] = sizes[j] || 0, sizes[j] += geometry.buffers[j].data.length, offsets[j] = 0;
        }
        for(let i = 0; i < geometry.buffers.length; i++)arrays[i] = new map[(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$getBufferType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBufferType"])(geometry.buffers[i].data)](sizes[i]), geometryOut.buffers[i] = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"](arrays[i]);
        for(let i = 0; i < geometries.length; i++){
            geometry = geometries[i];
            for(let j = 0; j < geometry.buffers.length; j++)arrays[j].set(geometry.buffers[j].data, offsets[j]), offsets[j] += geometry.buffers[j].data.length;
        }
        if (geometryOut.attributes = geometry.attributes, geometry.indexBuffer) {
            geometryOut.indexBuffer = geometryOut.buffers[geometry.buffers.indexOf(geometry.indexBuffer)], geometryOut.indexBuffer.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_TYPE"].ELEMENT_ARRAY_BUFFER;
            let offset = 0, stride = 0, offset2 = 0, bufferIndexToCount = 0;
            for(let i = 0; i < geometry.buffers.length; i++)if (geometry.buffers[i] !== geometry.indexBuffer) {
                bufferIndexToCount = i;
                break;
            }
            for(const i in geometry.attributes){
                const attribute = geometry.attributes[i];
                (attribute.buffer | 0) === bufferIndexToCount && (stride += attribute.size * byteSizeMap[attribute.type] / 4);
            }
            for(let i = 0; i < geometries.length; i++){
                const indexBufferData = geometries[i].indexBuffer.data;
                for(let j = 0; j < indexBufferData.length; j++)geometryOut.indexBuffer.data[j + offset2] += offset;
                offset += geometries[i].buffers[bufferIndexToCount].data.length / stride, offset2 += indexBufferData.length;
            }
        }
        return geometryOut;
    }
}
;
 //# sourceMappingURL=Geometry.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchGeometry.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BatchGeometry",
    ()=>BatchGeometry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Buffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Geometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Geometry.mjs [app-client] (ecmascript)");
;
;
;
class BatchGeometry extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Geometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Geometry"] {
    /**
   * @param {boolean} [_static=false] - Optimization flag, where `false`
   *        is updated every frame, `true` doesn't change frame-to-frame.
   */ constructor(_static = !1){
        super(), this._buffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"](null, _static, !1), this._indexBuffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"](null, _static, !0), this.addAttribute("aVertexPosition", this._buffer, 2, !1, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].FLOAT).addAttribute("aTextureCoord", this._buffer, 2, !1, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].FLOAT).addAttribute("aColor", this._buffer, 4, !0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_BYTE).addAttribute("aTextureId", this._buffer, 1, !0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].FLOAT).addIndex(this._indexBuffer);
    }
}
;
 //# sourceMappingURL=BatchGeometry.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/defaultProgram.frag.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>defaultFragment
]);
var defaultFragment = `varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void){
   gl_FragColor *= texture2D(uSampler, vTextureCoord);
}`;
;
 //# sourceMappingURL=defaultProgram.frag.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/defaultProgram.vert.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>defaultVertex
]);
var defaultVertex = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void){
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vTextureCoord = aTextureCoord;
}
`;
;
 //# sourceMappingURL=defaultProgram.vert.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/compileShader.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compileShader",
    ()=>compileShader
]);
function compileShader(gl, type, src) {
    const shader = gl.createShader(type);
    return gl.shaderSource(shader, src), gl.compileShader(shader), shader;
}
;
 //# sourceMappingURL=compileShader.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/defaultValue.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultValue",
    ()=>defaultValue
]);
function booleanArray(size) {
    const array = new Array(size);
    for(let i = 0; i < array.length; i++)array[i] = !1;
    return array;
}
function defaultValue(type, size) {
    switch(type){
        case "float":
            return 0;
        case "vec2":
            return new Float32Array(2 * size);
        case "vec3":
            return new Float32Array(3 * size);
        case "vec4":
            return new Float32Array(4 * size);
        case "int":
        case "uint":
        case "sampler2D":
        case "sampler2DArray":
            return 0;
        case "ivec2":
            return new Int32Array(2 * size);
        case "ivec3":
            return new Int32Array(3 * size);
        case "ivec4":
            return new Int32Array(4 * size);
        case "uvec2":
            return new Uint32Array(2 * size);
        case "uvec3":
            return new Uint32Array(3 * size);
        case "uvec4":
            return new Uint32Array(4 * size);
        case "bool":
            return !1;
        case "bvec2":
            return booleanArray(2 * size);
        case "bvec3":
            return booleanArray(3 * size);
        case "bvec4":
            return booleanArray(4 * size);
        case "mat2":
            return new Float32Array([
                1,
                0,
                0,
                1
            ]);
        case "mat3":
            return new Float32Array([
                1,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                1
            ]);
        case "mat4":
            return new Float32Array([
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1
            ]);
    }
    return null;
}
;
 //# sourceMappingURL=defaultValue.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/uniformParsers.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "uniformParsers",
    ()=>uniformParsers
]);
const uniformParsers = [
    // a float cache layer
    {
        test: (data)=>data.type === "float" && data.size === 1 && !data.isArray,
        code: (name)=>`
            if(uv["${name}"] !== ud["${name}"].value)
            {
                ud["${name}"].value = uv["${name}"]
                gl.uniform1f(ud["${name}"].location, uv["${name}"])
            }
            `
    },
    // handling samplers
    {
        test: (data, uniform)=>// eslint-disable-next-line max-len,no-eq-null,eqeqeq
            (data.type === "sampler2D" || data.type === "samplerCube" || data.type === "sampler2DArray") && data.size === 1 && !data.isArray && (uniform == null || uniform.castToBaseTexture !== void 0),
        code: (name)=>`t = syncData.textureCount++;

            renderer.texture.bind(uv["${name}"], t);

            if(ud["${name}"].value !== t)
            {
                ud["${name}"].value = t;
                gl.uniform1i(ud["${name}"].location, t);
; // eslint-disable-line max-len
            }`
    },
    // uploading pixi matrix object to mat3
    {
        test: (data, uniform)=>data.type === "mat3" && data.size === 1 && !data.isArray && uniform.a !== void 0,
        code: (name)=>// TODO and some smart caching dirty ids here!
            `
            gl.uniformMatrix3fv(ud["${name}"].location, false, uv["${name}"].toArray(true));
            `,
        codeUbo: (name)=>`
                var ${name}_matrix = uv.${name}.toArray(true);

                data[offset] = ${name}_matrix[0];
                data[offset+1] = ${name}_matrix[1];
                data[offset+2] = ${name}_matrix[2];
        
                data[offset + 4] = ${name}_matrix[3];
                data[offset + 5] = ${name}_matrix[4];
                data[offset + 6] = ${name}_matrix[5];
        
                data[offset + 8] = ${name}_matrix[6];
                data[offset + 9] = ${name}_matrix[7];
                data[offset + 10] = ${name}_matrix[8];
            `
    },
    // uploading a pixi point as a vec2 with caching layer
    {
        test: (data, uniform)=>data.type === "vec2" && data.size === 1 && !data.isArray && uniform.x !== void 0,
        code: (name)=>`
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v.x || cv[1] !== v.y)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    gl.uniform2f(ud["${name}"].location, v.x, v.y);
                }`,
        codeUbo: (name)=>`
                v = uv.${name};

                data[offset] = v.x;
                data[offset+1] = v.y;
            `
    },
    // caching layer for a vec2
    {
        test: (data)=>data.type === "vec2" && data.size === 1 && !data.isArray,
        code: (name)=>`
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v[0] || cv[1] !== v[1])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    gl.uniform2f(ud["${name}"].location, v[0], v[1]);
                }
            `
    },
    // upload a pixi rectangle as a vec4 with caching layer
    {
        test: (data, uniform)=>data.type === "vec4" && data.size === 1 && !data.isArray && uniform.width !== void 0,
        code: (name)=>`
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    cv[2] = v.width;
                    cv[3] = v.height;
                    gl.uniform4f(ud["${name}"].location, v.x, v.y, v.width, v.height)
                }`,
        codeUbo: (name)=>`
                    v = uv.${name};

                    data[offset] = v.x;
                    data[offset+1] = v.y;
                    data[offset+2] = v.width;
                    data[offset+3] = v.height;
                `
    },
    // upload a pixi color as vec4 with caching layer
    {
        test: (data, uniform)=>data.type === "vec4" && data.size === 1 && !data.isArray && uniform.red !== void 0,
        code: (name)=>`
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha)
                {
                    cv[0] = v.red;
                    cv[1] = v.green;
                    cv[2] = v.blue;
                    cv[3] = v.alpha;
                    gl.uniform4f(ud["${name}"].location, v.red, v.green, v.blue, v.alpha)
                }`,
        codeUbo: (name)=>`
                    v = uv.${name};

                    data[offset] = v.red;
                    data[offset+1] = v.green;
                    data[offset+2] = v.blue;
                    data[offset+3] = v.alpha;
                `
    },
    // upload a pixi color as a vec3 with caching layer
    {
        test: (data, uniform)=>data.type === "vec3" && data.size === 1 && !data.isArray && uniform.red !== void 0,
        code: (name)=>`
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.a)
                {
                    cv[0] = v.red;
                    cv[1] = v.green;
                    cv[2] = v.blue;
    
                    gl.uniform3f(ud["${name}"].location, v.red, v.green, v.blue)
                }`,
        codeUbo: (name)=>`
                    v = uv.${name};

                    data[offset] = v.red;
                    data[offset+1] = v.green;
                    data[offset+2] = v.blue;
                `
    },
    // a caching layer for vec4 uploading
    {
        test: (data)=>data.type === "vec4" && data.size === 1 && !data.isArray,
        code: (name)=>`
                cv = ud["${name}"].value;
                v = uv["${name}"];

                if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    cv[2] = v[2];
                    cv[3] = v[3];

                    gl.uniform4f(ud["${name}"].location, v[0], v[1], v[2], v[3])
                }`
    }
];
;
 //# sourceMappingURL=uniformParsers.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateUniformsSync.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateUniformsSync",
    ()=>generateUniformsSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/uniformParsers.mjs [app-client] (ecmascript)");
;
const GLSL_TO_SINGLE_SETTERS_CACHED = {
    float: `
    if (cv !== v)
    {
        cu.value = v;
        gl.uniform1f(location, v);
    }`,
    vec2: `
    if (cv[0] !== v[0] || cv[1] !== v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2f(location, v[0], v[1])
    }`,
    vec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3f(location, v[0], v[1], v[2])
    }`,
    vec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4f(location, v[0], v[1], v[2], v[3]);
    }`,
    int: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`,
    ivec2: `
    if (cv[0] !== v[0] || cv[1] !== v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2i(location, v[0], v[1]);
    }`,
    ivec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3i(location, v[0], v[1], v[2]);
    }`,
    ivec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4i(location, v[0], v[1], v[2], v[3]);
    }`,
    uint: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1ui(location, v);
    }`,
    uvec2: `
    if (cv[0] !== v[0] || cv[1] !== v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2ui(location, v[0], v[1]);
    }`,
    uvec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3ui(location, v[0], v[1], v[2]);
    }`,
    uvec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4ui(location, v[0], v[1], v[2], v[3]);
    }`,
    bool: `
    if (cv !== v)
    {
        cu.value = v;
        gl.uniform1i(location, v);
    }`,
    bvec2: `
    if (cv[0] != v[0] || cv[1] != v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2i(location, v[0], v[1]);
    }`,
    bvec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3i(location, v[0], v[1], v[2]);
    }`,
    bvec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4i(location, v[0], v[1], v[2], v[3]);
    }`,
    mat2: "gl.uniformMatrix2fv(location, false, v)",
    mat3: "gl.uniformMatrix3fv(location, false, v)",
    mat4: "gl.uniformMatrix4fv(location, false, v)",
    sampler2D: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`,
    samplerCube: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`,
    sampler2DArray: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`
}, GLSL_TO_ARRAY_SETTERS = {
    float: "gl.uniform1fv(location, v)",
    vec2: "gl.uniform2fv(location, v)",
    vec3: "gl.uniform3fv(location, v)",
    vec4: "gl.uniform4fv(location, v)",
    mat4: "gl.uniformMatrix4fv(location, false, v)",
    mat3: "gl.uniformMatrix3fv(location, false, v)",
    mat2: "gl.uniformMatrix2fv(location, false, v)",
    int: "gl.uniform1iv(location, v)",
    ivec2: "gl.uniform2iv(location, v)",
    ivec3: "gl.uniform3iv(location, v)",
    ivec4: "gl.uniform4iv(location, v)",
    uint: "gl.uniform1uiv(location, v)",
    uvec2: "gl.uniform2uiv(location, v)",
    uvec3: "gl.uniform3uiv(location, v)",
    uvec4: "gl.uniform4uiv(location, v)",
    bool: "gl.uniform1iv(location, v)",
    bvec2: "gl.uniform2iv(location, v)",
    bvec3: "gl.uniform3iv(location, v)",
    bvec4: "gl.uniform4iv(location, v)",
    sampler2D: "gl.uniform1iv(location, v)",
    samplerCube: "gl.uniform1iv(location, v)",
    sampler2DArray: "gl.uniform1iv(location, v)"
};
function generateUniformsSync(group, uniformData) {
    const funcFragments = [
        `
        var v = null;
        var cv = null;
        var cu = null;
        var t = 0;
        var gl = renderer.gl;
    `
    ];
    for(const i in group.uniforms){
        const data = uniformData[i];
        if (!data) {
            group.uniforms[i]?.group === !0 && (group.uniforms[i].ubo ? funcFragments.push(`
                        renderer.shader.syncUniformBufferGroup(uv.${i}, '${i}');
                    `) : funcFragments.push(`
                        renderer.shader.syncUniformGroup(uv.${i}, syncData);
                    `));
            continue;
        }
        const uniform = group.uniforms[i];
        let parsed = !1;
        for(let j = 0; j < __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uniformParsers"].length; j++)if (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uniformParsers"][j].test(data, uniform)) {
            funcFragments.push(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uniformParsers"][j].code(i, uniform)), parsed = !0;
            break;
        }
        if (!parsed) {
            const template = (data.size === 1 && !data.isArray ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS)[data.type].replace("location", `ud["${i}"].location`);
            funcFragments.push(`
            cu = ud["${i}"];
            cv = cu.value;
            v = uv["${i}"];
            ${template};`);
        }
    }
    return new Function("ud", "uv", "renderer", "syncData", funcFragments.join(`
`));
}
;
 //# sourceMappingURL=generateUniformsSync.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getTestContext.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getTestContext",
    ()=>getTestContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
;
;
const unknownContext = {};
let context = unknownContext;
function getTestContext() {
    if (context === unknownContext || context?.isContextLost()) {
        const canvas = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.createCanvas();
        let gl;
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].PREFER_ENV >= __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].WEBGL2 && (gl = canvas.getContext("webgl2", {})), gl || (gl = canvas.getContext("webgl", {}) || canvas.getContext("experimental-webgl", {}), gl ? gl.getExtension("WEBGL_draw_buffers") : gl = null), context = gl;
    }
    return context;
}
;
 //# sourceMappingURL=getTestContext.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getMaxFragmentPrecision.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMaxFragmentPrecision",
    ()=>getMaxFragmentPrecision
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getTestContext$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getTestContext.mjs [app-client] (ecmascript)");
;
;
let maxFragmentPrecision;
function getMaxFragmentPrecision() {
    if (!maxFragmentPrecision) {
        maxFragmentPrecision = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].MEDIUM;
        const gl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getTestContext$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTestContext"])();
        if (gl && gl.getShaderPrecisionFormat) {
            const shaderFragment = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
            shaderFragment && (maxFragmentPrecision = shaderFragment.precision ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].HIGH : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].MEDIUM);
        }
    }
    return maxFragmentPrecision;
}
;
 //# sourceMappingURL=getMaxFragmentPrecision.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/logProgramError.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "logProgramError",
    ()=>logProgramError
]);
function logPrettyShaderError(gl, shader) {
    const shaderSrc = gl.getShaderSource(shader).split(`
`).map((line, index)=>`${index}: ${line}`), shaderLog = gl.getShaderInfoLog(shader), splitShader = shaderLog.split(`
`), dedupe = {}, lineNumbers = splitShader.map((line)=>parseFloat(line.replace(/^ERROR\: 0\:([\d]+)\:.*$/, "$1"))).filter((n)=>n && !dedupe[n] ? (dedupe[n] = !0, !0) : !1), logArgs = [
        ""
    ];
    lineNumbers.forEach((number)=>{
        shaderSrc[number - 1] = `%c${shaderSrc[number - 1]}%c`, logArgs.push("background: #FF0000; color:#FFFFFF; font-size: 10px", "font-size: 10px");
    });
    const fragmentSourceToLog = shaderSrc.join(`
`);
    logArgs[0] = fragmentSourceToLog, console.error(shaderLog), console.groupCollapsed("click to view full shader code"), console.warn(...logArgs), console.groupEnd();
}
function logProgramError(gl, program, vertexShader, fragmentShader) {
    gl.getProgramParameter(program, gl.LINK_STATUS) || (gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) || logPrettyShaderError(gl, vertexShader), gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS) || logPrettyShaderError(gl, fragmentShader), console.error("PixiJS Error: Could not initialize shader."), gl.getProgramInfoLog(program) !== "" && console.warn("PixiJS Warning: gl.getProgramInfoLog()", gl.getProgramInfoLog(program)));
}
;
 //# sourceMappingURL=logProgramError.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/mapSize.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mapSize",
    ()=>mapSize
]);
const GLSL_TO_SIZE = {
    float: 1,
    vec2: 2,
    vec3: 3,
    vec4: 4,
    int: 1,
    ivec2: 2,
    ivec3: 3,
    ivec4: 4,
    uint: 1,
    uvec2: 2,
    uvec3: 3,
    uvec4: 4,
    bool: 1,
    bvec2: 2,
    bvec3: 3,
    bvec4: 4,
    mat2: 4,
    mat3: 9,
    mat4: 16,
    sampler2D: 1
};
function mapSize(type) {
    return GLSL_TO_SIZE[type];
}
;
 //# sourceMappingURL=mapSize.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/mapType.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mapType",
    ()=>mapType
]);
let GL_TABLE = null;
const GL_TO_GLSL_TYPES = {
    FLOAT: "float",
    FLOAT_VEC2: "vec2",
    FLOAT_VEC3: "vec3",
    FLOAT_VEC4: "vec4",
    INT: "int",
    INT_VEC2: "ivec2",
    INT_VEC3: "ivec3",
    INT_VEC4: "ivec4",
    UNSIGNED_INT: "uint",
    UNSIGNED_INT_VEC2: "uvec2",
    UNSIGNED_INT_VEC3: "uvec3",
    UNSIGNED_INT_VEC4: "uvec4",
    BOOL: "bool",
    BOOL_VEC2: "bvec2",
    BOOL_VEC3: "bvec3",
    BOOL_VEC4: "bvec4",
    FLOAT_MAT2: "mat2",
    FLOAT_MAT3: "mat3",
    FLOAT_MAT4: "mat4",
    SAMPLER_2D: "sampler2D",
    INT_SAMPLER_2D: "sampler2D",
    UNSIGNED_INT_SAMPLER_2D: "sampler2D",
    SAMPLER_CUBE: "samplerCube",
    INT_SAMPLER_CUBE: "samplerCube",
    UNSIGNED_INT_SAMPLER_CUBE: "samplerCube",
    SAMPLER_2D_ARRAY: "sampler2DArray",
    INT_SAMPLER_2D_ARRAY: "sampler2DArray",
    UNSIGNED_INT_SAMPLER_2D_ARRAY: "sampler2DArray"
};
function mapType(gl, type) {
    if (!GL_TABLE) {
        const typeNames = Object.keys(GL_TO_GLSL_TYPES);
        GL_TABLE = {};
        for(let i = 0; i < typeNames.length; ++i){
            const tn = typeNames[i];
            GL_TABLE[gl[tn]] = GL_TO_GLSL_TYPES[tn];
        }
    }
    return GL_TABLE[type];
}
;
 //# sourceMappingURL=mapType.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/setPrecision.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setPrecision",
    ()=>setPrecision
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
;
function setPrecision(src, requestedPrecision, maxSupportedPrecision) {
    if (src.substring(0, 9) !== "precision") {
        let precision = requestedPrecision;
        return requestedPrecision === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].HIGH && maxSupportedPrecision !== __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].HIGH && (precision = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].MEDIUM), `precision ${precision} float;
${src}`;
    } else if (maxSupportedPrecision !== __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].HIGH && src.substring(0, 15) === "precision highp") return src.replace("precision highp", "precision mediump");
    return src;
}
;
 //# sourceMappingURL=setPrecision.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/unsafeEvalSupported.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "unsafeEvalSupported",
    ()=>unsafeEvalSupported
]);
let unsafeEval;
function unsafeEvalSupported() {
    if (typeof unsafeEval == "boolean") return unsafeEval;
    try {
        unsafeEval = new Function("param1", "param2", "param3", "return param1[param2] === param3;")({
            a: "b"
        }, "a", "b") === !0;
    } catch  {
        unsafeEval = !1;
    }
    return unsafeEval;
}
;
 //# sourceMappingURL=unsafeEvalSupported.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$checkMaxIfStatementsInShader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/checkMaxIfStatementsInShader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$compileShader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/compileShader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$defaultValue$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/defaultValue.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateUniformsSync$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateUniformsSync.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getMaxFragmentPrecision$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getMaxFragmentPrecision.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getTestContext$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getTestContext.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$logProgramError$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/logProgramError.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$mapSize$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/mapSize.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$mapType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/mapType.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$setPrecision$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/setPrecision.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/uniformParsers.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$unsafeEvalSupported$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/unsafeEvalSupported.mjs [app-client] (ecmascript)");
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
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Program.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Program",
    ()=>Program
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/media/caches.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$utils$2f$isMobile$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/utils/isMobile.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$defaultProgram$2e$frag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/defaultProgram.frag.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$defaultProgram$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/defaultProgram.vert.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$setPrecision$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/setPrecision.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getMaxFragmentPrecision$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getMaxFragmentPrecision.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
;
let UID = 0;
const nameCache = {}, _Program = class _Program2 {
    /**
   * @param vertexSrc - The source of the vertex shader.
   * @param fragmentSrc - The source of the fragment shader.
   * @param name - Name for shader
   * @param extra - Extra data for shader
   */ constructor(vertexSrc, fragmentSrc, name = "pixi-shader", extra = {}){
        this.extra = {}, this.id = UID++, this.vertexSrc = vertexSrc || _Program2.defaultVertexSrc, this.fragmentSrc = fragmentSrc || _Program2.defaultFragmentSrc, this.vertexSrc = this.vertexSrc.trim(), this.fragmentSrc = this.fragmentSrc.trim(), this.extra = extra, this.vertexSrc.substring(0, 8) !== "#version" && (name = name.replace(/\s+/g, "-"), nameCache[name] ? (nameCache[name]++, name += `-${nameCache[name]}`) : nameCache[name] = 1, this.vertexSrc = `#define SHADER_NAME ${name}
${this.vertexSrc}`, this.fragmentSrc = `#define SHADER_NAME ${name}
${this.fragmentSrc}`, this.vertexSrc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$setPrecision$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setPrecision"])(this.vertexSrc, _Program2.defaultVertexPrecision, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].HIGH), this.fragmentSrc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$setPrecision$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setPrecision"])(this.fragmentSrc, _Program2.defaultFragmentPrecision, (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getMaxFragmentPrecision$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMaxFragmentPrecision"])())), this.glPrograms = {}, this.syncUniforms = null;
    }
    /**
   * The default vertex shader source.
   * @readonly
   */ static get defaultVertexSrc() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$defaultProgram$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    }
    /**
   * The default fragment shader source.
   * @readonly
   */ static get defaultFragmentSrc() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$defaultProgram$2e$frag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    }
    /**
   * A short hand function to create a program based of a vertex and fragment shader.
   *
   * This method will also check to see if there is a cached program.
   * @param vertexSrc - The source of the vertex shader.
   * @param fragmentSrc - The source of the fragment shader.
   * @param name - Name for shader
   * @returns A shiny new PixiJS shader program!
   */ static from(vertexSrc, fragmentSrc, name) {
        const key = vertexSrc + fragmentSrc;
        let program = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProgramCache"][key];
        return program || (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProgramCache"][key] = program = new _Program2(vertexSrc, fragmentSrc, name)), program;
    }
};
_Program.defaultVertexPrecision = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].HIGH, /**
* Default specify float precision in fragment shader.
* iOS is best set at highp due to https://github.com/pixijs/pixijs/issues/3742
* @static
* @type {PIXI.PRECISION}
* @default PIXI.PRECISION.MEDIUM
*/ _Program.defaultFragmentPrecision = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$utils$2f$isMobile$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMobile"].apple.device ? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].HIGH : __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"].MEDIUM;
let Program = _Program;
;
 //# sourceMappingURL=Program.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/UniformGroup.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UniformGroup",
    ()=>UniformGroup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Buffer.mjs [app-client] (ecmascript)");
;
;
let UID = 0;
class UniformGroup {
    /**
   * @param {object | Buffer} [uniforms] - Custom uniforms to use to augment the built-in ones. Or a pixi buffer.
   * @param isStatic - Uniforms wont be changed after creation.
   * @param isUbo - If true, will treat this uniform group as a uniform buffer object.
   */ constructor(uniforms, isStatic, isUbo){
        this.group = !0, this.syncUniforms = {}, this.dirtyId = 0, this.id = UID++, this.static = !!isStatic, this.ubo = !!isUbo, uniforms instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"] ? (this.buffer = uniforms, this.buffer.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_TYPE"].UNIFORM_BUFFER, this.autoManage = !1, this.ubo = !0) : (this.uniforms = uniforms, this.ubo && (this.buffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"](new Float32Array(1)), this.buffer.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_TYPE"].UNIFORM_BUFFER, this.autoManage = !0));
    }
    update() {
        this.dirtyId++, !this.autoManage && this.buffer && this.buffer.update();
    }
    add(name, uniforms, _static) {
        if (!this.ubo) this.uniforms[name] = new UniformGroup(uniforms, _static);
        else throw new Error("[UniformGroup] uniform groups in ubo mode cannot be modified, or have uniform groups nested in them");
    }
    static from(uniforms, _static, _ubo) {
        return new UniformGroup(uniforms, _static, _ubo);
    }
    /**
   * A short hand function for creating a static UBO UniformGroup.
   * @param uniforms - the ubo item
   * @param _static - should this be updated each time it is used? defaults to true here!
   */ static uboFrom(uniforms, _static) {
        return new UniformGroup(uniforms, _static ?? !0, !0);
    }
}
;
 //# sourceMappingURL=UniformGroup.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Shader.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Shader",
    ()=>Shader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/Runner.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Program.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/UniformGroup.mjs [app-client] (ecmascript)");
;
;
;
class Shader {
    /**
   * @param program - The program the shader will use.
   * @param uniforms - Custom uniforms to use to augment the built-in ones.
   */ constructor(program, uniforms){
        this.uniformBindCount = 0, this.program = program, uniforms ? uniforms instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UniformGroup"] ? this.uniformGroup = uniforms : this.uniformGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UniformGroup"](uniforms) : this.uniformGroup = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UniformGroup"]({}), this.disposeRunner = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Runner"]("disposeShader");
    }
    // TODO move to shader system..
    checkUniformExists(name, group) {
        if (group.uniforms[name]) return !0;
        for(const i in group.uniforms){
            const uniform = group.uniforms[i];
            if (uniform.group === !0 && this.checkUniformExists(name, uniform)) return !0;
        }
        return !1;
    }
    destroy() {
        this.uniformGroup = null, this.disposeRunner.emit(this), this.disposeRunner.destroy();
    }
    /**
   * Shader uniform values, shortcut for `uniformGroup.uniforms`.
   * @readonly
   */ get uniforms() {
        return this.uniformGroup.uniforms;
    }
    /**
   * A short hand function to create a shader based of a vertex and fragment shader.
   * @param vertexSrc - The source of the vertex shader.
   * @param fragmentSrc - The source of the fragment shader.
   * @param uniforms - Custom uniforms to use to augment the built-in ones.
   * @returns A shiny new PixiJS shader!
   */ static from(vertexSrc, fragmentSrc, uniforms) {
        const program = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Program"].from(vertexSrc, fragmentSrc);
        return new Shader(program, uniforms);
    }
}
;
 //# sourceMappingURL=Shader.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchShaderGenerator.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BatchShaderGenerator",
    ()=>BatchShaderGenerator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Matrix.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Program.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Shader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Shader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/UniformGroup.mjs [app-client] (ecmascript)");
;
;
;
;
class BatchShaderGenerator {
    /**
   * @param vertexSrc - Vertex shader
   * @param fragTemplate - Fragment shader template
   */ constructor(vertexSrc, fragTemplate){
        if (this.vertexSrc = vertexSrc, this.fragTemplate = fragTemplate, this.programCache = {}, this.defaultGroupCache = {}, !fragTemplate.includes("%count%")) throw new Error('Fragment template must contain "%count%".');
        if (!fragTemplate.includes("%forloop%")) throw new Error('Fragment template must contain "%forloop%".');
    }
    generateShader(maxTextures) {
        if (!this.programCache[maxTextures]) {
            const sampleValues = new Int32Array(maxTextures);
            for(let i = 0; i < maxTextures; i++)sampleValues[i] = i;
            this.defaultGroupCache[maxTextures] = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UniformGroup"].from({
                uSamplers: sampleValues
            }, !0);
            let fragmentSrc = this.fragTemplate;
            fragmentSrc = fragmentSrc.replace(/%count%/gi, `${maxTextures}`), fragmentSrc = fragmentSrc.replace(/%forloop%/gi, this.generateSampleSrc(maxTextures)), this.programCache[maxTextures] = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Program"](this.vertexSrc, fragmentSrc);
        }
        const uniforms = {
            tint: new Float32Array([
                1,
                1,
                1,
                1
            ]),
            translationMatrix: new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"](),
            default: this.defaultGroupCache[maxTextures]
        };
        return new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Shader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Shader"](this.programCache[maxTextures], uniforms);
    }
    generateSampleSrc(maxTextures) {
        let src = "";
        src += `
`, src += `
`;
        for(let i = 0; i < maxTextures; i++)i > 0 && (src += `
else `), i < maxTextures - 1 && (src += `if(vTextureId < ${i}.5)`), src += `
{`, src += `
	color = texture2D(uSamplers[${i}], vTextureCoord);`, src += `
}`;
        return src += `
`, src += `
`, src;
    }
}
;
 //# sourceMappingURL=BatchShaderGenerator.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchTextureArray.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BatchTextureArray",
    ()=>BatchTextureArray
]);
class BatchTextureArray {
    constructor(){
        this.elements = [], this.ids = [], this.count = 0;
    }
    clear() {
        for(let i = 0; i < this.count; i++)this.elements[i] = null;
        this.count = 0;
    }
}
;
 //# sourceMappingURL=BatchTextureArray.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/canUploadSameBuffer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canUploadSameBuffer",
    ()=>canUploadSameBuffer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$utils$2f$isMobile$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/utils/isMobile.mjs [app-client] (ecmascript)");
;
function canUploadSameBuffer() {
    return !__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$utils$2f$isMobile$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMobile"].apple.device;
}
;
 //# sourceMappingURL=canUploadSameBuffer.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/maxRecommendedTextures.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "maxRecommendedTextures",
    ()=>maxRecommendedTextures
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$utils$2f$isMobile$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/utils/isMobile.mjs [app-client] (ecmascript)");
;
function maxRecommendedTextures(max) {
    let allowMax = !0;
    const navigator = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.getNavigator();
    if (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$utils$2f$isMobile$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMobile"].tablet || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$utils$2f$isMobile$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMobile"].phone) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$utils$2f$isMobile$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMobile"].apple.device) {
            const match = navigator.userAgent.match(/OS (\d+)_(\d+)?/);
            match && parseInt(match[1], 10) < 11 && (allowMax = !1);
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$utils$2f$isMobile$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMobile"].android.device) {
            const match = navigator.userAgent.match(/Android\s([0-9.]*)/);
            match && parseInt(match[1], 10) < 7 && (allowMax = !1);
        }
    }
    return allowMax ? max : 4;
}
;
 //# sourceMappingURL=maxRecommendedTextures.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/ObjectRenderer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ObjectRenderer",
    ()=>ObjectRenderer
]);
class ObjectRenderer {
    /**
   * @param renderer - The renderer this manager works for.
   */ constructor(renderer){
        this.renderer = renderer;
    }
    /** Stub method that should be used to empty the current batch by rendering objects now. */ flush() {}
    /** Generic destruction method that frees all resources. This should be called by subclasses. */ destroy() {
        this.renderer = null;
    }
    /**
   * Stub method that initializes any state required before
   * rendering starts. It is different from the `prerender`
   * signal, which occurs every frame, in that it is called
   * whenever an object requests _this_ renderer specifically.
   */ start() {}
    /** Stops the renderer. It should free up any state and become dormant. */ stop() {
        this.flush();
    }
    /**
   * Keeps the object to render. It doesn't have to be
   * rendered immediately.
   * @param {PIXI.DisplayObject} _object - The object to render.
   */ render(_object) {}
}
;
 //# sourceMappingURL=ObjectRenderer.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/texture.frag.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>defaultFragment
]);
var defaultFragment = `varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;
uniform sampler2D uSamplers[%count%];

void main(void){
    vec4 color;
    %forloop%
    gl_FragColor = color * vColor;
}
`;
;
 //# sourceMappingURL=texture.frag.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/texture.vert.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>defaultVertex
]);
var defaultVertex = `precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute float aTextureId;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;

void main(void){
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vColor = aColor * tint;
}
`;
;
 //# sourceMappingURL=texture.vert.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchRenderer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BatchRenderer",
    ()=>BatchRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/color/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$Color$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/color/lib/Color.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/logging/deprecation.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$color$2f$premultiply$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/color/premultiply.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/data/pow2.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$ViewableBuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/ViewableBuffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$checkMaxIfStatementsInShader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/checkMaxIfStatementsInShader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$State$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/State.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchDrawCall$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchDrawCall.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchGeometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchGeometry.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchShaderGenerator$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchShaderGenerator.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchTextureArray$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchTextureArray.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$canUploadSameBuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/canUploadSameBuffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$maxRecommendedTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/maxRecommendedTextures.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$ObjectRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/ObjectRenderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$texture$2e$frag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/texture.frag.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$texture$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/texture.vert.mjs [app-client] (ecmascript)");
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
const _BatchRenderer = class _BatchRenderer2 extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$ObjectRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ObjectRenderer"] {
    /**
   * This will hook onto the renderer's `contextChange`
   * and `prerender` signals.
   * @param {PIXI.Renderer} renderer - The renderer this works for.
   */ constructor(renderer){
        super(renderer), this.setShaderGenerator(), this.geometryClass = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchGeometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchGeometry"], this.vertexSize = 6, this.state = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$State$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["State"].for2d(), this.size = _BatchRenderer2.defaultBatchSize * 4, this._vertexCount = 0, this._indexCount = 0, this._bufferedElements = [], this._bufferedTextures = [], this._bufferSize = 0, this._shader = null, this._packedGeometries = [], this._packedGeometryPoolSize = 2, this._flushId = 0, this._aBuffers = {}, this._iBuffers = {}, this.maxTextures = 1, this.renderer.on("prerender", this.onPrerender, this), renderer.runners.contextChange.add(this), this._dcIndex = 0, this._aIndex = 0, this._iIndex = 0, this._attributeBuffer = null, this._indexBuffer = null, this._tempBoundTextures = [];
    }
    /**
   * The maximum textures that this device supports.
   * @static
   * @default 32
   */ static get defaultMaxTextures() {
        return this._defaultMaxTextures = this._defaultMaxTextures ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$maxRecommendedTextures$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maxRecommendedTextures"])(32), this._defaultMaxTextures;
    }
    static set defaultMaxTextures(value) {
        this._defaultMaxTextures = value;
    }
    /**
   * Can we upload the same buffer in a single frame?
   * @static
   */ static get canUploadSameBuffer() {
        return this._canUploadSameBuffer = this._canUploadSameBuffer ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$canUploadSameBuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["canUploadSameBuffer"])(), this._canUploadSameBuffer;
    }
    static set canUploadSameBuffer(value) {
        this._canUploadSameBuffer = value;
    }
    /**
   * @see PIXI.BatchRenderer#maxTextures
   * @deprecated since 7.1.0
   * @readonly
   */ get MAX_TEXTURES() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "BatchRenderer#MAX_TEXTURES renamed to BatchRenderer#maxTextures"), this.maxTextures;
    }
    /**
   * The default vertex shader source
   * @readonly
   */ static get defaultVertexSrc() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$texture$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    }
    /**
   * The default fragment shader source
   * @readonly
   */ static get defaultFragmentTemplate() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$texture$2e$frag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    }
    /**
   * Set the shader generator.
   * @param {object} [options]
   * @param {string} [options.vertex=PIXI.BatchRenderer.defaultVertexSrc] - Vertex shader source
   * @param {string} [options.fragment=PIXI.BatchRenderer.defaultFragmentTemplate] - Fragment shader template
   */ setShaderGenerator({ vertex = _BatchRenderer2.defaultVertexSrc, fragment = _BatchRenderer2.defaultFragmentTemplate } = {}) {
        this.shaderGenerator = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchShaderGenerator$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchShaderGenerator"](vertex, fragment);
    }
    /**
   * Handles the `contextChange` signal.
   *
   * It calculates `this.maxTextures` and allocating the packed-geometry object pool.
   */ contextChange() {
        const gl = this.renderer.gl;
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].PREFER_ENV === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].WEBGL_LEGACY ? this.maxTextures = 1 : (this.maxTextures = Math.min(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), _BatchRenderer2.defaultMaxTextures), this.maxTextures = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$checkMaxIfStatementsInShader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkMaxIfStatementsInShader"])(this.maxTextures, gl)), this._shader = this.shaderGenerator.generateShader(this.maxTextures);
        for(let i = 0; i < this._packedGeometryPoolSize; i++)this._packedGeometries[i] = new this.geometryClass();
        this.initFlushBuffers();
    }
    /** Makes sure that static and dynamic flush pooled objects have correct dimensions. */ initFlushBuffers() {
        const { _drawCallPool, _textureArrayPool } = _BatchRenderer2, MAX_SPRITES = this.size / 4, MAX_TA = Math.floor(MAX_SPRITES / this.maxTextures) + 1;
        for(; _drawCallPool.length < MAX_SPRITES;)_drawCallPool.push(new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchDrawCall$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchDrawCall"]());
        for(; _textureArrayPool.length < MAX_TA;)_textureArrayPool.push(new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchTextureArray$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchTextureArray"]());
        for(let i = 0; i < this.maxTextures; i++)this._tempBoundTextures[i] = null;
    }
    /** Handles the `prerender` signal. It ensures that flushes start from the first geometry object again. */ onPrerender() {
        this._flushId = 0;
    }
    /**
   * Buffers the "batchable" object. It need not be rendered immediately.
   * @param {PIXI.DisplayObject} element - the element to render when
   *    using this renderer
   */ render(element) {
        element._texture.valid && (this._vertexCount + element.vertexData.length / 2 > this.size && this.flush(), this._vertexCount += element.vertexData.length / 2, this._indexCount += element.indices.length, this._bufferedTextures[this._bufferSize] = element._texture.baseTexture, this._bufferedElements[this._bufferSize++] = element);
    }
    buildTexturesAndDrawCalls() {
        const { _bufferedTextures: textures, maxTextures } = this, textureArrays = _BatchRenderer2._textureArrayPool, batch = this.renderer.batch, boundTextures = this._tempBoundTextures, touch = this.renderer.textureGC.count;
        let TICK = ++__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"]._globalBatch, countTexArrays = 0, texArray = textureArrays[0], start = 0;
        batch.copyBoundTextures(boundTextures, maxTextures);
        for(let i = 0; i < this._bufferSize; ++i){
            const tex = textures[i];
            textures[i] = null, tex._batchEnabled !== TICK && (texArray.count >= maxTextures && (batch.boundArray(texArray, boundTextures, TICK, maxTextures), this.buildDrawCalls(texArray, start, i), start = i, texArray = textureArrays[++countTexArrays], ++TICK), tex._batchEnabled = TICK, tex.touched = touch, texArray.elements[texArray.count++] = tex);
        }
        texArray.count > 0 && (batch.boundArray(texArray, boundTextures, TICK, maxTextures), this.buildDrawCalls(texArray, start, this._bufferSize), ++countTexArrays, ++TICK);
        for(let i = 0; i < boundTextures.length; i++)boundTextures[i] = null;
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"]._globalBatch = TICK;
    }
    /**
   * Populating drawcalls for rendering
   * @param texArray
   * @param start
   * @param finish
   */ buildDrawCalls(texArray, start, finish) {
        const { _bufferedElements: elements, _attributeBuffer, _indexBuffer, vertexSize } = this, drawCalls = _BatchRenderer2._drawCallPool;
        let dcIndex = this._dcIndex, aIndex = this._aIndex, iIndex = this._iIndex, drawCall = drawCalls[dcIndex];
        drawCall.start = this._iIndex, drawCall.texArray = texArray;
        for(let i = start; i < finish; ++i){
            const sprite = elements[i], tex = sprite._texture.baseTexture, spriteBlendMode = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$color$2f$premultiply$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["premultiplyBlendMode"][tex.alphaMode ? 1 : 0][sprite.blendMode];
            elements[i] = null, start < i && drawCall.blend !== spriteBlendMode && (drawCall.size = iIndex - drawCall.start, start = i, drawCall = drawCalls[++dcIndex], drawCall.texArray = texArray, drawCall.start = iIndex), this.packInterleavedGeometry(sprite, _attributeBuffer, _indexBuffer, aIndex, iIndex), aIndex += sprite.vertexData.length / 2 * vertexSize, iIndex += sprite.indices.length, drawCall.blend = spriteBlendMode;
        }
        start < finish && (drawCall.size = iIndex - drawCall.start, ++dcIndex), this._dcIndex = dcIndex, this._aIndex = aIndex, this._iIndex = iIndex;
    }
    /**
   * Bind textures for current rendering
   * @param texArray
   */ bindAndClearTexArray(texArray) {
        const textureSystem = this.renderer.texture;
        for(let j = 0; j < texArray.count; j++)textureSystem.bind(texArray.elements[j], texArray.ids[j]), texArray.elements[j] = null;
        texArray.count = 0;
    }
    updateGeometry() {
        const { _packedGeometries: packedGeometries, _attributeBuffer: attributeBuffer, _indexBuffer: indexBuffer } = this;
        _BatchRenderer2.canUploadSameBuffer ? (packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData), packedGeometries[this._flushId]._indexBuffer.update(indexBuffer), this.renderer.geometry.updateBuffers()) : (this._packedGeometryPoolSize <= this._flushId && (this._packedGeometryPoolSize++, packedGeometries[this._flushId] = new this.geometryClass()), packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData), packedGeometries[this._flushId]._indexBuffer.update(indexBuffer), this.renderer.geometry.bind(packedGeometries[this._flushId]), this.renderer.geometry.updateBuffers(), this._flushId++);
    }
    drawBatches() {
        const dcCount = this._dcIndex, { gl, state: stateSystem } = this.renderer, drawCalls = _BatchRenderer2._drawCallPool;
        let curTexArray = null;
        for(let i = 0; i < dcCount; i++){
            const { texArray, type, size, start, blend } = drawCalls[i];
            curTexArray !== texArray && (curTexArray = texArray, this.bindAndClearTexArray(texArray)), this.state.blendMode = blend, stateSystem.set(this.state), gl.drawElements(type, size, gl.UNSIGNED_SHORT, start * 2);
        }
    }
    /** Renders the content _now_ and empties the current batch. */ flush() {
        this._vertexCount !== 0 && (this._attributeBuffer = this.getAttributeBuffer(this._vertexCount), this._indexBuffer = this.getIndexBuffer(this._indexCount), this._aIndex = 0, this._iIndex = 0, this._dcIndex = 0, this.buildTexturesAndDrawCalls(), this.updateGeometry(), this.drawBatches(), this._bufferSize = 0, this._vertexCount = 0, this._indexCount = 0);
    }
    /** Starts a new sprite batch. */ start() {
        this.renderer.state.set(this.state), this.renderer.texture.ensureSamplerType(this.maxTextures), this.renderer.shader.bind(this._shader), _BatchRenderer2.canUploadSameBuffer && this.renderer.geometry.bind(this._packedGeometries[this._flushId]);
    }
    /** Stops and flushes the current batch. */ stop() {
        this.flush();
    }
    /** Destroys this `BatchRenderer`. It cannot be used again. */ destroy() {
        for(let i = 0; i < this._packedGeometryPoolSize; i++)this._packedGeometries[i] && this._packedGeometries[i].destroy();
        this.renderer.off("prerender", this.onPrerender, this), this._aBuffers = null, this._iBuffers = null, this._packedGeometries = null, this._attributeBuffer = null, this._indexBuffer = null, this._shader && (this._shader.destroy(), this._shader = null), super.destroy();
    }
    /**
   * Fetches an attribute buffer from `this._aBuffers` that can hold atleast `size` floats.
   * @param size - minimum capacity required
   * @returns - buffer than can hold atleast `size` floats
   */ getAttributeBuffer(size) {
        const roundedP2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextPow2"])(Math.ceil(size / 8)), roundedSizeIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["log2"])(roundedP2), roundedSize = roundedP2 * 8;
        this._aBuffers.length <= roundedSizeIndex && (this._iBuffers.length = roundedSizeIndex + 1);
        let buffer = this._aBuffers[roundedSize];
        return buffer || (this._aBuffers[roundedSize] = buffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$ViewableBuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ViewableBuffer"](roundedSize * this.vertexSize * 4)), buffer;
    }
    /**
   * Fetches an index buffer from `this._iBuffers` that can
   * have at least `size` capacity.
   * @param size - minimum required capacity
   * @returns - buffer that can fit `size` indices.
   */ getIndexBuffer(size) {
        const roundedP2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextPow2"])(Math.ceil(size / 12)), roundedSizeIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["log2"])(roundedP2), roundedSize = roundedP2 * 12;
        this._iBuffers.length <= roundedSizeIndex && (this._iBuffers.length = roundedSizeIndex + 1);
        let buffer = this._iBuffers[roundedSizeIndex];
        return buffer || (this._iBuffers[roundedSizeIndex] = buffer = new Uint16Array(roundedSize)), buffer;
    }
    /**
   * Takes the four batching parameters of `element`, interleaves
   * and pushes them into the batching attribute/index buffers given.
   *
   * It uses these properties: `vertexData` `uvs`, `textureId` and
   * `indicies`. It also uses the "tint" of the base-texture, if
   * present.
   * @param {PIXI.DisplayObject} element - element being rendered
   * @param attributeBuffer - attribute buffer.
   * @param indexBuffer - index buffer
   * @param aIndex - number of floats already in the attribute buffer
   * @param iIndex - number of indices already in `indexBuffer`
   */ packInterleavedGeometry(element, attributeBuffer, indexBuffer, aIndex, iIndex) {
        const { uint32View, float32View } = attributeBuffer, packedVertices = aIndex / this.vertexSize, uvs = element.uvs, indicies = element.indices, vertexData = element.vertexData, textureId = element._texture.baseTexture._batchLocation, alpha = Math.min(element.worldAlpha, 1), argb = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$Color$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"].shared.setValue(element._tintRGB).toPremultiplied(alpha, element._texture.baseTexture.alphaMode > 0);
        for(let i = 0; i < vertexData.length; i += 2)float32View[aIndex++] = vertexData[i], float32View[aIndex++] = vertexData[i + 1], float32View[aIndex++] = uvs[i], float32View[aIndex++] = uvs[i + 1], uint32View[aIndex++] = argb, float32View[aIndex++] = textureId;
        for(let i = 0; i < indicies.length; i++)indexBuffer[iIndex++] = packedVertices + indicies[i];
    }
};
_BatchRenderer.defaultBatchSize = 4096, /** @ignore */ _BatchRenderer.extension = {
    name: "batch",
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererPlugin
}, /**
* Pool of `BatchDrawCall` objects that `flush` used
* to create "batches" of the objects being rendered.
*
* These are never re-allocated again.
* Shared between all batch renderers because it can be only one "flush" working at the moment.
* @member {PIXI.BatchDrawCall[]}
*/ _BatchRenderer._drawCallPool = [], /**
* Pool of `BatchDrawCall` objects that `flush` used
* to create "batches" of the objects being rendered.
*
* These are never re-allocated again.
* Shared between all batch renderers because it can be only one "flush" working at the moment.
* @member {PIXI.BatchTextureArray[]}
*/ _BatchRenderer._textureArrayPool = [];
let BatchRenderer = _BatchRenderer;
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(BatchRenderer);
;
 //# sourceMappingURL=BatchRenderer.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/defaultFilter.frag.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>defaultFragment
]);
var defaultFragment = `varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void){
   gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;
;
 //# sourceMappingURL=defaultFilter.frag.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/defaultFilter.vert.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>defaultVertex
]);
var defaultVertex = `attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;
;
 //# sourceMappingURL=defaultFilter.vert.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/Filter.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Filter",
    ()=>Filter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Program.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Shader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Shader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$State$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/State.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$defaultFilter$2e$frag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/defaultFilter.frag.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$defaultFilter$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/defaultFilter.vert.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
const _Filter = class _Filter2 extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Shader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Shader"] {
    /**
   * @param vertexSrc - The source of the vertex shader.
   * @param fragmentSrc - The source of the fragment shader.
   * @param uniforms - Custom uniforms to use to augment the built-in ones.
   */ constructor(vertexSrc, fragmentSrc, uniforms){
        const program = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Program"].from(vertexSrc || _Filter2.defaultVertexSrc, fragmentSrc || _Filter2.defaultFragmentSrc);
        super(program, uniforms), this.padding = 0, this.resolution = _Filter2.defaultResolution, this.multisample = _Filter2.defaultMultisample, this.enabled = !0, this.autoFit = !0, this.state = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$State$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["State"]();
    }
    /**
   * Applies the filter
   * @param {PIXI.FilterSystem} filterManager - The renderer to retrieve the filter from
   * @param {PIXI.RenderTexture} input - The input render target.
   * @param {PIXI.RenderTexture} output - The target to output to.
   * @param {PIXI.CLEAR_MODES} [clearMode] - Should the output be cleared before rendering to it.
   * @param {object} [_currentState] - It's current state of filter.
   *        There are some useful properties in the currentState :
   *        target, filters, sourceFrame, destinationFrame, renderTarget, resolution
   */ apply(filterManager, input, output, clearMode, _currentState) {
        filterManager.applyFilter(this, input, output, clearMode);
    }
    /**
   * Sets the blend mode of the filter.
   * @default PIXI.BLEND_MODES.NORMAL
   */ get blendMode() {
        return this.state.blendMode;
    }
    set blendMode(value) {
        this.state.blendMode = value;
    }
    /**
   * The resolution of the filter. Setting this to be lower will lower the quality but
   * increase the performance of the filter.
   * If set to `null` or `0`, the resolution of the current render target is used.
   * @default PIXI.Filter.defaultResolution
   */ get resolution() {
        return this._resolution;
    }
    set resolution(value) {
        this._resolution = value;
    }
    /**
   * The default vertex shader source
   * @readonly
   */ static get defaultVertexSrc() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$defaultFilter$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    }
    /**
   * The default fragment shader source
   * @readonly
   */ static get defaultFragmentSrc() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$defaultFilter$2e$frag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    }
};
_Filter.defaultResolution = 1, /**
* Default filter samples for any filter.
* @static
* @type {PIXI.MSAA_QUALITY|null}
* @default PIXI.MSAA_QUALITY.NONE
*/ _Filter.defaultMultisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE;
let Filter = _Filter;
;
 //# sourceMappingURL=Filter.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/background/BackgroundSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BackgroundSystem",
    ()=>BackgroundSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/color/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$Color$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/color/lib/Color.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
;
;
class BackgroundSystem {
    constructor(){
        this.clearBeforeRender = !0, this._backgroundColor = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$Color$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](0), this.alpha = 1;
    }
    /**
   * initiates the background system
   * @param {PIXI.IRendererOptions} options - the options for the background colors
   */ init(options) {
        this.clearBeforeRender = options.clearBeforeRender;
        const { backgroundColor, background, backgroundAlpha } = options, color = background ?? backgroundColor;
        color !== void 0 && (this.color = color), this.alpha = backgroundAlpha;
    }
    /**
   * The background color to fill if not transparent.
   * @member {PIXI.ColorSource}
   */ get color() {
        return this._backgroundColor.value;
    }
    set color(value) {
        this._backgroundColor.setValue(value);
    }
    /**
   * The background color alpha. Setting this to 0 will make the canvas transparent.
   * @member {number}
   */ get alpha() {
        return this._backgroundColor.alpha;
    }
    set alpha(value) {
        this._backgroundColor.setAlpha(value);
    }
    /** The background color object. */ get backgroundColor() {
        return this._backgroundColor;
    }
    destroy() {}
}
BackgroundSystem.defaultOptions = {
    /**
   * {@link PIXI.IRendererOptions.backgroundAlpha}
   * @default 1
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ backgroundAlpha: 1,
    /**
   * {@link PIXI.IRendererOptions.backgroundColor}
   * @default 0x000000
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ backgroundColor: 0,
    /**
   * {@link PIXI.IRendererOptions.clearBeforeRender}
   * @default true
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ clearBeforeRender: !0
}, /** @ignore */ BackgroundSystem.extension = {
    type: [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].CanvasRendererSystem
    ],
    name: "background"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(BackgroundSystem);
;
 //# sourceMappingURL=BackgroundSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BatchSystem",
    ()=>BatchSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$ObjectRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/ObjectRenderer.mjs [app-client] (ecmascript)");
;
;
class BatchSystem {
    /**
   * @param renderer - The renderer this System works for.
   */ constructor(renderer){
        this.renderer = renderer, this.emptyRenderer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$ObjectRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ObjectRenderer"](renderer), this.currentRenderer = this.emptyRenderer;
    }
    /**
   * Changes the current renderer to the one given in parameter
   * @param objectRenderer - The object renderer to use.
   */ setObjectRenderer(objectRenderer) {
        this.currentRenderer !== objectRenderer && (this.currentRenderer.stop(), this.currentRenderer = objectRenderer, this.currentRenderer.start());
    }
    /**
   * This should be called if you wish to do some custom rendering
   * It will basically render anything that may be batched up such as sprites
   */ flush() {
        this.setObjectRenderer(this.emptyRenderer);
    }
    /** Reset the system to an empty renderer */ reset() {
        this.setObjectRenderer(this.emptyRenderer);
    }
    /**
   * Handy function for batch renderers: copies bound textures in first maxTextures locations to array
   * sets actual _batchLocation for them
   * @param arr - arr copy destination
   * @param maxTextures - number of copied elements
   */ copyBoundTextures(arr, maxTextures) {
        const { boundTextures } = this.renderer.texture;
        for(let i = maxTextures - 1; i >= 0; --i)arr[i] = boundTextures[i] || null, arr[i] && (arr[i]._batchLocation = i);
    }
    /**
   * Assigns batch locations to textures in array based on boundTextures state.
   * All textures in texArray should have `_batchEnabled = _batchId`,
   * and their count should be less than `maxTextures`.
   * @param texArray - textures to bound
   * @param boundTextures - current state of bound textures
   * @param batchId - marker for _batchEnabled param of textures in texArray
   * @param maxTextures - number of texture locations to manipulate
   */ boundArray(texArray, boundTextures, batchId, maxTextures) {
        const { elements, ids, count } = texArray;
        let j = 0;
        for(let i = 0; i < count; i++){
            const tex = elements[i], loc = tex._batchLocation;
            if (loc >= 0 && loc < maxTextures && boundTextures[loc] === tex) {
                ids[i] = loc;
                continue;
            }
            for(; j < maxTextures;){
                const bound = boundTextures[j];
                if (bound && bound._batchEnabled === batchId && bound._batchLocation === j) {
                    j++;
                    continue;
                }
                ids[i] = j, tex._batchLocation = j, boundTextures[j] = tex;
                break;
            }
        }
    }
    /**
   * @ignore
   */ destroy() {
        this.renderer = null;
    }
}
BatchSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "batch"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(BatchSystem);
;
 //# sourceMappingURL=BatchSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/context/ContextSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ContextSystem",
    ()=>ContextSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
;
;
;
let CONTEXT_UID_COUNTER = 0;
class ContextSystem {
    /** @param renderer - The renderer this System works for. */ constructor(renderer){
        this.renderer = renderer, this.webGLVersion = 1, this.extensions = {}, this.supports = {
            uint32Indices: !1
        }, this.handleContextLost = this.handleContextLost.bind(this), this.handleContextRestored = this.handleContextRestored.bind(this);
    }
    /**
   * `true` if the context is lost
   * @readonly
   */ get isLost() {
        return !this.gl || this.gl.isContextLost();
    }
    /**
   * Handles the context change event.
   * @param {WebGLRenderingContext} gl - New WebGL context.
   */ contextChange(gl) {
        this.gl = gl, this.renderer.gl = gl, this.renderer.CONTEXT_UID = CONTEXT_UID_COUNTER++;
    }
    init(options) {
        if (options.context) this.initFromContext(options.context);
        else {
            const alpha = this.renderer.background.alpha < 1, premultipliedAlpha = options.premultipliedAlpha;
            this.preserveDrawingBuffer = options.preserveDrawingBuffer, this.useContextAlpha = options.useContextAlpha, this.powerPreference = options.powerPreference, this.initFromOptions({
                alpha,
                premultipliedAlpha,
                antialias: options.antialias,
                stencil: !0,
                preserveDrawingBuffer: options.preserveDrawingBuffer,
                powerPreference: options.powerPreference
            });
        }
    }
    /**
   * Initializes the context.
   * @protected
   * @param {WebGLRenderingContext} gl - WebGL context
   */ initFromContext(gl) {
        this.gl = gl, this.validateContext(gl), this.renderer.gl = gl, this.renderer.CONTEXT_UID = CONTEXT_UID_COUNTER++, this.renderer.runners.contextChange.emit(gl);
        const view = this.renderer.view;
        view.addEventListener !== void 0 && (view.addEventListener("webglcontextlost", this.handleContextLost, !1), view.addEventListener("webglcontextrestored", this.handleContextRestored, !1));
    }
    /**
   * Initialize from context options
   * @protected
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
   * @param {object} options - context attributes
   */ initFromOptions(options) {
        const gl = this.createContext(this.renderer.view, options);
        this.initFromContext(gl);
    }
    /**
   * Helper class to create a WebGL Context
   * @param canvas - the canvas element that we will get the context from
   * @param options - An options object that gets passed in to the canvas element containing the
   *    context attributes
   * @see https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement/getContext
   * @returns {WebGLRenderingContext} the WebGL context
   */ createContext(canvas, options) {
        let gl;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].PREFER_ENV >= __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].WEBGL2 && (gl = canvas.getContext("webgl2", options)), gl) this.webGLVersion = 2;
        else if (this.webGLVersion = 1, gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options), !gl) throw new Error("This browser does not support WebGL. Try using the canvas renderer");
        return this.gl = gl, this.getExtensions(), this.gl;
    }
    /** Auto-populate the {@link PIXI.ContextSystem.extensions extensions}. */ getExtensions() {
        const { gl } = this, common = {
            loseContext: gl.getExtension("WEBGL_lose_context"),
            anisotropicFiltering: gl.getExtension("EXT_texture_filter_anisotropic"),
            floatTextureLinear: gl.getExtension("OES_texture_float_linear"),
            s3tc: gl.getExtension("WEBGL_compressed_texture_s3tc"),
            s3tc_sRGB: gl.getExtension("WEBGL_compressed_texture_s3tc_srgb"),
            // eslint-disable-line camelcase
            etc: gl.getExtension("WEBGL_compressed_texture_etc"),
            etc1: gl.getExtension("WEBGL_compressed_texture_etc1"),
            pvrtc: gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),
            atc: gl.getExtension("WEBGL_compressed_texture_atc"),
            astc: gl.getExtension("WEBGL_compressed_texture_astc"),
            bptc: gl.getExtension("EXT_texture_compression_bptc")
        };
        this.webGLVersion === 1 ? Object.assign(this.extensions, common, {
            drawBuffers: gl.getExtension("WEBGL_draw_buffers"),
            depthTexture: gl.getExtension("WEBGL_depth_texture"),
            vertexArrayObject: gl.getExtension("OES_vertex_array_object") || gl.getExtension("MOZ_OES_vertex_array_object") || gl.getExtension("WEBKIT_OES_vertex_array_object"),
            uint32ElementIndex: gl.getExtension("OES_element_index_uint"),
            // Floats and half-floats
            floatTexture: gl.getExtension("OES_texture_float"),
            floatTextureLinear: gl.getExtension("OES_texture_float_linear"),
            textureHalfFloat: gl.getExtension("OES_texture_half_float"),
            textureHalfFloatLinear: gl.getExtension("OES_texture_half_float_linear")
        }) : this.webGLVersion === 2 && Object.assign(this.extensions, common, {
            // Floats and half-floats
            colorBufferFloat: gl.getExtension("EXT_color_buffer_float")
        });
    }
    /**
   * Handles a lost webgl context
   * @param {WebGLContextEvent} event - The context lost event.
   */ handleContextLost(event) {
        event.preventDefault(), setTimeout(()=>{
            this.gl.isContextLost() && this.extensions.loseContext && this.extensions.loseContext.restoreContext();
        }, 0);
    }
    /** Handles a restored webgl context. */ handleContextRestored() {
        this.renderer.runners.contextChange.emit(this.gl);
    }
    destroy() {
        const view = this.renderer.view;
        this.renderer = null, view.removeEventListener !== void 0 && (view.removeEventListener("webglcontextlost", this.handleContextLost), view.removeEventListener("webglcontextrestored", this.handleContextRestored)), this.gl.useProgram(null), this.extensions.loseContext && this.extensions.loseContext.loseContext();
    }
    /** Handle the post-render runner event. */ postrender() {
        this.renderer.objectRenderer.renderingToScreen && this.gl.flush();
    }
    /**
   * Validate context.
   * @param {WebGLRenderingContext} gl - Render context.
   */ validateContext(gl) {
        const attributes = gl.getContextAttributes(), isWebGl2 = "WebGL2RenderingContext" in globalThis && gl instanceof globalThis.WebGL2RenderingContext;
        isWebGl2 && (this.webGLVersion = 2), attributes && !attributes.stencil && console.warn("Provided WebGL context does not have a stencil buffer, masks may not render correctly");
        const hasuint32 = isWebGl2 || !!gl.getExtension("OES_element_index_uint");
        this.supports.uint32Indices = hasuint32, hasuint32 || console.warn("Provided WebGL context does not support 32 index buffer, complex graphics may not render correctly");
    }
}
ContextSystem.defaultOptions = {
    /**
   * {@link PIXI.IRendererOptions.context}
   * @default null
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ context: null,
    /**
   * {@link PIXI.IRendererOptions.antialias}
   * @default false
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ antialias: !1,
    /**
   * {@link PIXI.IRendererOptions.premultipliedAlpha}
   * @default true
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ premultipliedAlpha: !0,
    /**
   * {@link PIXI.IRendererOptions.preserveDrawingBuffer}
   * @default false
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ preserveDrawingBuffer: !1,
    /**
   * {@link PIXI.IRendererOptions.powerPreference}
   * @default default
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ powerPreference: "default"
}, /** @ignore */ ContextSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "context"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(ContextSystem);
;
 //# sourceMappingURL=ContextSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/Framebuffer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Framebuffer",
    ()=>Framebuffer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/Runner.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
;
;
;
class Framebuffer {
    /**
   * @param width - Width of the frame buffer
   * @param height - Height of the frame buffer
   */ constructor(width, height){
        if (this.width = Math.round(width), this.height = Math.round(height), !this.width || !this.height) throw new Error("Framebuffer width or height is zero");
        this.stencil = !1, this.depth = !1, this.dirtyId = 0, this.dirtyFormat = 0, this.dirtySize = 0, this.depthTexture = null, this.colorTextures = [], this.glFramebuffers = {}, this.disposeRunner = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Runner"]("disposeFramebuffer"), this.multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE;
    }
    /**
   * Reference to the colorTexture.
   * @readonly
   */ get colorTexture() {
        return this.colorTextures[0];
    }
    /**
   * Add texture to the colorTexture array.
   * @param index - Index of the array to add the texture to
   * @param texture - Texture to add to the array
   */ addColorTexture(index = 0, texture) {
        return this.colorTextures[index] = texture || new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"](null, {
            scaleMode: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE_MODES"].NEAREST,
            resolution: 1,
            mipmap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIPMAP_MODES"].OFF,
            width: this.width,
            height: this.height
        }), this.dirtyId++, this.dirtyFormat++, this;
    }
    /**
   * Add a depth texture to the frame buffer.
   * @param texture - Texture to add.
   */ addDepthTexture(texture) {
        return this.depthTexture = texture || new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"](null, {
            scaleMode: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE_MODES"].NEAREST,
            resolution: 1,
            width: this.width,
            height: this.height,
            mipmap: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIPMAP_MODES"].OFF,
            format: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].DEPTH_COMPONENT,
            type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_SHORT
        }), this.dirtyId++, this.dirtyFormat++, this;
    }
    /** Enable depth on the frame buffer. */ enableDepth() {
        return this.depth = !0, this.dirtyId++, this.dirtyFormat++, this;
    }
    /** Enable stencil on the frame buffer. */ enableStencil() {
        return this.stencil = !0, this.dirtyId++, this.dirtyFormat++, this;
    }
    /**
   * Resize the frame buffer
   * @param width - Width of the frame buffer to resize to
   * @param height - Height of the frame buffer to resize to
   */ resize(width, height) {
        if (width = Math.round(width), height = Math.round(height), !width || !height) throw new Error("Framebuffer width and height must not be zero");
        if (!(width === this.width && height === this.height)) {
            this.width = width, this.height = height, this.dirtyId++, this.dirtySize++;
            for(let i = 0; i < this.colorTextures.length; i++){
                const texture = this.colorTextures[i], resolution = texture.resolution;
                texture.setSize(width / resolution, height / resolution);
            }
            if (this.depthTexture) {
                const resolution = this.depthTexture.resolution;
                this.depthTexture.setSize(width / resolution, height / resolution);
            }
        }
    }
    /** Disposes WebGL resources that are connected to this geometry. */ dispose() {
        this.disposeRunner.emit(this, !1);
    }
    /** Destroys and removes the depth texture added to this framebuffer. */ destroyDepthTexture() {
        this.depthTexture && (this.depthTexture.destroy(), this.depthTexture = null, ++this.dirtyId, ++this.dirtyFormat);
    }
}
;
 //# sourceMappingURL=Framebuffer.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/BaseRenderTexture.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseRenderTexture",
    ()=>BaseRenderTexture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/color/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$Color$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/color/lib/Color.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$Framebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/Framebuffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
;
;
;
;
class BaseRenderTexture extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"] {
    /**
   * @param options
   * @param {number} [options.width=100] - The width of the base render texture.
   * @param {number} [options.height=100] - The height of the base render texture.
   * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.BaseTexture.defaultOptions.scaleMode] - See {@link PIXI.SCALE_MODES}
   *   for possible values.
   * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - The resolution / device pixel ratio
   *   of the texture being generated.
   * @param {PIXI.MSAA_QUALITY} [options.multisample=PIXI.MSAA_QUALITY.NONE] - The number of samples of the frame buffer.
   */ constructor(options = {}){
        if (typeof options == "number") {
            const width = arguments[0], height = arguments[1], scaleMode = arguments[2], resolution = arguments[3];
            options = {
                width,
                height,
                scaleMode,
                resolution
            };
        }
        options.width = options.width ?? 100, options.height = options.height ?? 100, options.multisample ?? (options.multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE), super(null, options), this.mipmap = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIPMAP_MODES"].OFF, this.valid = !0, this._clear = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$Color$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]([
            0,
            0,
            0,
            0
        ]), this.framebuffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$Framebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Framebuffer"](this.realWidth, this.realHeight).addColorTexture(0, this), this.framebuffer.multisample = options.multisample, this.maskStack = [], this.filterStack = [
            {}
        ];
    }
    /** Color when clearning the texture. */ set clearColor(value) {
        this._clear.setValue(value);
    }
    get clearColor() {
        return this._clear.value;
    }
    /**
   * Color object when clearning the texture.
   * @readonly
   * @since 7.2.0
   */ get clear() {
        return this._clear;
    }
    /**
   * Shortcut to `this.framebuffer.multisample`.
   * @default PIXI.MSAA_QUALITY.NONE
   */ get multisample() {
        return this.framebuffer.multisample;
    }
    set multisample(value) {
        this.framebuffer.multisample = value;
    }
    /**
   * Resizes the BaseRenderTexture.
   * @param desiredWidth - The desired width to resize to.
   * @param desiredHeight - The desired height to resize to.
   */ resize(desiredWidth, desiredHeight) {
        this.framebuffer.resize(desiredWidth * this.resolution, desiredHeight * this.resolution), this.setRealSize(this.framebuffer.width, this.framebuffer.height);
    }
    /**
   * Frees the texture and framebuffer from WebGL memory without destroying this texture object.
   * This means you can still use the texture later which will upload it to GPU
   * memory again.
   * @fires PIXI.BaseTexture#dispose
   */ dispose() {
        this.framebuffer.dispose(), super.dispose();
    }
    /** Destroys this texture. */ destroy() {
        super.destroy(), this.framebuffer.destroyDepthTexture(), this.framebuffer = null;
    }
}
;
 //# sourceMappingURL=BaseRenderTexture.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BaseImageResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseImageResource",
    ()=>BaseImageResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$network$2f$determineCrossOrigin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/network/determineCrossOrigin.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/Resource.mjs [app-client] (ecmascript)");
;
;
;
class BaseImageResource extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resource"] {
    /**
   * @param {PIXI.ImageSourcee} source
   */ constructor(source){
        const sourceAny = source, width = sourceAny.naturalWidth || sourceAny.videoWidth || sourceAny.displayWidth || sourceAny.width, height = sourceAny.naturalHeight || sourceAny.videoHeight || sourceAny.displayHeight || sourceAny.height;
        super(width, height), this.source = source, this.noSubImage = !1;
    }
    /**
   * Set cross origin based detecting the url and the crossorigin
   * @param element - Element to apply crossOrigin
   * @param url - URL to check
   * @param crossorigin - Cross origin value to use
   */ static crossOrigin(element, url, crossorigin) {
        crossorigin === void 0 && !url.startsWith("data:") ? element.crossOrigin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$network$2f$determineCrossOrigin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["determineCrossOrigin"])(url) : crossorigin !== !1 && (element.crossOrigin = typeof crossorigin == "string" ? crossorigin : "anonymous");
    }
    /**
   * Upload the texture to the GPU.
   * @param renderer - Upload to the renderer
   * @param baseTexture - Reference to parent texture
   * @param glTexture
   * @param {PIXI.ImageSourcee} [source] - (optional)
   * @returns - true is success
   */ upload(renderer, baseTexture, glTexture, source) {
        const gl = renderer.gl, width = baseTexture.realWidth, height = baseTexture.realHeight;
        if (source = source || this.source, typeof HTMLImageElement < "u" && source instanceof HTMLImageElement) {
            if (!source.complete || source.naturalWidth === 0) return !1;
        } else if (typeof HTMLVideoElement < "u" && source instanceof HTMLVideoElement && source.readyState <= 1) return !1;
        return gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ALPHA_MODES"].UNPACK), !this.noSubImage && baseTexture.target === gl.TEXTURE_2D && glTexture.width === width && glTexture.height === height ? gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, baseTexture.format, glTexture.type, source) : (glTexture.width = width, glTexture.height = height, gl.texImage2D(baseTexture.target, 0, glTexture.internalFormat, baseTexture.format, glTexture.type, source)), !0;
    }
    /**
   * Checks if source width/height was changed, resize can cause extra baseTexture update.
   * Triggers one update in any case.
   */ update() {
        if (this.destroyed) return;
        const source = this.source, width = source.naturalWidth || source.videoWidth || source.width, height = source.naturalHeight || source.videoHeight || source.height;
        this.resize(width, height), super.update();
    }
    /** Destroy this {@link PIXI.BaseImageResource} */ dispose() {
        this.source = null;
    }
}
;
 //# sourceMappingURL=BaseImageResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ImageResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImageResource",
    ()=>ImageResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BaseImageResource.mjs [app-client] (ecmascript)");
;
;
;
class ImageResource extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseImageResource"] {
    /**
   * @param source - image source or URL
   * @param options
   * @param {boolean} [options.autoLoad=true] - start loading process
   * @param {boolean} [options.createBitmap=PIXI.settings.CREATE_IMAGE_BITMAP] - whether its required to create
   *        a bitmap before upload
   * @param {boolean} [options.crossorigin=true] - Load image using cross origin
   * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.UNPACK] - Premultiply image alpha in bitmap
   */ constructor(source, options){
        if (options = options || {}, typeof source == "string") {
            const imageElement = new Image();
            __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseImageResource"].crossOrigin(imageElement, source, options.crossorigin), imageElement.src = source, source = imageElement;
        }
        super(source), !source.complete && this._width && this._height && (this._width = 0, this._height = 0), this.url = source.src, this._process = null, this.preserveBitmap = !1, this.createBitmap = (options.createBitmap ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].CREATE_IMAGE_BITMAP) && !!globalThis.createImageBitmap, this.alphaMode = typeof options.alphaMode == "number" ? options.alphaMode : null, this.bitmap = null, this._load = null, options.autoLoad !== !1 && this.load();
    }
    /**
   * Returns a promise when image will be loaded and processed.
   * @param createBitmap - whether process image into bitmap
   */ load(createBitmap) {
        return this._load ? this._load : (createBitmap !== void 0 && (this.createBitmap = createBitmap), this._load = new Promise((resolve, reject)=>{
            const source = this.source;
            this.url = source.src;
            const completed = ()=>{
                this.destroyed || (source.onload = null, source.onerror = null, this.update(), this._load = null, this.createBitmap ? resolve(this.process()) : resolve(this));
            };
            source.complete && source.src ? completed() : (source.onload = completed, source.onerror = (event)=>{
                reject(event), this.onError.emit(event);
            });
        }), this._load);
    }
    /**
   * Called when we need to convert image into BitmapImage.
   * Can be called multiple times, real promise is cached inside.
   * @returns - Cached promise to fill that bitmap
   */ process() {
        const source = this.source;
        if (this._process !== null) return this._process;
        if (this.bitmap !== null || !globalThis.createImageBitmap) return Promise.resolve(this);
        const createImageBitmap = globalThis.createImageBitmap, cors = !source.crossOrigin || source.crossOrigin === "anonymous";
        return this._process = fetch(source.src, {
            mode: cors ? "cors" : "no-cors"
        }).then((r)=>r.blob()).then((blob)=>createImageBitmap(blob, 0, 0, source.width, source.height, {
                premultiplyAlpha: this.alphaMode === null || this.alphaMode === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ALPHA_MODES"].UNPACK ? "premultiply" : "none"
            })).then((bitmap)=>this.destroyed ? Promise.reject() : (this.bitmap = bitmap, this.update(), this._process = null, Promise.resolve(this))), this._process;
    }
    /**
   * Upload the image resource to GPU.
   * @param renderer - Renderer to upload to
   * @param baseTexture - BaseTexture for this resource
   * @param glTexture - GLTexture to use
   * @returns {boolean} true is success
   */ upload(renderer, baseTexture, glTexture) {
        if (typeof this.alphaMode == "number" && (baseTexture.alphaMode = this.alphaMode), !this.createBitmap) return super.upload(renderer, baseTexture, glTexture);
        if (!this.bitmap && (this.process(), !this.bitmap)) return !1;
        if (super.upload(renderer, baseTexture, glTexture, this.bitmap), !this.preserveBitmap) {
            let flag = !0;
            const glTextures = baseTexture._glTextures;
            for(const key in glTextures){
                const otherTex = glTextures[key];
                if (otherTex !== glTexture && otherTex.dirtyId !== baseTexture.dirtyId) {
                    flag = !1;
                    break;
                }
            }
            flag && (this.bitmap.close && this.bitmap.close(), this.bitmap = null);
        }
        return !0;
    }
    /** Destroys this resource. */ dispose() {
        this.source.onload = null, this.source.onerror = null, super.dispose(), this.bitmap && (this.bitmap.close(), this.bitmap = null), this._process = null, this._load = null;
    }
    /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if current environment support HTMLImageElement, and source is string or HTMLImageElement
   */ static test(source) {
        return typeof HTMLImageElement < "u" && (typeof source == "string" || source instanceof HTMLImageElement);
    }
}
;
 //# sourceMappingURL=ImageResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureUvs.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TextureUvs",
    ()=>TextureUvs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/groupD8.mjs [app-client] (ecmascript)");
;
class TextureUvs {
    constructor(){
        this.x0 = 0, this.y0 = 0, this.x1 = 1, this.y1 = 0, this.x2 = 1, this.y2 = 1, this.x3 = 0, this.y3 = 1, this.uvsFloat32 = new Float32Array(8);
    }
    /**
   * Sets the texture Uvs based on the given frame information.
   * @protected
   * @param frame - The frame of the texture
   * @param baseFrame - The base frame of the texture
   * @param rotate - Rotation of frame, see {@link PIXI.groupD8}
   */ set(frame, baseFrame, rotate) {
        const tw = baseFrame.width, th = baseFrame.height;
        if (rotate) {
            const w2 = frame.width / 2 / tw, h2 = frame.height / 2 / th, cX = frame.x / tw + w2, cY = frame.y / th + h2;
            rotate = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].add(rotate, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].NW), this.x0 = cX + w2 * __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].uX(rotate), this.y0 = cY + h2 * __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].uY(rotate), rotate = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].add(rotate, 2), this.x1 = cX + w2 * __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].uX(rotate), this.y1 = cY + h2 * __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].uY(rotate), rotate = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].add(rotate, 2), this.x2 = cX + w2 * __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].uX(rotate), this.y2 = cY + h2 * __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].uY(rotate), rotate = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].add(rotate, 2), this.x3 = cX + w2 * __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].uX(rotate), this.y3 = cY + h2 * __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$groupD8$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"].uY(rotate);
        } else this.x0 = frame.x / tw, this.y0 = frame.y / th, this.x1 = (frame.x + frame.width) / tw, this.y1 = frame.y / th, this.x2 = (frame.x + frame.width) / tw, this.y2 = (frame.y + frame.height) / th, this.x3 = frame.x / tw, this.y3 = (frame.y + frame.height) / th;
        this.uvsFloat32[0] = this.x0, this.uvsFloat32[1] = this.y0, this.uvsFloat32[2] = this.x1, this.uvsFloat32[3] = this.y1, this.uvsFloat32[4] = this.x2, this.uvsFloat32[5] = this.y2, this.uvsFloat32[6] = this.x3, this.uvsFloat32[7] = this.y3;
    }
}
TextureUvs.prototype.toString = function() {
    return `[@pixi/core:TextureUvs x0=${this.x0} y0=${this.y0} x1=${this.x1} y1=${this.y1} x2=${this.x2} y2=${this.y2} x3=${this.x3} y3=${this.y3}]`;
};
;
 //# sourceMappingURL=TextureUvs.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/Texture.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Texture",
    ()=>Texture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/shapes/Rectangle.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Point.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$eventemitter3$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EventEmitter$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/eventemitter3/index.js [app-client] (ecmascript) <export default as EventEmitter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/media/caches.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$uid$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/data/uid.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$network$2f$getResolutionOfUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/network/getResolutionOfUrl.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ImageResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureUvs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureUvs.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
const DEFAULT_UVS = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureUvs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureUvs"]();
function removeAllHandlers(tex) {
    tex.destroy = function() {}, tex.on = function() {}, tex.once = function() {}, tex.emit = function() {};
}
class Texture extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$eventemitter3$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EventEmitter$3e$__["EventEmitter"] {
    /**
   * @param baseTexture - The base texture source to create the texture from
   * @param frame - The rectangle frame of the texture to show
   * @param orig - The area of original texture
   * @param trim - Trimmed rectangle of original texture
   * @param rotate - indicates how the texture was rotated by texture packer. See {@link PIXI.groupD8}
   * @param anchor - Default anchor point used for sprite placement / rotation
   * @param borders - Default borders used for 9-slice scaling. See {@link PIXI.NineSlicePlane}
   */ constructor(baseTexture, frame, orig, trim, rotate, anchor, borders){
        if (super(), this.noFrame = !1, frame || (this.noFrame = !0, frame = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](0, 0, 1, 1)), baseTexture instanceof Texture && (baseTexture = baseTexture.baseTexture), this.baseTexture = baseTexture, this._frame = frame, this.trim = trim, this.valid = !1, this.destroyed = !1, this._uvs = DEFAULT_UVS, this.uvMatrix = null, this.orig = orig || frame, this._rotate = Number(rotate || 0), rotate === !0) this._rotate = 2;
        else if (this._rotate % 2 !== 0) throw new Error("attempt to use diamond-shaped UVs. If you are sure, set rotation manually");
        this.defaultAnchor = anchor ? new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Point"](anchor.x, anchor.y) : new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Point"](0, 0), this.defaultBorders = borders, this._updateID = 0, this.textureCacheIds = [], baseTexture.valid ? this.noFrame ? baseTexture.valid && this.onBaseTextureUpdated(baseTexture) : this.frame = frame : baseTexture.once("loaded", this.onBaseTextureUpdated, this), this.noFrame && baseTexture.on("update", this.onBaseTextureUpdated, this);
    }
    /**
   * Updates this texture on the gpu.
   *
   * Calls the TextureResource update.
   *
   * If you adjusted `frame` manually, please call `updateUvs()` instead.
   */ update() {
        this.baseTexture.resource && this.baseTexture.resource.update();
    }
    /**
   * Called when the base texture is updated
   * @protected
   * @param baseTexture - The base texture.
   */ onBaseTextureUpdated(baseTexture) {
        if (this.noFrame) {
            if (!this.baseTexture.valid) return;
            this._frame.width = baseTexture.width, this._frame.height = baseTexture.height, this.valid = !0, this.updateUvs();
        } else this.frame = this._frame;
        this.emit("update", this);
    }
    /**
   * Destroys this texture
   * @param [destroyBase=false] - Whether to destroy the base texture as well
   * @fires PIXI.Texture#destroyed
   */ destroy(destroyBase) {
        if (this.baseTexture) {
            if (destroyBase) {
                const { resource } = this.baseTexture;
                resource?.url && __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureCache"][resource.url] && Texture.removeFromCache(resource.url), this.baseTexture.destroy();
            }
            this.baseTexture.off("loaded", this.onBaseTextureUpdated, this), this.baseTexture.off("update", this.onBaseTextureUpdated, this), this.baseTexture = null;
        }
        this._frame = null, this._uvs = null, this.trim = null, this.orig = null, this.valid = !1, Texture.removeFromCache(this), this.textureCacheIds = null, this.destroyed = !0, this.emit("destroyed", this), this.removeAllListeners();
    }
    /**
   * Creates a new texture object that acts the same as this one.
   * @returns - The new texture
   */ clone() {
        const clonedFrame = this._frame.clone(), clonedOrig = this._frame === this.orig ? clonedFrame : this.orig.clone(), clonedTexture = new Texture(this.baseTexture, !this.noFrame && clonedFrame, clonedOrig, this.trim?.clone(), this.rotate, this.defaultAnchor, this.defaultBorders);
        return this.noFrame && (clonedTexture._frame = clonedFrame), clonedTexture;
    }
    /**
   * Updates the internal WebGL UV cache. Use it after you change `frame` or `trim` of the texture.
   * Call it after changing the frame
   */ updateUvs() {
        this._uvs === DEFAULT_UVS && (this._uvs = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureUvs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureUvs"]()), this._uvs.set(this._frame, this.baseTexture, this.rotate), this._updateID++;
    }
    /**
   * Helper function that creates a new Texture based on the source you provide.
   * The source can be - frame id, image url, video url, canvas element, video element, base texture
   * @param {string|PIXI.BaseTexture|HTMLImageElement|HTMLVideoElement|ImageBitmap|PIXI.ICanvas} source -
   *        Source or array of sources to create texture from
   * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
   * @param {string} [options.pixiIdPrefix=pixiid] - If a source has no id, this is the prefix of the generated id
   * @param {boolean} [strict] - Enforce strict-mode, see {@link PIXI.settings.STRICT_TEXTURE_CACHE}.
   * @returns {PIXI.Texture} The newly created texture
   */ static from(source, options = {}, strict = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].STRICT_TEXTURE_CACHE) {
        const isFrame = typeof source == "string";
        let cacheId = null;
        if (isFrame) cacheId = source;
        else if (source instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"]) {
            if (!source.cacheId) {
                const prefix = options?.pixiIdPrefix || "pixiid";
                source.cacheId = `${prefix}-${(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$uid$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uid"])()}`, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].addToCache(source, source.cacheId);
            }
            cacheId = source.cacheId;
        } else {
            if (!source._pixiId) {
                const prefix = options?.pixiIdPrefix || "pixiid";
                source._pixiId = `${prefix}_${(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$uid$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uid"])()}`;
            }
            cacheId = source._pixiId;
        }
        let texture = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureCache"][cacheId];
        if (isFrame && strict && !texture) throw new Error(`The cacheId "${cacheId}" does not exist in TextureCache.`);
        return !texture && !(source instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"]) ? (options.resolution || (options.resolution = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$network$2f$getResolutionOfUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getResolutionOfUrl"])(source)), texture = new Texture(new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"](source, options)), texture.baseTexture.cacheId = cacheId, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].addToCache(texture.baseTexture, cacheId), Texture.addToCache(texture, cacheId)) : !texture && source instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"] && (texture = new Texture(source), Texture.addToCache(texture, cacheId)), texture;
    }
    /**
   * Useful for loading textures via URLs. Use instead of `Texture.from` because
   * it does a better job of handling failed URLs more effectively. This also ignores
   * `PIXI.settings.STRICT_TEXTURE_CACHE`. Works for Videos, SVGs, Images.
   * @param url - The remote URL or array of URLs to load.
   * @param options - Optional options to include
   * @returns - A Promise that resolves to a Texture.
   */ static fromURL(url, options) {
        const resourceOptions = Object.assign({
            autoLoad: !1
        }, options?.resourceOptions), texture = Texture.from(url, Object.assign({
            resourceOptions
        }, options), !1), resource = texture.baseTexture.resource;
        return texture.baseTexture.valid ? Promise.resolve(texture) : resource.load().then(()=>Promise.resolve(texture));
    }
    /**
   * Create a new Texture with a BufferResource from a typed array.
   * @param buffer - The optional array to use. If no data is provided, a new Float32Array is created.
   * @param width - Width of the resource
   * @param height - Height of the resource
   * @param options - See {@link PIXI.BaseTexture}'s constructor for options.
   *        Default properties are different from the constructor's defaults.
   * @param {PIXI.FORMATS} [options.format] - The format is not given, the type is inferred from the
   *        type of the buffer: `RGBA` if Float32Array, Int8Array, Uint8Array, or Uint8ClampedArray,
   *        otherwise `RGBA_INTEGER`.
   * @param {PIXI.TYPES} [options.type] - The type is not given, the type is inferred from the
   *        type of the buffer. Maps Float32Array to `FLOAT`, Int32Array to `INT`, Uint32Array to
   *        `UNSIGNED_INT`, Int16Array to `SHORT`, Uint16Array to `UNSIGNED_SHORT`, Int8Array to `BYTE`,
   *        Uint8Array/Uint8ClampedArray to `UNSIGNED_BYTE`.
   * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.NPM]
   * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.SCALE_MODES.NEAREST]
   * @returns - The resulting new BaseTexture
   */ static fromBuffer(buffer, width, height, options) {
        return new Texture(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].fromBuffer(buffer, width, height, options));
    }
    /**
   * Create a texture from a source and add to the cache.
   * @param {HTMLImageElement|HTMLVideoElement|ImageBitmap|PIXI.ICanvas|string} source - The input source.
   * @param imageUrl - File name of texture, for cache and resolving resolution.
   * @param name - Human readable name for the texture cache. If no name is
   *        specified, only `imageUrl` will be used as the cache ID.
   * @param options
   * @returns - Output texture
   */ static fromLoader(source, imageUrl, name, options) {
        const baseTexture = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"](source, Object.assign({
            scaleMode: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].defaultOptions.scaleMode,
            resolution: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$network$2f$getResolutionOfUrl$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getResolutionOfUrl"])(imageUrl)
        }, options)), { resource } = baseTexture;
        resource instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImageResource"] && (resource.url = imageUrl);
        const texture = new Texture(baseTexture);
        return name || (name = imageUrl), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].addToCache(texture.baseTexture, name), Texture.addToCache(texture, name), name !== imageUrl && (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].addToCache(texture.baseTexture, imageUrl), Texture.addToCache(texture, imageUrl)), texture.baseTexture.valid ? Promise.resolve(texture) : new Promise((resolve)=>{
            texture.baseTexture.once("loaded", ()=>resolve(texture));
        });
    }
    /**
   * Adds a Texture to the global TextureCache. This cache is shared across the whole PIXI object.
   * @param texture - The Texture to add to the cache.
   * @param id - The id that the Texture will be stored against.
   */ static addToCache(texture, id) {
        id && (texture.textureCacheIds.includes(id) || texture.textureCacheIds.push(id), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureCache"][id] && __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureCache"][id] !== texture && console.warn(`Texture added to the cache with an id [${id}] that already had an entry`), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureCache"][id] = texture);
    }
    /**
   * Remove a Texture from the global TextureCache.
   * @param texture - id of a Texture to be removed, or a Texture instance itself
   * @returns - The Texture that was removed
   */ static removeFromCache(texture) {
        if (typeof texture == "string") {
            const textureFromCache = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureCache"][texture];
            if (textureFromCache) {
                const index = textureFromCache.textureCacheIds.indexOf(texture);
                return index > -1 && textureFromCache.textureCacheIds.splice(index, 1), delete __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureCache"][texture], textureFromCache;
            }
        } else if (texture?.textureCacheIds) {
            for(let i = 0; i < texture.textureCacheIds.length; ++i)__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureCache"][texture.textureCacheIds[i]] === texture && delete __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$media$2f$caches$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureCache"][texture.textureCacheIds[i]];
            return texture.textureCacheIds.length = 0, texture;
        }
        return null;
    }
    /**
   * Returns resolution of baseTexture
   * @readonly
   */ get resolution() {
        return this.baseTexture.resolution;
    }
    /**
   * The frame specifies the region of the base texture that this texture uses.
   * Please call `updateUvs()` after you change coordinates of `frame` manually.
   */ get frame() {
        return this._frame;
    }
    set frame(frame) {
        this._frame = frame, this.noFrame = !1;
        const { x, y, width, height } = frame, xNotFit = x + width > this.baseTexture.width, yNotFit = y + height > this.baseTexture.height;
        if (xNotFit || yNotFit) {
            const relationship = xNotFit && yNotFit ? "and" : "or", errorX = `X: ${x} + ${width} = ${x + width} > ${this.baseTexture.width}`, errorY = `Y: ${y} + ${height} = ${y + height} > ${this.baseTexture.height}`;
            throw new Error(`Texture Error: frame does not fit inside the base Texture dimensions: ${errorX} ${relationship} ${errorY}`);
        }
        this.valid = width && height && this.baseTexture.valid, !this.trim && !this.rotate && (this.orig = frame), this.valid && this.updateUvs();
    }
    /**
   * Indicates whether the texture is rotated inside the atlas
   * set to 2 to compensate for texture packer rotation
   * set to 6 to compensate for spine packer rotation
   * can be used to rotate or mirror sprites
   * See {@link PIXI.groupD8} for explanation
   */ get rotate() {
        return this._rotate;
    }
    set rotate(rotate) {
        this._rotate = rotate, this.valid && this.updateUvs();
    }
    /** The width of the Texture in pixels. */ get width() {
        return this.orig.width;
    }
    /** The height of the Texture in pixels. */ get height() {
        return this.orig.height;
    }
    /** Utility function for BaseTexture|Texture cast. */ castToBaseTexture() {
        return this.baseTexture;
    }
    /** An empty texture, used often to not have to create multiple empty textures. Can not be destroyed. */ static get EMPTY() {
        return Texture._EMPTY || (Texture._EMPTY = new Texture(new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"]()), removeAllHandlers(Texture._EMPTY), removeAllHandlers(Texture._EMPTY.baseTexture)), Texture._EMPTY;
    }
    /** A white texture of 16x16 size, used for graphics and other things Can not be destroyed. */ static get WHITE() {
        if (!Texture._WHITE) {
            const canvas = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.createCanvas(16, 16), context = canvas.getContext("2d");
            canvas.width = 16, canvas.height = 16, context.fillStyle = "white", context.fillRect(0, 0, 16, 16), Texture._WHITE = new Texture(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].from(canvas)), removeAllHandlers(Texture._WHITE), removeAllHandlers(Texture._WHITE.baseTexture);
        }
        return Texture._WHITE;
    }
}
;
 //# sourceMappingURL=Texture.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTexture.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RenderTexture",
    ()=>RenderTexture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/Texture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$BaseRenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/BaseRenderTexture.mjs [app-client] (ecmascript)");
;
;
class RenderTexture extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Texture"] {
    /**
   * @param baseRenderTexture - The base texture object that this texture uses.
   * @param frame - The rectangle frame of the texture to show.
   */ constructor(baseRenderTexture, frame){
        super(baseRenderTexture, frame), this.valid = !0, this.filterFrame = null, this.filterPoolKey = null, this.updateUvs();
    }
    /**
   * Shortcut to `this.baseTexture.framebuffer`, saves baseTexture cast.
   * @readonly
   */ get framebuffer() {
        return this.baseTexture.framebuffer;
    }
    /**
   * Shortcut to `this.framebuffer.multisample`.
   * @default PIXI.MSAA_QUALITY.NONE
   */ get multisample() {
        return this.framebuffer.multisample;
    }
    set multisample(value) {
        this.framebuffer.multisample = value;
    }
    /**
   * Resizes the RenderTexture.
   * @param desiredWidth - The desired width to resize to.
   * @param desiredHeight - The desired height to resize to.
   * @param resizeBaseTexture - Should the baseTexture.width and height values be resized as well?
   */ resize(desiredWidth, desiredHeight, resizeBaseTexture = !0) {
        const resolution = this.baseTexture.resolution, width = Math.round(desiredWidth * resolution) / resolution, height = Math.round(desiredHeight * resolution) / resolution;
        this.valid = width > 0 && height > 0, this._frame.width = this.orig.width = width, this._frame.height = this.orig.height = height, resizeBaseTexture && this.baseTexture.resize(width, height), this.updateUvs();
    }
    /**
   * Changes the resolution of baseTexture, but does not change framebuffer size.
   * @param resolution - The new resolution to apply to RenderTexture
   */ setResolution(resolution) {
        const { baseTexture } = this;
        baseTexture.resolution !== resolution && (baseTexture.setResolution(resolution), this.resize(baseTexture.width, baseTexture.height, !1));
    }
    /**
   * A short hand way of creating a render texture.
   * @param options - Options
   * @param {number} [options.width=100] - The width of the render texture
   * @param {number} [options.height=100] - The height of the render texture
   * @param {PIXI.SCALE_MODES} [options.scaleMode=PIXI.BaseTexture.defaultOptions.scaleMode] - See {@link PIXI.SCALE_MODES}
   *    for possible values
   * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - The resolution / device pixel ratio of the texture
   *    being generated
   * @param {PIXI.MSAA_QUALITY} [options.multisample=PIXI.MSAA_QUALITY.NONE] - The number of samples of the frame buffer
   * @returns The new render texture
   */ static create(options) {
        return new RenderTexture(new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$BaseRenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseRenderTexture"](options));
    }
}
;
 //# sourceMappingURL=RenderTexture.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTexturePool.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RenderTexturePool",
    ()=>RenderTexturePool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/data/pow2.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$BaseRenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/BaseRenderTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTexture.mjs [app-client] (ecmascript)");
;
;
;
;
class RenderTexturePool {
    /**
   * @param textureOptions - options that will be passed to BaseRenderTexture constructor
   * @param {PIXI.SCALE_MODES} [textureOptions.scaleMode] - See {@link PIXI.SCALE_MODES} for possible values.
   */ constructor(textureOptions){
        this.texturePool = {}, this.textureOptions = textureOptions || {}, this.enableFullScreen = !1, this._pixelsWidth = 0, this._pixelsHeight = 0;
    }
    /**
   * Creates texture with params that were specified in pool constructor.
   * @param realWidth - Width of texture in pixels.
   * @param realHeight - Height of texture in pixels.
   * @param multisample - Number of samples of the framebuffer.
   */ createTexture(realWidth, realHeight, multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE) {
        const baseRenderTexture = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$BaseRenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseRenderTexture"](Object.assign({
            width: realWidth,
            height: realHeight,
            resolution: 1,
            multisample
        }, this.textureOptions));
        return new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RenderTexture"](baseRenderTexture);
    }
    /**
   * Gets a Power-of-Two render texture or fullScreen texture
   * @param minWidth - The minimum width of the render texture.
   * @param minHeight - The minimum height of the render texture.
   * @param resolution - The resolution of the render texture.
   * @param multisample - Number of samples of the render texture.
   * @returns The new render texture.
   */ getOptimalTexture(minWidth, minHeight, resolution = 1, multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE) {
        let key;
        minWidth = Math.max(Math.ceil(minWidth * resolution - 1e-6), 1), minHeight = Math.max(Math.ceil(minHeight * resolution - 1e-6), 1), !this.enableFullScreen || minWidth !== this._pixelsWidth || minHeight !== this._pixelsHeight ? (minWidth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextPow2"])(minWidth), minHeight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$pow2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextPow2"])(minHeight), key = ((minWidth & 65535) << 16 | minHeight & 65535) >>> 0, multisample > 1 && (key += multisample * 4294967296)) : key = multisample > 1 ? -multisample : -1, this.texturePool[key] || (this.texturePool[key] = []);
        let renderTexture = this.texturePool[key].pop();
        return renderTexture || (renderTexture = this.createTexture(minWidth, minHeight, multisample)), renderTexture.filterPoolKey = key, renderTexture.setResolution(resolution), renderTexture;
    }
    /**
   * Gets extra texture of the same size as input renderTexture
   *
   * `getFilterTexture(input, 0.5)` or `getFilterTexture(0.5, input)`
   * @param input - renderTexture from which size and resolution will be copied
   * @param resolution - override resolution of the renderTexture
   *  It overrides, it does not multiply
   * @param multisample - number of samples of the renderTexture
   */ getFilterTexture(input, resolution, multisample) {
        const filterTexture = this.getOptimalTexture(input.width, input.height, resolution || input.resolution, multisample || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE);
        return filterTexture.filterFrame = input.filterFrame, filterTexture;
    }
    /**
   * Place a render texture back into the pool.
   * @param renderTexture - The renderTexture to free
   */ returnTexture(renderTexture) {
        const key = renderTexture.filterPoolKey;
        renderTexture.filterFrame = null, this.texturePool[key].push(renderTexture);
    }
    /**
   * Alias for returnTexture, to be compliant with FilterSystem interface.
   * @param renderTexture - The renderTexture to free
   */ returnFilterTexture(renderTexture) {
        this.returnTexture(renderTexture);
    }
    /**
   * Clears the pool.
   * @param destroyTextures - Destroy all stored textures.
   */ clear(destroyTextures) {
        if (destroyTextures = destroyTextures !== !1, destroyTextures) for(const i in this.texturePool){
            const textures = this.texturePool[i];
            if (textures) for(let j = 0; j < textures.length; j++)textures[j].destroy(!0);
        }
        this.texturePool = {};
    }
    /**
   * If screen size was changed, drops all screen-sized textures,
   * sets new screen size, sets `enableFullScreen` to true
   *
   * Size is measured in pixels, `renderer.view` can be passed here, not `renderer.screen`
   * @param size - Initial size of screen.
   */ setScreenSize(size) {
        if (!(size.width === this._pixelsWidth && size.height === this._pixelsHeight)) {
            this.enableFullScreen = size.width > 0 && size.height > 0;
            for(const i in this.texturePool){
                if (!(Number(i) < 0)) continue;
                const textures = this.texturePool[i];
                if (textures) for(let j = 0; j < textures.length; j++)textures[j].destroy(!0);
                this.texturePool[i] = [];
            }
            this._pixelsWidth = size.width, this._pixelsHeight = size.height;
        }
    }
}
RenderTexturePool.SCREEN_KEY = -1;
;
 //# sourceMappingURL=RenderTexturePool.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/utils/Quad.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Quad",
    ()=>Quad
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Geometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Geometry.mjs [app-client] (ecmascript)");
;
class Quad extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Geometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Geometry"] {
    constructor(){
        super(), this.addAttribute("aVertexPosition", new Float32Array([
            0,
            0,
            1,
            0,
            1,
            1,
            0,
            1
        ])).addIndex([
            0,
            1,
            3,
            2
        ]);
    }
}
;
 //# sourceMappingURL=Quad.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/utils/QuadUv.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QuadUv",
    ()=>QuadUv
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Buffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Geometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Geometry.mjs [app-client] (ecmascript)");
;
;
class QuadUv extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Geometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Geometry"] {
    constructor(){
        super(), this.vertices = new Float32Array([
            -1,
            -1,
            1,
            -1,
            1,
            1,
            -1,
            1
        ]), this.uvs = new Float32Array([
            0,
            0,
            1,
            0,
            1,
            1,
            0,
            1
        ]), this.vertexBuffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"](this.vertices), this.uvBuffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"](this.uvs), this.addAttribute("aVertexPosition", this.vertexBuffer).addAttribute("aTextureCoord", this.uvBuffer).addIndex([
            0,
            1,
            2,
            0,
            2,
            3
        ]);
    }
    /**
   * Maps two Rectangle to the quad.
   * @param targetTextureFrame - The first rectangle
   * @param destinationFrame - The second rectangle
   * @returns - Returns itself.
   */ map(targetTextureFrame, destinationFrame) {
        let x = 0, y = 0;
        return this.uvs[0] = x, this.uvs[1] = y, this.uvs[2] = x + destinationFrame.width / targetTextureFrame.width, this.uvs[3] = y, this.uvs[4] = x + destinationFrame.width / targetTextureFrame.width, this.uvs[5] = y + destinationFrame.height / targetTextureFrame.height, this.uvs[6] = x, this.uvs[7] = y + destinationFrame.height / targetTextureFrame.height, x = destinationFrame.x, y = destinationFrame.y, this.vertices[0] = x, this.vertices[1] = y, this.vertices[2] = x + destinationFrame.width, this.vertices[3] = y, this.vertices[4] = x + destinationFrame.width, this.vertices[5] = y + destinationFrame.height, this.vertices[6] = x, this.vertices[7] = y + destinationFrame.height, this.invalidate(), this;
    }
    /**
   * Legacy upload method, just marks buffers dirty.
   * @returns - Returns itself.
   */ invalidate() {
        return this.vertexBuffer._updateID++, this.uvBuffer._updateID++, this;
    }
}
;
 //# sourceMappingURL=QuadUv.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/FilterState.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FilterState",
    ()=>FilterState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/shapes/Rectangle.mjs [app-client] (ecmascript)");
;
;
class FilterState {
    constructor(){
        this.renderTexture = null, this.target = null, this.legacy = !1, this.resolution = 1, this.multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE, this.sourceFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](), this.destinationFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](), this.bindingSourceFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](), this.bindingDestinationFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](), this.filters = [], this.transform = null;
    }
    /** Clears the state */ clear() {
        this.target = null, this.filters = null, this.renderTexture = null;
    }
}
;
 //# sourceMappingURL=FilterState.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/FilterSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FilterSystem",
    ()=>FilterSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Point.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Matrix.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/shapes/Rectangle.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexturePool$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTexturePool.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/UniformGroup.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$utils$2f$Quad$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/utils/Quad.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$utils$2f$QuadUv$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/utils/QuadUv.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$FilterState$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/FilterState.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
const tempPoints = [
    new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Point"](),
    new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Point"](),
    new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Point"](),
    new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Point$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Point"]()
], tempMatrix = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"]();
class FilterSystem {
    /**
   * @param renderer - The renderer this System works for.
   */ constructor(renderer){
        this.renderer = renderer, this.defaultFilterStack = [
            {}
        ], this.texturePool = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexturePool$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RenderTexturePool"](), this.statePool = [], this.quad = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$utils$2f$Quad$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Quad"](), this.quadUv = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$utils$2f$QuadUv$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuadUv"](), this.tempRect = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](), this.activeState = {}, this.globalUniforms = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UniformGroup"]({
            outputFrame: new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](),
            inputSize: new Float32Array(4),
            inputPixel: new Float32Array(4),
            inputClamp: new Float32Array(4),
            resolution: 1,
            // legacy variables
            filterArea: new Float32Array(4),
            filterClamp: new Float32Array(4)
        }, !0), this.forceClear = !1, this.useMaxPadding = !1;
    }
    init() {
        this.texturePool.setScreenSize(this.renderer.view);
    }
    /**
   * Pushes a set of filters to be applied later to the system. This will redirect further rendering into an
   * input render-texture for the rest of the filtering pipeline.
   * @param {PIXI.DisplayObject} target - The target of the filter to render.
   * @param filters - The filters to apply.
   */ push(target, filters) {
        const renderer = this.renderer, filterStack = this.defaultFilterStack, state = this.statePool.pop() || new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$FilterState$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FilterState"](), renderTextureSystem = renderer.renderTexture;
        let currentResolution, currentMultisample;
        if (renderTextureSystem.current) {
            const renderTexture = renderTextureSystem.current;
            currentResolution = renderTexture.resolution, currentMultisample = renderTexture.multisample;
        } else currentResolution = renderer.resolution, currentMultisample = renderer.multisample;
        let resolution = filters[0].resolution || currentResolution, multisample = filters[0].multisample ?? currentMultisample, padding = filters[0].padding, autoFit = filters[0].autoFit, legacy = filters[0].legacy ?? !0;
        for(let i = 1; i < filters.length; i++){
            const filter = filters[i];
            resolution = Math.min(resolution, filter.resolution || currentResolution), multisample = Math.min(multisample, filter.multisample ?? currentMultisample), padding = this.useMaxPadding ? Math.max(padding, filter.padding) : padding + filter.padding, autoFit = autoFit && filter.autoFit, legacy = legacy || (filter.legacy ?? !0);
        }
        filterStack.length === 1 && (this.defaultFilterStack[0].renderTexture = renderTextureSystem.current), filterStack.push(state), state.resolution = resolution, state.multisample = multisample, state.legacy = legacy, state.target = target, state.sourceFrame.copyFrom(target.filterArea || target.getBounds(!0)), state.sourceFrame.pad(padding);
        const sourceFrameProjected = this.tempRect.copyFrom(renderTextureSystem.sourceFrame);
        renderer.projection.transform && this.transformAABB(tempMatrix.copyFrom(renderer.projection.transform).invert(), sourceFrameProjected), autoFit ? (state.sourceFrame.fit(sourceFrameProjected), (state.sourceFrame.width <= 0 || state.sourceFrame.height <= 0) && (state.sourceFrame.width = 0, state.sourceFrame.height = 0)) : state.sourceFrame.intersects(sourceFrameProjected) || (state.sourceFrame.width = 0, state.sourceFrame.height = 0), this.roundFrame(state.sourceFrame, renderTextureSystem.current ? renderTextureSystem.current.resolution : renderer.resolution, renderTextureSystem.sourceFrame, renderTextureSystem.destinationFrame, renderer.projection.transform), state.renderTexture = this.getOptimalFilterTexture(state.sourceFrame.width, state.sourceFrame.height, resolution, multisample), state.filters = filters, state.destinationFrame.width = state.renderTexture.width, state.destinationFrame.height = state.renderTexture.height;
        const destinationFrame = this.tempRect;
        destinationFrame.x = 0, destinationFrame.y = 0, destinationFrame.width = state.sourceFrame.width, destinationFrame.height = state.sourceFrame.height, state.renderTexture.filterFrame = state.sourceFrame, state.bindingSourceFrame.copyFrom(renderTextureSystem.sourceFrame), state.bindingDestinationFrame.copyFrom(renderTextureSystem.destinationFrame), state.transform = renderer.projection.transform, renderer.projection.transform = null, renderTextureSystem.bind(state.renderTexture, state.sourceFrame, destinationFrame), renderer.framebuffer.clear(0, 0, 0, 0);
    }
    /** Pops off the filter and applies it. */ pop() {
        const filterStack = this.defaultFilterStack, state = filterStack.pop(), filters = state.filters;
        this.activeState = state;
        const globalUniforms = this.globalUniforms.uniforms;
        globalUniforms.outputFrame = state.sourceFrame, globalUniforms.resolution = state.resolution;
        const inputSize = globalUniforms.inputSize, inputPixel = globalUniforms.inputPixel, inputClamp = globalUniforms.inputClamp;
        if (inputSize[0] = state.destinationFrame.width, inputSize[1] = state.destinationFrame.height, inputSize[2] = 1 / inputSize[0], inputSize[3] = 1 / inputSize[1], inputPixel[0] = Math.round(inputSize[0] * state.resolution), inputPixel[1] = Math.round(inputSize[1] * state.resolution), inputPixel[2] = 1 / inputPixel[0], inputPixel[3] = 1 / inputPixel[1], inputClamp[0] = 0.5 * inputPixel[2], inputClamp[1] = 0.5 * inputPixel[3], inputClamp[2] = state.sourceFrame.width * inputSize[2] - 0.5 * inputPixel[2], inputClamp[3] = state.sourceFrame.height * inputSize[3] - 0.5 * inputPixel[3], state.legacy) {
            const filterArea = globalUniforms.filterArea;
            filterArea[0] = state.destinationFrame.width, filterArea[1] = state.destinationFrame.height, filterArea[2] = state.sourceFrame.x, filterArea[3] = state.sourceFrame.y, globalUniforms.filterClamp = globalUniforms.inputClamp;
        }
        this.globalUniforms.update();
        const lastState = filterStack[filterStack.length - 1];
        if (this.renderer.framebuffer.blit(), filters.length === 1) filters[0].apply(this, state.renderTexture, lastState.renderTexture, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLEAR_MODES"].BLEND, state), this.returnFilterTexture(state.renderTexture);
        else {
            let flip = state.renderTexture, flop = this.getOptimalFilterTexture(flip.width, flip.height, state.resolution);
            flop.filterFrame = flip.filterFrame;
            let i = 0;
            for(i = 0; i < filters.length - 1; ++i){
                i === 1 && state.multisample > 1 && (flop = this.getOptimalFilterTexture(flip.width, flip.height, state.resolution), flop.filterFrame = flip.filterFrame), filters[i].apply(this, flip, flop, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLEAR_MODES"].CLEAR, state);
                const t = flip;
                flip = flop, flop = t;
            }
            filters[i].apply(this, flip, lastState.renderTexture, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLEAR_MODES"].BLEND, state), i > 1 && state.multisample > 1 && this.returnFilterTexture(state.renderTexture), this.returnFilterTexture(flip), this.returnFilterTexture(flop);
        }
        state.clear(), this.statePool.push(state);
    }
    /**
   * Binds a renderTexture with corresponding `filterFrame`, clears it if mode corresponds.
   * @param filterTexture - renderTexture to bind, should belong to filter pool or filter stack
   * @param clearMode - clearMode, by default its CLEAR/YES. See {@link PIXI.CLEAR_MODES}
   */ bindAndClear(filterTexture, clearMode = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLEAR_MODES"].CLEAR) {
        const { renderTexture: renderTextureSystem, state: stateSystem } = this.renderer;
        if (filterTexture === this.defaultFilterStack[this.defaultFilterStack.length - 1].renderTexture ? this.renderer.projection.transform = this.activeState.transform : this.renderer.projection.transform = null, filterTexture?.filterFrame) {
            const destinationFrame = this.tempRect;
            destinationFrame.x = 0, destinationFrame.y = 0, destinationFrame.width = filterTexture.filterFrame.width, destinationFrame.height = filterTexture.filterFrame.height, renderTextureSystem.bind(filterTexture, filterTexture.filterFrame, destinationFrame);
        } else filterTexture !== this.defaultFilterStack[this.defaultFilterStack.length - 1].renderTexture ? renderTextureSystem.bind(filterTexture) : this.renderer.renderTexture.bind(filterTexture, this.activeState.bindingSourceFrame, this.activeState.bindingDestinationFrame);
        const autoClear = stateSystem.stateId & 1 || this.forceClear;
        (clearMode === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLEAR_MODES"].CLEAR || clearMode === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLEAR_MODES"].BLIT && autoClear) && this.renderer.framebuffer.clear(0, 0, 0, 0);
    }
    /**
   * Draws a filter using the default rendering process.
   *
   * This should be called only by {@link PIXI.Filter#apply}.
   * @param filter - The filter to draw.
   * @param input - The input render target.
   * @param output - The target to output to.
   * @param clearMode - Should the output be cleared before rendering to it
   */ applyFilter(filter, input, output, clearMode) {
        const renderer = this.renderer;
        renderer.state.set(filter.state), this.bindAndClear(output, clearMode), filter.uniforms.uSampler = input, filter.uniforms.filterGlobals = this.globalUniforms, renderer.shader.bind(filter), filter.legacy = !!filter.program.attributeData.aTextureCoord, filter.legacy ? (this.quadUv.map(input._frame, input.filterFrame), renderer.geometry.bind(this.quadUv), renderer.geometry.draw(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DRAW_MODES"].TRIANGLES)) : (renderer.geometry.bind(this.quad), renderer.geometry.draw(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DRAW_MODES"].TRIANGLE_STRIP));
    }
    /**
   * Multiply _input normalized coordinates_ to this matrix to get _sprite texture normalized coordinates_.
   *
   * Use `outputMatrix * vTextureCoord` in the shader.
   * @param outputMatrix - The matrix to output to.
   * @param {PIXI.Sprite} sprite - The sprite to map to.
   * @returns The mapped matrix.
   */ calculateSpriteMatrix(outputMatrix, sprite) {
        const { sourceFrame, destinationFrame } = this.activeState, { orig } = sprite._texture, mappedMatrix = outputMatrix.set(destinationFrame.width, 0, 0, destinationFrame.height, sourceFrame.x, sourceFrame.y), worldTransform = sprite.worldTransform.copyTo(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"].TEMP_MATRIX);
        return worldTransform.invert(), mappedMatrix.prepend(worldTransform), mappedMatrix.scale(1 / orig.width, 1 / orig.height), mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y), mappedMatrix;
    }
    /** Destroys this Filter System. */ destroy() {
        this.renderer = null, this.texturePool.clear(!1);
    }
    /**
   * Gets a Power-of-Two render texture or fullScreen texture
   * @param minWidth - The minimum width of the render texture in real pixels.
   * @param minHeight - The minimum height of the render texture in real pixels.
   * @param resolution - The resolution of the render texture.
   * @param multisample - Number of samples of the render texture.
   * @returns - The new render texture.
   */ getOptimalFilterTexture(minWidth, minHeight, resolution = 1, multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE) {
        return this.texturePool.getOptimalTexture(minWidth, minHeight, resolution, multisample);
    }
    /**
   * Gets extra render texture to use inside current filter
   * To be compliant with older filters, you can use params in any order
   * @param input - renderTexture from which size and resolution will be copied
   * @param resolution - override resolution of the renderTexture
   * @param multisample - number of samples of the renderTexture
   */ getFilterTexture(input, resolution, multisample) {
        if (typeof input == "number") {
            const swap = input;
            input = resolution, resolution = swap;
        }
        input = input || this.activeState.renderTexture;
        const filterTexture = this.texturePool.getOptimalTexture(input.width, input.height, resolution || input.resolution, multisample || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE);
        return filterTexture.filterFrame = input.filterFrame, filterTexture;
    }
    /**
   * Frees a render texture back into the pool.
   * @param renderTexture - The renderTarget to free
   */ returnFilterTexture(renderTexture) {
        this.texturePool.returnTexture(renderTexture);
    }
    /** Empties the texture pool. */ emptyPool() {
        this.texturePool.clear(!0);
    }
    /** Calls `texturePool.resize()`, affects fullScreen renderTextures. */ resize() {
        this.texturePool.setScreenSize(this.renderer.view);
    }
    /**
   * @param matrix - first param
   * @param rect - second param
   */ transformAABB(matrix, rect) {
        const lt = tempPoints[0], lb = tempPoints[1], rt = tempPoints[2], rb = tempPoints[3];
        lt.set(rect.left, rect.top), lb.set(rect.left, rect.bottom), rt.set(rect.right, rect.top), rb.set(rect.right, rect.bottom), matrix.apply(lt, lt), matrix.apply(lb, lb), matrix.apply(rt, rt), matrix.apply(rb, rb);
        const x0 = Math.min(lt.x, lb.x, rt.x, rb.x), y0 = Math.min(lt.y, lb.y, rt.y, rb.y), x1 = Math.max(lt.x, lb.x, rt.x, rb.x), y1 = Math.max(lt.y, lb.y, rt.y, rb.y);
        rect.x = x0, rect.y = y0, rect.width = x1 - x0, rect.height = y1 - y0;
    }
    roundFrame(frame, resolution, bindingSourceFrame, bindingDestinationFrame, transform) {
        if (!(frame.width <= 0 || frame.height <= 0 || bindingSourceFrame.width <= 0 || bindingSourceFrame.height <= 0)) {
            if (transform) {
                const { a, b, c, d } = transform;
                if ((Math.abs(b) > 1e-4 || Math.abs(c) > 1e-4) && (Math.abs(a) > 1e-4 || Math.abs(d) > 1e-4)) return;
            }
            transform = transform ? tempMatrix.copyFrom(transform) : tempMatrix.identity(), transform.translate(-bindingSourceFrame.x, -bindingSourceFrame.y).scale(bindingDestinationFrame.width / bindingSourceFrame.width, bindingDestinationFrame.height / bindingSourceFrame.height).translate(bindingDestinationFrame.x, bindingDestinationFrame.y), this.transformAABB(transform, frame), frame.ceil(resolution), this.transformAABB(transform.invert(), frame);
        }
    }
}
FilterSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "filter"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(FilterSystem);
;
 //# sourceMappingURL=FilterSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/GLFramebuffer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GLFramebuffer",
    ()=>GLFramebuffer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
;
class GLFramebuffer {
    constructor(framebuffer){
        this.framebuffer = framebuffer, this.stencil = null, this.dirtyId = -1, this.dirtyFormat = -1, this.dirtySize = -1, this.multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE, this.msaaBuffer = null, this.blitFramebuffer = null, this.mipLevel = 0;
    }
}
;
 //# sourceMappingURL=GLFramebuffer.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/FramebufferSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FramebufferSystem",
    ()=>FramebufferSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/shapes/Rectangle.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$Framebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/Framebuffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$GLFramebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/GLFramebuffer.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
const tempRectangle = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"]();
class FramebufferSystem {
    /**
   * @param renderer - The renderer this System works for.
   */ constructor(renderer){
        this.renderer = renderer, this.managedFramebuffers = [], this.unknownFramebuffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$Framebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Framebuffer"](10, 10), this.msaaSamples = null;
    }
    /** Sets up the renderer context and necessary buffers. */ contextChange() {
        this.disposeAll(!0);
        const gl = this.gl = this.renderer.gl;
        if (this.CONTEXT_UID = this.renderer.CONTEXT_UID, this.current = this.unknownFramebuffer, this.viewport = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](), this.hasMRT = !0, this.writeDepthTexture = !0, this.renderer.context.webGLVersion === 1) {
            let nativeDrawBuffersExtension = this.renderer.context.extensions.drawBuffers, nativeDepthTextureExtension = this.renderer.context.extensions.depthTexture;
            __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].PREFER_ENV === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].WEBGL_LEGACY && (nativeDrawBuffersExtension = null, nativeDepthTextureExtension = null), nativeDrawBuffersExtension ? gl.drawBuffers = (activeTextures)=>nativeDrawBuffersExtension.drawBuffersWEBGL(activeTextures) : (this.hasMRT = !1, gl.drawBuffers = ()=>{}), nativeDepthTextureExtension || (this.writeDepthTexture = !1);
        } else this.msaaSamples = gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA8, gl.SAMPLES);
    }
    /**
   * Bind a framebuffer.
   * @param framebuffer
   * @param frame - frame, default is framebuffer size
   * @param mipLevel - optional mip level to set on the framebuffer - defaults to 0
   */ bind(framebuffer, frame, mipLevel = 0) {
        const { gl } = this;
        if (framebuffer) {
            const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID] || this.initFramebuffer(framebuffer);
            this.current !== framebuffer && (this.current = framebuffer, gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer)), fbo.mipLevel !== mipLevel && (framebuffer.dirtyId++, framebuffer.dirtyFormat++, fbo.mipLevel = mipLevel), fbo.dirtyId !== framebuffer.dirtyId && (fbo.dirtyId = framebuffer.dirtyId, fbo.dirtyFormat !== framebuffer.dirtyFormat ? (fbo.dirtyFormat = framebuffer.dirtyFormat, fbo.dirtySize = framebuffer.dirtySize, this.updateFramebuffer(framebuffer, mipLevel)) : fbo.dirtySize !== framebuffer.dirtySize && (fbo.dirtySize = framebuffer.dirtySize, this.resizeFramebuffer(framebuffer)));
            for(let i = 0; i < framebuffer.colorTextures.length; i++){
                const tex = framebuffer.colorTextures[i];
                this.renderer.texture.unbind(tex.parentTextureArray || tex);
            }
            if (framebuffer.depthTexture && this.renderer.texture.unbind(framebuffer.depthTexture), frame) {
                const mipWidth = frame.width >> mipLevel, mipHeight = frame.height >> mipLevel, scale = mipWidth / frame.width;
                this.setViewport(frame.x * scale, frame.y * scale, mipWidth, mipHeight);
            } else {
                const mipWidth = framebuffer.width >> mipLevel, mipHeight = framebuffer.height >> mipLevel;
                this.setViewport(0, 0, mipWidth, mipHeight);
            }
        } else this.current && (this.current = null, gl.bindFramebuffer(gl.FRAMEBUFFER, null)), frame ? this.setViewport(frame.x, frame.y, frame.width, frame.height) : this.setViewport(0, 0, this.renderer.width, this.renderer.height);
    }
    /**
   * Set the WebGLRenderingContext's viewport.
   * @param x - X position of viewport
   * @param y - Y position of viewport
   * @param width - Width of viewport
   * @param height - Height of viewport
   */ setViewport(x, y, width, height) {
        const v = this.viewport;
        x = Math.round(x), y = Math.round(y), width = Math.round(width), height = Math.round(height), (v.width !== width || v.height !== height || v.x !== x || v.y !== y) && (v.x = x, v.y = y, v.width = width, v.height = height, this.gl.viewport(x, y, width, height));
    }
    /**
   * Get the size of the current width and height. Returns object with `width` and `height` values.
   * @readonly
   */ get size() {
        return this.current ? {
            x: 0,
            y: 0,
            width: this.current.width,
            height: this.current.height
        } : {
            x: 0,
            y: 0,
            width: this.renderer.width,
            height: this.renderer.height
        };
    }
    /**
   * Clear the color of the context
   * @param r - Red value from 0 to 1
   * @param g - Green value from 0 to 1
   * @param b - Blue value from 0 to 1
   * @param a - Alpha value from 0 to 1
   * @param {PIXI.BUFFER_BITS} [mask=BUFFER_BITS.COLOR | BUFFER_BITS.DEPTH] - Bitwise OR of masks
   *  that indicate the buffers to be cleared, by default COLOR and DEPTH buffers.
   */ clear(r, g, b, a, mask = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_BITS"].COLOR | __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_BITS"].DEPTH) {
        const { gl } = this;
        gl.clearColor(r, g, b, a), gl.clear(mask);
    }
    /**
   * Initialize framebuffer for this context
   * @protected
   * @param framebuffer
   * @returns - created GLFramebuffer
   */ initFramebuffer(framebuffer) {
        const { gl } = this, fbo = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$GLFramebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLFramebuffer"](gl.createFramebuffer());
        return fbo.multisample = this.detectSamples(framebuffer.multisample), framebuffer.glFramebuffers[this.CONTEXT_UID] = fbo, this.managedFramebuffers.push(framebuffer), framebuffer.disposeRunner.add(this), fbo;
    }
    /**
   * Resize the framebuffer
   * @param framebuffer
   * @protected
   */ resizeFramebuffer(framebuffer) {
        const { gl } = this, fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
        if (fbo.stencil) {
            gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);
            let stencilFormat;
            this.renderer.context.webGLVersion === 1 ? stencilFormat = gl.DEPTH_STENCIL : framebuffer.depth && framebuffer.stencil ? stencilFormat = gl.DEPTH24_STENCIL8 : framebuffer.depth ? stencilFormat = gl.DEPTH_COMPONENT24 : stencilFormat = gl.STENCIL_INDEX8, fbo.msaaBuffer ? gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, stencilFormat, framebuffer.width, framebuffer.height) : gl.renderbufferStorage(gl.RENDERBUFFER, stencilFormat, framebuffer.width, framebuffer.height);
        }
        const colorTextures = framebuffer.colorTextures;
        let count = colorTextures.length;
        gl.drawBuffers || (count = Math.min(count, 1));
        for(let i = 0; i < count; i++){
            const texture = colorTextures[i], parentTexture = texture.parentTextureArray || texture;
            this.renderer.texture.bind(parentTexture, 0), i === 0 && fbo.msaaBuffer && (gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer), gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, parentTexture._glTextures[this.CONTEXT_UID].internalFormat, framebuffer.width, framebuffer.height));
        }
        framebuffer.depthTexture && this.writeDepthTexture && this.renderer.texture.bind(framebuffer.depthTexture, 0);
    }
    /**
   * Update the framebuffer
   * @param framebuffer
   * @param mipLevel
   * @protected
   */ updateFramebuffer(framebuffer, mipLevel) {
        const { gl } = this, fbo = framebuffer.glFramebuffers[this.CONTEXT_UID], colorTextures = framebuffer.colorTextures;
        let count = colorTextures.length;
        gl.drawBuffers || (count = Math.min(count, 1)), fbo.multisample > 1 && this.canMultisampleFramebuffer(framebuffer) ? fbo.msaaBuffer = fbo.msaaBuffer || gl.createRenderbuffer() : fbo.msaaBuffer && (gl.deleteRenderbuffer(fbo.msaaBuffer), fbo.msaaBuffer = null, fbo.blitFramebuffer && (fbo.blitFramebuffer.dispose(), fbo.blitFramebuffer = null));
        const activeTextures = [];
        for(let i = 0; i < count; i++){
            const texture = colorTextures[i], parentTexture = texture.parentTextureArray || texture;
            this.renderer.texture.bind(parentTexture, 0), i === 0 && fbo.msaaBuffer ? (gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer), gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, parentTexture._glTextures[this.CONTEXT_UID].internalFormat, framebuffer.width, framebuffer.height), gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, fbo.msaaBuffer)) : (gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, texture.target, parentTexture._glTextures[this.CONTEXT_UID].texture, mipLevel), activeTextures.push(gl.COLOR_ATTACHMENT0 + i));
        }
        if (activeTextures.length > 1 && gl.drawBuffers(activeTextures), framebuffer.depthTexture && this.writeDepthTexture) {
            const depthTexture = framebuffer.depthTexture;
            this.renderer.texture.bind(depthTexture, 0), gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture._glTextures[this.CONTEXT_UID].texture, mipLevel);
        }
        if ((framebuffer.stencil || framebuffer.depth) && !(framebuffer.depthTexture && this.writeDepthTexture)) {
            fbo.stencil = fbo.stencil || gl.createRenderbuffer();
            let stencilAttachment, stencilFormat;
            this.renderer.context.webGLVersion === 1 ? (stencilAttachment = gl.DEPTH_STENCIL_ATTACHMENT, stencilFormat = gl.DEPTH_STENCIL) : framebuffer.depth && framebuffer.stencil ? (stencilAttachment = gl.DEPTH_STENCIL_ATTACHMENT, stencilFormat = gl.DEPTH24_STENCIL8) : framebuffer.depth ? (stencilAttachment = gl.DEPTH_ATTACHMENT, stencilFormat = gl.DEPTH_COMPONENT24) : (stencilAttachment = gl.STENCIL_ATTACHMENT, stencilFormat = gl.STENCIL_INDEX8), gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil), fbo.msaaBuffer ? gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, stencilFormat, framebuffer.width, framebuffer.height) : gl.renderbufferStorage(gl.RENDERBUFFER, stencilFormat, framebuffer.width, framebuffer.height), gl.framebufferRenderbuffer(gl.FRAMEBUFFER, stencilAttachment, gl.RENDERBUFFER, fbo.stencil);
        } else fbo.stencil && (gl.deleteRenderbuffer(fbo.stencil), fbo.stencil = null);
    }
    /**
   * Returns true if the frame buffer can be multisampled.
   * @param framebuffer
   */ canMultisampleFramebuffer(framebuffer) {
        return this.renderer.context.webGLVersion !== 1 && framebuffer.colorTextures.length <= 1 && !framebuffer.depthTexture;
    }
    /**
   * Detects number of samples that is not more than a param but as close to it as possible
   * @param samples - number of samples
   * @returns - recommended number of samples
   */ detectSamples(samples) {
        const { msaaSamples } = this;
        let res = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE;
        if (samples <= 1 || msaaSamples === null) return res;
        for(let i = 0; i < msaaSamples.length; i++)if (msaaSamples[i] <= samples) {
            res = msaaSamples[i];
            break;
        }
        return res === 1 && (res = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE), res;
    }
    /**
   * Only works with WebGL2
   *
   * blits framebuffer to another of the same or bigger size
   * after that target framebuffer is bound
   *
   * Fails with WebGL warning if blits multisample framebuffer to different size
   * @param framebuffer - by default it blits "into itself", from renderBuffer to texture.
   * @param sourcePixels - source rectangle in pixels
   * @param destPixels - dest rectangle in pixels, assumed to be the same as sourcePixels
   */ blit(framebuffer, sourcePixels, destPixels) {
        const { current, renderer, gl, CONTEXT_UID } = this;
        if (renderer.context.webGLVersion !== 2 || !current) return;
        const fbo = current.glFramebuffers[CONTEXT_UID];
        if (!fbo) return;
        if (!framebuffer) {
            if (!fbo.msaaBuffer) return;
            const colorTexture = current.colorTextures[0];
            if (!colorTexture) return;
            fbo.blitFramebuffer || (fbo.blitFramebuffer = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$Framebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Framebuffer"](current.width, current.height), fbo.blitFramebuffer.addColorTexture(0, colorTexture)), framebuffer = fbo.blitFramebuffer, framebuffer.colorTextures[0] !== colorTexture && (framebuffer.colorTextures[0] = colorTexture, framebuffer.dirtyId++, framebuffer.dirtyFormat++), (framebuffer.width !== current.width || framebuffer.height !== current.height) && (framebuffer.width = current.width, framebuffer.height = current.height, framebuffer.dirtyId++, framebuffer.dirtySize++);
        }
        sourcePixels || (sourcePixels = tempRectangle, sourcePixels.width = current.width, sourcePixels.height = current.height), destPixels || (destPixels = sourcePixels);
        const sameSize = sourcePixels.width === destPixels.width && sourcePixels.height === destPixels.height;
        this.bind(framebuffer), gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo.framebuffer), gl.blitFramebuffer(sourcePixels.left, sourcePixels.top, sourcePixels.right, sourcePixels.bottom, destPixels.left, destPixels.top, destPixels.right, destPixels.bottom, gl.COLOR_BUFFER_BIT, sameSize ? gl.NEAREST : gl.LINEAR), gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffer.glFramebuffers[this.CONTEXT_UID].framebuffer);
    }
    /**
   * Disposes framebuffer.
   * @param framebuffer - framebuffer that has to be disposed of
   * @param contextLost - If context was lost, we suppress all delete function calls
   */ disposeFramebuffer(framebuffer, contextLost) {
        const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID], gl = this.gl;
        if (!fbo) return;
        delete framebuffer.glFramebuffers[this.CONTEXT_UID];
        const index = this.managedFramebuffers.indexOf(framebuffer);
        index >= 0 && this.managedFramebuffers.splice(index, 1), framebuffer.disposeRunner.remove(this), contextLost || (gl.deleteFramebuffer(fbo.framebuffer), fbo.msaaBuffer && gl.deleteRenderbuffer(fbo.msaaBuffer), fbo.stencil && gl.deleteRenderbuffer(fbo.stencil)), fbo.blitFramebuffer && this.disposeFramebuffer(fbo.blitFramebuffer, contextLost);
    }
    /**
   * Disposes all framebuffers, but not textures bound to them.
   * @param [contextLost=false] - If context was lost, we suppress all delete function calls
   */ disposeAll(contextLost) {
        const list = this.managedFramebuffers;
        this.managedFramebuffers = [];
        for(let i = 0; i < list.length; i++)this.disposeFramebuffer(list[i], contextLost);
    }
    /**
   * Forcing creation of stencil buffer for current framebuffer, if it wasn't done before.
   * Used by MaskSystem, when its time to use stencil mask for Graphics element.
   *
   * Its an alternative for public lazy `framebuffer.enableStencil`, in case we need stencil without rebind.
   * @private
   */ forceStencil() {
        const framebuffer = this.current;
        if (!framebuffer) return;
        const fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
        if (!fbo || fbo.stencil && framebuffer.stencil) return;
        framebuffer.stencil = !0;
        const w = framebuffer.width, h = framebuffer.height, gl = this.gl, stencil = fbo.stencil = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, stencil);
        let stencilAttachment, stencilFormat;
        this.renderer.context.webGLVersion === 1 ? (stencilAttachment = gl.DEPTH_STENCIL_ATTACHMENT, stencilFormat = gl.DEPTH_STENCIL) : framebuffer.depth ? (stencilAttachment = gl.DEPTH_STENCIL_ATTACHMENT, stencilFormat = gl.DEPTH24_STENCIL8) : (stencilAttachment = gl.STENCIL_ATTACHMENT, stencilFormat = gl.STENCIL_INDEX8), fbo.msaaBuffer ? gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, stencilFormat, w, h) : gl.renderbufferStorage(gl.RENDERBUFFER, stencilFormat, w, h), gl.framebufferRenderbuffer(gl.FRAMEBUFFER, stencilAttachment, gl.RENDERBUFFER, stencil);
    }
    /** Resets framebuffer stored state, binds screen framebuffer. Should be called before renderTexture reset(). */ reset() {
        this.current = this.unknownFramebuffer, this.viewport = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"]();
    }
    destroy() {
        this.renderer = null;
    }
}
FramebufferSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "framebuffer"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(FramebufferSystem);
;
 //# sourceMappingURL=FramebufferSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/GeometrySystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GeometrySystem",
    ()=>GeometrySystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
;
;
;
const byteSizeMap = {
    5126: 4,
    5123: 2,
    5121: 1
};
class GeometrySystem {
    /** @param renderer - The renderer this System works for. */ constructor(renderer){
        this.renderer = renderer, this._activeGeometry = null, this._activeVao = null, this.hasVao = !0, this.hasInstance = !0, this.canUseUInt32ElementIndex = !1, this.managedGeometries = {};
    }
    /** Sets up the renderer context and necessary buffers. */ contextChange() {
        this.disposeAll(!0);
        const gl = this.gl = this.renderer.gl, context = this.renderer.context;
        if (this.CONTEXT_UID = this.renderer.CONTEXT_UID, context.webGLVersion !== 2) {
            let nativeVaoExtension = this.renderer.context.extensions.vertexArrayObject;
            __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].PREFER_ENV === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].WEBGL_LEGACY && (nativeVaoExtension = null), nativeVaoExtension ? (gl.createVertexArray = ()=>nativeVaoExtension.createVertexArrayOES(), gl.bindVertexArray = (vao)=>nativeVaoExtension.bindVertexArrayOES(vao), gl.deleteVertexArray = (vao)=>nativeVaoExtension.deleteVertexArrayOES(vao)) : (this.hasVao = !1, gl.createVertexArray = ()=>null, gl.bindVertexArray = ()=>null, gl.deleteVertexArray = ()=>null);
        }
        if (context.webGLVersion !== 2) {
            const instanceExt = gl.getExtension("ANGLE_instanced_arrays");
            instanceExt ? (gl.vertexAttribDivisor = (a, b)=>instanceExt.vertexAttribDivisorANGLE(a, b), gl.drawElementsInstanced = (a, b, c, d, e)=>instanceExt.drawElementsInstancedANGLE(a, b, c, d, e), gl.drawArraysInstanced = (a, b, c, d)=>instanceExt.drawArraysInstancedANGLE(a, b, c, d)) : this.hasInstance = !1;
        }
        this.canUseUInt32ElementIndex = context.webGLVersion === 2 || !!context.extensions.uint32ElementIndex;
    }
    /**
   * Binds geometry so that is can be drawn. Creating a Vao if required
   * @param geometry - Instance of geometry to bind.
   * @param shader - Instance of shader to use vao for.
   */ bind(geometry, shader) {
        shader = shader || this.renderer.shader.shader;
        const { gl } = this;
        let vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID], incRefCount = !1;
        vaos || (this.managedGeometries[geometry.id] = geometry, geometry.disposeRunner.add(this), geometry.glVertexArrayObjects[this.CONTEXT_UID] = vaos = {}, incRefCount = !0);
        const vao = vaos[shader.program.id] || this.initGeometryVao(geometry, shader, incRefCount);
        this._activeGeometry = geometry, this._activeVao !== vao && (this._activeVao = vao, this.hasVao ? gl.bindVertexArray(vao) : this.activateVao(geometry, shader.program)), this.updateBuffers();
    }
    /** Reset and unbind any active VAO and geometry. */ reset() {
        this.unbind();
    }
    /** Update buffers of the currently bound geometry. */ updateBuffers() {
        const geometry = this._activeGeometry, bufferSystem = this.renderer.buffer;
        for(let i = 0; i < geometry.buffers.length; i++){
            const buffer = geometry.buffers[i];
            bufferSystem.update(buffer);
        }
    }
    /**
   * Check compatibility between a geometry and a program
   * @param geometry - Geometry instance.
   * @param program - Program instance.
   */ checkCompatibility(geometry, program) {
        const geometryAttributes = geometry.attributes, shaderAttributes = program.attributeData;
        for(const j in shaderAttributes)if (!geometryAttributes[j]) throw new Error(`shader and geometry incompatible, geometry missing the "${j}" attribute`);
    }
    /**
   * Takes a geometry and program and generates a unique signature for them.
   * @param geometry - To get signature from.
   * @param program - To test geometry against.
   * @returns - Unique signature of the geometry and program
   */ getSignature(geometry, program) {
        const attribs = geometry.attributes, shaderAttributes = program.attributeData, strings = [
            "g",
            geometry.id
        ];
        for(const i in attribs)shaderAttributes[i] && strings.push(i, shaderAttributes[i].location);
        return strings.join("-");
    }
    /**
   * Creates or gets Vao with the same structure as the geometry and stores it on the geometry.
   * If vao is created, it is bound automatically. We use a shader to infer what and how to set up the
   * attribute locations.
   * @param geometry - Instance of geometry to to generate Vao for.
   * @param shader - Instance of the shader.
   * @param incRefCount - Increment refCount of all geometry buffers.
   */ initGeometryVao(geometry, shader, incRefCount = !0) {
        const gl = this.gl, CONTEXT_UID = this.CONTEXT_UID, bufferSystem = this.renderer.buffer, program = shader.program;
        program.glPrograms[CONTEXT_UID] || this.renderer.shader.generateProgram(shader), this.checkCompatibility(geometry, program);
        const signature = this.getSignature(geometry, program), vaoObjectHash = geometry.glVertexArrayObjects[this.CONTEXT_UID];
        let vao = vaoObjectHash[signature];
        if (vao) return vaoObjectHash[program.id] = vao, vao;
        const buffers = geometry.buffers, attributes = geometry.attributes, tempStride = {}, tempStart = {};
        for(const j in buffers)tempStride[j] = 0, tempStart[j] = 0;
        for(const j in attributes)!attributes[j].size && program.attributeData[j] ? attributes[j].size = program.attributeData[j].size : attributes[j].size || console.warn(`PIXI Geometry attribute '${j}' size cannot be determined (likely the bound shader does not have the attribute)`), tempStride[attributes[j].buffer] += attributes[j].size * byteSizeMap[attributes[j].type];
        for(const j in attributes){
            const attribute = attributes[j], attribSize = attribute.size;
            attribute.stride === void 0 && (tempStride[attribute.buffer] === attribSize * byteSizeMap[attribute.type] ? attribute.stride = 0 : attribute.stride = tempStride[attribute.buffer]), attribute.start === void 0 && (attribute.start = tempStart[attribute.buffer], tempStart[attribute.buffer] += attribSize * byteSizeMap[attribute.type]);
        }
        vao = gl.createVertexArray(), gl.bindVertexArray(vao);
        for(let i = 0; i < buffers.length; i++){
            const buffer = buffers[i];
            bufferSystem.bind(buffer), incRefCount && buffer._glBuffers[CONTEXT_UID].refCount++;
        }
        return this.activateVao(geometry, program), vaoObjectHash[program.id] = vao, vaoObjectHash[signature] = vao, gl.bindVertexArray(null), bufferSystem.unbind(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_TYPE"].ARRAY_BUFFER), vao;
    }
    /**
   * Disposes geometry.
   * @param geometry - Geometry with buffers. Only VAO will be disposed
   * @param [contextLost=false] - If context was lost, we suppress deleteVertexArray
   */ disposeGeometry(geometry, contextLost) {
        if (!this.managedGeometries[geometry.id]) return;
        delete this.managedGeometries[geometry.id];
        const vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID], gl = this.gl, buffers = geometry.buffers, bufferSystem = this.renderer?.buffer;
        if (geometry.disposeRunner.remove(this), !!vaos) {
            if (bufferSystem) for(let i = 0; i < buffers.length; i++){
                const buf = buffers[i]._glBuffers[this.CONTEXT_UID];
                buf && (buf.refCount--, buf.refCount === 0 && !contextLost && bufferSystem.dispose(buffers[i], contextLost));
            }
            if (!contextLost) {
                for(const vaoId in vaos)if (vaoId[0] === "g") {
                    const vao = vaos[vaoId];
                    this._activeVao === vao && this.unbind(), gl.deleteVertexArray(vao);
                }
            }
            delete geometry.glVertexArrayObjects[this.CONTEXT_UID];
        }
    }
    /**
   * Dispose all WebGL resources of all managed geometries.
   * @param [contextLost=false] - If context was lost, we suppress `gl.delete` calls
   */ disposeAll(contextLost) {
        const all = Object.keys(this.managedGeometries);
        for(let i = 0; i < all.length; i++)this.disposeGeometry(this.managedGeometries[all[i]], contextLost);
    }
    /**
   * Activate vertex array object.
   * @param geometry - Geometry instance.
   * @param program - Shader program instance.
   */ activateVao(geometry, program) {
        const gl = this.gl, CONTEXT_UID = this.CONTEXT_UID, bufferSystem = this.renderer.buffer, buffers = geometry.buffers, attributes = geometry.attributes;
        geometry.indexBuffer && bufferSystem.bind(geometry.indexBuffer);
        let lastBuffer = null;
        for(const j in attributes){
            const attribute = attributes[j], buffer = buffers[attribute.buffer], glBuffer = buffer._glBuffers[CONTEXT_UID];
            if (program.attributeData[j]) {
                lastBuffer !== glBuffer && (bufferSystem.bind(buffer), lastBuffer = glBuffer);
                const location = program.attributeData[j].location;
                if (gl.enableVertexAttribArray(location), gl.vertexAttribPointer(location, attribute.size, attribute.type || gl.FLOAT, attribute.normalized, attribute.stride, attribute.start), attribute.instance) if (this.hasInstance) gl.vertexAttribDivisor(location, attribute.divisor);
                else throw new Error("geometry error, GPU Instancing is not supported on this device");
            }
        }
    }
    /**
   * Draws the currently bound geometry.
   * @param type - The type primitive to render.
   * @param size - The number of elements to be rendered. If not specified, all vertices after the
   *  starting vertex will be drawn.
   * @param start - The starting vertex in the geometry to start drawing from. If not specified,
   *  drawing will start from the first vertex.
   * @param instanceCount - The number of instances of the set of elements to execute. If not specified,
   *  all instances will be drawn.
   */ draw(type, size, start, instanceCount) {
        const { gl } = this, geometry = this._activeGeometry;
        if (geometry.indexBuffer) {
            const byteSize = geometry.indexBuffer.data.BYTES_PER_ELEMENT, glType = byteSize === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
            byteSize === 2 || byteSize === 4 && this.canUseUInt32ElementIndex ? geometry.instanced ? gl.drawElementsInstanced(type, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize, instanceCount || 1) : gl.drawElements(type, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize) : console.warn("unsupported index buffer type: uint32");
        } else geometry.instanced ? gl.drawArraysInstanced(type, start, size || geometry.getSize(), instanceCount || 1) : gl.drawArrays(type, start, size || geometry.getSize());
        return this;
    }
    /** Unbind/reset everything. */ unbind() {
        this.gl.bindVertexArray(null), this._activeVao = null, this._activeGeometry = null;
    }
    destroy() {
        this.renderer = null;
    }
}
GeometrySystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "geometry"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(GeometrySystem);
;
 //# sourceMappingURL=GeometrySystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureMatrix.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TextureMatrix",
    ()=>TextureMatrix
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Matrix.mjs [app-client] (ecmascript)");
;
const tempMat = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"]();
class TextureMatrix {
    /**
   * @param texture - observed texture
   * @param clampMargin - Changes frame clamping, 0.5 by default. Use -0.5 for extra border.
   */ constructor(texture, clampMargin){
        this._texture = texture, this.mapCoord = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"](), this.uClampFrame = new Float32Array(4), this.uClampOffset = new Float32Array(2), this._textureID = -1, this._updateID = 0, this.clampOffset = 0, this.clampMargin = typeof clampMargin > "u" ? 0.5 : clampMargin, this.isSimple = !1;
    }
    /** Texture property. */ get texture() {
        return this._texture;
    }
    set texture(value) {
        this._texture = value, this._textureID = -1;
    }
    /**
   * Multiplies uvs array to transform
   * @param uvs - mesh uvs
   * @param [out=uvs] - output
   * @returns - output
   */ multiplyUvs(uvs, out) {
        out === void 0 && (out = uvs);
        const mat = this.mapCoord;
        for(let i = 0; i < uvs.length; i += 2){
            const x = uvs[i], y = uvs[i + 1];
            out[i] = x * mat.a + y * mat.c + mat.tx, out[i + 1] = x * mat.b + y * mat.d + mat.ty;
        }
        return out;
    }
    /**
   * Updates matrices if texture was changed.
   * @param [forceUpdate=false] - if true, matrices will be updated any case
   * @returns - Whether or not it was updated
   */ update(forceUpdate) {
        const tex = this._texture;
        if (!tex || !tex.valid || !forceUpdate && this._textureID === tex._updateID) return !1;
        this._textureID = tex._updateID, this._updateID++;
        const uvs = tex._uvs;
        this.mapCoord.set(uvs.x1 - uvs.x0, uvs.y1 - uvs.y0, uvs.x3 - uvs.x0, uvs.y3 - uvs.y0, uvs.x0, uvs.y0);
        const orig = tex.orig, trim = tex.trim;
        trim && (tempMat.set(orig.width / trim.width, 0, 0, orig.height / trim.height, -trim.x / trim.width, -trim.y / trim.height), this.mapCoord.append(tempMat));
        const texBase = tex.baseTexture, frame = this.uClampFrame, margin = this.clampMargin / texBase.resolution, offset = this.clampOffset;
        return frame[0] = (tex._frame.x + margin + offset) / texBase.width, frame[1] = (tex._frame.y + margin + offset) / texBase.height, frame[2] = (tex._frame.x + tex._frame.width - margin + offset) / texBase.width, frame[3] = (tex._frame.y + tex._frame.height - margin + offset) / texBase.height, this.uClampOffset[0] = offset / texBase.realWidth, this.uClampOffset[1] = offset / texBase.realHeight, this.isSimple = tex._frame.width === texBase.width && tex._frame.height === texBase.height && tex.rotate === 0, !0;
    }
}
;
 //# sourceMappingURL=TextureMatrix.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/spriteMask/spriteMaskFilter.frag.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>fragment
]);
var fragment = `varying vec2 vMaskCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D mask;
uniform float alpha;
uniform float npmAlpha;
uniform vec4 maskClamp;

void main(void)
{
    float clip = step(3.5,
        step(maskClamp.x, vMaskCoord.x) +
        step(maskClamp.y, vMaskCoord.y) +
        step(vMaskCoord.x, maskClamp.z) +
        step(vMaskCoord.y, maskClamp.w));

    vec4 original = texture2D(uSampler, vTextureCoord);
    vec4 masky = texture2D(mask, vMaskCoord);
    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);

    original *= (alphaMul * masky.r * alpha * clip);

    gl_FragColor = original;
}
`;
;
 //# sourceMappingURL=spriteMaskFilter.frag.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/spriteMask/spriteMaskFilter.vert.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>vertex
]);
var vertex = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 otherMatrix;

varying vec2 vMaskCoord;
varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aTextureCoord;
    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;
}
`;
;
 //# sourceMappingURL=spriteMaskFilter.vert.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/spriteMask/SpriteMaskFilter.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SpriteMaskFilter",
    ()=>SpriteMaskFilter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Matrix.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureMatrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureMatrix.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/Filter.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$spriteMask$2f$spriteMaskFilter$2e$frag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/spriteMask/spriteMaskFilter.frag.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$spriteMask$2f$spriteMaskFilter$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/spriteMask/spriteMaskFilter.vert.mjs [app-client] (ecmascript)");
;
;
;
;
;
class SpriteMaskFilter extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Filter"] {
    /** @ignore */ constructor(vertexSrc, fragmentSrc, uniforms){
        let sprite = null;
        typeof vertexSrc != "string" && fragmentSrc === void 0 && uniforms === void 0 && (sprite = vertexSrc, vertexSrc = void 0, fragmentSrc = void 0, uniforms = void 0), super(vertexSrc || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$spriteMask$2f$spriteMaskFilter$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], fragmentSrc || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$spriteMask$2f$spriteMaskFilter$2e$frag$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], uniforms), this.maskSprite = sprite, this.maskMatrix = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"]();
    }
    /**
   * Sprite mask
   * @type {PIXI.DisplayObject}
   */ get maskSprite() {
        return this._maskSprite;
    }
    set maskSprite(value) {
        this._maskSprite = value, this._maskSprite && (this._maskSprite.renderable = !1);
    }
    /**
   * Applies the filter
   * @param filterManager - The renderer to retrieve the filter from
   * @param input - The input render target.
   * @param output - The target to output to.
   * @param clearMode - Should the output be cleared before rendering to it.
   */ apply(filterManager, input, output, clearMode) {
        const maskSprite = this._maskSprite, tex = maskSprite._texture;
        tex.valid && (tex.uvMatrix || (tex.uvMatrix = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureMatrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureMatrix"](tex, 0)), tex.uvMatrix.update(), this.uniforms.npmAlpha = tex.baseTexture.alphaMode ? 0 : 1, this.uniforms.mask = tex, this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite).prepend(tex.uvMatrix.mapCoord), this.uniforms.alpha = maskSprite.worldAlpha, this.uniforms.maskClamp = tex.uvMatrix.uClampFrame, filterManager.applyFilter(this, input, output, clearMode));
    }
}
;
 //# sourceMappingURL=SpriteMaskFilter.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/MaskData.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MaskData",
    ()=>MaskData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/Filter.mjs [app-client] (ecmascript)");
;
;
class MaskData {
    /**
   * Create MaskData
   * @param {PIXI.DisplayObject} [maskObject=null] - object that describes the mask
   */ constructor(maskObject = null){
        this.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].NONE, this.autoDetect = !0, this.maskObject = maskObject || null, this.pooled = !1, this.isMaskData = !0, this.resolution = null, this.multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Filter"].defaultMultisample, this.enabled = !0, this.colorMask = 15, this._filters = null, this._stencilCounter = 0, this._scissorCounter = 0, this._scissorRect = null, this._scissorRectLocal = null, this._colorMask = 15, this._target = null;
    }
    /**
   * The sprite mask filter.
   * If set to `null`, the default sprite mask filter is used.
   * @default null
   */ get filter() {
        return this._filters ? this._filters[0] : null;
    }
    set filter(value) {
        value ? this._filters ? this._filters[0] = value : this._filters = [
            value
        ] : this._filters = null;
    }
    /** Resets the mask data after popMask(). */ reset() {
        this.pooled && (this.maskObject = null, this.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].NONE, this.autoDetect = !0), this._target = null, this._scissorRectLocal = null;
    }
    /**
   * Copies counters from maskData above, called from pushMask().
   * @param maskAbove
   */ copyCountersOrReset(maskAbove) {
        maskAbove ? (this._stencilCounter = maskAbove._stencilCounter, this._scissorCounter = maskAbove._scissorCounter, this._scissorRect = maskAbove._scissorRect) : (this._stencilCounter = 0, this._scissorCounter = 0, this._scissorRect = null);
    }
}
;
 //# sourceMappingURL=MaskData.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/MaskSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MaskSystem",
    ()=>MaskSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$spriteMask$2f$SpriteMaskFilter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/spriteMask/SpriteMaskFilter.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$MaskData$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/MaskData.mjs [app-client] (ecmascript)");
;
;
;
;
class MaskSystem {
    /**
   * @param renderer - The renderer this System works for.
   */ constructor(renderer){
        this.renderer = renderer, this.enableScissor = !0, this.alphaMaskPool = [], this.maskDataPool = [], this.maskStack = [], this.alphaMaskIndex = 0;
    }
    /**
   * Changes the mask stack that is used by this System.
   * @param maskStack - The mask stack
   */ setMaskStack(maskStack) {
        this.maskStack = maskStack, this.renderer.scissor.setMaskStack(maskStack), this.renderer.stencil.setMaskStack(maskStack);
    }
    /**
   * Enables the mask and appends it to the current mask stack.
   *
   * NOTE: The batch renderer should be flushed beforehand to prevent pending renders from being masked.
   * @param {PIXI.DisplayObject} target - Display Object to push the mask to
   * @param {PIXI.MaskData|PIXI.Sprite|PIXI.Graphics|PIXI.DisplayObject} maskDataOrTarget - The masking data.
   */ push(target, maskDataOrTarget) {
        let maskData = maskDataOrTarget;
        if (!maskData.isMaskData) {
            const d = this.maskDataPool.pop() || new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$MaskData$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MaskData"]();
            d.pooled = !0, d.maskObject = maskDataOrTarget, maskData = d;
        }
        const maskAbove = this.maskStack.length !== 0 ? this.maskStack[this.maskStack.length - 1] : null;
        if (maskData.copyCountersOrReset(maskAbove), maskData._colorMask = maskAbove ? maskAbove._colorMask : 15, maskData.autoDetect && this.detect(maskData), maskData._target = target, maskData.type !== __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].SPRITE && this.maskStack.push(maskData), maskData.enabled) switch(maskData.type){
            case __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].SCISSOR:
                this.renderer.scissor.push(maskData);
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].STENCIL:
                this.renderer.stencil.push(maskData);
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].SPRITE:
                maskData.copyCountersOrReset(null), this.pushSpriteMask(maskData);
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].COLOR:
                this.pushColorMask(maskData);
                break;
            default:
                break;
        }
        maskData.type === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].SPRITE && this.maskStack.push(maskData);
    }
    /**
   * Removes the last mask from the mask stack and doesn't return it.
   *
   * NOTE: The batch renderer should be flushed beforehand to render the masked contents before the mask is removed.
   * @param {PIXI.IMaskTarget} target - Display Object to pop the mask from
   */ pop(target) {
        const maskData = this.maskStack.pop();
        if (!(!maskData || maskData._target !== target)) {
            if (maskData.enabled) switch(maskData.type){
                case __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].SCISSOR:
                    this.renderer.scissor.pop(maskData);
                    break;
                case __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].STENCIL:
                    this.renderer.stencil.pop(maskData.maskObject);
                    break;
                case __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].SPRITE:
                    this.popSpriteMask(maskData);
                    break;
                case __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].COLOR:
                    this.popColorMask(maskData);
                    break;
                default:
                    break;
            }
            if (maskData.reset(), maskData.pooled && this.maskDataPool.push(maskData), this.maskStack.length !== 0) {
                const maskCurrent = this.maskStack[this.maskStack.length - 1];
                maskCurrent.type === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].SPRITE && maskCurrent._filters && (maskCurrent._filters[0].maskSprite = maskCurrent.maskObject);
            }
        }
    }
    /**
   * Sets type of MaskData based on its maskObject.
   * @param maskData
   */ detect(maskData) {
        const maskObject = maskData.maskObject;
        maskObject ? maskObject.isSprite ? maskData.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].SPRITE : this.enableScissor && this.renderer.scissor.testScissor(maskData) ? maskData.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].SCISSOR : maskData.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].STENCIL : maskData.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"].COLOR;
    }
    /**
   * Applies the Mask and adds it to the current filter stack.
   * @param maskData - Sprite to be used as the mask.
   */ pushSpriteMask(maskData) {
        const { maskObject } = maskData, target = maskData._target;
        let alphaMaskFilter = maskData._filters;
        alphaMaskFilter || (alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex], alphaMaskFilter || (alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [
            new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$spriteMask$2f$SpriteMaskFilter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SpriteMaskFilter"]()
        ])), alphaMaskFilter[0].resolution = maskData.resolution, alphaMaskFilter[0].multisample = maskData.multisample, alphaMaskFilter[0].maskSprite = maskObject;
        const stashFilterArea = target.filterArea;
        target.filterArea = maskObject.getBounds(!0), this.renderer.filter.push(target, alphaMaskFilter), target.filterArea = stashFilterArea, maskData._filters || this.alphaMaskIndex++;
    }
    /**
   * Removes the last filter from the filter stack and doesn't return it.
   * @param maskData - Sprite to be used as the mask.
   */ popSpriteMask(maskData) {
        this.renderer.filter.pop(), maskData._filters ? maskData._filters[0].maskSprite = null : (this.alphaMaskIndex--, this.alphaMaskPool[this.alphaMaskIndex][0].maskSprite = null);
    }
    /**
   * Pushes the color mask.
   * @param maskData - The mask data
   */ pushColorMask(maskData) {
        const currColorMask = maskData._colorMask, nextColorMask = maskData._colorMask = currColorMask & maskData.colorMask;
        nextColorMask !== currColorMask && this.renderer.gl.colorMask((nextColorMask & 1) !== 0, (nextColorMask & 2) !== 0, (nextColorMask & 4) !== 0, (nextColorMask & 8) !== 0);
    }
    /**
   * Pops the color mask.
   * @param maskData - The mask data
   */ popColorMask(maskData) {
        const currColorMask = maskData._colorMask, nextColorMask = this.maskStack.length > 0 ? this.maskStack[this.maskStack.length - 1]._colorMask : 15;
        nextColorMask !== currColorMask && this.renderer.gl.colorMask((nextColorMask & 1) !== 0, (nextColorMask & 2) !== 0, (nextColorMask & 4) !== 0, (nextColorMask & 8) !== 0);
    }
    destroy() {
        this.renderer = null;
    }
}
MaskSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "mask"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(MaskSystem);
;
 //# sourceMappingURL=MaskSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/AbstractMaskSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AbstractMaskSystem",
    ()=>AbstractMaskSystem
]);
class AbstractMaskSystem {
    /**
   * @param renderer - The renderer this System works for.
   */ constructor(renderer){
        this.renderer = renderer, this.maskStack = [], this.glConst = 0;
    }
    /** Gets count of masks of certain type. */ getStackLength() {
        return this.maskStack.length;
    }
    /**
   * Changes the mask stack that is used by this System.
   * @param {PIXI.MaskData[]} maskStack - The mask stack
   */ setMaskStack(maskStack) {
        const { gl } = this.renderer, curStackLen = this.getStackLength();
        this.maskStack = maskStack;
        const newStackLen = this.getStackLength();
        newStackLen !== curStackLen && (newStackLen === 0 ? gl.disable(this.glConst) : (gl.enable(this.glConst), this._useCurrent()));
    }
    /**
   * Setup renderer to use the current mask data.
   * @private
   */ _useCurrent() {}
    /** Destroys the mask stack. */ destroy() {
        this.renderer = null, this.maskStack = null;
    }
}
;
 //# sourceMappingURL=AbstractMaskSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/ScissorSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScissorSystem",
    ()=>ScissorSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Matrix.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/shapes/Rectangle.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$AbstractMaskSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/AbstractMaskSystem.mjs [app-client] (ecmascript)");
;
;
;
;
const tempMatrix = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"](), rectPool = [], _ScissorSystem = class _ScissorSystem2 extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$AbstractMaskSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AbstractMaskSystem"] {
    /**
   * @param {PIXI.Renderer} renderer - The renderer this System works for.
   */ constructor(renderer){
        super(renderer), this.glConst = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.getWebGLRenderingContext().SCISSOR_TEST;
    }
    getStackLength() {
        const maskData = this.maskStack[this.maskStack.length - 1];
        return maskData ? maskData._scissorCounter : 0;
    }
    /**
   * evaluates _boundsTransformed, _scissorRect for MaskData
   * @param maskData
   */ calcScissorRect(maskData) {
        if (maskData._scissorRectLocal) return;
        const prevData = maskData._scissorRect, { maskObject } = maskData, { renderer } = this, renderTextureSystem = renderer.renderTexture, rect = maskObject.getBounds(!0, rectPool.pop() ?? new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"]());
        this.roundFrameToPixels(rect, renderTextureSystem.current ? renderTextureSystem.current.resolution : renderer.resolution, renderTextureSystem.sourceFrame, renderTextureSystem.destinationFrame, renderer.projection.transform), prevData && rect.fit(prevData), maskData._scissorRectLocal = rect;
    }
    static isMatrixRotated(matrix) {
        if (!matrix) return !1;
        const { a, b, c, d } = matrix;
        return (Math.abs(b) > 1e-4 || Math.abs(c) > 1e-4) && (Math.abs(a) > 1e-4 || Math.abs(d) > 1e-4);
    }
    /**
   * Test, whether the object can be scissor mask with current renderer projection.
   * Calls "calcScissorRect()" if its true.
   * @param maskData - mask data
   * @returns whether Whether the object can be scissor mask
   */ testScissor(maskData) {
        const { maskObject } = maskData;
        if (!maskObject.isFastRect || !maskObject.isFastRect() || _ScissorSystem2.isMatrixRotated(maskObject.worldTransform) || _ScissorSystem2.isMatrixRotated(this.renderer.projection.transform)) return !1;
        this.calcScissorRect(maskData);
        const rect = maskData._scissorRectLocal;
        return rect.width > 0 && rect.height > 0;
    }
    roundFrameToPixels(frame, resolution, bindingSourceFrame, bindingDestinationFrame, transform) {
        _ScissorSystem2.isMatrixRotated(transform) || (transform = transform ? tempMatrix.copyFrom(transform) : tempMatrix.identity(), transform.translate(-bindingSourceFrame.x, -bindingSourceFrame.y).scale(bindingDestinationFrame.width / bindingSourceFrame.width, bindingDestinationFrame.height / bindingSourceFrame.height).translate(bindingDestinationFrame.x, bindingDestinationFrame.y), this.renderer.filter.transformAABB(transform, frame), frame.fit(bindingDestinationFrame), frame.x = Math.round(frame.x * resolution), frame.y = Math.round(frame.y * resolution), frame.width = Math.round(frame.width * resolution), frame.height = Math.round(frame.height * resolution));
    }
    /**
   * Applies the Mask and adds it to the current stencil stack.
   * @author alvin
   * @param maskData - The mask data.
   */ push(maskData) {
        maskData._scissorRectLocal || this.calcScissorRect(maskData);
        const { gl } = this.renderer;
        maskData._scissorRect || gl.enable(gl.SCISSOR_TEST), maskData._scissorCounter++, maskData._scissorRect = maskData._scissorRectLocal, this._useCurrent();
    }
    /**
   * This should be called after a mask is popped off the mask stack. It will rebind the scissor box to be latest with the
   * last mask in the stack.
   *
   * This can also be called when you directly modify the scissor box and want to restore PixiJS state.
   * @param maskData - The mask data.
   */ pop(maskData) {
        const { gl } = this.renderer;
        maskData && rectPool.push(maskData._scissorRectLocal), this.getStackLength() > 0 ? this._useCurrent() : gl.disable(gl.SCISSOR_TEST);
    }
    /**
   * Setup renderer to use the current scissor data.
   * @private
   */ _useCurrent() {
        const rect = this.maskStack[this.maskStack.length - 1]._scissorRect;
        let y;
        this.renderer.renderTexture.current ? y = rect.y : y = this.renderer.height - rect.height - rect.y, this.renderer.gl.scissor(rect.x, y, rect.width, rect.height);
    }
};
_ScissorSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "scissor"
};
let ScissorSystem = _ScissorSystem;
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(ScissorSystem);
;
 //# sourceMappingURL=ScissorSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/StencilSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StencilSystem",
    ()=>StencilSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$AbstractMaskSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/AbstractMaskSystem.mjs [app-client] (ecmascript)");
;
;
;
class StencilSystem extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$AbstractMaskSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AbstractMaskSystem"] {
    /**
   * @param renderer - The renderer this System works for.
   */ constructor(renderer){
        super(renderer), this.glConst = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.getWebGLRenderingContext().STENCIL_TEST;
    }
    getStackLength() {
        const maskData = this.maskStack[this.maskStack.length - 1];
        return maskData ? maskData._stencilCounter : 0;
    }
    /**
   * Applies the Mask and adds it to the current stencil stack.
   * @param maskData - The mask data
   */ push(maskData) {
        const maskObject = maskData.maskObject, { gl } = this.renderer, prevMaskCount = maskData._stencilCounter;
        prevMaskCount === 0 && (this.renderer.framebuffer.forceStencil(), gl.clearStencil(0), gl.clear(gl.STENCIL_BUFFER_BIT), gl.enable(gl.STENCIL_TEST)), maskData._stencilCounter++;
        const colorMask = maskData._colorMask;
        colorMask !== 0 && (maskData._colorMask = 0, gl.colorMask(!1, !1, !1, !1)), gl.stencilFunc(gl.EQUAL, prevMaskCount, 4294967295), gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR), maskObject.renderable = !0, maskObject.render(this.renderer), this.renderer.batch.flush(), maskObject.renderable = !1, colorMask !== 0 && (maskData._colorMask = colorMask, gl.colorMask((colorMask & 1) !== 0, (colorMask & 2) !== 0, (colorMask & 4) !== 0, (colorMask & 8) !== 0)), this._useCurrent();
    }
    /**
   * Pops stencil mask. MaskData is already removed from stack
   * @param {PIXI.DisplayObject} maskObject - object of popped mask data
   */ pop(maskObject) {
        const gl = this.renderer.gl;
        if (this.getStackLength() === 0) gl.disable(gl.STENCIL_TEST);
        else {
            const maskData = this.maskStack.length !== 0 ? this.maskStack[this.maskStack.length - 1] : null, colorMask = maskData ? maskData._colorMask : 15;
            colorMask !== 0 && (maskData._colorMask = 0, gl.colorMask(!1, !1, !1, !1)), gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR), maskObject.renderable = !0, maskObject.render(this.renderer), this.renderer.batch.flush(), maskObject.renderable = !1, colorMask !== 0 && (maskData._colorMask = colorMask, gl.colorMask((colorMask & 1) !== 0, (colorMask & 2) !== 0, (colorMask & 4) !== 0, (colorMask & 8) !== 0)), this._useCurrent();
        }
    }
    /**
   * Setup renderer to use the current stencil data.
   * @private
   */ _useCurrent() {
        const gl = this.renderer.gl;
        gl.stencilFunc(gl.EQUAL, this.getStackLength(), 4294967295), gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    }
}
StencilSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "stencil"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(StencilSystem);
;
 //# sourceMappingURL=StencilSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/plugin/PluginSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PluginSystem",
    ()=>PluginSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/logging/deprecation.mjs [app-client] (ecmascript)");
;
;
class PluginSystem {
    constructor(renderer){
        this.renderer = renderer, this.plugins = {}, Object.defineProperties(this.plugins, {
            extract: {
                enumerable: !1,
                get () {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.plugins.extract has moved to renderer.extract"), renderer.extract;
                }
            },
            prepare: {
                enumerable: !1,
                get () {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.plugins.prepare has moved to renderer.prepare"), renderer.prepare;
                }
            },
            interaction: {
                enumerable: !1,
                get () {
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.plugins.interaction has been deprecated, use renderer.events"), renderer.events;
                }
            }
        });
    }
    /**
   * Initialize the plugins.
   * @protected
   */ init() {
        const staticMap = this.rendererPlugins;
        for(const o in staticMap)this.plugins[o] = new staticMap[o](this.renderer);
    }
    destroy() {
        for(const o in this.plugins)this.plugins[o].destroy(), this.plugins[o] = null;
    }
}
PluginSystem.extension = {
    type: [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].CanvasRendererSystem
    ],
    name: "_plugin"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(PluginSystem);
;
 //# sourceMappingURL=PluginSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/projection/ProjectionSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProjectionSystem",
    ()=>ProjectionSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Matrix.mjs [app-client] (ecmascript)");
;
;
class ProjectionSystem {
    /** @param renderer - The renderer this System works for. */ constructor(renderer){
        this.renderer = renderer, this.destinationFrame = null, this.sourceFrame = null, this.defaultFrame = null, this.projectionMatrix = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"](), this.transform = null;
    }
    /**
   * Updates the projection-matrix based on the sourceFrame → destinationFrame mapping provided.
   *
   * NOTE: It is expected you call `renderer.framebuffer.setViewport(destinationFrame)` after this. This is because
   * the framebuffer viewport converts shader vertex output in normalized device coordinates to window coordinates.
   *
   * NOTE-2: {@link PIXI.RenderTextureSystem#bind} updates the projection-matrix when you bind a render-texture.
   * It is expected
   * that you dirty the current bindings when calling this manually.
   * @param destinationFrame - The rectangle in the render-target to render the contents into. If rendering to the canvas,
   *  the origin is on the top-left; if rendering to a render-texture, the origin is on the bottom-left.
   * @param sourceFrame - The rectangle in world space that contains the contents being rendered.
   * @param resolution - The resolution of the render-target, which is the ratio of
   *  world-space (or CSS) pixels to physical pixels.
   * @param root - Whether the render-target is the screen. This is required because rendering to textures
   *  is y-flipped (i.e. upside down relative to the screen).
   */ update(destinationFrame, sourceFrame, resolution, root) {
        this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame, this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame, this.calculateProjection(this.destinationFrame, this.sourceFrame, resolution, root), this.transform && this.projectionMatrix.append(this.transform);
        const renderer = this.renderer;
        renderer.globalUniforms.uniforms.projectionMatrix = this.projectionMatrix, renderer.globalUniforms.update(), renderer.shader.shader && renderer.shader.syncUniformGroup(renderer.shader.shader.uniforms.globals);
    }
    /**
   * Calculates the `projectionMatrix` to map points inside `sourceFrame` to inside `destinationFrame`.
   * @param _destinationFrame - The destination frame in the render-target.
   * @param sourceFrame - The source frame in world space.
   * @param _resolution - The render-target's resolution, i.e. ratio of CSS to physical pixels.
   * @param root - Whether rendering into the screen. Otherwise, if rendering to a framebuffer, the projection
   *  is y-flipped.
   */ calculateProjection(_destinationFrame, sourceFrame, _resolution, root) {
        const pm = this.projectionMatrix, sign = root ? -1 : 1;
        pm.identity(), pm.a = 1 / sourceFrame.width * 2, pm.d = sign * (1 / sourceFrame.height * 2), pm.tx = -1 - sourceFrame.x * pm.a, pm.ty = -sign - sourceFrame.y * pm.d;
    }
    /**
   * Sets the transform of the active render target to the given matrix.
   * @param _matrix - The transformation matrix
   */ setTransform(_matrix) {}
    destroy() {
        this.renderer = null;
    }
}
ProjectionSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "projection"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(ProjectionSystem);
;
 //# sourceMappingURL=ProjectionSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/GenerateTextureSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GenerateTextureSystem",
    ()=>GenerateTextureSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Transform.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/shapes/Rectangle.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Matrix.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTexture.mjs [app-client] (ecmascript)");
;
;
;
const tempTransform = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Transform"](), tempRect = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"]();
class GenerateTextureSystem {
    constructor(renderer){
        this.renderer = renderer, this._tempMatrix = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"]();
    }
    /**
   * A Useful function that returns a texture of the display object that can then be used to create sprites
   * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
   * @param displayObject - The displayObject the object will be generated from.
   * @param {IGenerateTextureOptions} options - Generate texture options.
   * @param {PIXI.Rectangle} options.region - The region of the displayObject, that shall be rendered,
   *        if no region is specified, defaults to the local bounds of the displayObject.
   * @param {number} [options.resolution] - If not given, the renderer's resolution is used.
   * @param {PIXI.MSAA_QUALITY} [options.multisample] - If not given, the renderer's multisample is used.
   * @returns a shiny new texture of the display object passed in
   */ generateTexture(displayObject, options) {
        const { region: manualRegion, ...textureOptions } = options || {}, region = manualRegion?.copyTo(tempRect) || displayObject.getLocalBounds(tempRect, !0), resolution = textureOptions.resolution || this.renderer.resolution;
        region.width = Math.max(region.width, 1 / resolution), region.height = Math.max(region.height, 1 / resolution), textureOptions.width = region.width, textureOptions.height = region.height, textureOptions.resolution = resolution, textureOptions.multisample ?? (textureOptions.multisample = this.renderer.multisample);
        const renderTexture = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RenderTexture"].create(textureOptions);
        this._tempMatrix.tx = -region.x, this._tempMatrix.ty = -region.y;
        const transform = displayObject.transform;
        return displayObject.transform = tempTransform, this.renderer.render(displayObject, {
            renderTexture,
            transform: this._tempMatrix,
            skipUpdateTransform: !!displayObject.parent,
            blit: !0
        }), displayObject.transform = transform, renderTexture;
    }
    destroy() {}
}
GenerateTextureSystem.extension = {
    type: [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].CanvasRendererSystem
    ],
    name: "textureGenerator"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(GenerateTextureSystem);
;
 //# sourceMappingURL=GenerateTextureSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTextureSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RenderTextureSystem",
    ()=>RenderTextureSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/color/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$Color$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/color/lib/Color.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/shapes/Rectangle.mjs [app-client] (ecmascript)");
;
;
;
const tempRect = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](), tempRect2 = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"]();
class RenderTextureSystem {
    /**
   * @param renderer - The renderer this System works for.
   */ constructor(renderer){
        this.renderer = renderer, this.defaultMaskStack = [], this.current = null, this.sourceFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](), this.destinationFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](), this.viewportFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"]();
    }
    contextChange() {
        const attributes = this.renderer?.gl.getContextAttributes();
        this._rendererPremultipliedAlpha = !!(attributes && attributes.alpha && attributes.premultipliedAlpha);
    }
    /**
   * Bind the current render texture.
   * @param renderTexture - RenderTexture to bind, by default its `null` - the screen.
   * @param sourceFrame - Part of world that is mapped to the renderTexture.
   * @param destinationFrame - Part of renderTexture, by default it has the same size as sourceFrame.
   */ bind(renderTexture = null, sourceFrame, destinationFrame) {
        const renderer = this.renderer;
        this.current = renderTexture;
        let baseTexture, framebuffer, resolution;
        renderTexture ? (baseTexture = renderTexture.baseTexture, resolution = baseTexture.resolution, sourceFrame || (tempRect.width = renderTexture.frame.width, tempRect.height = renderTexture.frame.height, sourceFrame = tempRect), destinationFrame || (tempRect2.x = renderTexture.frame.x, tempRect2.y = renderTexture.frame.y, tempRect2.width = sourceFrame.width, tempRect2.height = sourceFrame.height, destinationFrame = tempRect2), framebuffer = baseTexture.framebuffer) : (resolution = renderer.resolution, sourceFrame || (tempRect.width = renderer._view.screen.width, tempRect.height = renderer._view.screen.height, sourceFrame = tempRect), destinationFrame || (destinationFrame = tempRect, destinationFrame.width = sourceFrame.width, destinationFrame.height = sourceFrame.height));
        const viewportFrame = this.viewportFrame;
        viewportFrame.x = destinationFrame.x * resolution, viewportFrame.y = destinationFrame.y * resolution, viewportFrame.width = destinationFrame.width * resolution, viewportFrame.height = destinationFrame.height * resolution, renderTexture || (viewportFrame.y = renderer.view.height - (viewportFrame.y + viewportFrame.height)), viewportFrame.ceil(), this.renderer.framebuffer.bind(framebuffer, viewportFrame), this.renderer.projection.update(destinationFrame, sourceFrame, resolution, !framebuffer), renderTexture ? this.renderer.mask.setMaskStack(baseTexture.maskStack) : this.renderer.mask.setMaskStack(this.defaultMaskStack), this.sourceFrame.copyFrom(sourceFrame), this.destinationFrame.copyFrom(destinationFrame);
    }
    /**
   * Erases the render texture and fills the drawing area with a colour.
   * @param clearColor - The color as rgba, default to use the renderer backgroundColor
   * @param [mask=BUFFER_BITS.COLOR | BUFFER_BITS.DEPTH] - Bitwise OR of masks
   *  that indicate the buffers to be cleared, by default COLOR and DEPTH buffers.
   */ clear(clearColor, mask) {
        const fallbackColor = this.current ? this.current.baseTexture.clear : this.renderer.background.backgroundColor, color = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$Color$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"].shared.setValue(clearColor || fallbackColor);
        (this.current && this.current.baseTexture.alphaMode > 0 || !this.current && this._rendererPremultipliedAlpha) && color.premultiply(color.alpha);
        const destinationFrame = this.destinationFrame, baseFrame = this.current ? this.current.baseTexture : this.renderer._view.screen, clearMask = destinationFrame.width !== baseFrame.width || destinationFrame.height !== baseFrame.height;
        if (clearMask) {
            let { x, y, width, height } = this.viewportFrame;
            x = Math.round(x), y = Math.round(y), width = Math.round(width), height = Math.round(height), this.renderer.gl.enable(this.renderer.gl.SCISSOR_TEST), this.renderer.gl.scissor(x, y, width, height);
        }
        this.renderer.framebuffer.clear(color.red, color.green, color.blue, color.alpha, mask), clearMask && this.renderer.scissor.pop();
    }
    resize() {
        this.bind(null);
    }
    /** Resets render-texture state. */ reset() {
        this.bind(null);
    }
    destroy() {
        this.renderer = null;
    }
}
RenderTextureSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "renderTexture"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(RenderTextureSystem);
;
 //# sourceMappingURL=RenderTextureSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/GLProgram.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GLProgram",
    ()=>GLProgram,
    "IGLUniformData",
    ()=>IGLUniformData
]);
class IGLUniformData {
}
class GLProgram {
    /**
   * Makes a new Pixi program.
   * @param program - webgl program
   * @param uniformData - uniforms
   */ constructor(program, uniformData){
        this.program = program, this.uniformData = uniformData, this.uniformGroups = {}, this.uniformDirtyGroups = {}, this.uniformBufferBindings = {};
    }
    /** Destroys this program. */ destroy() {
        this.uniformData = null, this.uniformGroups = null, this.uniformDirtyGroups = null, this.uniformBufferBindings = null, this.program = null;
    }
}
;
 //# sourceMappingURL=GLProgram.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getAttributeData.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAttributeData",
    ()=>getAttributeData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$mapSize$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/mapSize.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$mapType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/mapType.mjs [app-client] (ecmascript)");
;
;
function getAttributeData(program, gl) {
    const attributes = {}, totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for(let i = 0; i < totalAttributes; i++){
        const attribData = gl.getActiveAttrib(program, i);
        if (attribData.name.startsWith("gl_")) continue;
        const type = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$mapType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapType"])(gl, attribData.type), data = {
            type,
            name: attribData.name,
            size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$mapSize$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapSize"])(type),
            location: gl.getAttribLocation(program, attribData.name)
        };
        attributes[attribData.name] = data;
    }
    return attributes;
}
;
 //# sourceMappingURL=getAttributeData.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getUniformData.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getUniformData",
    ()=>getUniformData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$defaultValue$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/defaultValue.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$mapType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/mapType.mjs [app-client] (ecmascript)");
;
;
function getUniformData(program, gl) {
    const uniforms = {}, totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for(let i = 0; i < totalUniforms; i++){
        const uniformData = gl.getActiveUniform(program, i), name = uniformData.name.replace(/\[.*?\]$/, ""), isArray = !!uniformData.name.match(/\[.*?\]$/), type = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$mapType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapType"])(gl, uniformData.type);
        uniforms[name] = {
            name,
            index: i,
            type,
            size: uniformData.size,
            isArray,
            value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$defaultValue$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultValue"])(type, uniformData.size)
        };
    }
    return uniforms;
}
;
 //# sourceMappingURL=getUniformData.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateProgram.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateProgram",
    ()=>generateProgram
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$GLProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/GLProgram.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$compileShader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/compileShader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$defaultValue$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/defaultValue.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getAttributeData$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getAttributeData.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getUniformData$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getUniformData.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$logProgramError$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/logProgramError.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
function generateProgram(gl, program) {
    const glVertShader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$compileShader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compileShader"])(gl, gl.VERTEX_SHADER, program.vertexSrc), glFragShader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$compileShader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compileShader"])(gl, gl.FRAGMENT_SHADER, program.fragmentSrc), webGLProgram = gl.createProgram();
    gl.attachShader(webGLProgram, glVertShader), gl.attachShader(webGLProgram, glFragShader);
    const transformFeedbackVaryings = program.extra?.transformFeedbackVaryings;
    if (transformFeedbackVaryings && (typeof gl.transformFeedbackVaryings != "function" ? console.warn("TransformFeedback is not supported but TransformFeedbackVaryings are given.") : gl.transformFeedbackVaryings(webGLProgram, transformFeedbackVaryings.names, transformFeedbackVaryings.bufferMode === "separate" ? gl.SEPARATE_ATTRIBS : gl.INTERLEAVED_ATTRIBS)), gl.linkProgram(webGLProgram), gl.getProgramParameter(webGLProgram, gl.LINK_STATUS) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$logProgramError$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logProgramError"])(gl, webGLProgram, glVertShader, glFragShader), program.attributeData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getAttributeData$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAttributeData"])(webGLProgram, gl), program.uniformData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getUniformData$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUniformData"])(webGLProgram, gl), !/^[ \t]*#[ \t]*version[ \t]+300[ \t]+es[ \t]*$/m.test(program.vertexSrc)) {
        const keys = Object.keys(program.attributeData);
        keys.sort((a, b)=>a > b ? 1 : -1);
        for(let i = 0; i < keys.length; i++)program.attributeData[keys[i]].location = i, gl.bindAttribLocation(webGLProgram, i, keys[i]);
        gl.linkProgram(webGLProgram);
    }
    gl.deleteShader(glVertShader), gl.deleteShader(glFragShader);
    const uniformData = {};
    for(const i in program.uniformData){
        const data = program.uniformData[i];
        uniformData[i] = {
            location: gl.getUniformLocation(webGLProgram, i),
            value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$defaultValue$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultValue"])(data.type, data.size)
        };
    }
    return new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$GLProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLProgram"](webGLProgram, uniformData);
}
;
 //# sourceMappingURL=generateProgram.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateUniformBufferSync.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createUBOElements",
    ()=>createUBOElements,
    "generateUniformBufferSync",
    ()=>generateUniformBufferSync,
    "getUBOData",
    ()=>getUBOData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/uniformParsers.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$mapSize$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/mapSize.mjs [app-client] (ecmascript)");
;
;
;
function uboUpdate(_ud, _uv, _renderer, _syncData, buffer) {
    _renderer.buffer.update(buffer);
}
const UBO_TO_SINGLE_SETTERS = {
    float: `
        data[offset] = v;
    `,
    vec2: `
        data[offset] = v[0];
        data[offset+1] = v[1];
    `,
    vec3: `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];

    `,
    vec4: `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];
        data[offset+3] = v[3];
    `,
    mat2: `
        data[offset] = v[0];
        data[offset+1] = v[1];

        data[offset+4] = v[2];
        data[offset+5] = v[3];
    `,
    mat3: `
        data[offset] = v[0];
        data[offset+1] = v[1];
        data[offset+2] = v[2];

        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];

        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];
    `,
    mat4: `
        for(var i = 0; i < 16; i++)
        {
            data[offset + i] = v[i];
        }
    `
}, GLSL_TO_STD40_SIZE = {
    float: 4,
    vec2: 8,
    vec3: 12,
    vec4: 16,
    int: 4,
    ivec2: 8,
    ivec3: 12,
    ivec4: 16,
    uint: 4,
    uvec2: 8,
    uvec3: 12,
    uvec4: 16,
    bool: 4,
    bvec2: 8,
    bvec3: 12,
    bvec4: 16,
    mat2: 16 * 2,
    mat3: 16 * 3,
    mat4: 16 * 4
};
function createUBOElements(uniformData) {
    const uboElements = uniformData.map((data)=>({
            data,
            offset: 0,
            dataLen: 0,
            dirty: 0
        }));
    let size = 0, chunkSize = 0, offset = 0;
    for(let i = 0; i < uboElements.length; i++){
        const uboElement = uboElements[i];
        if (size = GLSL_TO_STD40_SIZE[uboElement.data.type], uboElement.data.size > 1 && (size = Math.max(size, 16) * uboElement.data.size), uboElement.dataLen = size, chunkSize % size !== 0 && chunkSize < 16) {
            const lineUpValue = chunkSize % size % 16;
            chunkSize += lineUpValue, offset += lineUpValue;
        }
        chunkSize + size > 16 ? (offset = Math.ceil(offset / 16) * 16, uboElement.offset = offset, offset += size, chunkSize = size) : (uboElement.offset = offset, chunkSize += size, offset += size);
    }
    return offset = Math.ceil(offset / 16) * 16, {
        uboElements,
        size: offset
    };
}
function getUBOData(uniforms, uniformData) {
    const usedUniformDatas = [];
    for(const i in uniforms)uniformData[i] && usedUniformDatas.push(uniformData[i]);
    return usedUniformDatas.sort((a, b)=>a.index - b.index), usedUniformDatas;
}
function generateUniformBufferSync(group, uniformData) {
    if (!group.autoManage) return {
        size: 0,
        syncFunc: uboUpdate
    };
    const usedUniformDatas = getUBOData(group.uniforms, uniformData), { uboElements, size } = createUBOElements(usedUniformDatas), funcFragments = [
        `
    var v = null;
    var v2 = null;
    var cv = null;
    var t = 0;
    var gl = renderer.gl
    var index = 0;
    var data = buffer.data;
    `
    ];
    for(let i = 0; i < uboElements.length; i++){
        const uboElement = uboElements[i], uniform = group.uniforms[uboElement.data.name], name = uboElement.data.name;
        let parsed = !1;
        for(let j = 0; j < __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uniformParsers"].length; j++){
            const uniformParser = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uniformParsers"][j];
            if (uniformParser.codeUbo && uniformParser.test(uboElement.data, uniform)) {
                funcFragments.push(`offset = ${uboElement.offset / 4};`, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uniformParsers"][j].codeUbo(uboElement.data.name, uniform)), parsed = !0;
                break;
            }
        }
        if (!parsed) if (uboElement.data.size > 1) {
            const size2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$mapSize$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapSize"])(uboElement.data.type), rowSize = Math.max(GLSL_TO_STD40_SIZE[uboElement.data.type] / 16, 1), elementSize = size2 / rowSize, remainder = (4 - elementSize % 4) % 4;
            funcFragments.push(`
                cv = ud.${name}.value;
                v = uv.${name};
                offset = ${uboElement.offset / 4};

                t = 0;

                for(var i=0; i < ${uboElement.data.size * rowSize}; i++)
                {
                    for(var j = 0; j < ${elementSize}; j++)
                    {
                        data[offset++] = v[t++];
                    }
                    offset += ${remainder};
                }

                `);
        } else {
            const template = UBO_TO_SINGLE_SETTERS[uboElement.data.type];
            funcFragments.push(`
                cv = ud.${name}.value;
                v = uv.${name};
                offset = ${uboElement.offset / 4};
                ${template};
                `);
        }
    }
    return funcFragments.push(`
       renderer.buffer.update(buffer);
    `), {
        size,
        // eslint-disable-next-line no-new-func
        syncFunc: new Function("ud", "uv", "renderer", "syncData", "buffer", funcFragments.join(`
`))
    };
}
;
 //# sourceMappingURL=generateUniformBufferSync.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/ShaderSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShaderSystem",
    ()=>ShaderSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateProgram.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateUniformBufferSync$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateUniformBufferSync.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$unsafeEvalSupported$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/unsafeEvalSupported.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateUniformsSync$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateUniformsSync.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
let UID = 0;
const defaultSyncData = {
    textureCount: 0,
    uboCount: 0
};
class ShaderSystem {
    /** @param renderer - The renderer this System works for. */ constructor(renderer){
        this.destroyed = !1, this.renderer = renderer, this.systemCheck(), this.gl = null, this.shader = null, this.program = null, this.cache = {}, this._uboCache = {}, this.id = UID++;
    }
    /**
   * Overrideable function by `@pixi/unsafe-eval` to silence
   * throwing an error if platform doesn't support unsafe-evals.
   * @private
   */ systemCheck() {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$unsafeEvalSupported$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unsafeEvalSupported"])()) throw new Error("Current environment does not allow unsafe-eval, please use @pixi/unsafe-eval module to enable support.");
    }
    contextChange(gl) {
        this.gl = gl, this.reset();
    }
    /**
   * Changes the current shader to the one given in parameter.
   * @param shader - the new shader
   * @param dontSync - false if the shader should automatically sync its uniforms.
   * @returns the glProgram that belongs to the shader.
   */ bind(shader, dontSync) {
        shader.disposeRunner.add(this), shader.uniforms.globals = this.renderer.globalUniforms;
        const program = shader.program, glProgram = program.glPrograms[this.renderer.CONTEXT_UID] || this.generateProgram(shader);
        return this.shader = shader, this.program !== program && (this.program = program, this.gl.useProgram(glProgram.program)), dontSync || (defaultSyncData.textureCount = 0, defaultSyncData.uboCount = 0, this.syncUniformGroup(shader.uniformGroup, defaultSyncData)), glProgram;
    }
    /**
   * Uploads the uniforms values to the currently bound shader.
   * @param uniforms - the uniforms values that be applied to the current shader
   */ setUniforms(uniforms) {
        const shader = this.shader.program, glProgram = shader.glPrograms[this.renderer.CONTEXT_UID];
        shader.syncUniforms(glProgram.uniformData, uniforms, this.renderer);
    }
    /* eslint-disable @typescript-eslint/explicit-module-boundary-types */ /**
   * Syncs uniforms on the group
   * @param group - the uniform group to sync
   * @param syncData - this is data that is passed to the sync function and any nested sync functions
   */ syncUniformGroup(group, syncData) {
        const glProgram = this.getGlProgram();
        (!group.static || group.dirtyId !== glProgram.uniformDirtyGroups[group.id]) && (glProgram.uniformDirtyGroups[group.id] = group.dirtyId, this.syncUniforms(group, glProgram, syncData));
    }
    /**
   * Overrideable by the @pixi/unsafe-eval package to use static syncUniforms instead.
   * @param group
   * @param glProgram
   * @param syncData
   */ syncUniforms(group, glProgram, syncData) {
        (group.syncUniforms[this.shader.program.id] || this.createSyncGroups(group))(glProgram.uniformData, group.uniforms, this.renderer, syncData);
    }
    createSyncGroups(group) {
        const id = this.getSignature(group, this.shader.program.uniformData, "u");
        return this.cache[id] || (this.cache[id] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateUniformsSync$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateUniformsSync"])(group, this.shader.program.uniformData)), group.syncUniforms[this.shader.program.id] = this.cache[id], group.syncUniforms[this.shader.program.id];
    }
    /**
   * Syncs uniform buffers
   * @param group - the uniform buffer group to sync
   * @param name - the name of the uniform buffer
   */ syncUniformBufferGroup(group, name) {
        const glProgram = this.getGlProgram();
        if (!group.static || group.dirtyId !== 0 || !glProgram.uniformGroups[group.id]) {
            group.dirtyId = 0;
            const syncFunc = glProgram.uniformGroups[group.id] || this.createSyncBufferGroup(group, glProgram, name);
            group.buffer.update(), syncFunc(glProgram.uniformData, group.uniforms, this.renderer, defaultSyncData, group.buffer);
        }
        this.renderer.buffer.bindBufferBase(group.buffer, glProgram.uniformBufferBindings[name]);
    }
    /**
   * Will create a function that uploads a uniform buffer using the STD140 standard.
   * The upload function will then be cached for future calls
   * If a group is manually managed, then a simple upload function is generated
   * @param group - the uniform buffer group to sync
   * @param glProgram - the gl program to attach the uniform bindings to
   * @param name - the name of the uniform buffer (must exist on the shader)
   */ createSyncBufferGroup(group, glProgram, name) {
        const { gl } = this.renderer;
        this.renderer.buffer.bind(group.buffer);
        const uniformBlockIndex = this.gl.getUniformBlockIndex(glProgram.program, name);
        glProgram.uniformBufferBindings[name] = this.shader.uniformBindCount, gl.uniformBlockBinding(glProgram.program, uniformBlockIndex, this.shader.uniformBindCount), this.shader.uniformBindCount++;
        const id = this.getSignature(group, this.shader.program.uniformData, "ubo");
        let uboData = this._uboCache[id];
        if (uboData || (uboData = this._uboCache[id] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateUniformBufferSync$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateUniformBufferSync"])(group, this.shader.program.uniformData)), group.autoManage) {
            const data = new Float32Array(uboData.size / 4);
            group.buffer.update(data);
        }
        return glProgram.uniformGroups[group.id] = uboData.syncFunc, glProgram.uniformGroups[group.id];
    }
    /**
   * Takes a uniform group and data and generates a unique signature for them.
   * @param group - The uniform group to get signature of
   * @param group.uniforms
   * @param uniformData - Uniform information generated by the shader
   * @param preFix
   * @returns Unique signature of the uniform group
   */ getSignature(group, uniformData, preFix) {
        const uniforms = group.uniforms, strings = [
            `${preFix}-`
        ];
        for(const i in uniforms)strings.push(i), uniformData[i] && strings.push(uniformData[i].type);
        return strings.join("-");
    }
    /**
   * Returns the underlying GLShade rof the currently bound shader.
   *
   * This can be handy for when you to have a little more control over the setting of your uniforms.
   * @returns The glProgram for the currently bound Shader for this context
   */ getGlProgram() {
        return this.shader ? this.shader.program.glPrograms[this.renderer.CONTEXT_UID] : null;
    }
    /**
   * Generates a glProgram version of the Shader provided.
   * @param shader - The shader that the glProgram will be based on.
   * @returns A shiny new glProgram!
   */ generateProgram(shader) {
        const gl = this.gl, program = shader.program, glProgram = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateProgram"])(gl, program);
        return program.glPrograms[this.renderer.CONTEXT_UID] = glProgram, glProgram;
    }
    /** Resets ShaderSystem state, does not affect WebGL state. */ reset() {
        this.program = null, this.shader = null;
    }
    /**
   * Disposes shader.
   * If disposing one equals with current shader, set current as null.
   * @param shader - Shader object
   */ disposeShader(shader) {
        this.shader === shader && (this.shader = null);
    }
    /** Destroys this System and removes all its textures. */ destroy() {
        this.renderer = null, this.destroyed = !0;
    }
}
ShaderSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "shader"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(ShaderSystem);
;
 //# sourceMappingURL=ShaderSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/startup/StartupSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StartupSystem",
    ()=>StartupSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
;
class StartupSystem {
    constructor(renderer){
        this.renderer = renderer;
    }
    /**
   * It all starts here! This initiates every system, passing in the options for any system by name.
   * @param options - the config for the renderer and all its systems
   */ run(options) {
        const { renderer } = this;
        renderer.runners.init.emit(renderer.options), options.hello && console.log(`PixiJS 7.4.3 - ${renderer.rendererLogId} - https://pixijs.com`), renderer.resize(renderer.screen.width, renderer.screen.height);
    }
    destroy() {}
}
StartupSystem.defaultOptions = {
    /**
   * {@link PIXI.IRendererOptions.hello}
   * @default false
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ hello: !1
}, /** @ignore */ StartupSystem.extension = {
    type: [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].CanvasRendererSystem
    ],
    name: "startup"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(StartupSystem);
;
 //# sourceMappingURL=StartupSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/utils/mapWebGLBlendModesToPixi.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mapWebGLBlendModesToPixi",
    ()=>mapWebGLBlendModesToPixi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
;
function mapWebGLBlendModesToPixi(gl, array = []) {
    return array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].NORMAL] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].ADD] = [
        gl.ONE,
        gl.ONE
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].MULTIPLY] = [
        gl.DST_COLOR,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].SCREEN] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_COLOR,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].OVERLAY] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].DARKEN] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].LIGHTEN] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].COLOR_DODGE] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].COLOR_BURN] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].HARD_LIGHT] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].SOFT_LIGHT] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].DIFFERENCE] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].EXCLUSION] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].HUE] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].SATURATION] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].COLOR] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].LUMINOSITY] = [
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].NONE] = [
        0,
        0
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].NORMAL_NPM] = [
        gl.SRC_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].ADD_NPM] = [
        gl.SRC_ALPHA,
        gl.ONE,
        gl.ONE,
        gl.ONE
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].SCREEN_NPM] = [
        gl.SRC_ALPHA,
        gl.ONE_MINUS_SRC_COLOR,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].SRC_IN] = [
        gl.DST_ALPHA,
        gl.ZERO
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].SRC_OUT] = [
        gl.ONE_MINUS_DST_ALPHA,
        gl.ZERO
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].SRC_ATOP] = [
        gl.DST_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].DST_OVER] = [
        gl.ONE_MINUS_DST_ALPHA,
        gl.ONE
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].DST_IN] = [
        gl.ZERO,
        gl.SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].DST_OUT] = [
        gl.ZERO,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].DST_ATOP] = [
        gl.ONE_MINUS_DST_ALPHA,
        gl.SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].XOR] = [
        gl.ONE_MINUS_DST_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA
    ], array[__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].SUBTRACT] = [
        gl.ONE,
        gl.ONE,
        gl.ONE,
        gl.ONE,
        gl.FUNC_REVERSE_SUBTRACT,
        gl.FUNC_ADD
    ], array;
}
;
 //# sourceMappingURL=mapWebGLBlendModesToPixi.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/StateSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StateSystem",
    ()=>StateSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$State$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/State.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$utils$2f$mapWebGLBlendModesToPixi$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/utils/mapWebGLBlendModesToPixi.mjs [app-client] (ecmascript)");
;
;
;
;
const BLEND = 0, OFFSET = 1, CULLING = 2, DEPTH_TEST = 3, WINDING = 4, DEPTH_MASK = 5, _StateSystem = class _StateSystem2 {
    constructor(){
        this.gl = null, this.stateId = 0, this.polygonOffset = 0, this.blendMode = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"].NONE, this._blendEq = !1, this.map = [], this.map[BLEND] = this.setBlend, this.map[OFFSET] = this.setOffset, this.map[CULLING] = this.setCullFace, this.map[DEPTH_TEST] = this.setDepthTest, this.map[WINDING] = this.setFrontFace, this.map[DEPTH_MASK] = this.setDepthMask, this.checks = [], this.defaultState = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$State$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["State"](), this.defaultState.blend = !0;
    }
    contextChange(gl) {
        this.gl = gl, this.blendModes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$utils$2f$mapWebGLBlendModesToPixi$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapWebGLBlendModesToPixi"])(gl), this.set(this.defaultState), this.reset();
    }
    /**
   * Sets the current state
   * @param {*} state - The state to set.
   */ set(state) {
        if (state = state || this.defaultState, this.stateId !== state.data) {
            let diff = this.stateId ^ state.data, i = 0;
            for(; diff;)diff & 1 && this.map[i].call(this, !!(state.data & 1 << i)), diff = diff >> 1, i++;
            this.stateId = state.data;
        }
        for(let i = 0; i < this.checks.length; i++)this.checks[i](this, state);
    }
    /**
   * Sets the state, when previous state is unknown.
   * @param {*} state - The state to set
   */ forceState(state) {
        state = state || this.defaultState;
        for(let i = 0; i < this.map.length; i++)this.map[i].call(this, !!(state.data & 1 << i));
        for(let i = 0; i < this.checks.length; i++)this.checks[i](this, state);
        this.stateId = state.data;
    }
    /**
   * Sets whether to enable or disable blending.
   * @param value - Turn on or off WebGl blending.
   */ setBlend(value) {
        this.updateCheck(_StateSystem2.checkBlendMode, value), this.gl[value ? "enable" : "disable"](this.gl.BLEND);
    }
    /**
   * Sets whether to enable or disable polygon offset fill.
   * @param value - Turn on or off webgl polygon offset testing.
   */ setOffset(value) {
        this.updateCheck(_StateSystem2.checkPolygonOffset, value), this.gl[value ? "enable" : "disable"](this.gl.POLYGON_OFFSET_FILL);
    }
    /**
   * Sets whether to enable or disable depth test.
   * @param value - Turn on or off webgl depth testing.
   */ setDepthTest(value) {
        this.gl[value ? "enable" : "disable"](this.gl.DEPTH_TEST);
    }
    /**
   * Sets whether to enable or disable depth mask.
   * @param value - Turn on or off webgl depth mask.
   */ setDepthMask(value) {
        this.gl.depthMask(value);
    }
    /**
   * Sets whether to enable or disable cull face.
   * @param {boolean} value - Turn on or off webgl cull face.
   */ setCullFace(value) {
        this.gl[value ? "enable" : "disable"](this.gl.CULL_FACE);
    }
    /**
   * Sets the gl front face.
   * @param {boolean} value - true is clockwise and false is counter-clockwise
   */ setFrontFace(value) {
        this.gl.frontFace(this.gl[value ? "CW" : "CCW"]);
    }
    /**
   * Sets the blend mode.
   * @param {number} value - The blend mode to set to.
   */ setBlendMode(value) {
        if (value === this.blendMode) return;
        this.blendMode = value;
        const mode = this.blendModes[value], gl = this.gl;
        mode.length === 2 ? gl.blendFunc(mode[0], mode[1]) : gl.blendFuncSeparate(mode[0], mode[1], mode[2], mode[3]), mode.length === 6 ? (this._blendEq = !0, gl.blendEquationSeparate(mode[4], mode[5])) : this._blendEq && (this._blendEq = !1, gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD));
    }
    /**
   * Sets the polygon offset.
   * @param {number} value - the polygon offset
   * @param {number} scale - the polygon offset scale
   */ setPolygonOffset(value, scale) {
        this.gl.polygonOffset(value, scale);
    }
    // used
    /** Resets all the logic and disables the VAOs. */ reset() {
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, !1), this.forceState(this.defaultState), this._blendEq = !0, this.blendMode = -1, this.setBlendMode(0);
    }
    /**
   * Checks to see which updates should be checked based on which settings have been activated.
   *
   * For example, if blend is enabled then we should check the blend modes each time the state is changed
   * or if polygon fill is activated then we need to check if the polygon offset changes.
   * The idea is that we only check what we have too.
   * @param func - the checking function to add or remove
   * @param value - should the check function be added or removed.
   */ updateCheck(func, value) {
        const index = this.checks.indexOf(func);
        value && index === -1 ? this.checks.push(func) : !value && index !== -1 && this.checks.splice(index, 1);
    }
    /**
   * A private little wrapper function that we call to check the blend mode.
   * @param system - the System to perform the state check on
   * @param state - the state that the blendMode will pulled from
   */ static checkBlendMode(system, state) {
        system.setBlendMode(state.blendMode);
    }
    /**
   * A private little wrapper function that we call to check the polygon offset.
   * @param system - the System to perform the state check on
   * @param state - the state that the blendMode will pulled from
   */ static checkPolygonOffset(system, state) {
        system.setPolygonOffset(1, state.polygonOffset);
    }
    /**
   * @ignore
   */ destroy() {
        this.gl = null;
    }
};
_StateSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "state"
};
let StateSystem = _StateSystem;
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(StateSystem);
;
 //# sourceMappingURL=StateSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/system/SystemManager.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SystemManager",
    ()=>SystemManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/Runner.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$eventemitter3$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EventEmitter$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/eventemitter3/index.js [app-client] (ecmascript) <export default as EventEmitter>");
;
;
class SystemManager extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f$eventemitter3$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EventEmitter$3e$__["EventEmitter"] {
    constructor(){
        super(...arguments), this.runners = {}, this._systemsHash = {};
    }
    /**
   * Set up a system with a collection of SystemClasses and runners.
   * Systems are attached dynamically to this class when added.
   * @param config - the config for the system manager
   */ setup(config) {
        this.addRunners(...config.runners);
        const priority = (config.priority ?? []).filter((key)=>config.systems[key]), orderByPriority = [
            ...priority,
            ...Object.keys(config.systems).filter((key)=>!priority.includes(key))
        ];
        for (const i of orderByPriority)this.addSystem(config.systems[i], i);
    }
    /**
   * Create a bunch of runners based of a collection of ids
   * @param runnerIds - the runner ids to add
   */ addRunners(...runnerIds) {
        runnerIds.forEach((runnerId)=>{
            this.runners[runnerId] = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Runner"](runnerId);
        });
    }
    /**
   * Add a new system to the renderer.
   * @param ClassRef - Class reference
   * @param name - Property name for system, if not specified
   *        will use a static `name` property on the class itself. This
   *        name will be assigned as s property on the Renderer so make
   *        sure it doesn't collide with properties on Renderer.
   * @returns Return instance of renderer
   */ addSystem(ClassRef, name) {
        const system = new ClassRef(this);
        if (this[name]) throw new Error(`Whoops! The name "${name}" is already in use`);
        this[name] = system, this._systemsHash[name] = system;
        for(const i in this.runners)this.runners[i].add(system);
        return this;
    }
    /**
   * A function that will run a runner and call the runners function but pass in different options
   * to each system based on there name.
   *
   * E.g. If you have two systems added called `systemA` and `systemB` you could call do the following:
   *
   * ```js
   * system.emitWithCustomOptions(init, {
   *     systemA: {...optionsForA},
   *     systemB: {...optionsForB},
   * });
   * ```
   *
   * `init` would be called on system A passing `optionsForA` and on system B passing `optionsForB`.
   * @param runner - the runner to target
   * @param options - key value options for each system
   */ emitWithCustomOptions(runner, options) {
        const systemHashKeys = Object.keys(this._systemsHash);
        runner.items.forEach((system)=>{
            const systemName = systemHashKeys.find((systemId)=>this._systemsHash[systemId] === system);
            system[runner.name](options[systemName]);
        });
    }
    /** destroy the all runners and systems. Its apps job to */ destroy() {
        Object.values(this.runners).forEach((runner)=>{
            runner.destroy();
        }), this._systemsHash = {};
    }
}
;
 //# sourceMappingURL=SystemManager.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureGCSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TextureGCSystem",
    ()=>TextureGCSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
;
;
const _TextureGCSystem = class _TextureGCSystem2 {
    /** @param renderer - The renderer this System works for. */ constructor(renderer){
        this.renderer = renderer, this.count = 0, this.checkCount = 0, this.maxIdle = _TextureGCSystem2.defaultMaxIdle, this.checkCountMax = _TextureGCSystem2.defaultCheckCountMax, this.mode = _TextureGCSystem2.defaultMode;
    }
    /**
   * Checks to see when the last time a texture was used.
   * If the texture has not been used for a specified amount of time, it will be removed from the GPU.
   */ postrender() {
        this.renderer.objectRenderer.renderingToScreen && (this.count++, this.mode !== __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GC_MODES"].MANUAL && (this.checkCount++, this.checkCount > this.checkCountMax && (this.checkCount = 0, this.run())));
    }
    /**
   * Checks to see when the last time a texture was used.
   * If the texture has not been used for a specified amount of time, it will be removed from the GPU.
   */ run() {
        const tm = this.renderer.texture, managedTextures = tm.managedTextures;
        let wasRemoved = !1;
        for(let i = 0; i < managedTextures.length; i++){
            const texture = managedTextures[i];
            texture.resource && this.count - texture.touched > this.maxIdle && (tm.destroyTexture(texture, !0), managedTextures[i] = null, wasRemoved = !0);
        }
        if (wasRemoved) {
            let j = 0;
            for(let i = 0; i < managedTextures.length; i++)managedTextures[i] !== null && (managedTextures[j++] = managedTextures[i]);
            managedTextures.length = j;
        }
    }
    /**
   * Removes all the textures within the specified displayObject and its children from the GPU.
   * @param {PIXI.DisplayObject} displayObject - the displayObject to remove the textures from.
   */ unload(displayObject) {
        const tm = this.renderer.texture, texture = displayObject._texture;
        texture && !texture.framebuffer && tm.destroyTexture(texture);
        for(let i = displayObject.children.length - 1; i >= 0; i--)this.unload(displayObject.children[i]);
    }
    destroy() {
        this.renderer = null;
    }
};
_TextureGCSystem.defaultMode = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GC_MODES"].AUTO, /**
* Default maximum idle frames before a texture is destroyed by garbage collection.
* @static
* @default 3600
* @see PIXI.TextureGCSystem#maxIdle
*/ _TextureGCSystem.defaultMaxIdle = 60 * 60, /**
* Default frames between two garbage collections.
* @static
* @default 600
* @see PIXI.TextureGCSystem#checkCountMax
*/ _TextureGCSystem.defaultCheckCountMax = 60 * 10, /** @ignore */ _TextureGCSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "textureGC"
};
let TextureGCSystem = _TextureGCSystem;
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(TextureGCSystem);
;
 //# sourceMappingURL=TextureGCSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/GLTexture.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GLTexture",
    ()=>GLTexture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
;
class GLTexture {
    constructor(texture){
        this.texture = texture, this.width = -1, this.height = -1, this.dirtyId = -1, this.dirtyStyleId = -1, this.mipmap = !1, this.wrapMode = 33071, this.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_BYTE, this.internalFormat = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA, this.samplerType = 0;
    }
}
;
 //# sourceMappingURL=GLTexture.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/utils/mapInternalFormatToSamplerType.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mapInternalFormatToSamplerType",
    ()=>mapInternalFormatToSamplerType
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
;
function mapInternalFormatToSamplerType(gl) {
    let table;
    return "WebGL2RenderingContext" in globalThis && gl instanceof globalThis.WebGL2RenderingContext ? table = {
        [gl.RGB]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGBA]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.ALPHA]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.LUMINANCE]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.LUMINANCE_ALPHA]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.R8]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.R8_SNORM]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RG8]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RG8_SNORM]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGB8]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGB8_SNORM]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGB565]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGBA4]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGB5_A1]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGBA8]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGBA8_SNORM]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGB10_A2]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGB10_A2UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.SRGB8]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.SRGB8_ALPHA8]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.R16F]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RG16F]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGB16F]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGBA16F]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.R32F]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RG32F]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGB32F]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGBA32F]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.R11F_G11F_B10F]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGB9_E5]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.R8I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.R8UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.R16I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.R16UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.R32I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.R32UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.RG8I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.RG8UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.RG16I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.RG16UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.RG32I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.RG32UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.RGB8I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.RGB8UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.RGB16I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.RGB16UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.RGB32I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.RGB32UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.RGBA8I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.RGBA8UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.RGBA16I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.RGBA16UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.RGBA32I]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].INT,
        [gl.RGBA32UI]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].UINT,
        [gl.DEPTH_COMPONENT16]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.DEPTH_COMPONENT24]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.DEPTH_COMPONENT32F]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.DEPTH_STENCIL]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.DEPTH24_STENCIL8]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.DEPTH32F_STENCIL8]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT
    } : table = {
        [gl.RGB]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.RGBA]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.ALPHA]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.LUMINANCE]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.LUMINANCE_ALPHA]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT,
        [gl.DEPTH_STENCIL]: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT
    }, table;
}
;
 //# sourceMappingURL=mapInternalFormatToSamplerType.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/utils/mapTypeAndFormatToInternalFormat.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mapTypeAndFormatToInternalFormat",
    ()=>mapTypeAndFormatToInternalFormat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
;
function mapTypeAndFormatToInternalFormat(gl) {
    let table;
    return "WebGL2RenderingContext" in globalThis && gl instanceof globalThis.WebGL2RenderingContext ? table = {
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_BYTE]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA]: gl.RGBA8,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB]: gl.RGB8,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RG]: gl.RG8,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RED]: gl.R8,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER]: gl.RGBA8UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB_INTEGER]: gl.RGB8UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RG_INTEGER]: gl.RG8UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RED_INTEGER]: gl.R8UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].ALPHA]: gl.ALPHA,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].LUMINANCE]: gl.LUMINANCE,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].LUMINANCE_ALPHA]: gl.LUMINANCE_ALPHA
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].BYTE]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA]: gl.RGBA8_SNORM,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB]: gl.RGB8_SNORM,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RG]: gl.RG8_SNORM,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RED]: gl.R8_SNORM,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER]: gl.RGBA8I,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB_INTEGER]: gl.RGB8I,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RG_INTEGER]: gl.RG8I,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RED_INTEGER]: gl.R8I
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_SHORT]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER]: gl.RGBA16UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB_INTEGER]: gl.RGB16UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RG_INTEGER]: gl.RG16UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RED_INTEGER]: gl.R16UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].DEPTH_COMPONENT]: gl.DEPTH_COMPONENT16
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].SHORT]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER]: gl.RGBA16I,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB_INTEGER]: gl.RGB16I,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RG_INTEGER]: gl.RG16I,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RED_INTEGER]: gl.R16I
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_INT]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER]: gl.RGBA32UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB_INTEGER]: gl.RGB32UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RG_INTEGER]: gl.RG32UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RED_INTEGER]: gl.R32UI,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].DEPTH_COMPONENT]: gl.DEPTH_COMPONENT24
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].INT]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER]: gl.RGBA32I,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB_INTEGER]: gl.RGB32I,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RG_INTEGER]: gl.RG32I,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RED_INTEGER]: gl.R32I
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].FLOAT]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA]: gl.RGBA32F,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB]: gl.RGB32F,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RG]: gl.RG32F,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RED]: gl.R32F,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].DEPTH_COMPONENT]: gl.DEPTH_COMPONENT32F
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].HALF_FLOAT]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA]: gl.RGBA16F,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB]: gl.RGB16F,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RG]: gl.RG16F,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RED]: gl.R16F
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_SHORT_5_6_5]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB]: gl.RGB565
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_SHORT_4_4_4_4]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA]: gl.RGBA4
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_SHORT_5_5_5_1]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA]: gl.RGB5_A1
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_INT_2_10_10_10_REV]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA]: gl.RGB10_A2,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA_INTEGER]: gl.RGB10_A2UI
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_INT_10F_11F_11F_REV]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB]: gl.R11F_G11F_B10F
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_INT_5_9_9_9_REV]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB]: gl.RGB9_E5
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_INT_24_8]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].DEPTH_STENCIL]: gl.DEPTH24_STENCIL8
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].FLOAT_32_UNSIGNED_INT_24_8_REV]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].DEPTH_STENCIL]: gl.DEPTH32F_STENCIL8
        }
    } : table = {
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_BYTE]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA]: gl.RGBA,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB]: gl.RGB,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].ALPHA]: gl.ALPHA,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].LUMINANCE]: gl.LUMINANCE,
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].LUMINANCE_ALPHA]: gl.LUMINANCE_ALPHA
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_SHORT_5_6_5]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGB]: gl.RGB
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_SHORT_4_4_4_4]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA]: gl.RGBA
        },
        [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].UNSIGNED_SHORT_5_5_5_1]: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"].RGBA]: gl.RGBA
        }
    }, table;
}
;
 //# sourceMappingURL=mapTypeAndFormatToInternalFormat.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TextureSystem",
    ()=>TextureSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$removeItems$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/data/removeItems.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$GLTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/GLTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$utils$2f$mapInternalFormatToSamplerType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/utils/mapInternalFormatToSamplerType.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$utils$2f$mapTypeAndFormatToInternalFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/utils/mapTypeAndFormatToInternalFormat.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
;
class TextureSystem {
    /**
   * @param renderer - The renderer this system works for.
   */ constructor(renderer){
        this.renderer = renderer, this.boundTextures = [], this.currentLocation = -1, this.managedTextures = [], this._unknownBoundTextures = !1, this.unknownTexture = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"](), this.hasIntegerTextures = !1;
    }
    /** Sets up the renderer context and necessary buffers. */ contextChange() {
        const gl = this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID, this.webGLVersion = this.renderer.context.webGLVersion, this.internalFormats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$utils$2f$mapTypeAndFormatToInternalFormat$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapTypeAndFormatToInternalFormat"])(gl), this.samplerTypes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$utils$2f$mapInternalFormatToSamplerType$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapInternalFormatToSamplerType"])(gl);
        const maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this.boundTextures.length = maxTextures;
        for(let i = 0; i < maxTextures; i++)this.boundTextures[i] = null;
        this.emptyTextures = {};
        const emptyTexture2D = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$GLTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLTexture"](gl.createTexture());
        gl.bindTexture(gl.TEXTURE_2D, emptyTexture2D.texture), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)), this.emptyTextures[gl.TEXTURE_2D] = emptyTexture2D, this.emptyTextures[gl.TEXTURE_CUBE_MAP] = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$GLTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLTexture"](gl.createTexture()), gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyTextures[gl.TEXTURE_CUBE_MAP].texture);
        for(let i = 0; i < 6; i++)gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        for(let i = 0; i < this.boundTextures.length; i++)this.bind(null, i);
    }
    /**
   * Bind a texture to a specific location
   *
   * If you want to unbind something, please use `unbind(texture)` instead of `bind(null, textureLocation)`
   * @param texture - Texture to bind
   * @param [location=0] - Location to bind at
   */ bind(texture, location = 0) {
        const { gl } = this;
        if (texture = texture?.castToBaseTexture(), texture?.valid && !texture.parentTextureArray) {
            texture.touched = this.renderer.textureGC.count;
            const glTexture = texture._glTextures[this.CONTEXT_UID] || this.initTexture(texture);
            this.boundTextures[location] !== texture && (this.currentLocation !== location && (this.currentLocation = location, gl.activeTexture(gl.TEXTURE0 + location)), gl.bindTexture(texture.target, glTexture.texture)), glTexture.dirtyId !== texture.dirtyId ? (this.currentLocation !== location && (this.currentLocation = location, gl.activeTexture(gl.TEXTURE0 + location)), this.updateTexture(texture)) : glTexture.dirtyStyleId !== texture.dirtyStyleId && this.updateTextureStyle(texture), this.boundTextures[location] = texture;
        } else this.currentLocation !== location && (this.currentLocation = location, gl.activeTexture(gl.TEXTURE0 + location)), gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[gl.TEXTURE_2D].texture), this.boundTextures[location] = null;
    }
    /** Resets texture location and bound textures Actual `bind(null, i)` calls will be performed at next `unbind()` call */ reset() {
        this._unknownBoundTextures = !0, this.hasIntegerTextures = !1, this.currentLocation = -1;
        for(let i = 0; i < this.boundTextures.length; i++)this.boundTextures[i] = this.unknownTexture;
    }
    /**
   * Unbind a texture.
   * @param texture - Texture to bind
   */ unbind(texture) {
        const { gl, boundTextures } = this;
        if (this._unknownBoundTextures) {
            this._unknownBoundTextures = !1;
            for(let i = 0; i < boundTextures.length; i++)boundTextures[i] === this.unknownTexture && this.bind(null, i);
        }
        for(let i = 0; i < boundTextures.length; i++)boundTextures[i] === texture && (this.currentLocation !== i && (gl.activeTexture(gl.TEXTURE0 + i), this.currentLocation = i), gl.bindTexture(texture.target, this.emptyTextures[texture.target].texture), boundTextures[i] = null);
    }
    /**
   * Ensures that current boundTextures all have FLOAT sampler type,
   * see {@link PIXI.SAMPLER_TYPES} for explanation.
   * @param maxTextures - number of locations to check
   */ ensureSamplerType(maxTextures) {
        const { boundTextures, hasIntegerTextures, CONTEXT_UID } = this;
        if (hasIntegerTextures) for(let i = maxTextures - 1; i >= 0; --i){
            const tex = boundTextures[i];
            tex && tex._glTextures[CONTEXT_UID].samplerType !== __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT && this.renderer.texture.unbind(tex);
        }
    }
    /**
   * Initialize a texture
   * @private
   * @param texture - Texture to initialize
   */ initTexture(texture) {
        const glTexture = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$GLTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLTexture"](this.gl.createTexture());
        return glTexture.dirtyId = -1, texture._glTextures[this.CONTEXT_UID] = glTexture, this.managedTextures.push(texture), texture.on("dispose", this.destroyTexture, this), glTexture;
    }
    initTextureType(texture, glTexture) {
        glTexture.internalFormat = this.internalFormats[texture.type]?.[texture.format] ?? texture.format, glTexture.samplerType = this.samplerTypes[glTexture.internalFormat] ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT, this.webGLVersion === 2 && texture.type === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"].HALF_FLOAT ? glTexture.type = this.gl.HALF_FLOAT : glTexture.type = texture.type;
    }
    /**
   * Update a texture
   * @private
   * @param {PIXI.BaseTexture} texture - Texture to initialize
   */ updateTexture(texture) {
        const glTexture = texture._glTextures[this.CONTEXT_UID];
        if (!glTexture) return;
        const renderer = this.renderer;
        if (this.initTextureType(texture, glTexture), texture.resource?.upload(renderer, texture, glTexture)) glTexture.samplerType !== __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"].FLOAT && (this.hasIntegerTextures = !0);
        else {
            const width = texture.realWidth, height = texture.realHeight, gl = renderer.gl;
            (glTexture.width !== width || glTexture.height !== height || glTexture.dirtyId < 0) && (glTexture.width = width, glTexture.height = height, gl.texImage2D(texture.target, 0, glTexture.internalFormat, width, height, 0, texture.format, glTexture.type, null));
        }
        texture.dirtyStyleId !== glTexture.dirtyStyleId && this.updateTextureStyle(texture), glTexture.dirtyId = texture.dirtyId;
    }
    /**
   * Deletes the texture from WebGL
   * @private
   * @param texture - the texture to destroy
   * @param [skipRemove=false] - Whether to skip removing the texture from the TextureManager.
   */ destroyTexture(texture, skipRemove) {
        const { gl } = this;
        if (texture = texture.castToBaseTexture(), texture._glTextures[this.CONTEXT_UID] && (this.unbind(texture), gl.deleteTexture(texture._glTextures[this.CONTEXT_UID].texture), texture.off("dispose", this.destroyTexture, this), delete texture._glTextures[this.CONTEXT_UID], !skipRemove)) {
            const i = this.managedTextures.indexOf(texture);
            i !== -1 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$removeItems$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeItems"])(this.managedTextures, i, 1);
        }
    }
    /**
   * Update texture style such as mipmap flag
   * @private
   * @param {PIXI.BaseTexture} texture - Texture to update
   */ updateTextureStyle(texture) {
        const glTexture = texture._glTextures[this.CONTEXT_UID];
        glTexture && ((texture.mipmap === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIPMAP_MODES"].POW2 || this.webGLVersion !== 2) && !texture.isPowerOfTwo ? glTexture.mipmap = !1 : glTexture.mipmap = texture.mipmap >= 1, this.webGLVersion !== 2 && !texture.isPowerOfTwo ? glTexture.wrapMode = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WRAP_MODES"].CLAMP : glTexture.wrapMode = texture.wrapMode, texture.resource?.style(this.renderer, texture, glTexture) || this.setStyle(texture, glTexture), glTexture.dirtyStyleId = texture.dirtyStyleId);
    }
    /**
   * Set style for texture
   * @private
   * @param texture - Texture to update
   * @param glTexture
   */ setStyle(texture, glTexture) {
        const gl = this.gl;
        if (glTexture.mipmap && texture.mipmap !== __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIPMAP_MODES"].ON_MANUAL && gl.generateMipmap(texture.target), gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, glTexture.wrapMode), gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, glTexture.wrapMode), glTexture.mipmap) {
            gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE_MODES"].LINEAR ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
            const anisotropicExt = this.renderer.context.extensions.anisotropicFiltering;
            if (anisotropicExt && texture.anisotropicLevel > 0 && texture.scaleMode === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE_MODES"].LINEAR) {
                const level = Math.min(texture.anisotropicLevel, gl.getParameter(anisotropicExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
                gl.texParameterf(texture.target, anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
            }
        } else gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE_MODES"].LINEAR ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, texture.scaleMode === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE_MODES"].LINEAR ? gl.LINEAR : gl.NEAREST);
    }
    destroy() {
        this.renderer = null;
    }
}
TextureSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "texture"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(TextureSystem);
;
 //# sourceMappingURL=TextureSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/transformFeedback/TransformFeedbackSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TransformFeedbackSystem",
    ()=>TransformFeedbackSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
;
class TransformFeedbackSystem {
    /**
   * @param renderer - The renderer this System works for.
   */ constructor(renderer){
        this.renderer = renderer;
    }
    /** Sets up the renderer context and necessary buffers. */ contextChange() {
        this.gl = this.renderer.gl, this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    }
    /**
   * Bind TransformFeedback and buffers
   * @param transformFeedback - TransformFeedback to bind
   */ bind(transformFeedback) {
        const { gl, CONTEXT_UID } = this, glTransformFeedback = transformFeedback._glTransformFeedbacks[CONTEXT_UID] || this.createGLTransformFeedback(transformFeedback);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, glTransformFeedback);
    }
    /** Unbind TransformFeedback */ unbind() {
        const { gl } = this;
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    }
    /**
   * Begin TransformFeedback
   * @param drawMode - DrawMode for TransformFeedback
   * @param shader - A Shader used by TransformFeedback. Current bound shader will be used if not provided.
   */ beginTransformFeedback(drawMode, shader) {
        const { gl, renderer } = this;
        shader && renderer.shader.bind(shader), gl.beginTransformFeedback(drawMode);
    }
    /** End TransformFeedback */ endTransformFeedback() {
        const { gl } = this;
        gl.endTransformFeedback();
    }
    /**
   * Create TransformFeedback and bind buffers
   * @param tf - TransformFeedback
   * @returns WebGLTransformFeedback
   */ createGLTransformFeedback(tf) {
        const { gl, renderer, CONTEXT_UID } = this, glTransformFeedback = gl.createTransformFeedback();
        tf._glTransformFeedbacks[CONTEXT_UID] = glTransformFeedback, gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, glTransformFeedback);
        for(let i = 0; i < tf.buffers.length; i++){
            const buffer = tf.buffers[i];
            buffer && (renderer.buffer.update(buffer), buffer._glBuffers[CONTEXT_UID].refCount++, gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, buffer._glBuffers[CONTEXT_UID].buffer || null));
        }
        return gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null), tf.disposeRunner.add(this), glTransformFeedback;
    }
    /**
   * Disposes TransfromFeedback
   * @param {PIXI.TransformFeedback} tf - TransformFeedback
   * @param {boolean} [contextLost=false] - If context was lost, we suppress delete TransformFeedback
   */ disposeTransformFeedback(tf, contextLost) {
        const glTF = tf._glTransformFeedbacks[this.CONTEXT_UID], gl = this.gl;
        tf.disposeRunner.remove(this);
        const bufferSystem = this.renderer.buffer;
        if (bufferSystem) for(let i = 0; i < tf.buffers.length; i++){
            const buffer = tf.buffers[i];
            if (!buffer) continue;
            const buf = buffer._glBuffers[this.CONTEXT_UID];
            buf && (buf.refCount--, buf.refCount === 0 && !contextLost && bufferSystem.dispose(buffer, contextLost));
        }
        glTF && (contextLost || gl.deleteTransformFeedback(glTF), delete tf._glTransformFeedbacks[this.CONTEXT_UID]);
    }
    destroy() {
        this.renderer = null;
    }
}
TransformFeedbackSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "transformFeedback"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(TransformFeedbackSystem);
;
 //# sourceMappingURL=TransformFeedbackSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/view/ViewSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ViewSystem",
    ()=>ViewSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/shapes/Rectangle.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
;
;
;
class ViewSystem {
    constructor(renderer){
        this.renderer = renderer;
    }
    /**
   * initiates the view system
   * @param {PIXI.ViewOptions} options - the options for the view
   */ init(options) {
        this.screen = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$shapes$2f$Rectangle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"](0, 0, options.width, options.height), this.element = options.view || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.createCanvas(), this.resolution = options.resolution || __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].RESOLUTION, this.autoDensity = !!options.autoDensity;
    }
    /**
   * Resizes the screen and canvas to the specified dimensions.
   * @param desiredScreenWidth - The new width of the screen.
   * @param desiredScreenHeight - The new height of the screen.
   */ resizeView(desiredScreenWidth, desiredScreenHeight) {
        this.element.width = Math.round(desiredScreenWidth * this.resolution), this.element.height = Math.round(desiredScreenHeight * this.resolution);
        const screenWidth = this.element.width / this.resolution, screenHeight = this.element.height / this.resolution;
        this.screen.width = screenWidth, this.screen.height = screenHeight, this.autoDensity && (this.element.style.width = `${screenWidth}px`, this.element.style.height = `${screenHeight}px`), this.renderer.emit("resize", screenWidth, screenHeight), this.renderer.runners.resize.emit(this.screen.width, this.screen.height);
    }
    /**
   * Destroys this System and optionally removes the canvas from the dom.
   * @param {boolean} [removeView=false] - Whether to remove the canvas from the DOM.
   */ destroy(removeView) {
        removeView && this.element.parentNode?.removeChild(this.element), this.renderer = null, this.element = null, this.screen = null;
    }
}
ViewSystem.defaultOptions = {
    /**
   * {@link PIXI.IRendererOptions.width}
   * @default 800
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ width: 800,
    /**
   * {@link PIXI.IRendererOptions.height}
   * @default 600
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ height: 600,
    /**
   * {@link PIXI.IRendererOptions.resolution}
   * @type {number}
   * @default PIXI.settings.RESOLUTION
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ resolution: void 0,
    /**
   * {@link PIXI.IRendererOptions.autoDensity}
   * @default false
   * @memberof PIXI.settings.RENDER_OPTIONS
   */ autoDensity: !1
}, /** @ignore */ ViewSystem.extension = {
    type: [
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].CanvasRendererSystem
    ],
    name: "_view"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(ViewSystem);
;
 //# sourceMappingURL=ViewSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/systems.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$background$2f$BackgroundSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/background/BackgroundSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$context$2f$ContextSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/context/ContextSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$FilterSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/FilterSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$FramebufferSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/FramebufferSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$GeometrySystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/GeometrySystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$MaskSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/MaskSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$ScissorSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/ScissorSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$StencilSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/StencilSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$plugin$2f$PluginSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/plugin/PluginSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$projection$2f$ProjectionSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/projection/ProjectionSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$GenerateTextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/GenerateTextureSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTextureSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$ShaderSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/ShaderSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$startup$2f$StartupSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/startup/StartupSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$StateSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/StateSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$system$2f$SystemManager$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/system/SystemManager.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureGCSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$transformFeedback$2f$TransformFeedbackSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/transformFeedback/TransformFeedbackSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$view$2f$ViewSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/view/ViewSystem.mjs [app-client] (ecmascript)");
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
 //# sourceMappingURL=systems.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/settings.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/logging/deprecation.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchRenderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/Filter.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Program.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$systems$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/systems.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$context$2f$ContextSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/context/ContextSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$background$2f$BackgroundSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/background/BackgroundSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$view$2f$ViewSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/view/ViewSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$startup$2f$StartupSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/startup/StartupSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureGCSystem.mjs [app-client] (ecmascript)");
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
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].PREFER_ENV = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].WEBGL2;
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].STRICT_TEXTURE_CACHE = !1;
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].RENDER_OPTIONS = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$context$2f$ContextSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ContextSystem"].defaultOptions,
    ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$background$2f$BackgroundSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BackgroundSystem"].defaultOptions,
    ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$view$2f$ViewSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ViewSystem"].defaultOptions,
    ...__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$startup$2f$StartupSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StartupSystem"].defaultOptions
};
Object.defineProperties(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"], {
    /**
   * @static
   * @name WRAP_MODE
   * @memberof PIXI.settings
   * @type {PIXI.WRAP_MODES}
   * @deprecated since 7.1.0
   * @see PIXI.BaseTexture.defaultOptions.wrapMode
   */ WRAP_MODE: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].defaultOptions.wrapMode;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.WRAP_MODE is deprecated, use BaseTexture.defaultOptions.wrapMode"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].defaultOptions.wrapMode = value;
        }
    },
    /**
   * @static
   * @name SCALE_MODE
   * @memberof PIXI.settings
   * @type {PIXI.SCALE_MODES}
   * @deprecated since 7.1.0
   * @see PIXI.BaseTexture.defaultOptions.scaleMode
   */ SCALE_MODE: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].defaultOptions.scaleMode;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.SCALE_MODE is deprecated, use BaseTexture.defaultOptions.scaleMode"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].defaultOptions.scaleMode = value;
        }
    },
    /**
   * @static
   * @name MIPMAP_TEXTURES
   * @memberof PIXI.settings
   * @type {PIXI.MIPMAP_MODES}
   * @deprecated since 7.1.0
   * @see PIXI.BaseTexture.defaultOptions.mipmap
   */ MIPMAP_TEXTURES: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].defaultOptions.mipmap;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.MIPMAP_TEXTURES is deprecated, use BaseTexture.defaultOptions.mipmap"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].defaultOptions.mipmap = value;
        }
    },
    /**
   * @static
   * @name ANISOTROPIC_LEVEL
   * @memberof PIXI.settings
   * @type {number}
   * @deprecated since 7.1.0
   * @see PIXI.BaseTexture.defaultOptions.anisotropicLevel
   */ ANISOTROPIC_LEVEL: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].defaultOptions.anisotropicLevel;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.ANISOTROPIC_LEVEL is deprecated, use BaseTexture.defaultOptions.anisotropicLevel"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"].defaultOptions.anisotropicLevel = value;
        }
    },
    /**
   * Default filter resolution.
   * @static
   * @name FILTER_RESOLUTION
   * @memberof PIXI.settings
   * @deprecated since 7.1.0
   * @type {number|null}
   * @see PIXI.Filter.defaultResolution
   */ FILTER_RESOLUTION: {
        get () {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.FILTER_RESOLUTION is deprecated, use Filter.defaultResolution"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Filter"].defaultResolution;
        },
        set (value) {
            __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Filter"].defaultResolution = value;
        }
    },
    /**
   * Default filter samples.
   * @static
   * @name FILTER_MULTISAMPLE
   * @memberof PIXI.settings
   * @deprecated since 7.1.0
   * @type {PIXI.MSAA_QUALITY}
   * @see PIXI.Filter.defaultMultisample
   */ FILTER_MULTISAMPLE: {
        get () {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.FILTER_MULTISAMPLE is deprecated, use Filter.defaultMultisample"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Filter"].defaultMultisample;
        },
        set (value) {
            __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Filter"].defaultMultisample = value;
        }
    },
    /**
   * The maximum textures that this device supports.
   * @static
   * @name SPRITE_MAX_TEXTURES
   * @memberof PIXI.settings
   * @deprecated since 7.1.0
   * @see PIXI.BatchRenderer.defaultMaxTextures
   * @type {number}
   */ SPRITE_MAX_TEXTURES: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchRenderer"].defaultMaxTextures;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.SPRITE_MAX_TEXTURES is deprecated, use BatchRenderer.defaultMaxTextures"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchRenderer"].defaultMaxTextures = value;
        }
    },
    /**
   * The default sprite batch size.
   *
   * The default aims to balance desktop and mobile devices.
   * @static
   * @name SPRITE_BATCH_SIZE
   * @memberof PIXI.settings
   * @see PIXI.BatchRenderer.defaultBatchSize
   * @deprecated since 7.1.0
   * @type {number}
   */ SPRITE_BATCH_SIZE: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchRenderer"].defaultBatchSize;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.SPRITE_BATCH_SIZE is deprecated, use BatchRenderer.defaultBatchSize"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchRenderer"].defaultBatchSize = value;
        }
    },
    /**
   * Can we upload the same buffer in a single frame?
   * @static
   * @name CAN_UPLOAD_SAME_BUFFER
   * @memberof PIXI.settings
   * @see PIXI.BatchRenderer.canUploadSameBuffer
   * @deprecated since 7.1.0
   * @type {boolean}
   */ CAN_UPLOAD_SAME_BUFFER: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchRenderer"].canUploadSameBuffer;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.CAN_UPLOAD_SAME_BUFFER is deprecated, use BatchRenderer.canUploadSameBuffer"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchRenderer"].canUploadSameBuffer = value;
        }
    },
    /**
   * Default Garbage Collection mode.
   * @static
   * @name GC_MODE
   * @memberof PIXI.settings
   * @type {PIXI.GC_MODES}
   * @deprecated since 7.1.0
   * @see PIXI.TextureGCSystem.defaultMode
   */ GC_MODE: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureGCSystem"].defaultMode;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.GC_MODE is deprecated, use TextureGCSystem.defaultMode"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureGCSystem"].defaultMode = value;
        }
    },
    /**
   * Default Garbage Collection max idle.
   * @static
   * @name GC_MAX_IDLE
   * @memberof PIXI.settings
   * @type {number}
   * @deprecated since 7.1.0
   * @see PIXI.TextureGCSystem.defaultMaxIdle
   */ GC_MAX_IDLE: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureGCSystem"].defaultMaxIdle;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.GC_MAX_IDLE is deprecated, use TextureGCSystem.defaultMaxIdle"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureGCSystem"].defaultMaxIdle = value;
        }
    },
    /**
   * Default Garbage Collection maximum check count.
   * @static
   * @name GC_MAX_CHECK_COUNT
   * @memberof PIXI.settings
   * @type {number}
   * @deprecated since 7.1.0
   * @see PIXI.TextureGCSystem.defaultCheckCountMax
   */ GC_MAX_CHECK_COUNT: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureGCSystem"].defaultCheckCountMax;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.GC_MAX_CHECK_COUNT is deprecated, use TextureGCSystem.defaultCheckCountMax"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureGCSystem"].defaultCheckCountMax = value;
        }
    },
    /**
   * Default specify float precision in vertex shader.
   * @static
   * @name PRECISION_VERTEX
   * @memberof PIXI.settings
   * @type {PIXI.PRECISION}
   * @deprecated since 7.1.0
   * @see PIXI.Program.defaultVertexPrecision
   */ PRECISION_VERTEX: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Program"].defaultVertexPrecision;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.PRECISION_VERTEX is deprecated, use Program.defaultVertexPrecision"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Program"].defaultVertexPrecision = value;
        }
    },
    /**
   * Default specify float precision in fragment shader.
   * @static
   * @name PRECISION_FRAGMENT
   * @memberof PIXI.settings
   * @type {PIXI.PRECISION}
   * @deprecated since 7.1.0
   * @see PIXI.Program.defaultFragmentPrecision
   */ PRECISION_FRAGMENT: {
        get () {
            return __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Program"].defaultFragmentPrecision;
        },
        set (value) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.1.0", "settings.PRECISION_FRAGMENT is deprecated, use Program.defaultFragmentPrecision"), __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Program"].defaultFragmentPrecision = value;
        }
    }
}); //# sourceMappingURL=settings.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/autoDetectRenderer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "autoDetectRenderer",
    ()=>autoDetectRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
;
const renderers = [];
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].handleByList(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].Renderer, renderers);
function autoDetectRenderer(options) {
    for (const RendererType of renderers)if (RendererType.test(options)) return new RendererType(options);
    throw new Error("Unable to auto-detect a suitable renderer.");
}
;
 //# sourceMappingURL=autoDetectRenderer.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/IFilterTarget.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//# sourceMappingURL=IFilterTarget.mjs.map
__turbopack_context__.s([]);
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/fragments/default.vert.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>$defaultVertex
]);
var $defaultVertex = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`;
;
 //# sourceMappingURL=default.vert.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/fragments/defaultFilter.vert.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>$defaultFilterVertex
]);
var $defaultFilterVertex = `attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;
;
 //# sourceMappingURL=defaultFilter.vert.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/fragments/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultFilterVertex",
    ()=>defaultFilterVertex,
    "defaultVertex",
    ()=>defaultVertex
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$fragments$2f$default$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/fragments/default.vert.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$fragments$2f$defaultFilter$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/fragments/defaultFilter.vert.mjs [app-client] (ecmascript)");
;
;
const defaultVertex = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$fragments$2f$default$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], defaultFilterVertex = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$fragments$2f$defaultFilter$2e$vert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/MultisampleSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MultisampleSystem",
    ()=>MultisampleSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
;
;
class MultisampleSystem {
    constructor(renderer){
        this.renderer = renderer;
    }
    contextChange(gl) {
        let samples;
        if (this.renderer.context.webGLVersion === 1) {
            const framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null), samples = gl.getParameter(gl.SAMPLES), gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        } else {
            const framebuffer = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null), samples = gl.getParameter(gl.SAMPLES), gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer);
        }
        samples >= __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].HIGH ? this.multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].HIGH : samples >= __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].MEDIUM ? this.multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].MEDIUM : samples >= __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].LOW ? this.multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].LOW : this.multisample = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"].NONE;
    }
    destroy() {}
}
MultisampleSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "_multisample"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(MultisampleSystem);
;
 //# sourceMappingURL=MultisampleSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/GLBuffer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GLBuffer",
    ()=>GLBuffer
]);
class GLBuffer {
    constructor(buffer){
        this.buffer = buffer || null, this.updateID = -1, this.byteLength = -1, this.refCount = 0;
    }
}
;
 //# sourceMappingURL=GLBuffer.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/BufferSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BufferSystem",
    ()=>BufferSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$GLBuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/GLBuffer.mjs [app-client] (ecmascript)");
;
;
class BufferSystem {
    /**
   * @param {PIXI.Renderer} renderer - The renderer this System works for.
   */ constructor(renderer){
        this.renderer = renderer, this.managedBuffers = {}, this.boundBufferBases = {};
    }
    /**
   * @ignore
   */ destroy() {
        this.renderer = null;
    }
    /** Sets up the renderer context and necessary buffers. */ contextChange() {
        this.disposeAll(!0), this.gl = this.renderer.gl, this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    }
    /**
   * This binds specified buffer. On first run, it will create the webGL buffers for the context too
   * @param buffer - the buffer to bind to the renderer
   */ bind(buffer) {
        const { gl, CONTEXT_UID } = this, glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
        gl.bindBuffer(buffer.type, glBuffer.buffer);
    }
    unbind(type) {
        const { gl } = this;
        gl.bindBuffer(type, null);
    }
    /**
   * Binds an uniform buffer to at the given index.
   *
   * A cache is used so a buffer will not be bound again if already bound.
   * @param buffer - the buffer to bind
   * @param index - the base index to bind it to.
   */ bindBufferBase(buffer, index) {
        const { gl, CONTEXT_UID } = this;
        if (this.boundBufferBases[index] !== buffer) {
            const glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
            this.boundBufferBases[index] = buffer, gl.bindBufferBase(gl.UNIFORM_BUFFER, index, glBuffer.buffer);
        }
    }
    /**
   * Binds a buffer whilst also binding its range.
   * This will make the buffer start from the offset supplied rather than 0 when it is read.
   * @param buffer - the buffer to bind
   * @param index - the base index to bind at, defaults to 0
   * @param offset - the offset to bind at (this is blocks of 256). 0 = 0, 1 = 256, 2 = 512 etc
   */ bindBufferRange(buffer, index, offset) {
        const { gl, CONTEXT_UID } = this;
        offset = offset || 0;
        const glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
        gl.bindBufferRange(gl.UNIFORM_BUFFER, index || 0, glBuffer.buffer, offset * 256, 256);
    }
    /**
   * Will ensure the data in the buffer is uploaded to the GPU.
   * @param {PIXI.Buffer} buffer - the buffer to update
   */ update(buffer) {
        const { gl, CONTEXT_UID } = this, glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
        if (buffer._updateID !== glBuffer.updateID) if (glBuffer.updateID = buffer._updateID, gl.bindBuffer(buffer.type, glBuffer.buffer), glBuffer.byteLength >= buffer.data.byteLength) gl.bufferSubData(buffer.type, 0, buffer.data);
        else {
            const drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;
            glBuffer.byteLength = buffer.data.byteLength, gl.bufferData(buffer.type, buffer.data, drawType);
        }
    }
    /**
   * Disposes buffer
   * @param {PIXI.Buffer} buffer - buffer with data
   * @param {boolean} [contextLost=false] - If context was lost, we suppress deleteVertexArray
   */ dispose(buffer, contextLost) {
        if (!this.managedBuffers[buffer.id]) return;
        delete this.managedBuffers[buffer.id];
        const glBuffer = buffer._glBuffers[this.CONTEXT_UID], gl = this.gl;
        buffer.disposeRunner.remove(this), glBuffer && (contextLost || gl.deleteBuffer(glBuffer.buffer), delete buffer._glBuffers[this.CONTEXT_UID]);
    }
    /**
   * dispose all WebGL resources of all managed buffers
   * @param {boolean} [contextLost=false] - If context was lost, we suppress `gl.delete` calls
   */ disposeAll(contextLost) {
        const all = Object.keys(this.managedBuffers);
        for(let i = 0; i < all.length; i++)this.dispose(this.managedBuffers[all[i]], contextLost);
    }
    /**
   * creates and attaches a GLBuffer object tied to the current context.
   * @param buffer
   * @protected
   */ createGLBuffer(buffer) {
        const { CONTEXT_UID, gl } = this;
        return buffer._glBuffers[CONTEXT_UID] = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$GLBuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLBuffer"](gl.createBuffer()), this.managedBuffers[buffer.id] = buffer, buffer.disposeRunner.add(this), buffer._glBuffers[CONTEXT_UID];
    }
}
BufferSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "buffer"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(BufferSystem);
;
 //# sourceMappingURL=BufferSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/IRenderer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//# sourceMappingURL=IRenderer.mjs.map
__turbopack_context__.s([]);
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/render/ObjectRendererSystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ObjectRendererSystem",
    ()=>ObjectRendererSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
;
class ObjectRendererSystem {
    // renderers scene graph!
    constructor(renderer){
        this.renderer = renderer;
    }
    /**
   * Renders the object to its WebGL view.
   * @param displayObject - The object to be rendered.
   * @param options - the options to be passed to the renderer
   */ render(displayObject, options) {
        const renderer = this.renderer;
        let renderTexture, clear, transform, skipUpdateTransform;
        if (options && (renderTexture = options.renderTexture, clear = options.clear, transform = options.transform, skipUpdateTransform = options.skipUpdateTransform), this.renderingToScreen = !renderTexture, renderer.runners.prerender.emit(), renderer.emit("prerender"), renderer.projection.transform = transform, !renderer.context.isLost) {
            if (renderTexture || (this.lastObjectRendered = displayObject), !skipUpdateTransform) {
                const cacheParent = displayObject.enableTempParent();
                displayObject.updateTransform(), displayObject.disableTempParent(cacheParent);
            }
            renderer.renderTexture.bind(renderTexture), renderer.batch.currentRenderer.start(), (clear ?? renderer.background.clearBeforeRender) && renderer.renderTexture.clear(), displayObject.render(renderer), renderer.batch.currentRenderer.flush(), renderTexture && (options.blit && renderer.framebuffer.blit(), renderTexture.baseTexture.update()), renderer.runners.postrender.emit(), renderer.projection.transform = null, renderer.emit("postrender");
        }
    }
    destroy() {
        this.renderer = null, this.lastObjectRendered = null;
    }
}
ObjectRendererSystem.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem,
    name: "objectRenderer"
};
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(ObjectRendererSystem);
;
 //# sourceMappingURL=ObjectRendererSystem.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/Renderer.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Renderer",
    ()=>Renderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/Matrix.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/logging/deprecation.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$browser$2f$isWebGLSupported$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/browser/isWebGLSupported.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/UniformGroup.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$system$2f$SystemManager$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/system/SystemManager.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
;
const _Renderer = class _Renderer2 extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$system$2f$SystemManager$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemManager"] {
    /**
   * @param {PIXI.IRendererOptions} [options] - See {@link PIXI.settings.RENDER_OPTIONS} for defaults.
   */ constructor(options){
        super(), this.type = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RENDERER_TYPE"].WEBGL, options = Object.assign({}, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].RENDER_OPTIONS, options), this.gl = null, this.CONTEXT_UID = 0, this.globalUniforms = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UniformGroup"]({
            projectionMatrix: new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$Matrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"]()
        }, !0);
        const systemConfig = {
            runners: [
                "init",
                "destroy",
                "contextChange",
                "resolutionChange",
                "reset",
                "update",
                "postrender",
                "prerender",
                "resize"
            ],
            systems: _Renderer2.__systems,
            priority: [
                "_view",
                "textureGenerator",
                "background",
                "_plugin",
                "startup",
                // low level WebGL systems
                "context",
                "state",
                "texture",
                "buffer",
                "geometry",
                "framebuffer",
                "transformFeedback",
                // high level pixi specific rendering
                "mask",
                "scissor",
                "stencil",
                "projection",
                "textureGC",
                "filter",
                "renderTexture",
                "batch",
                "objectRenderer",
                "_multisample"
            ]
        };
        this.setup(systemConfig), "useContextAlpha" in options && ((0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "options.useContextAlpha is deprecated, use options.premultipliedAlpha and options.backgroundAlpha instead"), options.premultipliedAlpha = options.useContextAlpha && options.useContextAlpha !== "notMultiplied", options.backgroundAlpha = options.useContextAlpha === !1 ? 1 : options.backgroundAlpha), this._plugin.rendererPlugins = _Renderer2.__plugins, this.options = options, this.startup.run(this.options);
    }
    /**
   * Create renderer if WebGL is available. Overrideable
   * by the **@pixi/canvas-renderer** package to allow fallback.
   * throws error if WebGL is not available.
   * @param options
   * @private
   */ static test(options) {
        return options?.forceCanvas ? !1 : (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$browser$2f$isWebGLSupported$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isWebGLSupported"])();
    }
    /**
   * Renders the object to its WebGL view.
   * @param displayObject - The object to be rendered.
   * @param {object} [options] - Object to use for render options.
   * @param {PIXI.RenderTexture} [options.renderTexture] - The render texture to render to.
   * @param {boolean} [options.clear=true] - Should the canvas be cleared before the new render.
   * @param {PIXI.Matrix} [options.transform] - A transform to apply to the render texture before rendering.
   * @param {boolean} [options.skipUpdateTransform=false] - Should we skip the update transform pass?
   */ render(displayObject, options) {
        this.objectRenderer.render(displayObject, options);
    }
    /**
   * Resizes the WebGL view to the specified width and height.
   * @param desiredScreenWidth - The desired width of the screen.
   * @param desiredScreenHeight - The desired height of the screen.
   */ resize(desiredScreenWidth, desiredScreenHeight) {
        this._view.resizeView(desiredScreenWidth, desiredScreenHeight);
    }
    /**
   * Resets the WebGL state so you can render things however you fancy!
   * @returns Returns itself.
   */ reset() {
        return this.runners.reset.emit(), this;
    }
    /** Clear the frame buffer. */ clear() {
        this.renderTexture.bind(), this.renderTexture.clear();
    }
    /**
   * Removes everything from the renderer (event listeners, spritebatch, etc...)
   * @param [removeView=false] - Removes the Canvas element from the DOM.
   *  See: https://github.com/pixijs/pixijs/issues/2233
   */ destroy(removeView = !1) {
        this.runners.destroy.items.reverse(), this.emitWithCustomOptions(this.runners.destroy, {
            _view: removeView
        }), super.destroy();
    }
    /** Collection of plugins */ get plugins() {
        return this._plugin.plugins;
    }
    /** The number of msaa samples of the canvas. */ get multisample() {
        return this._multisample.multisample;
    }
    /**
   * Same as view.width, actual number of pixels in the canvas by horizontal.
   * @member {number}
   * @readonly
   * @default 800
   */ get width() {
        return this._view.element.width;
    }
    /**
   * Same as view.height, actual number of pixels in the canvas by vertical.
   * @default 600
   */ get height() {
        return this._view.element.height;
    }
    /** The resolution / device pixel ratio of the renderer. */ get resolution() {
        return this._view.resolution;
    }
    set resolution(value) {
        this._view.resolution = value, this.runners.resolutionChange.emit(value);
    }
    /** Whether CSS dimensions of canvas view should be resized to screen dimensions automatically. */ get autoDensity() {
        return this._view.autoDensity;
    }
    /** The canvas element that everything is drawn to.*/ get view() {
        return this._view.element;
    }
    /**
   * Measurements of the screen. (0, 0, screenWidth, screenHeight).
   *
   * Its safe to use as filterArea or hitArea for the whole stage.
   * @member {PIXI.Rectangle}
   */ get screen() {
        return this._view.screen;
    }
    /** the last object rendered by the renderer. Useful for other plugins like interaction managers */ get lastObjectRendered() {
        return this.objectRenderer.lastObjectRendered;
    }
    /** Flag if we are rendering to the screen vs renderTexture */ get renderingToScreen() {
        return this.objectRenderer.renderingToScreen;
    }
    /** When logging Pixi to the console, this is the name we will show */ get rendererLogId() {
        return `WebGL ${this.context.webGLVersion}`;
    }
    /**
   * This sets weather the screen is totally cleared between each frame withthe background color and alpha
   * @deprecated since 7.0.0
   */ get clearBeforeRender() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.clearBeforeRender has been deprecated, please use renderer.background.clearBeforeRender instead."), this.background.clearBeforeRender;
    }
    /**
   * Pass-thru setting for the canvas' context `alpha` property. This is typically
   * not something you need to fiddle with. If you want transparency, use `backgroundAlpha`.
   * @deprecated since 7.0.0
   * @member {boolean}
   */ get useContextAlpha() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.useContextAlpha has been deprecated, please use renderer.context.premultipliedAlpha instead."), this.context.useContextAlpha;
    }
    /**
   * readonly drawing buffer preservation
   * we can only know this if Pixi created the context
   * @deprecated since 7.0.0
   */ get preserveDrawingBuffer() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.preserveDrawingBuffer has been deprecated, we cannot truly know this unless pixi created the context"), this.context.preserveDrawingBuffer;
    }
    /**
   * The background color to fill if not transparent
   * @member {number}
   * @deprecated since 7.0.0
   */ get backgroundColor() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.backgroundColor has been deprecated, use renderer.background.color instead."), this.background.color;
    }
    set backgroundColor(value) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.backgroundColor has been deprecated, use renderer.background.color instead."), this.background.color = value;
    }
    /**
   * The background color alpha. Setting this to 0 will make the canvas transparent.
   * @member {number}
   * @deprecated since 7.0.0
   */ get backgroundAlpha() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.backgroundAlpha has been deprecated, use renderer.background.alpha instead."), this.background.alpha;
    }
    /**
   * @deprecated since 7.0.0
   */ set backgroundAlpha(value) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.backgroundAlpha has been deprecated, use renderer.background.alpha instead."), this.background.alpha = value;
    }
    /**
   * @deprecated since 7.0.0
   */ get powerPreference() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$logging$2f$deprecation$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deprecation"])("7.0.0", "renderer.powerPreference has been deprecated, we can only know this if pixi creates the context"), this.context.powerPreference;
    }
    /**
   * Useful function that returns a texture of the display object that can then be used to create sprites
   * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
   * @param displayObject - The displayObject the object will be generated from.
   * @param {IGenerateTextureOptions} options - Generate texture options.
   * @param {PIXI.Rectangle} options.region - The region of the displayObject, that shall be rendered,
   *        if no region is specified, defaults to the local bounds of the displayObject.
   * @param {number} [options.resolution] - If not given, the renderer's resolution is used.
   * @param {PIXI.MSAA_QUALITY} [options.multisample] - If not given, the renderer's multisample is used.
   * @returns A texture of the graphics object.
   */ generateTexture(displayObject, options) {
        return this.textureGenerator.generateTexture(displayObject, options);
    }
};
_Renderer.extension = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].Renderer,
    priority: 1
}, /**
* Collection of installed plugins. These are included by default in PIXI, but can be excluded
* by creating a custom build. Consult the README for more information about creating custom
* builds and excluding plugins.
* @private
*/ _Renderer.__plugins = {}, /**
* The collection of installed systems.
* @private
*/ _Renderer.__systems = {};
let Renderer = _Renderer;
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].handleByMap(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererPlugin, Renderer.__plugins);
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].handleByMap(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"].RendererSystem, Renderer.__systems);
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"].add(Renderer);
;
 //# sourceMappingURL=Renderer.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/system/ISystem.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//# sourceMappingURL=ISystem.mjs.map
__turbopack_context__.s([]);
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/AbstractMultiResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AbstractMultiResource",
    ()=>AbstractMultiResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$autoDetectResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/autoDetectResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/Resource.mjs [app-client] (ecmascript)");
;
;
;
class AbstractMultiResource extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resource"] {
    /**
   * @param length
   * @param options - Options to for Resource constructor
   * @param {number} [options.width] - Width of the resource
   * @param {number} [options.height] - Height of the resource
   */ constructor(length, options){
        const { width, height } = options || {};
        super(width, height), this.items = [], this.itemDirtyIds = [];
        for(let i = 0; i < length; i++){
            const partTexture = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"]();
            this.items.push(partTexture), this.itemDirtyIds.push(-2);
        }
        this.length = length, this._load = null, this.baseTexture = null;
    }
    /**
   * Used from ArrayResource and CubeResource constructors.
   * @param resources - Can be resources, image elements, canvas, etc. ,
   *  length should be same as constructor length
   * @param options - Detect options for resources
   */ initFromArray(resources, options) {
        for(let i = 0; i < this.length; i++)resources[i] && (resources[i].castToBaseTexture ? this.addBaseTextureAt(resources[i].castToBaseTexture(), i) : resources[i] instanceof __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resource"] ? this.addResourceAt(resources[i], i) : this.addResourceAt((0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$autoDetectResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["autoDetectResource"])(resources[i], options), i));
    }
    /** Destroy this BaseImageResource. */ dispose() {
        for(let i = 0, len = this.length; i < len; i++)this.items[i].destroy();
        this.items = null, this.itemDirtyIds = null, this._load = null;
    }
    /**
   * Set a resource by ID
   * @param resource
   * @param index - Zero-based index of resource to set
   * @returns - Instance for chaining
   */ addResourceAt(resource, index) {
        if (!this.items[index]) throw new Error(`Index ${index} is out of bounds`);
        return resource.valid && !this.valid && this.resize(resource.width, resource.height), this.items[index].setResource(resource), this;
    }
    /**
   * Set the parent base texture.
   * @param baseTexture
   */ bind(baseTexture) {
        if (this.baseTexture !== null) throw new Error("Only one base texture per TextureArray is allowed");
        super.bind(baseTexture);
        for(let i = 0; i < this.length; i++)this.items[i].parentTextureArray = baseTexture, this.items[i].on("update", baseTexture.update, baseTexture);
    }
    /**
   * Unset the parent base texture.
   * @param baseTexture
   */ unbind(baseTexture) {
        super.unbind(baseTexture);
        for(let i = 0; i < this.length; i++)this.items[i].parentTextureArray = null, this.items[i].off("update", baseTexture.update, baseTexture);
    }
    /**
   * Load all the resources simultaneously
   * @returns - When load is resolved
   */ load() {
        if (this._load) return this._load;
        const promises = this.items.map((item)=>item.resource).filter((item)=>item).map((item)=>item.load());
        return this._load = Promise.all(promises).then(()=>{
            const { realWidth, realHeight } = this.items[0];
            return this.resize(realWidth, realHeight), this.update(), Promise.resolve(this);
        }), this._load;
    }
}
;
 //# sourceMappingURL=AbstractMultiResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ArrayResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrayResource",
    ()=>ArrayResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$AbstractMultiResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/AbstractMultiResource.mjs [app-client] (ecmascript)");
;
;
class ArrayResource extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$AbstractMultiResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AbstractMultiResource"] {
    /**
   * @param source - Number of items in array or the collection
   *        of image URLs to use. Can also be resources, image elements, canvas, etc.
   * @param options - Options to apply to {@link PIXI.autoDetectResource}
   * @param {number} [options.width] - Width of the resource
   * @param {number} [options.height] - Height of the resource
   */ constructor(source, options){
        const { width, height } = options || {};
        let urls, length;
        Array.isArray(source) ? (urls = source, length = source.length) : length = source, super(length, {
            width,
            height
        }), urls && this.initFromArray(urls, options);
    }
    /**
   * Set a baseTexture by ID,
   * ArrayResource just takes resource from it, nothing more
   * @param baseTexture
   * @param index - Zero-based index of resource to set
   * @returns - Instance for chaining
   */ addBaseTextureAt(baseTexture, index) {
        if (baseTexture.resource) this.addResourceAt(baseTexture.resource, index);
        else throw new Error("ArrayResource does not support RenderTexture");
        return this;
    }
    /**
   * Add binding
   * @param baseTexture
   */ bind(baseTexture) {
        super.bind(baseTexture), baseTexture.target = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TARGETS"].TEXTURE_2D_ARRAY;
    }
    /**
   * Upload the resources to the GPU.
   * @param renderer
   * @param texture
   * @param glTexture
   * @returns - whether texture was uploaded
   */ upload(renderer, texture, glTexture) {
        const { length, itemDirtyIds, items } = this, { gl } = renderer;
        glTexture.dirtyId < 0 && gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, glTexture.internalFormat, this._width, this._height, length, 0, texture.format, glTexture.type, null);
        for(let i = 0; i < length; i++){
            const item = items[i];
            itemDirtyIds[i] < item.dirtyId && (itemDirtyIds[i] = item.dirtyId, item.valid && gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, // xoffset
            0, // yoffset
            i, // zoffset
            item.resource.width, item.resource.height, 1, texture.format, glTexture.type, item.resource.source));
        }
        return !0;
    }
}
;
 //# sourceMappingURL=ArrayResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/CanvasResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CanvasResource",
    ()=>CanvasResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BaseImageResource.mjs [app-client] (ecmascript)");
;
class CanvasResource extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseImageResource"] {
    /**
   * @param source - Canvas element to use
   */ // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(source){
        super(source);
    }
    /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if source is HTMLCanvasElement or OffscreenCanvas
   */ static test(source) {
        const { OffscreenCanvas } = globalThis;
        return OffscreenCanvas && source instanceof OffscreenCanvas ? !0 : globalThis.HTMLCanvasElement && source instanceof HTMLCanvasElement;
    }
}
;
 //# sourceMappingURL=CanvasResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/CubeResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CubeResource",
    ()=>CubeResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$AbstractMultiResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/AbstractMultiResource.mjs [app-client] (ecmascript)");
;
;
const _CubeResource = class _CubeResource2 extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$AbstractMultiResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AbstractMultiResource"] {
    /**
   * @param {Array<string|PIXI.Resource>} [source] - Collection of URLs or resources
   *        to use as the sides of the cube.
   * @param options - ImageResource options
   * @param {number} [options.width] - Width of resource
   * @param {number} [options.height] - Height of resource
   * @param {number} [options.autoLoad=true] - Whether to auto-load resources
   * @param {number} [options.linkBaseTexture=true] - In case BaseTextures are supplied,
   *   whether to copy them or use
   */ constructor(source, options){
        const { width, height, autoLoad, linkBaseTexture } = options || {};
        if (source && source.length !== _CubeResource2.SIDES) throw new Error(`Invalid length. Got ${source.length}, expected 6`);
        super(6, {
            width,
            height
        });
        for(let i = 0; i < _CubeResource2.SIDES; i++)this.items[i].target = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TARGETS"].TEXTURE_CUBE_MAP_POSITIVE_X + i;
        this.linkBaseTexture = linkBaseTexture !== !1, source && this.initFromArray(source, options), autoLoad !== !1 && this.load();
    }
    /**
   * Add binding.
   * @param baseTexture - parent base texture
   */ bind(baseTexture) {
        super.bind(baseTexture), baseTexture.target = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TARGETS"].TEXTURE_CUBE_MAP;
    }
    addBaseTextureAt(baseTexture, index, linkBaseTexture) {
        if (linkBaseTexture === void 0 && (linkBaseTexture = this.linkBaseTexture), !this.items[index]) throw new Error(`Index ${index} is out of bounds`);
        if (!this.linkBaseTexture || baseTexture.parentTextureArray || Object.keys(baseTexture._glTextures).length > 0) if (baseTexture.resource) this.addResourceAt(baseTexture.resource, index);
        else throw new Error("CubeResource does not support copying of renderTexture.");
        else baseTexture.target = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TARGETS"].TEXTURE_CUBE_MAP_POSITIVE_X + index, baseTexture.parentTextureArray = this.baseTexture, this.items[index] = baseTexture;
        return baseTexture.valid && !this.valid && this.resize(baseTexture.realWidth, baseTexture.realHeight), this.items[index] = baseTexture, this;
    }
    /**
   * Upload the resource
   * @param renderer
   * @param _baseTexture
   * @param glTexture
   * @returns {boolean} true is success
   */ upload(renderer, _baseTexture, glTexture) {
        const dirty = this.itemDirtyIds;
        for(let i = 0; i < _CubeResource2.SIDES; i++){
            const side = this.items[i];
            (dirty[i] < side.dirtyId || glTexture.dirtyId < _baseTexture.dirtyId) && (side.valid && side.resource ? (side.resource.upload(renderer, side, glTexture), dirty[i] = side.dirtyId) : dirty[i] < -1 && (renderer.gl.texImage2D(side.target, 0, glTexture.internalFormat, _baseTexture.realWidth, _baseTexture.realHeight, 0, _baseTexture.format, glTexture.type, null), dirty[i] = -1));
        }
        return !0;
    }
    /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if source is an array of 6 elements
   */ static test(source) {
        return Array.isArray(source) && source.length === _CubeResource2.SIDES;
    }
};
_CubeResource.SIDES = 6;
let CubeResource = _CubeResource;
;
 //# sourceMappingURL=CubeResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ImageBitmapResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImageBitmapResource",
    ()=>ImageBitmapResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BaseImageResource.mjs [app-client] (ecmascript)");
;
;
;
class ImageBitmapResource extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseImageResource"] {
    /**
   * @param source - ImageBitmap or URL to use.
   * @param options - Options to use.
   */ constructor(source, options){
        options = options || {};
        let baseSource, url, ownsImageBitmap;
        typeof source == "string" ? (baseSource = ImageBitmapResource.EMPTY, url = source, ownsImageBitmap = !0) : (baseSource = source, url = null, ownsImageBitmap = !1), super(baseSource), this.url = url, this.crossOrigin = options.crossOrigin ?? !0, this.alphaMode = typeof options.alphaMode == "number" ? options.alphaMode : null, this.ownsImageBitmap = options.ownsImageBitmap ?? ownsImageBitmap, this._load = null, options.autoLoad !== !1 && this.load();
    }
    load() {
        return this._load ? this._load : (this._load = new Promise(async (resolve, reject)=>{
            if (this.url === null) {
                resolve(this);
                return;
            }
            try {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.fetch(this.url, {
                    mode: this.crossOrigin ? "cors" : "no-cors"
                });
                if (this.destroyed) return;
                const imageBlob = await response.blob();
                if (this.destroyed) return;
                const imageBitmap = await createImageBitmap(imageBlob, {
                    premultiplyAlpha: this.alphaMode === null || this.alphaMode === __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ALPHA_MODES"].UNPACK ? "premultiply" : "none"
                });
                if (this.destroyed) {
                    imageBitmap.close();
                    return;
                }
                this.source = imageBitmap, this.update(), resolve(this);
            } catch (e) {
                if (this.destroyed) return;
                reject(e), this.onError.emit(e);
            }
        }), this._load);
    }
    /**
   * Upload the image bitmap resource to GPU.
   * @param renderer - Renderer to upload to
   * @param baseTexture - BaseTexture for this resource
   * @param glTexture - GLTexture to use
   * @returns {boolean} true is success
   */ upload(renderer, baseTexture, glTexture) {
        return this.source instanceof ImageBitmap ? (typeof this.alphaMode == "number" && (baseTexture.alphaMode = this.alphaMode), super.upload(renderer, baseTexture, glTexture)) : (this.load(), !1);
    }
    /** Destroys this resource. */ dispose() {
        this.ownsImageBitmap && this.source instanceof ImageBitmap && this.source.close(), super.dispose(), this._load = null;
    }
    /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if current environment support ImageBitmap, and source is string or ImageBitmap
   */ static test(source) {
        return !!globalThis.createImageBitmap && typeof ImageBitmap < "u" && (typeof source == "string" || source instanceof ImageBitmap);
    }
    /**
   * ImageBitmap cannot be created synchronously, so a empty placeholder canvas is needed when loading from URLs.
   * Only for internal usage.
   * @returns The cached placeholder canvas.
   */ static get EMPTY() {
        return ImageBitmapResource._EMPTY = ImageBitmapResource._EMPTY ?? __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.createCanvas(0, 0), ImageBitmapResource._EMPTY;
    }
}
;
 //# sourceMappingURL=ImageBitmapResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/SVGResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SVGResource",
    ()=>SVGResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$uid$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/data/uid.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BaseImageResource.mjs [app-client] (ecmascript)");
;
;
;
const _SVGResource = class _SVGResource2 extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseImageResource"] {
    /**
   * @param sourceBase64 - Base64 encoded SVG element or URL for SVG file.
   * @param {object} [options] - Options to use
   * @param {number} [options.scale=1] - Scale to apply to SVG. Overridden by...
   * @param {number} [options.width] - Rasterize SVG this wide. Aspect ratio preserved if height not specified.
   * @param {number} [options.height] - Rasterize SVG this high. Aspect ratio preserved if width not specified.
   * @param {boolean} [options.autoLoad=true] - Start loading right away.
   */ constructor(sourceBase64, options){
        options = options || {}, super(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"].ADAPTER.createCanvas()), this._width = 0, this._height = 0, this.svg = sourceBase64, this.scale = options.scale || 1, this._overrideWidth = options.width, this._overrideHeight = options.height, this._resolve = null, this._crossorigin = options.crossorigin, this._load = null, options.autoLoad !== !1 && this.load();
    }
    load() {
        return this._load ? this._load : (this._load = new Promise((resolve)=>{
            if (this._resolve = ()=>{
                this.update(), resolve(this);
            }, _SVGResource2.SVG_XML.test(this.svg.trim())) {
                if (!btoa) throw new Error("Your browser doesn't support base64 conversions.");
                this.svg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(this.svg)))}`;
            }
            this._loadSvg();
        }), this._load);
    }
    /** Loads an SVG image from `imageUrl` or `data URL`. */ _loadSvg() {
        const tempImage = new Image();
        __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseImageResource"].crossOrigin(tempImage, this.svg, this._crossorigin), tempImage.src = this.svg, tempImage.onerror = (event)=>{
            this._resolve && (tempImage.onerror = null, this.onError.emit(event));
        }, tempImage.onload = ()=>{
            if (!this._resolve) return;
            const svgWidth = tempImage.width, svgHeight = tempImage.height;
            if (!svgWidth || !svgHeight) throw new Error("The SVG image must have width and height defined (in pixels), canvas API needs them.");
            let width = svgWidth * this.scale, height = svgHeight * this.scale;
            (this._overrideWidth || this._overrideHeight) && (width = this._overrideWidth || this._overrideHeight / svgHeight * svgWidth, height = this._overrideHeight || this._overrideWidth / svgWidth * svgHeight), width = Math.round(width), height = Math.round(height);
            const canvas = this.source;
            canvas.width = width, canvas.height = height, canvas._pixiId = `canvas_${(0, __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$data$2f$uid$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uid"])()}`, canvas.getContext("2d").drawImage(tempImage, 0, 0, svgWidth, svgHeight, 0, 0, width, height), this._resolve(), this._resolve = null;
        };
    }
    /**
   * Get size from an svg string using a regular expression.
   * @param svgString - a serialized svg element
   * @returns - image extension
   */ static getSize(svgString) {
        const sizeMatch = _SVGResource2.SVG_SIZE.exec(svgString), size = {};
        return sizeMatch && (size[sizeMatch[1]] = Math.round(parseFloat(sizeMatch[3])), size[sizeMatch[5]] = Math.round(parseFloat(sizeMatch[7]))), size;
    }
    /** Destroys this texture. */ dispose() {
        super.dispose(), this._resolve = null, this._crossorigin = null;
    }
    /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @param {string} extension - The extension of source, if set
   * @returns {boolean} - If the source is a SVG source or data file
   */ static test(source, extension) {
        return extension === "svg" || typeof source == "string" && source.startsWith("data:image/svg+xml") || typeof source == "string" && _SVGResource2.SVG_XML.test(source);
    }
};
_SVGResource.SVG_XML = /^(<\?xml[^?]+\?>)?\s*(<!--[^(-->)]*-->)?\s*\<svg/m, /**
* Regular expression for SVG size.
* @example &lt;svg width="100" height="100"&gt;&lt;/svg&gt;
* @readonly
*/ _SVGResource.SVG_SIZE = /<svg[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*>/i;
let SVGResource = _SVGResource;
;
 //# sourceMappingURL=SVGResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/VideoFrameResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VideoFrameResource",
    ()=>VideoFrameResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BaseImageResource.mjs [app-client] (ecmascript)");
;
class VideoFrameResource extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseImageResource"] {
    /**
   * @param source - Image element to use
   */ // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(source){
        super(source);
    }
    /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @returns {boolean} `true` if source is an VideoFrame
   */ static test(source) {
        return !!globalThis.VideoFrame && source instanceof globalThis.VideoFrame;
    }
}
;
 //# sourceMappingURL=VideoFrameResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/VideoResource.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VideoResource",
    ()=>VideoResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/ticker/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$Ticker$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/ticker/lib/Ticker.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BaseImageResource.mjs [app-client] (ecmascript)");
;
;
const _VideoResource = class _VideoResource2 extends __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseImageResource"] {
    /**
   * @param {HTMLVideoElement|object|string|Array<string|object>} source - Video element to use.
   * @param {object} [options] - Options to use
   * @param {boolean} [options.autoLoad=true] - Start loading the video immediately
   * @param {boolean} [options.autoPlay=true] - Start playing video immediately
   * @param {number} [options.updateFPS=0] - How many times a second to update the texture from the video.
   * If 0, `requestVideoFrameCallback` is used to update the texture.
   * If `requestVideoFrameCallback` is not available, the texture is updated every render.
   * @param {boolean} [options.crossorigin=true] - Load image using cross origin
   * @param {boolean} [options.loop=false] - Loops the video
   * @param {boolean} [options.muted=false] - Mutes the video audio, useful for autoplay
   * @param {boolean} [options.playsinline=true] - Prevents opening the video on mobile devices
   */ constructor(source, options){
        if (options = options || {}, !(source instanceof HTMLVideoElement)) {
            const videoElement = document.createElement("video");
            options.autoLoad !== !1 && videoElement.setAttribute("preload", "auto"), options.playsinline !== !1 && (videoElement.setAttribute("webkit-playsinline", ""), videoElement.setAttribute("playsinline", "")), options.muted === !0 && (videoElement.setAttribute("muted", ""), videoElement.muted = !0), options.loop === !0 && videoElement.setAttribute("loop", ""), options.autoPlay !== !1 && videoElement.setAttribute("autoplay", ""), typeof source == "string" && (source = [
                source
            ]);
            const firstSrc = source[0].src || source[0];
            __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseImageResource"].crossOrigin(videoElement, firstSrc, options.crossorigin);
            for(let i = 0; i < source.length; ++i){
                const sourceElement = document.createElement("source");
                let { src, mime } = source[i];
                if (src = src || source[i], src.startsWith("data:")) mime = src.slice(5, src.indexOf(";"));
                else if (!src.startsWith("blob:")) {
                    const baseSrc = src.split("?").shift().toLowerCase(), ext = baseSrc.slice(baseSrc.lastIndexOf(".") + 1);
                    mime = mime || _VideoResource2.MIME_TYPES[ext] || `video/${ext}`;
                }
                sourceElement.src = src, mime && (sourceElement.type = mime), videoElement.appendChild(sourceElement);
            }
            source = videoElement;
        }
        super(source), this.noSubImage = !0, this._autoUpdate = !0, this._isConnectedToTicker = !1, this._updateFPS = options.updateFPS || 0, this._msToNextUpdate = 0, this.autoPlay = options.autoPlay !== !1, this._videoFrameRequestCallback = this._videoFrameRequestCallback.bind(this), this._videoFrameRequestCallbackHandle = null, this._load = null, this._resolve = null, this._reject = null, this._onCanPlay = this._onCanPlay.bind(this), this._onError = this._onError.bind(this), this._onPlayStart = this._onPlayStart.bind(this), this._onPlayStop = this._onPlayStop.bind(this), this._onSeeked = this._onSeeked.bind(this), options.autoLoad !== !1 && this.load();
    }
    /**
   * Trigger updating of the texture.
   * @param _deltaTime - time delta since last tick
   */ update(_deltaTime = 0) {
        if (!this.destroyed) {
            if (this._updateFPS) {
                const elapsedMS = __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$Ticker$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Ticker"].shared.elapsedMS * this.source.playbackRate;
                this._msToNextUpdate = Math.floor(this._msToNextUpdate - elapsedMS);
            }
            (!this._updateFPS || this._msToNextUpdate <= 0) && (super.update(), this._msToNextUpdate = this._updateFPS ? Math.floor(1e3 / this._updateFPS) : 0);
        }
    }
    _videoFrameRequestCallback() {
        this.update(), this.destroyed ? this._videoFrameRequestCallbackHandle = null : this._videoFrameRequestCallbackHandle = this.source.requestVideoFrameCallback(this._videoFrameRequestCallback);
    }
    /**
   * Start preloading the video resource.
   * @returns {Promise<void>} Handle the validate event
   */ load() {
        if (this._load) return this._load;
        const source = this.source;
        return (source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height && (source.complete = !0), source.addEventListener("play", this._onPlayStart), source.addEventListener("pause", this._onPlayStop), source.addEventListener("seeked", this._onSeeked), this._isSourceReady() ? this._onCanPlay() : (source.addEventListener("canplay", this._onCanPlay), source.addEventListener("canplaythrough", this._onCanPlay), source.addEventListener("error", this._onError, !0)), this._load = new Promise((resolve, reject)=>{
            this.valid ? resolve(this) : (this._resolve = resolve, this._reject = reject, source.load());
        }), this._load;
    }
    /**
   * Handle video error events.
   * @param event
   */ _onError(event) {
        this.source.removeEventListener("error", this._onError, !0), this.onError.emit(event), this._reject && (this._reject(event), this._reject = null, this._resolve = null);
    }
    /**
   * Returns true if the underlying source is playing.
   * @returns - True if playing.
   */ _isSourcePlaying() {
        const source = this.source;
        return !source.paused && !source.ended;
    }
    /**
   * Returns true if the underlying source is ready for playing.
   * @returns - True if ready.
   */ _isSourceReady() {
        return this.source.readyState > 2;
    }
    /** Runs the update loop when the video is ready to play. */ _onPlayStart() {
        this.valid || this._onCanPlay(), this._configureAutoUpdate();
    }
    /** Fired when a pause event is triggered, stops the update loop. */ _onPlayStop() {
        this._configureAutoUpdate();
    }
    /** Fired when the video is completed seeking to the current playback position. */ _onSeeked() {
        this._autoUpdate && !this._isSourcePlaying() && (this._msToNextUpdate = 0, this.update(), this._msToNextUpdate = 0);
    }
    /** Fired when the video is loaded and ready to play. */ _onCanPlay() {
        const source = this.source;
        source.removeEventListener("canplay", this._onCanPlay), source.removeEventListener("canplaythrough", this._onCanPlay);
        const valid = this.valid;
        this._msToNextUpdate = 0, this.update(), this._msToNextUpdate = 0, !valid && this._resolve && (this._resolve(this), this._resolve = null, this._reject = null), this._isSourcePlaying() ? this._onPlayStart() : this.autoPlay && source.play();
    }
    /** Destroys this texture. */ dispose() {
        this._configureAutoUpdate();
        const source = this.source;
        source && (source.removeEventListener("play", this._onPlayStart), source.removeEventListener("pause", this._onPlayStop), source.removeEventListener("seeked", this._onSeeked), source.removeEventListener("canplay", this._onCanPlay), source.removeEventListener("canplaythrough", this._onCanPlay), source.removeEventListener("error", this._onError, !0), source.pause(), source.src = "", source.load()), super.dispose();
    }
    /** Should the base texture automatically update itself, set to true by default. */ get autoUpdate() {
        return this._autoUpdate;
    }
    set autoUpdate(value) {
        value !== this._autoUpdate && (this._autoUpdate = value, this._configureAutoUpdate());
    }
    /**
   * How many times a second to update the texture from the video. If 0, `requestVideoFrameCallback` is used to
   * update the texture. If `requestVideoFrameCallback` is not available, the texture is updated every render.
   * A lower fps can help performance, as updating the texture at 60fps on a 30ps video may not be efficient.
   */ get updateFPS() {
        return this._updateFPS;
    }
    set updateFPS(value) {
        value !== this._updateFPS && (this._updateFPS = value, this._configureAutoUpdate());
    }
    _configureAutoUpdate() {
        this._autoUpdate && this._isSourcePlaying() ? !this._updateFPS && this.source.requestVideoFrameCallback ? (this._isConnectedToTicker && (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$Ticker$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Ticker"].shared.remove(this.update, this), this._isConnectedToTicker = !1, this._msToNextUpdate = 0), this._videoFrameRequestCallbackHandle === null && (this._videoFrameRequestCallbackHandle = this.source.requestVideoFrameCallback(this._videoFrameRequestCallback))) : (this._videoFrameRequestCallbackHandle !== null && (this.source.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle), this._videoFrameRequestCallbackHandle = null), this._isConnectedToTicker || (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$Ticker$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Ticker"].shared.add(this.update, this), this._isConnectedToTicker = !0, this._msToNextUpdate = 0)) : (this._videoFrameRequestCallbackHandle !== null && (this.source.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle), this._videoFrameRequestCallbackHandle = null), this._isConnectedToTicker && (__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$Ticker$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Ticker"].shared.remove(this.update, this), this._isConnectedToTicker = !1, this._msToNextUpdate = 0));
    }
    /**
   * Used to auto-detect the type of resource.
   * @param {*} source - The source object
   * @param {string} extension - The extension of source, if set
   * @returns {boolean} `true` if video source
   */ static test(source, extension) {
        return globalThis.HTMLVideoElement && source instanceof HTMLVideoElement || _VideoResource2.TYPES.includes(extension);
    }
};
_VideoResource.TYPES = [
    "mp4",
    "m4v",
    "webm",
    "ogg",
    "ogv",
    "h264",
    "avi",
    "mov"
], /**
* Map of video MIME types that can't be directly derived from file extensions.
* @readonly
*/ _VideoResource.MIME_TYPES = {
    ogv: "video/ogg",
    mov: "video/quicktime",
    m4v: "video/mp4"
};
let VideoResource = _VideoResource;
;
 //# sourceMappingURL=VideoResource.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ArrayResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ArrayResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$autoDetectResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/autoDetectResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BufferResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BufferResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$CanvasResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/CanvasResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$CubeResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/CubeResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageBitmapResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ImageBitmapResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ImageResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$SVGResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/SVGResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$VideoFrameResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/VideoFrameResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$VideoResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/VideoResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BaseImageResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/Resource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$AbstractMultiResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/AbstractMultiResource.mjs [app-client] (ecmascript)");
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
__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$autoDetectResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["INSTALLED"].push(__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageBitmapResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImageBitmapResource"], __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImageResource"], __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$CanvasResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CanvasResource"], __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$VideoResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VideoResource"], __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$VideoFrameResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VideoFrameResource"], __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$SVGResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SVGResource"], __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BufferResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferResource"], __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$CubeResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CubeResource"], __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ArrayResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ArrayResource"]);
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/transformFeedback/TransformFeedback.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TransformFeedback",
    ()=>TransformFeedback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/Runner.mjs [app-client] (ecmascript)");
;
class TransformFeedback {
    constructor(){
        this._glTransformFeedbacks = {}, this.buffers = [], this.disposeRunner = new __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$Runner$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Runner"]("disposeTransformFeedback");
    }
    /**
   * Bind buffer to TransformFeedback
   * @param index - index to bind
   * @param buffer - buffer to bind
   */ bindBuffer(index, buffer) {
        this.buffers[index] = buffer;
    }
    /** Destroy WebGL resources that are connected to this TransformFeedback. */ destroy() {
        this.disposeRunner.emit(this, !1);
    }
}
;
 //# sourceMappingURL=TransformFeedback.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VERSION",
    ()=>VERSION
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/settings.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/color/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/ticker/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$autoDetectRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/autoDetectRenderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$background$2f$BackgroundSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/background/BackgroundSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchDrawCall$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchDrawCall.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchGeometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchGeometry.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchRenderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchShaderGenerator$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchShaderGenerator.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchTextureArray$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchTextureArray.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$ObjectRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/ObjectRenderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$context$2f$ContextSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/context/ContextSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/Filter.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$FilterState$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/FilterState.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$FilterSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/FilterSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$IFilterTarget$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/IFilterTarget.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$spriteMask$2f$SpriteMaskFilter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/spriteMask/SpriteMaskFilter.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$fragments$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/fragments/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$Framebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/Framebuffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$FramebufferSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/FramebufferSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$GLFramebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/GLFramebuffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$MultisampleSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/MultisampleSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Attribute$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Attribute.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Buffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$BufferSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/BufferSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Geometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Geometry.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$GeometrySystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/GeometrySystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$ViewableBuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/ViewableBuffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$IRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/IRenderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$MaskData$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/MaskData.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$MaskSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/MaskSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$ScissorSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/ScissorSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$StencilSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/StencilSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$plugin$2f$PluginSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/plugin/PluginSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$projection$2f$ProjectionSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/projection/ProjectionSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$render$2f$ObjectRendererSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/render/ObjectRendererSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$Renderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/Renderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$BaseRenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/BaseRenderTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$GenerateTextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/GenerateTextureSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexturePool$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTexturePool.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTextureSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$GLProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/GLProgram.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Program.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Shader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Shader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$ShaderSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/ShaderSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/UniformGroup.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$checkMaxIfStatementsInShader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/checkMaxIfStatementsInShader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateProgram.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateUniformBufferSync$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateUniformBufferSync.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getTestContext$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getTestContext.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/uniformParsers.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$unsafeEvalSupported$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/unsafeEvalSupported.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$startup$2f$StartupSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/startup/StartupSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$State$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/State.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$StateSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/StateSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$system$2f$ISystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/system/ISystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$systems$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/systems.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$GLTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/GLTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/Texture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureGCSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureMatrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureMatrix.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureUvs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureUvs.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$transformFeedback$2f$TransformFeedback$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/transformFeedback/TransformFeedback.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$transformFeedback$2f$TransformFeedbackSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/transformFeedback/TransformFeedbackSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$utils$2f$Quad$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/utils/Quad.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$utils$2f$QuadUv$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/utils/QuadUv.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$view$2f$ViewSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/view/ViewSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$system$2f$SystemManager$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/system/SystemManager.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BaseImageResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/Resource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$AbstractMultiResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/AbstractMultiResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ArrayResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ArrayResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$autoDetectResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/autoDetectResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BufferResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BufferResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$CanvasResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/CanvasResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$CubeResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/CubeResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageBitmapResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ImageBitmapResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ImageResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$SVGResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/SVGResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$VideoResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/VideoResource.mjs [app-client] (ecmascript)");
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
const VERSION = "7.4.3";
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALPHA_MODES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ALPHA_MODES"],
    "AbstractMultiResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$AbstractMultiResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AbstractMultiResource"],
    "ArrayResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ArrayResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ArrayResource"],
    "Attribute",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Attribute$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Attribute"],
    "BLEND_MODES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLEND_MODES"],
    "BUFFER_BITS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_BITS"],
    "BUFFER_TYPE",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUFFER_TYPE"],
    "BackgroundSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$background$2f$BackgroundSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BackgroundSystem"],
    "BaseImageResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseImageResource"],
    "BaseRenderTexture",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$BaseRenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseRenderTexture"],
    "BaseTexture",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseTexture"],
    "BatchDrawCall",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchDrawCall$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchDrawCall"],
    "BatchGeometry",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchGeometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchGeometry"],
    "BatchRenderer",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchRenderer"],
    "BatchShaderGenerator",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchShaderGenerator$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchShaderGenerator"],
    "BatchSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchSystem"],
    "BatchTextureArray",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchTextureArray$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BatchTextureArray"],
    "BrowserAdapter",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BrowserAdapter"],
    "Buffer",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"],
    "BufferResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BufferResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferResource"],
    "BufferSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$BufferSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferSystem"],
    "CLEAR_MODES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLEAR_MODES"],
    "COLOR_MASK_BITS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLOR_MASK_BITS"],
    "CanvasResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$CanvasResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CanvasResource"],
    "Circle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"],
    "Color",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"],
    "ContextSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$context$2f$ContextSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ContextSystem"],
    "CubeResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$CubeResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CubeResource"],
    "DEG_TO_RAD",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEG_TO_RAD"],
    "DRAW_MODES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DRAW_MODES"],
    "ENV",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"],
    "Ellipse",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Ellipse"],
    "ExtensionType",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExtensionType"],
    "FORMATS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FORMATS"],
    "Filter",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Filter"],
    "FilterState",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$FilterState$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FilterState"],
    "FilterSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$FilterSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FilterSystem"],
    "Framebuffer",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$Framebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Framebuffer"],
    "FramebufferSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$FramebufferSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FramebufferSystem"],
    "GC_MODES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GC_MODES"],
    "GLFramebuffer",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$GLFramebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLFramebuffer"],
    "GLProgram",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$GLProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLProgram"],
    "GLTexture",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$GLTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GLTexture"],
    "GenerateTextureSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$GenerateTextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GenerateTextureSystem"],
    "Geometry",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Geometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Geometry"],
    "GeometrySystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$GeometrySystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GeometrySystem"],
    "IGLUniformData",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$GLProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IGLUniformData"],
    "INSTALLED",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$autoDetectResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["INSTALLED"],
    "ImageBitmapResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageBitmapResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImageBitmapResource"],
    "ImageResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImageResource"],
    "MASK_TYPES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MASK_TYPES"],
    "MIPMAP_MODES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MIPMAP_MODES"],
    "MSAA_QUALITY",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MSAA_QUALITY"],
    "MaskData",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$MaskData$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MaskData"],
    "MaskSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$MaskSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MaskSystem"],
    "Matrix",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Matrix"],
    "MultisampleSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$MultisampleSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MultisampleSystem"],
    "ObjectRenderer",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$ObjectRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ObjectRenderer"],
    "ObjectRendererSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$render$2f$ObjectRendererSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ObjectRendererSystem"],
    "ObservablePoint",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ObservablePoint"],
    "PI_2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PI_2"],
    "PRECISION",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PRECISION"],
    "PluginSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$plugin$2f$PluginSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginSystem"],
    "Point",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Point"],
    "Polygon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polygon"],
    "Program",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Program"],
    "ProjectionSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$projection$2f$ProjectionSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProjectionSystem"],
    "Quad",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$utils$2f$Quad$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Quad"],
    "QuadUv",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$utils$2f$QuadUv$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuadUv"],
    "RAD_TO_DEG",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RAD_TO_DEG"],
    "RENDERER_TYPE",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RENDERER_TYPE"],
    "Rectangle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rectangle"],
    "RenderTexture",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RenderTexture"],
    "RenderTexturePool",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexturePool$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RenderTexturePool"],
    "RenderTextureSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RenderTextureSystem"],
    "Renderer",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$Renderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Renderer"],
    "Resource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resource"],
    "RoundedRectangle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RoundedRectangle"],
    "Runner",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Runner"],
    "SAMPLER_TYPES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SAMPLER_TYPES"],
    "SCALE_MODES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE_MODES"],
    "SHAPES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SHAPES"],
    "SVGResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$SVGResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SVGResource"],
    "ScissorSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$ScissorSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScissorSystem"],
    "Shader",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Shader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Shader"],
    "ShaderSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$ShaderSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShaderSystem"],
    "SpriteMaskFilter",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$spriteMask$2f$SpriteMaskFilter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SpriteMaskFilter"],
    "StartupSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$startup$2f$StartupSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StartupSystem"],
    "State",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$State$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["State"],
    "StateSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$StateSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StateSystem"],
    "StencilSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$StencilSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StencilSystem"],
    "SystemManager",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$system$2f$SystemManager$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemManager"],
    "TARGETS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TARGETS"],
    "TYPES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TYPES"],
    "Texture",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Texture"],
    "TextureGCSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureGCSystem"],
    "TextureMatrix",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureMatrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureMatrix"],
    "TextureSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureSystem"],
    "TextureUvs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureUvs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextureUvs"],
    "Ticker",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Ticker"],
    "TickerPlugin",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TickerPlugin"],
    "Transform",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Transform"],
    "TransformFeedback",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$transformFeedback$2f$TransformFeedback$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TransformFeedback"],
    "TransformFeedbackSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$transformFeedback$2f$TransformFeedbackSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TransformFeedbackSystem"],
    "UPDATE_PRIORITY",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UPDATE_PRIORITY"],
    "UniformGroup",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UniformGroup"],
    "VERSION",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["VERSION"],
    "VideoResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$VideoResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VideoResource"],
    "ViewSystem",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$view$2f$ViewSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ViewSystem"],
    "ViewableBuffer",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$ViewableBuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ViewableBuffer"],
    "WRAP_MODES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WRAP_MODES"],
    "autoDetectRenderer",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$autoDetectRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["autoDetectRenderer"],
    "autoDetectResource",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$autoDetectResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["autoDetectResource"],
    "checkMaxIfStatementsInShader",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$checkMaxIfStatementsInShader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkMaxIfStatementsInShader"],
    "createUBOElements",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateUniformBufferSync$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createUBOElements"],
    "defaultFilterVertex",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$fragments$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultFilterVertex"],
    "defaultVertex",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$fragments$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultVertex"],
    "extensions",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extensions"],
    "generateProgram",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateProgram"],
    "generateUniformBufferSync",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateUniformBufferSync$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateUniformBufferSync"],
    "getTestContext",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getTestContext$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTestContext"],
    "getUBOData",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateUniformBufferSync$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUBOData"],
    "groupD8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupD8"],
    "isMobile",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMobile"],
    "settings",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["settings"],
    "uniformParsers",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uniformParsers"],
    "unsafeEvalSupported",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$unsafeEvalSupported$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unsafeEvalSupported"],
    "utils",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$color$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/color/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$constants$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/constants/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$extensions$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/extensions/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$math$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/math/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$runner$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/runner/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$settings$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/settings/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$ticker$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/ticker/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$utils$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/utils/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$autoDetectRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/autoDetectRenderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$background$2f$BackgroundSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/background/BackgroundSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchDrawCall$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchDrawCall.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchGeometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchGeometry.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchRenderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchShaderGenerator$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchShaderGenerator.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$BatchTextureArray$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/BatchTextureArray.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$batch$2f$ObjectRenderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/batch/ObjectRenderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$context$2f$ContextSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/context/ContextSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$Filter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/Filter.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$FilterState$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/FilterState.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$FilterSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/FilterSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$filters$2f$spriteMask$2f$SpriteMaskFilter$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/filters/spriteMask/SpriteMaskFilter.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$fragments$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/fragments/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$Framebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/Framebuffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$FramebufferSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/FramebufferSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$GLFramebuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/GLFramebuffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$framebuffer$2f$MultisampleSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/framebuffer/MultisampleSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Attribute$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Attribute.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Buffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Buffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$BufferSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/BufferSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$Geometry$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/Geometry.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$GeometrySystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/GeometrySystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$geometry$2f$ViewableBuffer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/geometry/ViewableBuffer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$MaskData$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/MaskData.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$MaskSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/MaskSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$ScissorSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/ScissorSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$mask$2f$StencilSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/mask/StencilSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$plugin$2f$PluginSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/plugin/PluginSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$projection$2f$ProjectionSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/projection/ProjectionSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$render$2f$ObjectRendererSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/render/ObjectRendererSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$Renderer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/Renderer.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$BaseRenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/BaseRenderTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$GenerateTextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/GenerateTextureSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTexturePool$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTexturePool.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$renderTexture$2f$RenderTextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/renderTexture/RenderTextureSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$GLProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/GLProgram.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Program$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Program.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$Shader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/Shader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$ShaderSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/ShaderSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$UniformGroup$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/UniformGroup.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$checkMaxIfStatementsInShader$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/checkMaxIfStatementsInShader.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateProgram$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateProgram.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$generateUniformBufferSync$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/generateUniformBufferSync.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$getTestContext$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/getTestContext.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$uniformParsers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/uniformParsers.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$shader$2f$utils$2f$unsafeEvalSupported$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/shader/utils/unsafeEvalSupported.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$startup$2f$StartupSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/startup/StartupSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$State$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/State.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$state$2f$StateSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/state/StateSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$BaseTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/BaseTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$GLTexture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/GLTexture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$Texture$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/Texture.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureGCSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureGCSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureMatrix$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureMatrix.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$TextureUvs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/TextureUvs.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$transformFeedback$2f$TransformFeedback$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/transformFeedback/TransformFeedback.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$transformFeedback$2f$TransformFeedbackSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/transformFeedback/TransformFeedbackSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$utils$2f$Quad$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/utils/Quad.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$utils$2f$QuadUv$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/utils/QuadUv.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$view$2f$ViewSystem$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/view/ViewSystem.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$system$2f$SystemManager$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/system/SystemManager.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BaseImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BaseImageResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$Resource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/Resource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$AbstractMultiResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/AbstractMultiResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ArrayResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ArrayResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$autoDetectResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/autoDetectResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$BufferResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/BufferResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$CanvasResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/CanvasResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$CubeResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/CubeResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageBitmapResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ImageBitmapResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$ImageResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/ImageResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$SVGResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/SVGResource.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$star$2d$wars$2d$rpg$2f$node_modules$2f40$pixi$2f$core$2f$lib$2f$textures$2f$resources$2f$VideoResource$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/star-wars-rpg/node_modules/@pixi/core/lib/textures/resources/VideoResource.mjs [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=e14d1_%40pixi_core_lib_ecc41a10._.js.map