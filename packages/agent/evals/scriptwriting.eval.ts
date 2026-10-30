import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Evaluates short-form video script generation, viral hook mechanics, and 9:16 vertical scene direction.",
  async test(t) {
    await t.send(
      "Generate a 30-40 second video script about the Dyatlov Pass incident for a dark mystery niche. Art style: cinematic dark graphic novel."
    );

    t.succeeded();
    t.noFailedCalls();

    const judgments = t.judge({
      questions: {
        hookQuality: {
          type: "boolean",
          instructions:
            "Does the opening hook avoid clichés (e.g. 'Did you know', 'Have you ever wondered') and establish an immediate high-stakes curiosity gap?",
        },
        sceneDirection: {
          type: "boolean",
          instructions:
            "Does the response provide sequential visual scenes with descriptive 9:16 vertical camera angles and lighting direction?",
        },
        pacingCalibration: {
          type: "boolean",
          instructions:
            "Is the script pacing and narration length realistic and calibrated for a 30 to 40 second video?",
        },
      },
    });

    judgments.hookQuality.atLeast(0.85);
    judgments.sceneDirection.atLeast(0.8);
    judgments.pacingCalibration.atLeast(0.75);
  },
});
