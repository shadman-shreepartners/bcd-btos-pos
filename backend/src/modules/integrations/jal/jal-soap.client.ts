import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Client } from 'soap';
import {
  JAL_DEFAULT_RETRIEVE_OPERATION,
  JAL_SOAP_CLIENT,
} from './constants/jal-soap.constants';
import { formatNowJstIso8601 } from './utils/jal-jst-timestamp';

type AsyncSoapMethod = (args: unknown) => Promise<unknown[]>;

@Injectable()
export class JalSoapClient {
  constructor(
    @Inject(JAL_SOAP_CLIENT)
    private readonly client: Client | null,
    private readonly configService: ConfigService,
    @InjectPinoLogger(JalSoapClient.name)
    private readonly logger: PinoLogger,
  ) {}

  /**
   * Calls JAL `getRecordDetailFromProject` (or `JAL_SOAP_RETRIEVE_OPERATION`) on the
   * RetrieveProcedure SOAP service: in0=corporate ID, in1=JST timestamp, in2=project number.
   * @see JAL-SOAP-API-Documentation.md — "Retrieve Details By Project Number"
   */
  async retrieveByProjectNumber(projectNumber: string): Promise<unknown> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'JAL SOAP client is not available; check JAL_SOAP_WSDL_URL and network access',
      );
    }

    const operation = this.configService.get<string>(
      'JAL_SOAP_RETRIEVE_OPERATION',
      JAL_DEFAULT_RETRIEVE_OPERATION,
    );
    const asyncName = `${operation}Async`;
    const fn = (this.client as unknown as Record<string, unknown>)[asyncName];

    if (typeof fn !== 'function') {
      const keys = Object.keys(this.client).filter((k) => k.endsWith('Async'));
      this.logger.error(
        { operation, asyncName, availableAsyncMethods: keys },
        'JAL SOAP operation not found on WSDL client',
      );
      throw new ServiceUnavailableException(
        `JAL SOAP operation "${asyncName}" is not defined on the WSDL client`,
      );
    }

    const corporateId = this.configService.getOrThrow<string>(
      'JAL_SOAP_CORPORATE_ID',
    );
    const in1 = formatNowJstIso8601();
    const payload = {
      in0: corporateId,
      in1,
      in2: projectNumber,
    };

    this.logger.info(
      { projectNumber, operation: asyncName, jstTimestamp: in1 },
      'Calling JAL SOAP retrieve',
    );

    const timeoutMs = this.configService.get<number>(
      'JAL_SOAP_TIMEOUT_MS',
      30_000,
    );

    try {
      const tuple = await Promise.race([
        (fn as AsyncSoapMethod).call(this.client, payload),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(`JAL SOAP request timed out after ${timeoutMs}ms`),
              ),
            timeoutMs,
          ),
        ),
      ]);
      const [body] = tuple;

      if (body == null || typeof body !== 'object') {
        this.logger.warn(
          { projectNumber, bodyType: typeof body },
          'JAL SOAP returned non-object body',
        );
        return null;
      }

      return body;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        { projectNumber, err: message },
        'JAL SOAP retrieve failed',
      );
      throw new ServiceUnavailableException(
        'JAL SOAP retrieve failed — see logs for details',
      );
    }
  }
}
