let _seed = 0;

export function seedRng(s) {
  _seed = (s ^ 0xdeadbeef) >>> 0;
}

export function rng() {
  _seed = (Math.imul(_seed, 1664525) + 1013904223) >>> 0;
  return _seed / 4294967296;
}

export function ri(n) { return Math.floor(rng() * n); }
export function pick(arr) { return arr[ri(arr.length)]; }

export function hashStr(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (Math.imul(h, 0x01000193)) >>> 0;
  }
  return h;
}
