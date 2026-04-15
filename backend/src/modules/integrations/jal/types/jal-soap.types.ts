/**
 * Normalized view of JAL RetrieveProcedure data (after mapping from SOAP payload).
 * Source field names follow JAL-SOAP-API-Documentation.md (multiRef id0/id1/id2).
 */

export interface JalSoapFlightInfo {
  flightNumber?: string;
  /** IATA code — maps from `departureCode` in JAL response */
  departureAirport?: string;
  departureName?: string;
  /** IATA code — maps from `arrivalCode` in JAL response */
  arrivalAirport?: string;
  arrivalName?: string;
  departureTime?: string;
  arrivalTime?: string;
  boardingDate?: string;
  cabinClass?: string;
  reservationClassCode?: string;
  status?: string;
  airTicketNumber?: string;
  aircraftType?: string;
  seatNumber?: string;
  flightFare?: string;
}

export interface JalSoapPassengerInfo {
  passengerPnrNumber?: string;
  employeeNumber?: string;
  surname?: string;
  givenName?: string;
  firstNameKanji?: string;
  lastNameKanji?: string;
  jmbNumber?: string;
  fare?: string;
  ticketingDeadline?: string;
  flights: JalSoapFlightInfo[];
}

export interface JalSoapReservationInfo {
  projectNumber?: string;
  masterPnrNumber?: string;
  pnrNumber?: string;
  reservationDate?: string;
  representativeName?: string;
  phoneNumber?: string;
  fareTotal?: string;
  errorCode?: string;
  errorMessage?: string;
  passengers: JalSoapPassengerInfo[];
}
