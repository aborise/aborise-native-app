import CookieManager, { Cookies } from '@react-native-cookies/cookies';
import { Stack, router } from 'expo-router';
import { Cookie } from 'playwright-core';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Toast from 'react-native-root-toast';
import WebView from 'react-native-webview';
import { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { Unspaced } from 'tamagui';
import { Button } from 'tamagui';
import { Input, TooltipSimple } from 'tamagui';
import { Paragraph } from 'tamagui';
import { Adapt, Dialog, Fieldset, Label, Sheet, SizableText, XStack, YStack } from 'tamagui';
import { cookiesToString } from '~/automations/api/helpers/cookie';
import { ActionReturn } from '~/automations/helpers/helpers';
import { useI18n } from '~/composables/useI18n';
import { AutomationScript, Page, getInitAboriseScript, initAboriseScript } from '~/shared/Page';
import { Result } from '~/shared/Result';
import { Awaitable } from '~/shared/typeHelpers';
import { X } from '@tamagui/lucide-icons';

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
  const [promptOpen, setPromptOpen] = useState(false);
  const [modalComponent, setModalComponent] = useState<React.ReactNode>(null);
  const [promptText, setPromptText] = useState('');
  const [promptTitle, setPromptTitle] = useState('');
  const [promptValue, setPromptValue] = useState<string>('');

  pageRef.current.statusMessage = setStatusText;
  pageRef.current.loadingMessage = setLoadingText;
  pageRef.current._showPrompt = (options) => {
    setPromptText(options.text);
    setPromptTitle(options.title ?? '');
    setPromptValue(options.defaultValue ?? '');
    setPromptOpen(true);
  };
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

      {!visible && (
        <YStack
          style={{
            // @ts-expect-error
            ...StyleSheet.absoluteFill,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {promptOpen ? (
            <YStack width={'100%'} padding="$4" space>
              <SizableText size="$6">{promptTitle}</SizableText>

              <SizableText>{promptText}</SizableText>

              <Fieldset gap="$4" horizontal>
                <Input flex={1} id="name" value={promptValue} onChangeText={setPromptValue} />
              </Fieldset>

              <XStack alignSelf="flex-end" gap="$4">
                <Button
                  theme="alt1"
                  onPress={() => {
                    setPromptOpen(false);
                    pageRef.current._resolvePrompt(null);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  theme="alt1"
                  onPress={() => {
                    setPromptOpen(false);
                    pageRef.current._resolvePrompt(promptValue);
                  }}
                >
                  Ok
                </Button>
              </XStack>
            </YStack>
          ) : (
            <>
              <SizableText>{loadingText}</SizableText>
              <ActivityIndicator size="large" />
            </>
          )}
        </YStack>
      )}
      {/* <Dialog
        modal
        onOpenChange={(open) => {
          setOpen(open);
        }}
        open={promptOpen}
      >
        <Adapt>
          <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
            <Sheet.Frame padding="$4" gap="$4">
              <Adapt.Contents />
            </Sheet.Frame>
            <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
          </Sheet>
        </Adapt>

        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />

          <Dialog.Content
            bordered
            elevate
            key="content"
            animateOnly={['transform', 'opacity']}
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            gap="$4"
          >
            <Dialog.Title>{promptTitle}</Dialog.Title>
            <Dialog.Description>{promptText}</Dialog.Description>

            <Fieldset gap="$4" horizontal>
              <Input flex={1} id="name" value={promptValue} onChangeText={setPromptValue} />
            </Fieldset>

            <XStack alignSelf="flex-end" gap="$4">
              <Dialog.Close displayWhenAdapted asChild>
                <Button theme="alt1" onPress={() => pageRef.current._rejectPrompt()}>
                  Cancel
                </Button>
              </Dialog.Close>

              <Dialog.Close displayWhenAdapted asChild>
                <Button theme="alt1" onPress={() => pageRef.current._resolvePrompt(promptValue)}>
                  Ok
                </Button>
              </Dialog.Close>
            </XStack>

            <Unspaced>
              <Dialog.Close asChild>
                <Button position="absolute" top="$3" right="$3" size="$2" circular icon={X} />
              </Dialog.Close>
            </Unspaced>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog> */}
    </>
  );
};

export default AutomatedWebView;
