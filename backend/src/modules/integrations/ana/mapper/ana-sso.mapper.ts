import { AnaSsoRequestDto } from '../dto/ana-sso-request.dto';
import { AnaSsoResponseDto } from '../dto/ana-sso-response.dto';
import { AnaCredentialRecord, AnaSsoFormFields } from '../types/ana.types';
import {
  ANA_SSO_CONTENT_TYPE,
  ANA_SSO_METHOD,
  ANA_SSO_SEND_DATA_FLG,
  ANA_SSO_SEND_DATA_TYPE,
} from '../constants/ana.constants';

interface AnaSsoConfig {
  ssoUrl: string;
  sendDataUrl: string;
}

/**
 * Maps ANA request DTO + credential record + config into the ANA form payload.
 * Pure function — no side effects, easy to unit test.
 */
export function mapToAnaSsoResponse(
  request: AnaSsoRequestDto,
  credential: AnaCredentialRecord,
  config: AnaSsoConfig,
): AnaSsoResponseDto {
  const fields: AnaSsoFormFields = {
    loginId: credential.loginId,
    loginPw: credential.loginPw,
    adminUserId: credential.adminUserId,
    userId: credential.userId,
    passwd: credential.passwd,
    companyManagementCd1: request.projectNumber.slice(-10),
    companyManagementCd2: credential.userId,
    companyManagementCd3: request.projectNumber.slice(0, -10),
    sendDataFlg: ANA_SSO_SEND_DATA_FLG,
    sendDataUrl: config.sendDataUrl,
    sendDataType: ANA_SSO_SEND_DATA_TYPE,
    dateFlight1: '',
    dateFlight2: '',
  };

  const response = new AnaSsoResponseDto();
  response.targetUrl = config.ssoUrl;
  response.method = ANA_SSO_METHOD;
  response.contentType = ANA_SSO_CONTENT_TYPE;
  response.fields = fields;

  return response;
}
