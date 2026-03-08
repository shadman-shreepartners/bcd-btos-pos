"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightsController = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const flights_service_1 = require("./flights.service");
const schedule_query_dto_1 = require("./dto/schedule-query.dto");
const flight_status_query_dto_1 = require("./dto/flight-status-query.dto");
const flight_status_service_1 = require("./flight-status.service");
let FlightsController = class FlightsController {
    constructor(logger, flightsService, flightStatusService) {
        this.logger = logger;
        this.flightsService = flightsService;
        this.flightStatusService = flightStatusService;
    }
    async getSchedules(query) {
        const depIata = query.dep_iata.toUpperCase();
        const arrIata = query.arr_iata.toUpperCase();
        const date = query.date || new Date().toISOString().split('T')[0];
        const start = Date.now();
        this.logger.info({ depIata, arrIata, date }, 'Schedule request received');
        const results = await this.flightsService.getSchedules(depIata, arrIata, date);
        const durationMs = Date.now() - start;
        this.logger.info({ depIata, arrIata, date, resultCount: results.length, durationMs }, 'Schedule request completed');
        return results;
    }
    async getFlightStatus(query) {
        const carrierCode = query.carrierCode.toUpperCase();
        const { flightNumber, date } = query;
        const start = Date.now();
        this.logger.info({ carrierCode, flightNumber, date }, 'Flight status request received');
        const results = await this.flightStatusService.getStatus(carrierCode, flightNumber, date);
        const durationMs = Date.now() - start;
        this.logger.info({ carrierCode, flightNumber, date, resultCount: results.length, durationMs }, 'Flight status request completed');
        return results;
    }
};
exports.FlightsController = FlightsController;
__decorate([
    (0, common_1.Get)('schedules'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [schedule_query_dto_1.ScheduleQueryDto]),
    __metadata("design:returntype", Promise)
], FlightsController.prototype, "getSchedules", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [flight_status_query_dto_1.FlightStatusQueryDto]),
    __metadata("design:returntype", Promise)
], FlightsController.prototype, "getFlightStatus", null);
exports.FlightsController = FlightsController = __decorate([
    (0, common_1.Controller)('api/flights'),
    __param(0, (0, nestjs_pino_1.InjectPinoLogger)(FlightsController.name)),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger,
        flights_service_1.FlightsService,
        flight_status_service_1.FlightStatusService])
], FlightsController);
//# sourceMappingURL=flights.controller.js.map