import { readdirSync } from "node:fs";

import typescriptEslint from "@typescript-eslint/eslint-plugin";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import checkFile from "eslint-plugin-check-file";
import { defineConfig, globalIgnores } from "eslint/config";

// ---------------------------------------------------------------------------
// Layer boundaries (docs/architecture/backend.md → "Layers").
//
// `no-restricted-imports` is replaced, not merged, when several config blocks
// match a file, so every block below builds its complete option list through
// `restrict()`, which always adds the rules shared by the whole code base.
// ---------------------------------------------------------------------------

const MODULES = readdirSync("src/services").map((file) =>
  file.replace(/\.ts$/, ""),
);
const DAL_MODULES = readdirSync("src/dal");

const COLUMN_TYPES = {
  name: "@/schemas/column-types",
  message:
    "Import jsonb shapes from the owning module (@/schemas/quiz, @/schemas/video).",
};
const RELATIVE_IMPORTS = {
  group: [".", "..", "./*", "../*"],
  message:
    "Use the @/ alias. Relative imports are only allowed inside src/app route folders.",
};

const layer = (group, message) => ({ group, message });

const UI_FORBIDDEN = layer(
  ["@/db", "@/db/*", "@/dal/*", "@/ai", "@/ai/*", "@/lib/auth"],
  "UI reads data through services and writes through actions.",
);
const ACTION_FORBIDDEN = layer(
  ["@/db", "@/db/*", "@/dal/*", "@/ai", "@/ai/*"],
  "Actions only call services.",
);
const DAL_FORBIDDEN = layer(
  ["@/services/*", "@/actions/*", "@/ai", "@/ai/*"],
  "The DAL never calls upward.",
);
const SCHEMA_FORBIDDEN = layer(
  [
    "@/db/*",
    "!@/db/rows",
    "@/dal/*",
    "@/services/*",
    "@/actions/*",
    "@/ai",
    "@/ai/*",
  ],
  "Schemas derive only from @/db/rows and other schemas.",
);
const DB_FORBIDDEN = layer(
  [
    "@/dal/*",
    "@/services/*",
    "@/actions/*",
    "@/ai",
    "@/ai/*",
    "@/schemas/*",
    "!@/schemas/column-types",
  ],
  "db/ sits below schemas/: it may import only constants and column-types.",
);
const AI_FORBIDDEN = layer(
  ["@/db", "@/db/*", "@/dal/*", "@/services/*", "@/actions/*"],
  "AI tasks are pure: services orchestrate them and persist the results.",
);
const LIB_FORBIDDEN = layer(
  ["@/dal/*", "@/services/*", "@/actions/*", "@/ai", "@/ai/*"],
  "lib/ holds infrastructure and never depends on feature layers.",
);
const CONSTANTS_FORBIDDEN = layer(
  ["@/*", "!@/constants/*"],
  "constants/ may import only other constants.",
);

function restrict({
  paths = [],
  patterns = [],
  columnTypes = true,
  relative = true,
}) {
  return {
    "no-restricted-imports": [
      "error",
      {
        paths: [...(columnTypes ? [COLUMN_TYPES] : []), ...paths],
        patterns: [...(relative ? [RELATIVE_IMPORTS] : []), ...patterns],
      },
    ],
  };
}

// A service reads another module's data through that module's service, never
// through its DAL queries (writes may use any module's DAL mutations).
const serviceBlocks = MODULES.map((module) => ({
  files: [`src/services/${module}.ts`],
  rules: restrict({
    patterns: [
      layer(["@/actions/*"], "Services never call actions."),
      layer(
        DAL_MODULES.filter((dal) => dal !== module).map(
          (dal) => `@/dal/${dal}/queries`,
        ),
        "Read another module's data through its get…Service.",
      ),
    ],
  }),
}));

const BACKEND_DIRS = "src/{actions,ai,constants,dal,db,lib,schemas,services}";

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
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
          ],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{ts,tsx}": "KEBAB_CASE" },
      ],
      "check-file/folder-naming-convention": [
        "error",
        { "src/**/": "NEXT_JS_APP_ROUTER_CASE" },
      ],
    },
  },
  {
    // Backend modules expose named exports only; default exports are for
    // React components (docs/architecture/code-style.md → "Exports").
    files: [`${BACKEND_DIRS}/**/*.ts`],
    rules: { "import/no-default-export": "error" },
  },

  // ── Layer boundaries ──
  { files: ["src/**/*.{ts,tsx}"], rules: restrict({}) },
  {
    // Route folders import their own _components relatively.
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: restrict({ relative: false, patterns: [UI_FORBIDDEN] }),
  },
  {
    // Route handlers are server endpoints, not UI.
    files: ["src/app/api/**/*.ts"],
    rules: restrict({ relative: false }),
  },
  { files: ["src/actions/**/*.ts"], rules: restrict({ patterns: [ACTION_FORBIDDEN] }) },
  ...serviceBlocks,
  { files: ["src/dal/**/*.ts"], rules: restrict({ patterns: [DAL_FORBIDDEN] }) },
  {
    files: ["src/schemas/**/*.ts"],
    rules: restrict({
      columnTypes: false,
      paths: [{ name: "@/db", message: SCHEMA_FORBIDDEN.message }],
      patterns: [SCHEMA_FORBIDDEN],
    }),
  },
  {
    files: ["src/db/**/*.ts"],
    rules: restrict({ columnTypes: false, patterns: [DB_FORBIDDEN] }),
  },
  { files: ["src/ai/**/*.ts"], rules: restrict({ patterns: [AI_FORBIDDEN] }) },
  { files: ["src/lib/**/*.ts"], rules: restrict({ patterns: [LIB_FORBIDDEN] }) },
  {
    files: ["src/constants/**/*.ts"],
    rules: restrict({ patterns: [CONSTANTS_FORBIDDEN] }),
  },
  {
    // JSONB shapes sit *below* db/schema.ts in the dependency graph (it
    // imports them), so they may depend only on zod + constants.
    files: ["src/schemas/column-types.ts"],
    rules: restrict({
      columnTypes: false,
      patterns: [
        layer(
          ["@/db", "@/db/*", "@/ai", "@/ai/*", "@/schemas/*"],
          "JSONB shape files are leaves: import only zod and @/constants/*.",
        ),
      ],
    }),
  },
  {
    // shadcn-generated; kept as upstream ships it.
    files: ["src/components/ui/**/*.tsx"],
    rules: {
      "react/function-component-definition": "off",
      "import/order": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "import/consistent-type-specifier-style": "off",
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
