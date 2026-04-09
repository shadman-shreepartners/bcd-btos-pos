import { IsNotEmpty, IsString } from 'class-validator';

/** Inbound request to pull a booking from JAL by project number */
export class JalRetrieveRequestDto {
  @IsString()
  @IsNotEmpty()
  projectNumber!: string;
}
