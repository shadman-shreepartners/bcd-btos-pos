/** DI token for nestjs-soap client — must match SoapModule `clientName` */
export const JAL_SOAP_CLIENT = 'JAL_SOAP_CLIENT';

/**
 * Default SOAP operation for project-number lookup on RetrieveProcedure service.
 * Service URL path is `.../RetrieveProcedure`; operation is `getRecordDetailFromProject` (see JAL-SOAP-API-Documentation.md).
 */
export const JAL_DEFAULT_RETRIEVE_OPERATION = 'getRecordDetailFromProject';
