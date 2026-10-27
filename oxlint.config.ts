import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import gdp from "ultracite/oxlint/gdp";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import next from "ultracite/oxlint/next";
import nextJsPlugins from "ultracite/oxlint/next/js-plugins";
import playwright from "ultracite/oxlint/playwright";
import react from "ultracite/oxlint/react";
import reactNative from "ultracite/oxlint/react-native";
import shadcn from "ultracite/oxlint/shadcn";
import tanstack from "ultracite/oxlint/tanstack";
import tanstackJsPlugins from "ultracite/oxlint/tanstack/js-plugins";
import vitest from "ultracite/oxlint/vitest";

const jsPlugins = selectJsPlugins(["react-doctor"]);

export default defineConfig({
  env: core.env,
  extends: [
    antiSlop,
    core,
    gdp,
    next,
    playwright,
    react,
    reactNative,
    shadcn,
    tanstack,
    vitest,
    nextJsPlugins,
    tanstackJsPlugins,
    jsPlugins,
  ],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    ".agents/**",
    ".claude/**",
    "**/src/env.ts",
  ],
  jsPlugins: [...jsPlugins.jsPlugins, ...shadcn.jsPlugins],
  settings: {
    ...jsPluginSettings,
    shadcn: { ui: "@faceless/ui/components" },
  },
  options: { typeAware: true },
  overrides: [
    {
      files: ["packages/ui/**", "**/packages/ui/**"],
      rules: {
        "func-style": "off",
        "react/function-component-definition": "off",
        "shadcn/no-raw-colors": "off",
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
        "shadcn/no-unknown-classes": "off",
        "shadcn/no-inline-styles": "off",
        "typescript/strict-boolean-expressions": "off",
        "typescript/no-unsafe-type-assertion": "off",
        "typescript/consistent-return": "off",
        "typescript/restrict-template-expressions": "off",
        "typescript/no-unsafe-assignment": "off",
        "typescript/no-unsafe-member-access": "off",
        "typescript/no-unsafe-argument": "off",
        "typescript/no-deprecated": "off",
        "typescript/promise-function-async": "off",
        "typescript/prefer-nullish-coalescing": "off",
        "gdp-ts/no-type-assertion": "off",
        "anti-slop/require-safety-comment-for-type-assertion": "off",
        "anti-slop/no-runtime-typeof": "off",
        "anti-slop/no-unknown-parameters": "off",
        "jsx-a11y/prefer-tag-over-role": "off",
        "jsx-a11y/no-noninteractive-element-interactions": "off",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/label-has-associated-control": "off",
        "react-doctor/only-export-components": "off",
        "react-doctor/no-prop-callback-in-effect": "off",
        "react-doctor/no-pass-live-state-to-parent": "off",
        "react-doctor/no-pass-data-to-parent": "off",
        "react-doctor/effect-needs-cleanup": "off",
        "react-doctor/prefer-dynamic-import": "off",
        "react-doctor/rerender-memo-before-early-return": "off",
        "react-doctor/js-combine-iterations": "off",
        "react-doctor/no-array-index-as-key": "off",
        "react/jsx-no-constructed-context-values": "off",
        "react/no-unstable-nested-components": "off",
        "react/hook-use-state": "off",
        "react/button-has-type": "off",
        "react/set-state-in-effect": "off",
        "react/todo": "off",
        "react/no-object-type-as-default-prop": "off",
        "react/no-danger": "off",
        "unicorn/prefer-export-from": "off",
        "unicorn/no-document-cookie": "off",
        "no-use-before-define": "off",
        "no-shadow": "off",
        "no-nested-ternary": "off",
        "no-eq-null": "off",
        eqeqeq: "off",
        "no-unused-expressions": "off",
        "no-param-reassign": "off",
        complexity: "off",
      },
    },
    {
      files: ["**/*.config.js", "**/babel.config.js", "**/metro.config.js"],
      rules: {
        "unicorn/prefer-module": "off",
        "node/global-require": "off",
        "typescript/no-require-imports": "off",
        "typescript/no-unsafe-call": "off",
        "typescript/no-unsafe-argument": "off",
        "typescript/no-unsafe-assignment": "off",
        "typescript/no-unsafe-member-access": "off",
      },
    },
    {
      files: ["apps/native/**"],
      rules: {
        "jsx-a11y/label-has-associated-control": "off",
        "jsx-a11y/prefer-tag-over-role": "off",
        "shadcn/no-inline-styles": "off",
        "shadcn/no-raw-colors": "off",
        "shadcn/no-unknown-classes": "off",
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
      },
    },
    {
      files: ["packages/remotion/**"],
      rules: {
        "shadcn/no-inline-styles": "off",
        "shadcn/no-raw-colors": "off",
        "shadcn/no-unknown-classes": "off",
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
        "react-doctor/no-inline-exhaustive-style": "off",
      },
    },
  ],
});
