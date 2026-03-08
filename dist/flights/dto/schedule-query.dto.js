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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleQueryDto = void 0;
const class_validator_1 = require("class-validator");
class ScheduleQueryDto {
}
exports.ScheduleQueryDto = ScheduleQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Za-z]{3}$/, {
        message: 'dep_iata must be exactly 3 letters (e.g. HND)',
    }),
    __metadata("design:type", String)
], ScheduleQueryDto.prototype, "dep_iata", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Za-z]{3}$/, {
        message: 'arr_iata must be exactly 3 letters (e.g. NRT)',
    }),
    __metadata("design:type", String)
], ScheduleQueryDto.prototype, "arr_iata", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'date must be in YYYY-MM-DD format',
    }),
    __metadata("design:type", String)
], ScheduleQueryDto.prototype, "date", void 0);
//# sourceMappingURL=schedule-query.dto.js.map