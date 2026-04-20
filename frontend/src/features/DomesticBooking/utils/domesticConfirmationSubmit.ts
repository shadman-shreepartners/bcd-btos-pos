import {
  DATE_MUST_BE_TODAY_OR_FUTURE,
  isIsoDateOnOrAfterToday,
} from "./todayDateString";

export type DomesticConfirmationSubmitInput = {
  showDeliverySection: boolean;
  deliveryMethod: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryRemarks: string;
};

/**
 * When the JR delivery section is visible, require all delivery fields before submit.
 * Remarks stay required to match the confirmation UI (multiline delivery instructions).
 */
export function getDomesticConfirmationSubmitError(
  input: DomesticConfirmationSubmitInput,
): string | null {
  if (!input.showDeliverySection) return null;
  const method = input.deliveryMethod.trim();
  const date = input.deliveryDate.trim();
  const time = input.deliveryTime.trim();
  const remarks = input.deliveryRemarks.trim();
  if (!method || !date || !time || !remarks) {
    return "Please complete delivery method, date, time of day, and remarks before submitting.";
  }
  if (!isIsoDateOnOrAfterToday(date)) {
    return DATE_MUST_BE_TODAY_OR_FUTURE;
  }
  return null;
}
