import { describe, expect, it } from "vitest";

import { tenantChannelAuth } from "../eve";

describe("tenantChannelAuth channel authenticator", () => {
  it("authenticates caller with user and series headers", () => {
    const request = new Request("https://faceless.app/api/channel", {
      headers: {
        "x-series-id": "ser_456",
        "x-user-id": "usr_123",
      },
    });

    const auth = tenantChannelAuth(request);

    expect(auth).toStrictEqual({
      attributes: {
        seriesId: "ser_456",
        tenantId: "usr_123",
      },
      authenticator: "faceless-app",
      issuer: "https://faceless.app",
      principalId: "usr_123",
      principalType: "user",
      subject: "usr_123",
    });
  });

  it("authenticates caller with tenant fallback header when user header is absent", () => {
    const request = new Request("https://faceless.app/api/channel", {
      headers: {
        "x-tenant-id": "org_789",
      },
    });

    const auth = tenantChannelAuth(request);

    expect(auth).toStrictEqual({
      attributes: {
        tenantId: "org_789",
      },
      authenticator: "faceless-app",
      issuer: "https://faceless.app",
      principalId: "org_789",
      principalType: "user",
      subject: "org_789",
    });
  });

  it("prioritizes x-user-id header over x-tenant-id header", () => {
    const request = new Request("https://faceless.app/api/channel", {
      headers: {
        "x-tenant-id": "org_secondary",
        "x-user-id": "usr_primary",
      },
    });

    const auth = tenantChannelAuth(request);

    expect(auth).toMatchObject({
      attributes: {
        tenantId: "usr_primary",
      },
      principalId: "usr_primary",
    });
  });

  it("returns null when both user and tenant headers are missing", () => {
    const request = new Request("https://faceless.app/api/channel");

    const auth = tenantChannelAuth(request);

    expect(auth).toBeNull();
  });

  it("returns null when user identifier header contains only empty whitespace", () => {
    const request = new Request("https://faceless.app/api/channel", {
      headers: {
        "x-user-id": "   ",
      },
    });

    const auth = tenantChannelAuth(request);

    expect(auth).toBeNull();
  });
});
