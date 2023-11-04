import { config } from 'dotenv';
import { Stack, router } from 'expo-router';
import { Cookie } from 'playwright-core';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import {
  AndroidWebViewProps,
  IOSWebViewProps,
  WebViewNavigation,
  WindowsWebViewProps,
} from 'react-native-webview/lib/WebViewTypes';
import { cookiesToString } from '~/automations/api/helpers/cookie';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
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
  onSuccess: (data: Result<FlowReturn, any>) => void;
  /** Pass a function that returns the cookies that should be set in the webview */
  getCookies: () => Awaitable<Cookie[]>;
};

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
}) => {
  const [webviewUrl, setWebviewUrl] = useState<string>();
  const [webviewCookies, setWebviewCookies] = useState<Cookie[]>([]);
  const [webviewRef, setWebviewRef] = useState<WebView | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(getCookies()).then((cookies) => {
      setWebviewCookies(cookies);
      setWebviewUrl(url);
    });
  }, []);

  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    const response = JSON.parse(event.nativeEvent.data) as Response;

    console.log(event.nativeEvent.data);

    if (response.type === 'sanity') {
      if (!response.data) {
        console.log('Sanity check failed. Closing webview');
        return router.back();
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
      onSuccess(dataConverter(response.data));
    }
  };

  const checkNavigationState = (navState: WebViewNavigation) => {
    console.log(navState);

    if (navState.loading) return;

    if (navState.url === targetUrl) {
      return webviewRef!.injectJavaScript(dataExtractor());
    }

    if (targetCondition) {
      return webviewRef!.injectJavaScript(targetCondition());
    }
  };

  const handleWebViewLoaded = () => {
    setLoading(false);
    // return webviewRef!.injectJavaScript(sanityCheck());
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
          injectedJavaScript={sanityCheck()}
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
