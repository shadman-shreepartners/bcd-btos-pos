import type { ExistingTravelerRecord } from "./types/existingTraveler";
import type { OfflineItineraryEntry } from "./offlineItinerary/types";

/** Values used by the form, Yup schema, and MUI RadioGroup. */
export type ApplicantFormCanonical = "traveller" | "travel-arranger";

/** Persisted / external aliases — normalize with `normalizeApplicantForForm` at boundaries. */
export type applicant =
  | ApplicantFormCanonical
  | "travelArranger"
  | "arranger";
export type TravellerSource = "existing" | "guest";

export type DomesticBookingFormValues = {
  applicant: ApplicantFormCanonical;
  meeting_number: string;
  /**
   * Self-booker flow: collected as “trip purpose” in the UI; first source for `mapTripPurpose` in
   * `bookingAdapter` (before `trip_purpose_existing` / guest fields).
   */
  travell_type: string;
  applicant_name: string;
  contact_no: string;
  applicant_email: string;
  travellerSource: TravellerSource;
  existingTravelers: ExistingTravelerRecord[];
  meeting_number_existing: string;
  trip_purpose_existing: string;
  last_name: string;
  first_name: string;
  last_name_eng: string;
  firstName: string;
  gender: string;
  /** Guest traveller: maps to API `travellerType`; distinct from self-booker `travell_type`. */
  travell_type_guest: string;
  meeting_number_guest: string;
  trip_purpose: string;
  offlineItineraries: OfflineItineraryEntry[];
};

export type DomesticData = DomesticBookingFormValues & {
  step: number;
  name: string;
  email: string;
};

export const defaultDomesticFormValues = (): DomesticBookingFormValues => ({
  applicant: "traveller",
  meeting_number: "",
  travell_type: "",
  applicant_name: "",
  contact_no: "",
  applicant_email: "",
  travellerSource: "existing",
  existingTravelers: [],
  meeting_number_existing: "",
  trip_purpose_existing: "",
  last_name: "",
  first_name: "",
  last_name_eng: "",
  firstName: "",
  gender: "",
  travell_type_guest: "",
  meeting_number_guest: "",
  trip_purpose: "",
  offlineItineraries: [],
});
