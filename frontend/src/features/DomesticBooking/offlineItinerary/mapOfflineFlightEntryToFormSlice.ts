import type { FlightOfflineItineraryEntry, OfflineItineraryFormState } from "./types";

/** Hydrates flight form fields from a persisted offline flight row. */
export function mapOfflineFlightEntryToFormSlice(
  entry: FlightOfflineItineraryEntry,
): Partial<OfflineItineraryFormState> {
  return { ...entry.details };
}
