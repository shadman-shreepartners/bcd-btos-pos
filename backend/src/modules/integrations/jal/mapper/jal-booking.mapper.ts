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
  f.departureName = str(o.departureName);
  f.arrivalAirport = str(o.arrivalCode);
  f.arrivalName = str(o.arrivalName);
  f.departureTime = str(o.departureTime);
  f.arrivalTime = str(o.arrivalTime);
  f.boardingDate = str(o.boardingDate);
  f.cabinClass = str(o.reservationClassName);
  f.reservationClassCode = str(o.reservationClassCode);
  f.status = str(o.reservationStatus);
  f.airTicketNumber = str(o.airTicketNumber);
  f.aircraftType = str(o.aircraftType);
  f.seatNumber = str(o.seatNumber);
  f.flightFare = str(o.flightFare);
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
  p.surname = str(o.lastNameRomaji);
  p.givenName = str(o.firstNameRomaji);
  p.firstNameKanji = str(o.firstNameKanji);
  p.lastNameKanji = str(o.lastNameKanji);
  p.jmbNumber = str(o.jmbNumber);
  p.fare = str(o.passengerFare);
  p.ticketingDeadline = str(o.issuePeriodMsg);
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
  r.projectNumber = str(o.projectNumber);
  r.masterPnrNumber = str(o.masterPNRNumber);
  r.pnrNumber = str(o.PNRNumber);
  r.reservationDate = str(o.reservationDate);
  r.representativeName = str(o.representativeName);
  r.phoneNumber = str(o.phoneNumber);
  r.fareTotal = str(o.fareTotal);
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
  // JAL returns reservations under .item (SOAP encoded array), .ReservationInfo,
  // or lower-camel sample payloads like .reservationInfo.
  const resRaw =
    root.item ??
    root.ReservationInfo ??
    root.reservationInfo ??
    root.reservations ??
    unwrapped;

  const list = firstArray(resRaw);
  dto.reservations = list.map((item) => mapReservation(item));

  const primaryReservation = dto.reservations[0];
  if (primaryReservation) {
    dto.projectNumber = primaryReservation.projectNumber ?? requestedProjectNumber;
    dto.masterPnrNumber = primaryReservation.masterPnrNumber;
    dto.pnrNumber = primaryReservation.pnrNumber;
    dto.reservationDate = primaryReservation.reservationDate;
    dto.representativeName = primaryReservation.representativeName;
    dto.phoneNumber = primaryReservation.phoneNumber;
    dto.fareTotal = primaryReservation.fareTotal;
    dto.errorCode = primaryReservation.errorCode;
    dto.errorMessage = primaryReservation.errorMessage;
    dto.passengers = primaryReservation.passengers;
  }

  if (
    dto.reservations.length === 1 &&
    !dto.reservations[0].projectNumber &&
    requestedProjectNumber
  ) {
    dto.reservations[0].projectNumber = requestedProjectNumber;
  }

  return dto;
}
