import { describe, expect, it } from "vitest";
import {
  buildTripIdFromCreateResponse,
  parseDomesticBookingCreateResponse,
  toDomesticBookingApiPayload,
  type DomesticBookingPayload,
} from "./bookingService";

describe("parseDomesticBookingCreateResponse", () => {
  it("reads camelCase id and createdAt", () => {
    const out = parseDomesticBookingCreateResponse({
      id: 42,
      createdAt: "2026-04-15T08:00:00.000Z",
    });
    expect(out).toMatchObject({
      id: 42,
      createdAt: "2026-04-15T08:00:00.000Z",
    });
    expect(out.createdAtSynthesized).toBeUndefined();
  });

  it("unwraps nested data", () => {
    expect(
      parseDomesticBookingCreateResponse({
        data: {
          booking_id: 7,
          created_at: "2026-01-02T00:00:00.000Z",
        },
      }),
    ).toMatchObject({ id: 7, createdAt: "2026-01-02T00:00:00.000Z" });
  });

  it("synthesizes createdAt when id is valid but date is missing", () => {
    const out = parseDomesticBookingCreateResponse({ id: 5 });
    expect(out.id).toBe(5);
    expect(out.createdAtSynthesized).toBe(true);
    expect(out.createdAt.length).toBeGreaterThan(10);
  });

  it("captures server reference fields", () => {
    expect(
      parseDomesticBookingCreateResponse({
        id: 1,
        createdAt: "2026-06-01T12:00:00.000Z",
        booking_reference: "BR-999",
      }).serverReference,
    ).toBe("BR-999");
  });
});

describe("toDomesticBookingApiPayload", () => {
  it("strips jrDeliveryConfirmation from offline_jr rows before POST", () => {
    const payload: DomesticBookingPayload = {
      applicant: "traveller",
      firstName: "T",
      lastName: "Y",
      telephone: "0",
      extensionNo: "",
      email: "t@example.com",
      travellerId: 0,
      japaneseFirstName: "太",
      japaneseLastName: "郎",
      fullNameAsPerPassport: "T Y",
      gender: "male",
      travellerType: "",
      tripPurpose: "internal",
      meetingNo: "",
      itineraries: [
        {
          type: "offline_jr",
          transportationType: "rail",
          ticketType: "One-way",
          departureDate: "2026-01-01",
          origin: "A",
          destination: "B",
          departureTime: "09:00",
          arrivalTime: "10:00",
          trainName: "",
          trainNo: "",
          seats: undefined,
          ticketOrigin: undefined,
          ticketDestination: undefined,
          seatPreference: "",
          seatType: "",
          remarks: "note",
          jrDeliveryConfirmation: {
            deliveryMethod: "email",
            expectedDeliveryDate: "2026-01-02",
            timeOfDay: "morning",
            remarks: "x",
            additionalRecipients: [],
          },
        },
      ],
    };
    const api = toDomesticBookingApiPayload(payload);
    const jr = api.itineraries[0];
    expect(jr.type).toBe("offline_jr");
    if (jr.type !== "offline_jr") throw new Error("expected jr");
    expect(jr.jrDeliveryConfirmation).toBeUndefined();
  });
});

describe("buildTripIdFromCreateResponse", () => {
  it("prefers serverReference", () => {
    expect(
      buildTripIdFromCreateResponse({
        id: 1,
        createdAt: "",
        serverReference: "EXT-REF-1",
      }),
    ).toBe("EXT-REF-1");
  });

  it("builds BT id from UTC calendar parts", () => {
    expect(
      buildTripIdFromCreateResponse({
        id: 3,
        createdAt: "2026-04-15T22:00:00.000Z",
      }),
    ).toBe("BT-20260415-003");
  });
});
