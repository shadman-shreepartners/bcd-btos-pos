import { IsString, Matches } from 'class-validator';

/**
 * Validates incoming flight status query parameters.
 * Requires carrier code (2-3 letters), flight number (1-4 digits), and date (YYYY-MM-DD).
 */
export class FlightStatusQueryDto {
  @IsString()
  @Matches(/^[A-Za-z]{2,3}$/, {
    message: 'carrierCode must be 2-3 letters (e.g. JL)',
  })
  carrierCode: string;

  @IsString()
  @Matches(/^\d{1,4}$/, {
    message: 'flightNumber must be 1-4 digits (e.g. 319)',
  })
  flightNumber: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;
}
