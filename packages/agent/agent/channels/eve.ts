import { isNonEmptyString } from "@faceless/utils";
import { localDev } from "eve/channels/auth";
import type { AuthFn, AuthResult } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

const tenantChannelAuth: AuthFn = (request): AuthResult | null => {
  const userId =
    request.headers.get("x-user-id") ?? request.headers.get("x-tenant-id");

  const seriesId = request.headers.get("x-series-id");

  if (!isNonEmptyString(userId)) {
    return null;
  }

  if (isNonEmptyString(seriesId)) {
    return {
      authenticator: "faceless-app",
      issuer: "https://faceless.app",
      principalId: userId,
      principalType: "user" as const,
      subject: userId,
      attributes: { tenantId: userId, seriesId },
    };
  }

  return {
    authenticator: "faceless-app",
    issuer: "https://faceless.app",
    principalId: userId,
    principalType: "user" as const,
    subject: userId,
    attributes: { tenantId: userId },
  };
};

export default eveChannel({
  auth: [tenantChannelAuth, localDev()],
});
