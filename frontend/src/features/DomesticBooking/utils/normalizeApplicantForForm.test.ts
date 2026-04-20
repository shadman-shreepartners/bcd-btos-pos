import { describe, expect, it } from "vitest";
import { normalizeApplicantForForm } from "./normalizeApplicantForForm";

describe("normalizeApplicantForForm", () => {
  it("maps legacy arranger aliases to travel-arranger", () => {
    expect(normalizeApplicantForForm("travelArranger")).toBe("travel-arranger");
    expect(normalizeApplicantForForm("arranger")).toBe("travel-arranger");
  });

  it("preserves canonical values", () => {
    expect(normalizeApplicantForForm("travel-arranger")).toBe("travel-arranger");
    expect(normalizeApplicantForForm("traveller")).toBe("traveller");
  });

  it("defaults unknown or empty values to traveller", () => {
    expect(normalizeApplicantForForm(undefined)).toBe("traveller");
    expect(normalizeApplicantForForm(null)).toBe("traveller");
    expect(normalizeApplicantForForm("")).toBe("traveller");
    expect(normalizeApplicantForForm("other")).toBe("traveller");
  });
});
