import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Ban the raw gold hex — import HUD.gold or COLOR.gold from @/lib/tokens instead.
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value='#C8AA50']",
          message: "Use HUD.gold or COLOR.gold from '@/lib/tokens' instead of '#C8AA50'.",
        },
      ],
    },
  },
]);

export default eslintConfig;
