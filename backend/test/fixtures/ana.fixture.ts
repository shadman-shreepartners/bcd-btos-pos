import { AnaSsoRequestDto } from '../../src/modules/integrations/ana/dto/ana-sso-request.dto';

export const ANA_CONFIG = {
  ssoUrl:
    'https://aswbe-d.ana.co.jp/9Eile48/dms/redbe/dyc/be/pages/bizlogin/bizSeamlessLoginDispatch.xhtml',
  sendDataUrl: '/api/v1/integrations/ana/sso/callback',
  credentials: [
    {
      companyId: 'WEB_CUSTOMER_USERID',
      employeeId: 'WEB_CLIENT_USERID',
      loginId: 'SCL96022',
      loginPw: 'sample_corp_password',
      adminUserId: '',
      userId: '0005233323',
      passwd: 'sample_emp_password',
      corpCode: 'M55551A',
    },
  ],
};

export const ANA_CONFIG_ENV: Record<string, string> = {
  ANA_SSO_URL: ANA_CONFIG.ssoUrl,
  ANA_SEND_DATA_URL: ANA_CONFIG.sendDataUrl,
  ANA_SSO_CREDENTIALS: JSON.stringify(ANA_CONFIG.credentials),
  // Existing required env keys from shared schema
  JAL_SSO_URL: 'https://jal-sso.example.com/sso',
  JAL_SEAMLESS_ID: 'TEST_SEAMLESS_ID',
  JAL_ACCESS_CODE: 'TEST_ACCESS_CODE',
  JAL_ACUD_ID: 'TEST_ACUD_ID',
  JAL_ACUD_PASSWORD: 'TEST_ACUD_PASSWORD',
  JAL_SOAP_WSDL_URL: 'https://example.com/jal-mock.wsdl',
  JAL_SOAP_CORPORATE_ID: 'C0050874',
  JAL_SOAP_TIMEOUT_MS: '30000',
  EKISPERT_API_KEY: 'dummy-key',
  EKISPERT_BASE_URL: 'http://api.ekispert.jp/v1/json',
};

export const validAnaSsoRequest: AnaSsoRequestDto = {
  companyId: 'WEB_CUSTOMER_USERID',
  employeeId: 'WEB_CLIENT_USERID',
  projectNumber: 'M5555A111111111',
  dateFlight1: '20260510',
  dateFlight2: '20260911',
};
