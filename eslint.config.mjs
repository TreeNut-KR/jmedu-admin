import pluginQuery from "@tanstack/eslint-plugin-query";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...pluginQuery.configs["flat/recommended"],
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    plugins: {
      import: importPlugin,
      "@typescript-eslint": typescriptEslint,
      "no-relative-import-paths": noRelativeImportPaths,
    },

    rules: {
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        {
          allowSameFolder: false,
          rootDir: "",
          prefix: "@",
        },
      ],

      "import/order": [
        "error",
        {
          groups: [["builtin", "external"], "internal", "type"],

          pathGroups: [
            {
              pattern: "next",
              group: "external",
              position: "after",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "after",
            },
            {
              pattern: "@/components",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/components/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/hooks",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/hooks/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/utils",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/utils/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/schema",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/schema/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/constants",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/constants/**",
              group: "internal",
              position: "after",
            },
          ],

          alphabetize: {
            order: "asc",
          },
        },
      ],
    },
  },
]);
