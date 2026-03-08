/**
 * Normalized flight status record from Amadeus On Demand Flight Status API.
 * Provides real-time schedule data including departure/arrival times,
 * terminal/gate info, and delay status.
 */
export interface FlightStatus {
  carrierCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  scheduledDeparture: string | null;
  scheduledArrival: string | null;
  departureTerminal: string | null;
  departureGate: string | null;
  arrivalTerminal: string | null;
  arrivalGate: string | null;
  status: string;
  duration: string | null;
}
