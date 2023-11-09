// import console from 'console';
import { Err, Ok } from '~/shared/Result';
import { solveCaptcha } from './helpers/captcha';
import { ApiError, ApiResponse, AsyncAboFetchResult, Session } from './helpers/client';
import { api } from './helpers/setup';
import { getJsonFromHtmlResponse } from './helpers/strings';
import { toFormData } from 'axios';

// TODO: test me later

const getAuthToken = (client: Session, userId: string): AsyncAboFetchResult<string> => {
  console.info('Getting auth token');
  return client
    .fetch<string>({
      method: 'GET',
      url: 'https://www.paramountplus.com/account/',
      cookieKeys: ['CBS_COM'],
      service: 'paramount',
      user: userId,
    })
    .andThen(({ data, cookies }) =>
      getJsonFromHtmlResponse<{ authToken: string }>(data, '#php-to-js-var').map((json) => {
        console.info('Authtoken:', json.authToken);
        return {
          data: json.authToken,
          cookies,
        };
      }),
    );
};

const getAuthTokenAndCaptchaKeyForLogin = (client: Session) => {
  return client
    .fetch<string>({
      method: 'GET',
      url: 'https://www.paramountplus.com/de/account/signin/',
    })
    .andThen(({ data, cookies }) =>
      getJsonFromHtmlResponse<{
        tk_trp: string;
        recaptcha: { recaptchaPublicKey: string };
      }>(data, '#app-config').map((json) => {
        // console.log(JSON.stringify(json, null, 2));
        console.info('Authtoken:', json.tk_trp);
        console.info('Captcha key:', json.recaptcha.recaptchaPublicKey);
        return {
          data: {
            authToken: json.tk_trp,
            captchaKey: json.recaptcha.recaptchaPublicKey,
          },
          cookies,
        };
      }),
    );
};

const doResumeSubscription = (client: Session, authToken: string, userId: string) => {
  return client.fetch<{ success: boolean }>({
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    url: 'https://www.paramountplus.com/account/xhr/resume-subscription/',
    body: {
      tk_trp: authToken,
    },
    service: 'paramount',
    user: userId,
    cookieKeys: ['CBS_COM'],
  });
};

const failOnError = <T extends { success: boolean }>(response: ApiResponse<T>, message: string) => {
  if (response.data.success) {
    return Ok(response);
  }

  return Err({
    custom: message,
    errorMessage: message,
    message: 'Bad Request',
    statusCode: 400,
  });
};

type CancelResponse = {
  result: {
    authToken: string;
    survey: {
      surveyId: string;
    };
  };
  success: boolean;
};

const getCancelInfo = (client: Session, userId: string): AsyncAboFetchResult<{ id: string; authToken: string }> => {
  console.info('Getting cancel info');
  return client
    .fetch<CancelResponse>({
      method: 'GET',
      url: 'https://www.paramountplus.com/account/xhr/cancel/',
      service: 'paramount',
      user: userId,
      cookieKeys: ['CBS_COM'],
    })
    .andThen((response) => failOnError(response, 'Failed to get cancel info'))
    .map(({ data, cookies }) => {
      console.info('Cancel info: ', data.result.survey.surveyId, data.result.authToken);
      return {
        data: {
          id: data.result.survey.surveyId,
          authToken: data.result.authToken,
        },
        cookies,
      };
    });
};

const doCancelConfirm = (client: Session, authToken: string, userId: string) => {
  return client.fetch<{ success: boolean }>({
    method: 'POST',
    url: 'https://www.paramountplus.com/account/xhr/cancel/confirm/',
    body: toFormData({
      tk_trp: authToken,
      id: null,
      reasonId: null,
      reasonStr: '1',
    }),
    service: 'paramount',
    user: userId,
    cookieKeys: ['CBS_COM'],
  });
};

export const cancel = api(({ item, client }) => {
  return getCancelInfo(client, item.user)
    .andThen(({ data }) => doCancelConfirm(client, data.authToken, item.user))
    .andThen((response) => failOnError(response, 'Failed to cancel subscription'))
    .map((result) => ({ debug: result }));
});

export const resume = api(({ item, client }) => {
  return getAuthToken(client, item.user)
    .andThen(({ data }) => doResumeSubscription(client, data, item.user))
    .andThen((response) => failOnError(response, 'Failed to resume subscription'))
    .map((result) => ({ debug: result }));
});

export const connect = api(({ client, auth, item }) => {
  return (
    getAuthToken(client, item.user)
      // .andThen(({ data, cookies }) => {
      //   return solveCaptcha({
      //     siteKey: data.captchaKey,
      //     url: 'https://www.paramountplus.com/de/account/signin/',
      //     action: 'FORM_SIGN_IN',
      //   })
      //     .map((recaptchaToken) => ({
      //       recaptchaToken,
      //       cookies,
      //       authToken: data.authToken,
      //     }))
      //     .mapErr((e) => {
      //       return {
      //         errorMessage: e.message,
      //         message: 'Failed to solve captcha',
      //         statusCode: 400,
      //         custom: 'Failed to solve captcha',
      //       };
      //     });
      // })
      // .andThen(({ recaptchaToken, authToken, cookies }) => {
      //   console.info('logging in');
      //   return client.fetch<{ isExSubscriber: boolean; isSubscriber: boolean }>({
      //     method: 'POST',
      //     cookies,
      //     headers: {
      //       'Content-Type': 'multipart/form-data',
      //       'X-Requested-With': 'XMLHttpRequest',
      //     },
      //     url: 'https://www.paramountplus.com/de/account/xhr/login/',
      //     body: toFormData({
      //       tk_trp: authToken,
      //       email: auth.email,
      //       password: auth.password,
      //       recaptchaToken: recaptchaToken,
      //     }),
      //   });
      // })
      .andThen(({ data, cookies }) => {
        return client.fetch({
          url: 'https://www.intl.paramountplus.com/apps-api/v2.0/appletvtvos/auth/login.json',
          params: {
            at: data,
          },
          method: 'POST',
          body: {
            j_password: auth.password,
            j_username: auth.email,
          },
        });
      })
      .logData()
      .andThen((response) => {
        return Err({
          custom: 'Not implemented',
          errorMessage: 'Not implemented',
          message: 'Not implemented',
          statusCode: 400,
          code: 'not_implemented',
        } satisfies ApiError);
      })
    // .map((response) => {
    //   console.log(response.data);
    //   if (response.data.isExSubscriber) {
    //     return {
    //       data: {
    //         membershipStatus: 'inactive',
    //         lastSyncedAt: new Date().toISOString(),
    //       },
    //       cookies: response.cookies,
    //     };
    //   } else {
    //     return {
    //       data: {
    //         membershipStatus: 'active',
    //         lastSyncedAt: new Date().toISOString(),
    //         billingCycle: 'monthly',
    //         membershipPlan: null,
    //         nextPaymentDate: null,
    //         nextPaymentPrice: null,
    //       },
    //       cookies: response.cookies,
    //     };
    //   }
    // })
  );
});

// response when no subscription is active
// {
// 	"displayName": "Leonhard K",
// 	"success": true,
// 	"userId": 228747240,
// 	"recaptchaTokenValidated": true,
// 	"user": {
// 		"entitlement": {
// 			"addOns": [],
// 			"adFree": false,
// 			"multiPackageTracking": "",
// 			"packageCode": "",
// 			"packageId": null,
// 			"packageSource": "",
// 			"productName": "",
// 			"vendorCode": ""
// 		},
// 		"regID": 228747240,
// 		"displayName": "Leonhard K",
// 		"profile": {
// 			"first_name": "Leonhard",
// 			"last_name": "Kühne-Hellmessen",
// 			"email": "leonhard@k-h.me",
// 			"connections": {
// 				"facebook": false,
// 				"twitter": false,
// 				"google": false
// 			},
// 			"optIn": false,
// 			"profile_type": "ADULT"
// 		},
// 		"svod": {
// 			"packages": [
// 				{
// 					"product_code": null,
// 					"product_name": null,
// 					"product_tier": 0,
// 					"code": "NEW_FREE_PACKAGE",
// 					"status": "ACTIVE",
// 					"source": "cbscomp",
// 					"holding_state": "OK",
// 					"user_can_edit": true,
// 					"supported_vendor": false,
// 					"on_trial": false,
// 					"plan_type": null,
// 					"plan_tier": null,
// 					"addOns": [],
// 					"vendor_code": null,
// 					"no_trial": false,
// 					"mobile_only": false,
// 					"subscription_country": null
// 				}
// 			],
// 			"status": "EX_SUBSCRIBER",
// 			"recurly_package": null,
// 			"user_package": {
// 				"product_code": null,
// 				"product_name": null,
// 				"product_tier": 0,
// 				"code": "NEW_FREE_PACKAGE",
// 				"status": "ACTIVE",
// 				"source": "cbscomp",
// 				"holding_state": "OK",
// 				"user_can_edit": true,
// 				"supported_vendor": false,
// 				"on_trial": false,
// 				"plan_type": null,
// 				"plan_tier": null,
// 				"addOns": [],
// 				"vendor_code": null,
// 				"no_trial": false,
// 				"mobile_only": false,
// 				"subscription_country": null
// 			},
// 			"package_status": "esb|14",
// 			"package_source": "cbscomp",
// 			"package_status_raw": "ACTIVE",
// 			"package_code": "NEW_FREE_PACKAGE",
// 			"bundle_status": "",
// 			"issues": [],
// 			"multi_package_tracking": "cbscomp:null"
// 		},
// 		"isLoggedIn": true,
// 		"statusCode": "exsub",
// 		"isCompUser": false,
// 		"isRegistered": false,
// 		"isSubscriber": false,
// 		"isExSubscriber": true,
// 		"isSuspended": false,
// 		"isGhost": false,
// 		"isThirdParty": false,
// 		"isMVPDAuthZ": false,
// 		"isMVPDAuthZExSub": false,
// 		"isActive": true,
// 		"isReseller": false,
// 		"isPartnerSubscription": false,
// 		"isRecurly": false,
// 		"isOptimum": false,
// 		"isLC": false,
// 		"isCF": false,
// 		"isUnsupportedVendor": false,
// 		"isMonthlyPlan": false,
// 		"isAnnualPlan": false,
// 		"canEdit": true,
// 		"provideNativeDeviceSubSettingsLink": false,
// 		"edu": {
// 			"profile": null,
// 			"coupon": null
// 		},
// 		"isMVPD": false,
// 		"userRegistrationCountry": "DE",
// 		"isUserRegionOnSunset": false,
// 		"tags": {
// 			"bundleStatus": "",
// 			"packageSource": "cbscomp",
// 			"packageStatus": "ACTIVE",
// 			"multiPackageTracking": "cbscomp:null",
// 			"userStatus": "esb|14",
// 			"userType": "EX_SUBSCRIBER",
// 			"vendorCode": "",
// 			"userId": 228747240,
// 			"userRegId": 228747240,
// 			"referenceProfileId": 0,
// 			"userProfileCategory": "ADULT",
// 			"userProfileId": 257172065,
// 			"userProfileMaster": "true",
// 			"userProfilePic": "default",
// 			"userProfilePicPath": "https://wwwimage-intl.pplusstatic.com/thumbnails/photos/w200-q80/profile/GIANT_CYCLOPS_0.png"
// 		},
// 		"mvpdDispute": {
// 			"isDmaInDispute": false,
// 			"mvpdProvider": ""
// 		}
// 	},
// 	"variant": [],
// 	"plans": [
// 		{
// 			"id": 331,
// 			"addOnCodes": [],
// 			"trial": false,
// 			"trialInterval": null,
// 			"trialUnit": null,
// 			"trialString": "",
// 			"localizedPlanTitle": "Paramount+ Standard monatlich",
// 			"planTitle": "Paramount+ monthly - Germany - No Trial",
// 			"titleForTracking": "Paramount+ monthly - Germany - No Trial",
// 			"planType": "monthly",
// 			"planTier": "standard",
// 			"allowedMigration": true,
// 			"price": "$7.99/Monat",
// 			"currency": "EUR",
// 			"currencySymbol": "€",
// 			"currency_subunits": 100,
// 			"region": "GSA",
// 			"rawPrice": "7.99",
// 			"purchaseOfferPeriod": "1-month-trial",
// 			"priceUnit": "Monat",
// 			"tier": 2,
// 			"package_code": "CBS_ALL_ACCESS_AD_FREE_PACKAGE",
// 			"code": "aWt1VXNhODhva0h2RUIvMlk4K25BUTB6RGFRRzdUSEdjWVRjZzlEMEJoSm1DWXhGWnRkSVZQVmRvZnk4NUsxVUZWV3k2SStaMWg0a3lqS2hzaEhNYjdIZGoxckJSNmlPWFdCTy91RGlPZ0ZtV0ZuU2JQdmpMS2JEZDBrYTNqYm8=",
// 			"recurlyCode": "pplus_intl_de_monthly_no_trial",
// 			"trialEndDate": "12/31/1969"
// 		}
// 	],
// 	"message": ""
// }
