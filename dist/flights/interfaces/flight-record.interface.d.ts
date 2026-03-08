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
