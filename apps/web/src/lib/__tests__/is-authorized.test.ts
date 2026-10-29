import { describe, expect, it } from "vitest";

import { isBearerAuthorized } from "../is-authorized";

describe(isBearerAuthorized, () => {
  const secret = "cron_secret_key_123456";

  it("returns true for matching bearer authorization header", () => {
    expect(isBearerAuthorized(`Bearer ${secret}`, secret)).toBeTruthy();
  });

  it("returns false for null or empty authorization header", () => {
    expect(isBearerAuthorized(null, secret)).toBeFalsy();
    expect(isBearerAuthorized("", secret)).toBeFalsy();
    expect(isBearerAuthorized("   ", secret)).toBeFalsy();
  });

  it("returns false when header lacks Bearer prefix", () => {
    expect(isBearerAuthorized(secret, secret)).toBeFalsy();
    expect(isBearerAuthorized(`Basic ${secret}`, secret)).toBeFalsy();
    expect(isBearerAuthorized(`Token ${secret}`, secret)).toBeFalsy();
  });

  it("returns false for incorrect secret of matching length", () => {
    const wrongSameLength = "cron_secret_key_654321";

    expect(isBearerAuthorized(`Bearer ${wrongSameLength}`, secret)).toBeFalsy();
  });

  it("returns false for incorrect secret of differing length", () => {
    expect(isBearerAuthorized("Bearer short", secret)).toBeFalsy();
    expect(
      isBearerAuthorized("Bearer very_long_secret_string_value", secret)
    ).toBeFalsy();
  });
});
