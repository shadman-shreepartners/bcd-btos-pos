import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { FlightProvider } from '../interfaces/flight-provider.interface';
import { FlightRecord } from '../interfaces/flight-record.interface';
export declare class AmadeusProvider implements FlightProvider, OnModuleInit {
    private readonly logger;
    private readonly config;
    private client;
    constructor(logger: PinoLogger, config: ConfigService);
    onModuleInit(): void;
    fetchSchedules(depIata: string, arrIata: string, date: string): Promise<FlightRecord[]>;
    private normalize;
}
