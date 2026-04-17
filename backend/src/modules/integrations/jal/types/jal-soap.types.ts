/**
 * Normalized view of JAL RetrieveProcedure data (after mapping from SOAP payload).
 * Source field names follow JAL-SOAP-API-Documentation.md (multiRef id0/id1/id2).
 */

export interface JalSoapFlightInfo {
  flightNumber?: string;
  /** IATA code — maps from `departureCode` in JAL response */
  departureAirport?: string;
  /** IATA code — maps from `arrivalCode` in JAL response */
  arrivalAirport?: string;
  departureTime?: string;
  arrivalTime?: string;
  boardingDate?: string;
  cabinClass?: string;
  status?: string;
  seatNumber?: string;
}

export interface JalSoapPassengerInfo {
  surname?: string;
  givenName?: string;
  jmbNumber?: string;
  fare?: string;
  ticketingDeadline?: string;
  flights: JalSoapFlightInfo[];
}

export interface JalSoapReservationInfo {
  projectNumber?: string;
  masterPnrNumber?: string;
  pnrNumber?: string;
  fareTotal?: string;
  errorCode?: string;
  errorMessage?: string;
  passengers: JalSoapPassengerInfo[];
}
