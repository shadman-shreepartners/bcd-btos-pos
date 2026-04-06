/** Key-value pairs representing the JAL SSO form fields to be auto-submitted by the frontend */
export interface JalSsoFormFields {
  seamlessid: string;
  accesscode: string;
  id: string;
  password: string;
  acudId: string;
  acudPassword: string;
  prmSurName?: string;
  prmFirstName?: string;
  sectionCode?: string;
  issueable?: string;
  projectnumber?: string;
  returnurl?: string;
}
