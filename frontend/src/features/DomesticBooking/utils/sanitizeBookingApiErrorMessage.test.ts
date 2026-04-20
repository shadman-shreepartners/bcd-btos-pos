import { describe, expect, it } from "vitest";
import { sanitizeBookingApiErrorMessage } from "./sanitizeBookingApiErrorMessage";

describe("sanitizeBookingApiErrorMessage", () => {
  it("returns short API messages unchanged", () => {
    expect(sanitizeBookingApiErrorMessage("Room is no longer available.")).toBe(
      "Room is no longer available.",
    );
  });

  it("replaces HTML error pages with a generic message", () => {
    expect(
      sanitizeBookingApiErrorMessage("<!DOCTYPE html><html><body>oops"),
    ).toBe("Failed to create booking. Please try again.");
  });

  it("rejects oversized bodies", () => {
    const long = "x".repeat(400);
    expect(sanitizeBookingApiErrorMessage(long)).toBe(
      "Failed to create booking. Please try again.",
    );
  });
});
