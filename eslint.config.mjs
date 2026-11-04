import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Local rule: ban a numeric literal as `zIndex` in TSX; use a layer from `Z` (src/lib/tokens.ts).
// Written as a local rule rather than a second no-restricted-syntax selector because ESLint allows only ONE
// severity per rule name, and the gold-hex ban below must stay an error while this is a warning: about a
// hundred legacy raw z-index sites still exist. The hard stop is the `npm run check:z` ratchet, not this rule.
const noNumericZIndex = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: { numeric: "Use a layer from Z in '@/lib/tokens' instead of a numeric zIndex." },
  },
  create(context) {
    const isNumber = (n) =>
      (n.type === "Literal" && typeof n.value === "number") ||
      (n.type === "UnaryExpression" && n.argument.type === "Literal" && typeof n.argument.value === "number");
    return {
      Property(node) {
        const k = node.key;
        const isZ = (k.type === "Identifier" && k.name === "zIndex") || (k.type === "Literal" && k.value === "zIndex");
        if (isZ && isNumber(node.value)) context.report({ node: node.value, messageId: "numeric" });
      },
    };
  },
};

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
    files: ["**/*.tsx"],
    plugins: { holocron: { rules: { "no-numeric-zindex": noNumericZIndex } } },
    rules: { "holocron/no-numeric-zindex": "warn" },
  },
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
