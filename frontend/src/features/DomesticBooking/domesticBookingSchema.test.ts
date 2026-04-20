import { describe, expect, it } from "vitest";
import type { OfflineItineraryEntry } from "./offlineItinerary/types";
import type { ExistingTravelerRecord } from "./types/existingTraveler";
import { domesticBookingValidationSchema } from "./domesticBookingSchema";

function sampleJr(id: string): OfflineItineraryEntry {
  return {
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
      jr_remarks: "",
    },
  };
}

function traveler(id: string): ExistingTravelerRecord {
  return {
    id,
    name: "Traveler",
    employeeId: "EMP-1",
    department: "Dept",
    initials: "T",
  };
}

function validArrangerExisting(overrides?: Record<string, unknown>) {
  return {
    applicant: "travel-arranger" as const,
    meeting_number: "",
    travell_type: "",
    applicant_name: "Arranger Name",
    contact_no: "1234567890",
    applicant_email: "arranger@bcd.travel",
    travellerSource: "existing" as const,
    existingTravelers: [traveler("100")],
    meeting_number_existing: "MN-1",
    trip_purpose_existing: "Internal meeting",
    last_name: "",
    first_name: "",
    last_name_eng: "",
    firstName: "",
    gender: "",
    travell_type_guest: "",
    meeting_number_guest: "",
    trip_purpose: "",
    offlineItineraries: [sampleJr("jr-1")],
    ...overrides,
  };
}

describe("domesticBookingValidationSchema", () => {
  it("accepts travel arranger + existing with exactly one traveler", async () => {
    await expect(
      domesticBookingValidationSchema.validate(validArrangerExisting()),
    ).resolves.toBeDefined();
  });

  it("rejects when no existing traveler is selected", async () => {
    await expect(
      domesticBookingValidationSchema.validate(
        validArrangerExisting({ existingTravelers: [] }),
      ),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.stringMatching(/select a traveler/i),
      ]),
    });
  });

  it("rejects when more than one existing traveler is selected", async () => {
    await expect(
      domesticBookingValidationSchema.validate(
        validArrangerExisting({
          existingTravelers: [traveler("1"), traveler("2")],
        }),
      ),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.stringMatching(/only one traveler/i),
      ]),
    });
  });
});
