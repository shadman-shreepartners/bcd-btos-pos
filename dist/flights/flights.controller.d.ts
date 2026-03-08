import { PinoLogger } from 'nestjs-pino';
import { FlightsService } from './flights.service';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { FlightStatusQueryDto } from './dto/flight-status-query.dto';
import { FlightRecord } from './interfaces/flight-record.interface';
import { FlightStatusService } from './flight-status.service';
import { FlightStatus } from './interfaces/flight-status.interface';
export declare class FlightsController {
    private readonly logger;
    private readonly flightsService;
    private readonly flightStatusService;
    constructor(logger: PinoLogger, flightsService: FlightsService, flightStatusService: FlightStatusService);
    getSchedules(query: ScheduleQueryDto): Promise<FlightRecord[]>;
    getFlightStatus(query: FlightStatusQueryDto): Promise<FlightStatus[]>;
}
