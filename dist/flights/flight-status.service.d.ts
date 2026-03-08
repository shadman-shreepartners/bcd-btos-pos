import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { FlightStatus } from './interfaces/flight-status.interface';
export declare class FlightStatusService implements OnModuleInit {
    private readonly logger;
    private readonly config;
    private client;
    constructor(logger: PinoLogger, config: ConfigService);
    onModuleInit(): void;
    getStatus(carrierCode: string, flightNumber: string, date: string): Promise<FlightStatus[]>;
    private normalize;
}
