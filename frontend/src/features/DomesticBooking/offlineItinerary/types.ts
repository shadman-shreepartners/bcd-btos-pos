/** Matches offline service tiles; only `"jr"` has a full form implementation. */
export type OfflineItineraryProviderId =
  | ""
  | "jr"
  | "flight"
  | "hotel"
  | "car"
  | "route";

export type JrTransportType = "rail" | "bus" | "ship";

/** JR-only fields persisted on an offline itinerary card. */
export type JrOfflineItineraryFormState = {
  jr_noReservationRequired: boolean;
  jr_transportType: JrTransportType;
  /** Optional API-facing label (e.g. Shinkansen); falls back to mode/train when empty. */
  jr_transportationType?: string;
  /** When set, sent as `ticketType` on the booking API; else derived from return legs. */
  jr_ticketType?: string;
  jr_departureDate: string;
  jr_origin: string;
  jr_destination: string;
  jr_departureTime: string;
  jr_arrivalTime: string;
  jr_trainName: string;
  jr_trainNo: string;
  jr_seats: string;
  /** Sent as `seatType` on the booking API. */
  jr_seatType?: string;
  jr_returnOrigin: string;
  jr_returnDestination: string;
  /** Optional return-leg ticket endpoints; fall back to `jr_returnOrigin` / `jr_returnDestination`. */
  jr_ticketOrigin?: string;
  jr_ticketDestination?: string;
  jr_seatPreference1: string;
  jr_seatPreference2: string;
  jr_remarks: string;
};

/**
 * Hotel fields when type = offline_hotel (ISO dates YYYY-MM-DD; budgets/count as numbers).
 * `null` budget = empty input.
 */
export type OfflineHotelFormSlice = {
  checkIn: string;
  checkOut: string;
  accommodationCity: string;
  firstPreference: string;
  secondPreference: string;
  budgetMin: number | null;
  budgetMax: number | null;
  roomCondition: string;
  amenities: string;
  roomCount: number;
  roomType: string;
};

/** Car rental (offline_car) — UI form slice; combine date + time when persisting. */
export type OfflineCarFormSlice = {
  car_rentalDate: string;
  car_rentalTime: string;
  car_rentalCity: string;
  car_returnDate: string;
  car_returnTime: string;
  car_returnCity: string;
  car_numberOfCars: number;
  car_rentalCarCompany: string;
  car_carSize: string;
  car_driver: string;
  car_remarks: string;
};

/** Offline flight segment — UI form slice; combine date + time when persisting to API. */
export interface FlightOfflineFormSlice {
  flight_tripType?: "oneway" | "return";
  flight_outbound_origin?: string;
  flight_outbound_destination?: string;
  flight_outbound_departureDate?: string;
  flight_outbound_departureTime?: string;
  flight_outbound_arrivalDate?: string;
  flight_outbound_arrivalTime?: string;
  flight_outbound_airline?: string;
  flight_outbound_flightNo?: string;
  flight_outbound_cabinClass?: string;
  flight_seatPreference?: string;
  flight_remarks?: string;
  flight_return_origin?: string;
  flight_return_destination?: string;
  flight_return_departureDate?: string;
  flight_return_departureTime?: string;
  flight_return_arrivalDate?: string;
  flight_return_arrivalTime?: string;
  flight_return_airline?: string;
  flight_return_flightNo?: string;
  flight_return_cabinClass?: string;
}

export type OfflineItineraryFormState = JrOfflineItineraryFormState &
  OfflineHotelFormSlice &
  OfflineCarFormSlice &
  FlightOfflineFormSlice & {
    remarks: string;
  };

/** Backend contract for offline car row fields (no list id). */
export type OfflineCarItineraryPayload = {
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

/** Backend contract for offline hotel row (no list id). */
export type OfflineHotelItineraryPayload = OfflineHotelFormSlice & {
  type: "offline_hotel";
  /** Free-text remarks from the hotel segment form (`remarks` field). */
  remarks: string;
};

/** JR card row stored in `offlineItineraries`. */
export type JrOfflineItineraryEntry = {
  id: string;
  provider: "jr";
  cardTitle: string;
  displayDate: string;
  departureTime: string;
  arrivalTime: string;
  jrTransportType?: JrTransportType;
  details: JrOfflineItineraryFormState;
};

/** Car row stored in `offlineItineraries` (payload + stable id for list/sync). */
export type OfflineCarItineraryEntry = OfflineCarItineraryPayload & {
  id: string;
};

/** Hotel row stored in `offlineItineraries`. */
export type OfflineHotelItineraryEntry = {
  id: string;
  type: "offline_hotel";
  checkIn: string;
  checkOut: string;
  accommodationCity: string;
  firstPreference: string;
  secondPreference: string;
  budgetMin: number | null;
  budgetMax: number | null;
  roomCondition: string;
  amenities: string;
  roomCount: number;
  roomType: string;
  remarks: string;
};

/** Flight row stored in `offlineItineraries`. */
export type FlightOfflineItineraryEntry = {
  provider: "flight";
  id: string;
  details: Partial<OfflineItineraryFormState>;
};

export type OfflineItineraryEntry =
  | JrOfflineItineraryEntry
  | OfflineCarItineraryEntry
  | OfflineHotelItineraryEntry
  | FlightOfflineItineraryEntry;

/** Values attached to unified timeline rows for offline-sourced items. */
export type OfflineTimelineOriginalRaw =
  | JrOfflineItineraryEntry
  | (JrOfflineItineraryEntry & { leg: "return" })
  | OfflineCarItineraryEntry
  | OfflineHotelItineraryEntry
  | FlightOfflineItineraryEntry;

/** @deprecated Use `OfflineItineraryEntry` */
export type OfflineItineraryListItem = OfflineItineraryEntry;

export function allocateOfflineItineraryId(existingId?: string | null): string {
  const trimmed = existingId?.trim();
  if (trimmed) return trimmed;
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function isOfflineCarItinerary(
  item: OfflineItineraryEntry,
): item is OfflineCarItineraryEntry {
  return "type" in item && item.type === "offline_car";
}

export function isOfflineHotelItinerary(
  item: OfflineItineraryEntry,
): item is OfflineHotelItineraryEntry {
  return "type" in item && item.type === "offline_hotel";
}

export function isOfflineFlightItinerary(
  item: OfflineItineraryEntry,
): item is FlightOfflineItineraryEntry {
  return "provider" in item && item.provider === "flight";
}

export function jrCardTitle(transportType: JrTransportType): string {
  if (transportType === "rail") return "RAILWAY (JR)";
  if (transportType === "bus") return "BUS";
  return "FERRY";
}

export function toJrOfflineFormState(
  values: OfflineItineraryFormState,
): JrOfflineItineraryFormState {
  return {
    jr_noReservationRequired: values.jr_noReservationRequired,
    jr_transportType: values.jr_transportType,
    jr_transportationType: values.jr_transportationType,
    jr_ticketType: values.jr_ticketType,
    jr_departureDate: values.jr_departureDate,
    jr_origin: values.jr_origin,
    jr_destination: values.jr_destination,
    jr_departureTime: values.jr_departureTime,
    jr_arrivalTime: values.jr_arrivalTime,
    jr_trainName: values.jr_trainName,
    jr_trainNo: values.jr_trainNo,
    jr_seats: values.jr_seats,
    jr_seatType: values.jr_seatType,
    jr_returnOrigin: values.jr_returnOrigin,
    jr_returnDestination: values.jr_returnDestination,
    jr_ticketOrigin: values.jr_ticketOrigin,
    jr_ticketDestination: values.jr_ticketDestination,
    jr_seatPreference1: values.jr_seatPreference1,
    jr_seatPreference2: values.jr_seatPreference2,
    jr_remarks: values.jr_remarks,
  };
}

/** Payload shape for offline_hotel (UI remarks omitted). */
export function pickOfflineHotelPayload(
  values: OfflineItineraryFormState,
): OfflineHotelFormSlice {
  return {
    checkIn: values.checkIn,
    checkOut: values.checkOut,
    accommodationCity: values.accommodationCity,
    firstPreference: values.firstPreference,
    secondPreference: values.secondPreference,
    budgetMin: values.budgetMin,
    budgetMax: values.budgetMax,
    roomCondition: values.roomCondition,
    amenities: values.amenities,
    roomCount: values.roomCount,
    roomType: values.roomType,
  };
}

export function buildOfflineItineraryEntry(
  values: OfflineItineraryFormState,
  existingId?: string | null,
): JrOfflineItineraryEntry {
  const id = allocateOfflineItineraryId(existingId);

  const t = values.jr_transportType;
  return {
    id,
    provider: "jr",
    cardTitle: jrCardTitle(t),
    displayDate: values.jr_departureDate || "—",
    departureTime: values.jr_departureTime || "—",
    arrivalTime: values.jr_arrivalTime || "—",
    jrTransportType: t,
    details: toJrOfflineFormState(values),
  };
}

export function buildOfflineHotelItineraryEntry(
  values: OfflineItineraryFormState,
  existingId?: string | null,
): OfflineHotelItineraryEntry {
  return {
    id: allocateOfflineItineraryId(existingId),
    type: "offline_hotel",
    ...pickOfflineHotelPayload(values),
    remarks: values.remarks?.trim() ?? "",
  };
}

/** Persists flight slice fields onto an offline flight itinerary row. */
export function pickFlightOfflineDetailsForEntry(
  values: OfflineItineraryFormState,
): Partial<OfflineItineraryFormState> {
  return {
    flight_tripType: values.flight_tripType,
    flight_outbound_origin: values.flight_outbound_origin,
    flight_outbound_destination: values.flight_outbound_destination,
    flight_outbound_departureDate: values.flight_outbound_departureDate,
    flight_outbound_departureTime: values.flight_outbound_departureTime,
    flight_outbound_arrivalDate: values.flight_outbound_arrivalDate,
    flight_outbound_arrivalTime: values.flight_outbound_arrivalTime,
    flight_outbound_airline: values.flight_outbound_airline,
    flight_outbound_flightNo: values.flight_outbound_flightNo,
    flight_outbound_cabinClass: values.flight_outbound_cabinClass,
    flight_seatPreference: values.flight_seatPreference,
    flight_remarks: values.flight_remarks,
    flight_return_origin: values.flight_return_origin,
    flight_return_destination: values.flight_return_destination,
    flight_return_departureDate: values.flight_return_departureDate,
    flight_return_departureTime: values.flight_return_departureTime,
    flight_return_arrivalDate: values.flight_return_arrivalDate,
    flight_return_arrivalTime: values.flight_return_arrivalTime,
    flight_return_airline: values.flight_return_airline,
    flight_return_flightNo: values.flight_return_flightNo,
    flight_return_cabinClass: values.flight_return_cabinClass,
  };
}

export function buildOfflineFlightItineraryEntry(
  values: OfflineItineraryFormState,
  existingId?: string | null,
): FlightOfflineItineraryEntry {
  return {
    id: allocateOfflineItineraryId(existingId),
    provider: "flight",
    details: pickFlightOfflineDetailsForEntry(values),
  };
}
