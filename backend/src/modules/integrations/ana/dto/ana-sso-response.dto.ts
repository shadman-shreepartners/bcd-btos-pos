import { AnaSsoFormFields } from '../types/ana.types';

/** Response returned to frontend — contains everything needed to auto-submit the SSO form to ANA */
export class AnaSsoResponseDto {
  targetUrl!: string;
  method!: string;
  contentType!: string;
  fields!: AnaSsoFormFields;
}
