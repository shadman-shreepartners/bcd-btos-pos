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
exports.FlightStatusService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const Amadeus = require('amadeus');
let FlightStatusService = class FlightStatusService {
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
    }
    onModuleInit() {
        this.client = new Amadeus({
            clientId: this.config.get('AMADEUS_CLIENT_ID', ''),
            clientSecret: this.config.get('AMADEUS_CLIENT_SECRET', ''),
        });
    }
    async getStatus(carrierCode, flightNumber, date) {
        const start = Date.now();
        this.logger.info({ carrierCode, flightNumber, date }, 'Fetching flight status from Amadeus');
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
            this.logger.debug({ resultCount: data.length, durationMs }, 'Amadeus flight status response processed');
            return data.map((entry) => this.normalize(entry));
        }
        catch (error) {
            this.logger.error({ err: error?.description || error?.message || error }, 'Amadeus flight status API call failed');
            throw new common_1.HttpException('Flight status lookup failed. Check your API credentials and parameters.', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    normalize(entry) {
        const dep = entry.flightPoints?.find((p) => p.departure);
        const arr = entry.flightPoints?.find((p) => p.arrival);
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
};
exports.FlightStatusService = FlightStatusService;
exports.FlightStatusService = FlightStatusService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_pino_1.InjectPinoLogger)(FlightStatusService.name)),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger,
        config_1.ConfigService])
], FlightStatusService);
//# sourceMappingURL=flight-status.service.js.map