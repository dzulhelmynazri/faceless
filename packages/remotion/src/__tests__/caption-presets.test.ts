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

  it("configures karaoke preset with active pill highlight", () => {
    const karaokeConfig = getCaptionStyleConfig("karaoke");
    const activeWord = karaokeConfig.wordStyle(true);
    const inactiveWord = karaokeConfig.wordStyle(false);

    expect(activeWord.backgroundColor).toBe("#06b6d4");
    expect(activeWord.borderRadius).toBe("16px");
    expect(inactiveWord.backgroundColor).toBe("transparent");
  });
});
