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
 * Returns empty string as-is so callers can distinguish "absent" from "empty".
 */
function str(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const v = (value as Record<string, unknown>).$value;
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
  }
  return undefined;
}

function num(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  if (value && typeof value === 'object') {
    const v = (value as Record<string, unknown>).$value;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const parsed = parseFloat(v);
      return isNaN(parsed) ? undefined : parsed;
    }
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
  f.boardingDate = str(o.boardingDate);
  f.departureCode = str(o.departureCode ?? o.departureAirport);
  f.departureName = str(o.departureName);
  f.departureTime = str(o.departureTime);
  f.arrivalCode = str(o.arrivalCode ?? o.arrivalAirport);
  f.arrivalName = str(o.arrivalName);
  f.arrivalTime = str(o.arrivalTime);
  f.seatNumber = str(o.seatNumber);
  f.reservationClassName = str(o.reservationClassName ?? o.cabinClass);
  f.reservationClassCode = str(o.reservationClassCode);
  f.reservationStatus = str(o.reservationStatus ?? o.status ?? o.bookingStatus);
  f.airTicketNumber = str(o.airTicketNumber);
  f.aircraftType = str(o.aircraftType);
  f.flightFare = num(o.flightFare);
  return f;
}

/**
 * Maps a single PassengerInfo multiRef (id1) element.
 * Field names are exact JAL SOAP response names per RetrieveProcedure WSDL.
 */
function mapPassenger(raw: unknown): JalRetrievePassengerDto {
  const o = asRecord(raw) ?? {};
  const p = new JalRetrievePassengerDto();
  p.passengerPnrNumber = str(o.passengerPnrNumber);
  p.employeeNumber = str(o.employeeNumber);
  p.firstNameRomaji = str(o.firstNameRomaji ?? o.givenName);
  p.lastNameRomaji = str(o.lastNameRomaji ?? o.surname);
  p.firstNameKanji = str(o.firstNameKanji);
  p.lastNameKanji = str(o.lastNameKanji);
  p.jmbNumber = str(o.jmbNumber);
  p.passengerFare = num(o.passengerFare ?? o.fare);
  const flightContainer = asRecord(
    o.flightInfo ?? o.FlightInfo ?? o.flights ?? o.Flights,
  );
  p.flights = firstArray(
    flightContainer?.item ?? o.flightInfo ?? o.FlightInfo ?? o.flights,
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
  r.pnrNumber = str(o.pnrNumber ?? o.PNRNumber);
  r.masterPnrNumber = str(o.masterPnrNumber ?? o.masterPNRNumber);
  r.projectNumber = str(o.projectNumber);
  r.reservationDate = str(o.reservationDate);
  r.representativeName = str(o.representativeName);
  r.phoneNumber = str(o.phoneNumber);
  r.fareTotal = num(o.fareTotal);
  r.errorCode = str(o.errorCode);
  r.errorMessage = str(o.errorMessage);
  const passengerContainer = asRecord(
    o.passengerInfo ?? o.PassengerInfo ?? o.passengers ?? o.Passengers,
  );
  r.passengers = firstArray(
    passengerContainer?.item ??
      o.passengerInfo ??
      o.PassengerInfo ??
      o.passengers,
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
): JalRetrieveResponseDto {
  const dto = new JalRetrieveResponseDto();
  dto.reservationInfo = [];

  if (raw == null) {
    return dto;
  }

  const unwrapped = unwrapSoapReturnBody(raw);
  const root = asRecord(unwrapped) ?? {};
  // JAL returns reservations under .item (SOAP encoded array), .ReservationInfo,
  // or lower-camel sample payloads like .reservationInfo.
  const resRaw =
    root.item ??
    root.ReservationInfo ??
    root.reservationInfo ??
    root.reservations ??
    unwrapped;

  const list = firstArray(resRaw);
  dto.reservationInfo = list.map((item) => mapReservation(item));

  return dto;
}
