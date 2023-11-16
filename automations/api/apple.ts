import { parse } from '~/shared/parser';
import { api } from './helpers/setup';
import { Err, Ok, fromPromise, wrapAsync } from '~/shared/Result';
import { ApiError } from './helpers/client';
import { FlowResult } from '../playwright/helpers';
import { getCookies } from './helpers/cookie';
import { Cookie } from 'playwright-core';
import { AppleSubscription } from './validators/apple-validator';
import { FlowReturn } from '../playwright/setup/Runner';
import { extractAmount } from '../playwright/strings';

const genericApiError: ApiError = {
  custom: 'Something went wrong.',
  errorMessage: 'Something went wrong.',
  message: 'Something went wrong.',
  statusCode: 500,
};

export const connect = api(({ client, item }) => {
  return fromPromise(getCookies('apple'))
    .mapErr(() => genericApiError)
    .andThen((cookies) => {
      return client
        .fetch<AppleSubscription>({
          url: 'https://buy.tv.apple.com/commerce/web/subscription?subscriptionType=tv',
          method: 'GET',
          cookies,
        })
        .mapErr((err) => {
          console.log(err.response?.data.errors);
          return {
            custom: 'Request to apple api failed',
            statusCode: err.statusCode,
            message: 'Your session has expired. Please connect this service again.',
            userFriendly: true,
            errorMessage: err.message,
          } satisfies ApiError;
        })
        .map(({ data }) => {
          if (data.subscriptions.length === 0) {
            return {
              cookies,
              data: {
                membershipStatus: 'inactive',
                lastSyncedAt: new Date().toISOString(),
              },
            } satisfies FlowReturn;
          } else {
            // TODO: check if status goes from 'ACTIVE' to 'CANCELED' when subscription is canceled
            const { latestPlan, status, expirationTimestamp } = data.subscriptions[0];
            const price = data.subscriptions[0].renewalOptions.find(
              (o) => o.buyParams.salableAdamId === latestPlan.salableAdamId,
            )?.price;
            return {
              cookies,
              data: {
                membershipStatus: 'active',
                lastSyncedAt: new Date().toISOString(),
                membershipPlan: latestPlan.displayName,
                billingCycle: latestPlan.period === 'P1M' ? 'monthly' : 'yearly',
                nextPaymentDate: new Date(expirationTimestamp).toISOString(),
                nextPaymentPrice: Number(price) / 10,
              },
            } satisfies FlowReturn;
          }
        });
      // return client
      //   .fetch<string>({
      //     url: 'https://tv.apple.com/',
      //     method: 'GET',
      //     cookies,
      //   })
      //   .andThen(({ data }) => {
      //     const code = /* javascript */ `
      //       const fn = () => {
      //         const data = document.querySelector(".nav-header__user-controls button.commerce-button");

      //         if (data) {
      //           throw new Error('Not logged in.');
      //         }

      //         const meta = document.querySelector('meta[name="web-tv-app/config/environment"]').getAttribute("content");
      //         const config = JSON.parse(decodeURIComponent(meta));
      //         const token = config.MEDIA_API.token;

      //         return token;
      //       }
      //     `;

      //     return parse<string>(data, code).then((result) => {
      //       if (result.type === 'error') {
      //         return Err({
      //           custom: 'Could not extract token from page.',
      //           errorMessage: result.data,
      //           message: result.data,
      //           statusCode: 500,
      //           userFriendly: result.data === 'Not logged in.',
      //         } satisfies ApiError);
      //       }

      //       return Ok(result.result);
      //     });
      //   })
      // .andThen((token) => {
      //   const mediaToken = cookies.find((c) => c.name === 'media-user-token');

      //   return client.fetch<{
      //     data: [{ id: 'me'; type: 'accounts'; href: '/v1/me/account'; attributes: { restrictions: {} } }];
      //     meta: { subscription: { active: false; storefront: 'de' } };
      //   }>({
      //     url: 'https://amp-api.music.apple.com/v1/me/account?meta=subscription',
      //     method: 'GET',
      //     cookies,
      //     headers: {
      //       Origin: 'https://tv.apple.com',
      //       authorization: `Bearer ${token}`,
      //       'media-user-token': mediaToken?.value,
      //     },
      //   });
      // })
    });
});
