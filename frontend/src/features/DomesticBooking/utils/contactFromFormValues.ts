import type { DomesticBookingFormValues } from "../domesticBookingTypes";

export function isTravelArrangerApplicant(
  applicant: DomesticBookingFormValues["applicant"],
): boolean {
  return (
    applicant === "travel-arranger" ||
    applicant === "travelArranger" ||
    applicant === "arranger"
  );
}

/**
 * One value for `DomesticData.meeting_number` / API `meetingNo`:
 * Trip section uses `meeting_number` (traveller); Traveller section uses existing/guest fields (arranger).
 */
export function resolveCanonicalMeetingNumber(
  values: DomesticBookingFormValues,
): string {
  if (values.applicant === "traveller") {
    return values.meeting_number?.trim() ?? "";
  }
  if (isTravelArrangerApplicant(values.applicant)) {
    return values.travellerSource === "guest"
      ? values.meeting_number_guest?.trim() ?? ""
      : values.meeting_number_existing?.trim() ?? "";
  }
  return values.meeting_number?.trim() ?? "";
}

/** Primary contact on `DomesticData` — arranger fields only; traveller flow has no name/email inputs. */
export function deriveContactForDomesticData(
  values: DomesticBookingFormValues,
): { name: string; email: string } {
  if (isTravelArrangerApplicant(values.applicant)) {
    return {
      name: values.applicant_name.trim(),
      email: values.applicant_email.trim(),
    };
  }
  return { name: "", email: "" };
}
