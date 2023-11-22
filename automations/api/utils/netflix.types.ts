type InfoToObject<T> = {
  -readonly [K in keyof T]: T[K] extends (json: any) => infer R ? R : never;
};

export const PAGE_ITEMS_API_URL = {
  authUrl: (json: any): string => json.models.userInfo.data.authURL,
  apiEndpointRootUrl: (json: any): string => json.models.serverDefs.data.API_ROOT,
  apiEndpointUrl: (json: any): string => json.models.services.data.memberapi,
  requestId: (json: any): string => json.models.serverDefs.data.requestId,
} as const;

export const PAGE_ITEMS_INFO = {
  name: (json: any): string => json.models.userInfo.data.name,
  guid: (json: any): string => json.models.userInfo.data.guid,
  userGuid: (json: any): string => json.models.userInfo.data.userGuid,
  countryOfSignup: (json: any): string => json.models.userInfo.data.countryOfSignup,
  status: (json: any): string => json.models.userInfo.data.status,
  isTestAccount: (json: any): boolean => json.models.userInfo.data.isTestAccount,
  deviceTypeId: (json: any): number => json.models.userInfo.data.deviceTypeId,
  isAdultVerified: (json: any): boolean => json.models.userInfo.data.isAdultVerified,
  isKids: (json: any): boolean => json.models.userInfo.data.isKids,
  pinEnabled: (json: any): boolean => json.models.userInfo.data.pinEnabled,
  BUILD_IDENTIFIER: (json: any): string => json.models.serverDefs.data.BUILD_IDENTIFIER,
  esn: (json: any): string => json.models.esnGeneratorModel.data.esn,
  isAdsPlan: (json: any): boolean => json.models.truths.data.isAdsPlan,
} as const;

export type UserData = InfoToObject<typeof PAGE_ITEMS_INFO>;
export type ApiData = InfoToObject<typeof PAGE_ITEMS_API_URL>;

export interface Credentials {
  email: string;
  password: string;
}

export interface ReactContext {
  models: {
    memberContext: {
      data: {
        userInfo: {
          authURL: string;
        };
      };
    };
    userInfo: {
      data: {
        authURL: string;
        name: string;
        guid: string;
        userGuid: string;
        countryOfSignup: string;
        currentCountry: string;
        membershipStatus: string;
      };
    };
    serverDefs: {
      data: {
        API_ROOT: string;
        requestId: string;
      };
    };
    services: {
      data: {
        memberapi: string;
      };
    };
    loginContext: {
      data: {
        flow: { fields: { recaptchaSitekey: { value: string } } };
        geo: {
          requestCountry: {
            id: string;
          };
        };
      };
    };
    signupContext: {
      data: {
        flow: {
          fields: {
            currentPlan: {
              fields: {
                localizedPlanName: {
                  value: string;
                };
                planPrice: {
                  value: string;
                };
              };
            };
            periodEndDate: {
              value: string;
            };
            // available if plan is active
            nextBillingDate: {
              value: string;
            };
          };
        };
      };
    };
    countryCodes: {
      data: {
        codes: {
          id: string;
          code: string;
        }[];
      };
    };
  };
}

export interface LoginPayload {
  userLoginId: string | undefined;
  password: string | undefined;
  rememberMe?: string;
  flow: string;
  mode: string;
  action: string;
  withFields: string;
  authURL: string;
  nextPage: string;
  showPassword: string;
  countryCode: string;
  countryIsoCode: string;
  recaptchaResponseTime?: number;
  recaptchaResponseToken: string;
  recaptchaError?: string;
  cancelType: string;
  cancelReason: string;
}

export type NetflixCancelResponse = {
  jsonGraph: {
    aui: {
      moneyball: {
        next: {
          value: {
            result: {
              fields: {
                cancelEffectiveDate: { value: string };
                email: { value: string };
              };
              flow: string;
              flwssn: string;
              mode: string;
            };
            userContext: UserContext;
          };
        };
      };
    };
  };
};

export type UserContext = {
  authURL: string;
  countryOfSignup: string;
  currentCountry: string;
  emailAddress: string;
  guid: string;
  isInFreeTrial: boolean;
  memberSince: string;
  status: 'FORMER_MEMBER' | 'ANONYMOUS' | 'NEVER_MEMBER' | 'CURRENT_MEMBER';
  name: string;
  userGuid: string;
};

export type NetflixResumeResponse = {
  jsonGraph: {
    aui: {
      moneyball: {
        next: {
          value: {
            result: {
              fields: NetflixResumeResponseFields;
              flow: string;
              flwssn: string;
              mode: string;
            };
            userContext: UserContext;
          };
        };
      };
    };
  };
};

type NetflixResumeResponseFields = {
  currentPlan: { fields: CurrentPlanFields };
  memberSince: { value: string };
  paramsMap: ParamsMap;
  paymentMethods: PaymentMethods;
  periodEndDate?: PeriodEndDate;
  nextBillingDate?: PeriodEndDate;
  errorCode?: { value: string };
};

type CurrentPlanFields = {
  localizedPlanName: { value: string };
  maxStreams: { value: string };
  planId: { value: string };
  planPrice: { value: string };
  videoQuality: { value: string };
};

type PeriodEndDate = {
  fieldType: string;
  value: string;
};

type ParamsMap = {
  fieldType: string;
  value: { restartMembership: string };
};

type PaymentMethods = {
  fieldType: string;
  value: ValueElement[];
};

type ValueElement = {
  fieldType: string;
  value: ValueValue;
};

type ValueValue = {
  displayText: PeriodEndDate;
  paymentMethod: PeriodEndDate;
  type: PeriodEndDate;
};
