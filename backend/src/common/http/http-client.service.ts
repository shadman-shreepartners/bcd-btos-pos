import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  ProviderTimeoutException,
  ProviderErrorException,
  ProviderUnavailableException,
} from '../exceptions';

export interface HttpClientOptions {
  provider: string;
  timeoutMs?: number;
  retries?: number;
  /** Base delays in ms for exponential backoff — length must match retries */
  retryDelays?: number[];
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAYS = [500, 1000, 2000];

/**
 * Resilient HTTP client wrapper around axios.
 * All provider modules use this instead of calling axios directly.
 * Provides: configurable timeout, retry with exponential backoff, error normalization.
 */
@Injectable()
export class HttpClientService {
  constructor(
    @InjectPinoLogger(HttpClientService.name)
    private readonly logger: PinoLogger,
  ) {}

  async request<T>(
    config: AxiosRequestConfig,
    options: HttpClientOptions,
  ): Promise<T> {
    const {
      provider,
      timeoutMs = DEFAULT_TIMEOUT_MS,
      retries = DEFAULT_RETRIES,
      retryDelays = DEFAULT_RETRY_DELAYS,
    } = options;

    const endpoint = `${config.method?.toUpperCase() ?? 'GET'} ${config.url}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response: AxiosResponse<T> = await axios({
          ...config,
          timeout: timeoutMs,
        });

        return response.data;
      } catch (error) {
        if (this.isNonRetryable(error)) {
          this.logUpstreamError(error, provider, endpoint);
          this.normalizeError(error, provider, endpoint, timeoutMs);
        }

        const isLastAttempt = attempt === retries;

        if (isLastAttempt) {
          this.logUpstreamError(error, provider, endpoint);
          this.normalizeError(error, provider, endpoint, timeoutMs);
        }

        const delay = retryDelays[attempt] ?? 2000;
        this.logger.warn(
          `[${provider}] ${endpoint} failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms`,
        );
        await this.sleep(delay);
      }
    }

    // Unreachable — loop always throws on last attempt
    throw new ProviderUnavailableException(
      provider,
      endpoint,
      'Exhausted retries',
    );
  }

  async get<T>(
    url: string,
    options: HttpClientOptions,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url }, options);
  }

  async post<T>(
    url: string,
    data: unknown,
    options: HttpClientOptions,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data }, options);
  }

  private normalizeError(
    error: unknown,
    provider: string,
    endpoint: string,
    timeoutMs: number,
  ): never {
    if (!axios.isAxiosError(error)) {
      throw new ProviderUnavailableException(
        provider,
        endpoint,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new ProviderTimeoutException(provider, endpoint, timeoutMs);
    }

    if (!error.response) {
      throw new ProviderUnavailableException(provider, endpoint, error.message);
    }

    throw new ProviderErrorException(
      provider,
      endpoint,
      error.response.status,
      this.extractProviderMessage(error.response.data),
    );
  }

  private logUpstreamError(
    error: unknown,
    provider: string,
    endpoint: string,
  ): void {
    if (!axios.isAxiosError(error) || !error.response) return;
    this.logger.error(
      {
        provider,
        endpoint,
        upstreamStatus: error.response.status,
        upstreamBody: this.extractProviderMessage(error.response.data),
      },
      `[${provider}] ${endpoint} returned ${error.response.status}`,
    );
  }

  private extractProviderMessage(data: unknown): string | undefined {
    if (typeof data === 'string') return data || undefined;
    if (data !== null && data !== undefined) {
      try {
        return JSON.stringify(data);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  /** 4xx errors are client mistakes — retrying won't fix them */
  private isNonRetryable(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false;
    const status = error.response?.status;
    return status !== undefined && status >= 400 && status < 500;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
