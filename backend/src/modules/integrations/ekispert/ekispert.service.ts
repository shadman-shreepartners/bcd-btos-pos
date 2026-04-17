import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClientService } from '../../../common/http/http-client.service';
import {
  ProviderErrorException,
  ProviderTimeoutException,
  ProviderUnavailableException,
} from '../../../common/exceptions';
import {
  ApiResponse,
  ResponseHelper,
} from '../../../common/interfaces/response';
import { EkispertSearchRequestDto } from './dto/ekispert-search.request.dto';
import { EkispertSearchResponseDto } from './dto/ekispert-search.response.dto';
import { mapEkispertSearchResponse } from './mapper/ekispert.mapper';

type EkispertRawResponse = unknown;

const EKISPERT_PROVIDER = 'Ekispert';
const EKISPERT_ROUTE_PATH = '/search/course/extreme';
const EKISPERT_GCS = 'wgs84';
const EKISPERT_CONDITION_DETAIL = 'T2200200000000:F0000000000000:A00000000:';

@Injectable()
export class EkispertService {
  constructor(
    private readonly httpClient: HttpClientService,
    private readonly configService: ConfigService,
  ) {}

  async search(
    request: EkispertSearchRequestDto,
  ): Promise<ApiResponse<EkispertSearchResponseDto>> {
    const baseUrl = this.configService
      .getOrThrow<string>('EKISPERT_BASE_URL')
      .replace(/\/+$/, '');
    const apiKey = this.configService.getOrThrow<string>('EKISPERT_API_KEY');

    let rawResponse: EkispertRawResponse;
    try {
      rawResponse = await this.httpClient.get<EkispertRawResponse>(
        `${baseUrl}${EKISPERT_ROUTE_PATH}`,
        {
          provider: EKISPERT_PROVIDER,
        },
        {
          params: {
            key: apiKey,
            viaList: `${request.origin}:${request.destination}`,
            date: request.date,
            time: request.time,
            searchType: request.searchType ?? 'departure',
            answerCount: request.answerCount ?? 5,
            gcs: EKISPERT_GCS,
            conditionDetail: EKISPERT_CONDITION_DETAIL,
          },
        },
      );
    } catch (error) {
      if (
        error instanceof ProviderErrorException ||
        error instanceof ProviderTimeoutException ||
        error instanceof ProviderUnavailableException
      ) {
        throw error;
      }
      throw new ProviderUnavailableException(
        EKISPERT_PROVIDER,
        EKISPERT_ROUTE_PATH,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    const data = mapEkispertSearchResponse(rawResponse, request.date);
    return ResponseHelper.success(data, 'Routes retrieved successfully');
  }
}
