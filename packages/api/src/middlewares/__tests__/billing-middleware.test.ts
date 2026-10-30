import { Autumn } from "autumn-js";
import { describe, expect, it, vi } from "vitest";

import {
  checkSeriesEntitlement,
  getBillingCustomer,
  SERIES_FEATURE_ID,
} from "../billing";

interface AutumnCheckResponse {
  allowed: boolean;
  balance?: {
    granted: number;
    remaining: number;
    usage: number;
  };
}

const mockSession = {
  session: {
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 86_400_000),
    id: "sess_123",
    token: "tok_123",
    updatedAt: new Date(),
    userId: "usr_456",
  },
  user: {
    createdAt: new Date(),
    email: "creator@example.com",
    emailVerified: true,
    id: "usr_456",
    image: null,
    name: "Test Creator",
    updatedAt: new Date(),
  },
};

describe("billing middleware utilities", () => {
  it("defines the expected feature identifier constant", () => {
    expect(SERIES_FEATURE_ID).toBe("series");
  });

  it("extracts customer attributes from authenticated session", () => {
    const customer = getBillingCustomer({ session: mockSession });

    expect(customer).toStrictEqual({
      customerId: "usr_456",
      email: "creator@example.com",
      name: "Test Creator",
    });
  });

  it("synchronizes customer and queries entitlement when allowed", async () => {
    const autumn = new Autumn({ secretKey: "am_sk_test_key" });

    const getOrCreateSpy = vi
      .fn<() => Promise<{ id: string }>>()
      .mockResolvedValue({ id: "usr_456" });

    const checkSpy = vi
      .fn<() => Promise<AutumnCheckResponse>>()
      .mockResolvedValue({
        allowed: true,
        balance: { granted: 10, remaining: 7, usage: 3 },
      });

    Object.defineProperty(autumn, "customers", {
      configurable: true,
      value: { getOrCreate: getOrCreateSpy },
    });

    Object.defineProperty(autumn, "check", {
      configurable: true,
      value: checkSpy,
    });

    const result = await checkSeriesEntitlement({
      autumn,
      session: mockSession,
    });

    expect(result).toStrictEqual({
      allowed: true,
      balance: { granted: 10, remaining: 7, usage: 3 },
    });
    expect(getOrCreateSpy).toHaveBeenCalledWith({
      customerId: "usr_456",
      email: "creator@example.com",
      name: "Test Creator",
    });
    expect(checkSpy).toHaveBeenCalledWith({
      customerId: "usr_456",
      featureId: "series",
    });
  });

  it("returns disallowed response when limit is exceeded", async () => {
    const autumn = new Autumn({ secretKey: "am_sk_test_key" });

    Object.defineProperty(autumn, "customers", {
      configurable: true,
      value: {
        getOrCreate: vi
          .fn<() => Promise<{ id: string }>>()
          .mockResolvedValue({ id: "usr_456" }),
      },
    });

    Object.defineProperty(autumn, "check", {
      configurable: true,
      value: vi
        .fn<() => Promise<AutumnCheckResponse>>()
        .mockResolvedValue({ allowed: false }),
    });

    const result = await checkSeriesEntitlement({
      autumn,
      session: mockSession,
    });

    expect(result).toStrictEqual({ allowed: false });
  });

  it("propagates API rejection when customer synchronization fails", async () => {
    const autumn = new Autumn({ secretKey: "am_sk_test_key" });

    Object.defineProperty(autumn, "customers", {
      configurable: true,
      value: {
        getOrCreate: vi
          .fn<() => Promise<{ id: string }>>()
          .mockRejectedValue(new Error("Autumn API timeout")),
      },
    });

    await expect(
      checkSeriesEntitlement({
        autumn,
        session: mockSession,
      })
    ).rejects.toThrow("Autumn API timeout");
  });
});
