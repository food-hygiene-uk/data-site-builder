import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierConfig from "eslint-config-prettier";
import unicornPlugin from "eslint-plugin-unicorn";
import importPlugin from "eslint-plugin-import";
import jsdocPlugin from "eslint-plugin-jsdoc";
import promisePlugin from "eslint-plugin-promise";

/**
 * Exports the ESLint configuration using the `defineConfig` helper.
 * This configuration includes rules and plugins for TypeScript, JavaScript, and Prettier.
 */
export default defineConfig([
  // tsPlugin.configs.recommended needs to be spread or included as an object
  {
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },

  // Plugin configurations
  unicornPlugin.configs.recommended,
  promisePlugin.configs["flat/recommended"],

  {
    // Global settings for all files
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        Deno: "readonly",
        globalThis: "readonly",
        // Add other Deno/browser globals if needed
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        // Browser specific globals (if client-side code uses them)
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
        customElements: "readonly",
        HTMLElement: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // General rules
      "no-unused-vars": "off", // Use @typescript-eslint/no-unused-vars instead
      "unicorn/no-typeof-undefined": ["error", { checkGlobalVariables: true }],
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/no-null": "off", // Allow null
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "always",
          mjs: "always",
          mts: "always",
          ts: "always",
        },
      ],
    },
  },
  {
    // TypeScript specific settings (.mts files)
    files: ["**/*.mts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: null, // Deno doesn't use tsconfig.json in the same way
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      jsdoc: jsdocPlugin,
    },
    extends: ["jsdoc/flat/recommended-typescript"],
    rules: {
      // ...tsPlugin.configs["eslint-recommended"].rules, // This might need adjustment
      ...tsPlugin.configs.recommended.rules, // Already included above
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-non-null-assertion": "off", // Allow non-null assertions
      "jsdoc/tag-lines": ["error", "never", { startLines: 1 }], // Ensure space after description
    },
  },
  {
    // JavaScript Modules
    files: ["**/*.mjs"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      jsdoc: jsdocPlugin,
    },
    extends: ["jsdoc/flat/recommended-typescript-flavor"],
    rules: {
      "jsdoc/tag-lines": ["error", "never", { startLines: 1 }], // Ensure space after description
    },
  },
  {
    // JavaScript script files
    files: ["**/*.js"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      jsdoc: jsdocPlugin,
    },
    extends: ["jsdoc/flat/recommended-typescript-flavor"],
    rules: {
      "jsdoc/tag-lines": ["error", "never", { startLines: 1 }], // Ensure space after description
      "unicorn/prefer-module": "off", // Allow "use strict" in .js files
    },
  },
  {
    // Ignore patterns
    ignores: [
      "dist/",
      "build/",
      "deno.lock",
      "package.json",
      "deno.json",
      "assets/google*.html",
      "node_modules/",
      ".vscode/",
    ],
  },

  // Prettier config must be last to override other formatting rules
  prettierConfig,
]);
