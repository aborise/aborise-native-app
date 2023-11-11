import CookieManager from '@react-native-cookies/cookies';
import { Stack, router } from 'expo-router';
import { Cookie } from 'playwright-core';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Toast from 'react-native-root-toast';
import WebView from 'react-native-webview';
import { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { cookiesToString } from '~/automations/api/helpers/cookie';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
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
  dataConverter: (data: any) => Result<FlowReturn, any>;
  /** The function that gets called when the data is extracted */
  onSuccess: (data: Result<FlowReturn, any>) => Awaitable<void>;
  /** Pass a function that returns the cookies that should be set in the webview */
  getCookies: () => Awaitable<Cookie[]>;
  /** Pass a function that returns the username and password that should be set in the webview */
  getAuth?: () => Awaitable<{ email: string; password: string } | null>;
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

  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    const response = JSON.parse(event.nativeEvent.data) as Response;

    console.log(event.nativeEvent.data);

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
      if (!response.data) {
        // Condition is not met yet. Do nothing
        return;
      }

      // Condition is met. Extract data
      return webviewRef!.injectJavaScript(dataExtractor());
    }

    if (response.type === 'extract') {
      Promise.resolve(onSuccess(dataConverter(response.data))).then(() => {
        Toast.show(t('successfully-connected'), { duration: Toast.durations.LONG });
        router.push('/');
      });
    }
  };

  let timeout: ReturnType<typeof setTimeout>;

  const checkNavigationState = (navState: WebViewNavigation) => {
    console.log('Clearing timeout');
    console.log(navState);
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
          return webviewRef!.injectJavaScript(targetCondition());
        }
      }, 3000);
      return;
    }

    if (targetCondition) {
      return webviewRef!.injectJavaScript(targetCondition());
    }
  };

  const handleWebViewLoaded = () => {
    if (!sanityCheckDone) {
      setSanityCheckDone(true);
      setLoading(false);
      // FIXME: This method is called on every navigation change event (why...?)
      webviewRef!.injectJavaScript(sanityCheck());
    }

    if (otherCodeString) {
      webviewRef!.injectJavaScript(otherCodeString);
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
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    margin: 16,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    // backgroundColor: '#f0f0f0',
    // borderRadius: 4,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
  },
  firstColumn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  syncBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4e4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  syncText: {
    fontSize: 12,
  },
  lastSyncDateText: {
    fontSize: 12,
    marginTop: 8,
  },
  secondColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  thirdColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-evenly',
  },
  statusBox: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFF',
  },
  priceText: {
    fontSize: 16,
    marginTop: 16,
    paddingTop: 4,
  },
  decimalText: {
    fontSize: 12,
    lineHeight: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  btnCancel: {
    backgroundColor: '#f44336',
    color: '#FFF',
  },
  btnResume: {
    backgroundColor: '#4caf50',
    color: '#FFF',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexItemsCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textLg: {
    fontSize: 18,
  },
  textBase: {
    fontSize: 16,
  },
  ml4: {
    marginLeft: 16,
  },
  mb2: {
    marginBottom: 8,
  },
});

export default GenericWebView;
