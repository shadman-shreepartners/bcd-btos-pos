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
