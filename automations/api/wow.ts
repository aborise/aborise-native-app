import { useLargeUnsafeStorage } from '~/composables/useStorage';
import { api } from './helpers/setup';
import { AsyncResult, Err, Ok, wrapAsync } from '~/shared/Result';
import { ApiError, Session } from './helpers/client';
import { useI18n } from '~/composables/useI18n';
import { MD5 } from 'crypto-js';
import { WowSubscription } from '../webview/validators/wow';
import { ActionReturn, ApiResult } from '../helpers/helpers';

type TokenConfig = {
  expires: number;
  authToken: string; // skyId. NOT auth token
  personaId: string;
  userToken: string;
};

type TokenResponse = {
  userToken: string;
  tokenExpiryTime: string;
  recommendedTokenReacquireTime: string;
};

const { t } = useI18n();

const refreshToken = (client: Session, config: TokenConfig) => {
  const body = {
    auth: {
      authScheme: 'MESSO',
      authToken: config.authToken,
      authIssuer: 'NOWTV',
      personaId: config.personaId,
      provider: 'NOWTV',
      providerTerritory: 'DE',
      proposition: 'NOWTV',
    },
    device: { type: 'COMPUTER', platform: 'PC' },
  };

  const hash = MD5(JSON.stringify(body));

  return client
    .fetch<TokenResponse>({
      url: 'https://auth.client.ott.sky.com/auth/tokens',
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.tokens.v1+json',
        'X-SkyOTT-Territory': 'DE',
        'X-SkyOTT-Provider': 'NOWTV',
        'X-SkyOTT-Proposition': 'NOWTV',
        'X-SkyOTT-Platform': 'PC',
        'X-SkyOTT-Device': 'COMPUTER',
        'Content-MD5': hash.toString(),
      },
      body,
    })
    .map(({ data }) => {
      const { recommendedTokenReacquireTime, userToken } = data;
      return {
        ...config,
        userToken,
        expires: Date.parse(recommendedTokenReacquireTime),
      };
    });
};

const ensureValidToken = (client: Session) => {
  return wrapAsync(async () => {
    const storage = useLargeUnsafeStorage();
    let apiAuth = await storage.get<TokenConfig>('services/wow/api');

    if (!apiAuth) {
      return Err({
        custom: 'There was no token in the storage. That should never happen',
        errorMessage: 'No Token',
        message: t('there-was-an-error-refreshing-the-data-please-reconnect-this-service'),
        userFriendly: true,
        statusCode: 500,
      } satisfies ApiError);
    }

    // if (apiAuth.expires < Date.now()) {
    const result = await refreshToken(client, apiAuth);
    if (result.err) {
      return Err({
        ...result.val,
        custom: 'Refreshing the token failed.',
        message: t('there-was-an-error-refreshing-the-data-please-reconnect-this-service'),
        userFriendly: true,
        statusCode: 500,
      } satisfies ApiError);
    }
    apiAuth = result.val;
    // }

    return Ok(apiAuth);
  });
};

const fetchSubscriptions = (client: Session, config: TokenConfig) => {
  return client
    .fetch<WowSubscription>({
      url: 'https://ottsas.sky.com/commerce/is/availableproducts?showPricing=true',
      method: 'GET',
      headers: {
        'X-SkyOTT-UserToken': config.userToken,
        'X-SkyOTT-Platform': 'PC',
        'X-SkyOTT-Device': 'COMPUTER',
        'X-SkyOTT-Territory': 'DE',
        'X-SkyOTT-Provider': 'NOWTV',
        'X-SkyOTT-Proposition': 'NOWTV',
        'X-SkyID-Token': config.authToken,
      },
    })
    .mapErr((err) => {
      console.log(err.response?.data);
      return {
        ...err,
        custom: 'Fetching the subscriptions failed.',
        message: t('there-was-an-error-refreshing-the-data-please-reconnect-this-service'),
        userFriendly: true,
        statusCode: 500,
      } satisfies ApiError;
    });
};

const handleSubscriptionResult = (client: Session, apiAuth: TokenConfig): AsyncResult<ApiResult, ApiError> => {
  return fetchSubscriptions(client, apiAuth).map(({ data: productData }) => {
    const subscriptions = productData.currentSubscriptions; // .filter((sub) => sub.state === 'ACTIVE');

    if (subscriptions.length === 0) {
      return {
        token: apiAuth,
        data: [],
      } satisfies ActionReturn;
    }

    const subs = subscriptions.map((sub) => {
      if (sub.state === 'USER_CANCELLED') {
        const amount = sub.nextRenewalAmount.split('.');
        const price = Number(amount[0]) * 100 + Number(amount[1]);

        return {
          status: 'canceled',
          billingCycle: sub.product.context.subscriptionType === 'MONTHLY' ? 'monthly' : 'annual',
          expiresAt: sub.cancellationEffectiveDate!,
          planName: sub.product.staticId,
          planPrice: price,
          productId: sub.id,
        } satisfies NonNullable<ActionReturn['data']>[number];
      } else {
        const amount = sub.nextRenewalAmount.split('.');
        const price = Number(amount[0]) * 100 + Number(amount[1]);
        return {
          status: 'active',
          billingCycle: sub.product.context.subscriptionType === 'MONTHLY' ? 'monthly' : 'annual',
          planName: sub.product.staticId,
          nextPaymentDate: sub.nextRenewalDueDate!,
          planPrice: price,
          productId: sub.id,
        } satisfies NonNullable<ActionReturn['data']>[number];
      }
    });

    return {
      token: apiAuth,
      data: subs,
    } satisfies ActionReturn;
  });
};

export const connect = api(({ client }) => {
  return ensureValidToken(client).andThen((apiAuth) => handleSubscriptionResult(client, apiAuth));
});

export const cancel = api(({ client, subscription }) => {
  const body = { subscriptionId: subscription!.productId };
  const hash = MD5(JSON.stringify(body));
  return ensureValidToken(client).andThen((apiAuth) => {
    return client
      .fetch({
        url: 'https://ottsas.sky.com/commerce/payments-manager/cancelrenewal',
        method: 'POST',
        body: body,
        headers: {
          'Content-Type': 'application/vnd.cancelrenewal.v1+json',
          'X-SkyOTT-UserToken': apiAuth.userToken,
          'X-SkyOTT-Territory': 'DE',
          'X-SkyOTT-Provider': 'NOWTV',
          'X-SkyOTT-Proposition': 'NOWTV',
          'X-SkyOTT-Platform': 'PC',
          'X-SkyOTT-Device': 'COMPUTER',
          'Content-MD5': hash.toString(),
        },
      })
      .mapErr((err) => {
        return {
          ...err,
          custom: 'The subscription deletion request failed.',
          message: t('there-was-an-error-canceling-your-service-please-reconnect-this-service'),
          userFriendly: true,
          statusCode: 500,
        } satisfies ApiError;
      })
      .andThen(() => handleSubscriptionResult(client, apiAuth));
  });
});

export const resume = api(({ client, subscription }) => {
  const body = { subscriptionId: subscription!.productId };
  const hash = MD5(JSON.stringify(body));
  return ensureValidToken(client).andThen((apiAuth) => {
    return client
      .fetch({
        url: 'https://ottsas.sky.com/commerce/payments-manager/reinstatesubscription',
        method: 'POST',
        body: body,
        headers: {
          'Content-Type': 'application/vnd.reinstate.v1+json',
          'X-SkyOTT-UserToken': apiAuth.userToken,
          'X-SkyOTT-Territory': 'DE',
          'X-SkyOTT-Provider': 'NOWTV',
          'X-SkyOTT-Proposition': 'NOWTV',
          'X-SkyOTT-Platform': 'PC',
          'X-SkyOTT-Device': 'COMPUTER',
          'Content-MD5': hash,
        },
      })
      .mapErr((err) => {
        return {
          ...err,
          custom: 'The subscription reactivation request failed.',
          message: t('there-was-an-error-resuming-your-service-please-reconnect-this-service'),
          userFriendly: true,
          statusCode: 500,
        } satisfies ApiError;
      })
      .andThen(() => handleSubscriptionResult(client, apiAuth));
  });
});
