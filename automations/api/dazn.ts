import dayjs from 'dayjs';
import { Ok, Result } from '~/shared/Result';
import { ActionResultActive, ActionResultCanceled } from '../helpers/helpers';
import { ActionReturn } from '../helpers/helpers';
import { ApiError, Session } from './helpers/client';
import { api } from './helpers/setup';
import { DaznLogin, DaznSubscription } from './validators/dazn-validator';

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
    .andThen((res): Result<ActionReturn, ApiError> => {
      if (res.data.length === 0) {
        return Ok({
          token,
          data: [],
        } satisfies ActionReturn);
      }

      console.log(res.data[0]);

      const subscription = res.data[0];
      const billingCycle = subscription.activePass.period === 'Annual' ? 'annual' : 'monthly';
      const planPrice = subscription.activePass.price * 100;
      const nextPaymentDate = subscription.nextPaymentDate;
      const planName = subscription.tiers?.currentPlan.name ?? 'Unknown';
      if (subscription.status === 'Active' && subscription.inProgress === 'NONE') {
        return Ok({
          token,
          data: [
            {
              status: 'active' as const,
              billingCycle,
              nextPaymentDate,
              planPrice: planPrice,
              planName: planName,
            },
          ],
        } satisfies ActionReturn);
      } else if (
        (subscription.status === 'Active' && subscription.inProgress === 'SUBSCRIPTION_CANCEL') ||
        subscription.status === 'Cancelled'
      ) {
        return Ok({
          token,
          data: [
            {
              status: 'canceled',
              expiresAt: dayjs().endOf('day').toISOString(),
              planName: planName,
              planPrice: planPrice,
              billingCycle,
            },
          ],
        } satisfies ActionReturn);
      } else {
        return Ok({
          token,
          data: [],
        } satisfies ActionReturn);
      }
    });
};

export const connect = api(({ client, auth }) => {
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
