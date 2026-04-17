import {
  JalSoapFlightInfo,
  JalSoapPassengerInfo,
  JalSoapReservationInfo,
} from '../types/jal-soap.types';

/** Single flight segment in API response */
export class JalRetrieveFlightDto implements JalSoapFlightInfo {
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

/** Passenger + their flights */
export class JalRetrievePassengerDto implements JalSoapPassengerInfo {
  passengerPnrNumber?: string;
  employeeNumber?: string;
  lastNameRomaji?: string;
  firstNameRomaji?: string;
  firstNameKanji?: string;
  lastNameKanji?: string;
  jmbNumber?: string;
  passengerFare?: string;
  flights: JalRetrieveFlightDto[] = [];
}

/** One reservation tree */
export class JalRetrieveReservationDto implements JalSoapReservationInfo {
  projectNumber?: string;
  masterPnrNumber?: string;
  pnrNumber?: string;
  reservationDate?: string;
  representativeName?: string;
  phoneNumber?: string;
  fareTotal?: string;
  /** JAL business error code when present (e.g. SZ15, S001) */
  errorCode?: string;
  errorMessage?: string;
  passengers: JalRetrievePassengerDto[] = [];
}

/** Response body for POST /integrations/jal/retrieve */
export class JalRetrieveResponseDto {
  reservationInfo: JalRetrieveReservationDto[] = [];
}
