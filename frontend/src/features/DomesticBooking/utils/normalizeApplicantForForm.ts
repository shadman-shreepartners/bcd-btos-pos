import type { ApplicantFormCanonical } from "../domesticBookingTypes";

/**
 * Maps persisted / legacy applicant strings to canonical form values used by Yup and the RadioGroup.
 */
export function normalizeApplicantForForm(
  value: string | undefined | null,
): ApplicantFormCanonical {
  if (value === "travelArranger" || value === "arranger") {
    return "travel-arranger";
  }
  if (value === "traveller" || value === "travel-arranger") {
    return value;
  }
  return "traveller";
}
