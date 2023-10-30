// import console from "console";
import { Cookie } from 'playwright-core';
import { AsyncResult, Err, fromPromise } from '~/shared/Result';
import { ApiError, AsyncAboFetchResult, Session } from './helpers/client';
import { getCookies, mergeCookies } from './helpers/cookie';
import { api } from './helpers/setup';
import { getJsonFromHtmlResponse, stringToDocument } from './helpers/strings';
import { solveCaptcha } from './helpers/captcha';

const doGetCancelPage = (client: Session, cookies: Cookie[]) => {
  return client
    .fetch<string>({
      method: 'GET',
      cookies,
      url: 'https://www.spotify.com/de/account/cancel/',
    })
    .map((response) => {
      return {
        data: response.data,
        cookies: mergeCookies(response.cookies, cookies),
      };
    });
};

const getSpotifyCsrfToken = (client: Session, userId: string): AsyncAboFetchResult<string> => {
  console.info('Getting Spotify CSRF Token');
  return fromPromise(getCookies('spotify', ['sp_dc']))
    .andThen((cookies) => doGetCancelPage(client, cookies))
    .andThen(({ data, cookies }) =>
      getJsonFromHtmlResponse<{ props: { csrfToken: string } }>(data, '#__NEXT_DATA__').map((json) => {
        console.info('CSRF Token: ', json.props.csrfToken);

        return {
          data: json.props.csrfToken,
          cookies,
        };
      }),
    );
};

const doCancelConfirm = (client: Session, csrfToken: string, cookies: Cookie[]): AsyncAboFetchResult<string> => {
  return client.fetch({
    method: 'POST',
    headers: {
      // 'Content-Type': 'application/json',
      // TODO: try without those extra headers
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
      'Alt-Used': 'www.spotify.com',
      Host: 'www.spotify.com',
      Origin: 'https://www.spotify.com',
      Referer: 'https://www.spotify.com/de/account/cancel/',
      'X-CSRF-Token': csrfToken,
    },
    cookies,
    url: 'https://www.spotify.com/de/api/account/v1/cancel/confirm',
  });
};

const doResumeConfirm = (
  client: Session,
  csrfToken: string,
  cookies: Cookie[],
): AsyncAboFetchResult<{ success: boolean }> => {
  return client.fetch<{ success: boolean }>({
    method: 'POST',
    headers: {
      // 'Content-Type': 'application/json',
      // TODO: try without those extra headers
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
      'Alt-Used': 'www.spotify.com',
      Host: 'www.spotify.com',
      Origin: 'https://www.spotify.com',
      Referer: 'https://www.spotify.com/de/account/resubscription/',
      'X-CSRF-Token': csrfToken,
    },
    cookies,
    url: 'https://www.spotify.com/de/api/account/v1/resubscription/confirm',
  });
};

// TODO: test failure case (e.g. wrong crp token)
export const cancel = api(({ item, client }) => {
  return getSpotifyCsrfToken(client, item.user)
    .andThen(({ data, cookies }) => doCancelConfirm(client, data, cookies))
    .map((result) => ({ debug: result }));
});

export const resume = api(({ item, client }) => {
  return getSpotifyCsrfToken(client, item.user)
    .andThen(({ data, cookies }) => doResumeConfirm(client, data, cookies)) // result.data = { success: true }
    .map((result) => ({ debug: result }));
});

// export const connect = api(({ auth, client, item }) => {
//   return getSpotifyCsrfToken(client, item.user, 'https://accounts.spotify.com/de/login')
//     .andThen({data, cookies} => )
// })

type CaptchaData = {
  FB_APP_ID: string;
  APPLE_APP_ID: string;
  RECAPTCHA_KEY: string;
  GOOGLE_ANALYTICS_ID: string;
  TINDER_ADJUST_TRACKER_ID: string;
  ONE_TRUST_DOMAIN_SCRIPT_ID: string;
  AUTH_CALLBACK: string;
};

const extractCaptchaValues = (str: string) => {
  const regex = /(\w+):Hp\?"[^"]+":\"([^"]+)"/g;
  let match;
  const result = {} as Record<string, string>;

  while ((match = regex.exec(str)) !== null) {
    result[match[1]] = match[2];
  }

  return result as CaptchaData;
};

export const connectNotWorking = api(({ client, auth }) => {
  return client
    .fetch<string>({
      url: 'https://www.spotify.com/de/login',
      method: 'GET',
    })
    .map(async (response) => {
      return {
        document: await stringToDocument(response.data),
        cookies: response.cookies,
        response,
      };
    })
    .map(({ document, cookies, response }) => {
      const data = JSON.parse(
        document.getElementById('bootstrap-data')?.getAttribute('sp-bootstrap-data') ?? 'null',
      ) as { flowCtx: string };
      const src = document.querySelector('script[sp-bootstrap]')?.getAttribute('src');

      client.log({
        cookies,
        data: {
          flowCtx: data.flowCtx,
          src,
        },
        request: response.request,
      });

      return {
        flowCtx: data.flowCtx,
        src,
        cookies,
      };
    })
    .andThen(({ src, cookies, flowCtx }) => {
      if (!src)
        return Err({
          custom: 'Could not find react script',
          errorMessage: 'Could not find react script',
          message: 'Could not find react script',
          statusCode: 500,
        });

      return client
        .fetch<string>({
          url: src,
          method: 'GET',
          cookies,
        })
        .map((response) => ({ ...response, cookies, flowCtx }));
    })
    .map(({ data, cookies, flowCtx }) => {
      const captchaValues = extractCaptchaValues(data);
      console.log('siteKey', captchaValues.RECAPTCHA_KEY);
      console.log('flowCtx', flowCtx);
      return { siteKey: captchaValues.RECAPTCHA_KEY, cookies, flowCtx };
    })
    .andThen(({ siteKey, cookies, flowCtx }) => {
      const csrf = cookies.find((cookie) => cookie.name === 'sp_sso_csrf_token')?.value;

      console.log('csrf', csrf);

      // solveCaptcha(url, siteKey)

      return solveCaptcha({
        siteKey,
        url: 'https://accounts.spotify.com/de/login',
        action: 'login',
      })
        .mapErr((err) => {
          return {
            custom: 'Captcha could not be solved',
            errorMessage: 'Captcha could not be solved',
            message: 'Captcha could not be solved',
            statusCode: 500,
          } satisfies ApiError;
        })
        .andThen((response) => {
          console.log('captcha response', response);

          const rememberCookie: Cookie = {
            name: 'remember',
            value: auth.email,
            domain: 'accounts.spotify.com',
            path: '/',
            expires: -1,
            httpOnly: false,
            secure: false,
            sameSite: 'None',
          };

          return client.fetch({
            url: 'https://accounts.spotify.com/login/password',
            method: 'POST',
            cookies: [rememberCookie, ...cookies],
            headers: {
              'X-CSRF-Token': csrf,
              'content-type': 'application/x-www-form-urlencoded',
              authority: 'accounts.spotify.com',
              'Alt-Used': 'accounts.spotify.com',
              // Authorization:
              //   'Bearer BQDqeJjIMxcXn6P7ALKm8LizWL11HMv9_-pfNNKepzl-4hhV_sBRAbC5KtXMsISQB88F0gVnsQUfLHyZbjgNTxqhmJ6Ig-QELAFKYjbOnNcll7ljS3svsi-xSpWoZ2W_-DRhmurmBx7_9f4yjCdJzUp0DrEXmqNWbu58LsKEUUcGEA0fugvbD-Q51jfyUZL6lqq5ad_h3G62_K7JBvsN5ivgw9tg6QTxeQAb4-kp8xzTlFbmmwaCdqA4yosJPNRjnjfCG8M8ga12SJLyAjbVTNyofzNnUV89DhAHkRjMOeE1PgA8hwnZYtgrAlosilwbrnQ_GaXfY7LZjzaliVQzjRV6MK8',
              // 'client-token':
              //   'AACqRKCv8VVMFoHIz6aeiAzxXE5n1HunCrMxEJaoQY6eM2Ws9QLBjqjyW1qGmdpnTOXOFqwbWXg7QXUzwqBj71OcluOmIo/lNe5bib4B5+oJl58Sg5+/9e2tNKJyVKK12PrSbBnRFbU0qUh1i6nBTDBmx4r4zGlTAUHSdRwDP+V+KeQfA0tQ2obs8h0fMHvMYN1oLDTQSvccXoA/KrG063ubZMxHxfxFqdVaPPO8MMHWjQWzTrHSXteeZDpeS8OiAgWUvPvDNXrWROljmd48yfNyMnzVIBAKflS/5c/anyVvoh3HgFzqU4NG0tVp3t6brHth8OEH59QJYgT75yD4I/WjJSUOHThY+0hhlNSe',
              accept: 'application/json',
              referer: 'https://accounts.spotify.com/de/login',
              origin: 'https://accounts.spotify.com',
              'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'same-origin',
              'sec-ch-ua': 'Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"Windows"',
            },
            body: {
              recaptchaToken: response,
              remember: true,
              username: auth.email,
              password: auth.password,
              continue: 'https://accounts.spotify.com/de/status',
              flowCtx,
            },
          });
        });
    })
    .andThen((response) => {
      console.log(response);

      return Err({
        custom: 'Debugging',
        errorMessage: 'Debugging',
        message: 'Debugging',
        statusCode: 500,
        debug: response,
      });
    });
});

export const connect = api(() => {
  return AsyncResult.err({
    errorMessage: 'Not implemented yet',
    message: 'Not implemented yet',
    custom: 'Not implemented yet',
    statusCode: 500,
  });
});
