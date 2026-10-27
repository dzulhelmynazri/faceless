import { defineAgent } from "eve";
import { auto } from "eve/models";

export default defineAgent({
  description:
    "Autonomous high-retention short-form video scriptwriter with Jev virality decision gates and vertical visual scene generation",
  model: auto({
    options: {
      "openai/gpt-4o":
        "Deep narrative pacing, psychological tension, historical detail, and layered suspense",
      "google/gemini-2.0-flash":
        "Fast, punchy short-form scripts, humor, and rapid ideation",
      "anthropic/claude-3-5-sonnet-20241022":
        "High-complexity narrative storytelling, character arcs, and nuanced emotional tone",
    },
  }),
});
