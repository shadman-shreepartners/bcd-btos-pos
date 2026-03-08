import { FlightRecord } from './flight-record.interface';
export interface FlightProvider {
    fetchSchedules(depIata: string, arrIata: string, date: string): Promise<FlightRecord[]>;
}
export declare const FLIGHT_PROVIDER: unique symbol;
