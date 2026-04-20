import { describe, expect, it } from "vitest";
import { interpretDomesticBookingCreateResponse } from "./interpretDomesticBookingCreateResponse";

describe("interpretDomesticBookingCreateResponse", () => {
  it("returns success with tripId when id is a positive finite number", () => {
    const out = interpretDomesticBookingCreateResponse({
      id: 42,
      createdAt: "2026-04-16T12:00:00.000Z",
    });
    expect(out.kind).toBe("success");
    if (out.kind === "success") {
      expect(out.tripId).toMatch(/^BT-/);
      expect(out.response.id).toBe(42);
    }
  });

  it("uses serverReference as tripId when present", () => {
    const out = interpretDomesticBookingCreateResponse({
      id: 1,
      createdAt: "2026-04-16T12:00:00.000Z",
      serverReference: "ABC-123",
    });
    expect(out.kind).toBe("success");
    if (out.kind === "success") {
      expect(out.tripId).toBe("ABC-123");
    }
  });

  it("returns ambiguousHttpSuccess when id is zero", () => {
    expect(
      interpretDomesticBookingCreateResponse({
        id: 0,
        createdAt: "2026-04-16T12:00:00.000Z",
      }),
    ).toEqual({ kind: "ambiguousHttpSuccess" });
  });

  it("returns ambiguousHttpSuccess when id is negative", () => {
    expect(
      interpretDomesticBookingCreateResponse({
        id: -1,
        createdAt: "2026-04-16T12:00:00.000Z",
      }),
    ).toEqual({ kind: "ambiguousHttpSuccess" });
  });

  it("returns ambiguousHttpSuccess when id is not finite", () => {
    expect(
      interpretDomesticBookingCreateResponse({
        id: Number.NaN,
        createdAt: "2026-04-16T12:00:00.000Z",
      }),
    ).toEqual({ kind: "ambiguousHttpSuccess" });
  });
});
