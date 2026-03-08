import { FlightRecord } from './flight-record.interface';

/**
 * Contract for external flight data providers (Amadeus, etc.).
 *
 * Follows Interface Segregation — providers only implement schedule fetching.
 * Follows Open/Closed — new providers can be added without modifying the
 * orchestration logic in FlightsService.
 */
export interface FlightProvider {
  fetchSchedules(
    depIata: string,
    arrIata: string,
    date: string,
  ): Promise<FlightRecord[]>;
}

/**
 * Injection token for FlightProvider.
 * Used by NestJS DI to resolve the concrete provider implementation at runtime.
 * Follows Dependency Inversion — high-level modules depend on this abstraction.
 */
export const FLIGHT_PROVIDER = Symbol('FLIGHT_PROVIDER');
