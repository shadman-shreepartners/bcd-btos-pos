import { integrationClient } from "./integrationClient";

export interface AnaSsoRequest {
  companyId: string;
  employeeId: string;
  projectNumber: string;
  dateFlight1?: string;
  dateFlight2?: string;
}

export type AnaSsoFormFields = Record<string, string>;

export type AnaSsoCredentialsData = {
  targetUrl: string;
  method: string;
  fields: AnaSsoFormFields;
};

export type AnaSsoCredentialsResponse = {
  success: boolean;
  message?: string;
  data?: AnaSsoCredentialsData | null;
  meta?: unknown;
};

function buildAnaSsoPayload(params: AnaSsoRequest): Record<string, string> {
  const base: Record<string, string> = {
    companyId: params.companyId,
    employeeId: params.employeeId,
    projectNumber: params.projectNumber,
  };
  if (params.dateFlight1 !== undefined) {
    base.dateFlight1 = params.dateFlight1;
  }
  if (params.dateFlight2 !== undefined) {
    base.dateFlight2 = params.dateFlight2;
  }
  return base;
}

export const fetchAnaSsoCredentials = async (
  payload: AnaSsoRequest,
): Promise<AnaSsoCredentialsResponse> => {
  const response = await integrationClient.post<AnaSsoCredentialsResponse>(
    "/api/v1/integrations/ana/sso",
    buildAnaSsoPayload(payload),
  );
  return response.data;
};
