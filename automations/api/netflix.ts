import { AsyncResult, Err, Ok, Result } from '~/shared/Result';
import { ActionResult } from '../helpers/helpers';
import { extractAmount, extractDate } from '../helpers/strings';
import { ApiError, ApiResponse, Session } from './helpers/client';
import { api } from './helpers/setup';
import { stringToDocument } from './helpers/strings';
import {
  extractReactContext,
  getApiData,
  getLoginPayload,
  getReactContext,
  getReactContextWithCookies,
} from './utils/netflix.helpers';
import { NetflixCancelResponse, NetflixResumeResponse, ReactContext, UserContext } from './utils/netflix.types';
import { ActionReturn } from '../helpers/helpers';
import { ERROR_CODES } from '~/shared/errors';
import { getUserId } from '~/shared/ensureDataLoaded';
import { useI18n } from '~/composables/useI18n';

const { t } = useI18n();

const failOnNotLoggedIn = (context: ReactContext) => {
  const isLoggedIn = !!context?.models?.memberContext?.data?.userInfo?.authURL;

  if (isLoggedIn) return Ok(context);

  return Err({
    custom: 'User is not logged in',
    errorMessage: 'User is not logged in',
    message: t('your-session-has-expired-please-reconnect-this-service'),
    statusCode: 401,
    userFriendly: true,
  });
};

const doCancelResumeRequest = <T extends object>(
  client: Session,
  param: string,
  authUrl: string,
  user: string,
): AsyncResult<ApiResponse<T>, ApiError> => {
  return client.fetch<T>({
    method: 'POST',
    params: {
      falcor_server: '0.1.0',
      method: 'call',
      callPath: '["aui","moneyball","next"]',
    },
    url: 'https://www.netflix.com/api/aui/pathEvaluator/web/%5E2.0.0',
    body: {
      authURL: authUrl,
      param,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-netflix.request.routing': '{"path":"/nq/aui/endpoint/%5E1.0.0-web/pathEvaluator","control_tag":"auinqweb"}',
    },
    cookieKeys: ['nfvdid', 'flwssn', 'SecureNetflixId', 'NetflixId'],
    service: 'netflix',
    user,
  });
};

type GetFields<T extends object> = T extends {
  jsonGraph: {
    aui: { moneyball: { next: { value: { result: { fields: infer U } } } } };
  };
}
  ? U
  : never;

type Moneyball<T> = {
  jsonGraph: {
    aui: { moneyball: { next: { value: { result: T; userContext: UserContext } } } };
  };
};
const getMoneyballValue = <T extends object>(json: Moneyball<T>) => {
  return json.jsonGraph.aui.moneyball.next.value;
};

export const cancelOrResume = <T extends Moneyball<{ fields: any }>>(
  endpoint: 'cancel' | 'resume',
  client: Session,
) => {
  const paramToUse =
    endpoint === 'cancel'
      ? '{"flow":"websiteMember","mode":"cancelMembership","action":"cancelMembershipAction","fields":{}}'
      : '{"flow":"websiteMember","mode":"yourAccount","action":"continueMembershipAction","fields":{}}';

  // Maybe to get data from the website
  // const param = {
  //   flow: 'websiteMember',
  //   mode: 'yourAccount',
  //   action: 'yourAccountAction',
  // }
  // callPath: '["moeyball","websiteMember","yourAccount"]',

  return getReactContext(client, getUserId())
    .andThen(failOnNotLoggedIn)
    .map(getApiData)
    .andThen((apiData) => doCancelResumeRequest<T>(client, paramToUse, apiData.authUrl, getUserId()))
    .map((response) => response.data)
    .andThen((data) => ensurCorrectstatus(data, endpoint))
    .map((json): GetFields<T> => getMoneyballValue(json).result.fields);
};

// TODO: instead of blindly typing the response, pass in validator to cancelOrResume to validate the response
// if the response does NOT match the validator, log an error but try to recover

// check if the response let us know that the account might have been inactive
export const cancel = api(({ client }) => {
  return cancelOrResume<NetflixCancelResponse>('cancel', client).andThen(() => connect('connect', 'netflix'));
  // .logData()
  // .map((json) => ({
  //   data: {
  //     status: 'canceled',
  //     expiresAt: extractDate(json.cancelEffectiveDate.value),
  //     lastSyncedAt: new Date().toISOString(),
  //   },
  // }));
});

// const planNameMap = {
//   '4001': 'Basic',
// };

const ensurCorrectstatus = <T extends { fields: { errorCode?: { value: string } } }>(
  context: Moneyball<T>,
  endpoint: 'cancel' | 'resume',
) => {
  const moneyball = getMoneyballValue(context);

  if (moneyball.userContext.status === 'FORMER_MEMBER') {
    const msg =
      endpoint === 'cancel'
        ? t('your-subscription-cant-be-canceled-because-it-is-inactive')
        : t('your-subscription-cant-be-resumed-because-it-is-inactive');
    return Err({
      message: msg,
      custom: msg,
      errorMessage: msg,
      statusCode: 400,
      code: ERROR_CODES.INVALID_MEMBERSHIP_STATUS,
      userFriendly: true,
    } satisfies ApiError);
  }

  if (moneyball.result.fields.errorCode) {
    return Err({
      message: moneyball.result.fields.errorCode.value,
      custom: 'Unknown error',
      errorMessage: 'Unknown error',
      statusCode: 400,
    } satisfies ApiError);
  }

  return Ok(context);
};

export const resume = api(({ client }) => {
  return cancelOrResume<NetflixResumeResponse>('resume', client).map((json) => ({
    data: [
      {
        billingCycle: 'monthly',
        status: 'active',
        planName: json.currentPlan.fields.localizedPlanName.value,
        nextPaymentDate: extractDate(json.periodEndDate?.value, 1)!,
        planPrice: extractAmount(json.currentPlan.fields.planPrice.value)!,
        lastSyncedAt: new Date().toISOString(),
      },
    ],
  }));
});

type LoginResponse = {
  value: {
    moneyball: {
      appleSignUp: {
        login: {
          accountOwnerGuid: string;
          fields: {
            errorCode: {
              value: 'unrecognized_email' | 'incorrect_password';
            };
            moneyballSessionUuid: {
              value: string;
            };
          };
        };
      };
    };
  };
};
export const connect = api(({ auth, client }) => {
  return client
    .fetch({
      method: 'POST',
      url: 'https://tvos.prod.http1.netflix.com/nq/appletv/tvos/~2.8.0/pathEvaluator',
      body: {
        method: 'get',
        original_path: '/tvos/2.8.0/dynecom',
        responseFormat: 'json',
        pathFormat: 'hierarchical',
        progressive: 'false',
        path: '["nrmstart"]',
        esn: 'NFAPPL-04-APPLETV6=2-0B92801A5FFB87159165E9838D9786A8348BF17146A938E12A2E6F3E0B5F5C76',
      },
    })
    .andThen(({ cookies }) => {
      return client.fetch<LoginResponse>({
        method: 'POST',
        url: 'https://tvos.prod.http1.netflix.com/nq/appletv/tvos/~2.8.0/pathEvaluator',
        cookies,
        body: {
          method: 'call',
          original_path: '/tvos/2.8.0/dynecom',
          responseFormat: 'json',
          pathFormat: 'hierarchical',
          progressive: 'false',
          callPath: '["moneyball","appleSignUp","login"]',
          param:
            '{"action":"loginAction","verb":"POST","mode":"login","flow":"appleSignUp","fields":{"email":"' +
            auth.email +
            '","rememberMe":"true","password":"' +
            auth.password +
            '"}}',
        },
      });
    })
    .andThen(({ cookies, data }) => {
      if (!data.value.moneyball.appleSignUp.login.accountOwnerGuid) {
        const errorMsg = data.value.moneyball.appleSignUp.login.fields?.errorCode?.value;
        console.log('Error', errorMsg);

        let message = t('your-session-has-expired-please-reconnect-this-service');
        if (errorMsg === 'unrecognized_email' || errorMsg === 'incorrect_password') {
          message = t('login-failed-please-check-your-credentials');
        }

        return Err({
          custom: data.value.moneyball.appleSignUp.login.fields.errorCode.value,
          errorMessage: 'Login failed',
          message,
          statusCode: 401,
          userFriendly: true,
        });
      } else {
        return Ok({
          cookies,
        });
      }
    })
    .andThen(({ cookies }) => {
      return client
        .fetch<string>({
          url: 'https://www.netflix.com/YourAccount',
          method: 'GET',
          headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
            Host: 'www.netflix.com',
            Referer: 'https://www.netflix.com/browse',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
            Connection: 'keep-alive',
          },
          cookies,
        })
        .map(async ({ data }) => stringToDocument(data))
        .map((document) => ({ cookies, data: extractReactContext(document) }));
    })
    .andThen(({ data, cookies }): Result<ActionReturn, ApiError> => {
      const status = data?.models?.userInfo?.data.membershipStatus;

      if (status === 'ANONYMOUS') {
        return Err({
          custom: 'You are not connected anymore. Please reconnect',
          errorMessage: 'User is not logged in',
          message: t('your-session-has-expired-please-reconnect-this-service'),
          statusCode: 401,
          userFriendly: true,
          code: ERROR_CODES.NOT_LOGGED_IN,
        });
      }

      const periodEndDate = data?.models?.signupContext?.data?.flow?.fields?.periodEndDate?.value;
      const nextBillingDate = data?.models?.signupContext?.data?.flow?.fields?.nextBillingDate?.value;
      const planName = data?.models?.signupContext?.data?.flow?.fields?.currentPlan?.fields?.localizedPlanName?.value;
      const planPrice = data?.models?.signupContext?.data?.flow?.fields?.currentPlan?.fields?.planPrice?.value;

      if (status === 'FORMER_MEMBER') {
        return Ok({
          cookies,
          data: [],
        });
      }

      if (status === 'NEVER_MEMBER') {
        return Ok({
          cookies,
          data: [],
        });
      }

      const flowResult: ActionResult = periodEndDate
        ? {
            status: 'canceled',
            expiresAt: extractDate(periodEndDate),
            planName: planName ?? 'basic',
            billingCycle: 'monthly',
            planPrice: extractAmount(planPrice),
          }
        : {
            status: 'active',
            planName: planName ?? 'basic',
            billingCycle: 'monthly',
            planPrice: extractAmount(planPrice)!,
            nextPaymentDate: extractDate(nextBillingDate)!,
          };

      return Ok({
        cookies,
        data: [flowResult],
      });
    });
});
