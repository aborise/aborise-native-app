import { type AxiosProxyConfig } from 'axios';
// import { Reference } from 'firebase-admin/database';
// import fs from "node:fs";
// import { useFirebaseAdmin } from '~/server/useFirebaseAdmin';
import dayjs from 'dayjs';
import { useI18n } from '~/composables/useI18n';
import { useLargeUnsafeStorage } from '~/composables/useStorage';
import { Err, Ok, wrapAsync, type AsyncResult, type Result } from '~/shared/Result';
import { getUserId } from '~/shared/ensureDataLoaded';
import { BillingCycle, type ActionResult } from '../helpers/helpers';
import { Session, type ApiError } from './helpers/client';
import { api } from './helpers/setup';

// type SubscriberStatus = 'Churned'

const { t } = useI18n();

const graphqlEndpoint = 'https://disney.api.edge.bamgrid.com/v1/public/graphql';
const webPage = 'https://www.disneyplus.com/login';
const devicesUrl = 'https://disney.api.edge.bamgrid.com/devices';
const loginUrl = 'https://disney.api.edge.bamgrid.com/idp/login';
const tokenUrl = 'https://disney.api.edge.bamgrid.com/token';
const grantUrl = 'https://disney.api.edge.bamgrid.com/accounts/grant';
const graphqlDeviceEndpoint = 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql';

// https://bam-sdk-configs.bamgrid.com/bam-sdk/v5.0/disney-svod-3d9324fc/browser/v25.0/windows/chrome/prod.json
// https://bam-sdk-configs.bamgrid.com/bam-sdk/v5.0/disney-svod-3d9324fc/browser/v27.0/windows/chrome/prod.json

type ApiArgs = {
  email: string;
  password: string;
  proxies?: AxiosProxyConfig;
  forceLogin?: boolean;
  uid: string;
  useFile?: boolean;
  getApiAuth: () => Promise<TokenData | null>;
  setApiAuth: (data: TokenData) => Promise<void>;
};

type TokenData = {
  token: string;
  refresh: string;
  expirationTime: string;
};

const clientKeyRegex = /window.server_path = ({.*});/;

// const wrapAxios = (axios: AxiosInstance) => {
//   // returns a proxy for axios that will not throw an error when status code is not 2xx
//   return new Proxy(axios, {
//     get(target, prop) {
//       if (
//         prop === 'request' ||
//         prop === 'get' ||
//         prop === 'delete' ||
//         prop === 'head' ||
//         prop === 'options' ||
//         prop === 'post' ||
//         prop === 'put' ||
//         prop === 'patch'
//       ) {
//         return async (...args: any[]) => {
//           try {
//             // @ts-expect-error
//             return await target[prop](...args);
//           } catch (err) {
//             if ((err as AxiosError).response) {
//               return (err as AxiosError).response;
//             } else {
//               throw err;
//             }
//           }
//         };
//       } else {
//         // @ts-expect-error
//         return target[prop];
//       }
//     },
//   });
// };

type Subscription = {
  id: string; // of form "urn:dss:disney:orders:e72544f0-aeae-470d-862e-701a33580430_disney_plus_monthly_de_web_2021_web_04d835d"
  product: {
    id: string; // of form "1000000001354"
    sku: string;
  };
  term: {
    purchaseDate: string;
    startDate: string;
    expiryDate: string;
    nextRenewalDate: string;
    pausedDate: string;
    churnedDate: string;
    isFreeTrial: boolean;
  };
};

export type DisneySubscriptionDetails = {
  giftCardInfo: null;
  scheduledInvoice: EdInvoice;
  latestTransactedInvoice: EdInvoice;
  billingFrequency: 'MONTH' | 'YEAR';
  seasonalRenewal: string;
  hasScheduledInvoice: boolean;
  guid: string;
  productId: string;
  subscription?: Subscription;
};

export type EdInvoice = {
  paymentMethodId: string;
  invoiceRef: string;
  actualExecutionDate: string | null;
  originalExpectedExecutionDate: string;
  subTotalAmount: number;
  totalAmount: number;
  taxAmount: number | null;
  currency: string;
  appliedGiftCreditAmount: null;
  expectedExecutionDate?: string;
  discountAmount?: null;
  unitPrice?: number;
};

export class DisneyAPI {
  deviceId: string | null = null;
  devicePlatform: string | null = null;
  sessionId: string | null = null;
  account: Record<string, unknown> = {};
  session: Session;
  uid: string;
  email: string;
  password: string;
  forceLogin: boolean;
  getApiAuth: () => Promise<TokenData | null>;
  setApiAuth: (data: TokenData) => Promise<void>;

  constructor(options: ApiArgs, client: Session) {
    this.email = options.email;
    this.password = options.password;
    this.forceLogin = options.forceLogin ?? false;
    this.uid = options.uid;
    this.session = client;
    this.getApiAuth = options.getApiAuth;
    this.setApiAuth = options.setApiAuth;
  }

  private getAuthHeader(token: string, headers: Record<string, string> = {}) {
    return {
      headers: { authorization: `Bearer ${token}`, ...headers },
    };
  }

  // This is a normal get request and the only place to get back how much the user is paying
  getSubscriptionDetailsById(subscriptionId: string) {
    const subIdToSku = (subId: string) => {
      const regex = /(urn:dss:disney:orders:[\w-]{37})(.+)/;
      const match = subId.match(regex);

      if (match) {
        const sku = match[2];
        return sku;
      }
    };

    const url = `https://disney.api.edge.bamgrid.com/orders/transactionDetails/orderRef/${subscriptionId}/sku/${subIdToSku(
      subscriptionId,
    )}`;

    return this.getAuthToken()
      .andThen((token) => {
        return this.session.get<DisneySubscriptionDetails>(
          url,
          this.getAuthHeader(token, {
            'x-subscription-id': subscriptionId,
          }),
        );
      })
      .map((res) => res.data);
  }

  getSubscriptionDetails() {
    type Response = {
      data: {
        me: {
          identity: {
            subscriber: {
              subscriptions: Subscription[];
            };
          };
        };
      };
    };

    const graphqlQuery = {
      query: `
        query {
          me {
              identity {
                  ...identity
              }
          }
        }

        fragment identity on Identity {
          subscriber {
            subscriptions {
              id
              product {
                id
                sku
              }
              term {
                purchaseDate
                startDate
                expiryDate
                nextRenewalDate
                pausedDate
                churnedDate
                isFreeTrial
              }
           }
        }
      }`,
      variables: {},
    };

    return this.getAuthToken()
      .andThen((token) => {
        return this.session.post<Response>(graphqlEndpoint, graphqlQuery, this.getAuthHeader(token)).map((res) => {
          return res.data.data.me.identity.subscriber.subscriptions;
        });
      })
      .andThen((details) => {
        if (details.length === 0) {
          const err: ApiError = {
            custom: 'Account is inactive',
            errorMessage: 'Account is inactive',
            message: t('the-action-failed-because-your-subscription-is-inactive'),
            userFriendly: true,
            statusCode: 500,
          };
          return Err(err);
        }
        return Ok(details[0]);
      });
  }

  private _clientApiKey() {
    return this.session
      .get<string>(webPage)
      .map((res) => clientKeyRegex.exec(res.data))
      .andThen((match) => {
        try {
          const janson = JSON.parse(match?.[1] ?? '{}') as {
            sdk: { clientApiKey: string };
          };
          return Ok(janson.sdk.clientApiKey);
        } catch (e) {
          const err: ApiError = {
            custom: 'Failed to parse clientApiKey',
            errorMessage: 'Failed to parse clientApiKey',
            message: 'Failed to parse clientApiKey',
            statusCode: 500,
          };
          return Err(err);
        }
      });
  }

  private _assertion(clientApiKey: string) {
    const postdata = {
      applicationRuntime: 'firefox',
      attributes: {},
      deviceFamily: 'browser',
      deviceProfile: 'macosx',
    };

    const headers = {
      authorization: `Bearer ${clientApiKey}`,
      Origin: 'https://www.disneyplus.com',
    };
    return this.session.post<{ assertion: string }>(devicesUrl, postdata, { headers }).map((res) => res.data.assertion);
  }

  private _accessToken(clientApiKey: string, assertion: string) {
    const headers = {
      authorization: `Bearer ${clientApiKey}`,
      Origin: 'https://www.disneyplus.com',
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const postDate = {
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      latitude: '0',
      longitude: '0',
      platform: 'browser',
      subject_token: assertion,
      subject_token_type: 'urn:bamtech:params:oauth:token-type:device',
    };

    return this.session
      .post<{ access_token: string }>(tokenUrl, postDate, { headers })
      .map((res) => res.data.access_token);
  }

  public getAuthToken() {
    return wrapAsync(async () => {
      if (this.forceLogin) {
        return this._getAuthTokenTruApi();
      }

      try {
        const data = await this.getApiAuth();

        if (!data) {
          console.info('No token found. Executing initial Login...');
          return this._getAuthTokenTruApi();
        }

        const token = data.token;
        const refresh = data.refresh;
        const expirationTimeStr = data.expirationTime;

        // Convert the expiration time string back to a Date object
        const expirationTime = new Date(expirationTimeStr);

        // Check if the token is still valid
        const currentTime = new Date();
        if (currentTime < expirationTime) {
          console.info('Authenticating using saved token');

          return Ok(token);
        } else {
          console.info('Getting token through refresh token');

          const graphMutation = {
            query:
              'mutation refreshToken($input:RefreshTokenInput!){refreshToken(refreshToken:$input){activeSession{sessionId}}}',
            variables: {
              input: {
                refreshToken: refresh,
              },
            },
            operationName: 'refreshToken',
          };

          type RefreshTokenType = {
            extensions: {
              sdk: {
                token: {
                  accessToken: string;
                  refreshToken: string;
                  expiresIn: number;
                };
              };
            };
          };

          const res = await this.session.post<RefreshTokenType>(graphqlDeviceEndpoint, graphMutation, {
            headers: { authorization: await this._clientApiKey() },
          });

          if (res.err) {
            throw res.val;
          }

          const resJson = res.val.data;

          const data = {
            token: resJson.extensions.sdk.token.accessToken,
            refresh: resJson.extensions.sdk.token.refreshToken,
            expirationTime: new Date(
              new Date().getTime() + resJson.extensions.sdk.token.expiresIn * 1000,
            ).toISOString(),
          };

          return Ok(resJson.extensions.sdk.token.accessToken as string);
        }
      } catch (err) {
        console.log('Error using saved token. Executing initial Login...');
        return this._getAuthTokenTruApi();
      }
    });
  }

  // Remaining methods
  private _login(accessToken: string) {
    const headers = {
      accept: 'application/json; charset=utf-8',
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json; charset=UTF-8',
      Origin: 'https://www.disneyplus.com',
      Referer: 'https://www.disneyplus.com/login/password',
      'Sec-Fetch-Mode': 'cors',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
      'x-bamsdk-platform': 'windows',
      'x-bamsdk-version': '3.10',
    };

    const data = { email: this.email, password: this.password };
    return this.session
      .post<{ id_token: string }>(loginUrl, data, { headers })
      .map((res) => res.data.id_token)
      .mapErr((err) => {
        if (err.response?.data?.errors.find((e: any) => e.code === 'idp.error.identity.bad-credentials')) {
          const newError: ApiError = {
            ...err,
            custom: 'Wrong email or password. Please check your credentials and try again.',
            errorMessage: 'Wrong email or password. Please check your credentials and try again.',
            message: t('your-login-credentials-are-wrong-please-check-them-and-try-again'),
            userFriendly: true,
            statusCode: 500,
          };
          return newError;
        }
        return err;
      });
  }

  private _grant(idToken: string, accessToken: string) {
    const headers = {
      accept: 'application/json; charset=utf-8',
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json; charset=UTF-8',
      Origin: 'https://www.disneyplus.com',
      Referer: 'https://www.disneyplus.com/login/password',
      'Sec-Fetch-Mode': 'cors',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
      'x-bamsdk-platform': 'windows',
      'x-bamsdk-version': '3.10',
    };

    const data = { id_token: idToken };
    return this.session.post<{ assertion: string }>(grantUrl, data, { headers }).map((res) => res.data.assertion);
  }

  private _finalToken(subjectToken: string, clientApiKey: string): AsyncResult<[string, number, string], ApiError> {
    const headers = {
      authorization: `Bearer ${clientApiKey}`,
      Origin: 'https://www.disneyplus.com',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const postdata = {
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      latitude: '0',
      longitude: '0',
      platform: 'browser',
      subject_token: subjectToken,
      subject_token_type: 'urn:bamtech:params:oauth:token-type:account',
    };

    return this.session
      .post<{
        access_token: string;
        expires_in: number;
        refresh_token: string;
      }>(tokenUrl, postdata, { headers })
      .map((res) => {
        return [res.data.access_token, res.data.expires_in, res.data.refresh_token] as [string, number, string];
      });
  }

  public _getAuthTokenTruApi() {
    return this._clientApiKey()
      .andThen((clientApiKey) => {
        // console.log("clientApiKey", clientApiKey);
        return this._assertion(clientApiKey).andThen((assertion) => {
          // console.log("assertion", assertion);
          return this._accessToken(clientApiKey, assertion).andThen((accessToken) => {
            // console.log("accessToken", accessToken);
            return this._login(accessToken).andThen((idToken) => {
              // console.log("idToken", idToken);
              return this._grant(idToken, accessToken).andThen((userAssertion) => {
                return this._finalToken(userAssertion, clientApiKey);
              });
            });
          });
        });
      })
      .map(async ([token, expire, refresh]) => {
        // console.log("token", token, expire, refresh);
        const data = {
          token,
          refresh,
          expirationTime: new Date(new Date().getTime() + expire * 1000).toISOString(),
        };

        await this.setApiAuth(data);

        return token;
      });
  }

  // public async cancelSub() {
  //   const token = await this.getAuthToken();

  //   const details = await this.getSubscriptionDetails();

  //   // account is inactive
  //   if (details.length === 0) {
  //     const err: ApiError = {
  //       custom: 'Account is inactive',
  //       errorMessage: 'Account is inactive',
  //       message: 'Account is inactive',
  //       statusCode: 500,
  //     };
  //     return Err(err);
  //   }

  //   const { id: subId, product } = details[0];
  //   const { sku, id: productId } = product;

  //   const subIdToGui = (subId: string) => {
  //     const regex = /(urn:dss:disney:orders:[\w-]+?)(?=_)/;
  //     const match = subId.match(regex);

  //     if (match) {
  //       const urn = match[1];
  //       return urn;
  //     }
  //   };

  //   const result = await this.session.post(
  //     'https://disney.api.edge.bamgrid.com/order/update/cancel',
  //     {
  //       cancellationType: {
  //         description: 'cancel-future-ar',
  //         name: 'cancel-future-ar',
  //         type: 1,
  //       },
  //       guid: subIdToGui(subId),
  //       optionalInfo: 345,
  //       productIds: [productId],
  //       skus: [sku],
  //       subscriptionId: subId,
  //     },
  //     this.getAuthHeader(token),
  //   );

  //   return result.data;
  // }

  public restartSub() {
    return this.getSubscriptionDetails().andThen((subscription) => {
      return this.getAuthToken()
        .andThen((token) => {
          // alternatively post 'https://disney.api.edge.bamgrid.com/v2/order/restart'
          // return this.session.post<{ data: { success: boolean } }>(
          //   'https://disney.api.edge.bamgrid.com/v2/order/restart',
          //   { subscriptionId: subscription.id },
          //   this.getAuthHeader(token),
          // );
          return this.session.put<{ data: { success: boolean } }>(
            'https://disney.api.edge.bamgrid.com/execution/v1/subscription/restart',
            { subscriptionId: subscription.id },
            this.getAuthHeader(token),
          );
        })
        .map(({ data }) => {
          return {
            success: data.data.success,
            subscription,
          };
        });
    });
  }

  // This api is way simpler because it only needs the subscriptionId
  public cancelSub2() {
    return this.getSubscriptionDetails().andThen((subscription) => {
      return this.getAuthToken()
        .andThen((token) => {
          // alternatively post 'https://disney.api.edge.bamgrid.com/v2/order/restart'
          return this.session.put<{ data: { success: boolean } }>(
            'https://disney.api.edge.bamgrid.com/execution/v1/subscription/cancel',
            { subscriptionId: subscription.id },
            this.getAuthHeader(token, {
              Accept: 'application/json; charset=utf-8',
              'Content-Type': 'application/json; charset=utf-8',
            }),
          );
        })
        .map(({ data }) => {
          return {
            success: data.data.success,
            subscription,
          };
        });
    });
  }
}

// type DisneyResponse = {
//   success: boolean;
//   subscriptionId: string;
// };

const ensureSuccess = <T extends { success: boolean }>(result: T, message: string): Result<typeof result, ApiError> => {
  if (result.success) {
    return Ok(result);
  }

  console.log(result);

  const err: ApiError = {
    custom: message,
    errorMessage: message,
    message: message,
    statusCode: 400,
  };

  return Err(err);
};

// const mapToApiData = (api: DisneyAPI, res: DisneyResponse) => {
//   return fromPromise(api.getSubscriptionDetailsById(res.subscriptionId)).map((res): FlowResult => {
//     return {
//       status: 'active',
//       billingCycle: res.billingFrequency === 'MONTH' ? 'monthly' : 'yearly',
//       planName: res.billingFrequency === 'MONTH' ? 'monthly' : 'yearly',
//       nextPaymentDate: res.scheduledInvoice.expectedExecutionDate
//         ? new Date(res.scheduledInvoice.expectedExecutionDate).toISOString()
//         : null,
//       planPrice: numberToDecimal(res.scheduledInvoice.totalAmount),
//       lastSyncedAt: new Date().toISOString(),
//     };
//   });
// };

const wait = (seconds: number) => {
  return <T>(res: T) => new Promise<T>((resolve) => setTimeout(() => resolve(res), seconds * 1000));
};

const mapSubscriptionDetails = (details: DisneySubscriptionDetails): ActionResult => {
  if (!details.scheduledInvoice) {
    return {
      status: 'canceled',
      expiresAt: details.latestTransactedInvoice.actualExecutionDate
        ? dayjs(details.latestTransactedInvoice.actualExecutionDate).add(1, 'month').toISOString()
        : null,
      billingCycle: (details.billingFrequency === 'MONTH' ? 'monthly' : 'annual') as BillingCycle,
      planName: details.billingFrequency === 'MONTH' ? 'monthly' : 'annual',
      planPrice: details.latestTransactedInvoice.totalAmount * 100,
    };
  } else {
    return {
      status: 'active',
      nextPaymentDate: details.scheduledInvoice.originalExpectedExecutionDate,
      billingCycle: (details.billingFrequency === 'MONTH' ? 'monthly' : 'annual') as BillingCycle,
      planName: details.billingFrequency === 'MONTH' ? 'monthly' : 'annual',
      planPrice: Math.floor(details.scheduledInvoice.totalAmount * 100),
    };
  }
};

export const connect = api(({ auth, client }) => {
  const storage = useLargeUnsafeStorage();
  const getApiAuth = () => storage.get<TokenData>('services/disney/api/');
  const setApiAuth = (data: TokenData) => storage.set('services/disney/api/', data);

  const api = new DisneyAPI(
    { email: auth.email, password: auth.password, uid: getUserId(), getApiAuth, setApiAuth },
    client,
  );

  return api
    .getSubscriptionDetails()
    .andThen((subscription) => api.getSubscriptionDetailsById(subscription.id))
    .map(mapSubscriptionDetails)
    .map((res) => ({ data: [res] }));
});

export const cancel = api(({ auth, client }) => {
  const storage = useLargeUnsafeStorage();
  const getApiAuth = () => storage.get<TokenData>('services/disney/api/');
  const setApiAuth = (data: TokenData) => storage.set('services/disney/api/', data);

  const api = new DisneyAPI(
    { email: auth.email, password: auth.password, uid: getUserId(), getApiAuth, setApiAuth },
    client,
  );

  return (
    api
      .cancelSub2()
      .andThen((res) => ensureSuccess(res, 'Could not cancel subscription'))
      .map(wait(3))
      .andThen((res) => api.getSubscriptionDetailsById(res.subscription.id))
      // .logData()
      .map(mapSubscriptionDetails)
      .map((res) => ({ data: [res] }))
  );
});

export const resume = api(({ auth, client }) => {
  const storage = useLargeUnsafeStorage();
  const getApiAuth = () => storage.get<TokenData>('services/disney/api/');
  const setApiAuth = (data: TokenData) => storage.set('services/disney/api/', data);

  const api = new DisneyAPI(
    { email: auth.email, password: auth.password, uid: getUserId(), getApiAuth, setApiAuth },
    client,
  );

  return (
    api
      .restartSub()
      .andThen((res) => ensureSuccess(res, 'Could not resume subscription'))
      .map(wait(3))
      .andThen((res) => api.getSubscriptionDetailsById(res.subscription.id))
      // .logData()
      .map(mapSubscriptionDetails)
      .map((res) => ({ data: [res] }))
  );
});
