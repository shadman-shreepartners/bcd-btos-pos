import { PinoLogger } from 'nestjs-pino';
import { FlightProvider } from './interfaces/flight-provider.interface';
import { FlightRecord } from './interfaces/flight-record.interface';
export declare class FlightsService {
    private readonly logger;
    private readonly flightProvider;
    constructor(logger: PinoLogger, flightProvider: FlightProvider);
    getSchedules(depIata: string, arrIata: string, date: string): Promise<FlightRecord[]>;
}
