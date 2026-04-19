/** Single flight segment in API response */
export class JalRetrieveFlightDto {
  flightNumber?: string;
  boardingDate?: string;
  departureCode?: string;
  departureName?: string;
  departureTime?: string;
  arrivalCode?: string;
  arrivalName?: string;
  arrivalTime?: string;
  seatNumber?: string;
  reservationClassName?: string;
  reservationClassCode?: string;
  reservationStatus?: string;
  airTicketNumber?: string;
  aircraftType?: string;
  flightFare?: number;
}

/** Passenger + their flights */
export class JalRetrievePassengerDto {
  passengerPnrNumber?: string;
  employeeNumber?: string;
  firstNameRomaji?: string;
  lastNameRomaji?: string;
  firstNameKanji?: string;
  lastNameKanji?: string;
  jmbNumber?: string;
  passengerFare?: number;
  flights: JalRetrieveFlightDto[] = [];
}

/** One reservation tree */
export class JalRetrieveReservationDto {
  pnrNumber?: string;
  masterPnrNumber?: string;
  projectNumber?: string;
  reservationDate?: string;
  representativeName?: string;
  phoneNumber?: string;
  fareTotal?: number;
  errorCode?: string;
  errorMessage?: string;
  passengers: JalRetrievePassengerDto[] = [];
}

/** Response body for POST /integrations/jal/retrieve */
export class JalRetrieveResponseDto {
  reservationInfo: JalRetrieveReservationDto[] = [];
}
