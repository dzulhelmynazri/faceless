import { isNonEmptyString } from "@faceless/utils";
import { defineMemory } from "eve/memory";
import { fileMemory } from "eve/memory/file";

export interface SeriesContinuityCaller {
  attributes: Record<string, string | readonly string[] | undefined>;
  principalId: string;
  principalType: string;
}

export const getSeriesContinuityMemoryScopeKeys = (
  caller: SeriesContinuityCaller | null | undefined
): [string, string] | null => {
  if (!caller || caller.principalType !== "user") {
    return null;
  }

  const { seriesId, tenantId: callerTenantId } = caller.attributes;

  const tenantId = isNonEmptyString(callerTenantId)
    ? callerTenantId
    : caller.principalId;

  if (!isNonEmptyString(tenantId) || !isNonEmptyString(seriesId)) {
    return null;
  }

  return [tenantId, seriesId];
};

export default defineMemory({
  description:
    "Remember durable lore, recurring characters, tone rules, and storyline continuity for this specific series.",
  provider: fileMemory(),
  scope(ctx) {
    return getSeriesContinuityMemoryScopeKeys(ctx.session.auth.current);
  },
});
