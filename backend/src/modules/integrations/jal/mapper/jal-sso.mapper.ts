import { JalSsoRequestDto } from '../dto/jal-sso-request.dto';
import { JalSsoResponseDto } from '../dto/jal-sso-response.dto';
import { JalSsoFormFields } from '../types/jal.types';
import {
  JAL_SSO_CONTENT_TYPE,
  JAL_SSO_METHOD,
} from '../constants/jal.constants';

interface JalSsoConfig {
  ssoUrl: string;
  seamlessId: string;
  accessCode: string;
  acudId: string;
  acudPassword: string;
}

/**
 * Maps internal request DTO + config credentials into the full JAL SSO form payload.
 * Pure function — no side effects, easy to unit test.
 */
export function mapToJalSsoResponse(
  request: JalSsoRequestDto,
  config: JalSsoConfig,
): JalSsoResponseDto {
  const fields: JalSsoFormFields = {
    seamlessid: config.seamlessId,
    accesscode: config.accessCode,
    id: request.id,
    password: request.password ?? '',
    acudId: config.acudId,
    acudPassword: config.acudPassword,
    ...(request.prmSurName && { prmSurName: request.prmSurName }),
    ...(request.prmFirstName && { prmFirstName: request.prmFirstName }),
    ...(request.sectionCode && { sectionCode: request.sectionCode }),
    ...(request.issueable && { issueable: request.issueable }),
    ...(request.projectNumber && { projectnumber: request.projectNumber }),
    ...(request.returnUrl && { returnurl: request.returnUrl }),
  };

  const response = new JalSsoResponseDto();
  response.targetUrl = config.ssoUrl;
  response.method = JAL_SSO_METHOD;
  response.contentType = JAL_SSO_CONTENT_TYPE;
  response.fields = fields;

  return response;
}
