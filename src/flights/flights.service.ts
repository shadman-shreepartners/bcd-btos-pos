import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { FlightProvider, FLIGHT_PROVIDER } from './interfaces/flight-provider.interface';
import { FlightRecord } from './interfaces/flight-record.interface';

/**
 * Orchestrates flight offer fetching via the configured provider.
 *
 * SOLID design:
 *   S — Pure orchestration; no API calls or data normalization.
 *   O — New data sources added via FlightProvider implementations.
 *   D — Depends on the FlightProvider abstraction, not a concrete implementation.
 */
@Injectable()
export class FlightsService {
  constructor(
    @InjectPinoLogger(FlightsService.name)
    private readonly logger: PinoLogger,
    @Inject(FLIGHT_PROVIDER)
    private readonly flightProvider: FlightProvider,
  ) {}

  /**
   * Fetches flight offers for a given route and date.
   * Amadeus searches all airlines in one call, so no per-airline fan-out needed.
   */
  async getSchedules(
    depIata: string,
    arrIata: string,
    date: string,
  ): Promise<FlightRecord[]> {
    try {
      const results = await this.flightProvider.fetchSchedules(
        depIata,
        arrIata,
        date,
      );

      this.logger.info(
        { totalResults: results.length },
        'Flight offers fetched',
      );

      return results;
    } catch (error: any) {
      this.logger.error(
        { err: error?.description || error?.message || error },
        'Amadeus API call failed',
      );
      throw new HttpException(
        'Flight search failed. Check your API credentials and try again.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
