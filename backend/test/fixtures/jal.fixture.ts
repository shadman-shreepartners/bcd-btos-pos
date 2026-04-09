import { JalSsoRequestDto } from '../../src/modules/integrations/jal/dto/jal-sso-request.dto';

export const JAL_CONFIG = {
  ssoUrl: 'https://jal-sso.example.com/sso',
  seamlessId: 'TEST_SEAMLESS_ID',
  accessCode: 'TEST_ACCESS_CODE',
  acudId: 'TEST_ACUD_ID',
  acudPassword: 'TEST_ACUD_PASSWORD',
};

export const JAL_CONFIG_ENV: Record<string, string> = {
  JAL_SSO_URL: JAL_CONFIG.ssoUrl,
  JAL_SEAMLESS_ID: JAL_CONFIG.seamlessId,
  JAL_ACCESS_CODE: JAL_CONFIG.accessCode,
  JAL_ACUD_ID: JAL_CONFIG.acudId,
  JAL_ACUD_PASSWORD: JAL_CONFIG.acudPassword,
  // SOAP — needed by env.validation's zod schema at module init
  JAL_SOAP_WSDL_URL: 'https://example.com/jal-mock.wsdl',
  JAL_SOAP_CORPORATE_ID: 'C0050874',
  JAL_SOAP_TIMEOUT_MS: '30000',
};

export const validSsoRequest: JalSsoRequestDto = {
  id: 'XC0050870',
  projectNumber: 'M5555J260300050',
};

export const minimalSsoRequest: JalSsoRequestDto = {
  id: 'MINIMAL_USER',
};

export const fullSsoRequest: JalSsoRequestDto = {
  id: 'XC0050870',
  password: 'pass123',
  prmSurName: 'TANAKA',
  prmFirstName: 'TARO',
  sectionCode: 'SEC001',
  issueable: 'Y',
  projectNumber: 'M5555J260300050',
  returnUrl: 'https://btos.example.com/callback',
};

export const specialCharsRequest: JalSsoRequestDto = {
  id: 'XC005&0870',
  password: 'p@ss=123&key',
  prmSurName: '田中',
  prmFirstName: '太郎',
  projectNumber: 'M5555J260300050',
};

/** Literal union for strict key typing where needed */
export const JAL_CONFIG_KEYS_TUPLE = [
  'JAL_SSO_URL',
  'JAL_SEAMLESS_ID',
  'JAL_ACCESS_CODE',
  'JAL_ACUD_ID',
  'JAL_ACUD_PASSWORD',
] as const;

export type JalConfigKey = (typeof JAL_CONFIG_KEYS_TUPLE)[number];

/** Mutable `string[]` for `it.each` / Jest overloads */
export const JAL_CONFIG_KEYS: string[] = [...JAL_CONFIG_KEYS_TUPLE];
