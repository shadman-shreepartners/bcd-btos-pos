import * as Yup from "yup";
import type { DomesticBookingFormValues } from "./domesticBookingTypes";

const required = "This field is required";
const str = () => Yup.string().trim();

export const domesticBookingValidationSchema = Yup.object({
  applicant: Yup.mixed<DomesticBookingFormValues["applicant"]>()
    .oneOf(["traveller", "travel-arranger"])
    .required(required),
  meeting_number: str().when("applicant", {
    is: "traveller",
    then: (s) => s.required(required),
    otherwise: (s) => s,
  }),
  travell_type: str().when("applicant", {
    is: "traveller",
    then: (s) => s.required(required),
    otherwise: (s) => s,
  }),
  applicant_name: str().when("applicant", {
    is: "travel-arranger",
    then: (s) => s.required(required).max(255, "Max 255 characters"),
    otherwise: (s) => s,
  }),
  contact_no: str().when("applicant", {
    is: "travel-arranger",
    then: (s) =>
      s
        .required(required)
        .matches(/^[0-9+\-\s()]{6,20}$/, "Enter a valid contact number"),
    otherwise: (s) => s,
  }),
  applicant_email: str().when("applicant", {
    is: "travel-arranger",
    then: (s) =>
      s.required(required).email("Enter a valid email address").max(255),
    otherwise: (s) => s,
  }),
  travellerSource: Yup.mixed<DomesticBookingFormValues["travellerSource"]>()
    .oneOf(["existing", "guest"])
    .when("applicant", {
      is: "travel-arranger",
      then: (s) => s.required(required),
      otherwise: (s) => s,
    }),
  meeting_number_existing: str().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "existing",
    then: (s) => s.required(required),
    otherwise: (s) => s,
  }),
  trip_purpose_existing: str().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "existing",
    then: (s) => s.required(required),
    otherwise: (s) => s,
  }),
  last_name: str().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "guest",
    then: (s) => s.required(required).max(120),
    otherwise: (s) => s,
  }),
  first_name: str().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "guest",
    then: (s) => s.required(required).max(120),
    otherwise: (s) => s,
  }),
  last_name_eng: str().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "guest",
    then: (s) => s.required(required).max(120),
    otherwise: (s) => s,
  }),
  firstName: str().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "guest",
    then: (s) => s.required(required).max(120),
    otherwise: (s) => s,
  }),
  gender: str().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "guest",
    then: (s) => s.required(required),
    otherwise: (s) => s,
  }),
  travell_type_guest: str().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "guest",
    then: (s) => s.required(required),
    otherwise: (s) => s,
  }),
  meeting_number_guest: str().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "guest",
    then: (s) => s.required(required),
    otherwise: (s) => s,
  }),
  trip_purpose: str().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "guest",
    then: (s) => s.required(required),
    otherwise: (s) => s,
  }),
  existingTravelers: Yup.array().when(["applicant", "travellerSource"], {
    is: (role: string, src: string) =>
      role === "travel-arranger" && src === "existing",
    then: (s) =>
      s
        .min(1, "Select a traveler from the search results")
        .max(1, "Only one traveler can be selected for this booking"),
    otherwise: (s) => s,
  }),
  offlineItineraries: Yup.array()
    .min(1, "Add at least one itinerary to continue")
    .default([]),
});

/**
 * Same rules as the step-1 form except the itinerary list may be empty — used to enable/disable
 * "Add to Itinerary" based on all other required fields (avoids relying on Formik `errors` shape).
 */
export const domesticBookingSchemaWithoutItineraryMinimum =
  domesticBookingValidationSchema.shape({
    offlineItineraries: Yup.array().default([]),
  });
