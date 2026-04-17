/** Key-value pairs representing the ANA SSO form fields to be auto-submitted by the frontend */
export interface AnaSsoFormFields {
  loginId: string;
  loginPw: string;
  adminUserId: string;
  userId: string;
  passwd: string;
  companyManagementCd1: string;
  companyManagementCd2: string;
  companyManagementCd3: string;
  sendDataFlg: string;
  sendDataUrl: string;
  sendDataType: string;
  dateFlight1: string;
  dateFlight2: string;
}

export interface AnaCredentialRecord {
  companyId: string;
  employeeId: string;
  loginId: string;
  loginPw: string;
  adminUserId: string;
  userId: string;
  passwd: string;
  corpCode: string;
}
