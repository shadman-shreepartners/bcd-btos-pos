import { JalSsoFormFields } from '../types/jal.types';

/** Response returned to frontend — contains everything needed to auto-submit the SSO form to JAL */
export class JalSsoResponseDto {
  targetUrl!: string;
  method!: string;
  contentType!: string;
  fields!: JalSsoFormFields;
}
