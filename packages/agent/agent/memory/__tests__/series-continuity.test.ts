import { describe, expect, it } from "vitest";

import { getSeriesContinuityMemoryScopeKeys } from "../series-continuity";

describe("getSeriesContinuityMemoryScopeKeys extraction helper", () => {
  it("extracts scope keys tuple for authenticated user with tenant and series attributes", () => {
    const scopeKeys = getSeriesContinuityMemoryScopeKeys({
      attributes: {
        seriesId: "ser_123",
        tenantId: "org_abc",
      },
      principalId: "usr_456",
      principalType: "user",
    });

    expect(scopeKeys).toStrictEqual(["org_abc", "ser_123"]);
  });

  it("falls back to principalId as tenant identifier when attribute is absent", () => {
    const scopeKeys = getSeriesContinuityMemoryScopeKeys({
      attributes: {
        seriesId: "ser_123",
      },
      principalId: "usr_456",
      principalType: "user",
    });

    expect(scopeKeys).toStrictEqual(["usr_456", "ser_123"]);
  });

  it("rejects non-user principal types", () => {
    const scopeKeys = getSeriesContinuityMemoryScopeKeys({
      attributes: {
        seriesId: "ser_123",
        tenantId: "org_abc",
      },
      principalId: "srv_system",
      principalType: "service",
    });

    expect(scopeKeys).toBeNull();
  });

  it("rejects calls when seriesId attribute is missing or empty", () => {
    const missing = getSeriesContinuityMemoryScopeKeys({
      attributes: {
        tenantId: "org_abc",
      },
      principalId: "usr_456",
      principalType: "user",
    });

    const empty = getSeriesContinuityMemoryScopeKeys({
      attributes: {
        seriesId: "",
        tenantId: "org_abc",
      },
      principalId: "usr_456",
      principalType: "user",
    });

    expect(missing).toBeNull();
    expect(empty).toBeNull();
  });

  it("rejects calls when caller is null or undefined", () => {
    expect(getSeriesContinuityMemoryScopeKeys(null)).toBeNull();
    expect(getSeriesContinuityMemoryScopeKeys(undefined)).toBeNull();
  });
});
