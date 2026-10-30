import { describe, expect, it } from "vitest";

import { ensureCaptionFontsLoaded, FONT_FAMILIES } from "../styles/fonts";

describe("caption font styling and loader", () => {
  it("defines standard fallback font stacks for all supported font identifiers", () => {
    expect(FONT_FAMILIES).toStrictEqual({
      anton: "Anton, sans-serif",
      cinzel: "'Cinzel Decorative', serif",
      cormorant: "'Cormorant Garamond', serif",
      inter: "Inter, sans-serif",
      montserrat: "Montserrat, sans-serif",
      pressStart: "'Press Start 2P', monospace",
    });
  });

  it("ensures every fallback font stack ends with a valid generic CSS family", () => {
    const validGenericFallbacks = ["sans-serif", "serif", "monospace"];

    const allEndWithGeneric = Object.values(FONT_FAMILIES).every((fontStack) =>
      validGenericFallbacks.some((generic) => fontStack.endsWith(generic))
    );

    expect(allEndWithGeneric).toBeTruthy();
  });

  it("loads and returns font family names for all caption typography keys", () => {
    const loaded = ensureCaptionFontsLoaded();

    expect(loaded).toStrictEqual({
      anton: "Anton",
      cinzel: "Cinzel Decorative",
      cormorant: "Cormorant Garamond",
      inter: "Inter",
      montserrat: "Montserrat",
      pressStart: "Press Start TwoP",
    });
  });
});
