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
exports.FlightsService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const flight_provider_interface_1 = require("./interfaces/flight-provider.interface");
let FlightsService = class FlightsService {
    constructor(logger, flightProvider) {
        this.logger = logger;
        this.flightProvider = flightProvider;
    }
    async getSchedules(depIata, arrIata, date) {
        try {
            const results = await this.flightProvider.fetchSchedules(depIata, arrIata, date);
            this.logger.info({ totalResults: results.length }, 'Flight offers fetched');
            return results;
        }
        catch (error) {
            this.logger.error({ err: error?.description || error?.message || error }, 'Amadeus API call failed');
            throw new common_1.HttpException('Flight search failed. Check your API credentials and try again.', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.FlightsService = FlightsService;
exports.FlightsService = FlightsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_pino_1.InjectPinoLogger)(FlightsService.name)),
    __param(1, (0, common_1.Inject)(flight_provider_interface_1.FLIGHT_PROVIDER)),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger, Object])
], FlightsService);
//# sourceMappingURL=flights.service.js.map