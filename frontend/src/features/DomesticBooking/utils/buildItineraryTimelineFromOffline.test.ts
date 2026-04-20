import { describe, expect, it } from "vitest";
import type { OfflineItineraryEntry } from "../offlineItinerary/types";
import { buildItineraryItemsFromOfflineEntries } from "./buildItineraryTimelineFromOffline";

describe("buildItineraryItemsFromOfflineEntries", () => {
  it("rolls arrival to the next calendar day when arrival time is before departure time", () => {
    const entry: OfflineItineraryEntry = {
      id: "jr-1",
      provider: "jr",
      cardTitle: "RAILWAY (JR)",
      displayDate: "2026-04-10",
      departureTime: "23:00",
      arrivalTime: "07:00",
      details: {
        jr_noReservationRequired: false,
        jr_transportType: "rail",
        jr_departureDate: "2026-04-10",
        jr_origin: "A",
        jr_destination: "B",
        jr_departureTime: "23:00",
        jr_arrivalTime: "07:00",
        jr_trainName: "",
        jr_trainNo: "",
        jr_seats: "",
        jr_returnOrigin: "",
        jr_returnDestination: "",
        jr_seatPreference1: "",
        jr_seatPreference2: "",
        jr_remarks: "",
      },
    };
    const [row] = buildItineraryItemsFromOfflineEntries([entry]);
    expect(row.arrivalTime).toBe("2026-04-11 07:00");
    expect(row.departureTime).toBe("2026-04-10 23:00");
  });

  it("maps offline hotel entries to HOTEL timeline rows", () => {
    const entry: OfflineItineraryEntry = {
      id: "hotel-1",
      type: "offline_hotel",
      checkIn: "2026-05-01",
      checkOut: "2026-05-03",
      accommodationCity: "Tokyo",
      firstPreference: "Hotel A",
      secondPreference: "",
      budgetMin: 10000,
      budgetMax: 20000,
      roomCondition: "Non-smoking",
      amenities: "Breakfast",
      roomCount: 1,
      roomType: "1 Bed",
      remarks: "",
    };
    const [row] = buildItineraryItemsFromOfflineEntries([entry]);
    expect(row.type).toBe("HOTEL");
    expect(row.supplier).toBe("OFFLINE");
    expect(row.originalRawData).toEqual(entry);
  });

  it("maps offline flight entries to FLIGHT timeline rows", () => {
    const entry: OfflineItineraryEntry = {
      id: "flight-1",
      provider: "flight",
      details: {
        flight_tripType: "return",
        flight_outbound_origin: "NRT",
        flight_outbound_destination: "CTS",
        flight_outbound_departureDate: "2026-07-01",
        flight_outbound_departureTime: "10:00",
        flight_outbound_arrivalDate: "2026-07-01",
        flight_outbound_arrivalTime: "11:30",
      },
    };
    const [row] = buildItineraryItemsFromOfflineEntries([entry]);
    expect(row.type).toBe("FLIGHT");
    expect(row.supplier).toBe("OFFLINE");
    expect(row.originalRawData).toEqual(entry);
    expect(row.originName).toBe("NRT");
    expect(row.destinationName).toBe("CTS");
  });
});
