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

function pickString(
  obj: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return undefined;
}

function mapFlight(raw: unknown): JalRetrieveFlightDto {
  const o = asRecord(raw) ?? {};
  const f = new JalRetrieveFlightDto();
  f.flightNumber = pickString(o, [
    'flightNumber',
    'FlightNumber',
    'flightNo',
    'FlightNo',
  ]);
  f.departureAirport = pickString(o, [
    'departureCode',
    'DepartureCode',
    'departureAirport',
    'DepartureAirport',
    'depAirport',
    'origin',
  ]);
  f.arrivalAirport = pickString(o, [
    'arrivalCode',
    'ArrivalCode',
    'arrivalAirport',
    'ArrivalAirport',
    'arrAirport',
    'destination',
  ]);
  f.departureTime = pickString(o, [
    'departureTime',
    'DepartureTime',
    'depTime',
  ]);
  f.arrivalTime = pickString(o, ['arrivalTime', 'ArrivalTime', 'arrTime']);
  f.boardingDate = pickString(o, ['boardingDate', 'BoardingDate']);
  f.cabinClass = pickString(o, [
    'reservationClassName',
    'ReservationClassName',
    'cabinClass',
    'CabinClass',
    'seatClass',
    'class',
  ]);
  f.status = pickString(o, [
    'reservationStatus',
    'ReservationStatus',
    'status',
    'Status',
  ]);
  f.seatNumber = pickString(o, ['seatNumber', 'SeatNumber']);
  return f;
}

function firstArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];
  return [];
}

function mapPassenger(raw: unknown): JalRetrievePassengerDto {
  const o = asRecord(raw) ?? {};
  const p = new JalRetrievePassengerDto();
  p.surname = pickString(o, [
    'lastNameRomaji',
    'LastNameRomaji',
    'lastNameKanji',
    'LastNameKanji',
    'prmSurName',
    'surname',
    'Surname',
    'lastName',
    'LastName',
  ]);
  p.givenName = pickString(o, [
    'firstNameRomaji',
    'FirstNameRomaji',
    'firstNameKanji',
    'FirstNameKanji',
    'prmFirstName',
    'givenName',
    'GivenName',
    'firstName',
  ]);
  p.jmbNumber = pickString(o, ['jmbNumber', 'JmbNumber', 'JMBNumber']);
  p.fare = pickString(o, ['passengerFare', 'PassengerFare', 'fare', 'Fare']);
  p.ticketingDeadline = pickString(o, [
    'issuePeriodMsg',
    'IssuePeriodMsg',
    'ticketingDeadline',
    'TicketingDeadline',
    'ticketTimeLimit',
  ]);

  const flightRaw =
    o.FlightInfo ?? o.flightInfo ?? o.flights ?? o.Flights ?? o.FlightInfos;
  p.flights = firstArray(flightRaw).map((x) => mapFlight(x));

  return p;
}

function mapReservation(raw: unknown): JalRetrieveReservationDto {
  const o = asRecord(raw) ?? {};
  const r = new JalRetrieveReservationDto();
  r.projectNumber = pickString(o, [
    'projectNumber',
    'ProjectNumber',
    'projectnumber',
    'ProjectNo',
  ]);
  r.masterPnrNumber = pickString(o, [
    'masterPNRNumber',
    'MasterPNRNumber',
    'masterPnrNumber',
  ]);
  r.pnrNumber = pickString(o, ['PNRNumber', 'pnrNumber', 'PnrNumber']);
  r.fareTotal = pickString(o, ['fareTotal', 'FareTotal']);
  r.errorCode = pickString(o, ['errorCode', 'ErrorCode']);
  r.errorMessage = pickString(o, ['errorMessage', 'ErrorMessage']);

  const paxRaw =
    o.PassengerInfo ?? o.passengerInfo ?? o.passengers ?? o.Passengers;
  r.passengers = firstArray(paxRaw).map((x) => mapPassenger(x));

  return r;
}

/** First element of parsed SOAP response — strips `*Return` wrapper when present */
function unwrapSoapReturnBody(raw: unknown): unknown {
  const o = asRecord(raw);
  if (!o) return raw;
  return (
    o.getRecordDetailFromProjectReturn ??
    o.getRecordDetailFromPNRNumberReturn ??
    o.getRecordDetailFromJMBNumberReturn ??
    o.getRecordDetailFromProjectAndPNRReturn ??
    o.getRecordDetailFromProjectAndJMBReturn ??
    o.getRecordDetailFromJMBAndPNRReturn ??
    o.getRecordDetailReturn ??
    raw
  );
}

/**
 * Maps a loosely-typed SOAP result object into our API DTO.
 * JAL WSDL element names may differ; this normalizes common variants.
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
  const resRaw =
    root.ReservationInfo ??
    root.reservationInfo ??
    root.Reservations ??
    root.reservations ??
    root.result ??
    root.Result ??
    unwrapped;

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
