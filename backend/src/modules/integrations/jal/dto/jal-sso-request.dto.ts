import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Incoming request from frontend — employee/project info for JAL SSO redirect */
export class JalSsoRequestDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  prmSurName?: string;

  @IsString()
  @IsOptional()
  prmFirstName?: string;

  @IsString()
  @IsOptional()
  sectionCode?: string;

  @IsString()
  @IsOptional()
  issueable?: string;

  @IsString()
  @IsOptional()
  projectNumber?: string;

  @IsString()
  @IsOptional()
  returnUrl?: string;
}
