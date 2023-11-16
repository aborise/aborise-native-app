import { useLargeUnsafeStorage } from '~/composables/useStorage';
import { api } from './helpers/setup';
import { Err, wrapAsync } from '~/shared/Result';
import { ApiError, Session } from './helpers/client';
import { JoynSubscriptions } from '../webview/validators/joyn';
import { FlowReturn } from '../playwright/setup/Runner';

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

const fetchSubscriptions = (client: Session, config: TokenConfig) => {
  return client.fetch<JoynSubscriptions>({
    url: 'https://subs.joyn.de/abo/api/v1/subscriptions',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.access_token}`,
    },
  });
};

export const connect = api(({ client, auth, item }) => {
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

    return fetchSubscriptions(client, apiAuth)
      .mapErr((err) => {
        return {
          ...err,
          custom: 'Fetching the subscriptions failed.',
          message: 'There was an error refreshing the data. Please reconnect this service.',
          userFriendly: true,
          statusCode: 500,
        } satisfies ApiError;
      })
      .map(({ data: subscriptions }) => {
        if (subscriptions.length === 0) {
          return {
            token: apiAuth,
            data: {
              membershipStatus: 'inactive',
              lastSyncedAt: new Date().toISOString(),
            },
          } satisfies FlowReturn;
        } else {
          return {
            token: apiAuth,
            data: {
              membershipStatus: 'active',
              billingCycle: 'monthly',
              membershipPlan: subscriptions[0].config.name,
              nextPaymentDate: subscriptions[0].state.renewOn + 'Z',
              nextPaymentPrice: subscriptions[0].state.renewalPrice,
              lastSyncedAt: new Date().toISOString(),
            },
          };
        }
      });
  });
});
