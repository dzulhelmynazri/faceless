import { isNonEmptyString } from "@faceless/utils";
import { defineMemory } from "eve/memory";
import { fileMemory } from "eve/memory/file";

export default defineMemory({
  description:
    "Remember durable lore, recurring characters, tone rules, and storyline continuity for this specific series.",
  provider: fileMemory(),
  scope(ctx) {
    const caller = ctx.session.auth.current;
    const tenantId = caller?.attributes.tenantId ?? caller?.principalId;
    const seriesId = caller?.attributes.seriesId;

    if (
      caller?.principalType !== "user" ||
      !isNonEmptyString(tenantId) ||
      !isNonEmptyString(seriesId)
    ) {
      return null;
    }

    return [tenantId, seriesId];
  },
  visibility: "scope",
});
