import { IsString, Matches, IsOptional } from 'class-validator';

/**
 * Validates incoming flight schedule query parameters.
 * Both airport codes must be exactly 3 letters (IATA codes).
 * Date is optional and defaults to today if omitted.
 */
export class ScheduleQueryDto {
  @IsString()
  @Matches(/^[A-Za-z]{3}$/, {
    message: 'dep_iata must be exactly 3 letters (e.g. HND)',
  })
  dep_iata: string;

  @IsString()
  @Matches(/^[A-Za-z]{3}$/, {
    message: 'arr_iata must be exactly 3 letters (e.g. NRT)',
  })
  arr_iata: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date?: string;
}
