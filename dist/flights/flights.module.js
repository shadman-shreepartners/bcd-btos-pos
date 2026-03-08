"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightsModule = void 0;
const common_1 = require("@nestjs/common");
const flights_controller_1 = require("./flights.controller");
const flights_service_1 = require("./flights.service");
const flight_status_service_1 = require("./flight-status.service");
const amadeus_provider_1 = require("./providers/amadeus.provider");
const flight_provider_interface_1 = require("./interfaces/flight-provider.interface");
let FlightsModule = class FlightsModule {
};
exports.FlightsModule = FlightsModule;
exports.FlightsModule = FlightsModule = __decorate([
    (0, common_1.Module)({
        controllers: [flights_controller_1.FlightsController],
        providers: [
            flights_service_1.FlightsService,
            flight_status_service_1.FlightStatusService,
            {
                provide: flight_provider_interface_1.FLIGHT_PROVIDER,
                useClass: amadeus_provider_1.AmadeusProvider,
            },
        ],
    })
], FlightsModule);
//# sourceMappingURL=flights.module.js.map