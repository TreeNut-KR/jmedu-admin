import typescriptEslint from "@typescript-eslint/eslint-plugin";
import { defineConfig } from "eslint/config";
import eslintConfigNext from "eslint-config-next";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";

export default defineConfig([
  eslintConfigNext,
  {
    plugins: {
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
