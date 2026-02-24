import { describe, it, expect } from "vitest";
import { formatTimestamp } from "./TranscriptViewer";

describe("TranscriptViewer", () => {
  describe("formatTimestamp", () => {
    it("formats 0 seconds correctly", () => {
      expect(formatTimestamp(0)).toBe("00:00");
    });

    it("formats seconds less than a minute correctly", () => {
      expect(formatTimestamp(45)).toBe("00:45");
    });

    it("formats minutes and seconds correctly", () => {
      expect(formatTimestamp(65)).toBe("01:05");
    });

    it("formats longer durations correctly (ignoring hours)", () => {
      expect(formatTimestamp(3665)).toBe("01:05");
    });
  });
});
