import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import type { Cookie } from 'playwright-core';
import { Err, Ok, fromPromise, wrapAsync, type AsyncResult, type Result } from '~/shared/Result';
import type { AllServices } from '~/shared/allServices';
import { strToCookie } from '~/shared/helpers';
import { cookiesToString, deduplicateCookies, getCookies, parseCookieString } from './cookie';
import { filterHeaders } from './headers';
import { Storage } from '~/composables/useStorage';
import CookieManager from '@react-native-cookies/cookies';
import { parse } from 'cookie';

const axiosInterceptor = (config: InternalAxiosRequestConfig) => {
  // consola.info(`Starting ${config.method} Request to`, config.url);
  // consola.log('Headers: ', filterHeaders(config.headers, ['Cookie']));
  // consola.log(
  //   'Cookies',
  //   config.headers['Cookie']
  //     ?.split(';')
  //     .map(strToCookie)
  //     .map((cookie: Cookie) => cookie.name) ?? 'none',
  // );
  // consola.log('Data: ', config.data ?? 'none');
  // consola.log('Params: ', config.params ?? 'none');

  return config;
};

export type AboFetchOptions = {
  url: string;
  body?: Record<string, unknown> | FormData | object;
  cookies?: Cookie[];
  headers?: Record<string, unknown>;
  method: 'POST' | 'GET' | 'PUT';
  params?: string | string[][] | Record<string, any> | URLSearchParams;
  user?: string;
  service?: keyof AllServices;
  cookieKeys?: Array<string>;
  storage?: Storage;
};

export type ApiError = {
  statusCode: number;
  message: string;
  request?: RequestSummary;
  response?: {
    data: any;
    headers: Record<string, string>;
    cookies: Cookie[];
  };
  stack?: string;
  errorMessage: string;
  custom: string;
  history?: ApiError | ApiResponse<any>;
  code?: string;
  userFriendly?: boolean;
};

export type ApiResponse<T> = {
  data: T;
  cookies: Cookie[];
  headers?: Record<string, string>;
  request?: RequestSummary;
};

export type AboFetchResult<T> = Result<ApiResponse<T>, ApiError>;
export type AsyncAboFetchResult<T> = AsyncResult<ApiResponse<T>, ApiError>;

type RequestSummary = {
  url: string | undefined;
  method: string | undefined;
  headers: {
    [x: string]: string;
  };
  data: any;
  params: any;
  cookies: any;
} | null;

const getRequestSummary = (request?: InternalAxiosRequestConfig): RequestSummary => {
  if (!request) return null;
  return {
    url: request.url,
    method: request.method,
    headers: filterHeaders(request.headers, ['Cookie']),
    data: request.data,
    params: request.params,
    cookies: request.headers?.Cookie?.split(';').map(strToCookie) ?? [],
  };
};

export const aboFetch = <T extends string | JSON | object = string | JSON>(
  options: AboFetchOptions,
  axiosOptions?: AxiosRequestConfig,
) => {
  return wrapAsync(async () => {
    const { url, body, headers, method, params, user, service, cookieKeys, storage } = options;

    if (user && service) {
      const cookies = await getCookies(service, cookieKeys);
      options.cookies = cookies;
    }

    axiosRetry(axios, {
      retries: 3,
      retryCondition: () => true,
    });

    axios.interceptors.request.use(axiosInterceptor);

    const Cookie = cookiesToString(options.cookies) || undefined;

    // get protocol and host from url
    const protocol = url?.split('://')[0];
    const host = url?.split('://')[1]?.split('/')[0];

    const domain = `${protocol}://${host}`;

    await CookieManager.clearAll();
    await Promise.all(
      deduplicateCookies(options.cookies ?? []).map((cookie) => {
        // console.log('Setting cookie', `"${cookie.name}"`);
        return CookieManager.set(domain, {
          domain: cookie.domain,
          path: cookie.path,
          // version: cookie.version,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          expires: new Date(cookie.expires + 7 * 24 * 60 * 60 * 1000).toISOString(),
          name: cookie.name,
          value: cookie.value,
        });
      }),
    );

    let result = await fromPromise(
      axios.request<T>({
        url: (url as string) + (params ? `?${new URLSearchParams(params).toString()}` : ''),
        data: body,
        method: method as any,
        headers: {
          ...headers,
          Cookie,
        },
        ...axiosOptions,
      }),
    );

    if (result.ok) {
      const response = result.val;
      const cookies = response.headers['set-cookie']?.flatMap((str) => parseCookieString(str)) ?? [];
      const headers = filterHeaders(response.headers as any, ['set-cookie']);

      // console.log('The following cookies were set:', cookies.map((cookie) => cookie.name).join(', ') || 'none');

      // parse to json if needed
      let data: string | JSON | object = response.data;
      if (response.headers['Content-Type'] === 'application/json') {
        data = JSON.parse(response.data as string) as object;
      }

      const ret = Ok({
        data: data as T,
        request: getRequestSummary(response.config),
        headers,
        cookies,
      });

      return ret;
    }

    const error = result.val as AxiosError;

    if (error.response) {
      const cookies = error.response.headers['set-cookie']?.map((a) => strToCookie(a)) ?? [];
      const headers = filterHeaders(error.response.headers as any, ['set-cookie']);

      // console.log('The following cookies were set:', cookies.map((cookie) => cookie.name).join(', ') || 'none');

      const err: AboFetchResult<T> = Err({
        statusCode: error.response.status,
        message: error.response.statusText,
        request: getRequestSummary(error.config),
        response: {
          data: error.response.data,
          headers: headers,
          cookies,
        },
        stack: error.stack,
        errorMessage: error.message,
        custom: 'The request to the external API failed and a non 2xx status code was returned.',
      });

      return err;
    } else if (error.request) {
      const err: AboFetchResult<T> = Err({
        statusCode: 500,
        message: 'No response',
        request: getRequestSummary(error.config),
        stack: error.stack,
        errorMessage: error.message,
        custom: 'The request to the external API failed and no response was received.',
      });

      return err;
    } else {
      const err: AboFetchResult<T> = Err({
        statusCode: 500,
        message: 'Axios Error',
        request: getRequestSummary(error.config),
        stack: error.stack,
        errorMessage: error.message,
        custom: 'Setting up the request failed',
      });

      return err;
    }
  });
};

export class Session {
  requests: Array<ApiResponse<any> | ApiError> = [];

  fetch<T extends string | object | JSON>(options: AboFetchOptions, axiosOptions?: AxiosRequestConfig) {
    const result = aboFetch<T>(options, axiosOptions);

    result.then((result) => {
      if (result.ok) {
        if (
          result.val.headers?.['Content-Type']?.startsWith('text/') ||
          result.val.headers?.['content-type']?.startsWith('text/')
        ) {
          return;
        }
      }
      this.requests.push(result.val);
    });

    return result;
  }

  log(fakeResponse: ApiResponse<any> | ApiError) {
    this.requests.push(fakeResponse);
  }

  post<T extends string | object | JSON>(
    url: string,
    body: AboFetchOptions['body'],
    options: Omit<AboFetchOptions, 'method' | 'url' | 'body'> = {},
  ) {
    return this.fetch<T>({ ...options, url, body, method: 'POST' });
  }

  get<T extends string | object | JSON>(url: string, options: Omit<AboFetchOptions, 'method' | 'url'> = {}) {
    return this.fetch<T>({ ...options, url, method: 'GET' });
  }

  put<T extends string | object | JSON>(
    url: string,
    body: AboFetchOptions['body'],
    options: Omit<AboFetchOptions, 'method' | 'url' | 'body'> = {},
  ) {
    return this.fetch<T>({ ...options, url, body, method: 'PUT' });
  }

  toJSON() {
    return this.requests;
  }
}
