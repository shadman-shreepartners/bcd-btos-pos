import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Incoming request from frontend — company/employee/project data for ANA SSO redirect */
export class AnaSsoRequestDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @IsString()
  @IsNotEmpty()
  corpId!: string;

  @IsString()
  @IsOptional()
  dateFlight1?: string;

  @IsString()
  @IsOptional()
  dateFlight2?: string;
}
