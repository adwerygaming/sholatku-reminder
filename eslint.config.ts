import js from "@eslint/js";
import importPlugin from 'eslint-plugin-import';
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

// eslint-disable-next-line import/no-default-export
export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,

  {
    plugins: { import: importPlugin },
    rules: {
      'import/no-default-export': 'error',
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    }
  },

  {
    ignores: ["dist", "build", "node_modules"]
  }
]);
