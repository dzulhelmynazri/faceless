import { isNonEmptyString } from "@faceless/utils";

import { LocalRemotionRenderer } from "./local-renderer";
import { CloudflareContainerRenderer } from "./remote-renderer";
import type { VideoRendererService } from "./types";

export interface CreateVideoRendererOptions {
  serviceUrl?: string;
  serviceToken?: string;
}

export const createVideoRenderer = (
  options?: CreateVideoRendererOptions
): VideoRendererService => {
  if (
    isNonEmptyString(options?.serviceUrl) &&
    isNonEmptyString(options?.serviceToken)
  ) {
    return new CloudflareContainerRenderer({
      serviceToken: options.serviceToken,
      serviceUrl: options.serviceUrl,
    });
  }

  return new LocalRemotionRenderer();
};
