import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { ENV as env } from "../src/env";

const isString = (val: unknown): val is string => typeof val === "string";

const getScheme = (): string => {
  const schemeConfig = Constants.expoConfig?.scheme;

  if (isString(schemeConfig)) {
    return schemeConfig;
  }

  if (Array.isArray(schemeConfig)) {
    const [firstScheme] = schemeConfig;

    if (isString(firstScheme)) {
      return firstScheme;
    }
  }

  return "faceless";
};

const scheme = getScheme();

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_SERVER_URL,
  plugins: [
    expoClient({
      scheme,
      storage: SecureStore,
      storagePrefix: scheme,
    }),
  ],
});
