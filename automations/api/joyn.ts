import { useLargeUnsafeStorage } from '~/composables/useStorage';
import { api } from './helpers/setup';
import { AsyncResult, Err, Ok, wrapAsync } from '~/shared/Result';
import { ApiError, Session } from './helpers/client';
import { JoynSubscriptions } from '../webview/validators/joyn';
import { ActionReturn, ApiResult } from '../helpers/helpers';

type TokenConfig = {
  access_token: string;
  refresh_token: string;
  client_id: string;
  expires: number;
};

type TokenConfigWithTime = Omit<TokenConfig, 'expires'> & {
  expires_in: number;
};

const refreshToken = (client: Session, config: TokenConfig) => {
  return client
    .fetch<TokenConfigWithTime>({
      url: 'https://auth.joyn.de/auth/refresh',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.access_token}`,
      },
      body: {
        refresh_token: config.refresh_token,
        client_id: config.client_id,
        client_name: 'web',
        grant_type: 'refresh_token',
      },
    })
    .map(({ data }) => {
      const { expires_in, ...rest } = data;
      return {
        ...data,
        expires: Date.now() + expires_in,
      };
    });
};

const ensureValidToken = (client: Session) => {
  return wrapAsync(async () => {
    const storage = useLargeUnsafeStorage();
    let apiAuth = await storage.get<TokenConfig>('services/joyn/api');

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
    .fetch<JoynSubscriptions>({
      url: 'https://subs.joyn.de/abo/api/v1/subscriptions',
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
  return fetchSubscriptions(client, apiAuth).map(({ data: subscriptions }) => {
    if (subscriptions.length === 0) {
      return {
        token: apiAuth,
        data: [],
      } satisfies ActionReturn;
    } else if (subscriptions[0].state.state === 'cancelled') {
      return {
        token: apiAuth,
        data: [
          {
            status: 'canceled',
            billingCycle: 'monthly',
            expiresAt: subscriptions[0].state.expiresOn + 'Z',
            planName: subscriptions[0].config.name,
            planPrice: subscriptions[0].config.price,
          },
        ],
      } satisfies ActionReturn;
    } else {
      return {
        token: apiAuth,
        data: [
          {
            status: 'active',
            billingCycle: 'monthly',
            planName: subscriptions[0].config.name,
            nextPaymentDate: subscriptions[0].state.renewOn + 'Z',
            planPrice: subscriptions[0].state.renewalPrice,
          },
        ],
      } satisfies ActionReturn;
    }
  });
};

// TODO: add pre-active check

export const connect = api(({ client }) => {
  return ensureValidToken(client).andThen((apiAuth) => handleSubscriptionResult(client, apiAuth));
});

export const cancel = api(({ client }) => {
  return ensureValidToken(client).andThen((apiAuth) => {
    return client
      .fetch({
        url: 'https://subs.joyn.de/abo/api/v1/subscriptions',
        method: 'DELETE',
        body: { deactivationReason: 'survey.other' },
        headers: {
          Authorization: `Bearer ${apiAuth.access_token}`,
          'x-authorization': `Bearer ${apiAuth.access_token}`,
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
      .andThen(({ data: subscriptions }) => {
        if (subscriptions.length === 0) {
          return Err({
            custom: 'There was no subscription found.',
            message: 'There was an error resuming your service. Please reconnect this service.',
            errorMessage: 'No subscription found',
            userFriendly: true,
            statusCode: 500,
          } satisfies ApiError);
        }

        return Ok(subscriptions[0].id);
      })
      .andThen((subId) => {
        return client
          .fetch({
            url: `https://subs.joyn.de/abo/api/v1/subscriptions/${subId}/reactivate`,
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiAuth.access_token}`,
              'x-authorization': `Bearer ${apiAuth.access_token}`,
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
