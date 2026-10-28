import { describe, expect, it } from "vitest";

import { calculateNextScheduledFor } from "../index";

describe("Renderer Module", () => {
  describe(calculateNextScheduledFor, () => {
    it("schedules for today if target time is in the future", () => {
      // Base date: 2026-10-28 08:00:00 UTC
      const baseDate = new Date("2026-10-28T08:00:00.000Z");
      const targetTime = "12:00 PM";

      const scheduled = calculateNextScheduledFor(targetTime, baseDate);

      expect(scheduled.toISOString()).toBe("2026-10-28T12:00:00.000Z");
    });

    it("schedules for tomorrow if target time has already passed today", () => {
      // Base date: 2026-10-28 14:00:00 UTC
      const baseDate = new Date("2026-10-28T14:00:00.000Z");
      const targetTime = "12:00 PM";

      const scheduled = calculateNextScheduledFor(targetTime, baseDate);

      expect(scheduled.toISOString()).toBe("2026-10-29T12:00:00.000Z");
    });

    it("correctly handles AM times", () => {
      // Base date: 2026-10-28 06:00:00 UTC
      const baseDate = new Date("2026-10-28T06:00:00.000Z");
      const targetTime = "09:30 AM";

      const scheduled = calculateNextScheduledFor(targetTime, baseDate);

      expect(scheduled.toISOString()).toBe("2026-10-28T09:30:00.000Z");
    });

    it("correctly handles midnight 12:00 AM", () => {
      // Base date: 2026-10-28 01:00:00 UTC
      const baseDate = new Date("2026-10-28T01:00:00.000Z");
      const targetTime = "12:00 AM";

      const scheduled = calculateNextScheduledFor(targetTime, baseDate);

      expect(scheduled.toISOString()).toBe("2026-10-29T00:00:00.000Z");
    });

    it("throws an error when publish time format is invalid", () => {
      expect(() => calculateNextScheduledFor("invalid-time")).toThrow(
        "Invalid publish time: invalid-time"
      );
    });
  });
});
