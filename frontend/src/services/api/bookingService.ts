import { apiClient } from "./client";

export type DomesticBookingApplicant = "traveller" | "travelArranger";

export type DomesticBookingTripPurpose = "internal" | "external";

export type DomesticBookingGender = "male" | "female";

/** Additional email recipients for JR delivery (confirmation step). */
export type DomesticBookingJrDeliveryRecipient = {
  name: string;
  email: string;
};

/**
 * Structured JR delivery form data (confirmation step). Built client-side; omitted from the POST body
 * until the backend accepts this shape — delivery details remain in merged JR `remarks`.
 */
export type DomesticBookingJrDeliveryConfirmationPayload = {
  deliveryMethod: string;
  expectedDeliveryDate: string;
  timeOfDay: string;
  remarks: string;
  additionalRecipients: DomesticBookingJrDeliveryRecipient[];
};

/** JR offline segment as built by `buildBookingCreatePayload`. */
export type DomesticBookingJrItineraryPayload = {
  type: "offline_jr";
  /** Backend enum: `rail` | `bus` | `ship` (must match API validation). */
  transportationType: "rail" | "bus" | "ship";
  ticketType: string;
  departureDate: string | undefined;
  origin: string | undefined;
  destination: string | undefined;
  departureTime: string | undefined;
  arrivalTime: string | undefined;
  trainName: string | undefined;
  trainNo: string | undefined;
  seats: string | undefined;
  ticketOrigin: string | undefined;
  ticketDestination: string | undefined;
  seatPreference: string;
  seatType: string;
  remarks: string | undefined;
  /**
   * Client-only until the API accepts it — stripped in `toDomesticBookingApiPayload` before POST.
   */
  jrDeliveryConfirmation?: DomesticBookingJrDeliveryConfirmationPayload;
};

/** Offline hotel segment as built by `buildBookingCreatePayload`. */
export type DomesticBookingOfflineHotelItineraryPayload = {
  type: "offline_hotel";
  checkIn: string;
  checkOut: string;
  accommodationCity: string;
  firstPreference: string;
  secondPreference: string;
  budgetMin: number;
  budgetMax: number;
  roomCondition: string;
  amenities: string;
  roomCount: number;
  roomType: string;
  remarks: string;
};

/** Offline car rental segment as built by `buildBookingCreatePayload`. */
export type DomesticBookingOfflineCarItineraryPayload = {
  type: "offline_car";
  rentalDateTime: string;
  rentalCity: string;
  returnDateTime: string;
  returnCity: string;
  numberOfCars: number;
  rentalCarCompany: string;
  carSize: string;
  driver: string;
  remarks: string;
};

/** Offline flight leg as built by `buildBookingCreatePayload` (one row per leg). API DTO (camelCase). */
export type DomesticBookingOfflineFlightItineraryPayload = {
  type: "offline_flight";
  tripType: "oneway" | "return";
  isReturn: boolean;
  departureDateTime: string;
  departureCity: string;
  arrivalDateTime: string;
  arrivalCity: string;
  airline: string;
  flightNumber: string;
  cabinClass: string;
  seatPreference?: string;
  remarks?: string;
};

export type DomesticBookingItineraryPayload =
  | DomesticBookingJrItineraryPayload
  | DomesticBookingOfflineHotelItineraryPayload
  | DomesticBookingOfflineCarItineraryPayload
  | DomesticBookingOfflineFlightItineraryPayload;

/** Removes client-only itinerary fields before POST (e.g. `jrDeliveryConfirmation`). */
export function toDomesticBookingApiPayload(
  payload: DomesticBookingPayload,
): DomesticBookingPayload {
  return {
    ...payload,
    itineraries: payload.itineraries.map((it) => {
      if (it.type !== "offline_jr") return it;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructuring omit
      const { jrDeliveryConfirmation, ...jr } = it;
      return jr;
    }),
  };
}

export type DomesticBookingPayload = {
  applicant: DomesticBookingApplicant;
  firstName: string;
  lastName: string;
  telephone: string;
  extensionNo: string;
  email: string;
  travellerId: number;
  japaneseFirstName: string;
  japaneseLastName: string;
  fullNameAsPerPassport: string;
  gender: DomesticBookingGender;
  /**
   * Travel arranger + guest only (`travell_type_guest`); empty string for other flows until the API
   * accepts omission.
   */
  travellerType: string;
  tripPurpose: DomesticBookingTripPurpose;
  meetingNo: string;
  itineraries: DomesticBookingItineraryPayload[];
  /**
   * Used when there are no JR itinerary rows but confirmation notes still need to be submitted.
   * Omit when empty so strict APIs are unaffected.
   */
  bookingRemarks?: string;
};

/** POST `/bookings` success body (normalized for the UI). */
export interface DomesticBookingCreateResponse {
  id: number;
  createdAt: string;
  /** Present when the API returns a public reference; preferred for display over a synthetic id. */
  serverReference?: string;
  /** True when `createdAt` was not returned and a client ISO timestamp was substituted. */
  createdAtSynthesized?: boolean;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function pickServerReference(o: Record<string, unknown>): string | undefined {
  const refRaw =
    o.reference ??
    o.bookingReference ??
    o.booking_reference ??
    o.tripId ??
    o.trip_id ??
    o.publicId ??
    o.public_id ??
    o.bookingCode ??
    o.booking_code ??
    o.confirmationCode ??
    o.confirmation_code;
  if (typeof refRaw === "string") {
    const t = refRaw.trim();
    return t.length > 0 ? t : undefined;
  }
  return undefined;
}

/**
 * Maps common API shapes (camelCase / snake_case / nested `data`) into `{ id, createdAt }`.
 */
export function parseDomesticBookingCreateResponse(
  raw: unknown,
): DomesticBookingCreateResponse {
  let o = asRecord(raw);
  const hasId = () =>
    o.id != null || o.booking_id != null || o.bookingId != null;
  const hasDate = () =>
    o.createdAt != null ||
    o.created_at != null ||
    o.created_date != null ||
    o.createdDate != null;
  if ((!hasId() || !hasDate()) && o.data != null) {
    const inner = asRecord(o.data);
    if (Object.keys(inner).length > 0) o = inner;
  }

  const idRaw = o.id ?? o.booking_id ?? o.bookingId;
  let id = 0;
  if (typeof idRaw === "number" && Number.isFinite(idRaw)) {
    id = idRaw;
  } else if (typeof idRaw === "string" && idRaw.trim()) {
    const digits = idRaw.replace(/\D/g, "");
    if (digits.length > 0) {
      const n = Number.parseInt(digits.slice(0, 15), 10);
      id = Number.isFinite(n) ? n : 0;
    }
  }

  const createdRaw =
    o.created_at ?? o.createdAt ?? o.created_date ?? o.createdDate;
  let createdAt = "";
  if (typeof createdRaw === "string") {
    createdAt = createdRaw.trim();
  } else if (typeof createdRaw === "number" && Number.isFinite(createdRaw)) {
    createdAt = new Date(createdRaw).toISOString();
  }

  const serverReference = pickServerReference(o);
  let createdAtSynthesized: boolean | undefined;
  if (id > 0 && !createdAt) {
    createdAt = new Date().toISOString();
    createdAtSynthesized = true;
  }

  return {
    id,
    createdAt,
    ...(serverReference ? { serverReference } : {}),
    ...(createdAtSynthesized ? { createdAtSynthesized: true } : {}),
  };
}

/** Display id for the success screen: server reference when present, otherwise a stable BT-… code from UTC date parts. */
export function buildTripIdFromCreateResponse(
  res: DomesticBookingCreateResponse,
): string {
  const ref = res.serverReference?.trim();
  if (ref) return ref;
  const raw = res.createdAt?.trim();
  const d = raw ? new Date(raw) : new Date();
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  const yyyy = safe.getUTCFullYear();
  const mm = String(safe.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(safe.getUTCDate()).padStart(2, "0");
  return `BT-${yyyy}${mm}${dd}-${String(res.id).padStart(3, "0")}`;
}

export const createDomesticBooking = async (
  payload: DomesticBookingPayload,
): Promise<DomesticBookingCreateResponse> => {
  const response = await apiClient.post(
    "/bookings",
    toDomesticBookingApiPayload(payload),
  );
  return parseDomesticBookingCreateResponse(response.data);
};
