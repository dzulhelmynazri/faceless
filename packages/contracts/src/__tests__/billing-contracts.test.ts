import { describe, expect, it } from "vitest";

import { checkSeriesEntitlementOutputSchema } from "../billing";

describe("checkSeriesEntitlementOutputSchema contract", () => {
  it("validates active series entitlement when count is within limit", () => {
    const valid = checkSeriesEntitlementOutputSchema.safeParse({
      allowed: true,
      seriesCount: 2,
      seriesLimit: 5,
    });

    expect(valid.success).toBeTruthy();
  });

  it("validates entitlement payload when limit is exhausted", () => {
    const valid = checkSeriesEntitlementOutputSchema.safeParse({
      allowed: false,
      seriesCount: 5,
      seriesLimit: 5,
    });

    expect(valid.success).toBeTruthy();
  });

  it("rejects non-integer series count values", () => {
    const invalid = checkSeriesEntitlementOutputSchema.safeParse({
      allowed: true,
      seriesCount: 2.5,
      seriesLimit: 5,
    });

    expect(invalid.success).toBeFalsy();
  });

  it("rejects non-integer series limit values", () => {
    const invalid = checkSeriesEntitlementOutputSchema.safeParse({
      allowed: true,
      seriesCount: 1,
      seriesLimit: 3.14,
    });

    expect(invalid.success).toBeFalsy();
  });

  it("rejects payloads missing required fields", () => {
    const invalid = checkSeriesEntitlementOutputSchema.safeParse({
      allowed: true,
    });

    expect(invalid.success).toBeFalsy();
  });
});
