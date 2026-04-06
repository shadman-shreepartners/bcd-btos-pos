/** JAL SSO v2 form field names — must match JAL's expected parameter names exactly */
export const JAL_SSO_FIELDS = {
  SEAMLESS_ID: 'seamlessid',
  ACCESS_CODE: 'accesscode',
  ID: 'id',
  PASSWORD: 'password',
  ACUD_ID: 'acudId',
  ACUD_PASSWORD: 'acudPassword',
  PRM_SURNAME: 'prmSurName',
  PRM_FIRSTNAME: 'prmFirstName',
  SECTION_CODE: 'sectionCode',
  ISSUEABLE: 'issueable',
  PROJECT_NUMBER: 'projectnumber',
  RETURN_URL: 'returnurl',
} as const;

export const JAL_SSO_CONTENT_TYPE = 'application/x-www-form-urlencoded';
export const JAL_SSO_METHOD = 'POST';
