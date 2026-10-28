import { describe, expect, it } from "vitest";

import { createVideoRenderer } from "../server/factory";
import { LocalRemotionRenderer } from "../server/local-renderer";
import { CloudflareContainerRenderer } from "../server/remote-renderer";

describe("VideoRenderer Factory", () => {
  it("defaults to LocalRemotionRenderer when options are empty", () => {
    const renderer = createVideoRenderer();
    expect(renderer).toBeInstanceOf(LocalRemotionRenderer);
  });

  it("returns CloudflareContainerRenderer when service credentials are provided", () => {
    const renderer = createVideoRenderer({
      serviceToken: "test-token",
      serviceUrl: "https://render.example.com",
    });

    expect(renderer).toBeInstanceOf(CloudflareContainerRenderer);
  });

  it("falls back to LocalRemotionRenderer if serviceUrl or serviceToken is blank", () => {
    const rendererNoToken = createVideoRenderer({
      serviceToken: "",
      serviceUrl: "https://render.example.com",
    });

    expect(rendererNoToken).toBeInstanceOf(LocalRemotionRenderer);

    const rendererNoUrl = createVideoRenderer({
      serviceToken: "test-token",
      serviceUrl: "",
    });

    expect(rendererNoUrl).toBeInstanceOf(LocalRemotionRenderer);
  });
});
