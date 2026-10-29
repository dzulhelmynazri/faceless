import { describe, expect, it } from "vitest";

import { calculateNextScheduledFor, resolveScheduledFor } from "../index";

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

  describe(resolveScheduledFor, () => {
    it("preserves existing scheduled date if it is in the future", () => {
      const futureDate = new Date(Date.now() + 86_400_000);
      const resolved = resolveScheduledFor(futureDate, "12:00 PM");

      expect(resolved.getTime()).toBe(futureDate.getTime());
    });

    it("calculates next scheduled date when existing date is null", () => {
      const resolved = resolveScheduledFor(null, "12:00 PM");

      expect(resolved.getTime()).toBeGreaterThan(Date.now());
    });

    it("recalculates scheduled date when existing date has already passed", () => {
      const pastDate = new Date(Date.now() - 86_400_000);
      const resolved = resolveScheduledFor(pastDate, "12:00 PM");

      expect(resolved.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
