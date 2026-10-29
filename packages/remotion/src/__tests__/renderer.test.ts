import { describe, expect, it } from "vitest";

import {
  CloudflareContainerRenderer,
  createVideoRenderer,
} from "../server/remote-renderer";

describe("VideoRenderer Factory", () => {
  it("returns CloudflareContainerRenderer when service credentials are provided", () => {
    const renderer = createVideoRenderer({
      serviceToken: "test-token",
      serviceUrl: "https://render.example.com",
    });

    expect(renderer).toBeInstanceOf(CloudflareContainerRenderer);
  });
});
