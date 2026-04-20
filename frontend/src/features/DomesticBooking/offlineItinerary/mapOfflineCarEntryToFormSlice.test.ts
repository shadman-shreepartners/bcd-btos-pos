import { describe, expect, it } from "vitest";
import { mapOfflineCarEntryToFormSlice } from "./mapOfflineCarEntryToFormSlice";
import type { OfflineCarItineraryEntry } from "./types";

describe("mapOfflineCarEntryToFormSlice", () => {
  it("maps ISO datetimes to local date/time fields and strings", () => {
    const entry: OfflineCarItineraryEntry = {
      id: "x",
      type: "offline_car",
      rentalDateTime: "2026-05-01T10:00:00.000Z",
      rentalCity: "Osaka",
      returnDateTime: "2026-05-03T18:00:00.000Z",
      returnCity: "Kyoto",
      numberOfCars: 1,
      rentalCarCompany: "Toyota Rent a Car",
      carSize: "Compact",
      driver: "Taro Yamada",
      remarks: "GPS",
    };
    const slice = mapOfflineCarEntryToFormSlice(entry);
    expect(slice.car_rentalCity).toBe("Osaka");
    expect(slice.car_returnCity).toBe("Kyoto");
    expect(slice.car_numberOfCars).toBe(1);
    expect(slice.car_driver).toBe("Taro Yamada");
    expect(slice.car_remarks).toBe("GPS");
    expect(slice.car_rentalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(slice.car_rentalTime).toMatch(/^\d{2}:\d{2}$/);
  });
});
