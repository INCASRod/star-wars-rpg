import type { NextConfig } from "next";
import { execSync } from "child_process";

let commitHash = 'unknown'
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim()
} catch {
  commitHash = 'unknown'
}

const nextConfig: NextConfig = {
  devIndicators: false,
  // Turbopack doesn't always execute re-exported side-effects inside pixi.js,
  // which prevents the WebGL renderer from registering before Application init.
  transpilePackages: ['pixi.js'],
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
    NEXT_PUBLIC_COMMIT_HASH: commitHash,
  },
};

export default nextConfig;
