/**
 * Normalized view of JAL RetrieveProcedure data (after mapping from SOAP payload).
 * Source field names follow JAL-SOAP-API-Documentation.md (multiRef id0/id1/id2).
 */

export interface JalSoapFlightInfo {
  flightNumber?: string;
  departureCode?: string;
  departureName?: string;
  arrivalCode?: string;
  arrivalName?: string;
  departureTime?: string;
  arrivalTime?: string;
  boardingDate?: string;
  reservationClassName?: string;
  reservationClassCode?: string;
  reservationStatus?: string;
  airTicketNumber?: string;
  aircraftType?: string;
  seatNumber?: string;
  flightFare?: string;
}

export interface JalSoapPassengerInfo {
  passengerPnrNumber?: string;
  employeeNumber?: string;
  lastNameRomaji?: string;
  firstNameRomaji?: string;
  firstNameKanji?: string;
  lastNameKanji?: string;
  jmbNumber?: string;
  passengerFare?: string;
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
