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
exports.AmadeusProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const Amadeus = require('amadeus');
let AmadeusProvider = class AmadeusProvider {
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
    }
    onModuleInit() {
        this.client = new Amadeus({
            clientId: this.config.get('AMADEUS_CLIENT_ID', ''),
            clientSecret: this.config.get('AMADEUS_CLIENT_SECRET', ''),
        });
        this.logger.info('Amadeus SDK client initialized');
    }
    async fetchSchedules(depIata, arrIata, date) {
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
        this.logger.debug({ totalOffers: offers.length, durationMs }, 'Amadeus flight offers response processed');
        return offers.map((offer) => this.normalize(offer));
    }
    normalize(offer) {
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
};
exports.AmadeusProvider = AmadeusProvider;
exports.AmadeusProvider = AmadeusProvider = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_pino_1.InjectPinoLogger)(AmadeusProvider.name)),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger,
        config_1.ConfigService])
], AmadeusProvider);
//# sourceMappingURL=amadeus.provider.js.map