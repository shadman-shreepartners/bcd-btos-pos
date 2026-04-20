import { describe, expect, it } from "vitest";
import { defaultDomesticFormValues } from "@/features/DomesticBooking/domesticBookingTypes";
import { buildDefaultBookingData } from "./bookingDefaults";
import {
  migrateBookingPersistState,
  normalizePersistedApplicant,
} from "./bookingPersistMigrate";

describe("migrateBookingPersistState", () => {
  it("returns defaults for non-object persisted state", () => {
    const out = migrateBookingPersistState(null, 0);
    expect(out.activeStep).toBe(0);
    expect(out.itineraryItems).toEqual([]);
    expect(out.bookingData).toEqual(buildDefaultBookingData());
    expect(out.createdTripId).toBeNull();
  });

  it("clears legacy placeholder name and email", () => {
    const out = migrateBookingPersistState(
      {
        activeStep: 1,
        bookingData: {
          ...defaultDomesticFormValues(),
          step: 1,
          name: "John Doe",
          email: "john.doe@example.com",
        },
        itineraryItems: [],
      },
      0,
    );
    expect(out.bookingData.name).toBe("");
    expect(out.bookingData.email).toBe("");
    expect(out.activeStep).toBe(1);
    expect(out.createdTripId).toBeNull();
  });

  it("merges partial bookingData with current defaults", () => {
    const out = migrateBookingPersistState(
      {
        activeStep: 0,
        bookingData: { applicant: "traveller" },
        itineraryItems: [{ id: "1" }],
      },
      0,
    );
    expect(out.bookingData.applicant).toBe("traveller");
    expect(out.bookingData.step).toBe(0);
    expect(out.itineraryItems).toEqual([{ id: "1" }]);
    expect(out.createdTripId).toBeNull();
  });

  it("normalizes legacy applicant aliases for Yup", () => {
    const out = migrateBookingPersistState(
      {
        activeStep: 0,
        bookingData: {
          ...defaultDomesticFormValues(),
          step: 0,
          applicant: "travelArranger",
          name: "",
          email: "",
        },
        itineraryItems: [],
      },
      0,
    );
    expect(out.bookingData.applicant).toBe("travel-arranger");
  });

  it("normalizePersistedApplicant maps arranger variants", () => {
    expect(normalizePersistedApplicant("arranger")).toBe("travel-arranger");
    expect(normalizePersistedApplicant("travelArranger")).toBe(
      "travel-arranger",
    );
    expect(normalizePersistedApplicant("traveller")).toBe("traveller");
  });

  it("keeps at most one existingTraveler when migrating", () => {
    const out = migrateBookingPersistState(
      {
        activeStep: 0,
        bookingData: {
          ...defaultDomesticFormValues(),
          step: 0,
          applicant: "travel-arranger",
          travellerSource: "existing",
          existingTravelers: [
            {
              id: "1",
              name: "First",
              employeeId: "E1",
              department: "D1",
              initials: "F",
            },
            {
              id: "2",
              name: "Second",
              employeeId: "E2",
              department: "D2",
              initials: "S",
            },
          ],
          name: "",
          email: "",
        },
        itineraryItems: [],
      },
      0,
    );
    expect(out.bookingData.existingTravelers).toHaveLength(1);
    expect(out.bookingData.existingTravelers[0]!.id).toBe("1");
  });

  it("preserves createdTripId from persisted state when present", () => {
    const out = migrateBookingPersistState(
      {
        activeStep: 2,
        bookingData: buildDefaultBookingData(),
        itineraryItems: [],
        createdTripId: "BT-20260415-042",
      },
      0,
    );
    expect(out.createdTripId).toBe("BT-20260415-042");
  });
});
