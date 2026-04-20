import { describe, expect, it } from "vitest";
import type { OfflineItineraryEntry } from "../offlineItinerary/types";
import { defaultDomesticFormValues } from "../domesticBookingTypes";
import { buildBookingCreatePayload } from "./bookingAdapter";

function baseDomesticData() {
  return {
    ...defaultDomesticFormValues(),
    step: 1,
    name: "",
    email: "",
  };
}

const sampleJrEntry = (id: string): OfflineItineraryEntry => ({
  id,
  provider: "jr",
  cardTitle: "RAILWAY (JR)",
  displayDate: "2026-04-01",
  departureTime: "09:00",
  arrivalTime: "11:00",
  details: {
    jr_noReservationRequired: false,
    jr_transportType: "rail",
    jr_transportationType: "",
    jr_ticketType: "",
    jr_departureDate: "2026-04-01",
    jr_origin: "Tokyo",
    jr_destination: "Osaka",
    jr_departureTime: "09:00",
    jr_arrivalTime: "11:00",
    jr_trainName: "Nozomi",
    jr_trainNo: "1",
    jr_seats: "",
    jr_seatType: "",
    jr_returnOrigin: "",
    jr_returnDestination: "",
    jr_seatPreference1: "Aisle",
    jr_seatPreference2: "",
    jr_remarks: "User JR note",
  },
});

describe("buildBookingCreatePayload", () => {
  it("merges confirmation notes into the first JR remarks row", () => {
    const payload = buildBookingCreatePayload(
      {
        ...baseDomesticData(),
        applicant: "travel-arranger",
        applicant_name: "Arranger Name",
        applicant_email: "arr@example.com",
        contact_no: "0312345678",
        offlineItineraries: [sampleJrEntry("a"), sampleJrEntry("b")],
      },
      {
        approverRemarks: "Please expedite",
        deliveryMethod: "Courier",
      },
    );
    expect(payload.itineraries[0].remarks).toContain("[Approver remarks]");
    expect(payload.itineraries[0].remarks).toContain("Please expedite");
    expect(payload.itineraries[0].remarks).toContain("User JR note");
    expect(payload.itineraries[0].remarks).toContain("[Travel arranger contact]");
    expect(payload.itineraries[1].remarks).toBe("User JR note");
    expect(payload.bookingRemarks).toBeUndefined();
  });

  it("attaches jrDeliveryConfirmation to the first JR segment in-memory (stripped in toDomesticBookingApiPayload)", () => {
    const payload = buildBookingCreatePayload(
      {
        ...baseDomesticData(),
        applicant: "traveller",
        offlineItineraries: [sampleJrEntry("jr-1"), sampleJrEntry("jr-2")],
      },
      {
        deliveryMethod: "email",
        deliveryDate: "2026-05-01",
        deliveryTime: "morning",
        deliveryRemarks: "Gate A",
        additionalEmails: [{ name: "A", email: "a@example.com" }],
      },
    );
    const first = payload.itineraries[0];
    expect(first.type).toBe("offline_jr");
    if (first.type !== "offline_jr") throw new Error("expected JR");
    expect(first.jrDeliveryConfirmation).toEqual({
      deliveryMethod: "email",
      expectedDeliveryDate: "2026-05-01",
      timeOfDay: "morning",
      remarks: "Gate A",
      additionalRecipients: [{ name: "A", email: "a@example.com" }],
    });
    const second = payload.itineraries[1];
    expect(second.type).toBe("offline_jr");
    if (second.type !== "offline_jr") throw new Error("expected JR");
    expect(second.jrDeliveryConfirmation).toBeUndefined();
  });

  it("uses bookingRemarks when there are no JR itinerary rows", () => {
    const payload = buildBookingCreatePayload(
      {
        ...baseDomesticData(),
        applicant: "traveller",
        offlineItineraries: [],
      },
      { approverRemarks: "Notes only" },
    );
    expect(payload.itineraries).toEqual([]);
    expect(payload.bookingRemarks).toContain("[Approver remarks]");
  });

  it("uses bookingRemarks for offline hotel when confirmation was not merged into JR remarks", () => {
    const payload = buildBookingCreatePayload(
      {
        ...baseDomesticData(),
        applicant: "traveller",
        offlineItineraries: [
          {
            id: "h1",
            type: "offline_hotel" as const,
            checkIn: "2026-04-01",
            checkOut: "2026-04-03",
            accommodationCity: "Kyoto",
            firstPreference: "A",
            secondPreference: "B",
            budgetMin: null,
            budgetMax: null,
            roomCondition: "Non-smoking",
            amenities: "",
            roomCount: 1,
            roomType: "Twin",
            remarks: "",
          },
        ],
      },
      { approverRemarks: "Hotel trip note" },
    );
    expect(payload.itineraries).toHaveLength(1);
    expect(payload.itineraries[0].type).toBe("offline_hotel");
    expect(payload.bookingRemarks).toContain("[Approver remarks]");
    expect(payload.bookingRemarks).toContain("Hotel trip note");
  });

  it("maps offline flight oneway to a single offline_flight itinerary with ISO datetimes", () => {
    const payload = buildBookingCreatePayload({
      ...baseDomesticData(),
      applicant: "traveller",
      offlineItineraries: [
        {
          id: "f1",
          provider: "flight" as const,
          details: {
            flight_tripType: "oneway",
            flight_outbound_origin: "HND",
            flight_outbound_destination: "ITM",
            flight_outbound_departureDate: "2026-06-15",
            flight_outbound_departureTime: "08:30",
            flight_outbound_arrivalDate: "2026-06-15",
            flight_outbound_arrivalTime: "09:45",
            flight_outbound_airline: "JL",
            flight_outbound_flightNo: "123",
            flight_outbound_cabinClass: "business",
            flight_seatPreference: "Window",
            flight_remarks: "Veg meal",
          },
        },
      ],
    });
    expect(payload.itineraries).toHaveLength(1);
    const row = payload.itineraries[0];
    expect(row.type).toBe("offline_flight");
    if (row.type !== "offline_flight") throw new Error("expected offline_flight");
    expect(row.tripType).toBe("oneway");
    expect(row.isReturn).toBe(false);
    expect(row.departureCity).toBe("HND");
    expect(row.arrivalCity).toBe("ITM");
    expect(row.airline).toBe("JL");
    expect(row.flightNumber).toBe("123");
    expect(row.cabinClass).toBe("business");
    expect(row.seatPreference).toBe("Window");
    expect(row.remarks).toBe("Veg meal");
    expect(row.departureDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(row.arrivalDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("maps offline flight return to two offline_flight legs", () => {
    const payload = buildBookingCreatePayload({
      ...baseDomesticData(),
      applicant: "traveller",
      offlineItineraries: [
        {
          id: "f2",
          provider: "flight" as const,
          details: {
            flight_tripType: "return",
            flight_outbound_origin: "NRT",
            flight_outbound_destination: "CTS",
            flight_outbound_departureDate: "2026-07-01",
            flight_outbound_departureTime: "10:00",
            flight_outbound_arrivalDate: "2026-07-01",
            flight_outbound_arrivalTime: "11:30",
            flight_outbound_airline: "NH",
            flight_outbound_flightNo: "55",
            flight_return_origin: "CTS",
            flight_return_destination: "NRT",
            flight_return_departureDate: "2026-07-05",
            flight_return_departureTime: "14:00",
            flight_return_arrivalDate: "2026-07-05",
            flight_return_arrivalTime: "15:30",
            flight_return_airline: "NH",
            flight_return_flightNo: "56",
            flight_seatPreference: "Aisle",
            flight_remarks: "",
          },
        },
      ],
    });
    expect(payload.itineraries).toHaveLength(2);
    const out = payload.itineraries[0];
    const ret = payload.itineraries[1];
    expect(out.type).toBe("offline_flight");
    expect(ret.type).toBe("offline_flight");
    if (out.type !== "offline_flight" || ret.type !== "offline_flight")
      throw new Error("expected offline_flight");
    expect(out.isReturn).toBe(false);
    expect(out.tripType).toBe("return");
    expect(ret.isReturn).toBe(true);
    expect(ret.tripType).toBe("return");
    expect(out.departureCity).toBe("NRT");
    expect(out.arrivalCity).toBe("CTS");
    expect(ret.departureCity).toBe("CTS");
    expect(ret.arrivalCity).toBe("NRT");
    expect(out.cabinClass).toBe("economy");
    expect(ret.cabinClass).toBe("economy");
  });

  it("when only outbound arrival is set, synthesizes departure 1h earlier so arrival is after departure", () => {
    const payload = buildBookingCreatePayload({
      ...baseDomesticData(),
      applicant: "traveller",
      offlineItineraries: [
        {
          id: "f-arrival-only",
          provider: "flight" as const,
          details: {
            flight_tripType: "oneway",
            flight_outbound_origin: "KIX",
            flight_outbound_destination: "SDJ",
            flight_outbound_arrivalDate: "2026-04-17",
            flight_outbound_arrivalTime: "12:46",
            flight_outbound_airline: "ana",
            flight_outbound_flightNo: "123",
            flight_outbound_cabinClass: "economy",
          },
        },
      ],
    });
    const row = payload.itineraries[0];
    if (row.type !== "offline_flight") throw new Error("expected offline_flight");
    expect(new Date(row.arrivalDateTime).getTime()).toBeGreaterThan(
      new Date(row.departureDateTime).getTime(),
    );
    expect(row.departureDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(row.arrivalDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
