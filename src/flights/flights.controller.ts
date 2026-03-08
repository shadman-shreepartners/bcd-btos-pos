import { Controller, Get, Query } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { FlightsService } from './flights.service';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { FlightStatusQueryDto } from './dto/flight-status-query.dto';
import { FlightRecord } from './interfaces/flight-record.interface';
import { FlightStatusService } from './flight-status.service';
import { FlightStatus } from './interfaces/flight-status.interface';

/**
 * Handles inbound HTTP requests for flight search and status.
 *
 * Single Responsibility: HTTP layer only — input validation is handled
 * by the DTO + ValidationPipe, business logic lives in services.
 */
@Controller('api/flights')
export class FlightsController {
  constructor(
    @InjectPinoLogger(FlightsController.name)
    private readonly logger: PinoLogger,
    private readonly flightsService: FlightsService,
    private readonly flightStatusService: FlightStatusService,
  ) {}

  /** GET /api/flights/schedules?dep_iata=HND&arr_iata=NRT&date=2026-03-10 */
  @Get('schedules')
  async getSchedules(@Query() query: ScheduleQueryDto): Promise<FlightRecord[]> {
    const depIata = query.dep_iata.toUpperCase();
    const arrIata = query.arr_iata.toUpperCase();
    const date = query.date || new Date().toISOString().split('T')[0];
    const start = Date.now();

    this.logger.info({ depIata, arrIata, date }, 'Schedule request received');

    const results = await this.flightsService.getSchedules(depIata, arrIata, date);
    const durationMs = Date.now() - start;

    this.logger.info(
      { depIata, arrIata, date, resultCount: results.length, durationMs },
      'Schedule request completed',
    );

    return results;
  }

  /** GET /api/flights/status?carrierCode=JL&flightNumber=123&date=2026-03-10 */
  @Get('status')
  async getFlightStatus(@Query() query: FlightStatusQueryDto): Promise<FlightStatus[]> {
    const carrierCode = query.carrierCode.toUpperCase();
    const { flightNumber, date } = query;
    const start = Date.now();

    this.logger.info({ carrierCode, flightNumber, date }, 'Flight status request received');

    const results = await this.flightStatusService.getStatus(carrierCode, flightNumber, date);
    const durationMs = Date.now() - start;

    this.logger.info(
      { carrierCode, flightNumber, date, resultCount: results.length, durationMs },
      'Flight status request completed',
    );

    return results;
  }
}
