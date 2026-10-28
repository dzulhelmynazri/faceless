import { timingSafeEqual } from "node:crypto";

import { isNonEmptyString } from "@faceless/utils";

export const isBearerAuthorized = (
  authHeader: string | null,
  expectedSecret: string
): boolean => {
  if (!isNonEmptyString(authHeader)) {
    return false;
  }

  const encoder = new TextEncoder();
  const headerBuffer = encoder.encode(authHeader);
  const expectedBuffer = encoder.encode(`Bearer ${expectedSecret}`);

  if (headerBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(headerBuffer, expectedBuffer);
};
