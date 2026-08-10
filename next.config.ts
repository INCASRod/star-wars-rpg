import type { NextConfig } from "next";
import { execSync } from "child_process";
import path from "path";

let commitHash = 'unknown'
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim()
} catch {
  commitHash = 'unknown'
}

// This app sits one level below C:\Projects\Holocron, which carries its own
// stub package.json + package-lock.json (an `npm init -y` leftover with zero
// dependencies and no node_modules). Next saw two lockfiles, inferred the
// PARENT as the workspace root, and every Turbopack module id came out as
// `[project]/star-wars-rpg/...` — i.e. the file watcher was rooted a directory
// above the app. Both roots are pinned to this directory so the inference is
// no longer ambiguous. `__dirname` is available because package.json has no
// `"type": "module"`, so this config is loaded as CommonJS.
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  devIndicators: false,
  // Turbopack's own root: what `[project]/...` module ids are relative to.
  turbopack: { root: projectRoot },
  // Separate concern — the root for standalone-output file tracing. Pinned to
  // the same directory so the lockfile ambiguity cannot resurface here either.
  outputFileTracingRoot: projectRoot,
  // Turbopack doesn't always execute re-exported side-effects inside pixi.js,
  // which prevents the WebGL renderer from registering before Application init.
  transpilePackages: ['pixi.js'],
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
    NEXT_PUBLIC_COMMIT_HASH: commitHash,
  },
};

export default nextConfig;
