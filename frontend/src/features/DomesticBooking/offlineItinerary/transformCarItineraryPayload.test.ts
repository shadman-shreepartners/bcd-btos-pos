import { describe, expect, it } from "vitest";
import { transformCarItineraryPayload } from "./transformCarItineraryPayload";

const baseCar = {
  car_rentalDate: "2026-06-15",
  car_rentalTime: "09:30",
  car_rentalCity: "Osaka",
  car_returnDate: "2026-06-16",
  car_returnTime: "18:00",
  car_returnCity: "Kyoto",
  car_numberOfCars: 2,
  car_rentalCarCompany: "Toyota",
  car_carSize: "Compact",
  car_driver: "Test",
  car_remarks: "  child seat  ",
};

describe("transformCarItineraryPayload", () => {
  it("returns offline_car payload with backend keys and parseable ISO datetimes", () => {
    const out = transformCarItineraryPayload(baseCar);
    expect(out.type).toBe("offline_car");
    expect(out.rentalCity).toBe("Osaka");
    expect(out.returnCity).toBe("Kyoto");
    expect(out.numberOfCars).toBe(2);
    expect(out.rentalCarCompany).toBe("Toyota");
    expect(out.carSize).toBe("Compact");
    expect(out.driver).toBe("Test");
    expect(out.remarks).toBe("child seat");
    expect(typeof out.id).toBe("string");
    expect(out.id.length).toBeGreaterThan(0);
    expect(Number.isNaN(new Date(out.rentalDateTime).getTime())).toBe(false);
    expect(Number.isNaN(new Date(out.returnDateTime).getTime())).toBe(false);
  });

  it("reuses existing id when editing", () => {
    const stableId = "car-entry-stable-id";
    const out = transformCarItineraryPayload(baseCar, stableId);
    expect(out.id).toBe(stableId);
  });
});
