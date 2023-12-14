import CookieManager, { Cookies } from '@react-native-cookies/cookies';
import { Stack, router } from 'expo-router';
import { Cookie } from 'playwright-core';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Toast from 'react-native-root-toast';
import WebView from 'react-native-webview';
import { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { SizableText, XStack, YStack } from 'tamagui';
import { cookiesToString } from '~/automations/api/helpers/cookie';
import { ActionReturn } from '~/automations/helpers/helpers';
import { useI18n } from '~/composables/useI18n';
import { AutomationScript, Page, getInitAboriseScript, initAboriseScript } from '~/shared/Page';
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

type TagResponse = {
  type: 'tag';
  data: string;
};

export type Response = SanityResponse | ConditionResponse | ExtractResponse | TagResponse;

type AutomatedWebViewProps = {
  /** The title of the page */
  title: string;
  statusBar?: () => React.JSX.Element;
  /** The url to load in the webview */
  url: string;
  /** The function that gets called when the data is extracted */
  onSuccess: (data: Result<ActionReturn, any>, deviceCookies: Cookies) => Awaitable<void>;
  /** Pass a function that returns the cookies that should be set in the webview */
  getCookies: () => Awaitable<Cookie[]>;
  /** Pass a function that returns the headers that should be set in the webview */
  getHeaders?: () => Awaitable<Record<string, string>>;
  script: AutomationScript;
};

const { t } = useI18n();

export const AutomatedWebView: React.FC<AutomatedWebViewProps> = ({
  title,
  statusBar: StatusBar,
  url,
  onSuccess,
  getCookies,
  getHeaders,
  script,
}) => {
  const [webviewUrl, setWebviewUrl] = useState<string>();
  const [webviewCookies, setWebviewCookies] = useState<Cookie[]>([]);
  const webviewRef = useRef<WebView>(null);
  const pageRef = useRef(new Page(webviewRef, script, onSuccess));
  const [loadingText, setLoadingText] = useState<string>();
  const [statusText, setStatusText] = useState<string>(
    "We're trying to log you in automatically. If this takes longer than expected, please continue the login process manually.",
  );

  pageRef.current.statusMessage = setStatusText;
  pageRef.current.loadingMessage = setLoadingText;
  pageRef.current.close = (route = '/') => {
    router.push(route);
  };

  const [visible, setVisible] = useState(false);

  pageRef.current._showWebView = () => {
    setVisible(true);
  };

  pageRef.current._hideWebView = () => {
    setVisible(false);
  };

  useEffect(() => {
    Promise.all([getCookies(), CookieManager.clearAll()]).then(([cookies]) => {
      setWebviewCookies(cookies);
      setWebviewUrl(url);
    });
  }, []);

  const onMessage = (event: WebViewMessageEvent) => {
    pageRef.current._onMessage(event);
  };

  const handleWebViewError = (event: { nativeEvent: { description: string } }) => {
    console.log('Error while loading webview', event.nativeEvent.description);
    Toast.show(t('there-was-an-error-loading-the-page-please-try-again'), { duration: Toast.durations.SHORT });
    router.back();
  };

  const onNavigationStateChange = (navState: WebViewNavigation) => {
    pageRef.current._onNavigationStateChange(navState);
  };

  const onLoadEnd = () => {};

  return (
    <>
      <Stack.Screen
        options={{
          title,
        }}
      />
      {!visible && (
        <YStack
          style={{
            // @ts-expect-error
            ...StyleSheet.absoluteFill,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SizableText>{loadingText}</SizableText>
          <ActivityIndicator size="large" />
        </YStack>
      )}
      {webviewUrl && (
        <YStack flex={1} position="relative">
          {!!statusText && (
            <XStack padding="$2" backgroundColor={'$yellow5'}>
              <SizableText size="$4" fontWeight={'bold'}>
                {statusText}
              </SizableText>
            </XStack>
          )}
          <WebView
            source={{
              uri: webviewUrl,
              headers: {
                Cookie: cookiesToString(webviewCookies),
                ...getHeaders?.(),
              },
            }}
            injectedJavaScriptBeforeContentLoadedForMainFrameOnly
            injectedJavaScriptBeforeContentLoaded={getInitAboriseScript()}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={onMessage}
            onNavigationStateChange={onNavigationStateChange}
            onLoadEnd={onLoadEnd}
            style={{ opacity: !visible ? 0.5 : 1, flex: 1 }}
            ref={webviewRef}
            webviewDebuggingEnabled={true}
            sharedCookiesEnabled={true}
            onError={handleWebViewError}
          />
        </YStack>
      )}
    </>
  );
};

export default AutomatedWebView;
