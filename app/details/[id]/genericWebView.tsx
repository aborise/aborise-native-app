import CookieManager, { Cookies } from '@react-native-cookies/cookies';
import { Stack, router } from 'expo-router';
import { Cookie } from 'playwright-core';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Toast from 'react-native-root-toast';
import WebView from 'react-native-webview';
import { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { cookiesToString } from '~/automations/api/helpers/cookie';
import { ActionReturn } from '~/automations/helpers/helpers';
import { useI18n } from '~/composables/useI18n';
import { Result } from '~/shared/Result';
import { Awaitable } from '~/shared/typeHelpers';

type SanityResponse = {
  type: 'sanity';
  data: boolean;
};

type ConditionResponse = {
  type: 'condition';
  data: boolean;
};

type ExtractResponse = {
  type: 'extract';
  data: any;
};

export type Response = SanityResponse | ConditionResponse | ExtractResponse;

type GenericWebViewProps = {
  /** The title of the page */
  title: string;
  /** The url to load in the webview */
  url: string;
  /** Check if the page is in the correct state after loading. If not, close.
   * This function has to return a javascript string to inject into the webview
   * which does the sanity checks and does a postMessage with the { type: 'sanity', data: boolean }
   * if the sanity check fails, the webview will be closed
   */
  sanityCheck: () => string;
  /** The url that should be reached for data extraction to happen */
  targetUrl?: string;
  /**
   * The condition that should be met for data extraction to happen
   * This function has to return a javascript string to inject into the webview
   * which checks for the condition and does a postMessage with the { type: 'condition', data: boolean }
   */
  targetCondition?: () => string;
  /** The function that extracts the data from the page.
   * This function has to return a javascript string to inject into the webview
   * which extracts the data and does a postMessage with the { type: 'extract', data: any }
   */
  dataExtractor: () => string;
  /** The function that converts the extracted data into the correct format */
  dataConverter: (data: any) => Awaitable<Result<ActionReturn, any>>;
  /** The function that gets called when the data is extracted */
  onSuccess: (data: Result<ActionReturn, any>, deviceCookies: Cookies) => Awaitable<void>;
  /** Pass a function that returns the cookies that should be set in the webview */
  getCookies: () => Awaitable<Cookie[]>;
  /** Pass a function that returns the username and password that should be set in the webview */
  getAuth?: () => Awaitable<{ email: string; password: string } | null>;
  /** Pass a function that returns the headers that should be set in the webview */
  getHeaders?: () => Awaitable<Record<string, string>>;
  /** Other Code that is injected on every page and serves some functionality (e.g. form autofill) */
  otherCode?: Array<(data: Record<string, unknown>) => string | undefined>;
};

const { t } = useI18n();

export const GenericWebView: React.FC<GenericWebViewProps> = ({
  title,
  url,
  sanityCheck,
  targetUrl,
  targetCondition,
  dataExtractor,
  dataConverter,
  onSuccess,
  getCookies,
  getAuth,
  getHeaders,
  otherCode,
}) => {
  const [webviewUrl, setWebviewUrl] = useState<string>();
  const [webviewCookies, setWebviewCookies] = useState<Cookie[]>([]);
  const [webviewRef, setWebviewRef] = useState<WebView | null>(null);
  const [auth, setAuth] = useState<{ email: string; password: string }>();
  const [sanityCheckDone, setSanityCheckDone] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCookies(), getAuth?.(), CookieManager.clearAll()]).then(([cookies, auth]) => {
      setWebviewCookies(cookies);
      auth && setAuth(auth);
      setWebviewUrl(url);
    });
  }, []);

  const otherCodeString = useMemo(() => {
    return otherCode
      ?.map((code) => code(auth!))
      .filter(Boolean)
      .join('\n');
  }, [auth]);

  // console.log('Other code string', otherCodeString);

  const handleWebViewMessage = async (event: { nativeEvent: { data: string } }) => {
    const response = JSON.parse(event.nativeEvent.data) as Response;

    if (response.type === 'sanity') {
      if (!response.data) {
        console.log('Sanity check failed. Closing webview');

        // For debugging purposes we can disable the sanity check to see what happens
        if (process.env.EXPO_PUBLIC_WEBVIEW_NO_SANITY_CHECK !== 'true') {
          // return router.back();
        }
      }
    }

    if (response.type === 'condition') {
      console.log('Condition check');
      if (!response.data) {
        // Condition is not met yet. Do nothing
        return;
      }

      // Condition is met. Extract data
      console.log('Injecting data extraction');
      return webviewRef!.injectJavaScript(dataExtractor());
    }

    if (response.type === 'extract') {
      console.log('Extracting data');
      Promise.resolve(onSuccess(await dataConverter(response.data), await CookieManager.get(url, true))).then(() => {
        Toast.show(t('successfully-connected'), { duration: Toast.durations.LONG });
        router.push('/');
      });
    }
  };

  const handleWebViewError = (event: { nativeEvent: { description: string } }) => {
    console.log('Error while loading webview', event.nativeEvent.description);
    Toast.show(t('there-was-an-error-loading-the-page-please-try-again'), { duration: Toast.durations.SHORT });
    router.back();
  };

  let timeout: ReturnType<typeof setTimeout>;

  const checkNavigationState = (navState: WebViewNavigation) => {
    // console.log('Clearing timeout');
    console.log('Checking navigation state');
    // console.log(navState);
    clearTimeout(timeout);

    if (navState.url === targetUrl) {
      return webviewRef!.injectJavaScript(dataExtractor());
    }

    if (navState.loading) {
      // sometimes the webview doesnt finish loading
      // in that case we have to fallback and try if our condition is already met
      console.log('Setting timeout');
      timeout = setTimeout(() => {
        if (targetCondition) {
          console.log('Timeout reached. Injecting condition check');
          return webviewRef!.injectJavaScript(targetCondition());
        }
      }, 3000);
      return;
    }

    if (targetCondition) {
      console.log('Injecting condition check');
      webviewRef!.injectJavaScript(targetCondition());
    }

    if (otherCodeString) {
      console.log('Injecting other code');
      setTimeout(() => {
        webviewRef!.injectJavaScript(otherCodeString);
      }, 1000);
    }
  };

  const handleWebViewLoaded = () => {
    if (!sanityCheckDone) {
      setSanityCheckDone(true);
      setLoading(false);
      webviewRef!.injectJavaScript(sanityCheck());
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title,
        }}
      />
      {loading && (
        <View
          style={{
            // @ts-expect-error
            ...StyleSheet.absoluteFill,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      )}
      {webviewUrl && (
        <WebView
          source={{
            uri: webviewUrl,
            headers: {
              Cookie: cookiesToString(webviewCookies),
              ...getHeaders?.(),
            },
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={checkNavigationState}
          onLoadEnd={handleWebViewLoaded}
          style={{ opacity: loading ? 0 : 1 }}
          ref={setWebviewRef}
          webviewDebuggingEnabled={true}
          sharedCookiesEnabled={true}
          onError={handleWebViewError}
        />
      )}
    </>
  );
};

export default GenericWebView;
