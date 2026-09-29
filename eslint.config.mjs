import { defineConfig, globalIgnores } from "eslint/config";
import checkFile from "eslint-plugin-check-file";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "check-file": checkFile,
    },
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: ["variable", "parameter"],
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["PascalCase"],
        },
      ],
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx}": "KEBAB_CASE",
        },
      ],
    },
  },
  {
    // schemas/column-types.ts is internal to db/ + schemas/; everyone else
    // takes those types from the owning module (@/schemas/quiz, @/schemas/video).
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/schemas/column-types",
              message:
                "Import from the owning module instead (@/schemas/quiz, @/schemas/video).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/db/**/*.ts", "src/schemas/**/*.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    // JSONB column shapes sit *below* db/schema.ts in the dependency graph
    // (db/schema.ts imports them), so they may depend only on zod + constants.
    files: ["src/schemas/column-types.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/db", "@/db/*", "@/ai", "@/ai/*", "@/schemas/*"],
              message:
                "JSONB shape files are leaves: import only zod and @/constants/*.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.md"],
    plugins: {
      "check-file": checkFile,
    },
    processor: "check-file/eslint-processor-check-file",
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.md": "KEBAB_CASE",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
