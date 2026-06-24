import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "backend/**",
    "public/sw.js",
    // Optional AWS paths (also excluded from tsc)
    "v2-core/lambda/**",
    "v2-core/dynamodb/client.ts",
    "v2-core/dynamodb/dynamo-repository.ts",
    "v2-core/services/cognito-auth-service.ts",
    "v2-core/auth/cognito-jwt-verifier.ts",
    "v2-core/auth/context.ts",
  ]),
  {
    rules: {
      // Common hydration / sync-from-props patterns; refactor separately
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
]);

export default eslintConfig;
