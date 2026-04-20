import type { DomesticData } from "@/features/DomesticBooking/domesticBookingTypes";
import {
  allocateOfflineItineraryId,
  type OfflineCarItineraryPayload,
  type OfflineItineraryEntry,
} from "@/features/DomesticBooking/offlineItinerary/types";
import { normalizeApplicantForForm } from "@/features/DomesticBooking/utils/normalizeApplicantForForm";
import { buildDefaultBookingData } from "./bookingDefaults";

function withOfflineCarIdsFromPersist(
  items: OfflineItineraryEntry[] | undefined,
): OfflineItineraryEntry[] {
  if (!items?.length) return [];
  return items.map((item) => {
    if (
      item &&
      typeof item === "object" &&
      "type" in item &&
      (item as { type: string }).type === "offline_car" &&
      (!("id" in item) ||
        typeof (item as { id?: unknown }).id !== "string" ||
        !(item as { id: string }).id.trim())
    ) {
      return {
        ...(item as OfflineCarItineraryPayload),
        id: allocateOfflineItineraryId(null),
      } as OfflineItineraryEntry;
    }
    return item;
  });
}

const LEGACY_PLACEHOLDER_NAME = "John Doe";
const LEGACY_PLACEHOLDER_EMAIL = "john.doe@example.com";

/** Persisted / legacy UI variants → values accepted by Yup (`domesticBookingValidationSchema`). */
export function normalizePersistedApplicant(
  applicant: DomesticData["applicant"] | undefined,
): DomesticData["applicant"] {
  return normalizeApplicantForForm(applicant);
}

export type BookingPersistedShape = {
  activeStep: number;
  bookingData: DomesticData;
  itineraryItems: unknown[];
  createdTripId: string | null;
};

export function migrateBookingPersistState(
  persisted: unknown,
  fromVersion: number,
): BookingPersistedShape {
  void fromVersion;
  const defaults: BookingPersistedShape = {
    activeStep: 0,
    bookingData: buildDefaultBookingData(),
    itineraryItems: [],
    createdTripId: null,
  };

  if (!persisted || typeof persisted !== "object") {
    return defaults;
  }

  const p = persisted as Partial<BookingPersistedShape>;

  const rawBooking = p.bookingData;
  let bookingData: DomesticData;
  if (!rawBooking || typeof rawBooking !== "object") {
    bookingData = buildDefaultBookingData();
  } else {
    bookingData = {
      ...buildDefaultBookingData(),
      ...rawBooking,
    };
    bookingData = {
      ...bookingData,
      applicant: normalizePersistedApplicant(bookingData.applicant),
      existingTravelers: (bookingData.existingTravelers ?? []).slice(0, 1),
    };
    if (
      bookingData.name === LEGACY_PLACEHOLDER_NAME &&
      bookingData.email === LEGACY_PLACEHOLDER_EMAIL
    ) {
      bookingData = { ...bookingData, name: "", email: "" };
    }
    bookingData = {
      ...bookingData,
      offlineItineraries: withOfflineCarIdsFromPersist(
        bookingData.offlineItineraries,
      ),
    };
  }

  const createdTripId =
    p.createdTripId === null
      ? null
      : typeof p.createdTripId === "string"
        ? p.createdTripId
        : null;

  return {
    activeStep: typeof p.activeStep === "number" ? p.activeStep : 0,
    bookingData,
    itineraryItems: Array.isArray(p.itineraryItems) ? p.itineraryItems : [],
    createdTripId,
  };
}
