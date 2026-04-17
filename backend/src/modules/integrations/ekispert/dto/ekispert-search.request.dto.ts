import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export type EkispertSearchType = 'departure' | 'arrival';

export class EkispertSearchRequestDto {
  @IsString()
  @IsNotEmpty()
  origin!: string;

  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsString()
  @Matches(/^\d{8}$/)
  date!: string;

  @IsString()
  @Matches(/^\d{4}$/)
  time!: string;

  @IsOptional()
  @IsString()
  @IsIn(['departure', 'arrival'])
  searchType?: EkispertSearchType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  answerCount?: number;
}
