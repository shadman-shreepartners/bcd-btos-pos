import type {
  OfflineHotelItineraryEntry,
  OfflineItineraryFormState,
} from "./types";

/** Hydrates hotel form fields from a persisted `offline_hotel` row. */
export function mapOfflineHotelEntryToFormSlice(
  entry: OfflineHotelItineraryEntry,
): Partial<OfflineItineraryFormState> {
  return {
    checkIn: entry.checkIn,
    checkOut: entry.checkOut,
    accommodationCity: entry.accommodationCity,
    firstPreference: entry.firstPreference,
    secondPreference: entry.secondPreference,
    budgetMin: entry.budgetMin,
    budgetMax: entry.budgetMax,
    roomCondition: entry.roomCondition,
    amenities: entry.amenities,
    roomCount: entry.roomCount,
    roomType: entry.roomType,
    remarks: entry.remarks,
  };
}
