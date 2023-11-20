import { AsyncResult, Err, Ok, Result } from '~/shared/Result';
import { FlowReturn } from '../playwright/setup/Runner';
import { ApiError, Session } from './helpers/client';
import { api } from './helpers/setup';
import { DaznLogin, DaznSubscription } from './validators/dazn-validator';
import { FlowResultActive, FlowResultCanceled } from '../playwright/helpers';
import dayjs from 'dayjs';

type Token = {
  access_token: string;
  expires: string;
};

const getSubscriptions = (client: Session, token: Token) => {
  return client
    .fetch<DaznSubscription>({
      url: 'https://myaccount-bff.ar.indazn.com/v2/subscriptions',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    })
    .andThen((res): Result<FlowReturn, ApiError> => {
      if (res.data.length === 0) {
        return Ok({
          token,
          data: {
            membershipStatus: 'inactive',
            lastSyncedAt: new Date().toISOString(),
          },
        } satisfies FlowReturn);
      }

      console.log(res.data[0]);

      const subscription = res.data[0];
      const billingCycle = subscription.activePass.period === 'Annual' ? 'yearly' : 'monthly';
      const nextPaymentPrice = subscription.activePass.price * 100;
      const nextPaymentDate = subscription.nextPaymentDate;
      const membershipPlan = subscription.tiers?.currentPlan.name ?? 'Unknown';
      if (subscription.status === 'Active' && subscription.inProgress === 'NONE') {
        return Ok({
          token,
          data: {
            membershipStatus: 'active' as const,
            lastSyncedAt: new Date().toISOString(),
            billingCycle,
            nextPaymentDate,
            nextPaymentPrice,
            membershipPlan,
          } satisfies FlowResultActive,
        } satisfies FlowReturn);
      } else if (
        (subscription.status === 'Active' && subscription.inProgress === 'SUBSCRIPTION_CANCEL') ||
        subscription.status === 'Cancelled'
      ) {
        return Ok({
          token,
          data: {
            membershipStatus: 'canceled',
            lastSyncedAt: new Date().toISOString(),
            expiresAt: dayjs().endOf('day').toISOString(),
            membershipPlan,
            nextPaymentPrice,
            billingCycle,
          } satisfies FlowResultCanceled,
        } satisfies FlowReturn);
      } else {
        return Ok({
          token,
          data: {
            membershipStatus: 'inactive',
            lastSyncedAt: new Date().toISOString(),
          },
        } satisfies FlowReturn);
      }
    });
};

export const connect = api(({ client, auth, item }) => {
  return client
    .fetch<DaznLogin>({
      url: 'https://authentication-prod.ar.indazn.com/v5/SignIn',
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0 signin/4.34.5.57 hyper/0.14.0 (web; production; de)',
        'Content-Type': 'application/json',
      },
      body: {
        Email: auth.email,
        Password: auth.password,
      },
    })
    .mapErr((err) => {
      if (err.statusCode === 401 && err.response?.data?.['odata.error'].code === 10049) {
        return {
          ...err,
          custom: 'The user used wrong credentials',
          message: 'Your login credentials are wrong. Please check them and try again.',
          userFriendly: true,
        } satisfies ApiError;
      }
      return err;
    })
    .andThen((res) => {
      const token = {
        access_token: res.data.AuthToken.Token,
        expires: res.data.AuthToken.Expires,
      };
      return getSubscriptions(client, token);
    });
});
