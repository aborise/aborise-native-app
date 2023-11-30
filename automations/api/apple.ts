import { fromPromise } from '~/shared/Result';
import { ActionReturn, BillingCycle } from '../helpers/helpers';
import { ApiError } from './helpers/client';
import { getCookies } from './helpers/cookie';
import { api } from './helpers/setup';
import { AppleSubscription } from './validators/apple-validator';
import { useI18n } from '~/composables/useI18n';

const genericApiError: ApiError = {
  custom: 'Something went wrong.',
  errorMessage: 'Something went wrong.',
  message: 'Something went wrong.',
  statusCode: 500,
};

const { t } = useI18n();

export const connect = api(({ client }) => {
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
            message: t('your-session-has-expired-please-reconnect-this-service'),
            userFriendly: true,
            errorMessage: err.message,
          } satisfies ApiError;
        })
        .logData()
        .map(({ data }) => {
          if (data.subscriptions.length === 0) {
            return {
              cookies,
              data: [],
            } satisfies ActionReturn;
          } else {
            // TODO: check if status goes from 'ACTIVE' to 'CANCELED' when subscription is canceled
            const { latestPlan, status, expirationTimestamp } = data.subscriptions[0];
            const price = data.subscriptions[0].renewalOptions.find(
              (o) => o.buyParams.salableAdamId === latestPlan.salableAdamId,
            )?.price;
            return {
              cookies,
              data: [
                {
                  status: 'active',
                  planName: latestPlan.displayName,
                  billingCycle: (latestPlan.period === 'P1M' ? 'monthly' : 'annual') as BillingCycle,
                  nextPaymentDate: new Date(expirationTimestamp).toISOString(),
                  planPrice: Number(price) / 10,
                },
              ],
            } satisfies ActionReturn;
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
