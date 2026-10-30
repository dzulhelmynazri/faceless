import { captionStyleIdSchema } from "@faceless/contracts/series";
import { describe, expect, it } from "vitest";

import {
  CAPTION_PRESET_CONFIGS,
  getCaptionStyleConfig,
} from "../styles/caption-presets";

describe("caption presets configuration", () => {
  it("provides complete flex styling configuration for every contract style ID", () => {
    const allPresetsConfigured = captionStyleIdSchema.options.every((id) => {
      const config = getCaptionStyleConfig(id);

      return (
        config.containerStyle.display === "flex" &&
        config.wordStyle(true).display === "inline-block"
      );
    });

    expect(allPresetsConfigured).toBeTruthy();
  });

  it("applies distinct active colors across all presets", () => {
    const allHaveDistinctActiveColors = captionStyleIdSchema.options.every(
      (id) => {
        const config = CAPTION_PRESET_CONFIGS[id];
        const active = config.wordStyle(true);
        const inactive = config.wordStyle(false);

        return active.color !== inactive.color;
      }
    );

    expect(allHaveDistinctActiveColors).toBeTruthy();
  });

  it("configures clarity preset with rounded pill wrapper backdrop", () => {
    const clarityConfig = getCaptionStyleConfig("clarity");

    expect(clarityConfig.wrapperStyle?.borderRadius).toBe("9999px");
    expect(clarityConfig.wrapperStyle?.backdropFilter).toBe("blur(12px)");
  });
});
