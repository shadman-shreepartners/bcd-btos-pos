import { Injectable, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { FlightStatus } from './interfaces/flight-status.interface';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Amadeus = require('amadeus');

/**
 * Handles real-time flight status lookups via the Amadeus
 * On Demand Flight Status API (schedule.flights).
 */
@Injectable()
export class FlightStatusService implements OnModuleInit {
  private client: any;

  constructor(
    @InjectPinoLogger(FlightStatusService.name)
    private readonly logger: PinoLogger,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.client = new Amadeus({
      clientId: this.config.get<string>('AMADEUS_CLIENT_ID', ''),
      clientSecret: this.config.get<string>('AMADEUS_CLIENT_SECRET', ''),
    });
  }

  async getStatus(
    carrierCode: string,
    flightNumber: string,
    date: string,
  ): Promise<FlightStatus[]> {
    const start = Date.now();
    this.logger.info(
      { carrierCode, flightNumber, date },
      'Fetching flight status from Amadeus',
    );

    try {
      const response = await this.client.schedule.flights.get({
        carrierCode,
        flightNumber,
        scheduledDepartureDate: date,
      });

      const durationMs = Date.now() - start;
      const data = response?.data;

      if (!Array.isArray(data)) {
        this.logger.warn({ durationMs }, 'Unexpected flight status response shape');
        return [];
      }

      this.logger.debug(
        { resultCount: data.length, durationMs },
        'Amadeus flight status response processed',
      );

      return data.map((entry: any) => this.normalize(entry));
    } catch (error: any) {
      this.logger.error(
        { err: error?.description || error?.message || error },
        'Amadeus flight status API call failed',
      );
      throw new HttpException(
        'Flight status lookup failed. Check your API credentials and parameters.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private normalize(entry: any): FlightStatus {
    const dep = entry.flightPoints?.find((p: any) => p.departure);
    const arr = entry.flightPoints?.find((p: any) => p.arrival);
    const depTimings = dep?.departure?.timings?.[0];
    const arrTimings = arr?.arrival?.timings?.[0];

    return {
      carrierCode: entry.flightDesignator?.carrierCode ?? '',
      flightNumber: entry.flightDesignator?.flightNumber?.toString() ?? '',
      departureAirport: dep?.iataCode ?? '',
      arrivalAirport: arr?.iataCode ?? '',
      scheduledDeparture: depTimings?.value ?? null,
      scheduledArrival: arrTimings?.value ?? null,
      departureTerminal: dep?.departure?.terminal?.code ?? null,
      departureGate: dep?.departure?.gate?.mainGate ?? null,
      arrivalTerminal: arr?.arrival?.terminal?.code ?? null,
      arrivalGate: arr?.arrival?.gate?.mainGate ?? null,
      status: entry.segments?.[0]?.boardingStatus ?? entry.status ?? 'unknown',
      duration: entry.legs?.[0]?.scheduledLegDuration ?? null,
    };
  }
}
