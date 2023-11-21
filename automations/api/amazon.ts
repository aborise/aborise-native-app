import { AsyncResult, Err } from '~/shared/Result';
import { parse } from '~/shared/parser';
import { PRIME_URL, dataConverter, primePlanSelector, primeRenewalDateSelector } from '../webview/amazon';
import { ApiError } from './helpers/client';
import { api } from './helpers/setup';
import { getUserId } from '~/shared/ensureDataLoaded';

export const connect = api(({ client }) => {
  return client
    .fetch<string>({
      url: PRIME_URL,
      method: 'GET',
      service: 'amazon',
      user: getUserId(),
      headers: {
        Host: 'www.amazon.de',
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Alt-Used': 'www.amazon.de',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
      },
    })
    .andThen(async ({ data, cookies, request, headers }) => {
      const code = /* javascript */ `
        const fn = () => {
          const plan = document.querySelector('${primePlanSelector}')?.textContent;
          const renewalDate = document.querySelector('${primeRenewalDateSelector}')?.textContent;
          const isLoggedIn = document.getElementById('nav-logobar-greeting')?.textContent.trim();
          return {
            hasPrime: !!plan && !!renewalDate,
            plan,
            renewalDate,
            isLoggedIn
          }
        }
      `;

      const parseResult = await parse<{ hasPrime: boolean; plan?: string; renewalDate?: string }>(data, code);

      console.log('parseResult', parseResult);
      console.log('cookies', cookies);

      if (parseResult.type === 'error') {
        return Err({
          custom: 'Failed to parse response',
          message: 'Failed to parse response',
          errorMessage: parseResult.data,
          statusCode: 500,
        } satisfies ApiError);
      }

      const result = parseResult.result;

      return dataConverter(result)
        .mapErr((err) => {
          return {
            custom: err.data,
            message: err.data,
            errorMessage: err.data,
            statusCode: 500,
          } satisfies ApiError;
        })
        .map((data) => {
          return {
            ...data,
            cookies,
          };
        });
    });
});

export const resume = api(() => {
  return AsyncResult.err({
    errorMessage: 'Not implemented yet',
    message: 'Not implemented yet',
    custom: 'Not implemented yet',
    statusCode: 500,
  });
});

export const cancel = api(() => {
  return AsyncResult.err({
    errorMessage: 'Not implemented yet',
    message: 'Not implemented yet',
    custom: 'Not implemented yet',
    statusCode: 500,
  });
});
