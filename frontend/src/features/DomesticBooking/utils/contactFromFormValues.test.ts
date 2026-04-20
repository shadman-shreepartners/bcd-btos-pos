import { describe, expect, it } from "vitest";
import { defaultDomesticFormValues } from "../domesticBookingTypes";
import { deriveContactForDomesticData } from "./contactFromFormValues";

describe("deriveContactForDomesticData", () => {
  it("uses arranger fields when applicant is travel-arranger", () => {
    const values = {
      ...defaultDomesticFormValues(),
      applicant: "travel-arranger" as const,
      applicant_name: "  Pat Lee  ",
      applicant_email: " pat@example.com ",
    };
    expect(deriveContactForDomesticData(values)).toEqual({
      name: "Pat Lee",
      email: "pat@example.com",
    });
  });

  it("returns empty name and email for traveller (no contact fields on form)", () => {
    const values = {
      ...defaultDomesticFormValues(),
      applicant: "traveller" as const,
      applicant_name: "Ignored",
      applicant_email: "ignored@example.com",
    };
    expect(deriveContactForDomesticData(values)).toEqual({
      name: "",
      email: "",
    });
  });
});
