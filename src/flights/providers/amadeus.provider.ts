import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { FlightProvider } from '../interfaces/flight-provider.interface';
import { FlightRecord } from '../interfaces/flight-record.interface';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Amadeus = require('amadeus');

/**
 * Amadeus implementation of FlightProvider.
 *
 * Uses the Amadeus Flight Offers Search API to find available flights
 * between two airports on a given date.
 */
@Injectable()
export class AmadeusProvider implements FlightProvider, OnModuleInit {
  private client: any;

  constructor(
    @InjectPinoLogger(AmadeusProvider.name)
    private readonly logger: PinoLogger,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.client = new Amadeus({
      clientId: this.config.get<string>('AMADEUS_CLIENT_ID', ''),
      clientSecret: this.config.get<string>('AMADEUS_CLIENT_SECRET', ''),
    });
    this.logger.info('Amadeus SDK client initialized');
  }

  async fetchSchedules(
    depIata: string,
    arrIata: string,
    date: string,
  ): Promise<FlightRecord[]> {
    const start = Date.now();
    this.logger.info({ depIata, arrIata, date }, 'Fetching flight offers from Amadeus');

    const response = await this.client.shopping.flightOffersSearch.get({
      originLocationCode: depIata,
      destinationLocationCode: arrIata,
      departureDate: date,
      adults: '1',
      max: 50,
    });

    const durationMs = Date.now() - start;
    const offers = response?.data;

    if (!Array.isArray(offers)) {
      this.logger.warn({ durationMs }, 'Unexpected response shape from Amadeus');
      return [];
    }

    this.logger.debug(
      { totalOffers: offers.length, durationMs },
      'Amadeus flight offers response processed',
    );

    return offers.map((offer: any) => this.normalize(offer));
  }

  private normalize(offer: any): FlightRecord {
    const firstSegment = offer.itineraries?.[0]?.segments?.[0];
    const lastItinerary = offer.itineraries?.[0];
    const segments = lastItinerary?.segments ?? [];
    const lastSegment = segments[segments.length - 1];

    return {
      airline: firstSegment?.carrierCode ?? null,
      flightNumber: firstSegment
        ? `${firstSegment.carrierCode}${firstSegment.number}`
        : null,
      departureTime: firstSegment?.departure?.at ?? null,
      arrivalTime: lastSegment?.arrival?.at ?? null,
      status: 'available',
      price: offer.price?.grandTotal ?? null,
      currency: offer.price?.currency ?? null,
      duration: lastItinerary?.duration ?? null,
      stops: segments.length > 1 ? segments.length - 1 : 0,
    };
  }
}
