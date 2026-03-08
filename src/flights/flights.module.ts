import { Module } from '@nestjs/common';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { FlightStatusService } from './flight-status.service';
import { AmadeusProvider } from './providers/amadeus.provider';
import { FLIGHT_PROVIDER } from './interfaces/flight-provider.interface';

/**
 * Flights feature module.
 *
 * Wires the FlightProvider abstraction to the Amadeus concrete implementation.
 * To switch data sources, replace AmadeusProvider with any class implementing
 * FlightProvider — no changes needed in the service or controller.
 */
@Module({
  controllers: [FlightsController],
  providers: [
    FlightsService,
    FlightStatusService,
    {
      provide: FLIGHT_PROVIDER,
      useClass: AmadeusProvider,
    },
  ],
})
export class FlightsModule {}
