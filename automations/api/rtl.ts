import { useLargeUnsafeStorage } from '~/composables/useStorage';
import { api } from './helpers/setup';
import { AsyncResult, Err, Ok, wrapAsync } from '~/shared/Result';
import { ApiError, Session } from './helpers/client';
import { RTLSubscriptions } from './validators/rtl-validator';
import { timeZoneToUtc } from '../helpers/strings';
import { ActionReturn, ApiResult } from '../helpers/helpers';

type TokenConfig = {
  access_token: string;
  refresh_token: string;
  expires: number;
  refresh_expires: number;
  client_id: 'rtlplus-web';
};

type TokenConfigWithTime = Omit<TokenConfig, 'expires | refresh_expires'> & {
  expires_in: number;
  refresh_expires_in: number;
};

const refreshToken = (client: Session, config: TokenConfig): AsyncResult<TokenConfig, ApiError> => {
  if (config.refresh_expires < Date.now()) {
    return AsyncResult.err({
      custom: 'The refresh token has expired.',
      message: 'Your login has expired. Please reconnect this service.',
      errorMessage: 'Refresh token expired',
      userFriendly: true,
      statusCode: 500,
    } satisfies ApiError);
  }

  return client
    .fetch<TokenConfigWithTime>({
      url: 'https://auth.rtl.de/auth/realms/rtlplus/protocol/openid-connect/token?ngsw-bypass',
      method: 'POST',
      body: {
        refresh_token: config.refresh_token,
        client_id: config.client_id,
        grant_type: 'refresh_token',
      },
    })
    .map(({ data }) => {
      const { expires_in, refresh_expires_in, ...rest } = data;
      return {
        ...data,
        expires: Date.now() + expires_in * 1000,
        refresh_expires: Date.now() + refresh_expires_in * 1000,
      };
    });
};

const ensureValidToken = (client: Session) => {
  return wrapAsync(async () => {
    const storage = useLargeUnsafeStorage();
    let apiAuth = await storage.get<TokenConfig>('services/rtl/api');

    if (!apiAuth) {
      return Err({
        custom: 'There was no token in the storage. That should never happen',
        errorMessage: 'No Token',
        message: 'There was an error refreshing the data. Please reconnect this service.',
        userFriendly: true,
        statusCode: 500,
      } satisfies ApiError);
    }

    if (apiAuth.expires < Date.now()) {
      const result = await refreshToken(client, apiAuth);
      if (result.err) {
        return Err({
          ...result.val,
          custom: 'Refreshing the token failed.',
          message: 'There was an error refreshing the data. Please reconnect this service.',
          userFriendly: true,
          statusCode: 500,
        } satisfies ApiError);
      }
      apiAuth = result.val;
    }

    return Ok(apiAuth);
  });
};

const fetchSubscriptions = (client: Session, config: TokenConfig) => {
  return client
    .fetch<RTLSubscriptions>({
      url: 'https://my.plus.rtl.de/api/subscription',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.access_token}`,
      },
    })
    .mapErr((err) => {
      return {
        ...err,
        custom: 'Fetching the subscriptions failed.',
        message: 'There was an error refreshing the data. Please reconnect this service.',
        userFriendly: true,
        statusCode: 500,
      } satisfies ApiError;
    });
};

const handleSubscriptionResult = (client: Session, apiAuth: TokenConfig): AsyncResult<ApiResult, ApiError> => {
  return fetchSubscriptions(client, apiAuth).map(({ data }) => {
    const sub = data.productSubscriptions[0];
    const planPrice = data.nextBillingPreviewAmount.totalGross * 100;
    const planName = sub.productName;
    const billingCycle = data.billingPeriod.unit === 'YEAR' ? 'annual' : 'monthly';
    const lastSyncedAt = new Date().toISOString();

    if (planName === 'Free') {
      return {
        token: apiAuth,
        data: {
          status: 'inactive',
          lastSyncedAt,
        },
      } satisfies ActionReturn;
    } else if (sub.cancellationDate) {
      const expiresAt = timeZoneToUtc(data.cancellationEffectivenessDate + 'T00:00:00', 'Europe/Berlin').toISOString();

      return {
        token: apiAuth,
        data: {
          status: 'canceled',
          lastSyncedAt,
          billingCycle,
          expiresAt,
          planName,
          planPrice,
        },
      } satisfies ActionReturn;
    } else {
      const nextPaymentDate = timeZoneToUtc(data.nextBillingDate + 'T00:00:00', 'Europe/Berlin').toISOString();
      return {
        token: apiAuth,
        data: {
          status: 'active',
          billingCycle,
          planName,
          nextPaymentDate,
          planPrice,
          lastSyncedAt,
        },
      } satisfies ActionReturn;
    }
  });
};

// TODO: add pre-active check

export const connect = api(({ client }) => {
  return ensureValidToken(client).andThen((apiAuth) => handleSubscriptionResult(client, apiAuth));
});

export const cancel = api(({ client, auth }) => {
  return ensureValidToken(client).andThen((apiAuth) => {
    return client
      .fetch({
        url: 'https://my.plus.rtl.de/api/cancelSubscription',
        method: 'POST',
        body: { password: auth.password, reasonId: 'ffc_nutzung', reasonText: 'Ich nutze mein RTL+ Paket zu wenig' },
        headers: {
          Authorization: `Bearer ${apiAuth.access_token}`,
        },
      })
      .mapErr((err) => {
        return {
          ...err,
          custom: 'The subscription deletion request failed.',
          message: 'There was an error canceling your service. Please reconnect this service.',
          userFriendly: true,
          statusCode: 500,
        } satisfies ApiError;
      })
      .andThen(() => handleSubscriptionResult(client, apiAuth));
  });
});

export const resume = api(({ client }) => {
  return ensureValidToken(client).andThen((apiAuth) => {
    return fetchSubscriptions(client, apiAuth)
      .andThen(() => {
        return client
          .fetch({
            url: 'https://my.plus.rtl.de/api/withdrawCancellation',
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiAuth.access_token}`,
            },
          })
          .mapErr((err) => {
            return {
              ...err,
              custom: 'The subscription reactivation request failed.',
              message: 'There was an error resuming your service. Please reconnect this service.',
              userFriendly: true,
              statusCode: 500,
            } satisfies ApiError;
          });
      })
      .andThen(() => handleSubscriptionResult(client, apiAuth));
  });
});
