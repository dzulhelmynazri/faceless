import { describe, expect, it } from "vitest";

import { isNonEmptyString } from "../is-non-empty-string";

describe(isNonEmptyString, () => {
  it("returns true for non-empty strings", () => {
    expect(isNonEmptyString("hello")).toBeTruthy();
    expect(isNonEmptyString(" ")).toBeTruthy();
    expect(isNonEmptyString("🚀")).toBeTruthy();
  });

  it("returns false for empty string", () => {
    expect(isNonEmptyString("")).toBeFalsy();
  });

  it("returns false for null and undefined", () => {
    expect(isNonEmptyString(null)).toBeFalsy();
    expect(isNonEmptyString(undefined)).toBeFalsy();
  });

  it("returns false for non-string primitives and objects", () => {
    expect(isNonEmptyString(0)).toBeFalsy();
    expect(isNonEmptyString(100)).toBeFalsy();
    expect(isNonEmptyString(false)).toBeFalsy();
    expect(isNonEmptyString({})).toBeFalsy();
    expect(isNonEmptyString([])).toBeFalsy();
  });
});
