import {
  JalRetrieveFlightDto,
  JalRetrievePassengerDto,
  JalRetrieveReservationDto,
  JalRetrieveResponseDto,
} from '../dto/jal-retrieve-response.dto';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/**
 * Coerce to string — handles both plain strings and
 * SOAP `{ attributes: {...}, $value: "..." }` wrapper objects.
 */
function str(value: unknown): string | undefined {
  if (typeof value === 'string') return value.length > 0 ? value : undefined;
  if (value && typeof value === 'object') {
    const v = (value as Record<string, unknown>).$value;
    if (typeof v === 'string') return v.length > 0 ? v : undefined;
    if (typeof v === 'number') return String(v);
  }
  return undefined;
}

function firstArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];
  return [];
}

/**
 * Maps a single FlightInfo multiRef (id2) element.
 * Field names are exact JAL SOAP response names per RetrieveProcedure WSDL.
 */
function mapFlight(raw: unknown): JalRetrieveFlightDto {
  const o = asRecord(raw) ?? {};
  const f = new JalRetrieveFlightDto();
  f.flightNumber = str(o.flightNumber);
  f.departureAirport = str(o.departureCode);
  f.arrivalAirport = str(o.arrivalCode);
  f.departureTime = str(o.departureTime);
  f.arrivalTime = str(o.arrivalTime);
  f.boardingDate = str(o.boardingDate);
  f.cabinClass = str(o.reservationClassName);
  f.status = str(o.reservationStatus);
  f.seatNumber = str(o.seatNumber);
  return f;
}

/**
 * Maps a single PassengerInfo multiRef (id1) element.
 * Field names are exact JAL SOAP response names per RetrieveProcedure WSDL.
 */
function mapPassenger(raw: unknown): JalRetrievePassengerDto {
  const o = asRecord(raw) ?? {};
  const p = new JalRetrievePassengerDto();
  p.surname = str(o.lastNameRomaji);
  p.givenName = str(o.firstNameRomaji);
  p.jmbNumber = str(o.jmbNumber);
  p.fare = str(o.passengerFare);
  p.ticketingDeadline = str(o.issuePeriodMsg);
  const flightContainer = asRecord(o.flightInfo ?? o.FlightInfo);
  p.flights = firstArray(
    flightContainer?.item ?? o.flightInfo ?? o.FlightInfo,
  ).map((x) => mapFlight(x));
  return p;
}

/**
 * Maps a single ReservationInfo multiRef (id0) element.
 * Field names are exact JAL SOAP response names per RetrieveProcedure WSDL.
 */
function mapReservation(raw: unknown): JalRetrieveReservationDto {
  const o = asRecord(raw) ?? {};
  const r = new JalRetrieveReservationDto();
  r.projectNumber = str(o.projectNumber);
  r.masterPnrNumber = str(o.masterPNRNumber);
  r.pnrNumber = str(o.PNRNumber);
  r.fareTotal = str(o.fareTotal);
  r.errorCode = str(o.errorCode);
  r.errorMessage = str(o.errorMessage);
  const passengerContainer = asRecord(o.passengerInfo ?? o.PassengerInfo);
  r.passengers = firstArray(
    passengerContainer?.item ?? o.passengerInfo ?? o.PassengerInfo,
  ).map((x) => mapPassenger(x));
  return r;
}

/** Strips the `getRecordDetailFromProjectReturn` wrapper when present */
function unwrapSoapReturnBody(raw: unknown): unknown {
  const o = asRecord(raw);
  if (!o) return raw;
  return o.getRecordDetailFromProjectReturn ?? raw;
}

/**
 * Maps a JAL RetrieveProcedure SOAP result into our API DTO.
 * Uses exact field names from JAL's WSDL multiRef response structure.
 */
export function mapSoapToJalRetrieveResponse(
  raw: unknown,
  requestedProjectNumber: string,
): JalRetrieveResponseDto {
  const dto = new JalRetrieveResponseDto();
  dto.projectNumber = requestedProjectNumber;
  dto.reservations = [];

  if (raw == null) {
    return dto;
  }

  const unwrapped = unwrapSoapReturnBody(raw);
  const root = asRecord(unwrapped) ?? {};
  // JAL returns reservations under .item (SOAP encoded array) or .ReservationInfo
  const resRaw = root.item ?? root.ReservationInfo ?? unwrapped;

  const list = firstArray(resRaw);
  dto.reservations = list.map((item) => mapReservation(item));

  if (
    dto.reservations.length === 1 &&
    !dto.reservations[0].projectNumber &&
    requestedProjectNumber
  ) {
    dto.reservations[0].projectNumber = requestedProjectNumber;
  }

  return dto;
}
