import { describe, expect, it } from "vitest";
import { getDomesticConfirmationSubmitError } from "./domesticConfirmationSubmit";
import { formatLocalIsoDate } from "./todayDateString";

function daysFromTodayIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatLocalIsoDate(d);
}

describe("getDomesticConfirmationSubmitError", () => {
  it("returns null when delivery section is hidden", () => {
    expect(
      getDomesticConfirmationSubmitError({
        showDeliverySection: false,
        deliveryMethod: "",
        deliveryDate: "",
        deliveryTime: "",
        deliveryRemarks: "",
      }),
    ).toBeNull();
  });

  it("requires all delivery fields when JR delivery section is visible", () => {
    expect(
      getDomesticConfirmationSubmitError({
        showDeliverySection: true,
        deliveryMethod: "email",
        deliveryDate: "",
        deliveryTime: "morning",
        deliveryRemarks: "Leave at desk",
      }),
    ).toMatch(/complete delivery/i);
  });

  it("returns null when all delivery fields are filled with today or a future date", () => {
    expect(
      getDomesticConfirmationSubmitError({
        showDeliverySection: true,
        deliveryMethod: "email",
        deliveryDate: daysFromTodayIso(0),
        deliveryTime: "morning",
        deliveryRemarks: "OK",
      }),
    ).toBeNull();
  });

  it("rejects a delivery date in the past", () => {
    expect(
      getDomesticConfirmationSubmitError({
        showDeliverySection: true,
        deliveryMethod: "email",
        deliveryDate: daysFromTodayIso(-1),
        deliveryTime: "morning",
        deliveryRemarks: "OK",
      }),
    ).toMatch(/today or in the future/i);
  });
});
