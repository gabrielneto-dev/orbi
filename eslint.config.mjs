import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Better Auth fica isolado em src/server/auth (plan.md › Risk analysis): o resto do código
    // usa getSession()/createUserWithPassword() de "@/server/auth".
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    ignores: ["src/server/auth/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["better-auth", "better-auth/*", "@better-auth/*"],
              message: 'Use "@/server/auth": só src/server/auth importa o Better Auth.',
            },
          ],
        },
      ],
    },
  },
  // Desliga regras de estilo que conflitam com o Prettier (deve vir por último entre as configs).
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
