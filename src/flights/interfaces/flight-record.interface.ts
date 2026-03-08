/**
 * Normalized flight record returned to API consumers.
 * Provider-agnostic — decoupled from any specific airline data source's raw response shape.
 * All providers must map their responses to this contract before returning.
 */
export interface FlightRecord {
  airline: string | null;
  flightNumber: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
  status: string;
  price: string | null;
  currency: string | null;
  duration: string | null;
  stops: number | null;
}
