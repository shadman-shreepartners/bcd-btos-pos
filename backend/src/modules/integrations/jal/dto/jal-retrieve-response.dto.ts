import {
  JalSoapFlightInfo,
  JalSoapPassengerInfo,
  JalSoapReservationInfo,
} from '../types/jal-soap.types';

/** Single flight segment in API response */
export class JalRetrieveFlightDto implements JalSoapFlightInfo {
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  departureTime?: string;
  arrivalTime?: string;
  boardingDate?: string;
  cabinClass?: string;
  status?: string;
  seatNumber?: string;
}

/** Passenger + their flights */
export class JalRetrievePassengerDto implements JalSoapPassengerInfo {
  surname?: string;
  givenName?: string;
  jmbNumber?: string;
  fare?: string;
  ticketingDeadline?: string;
  flights: JalRetrieveFlightDto[] = [];
}

/** One reservation tree */
export class JalRetrieveReservationDto implements JalSoapReservationInfo {
  projectNumber?: string;
  masterPnrNumber?: string;
  pnrNumber?: string;
  fareTotal?: string;
  /** JAL business error code when present (e.g. SZ15, S001) */
  errorCode?: string;
  errorMessage?: string;
  passengers: JalRetrievePassengerDto[] = [];
}

/** Response body for POST /integrations/jal/retrieve */
export class JalRetrieveResponseDto {
  /** Echo / fallback from request when SOAP body does not repeat it */
  projectNumber!: string;
  reservations: JalRetrieveReservationDto[] = [];
}
