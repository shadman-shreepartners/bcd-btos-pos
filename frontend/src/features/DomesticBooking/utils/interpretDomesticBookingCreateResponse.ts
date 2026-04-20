import {
  buildTripIdFromCreateResponse,
  type DomesticBookingCreateResponse,
} from "@/services/api/bookingService";

export type DomesticBookingCreateOutcome =
  | { kind: "success"; tripId: string; response: DomesticBookingCreateResponse }
  | { kind: "ambiguousHttpSuccess" };

/**
 * After HTTP 200 from create booking, decides whether we can complete the flow
 * (valid numeric id) or the response is unusable (possible server-side create without id).
 */
export function interpretDomesticBookingCreateResponse(
  response: DomesticBookingCreateResponse,
): DomesticBookingCreateOutcome {
  const bookingId = response.id;
  if (!Number.isFinite(bookingId) || bookingId <= 0) {
    return { kind: "ambiguousHttpSuccess" };
  }
  return {
    kind: "success",
    tripId: buildTripIdFromCreateResponse(response),
    response,
  };
}
