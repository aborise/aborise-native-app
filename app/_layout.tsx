import { QueryClient, QueryClientProvider, notifyManager } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack as ExpoStack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import WebView from 'react-native-webview';
import { TamaguiProvider } from 'tamagui';
import { javascript } from '~/automations/webview/webview.helpers';
import { useAsyncStateReadonly } from '~/composables/useAsyncState';
import { useI18n } from '~/composables/useI18n';
import { ensureDataLoaded } from '~/shared/ensureDataLoaded';
import { parse, setParse, ParseResult } from '~/shared/parser';
import config from '~/tamagui.config';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// const DomParser = createContext({
//   parse: (html: string): Document => {
//     throw new Error('not implemented');
//   },
// });
let resolve: (value: ParseResult) => void;

export default function Layout() {
  const { t } = useI18n();
  const { loading } = useAsyncStateReadonly(ensureDataLoaded);
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  const [showWebView, setShowWebView] = useState(false);
  const [JS, setJS] = useState('');
  const [HTML, setHTML] = useState('');

  useEffect(() => {
    setParse((html: string, code: string) => {
      const js = javascript`
        ${code}

        const result =  fn();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'result', result }));
      `;

      setHTML(html);
      setJS(js);
      setShowWebView(true);

      return new Promise<ParseResult>((res) => {
        resolve = res;
      });
    });
  }, []);

  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    const data = JSON.parse(event.nativeEvent.data) as
      | { type: 'result'; result: any }
      | { type: 'error'; data: string };
    setShowWebView(false);
    resolve?.(data);
  }, []);

  // const [domParser] = useState({ parse });

  const onLayoutRootView = useCallback(async () => {
    if (!loading && loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loading, loaded]);

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <RootSiblingParent>
          <TamaguiProvider config={config}>
            <ExpoStack
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#000',
                headerShadowVisible: false,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                contentStyle: {
                  backgroundColor: '#fff',
                },
              }}
            >
              <ExpoStack.Screen
                name="add/index"
                options={{
                  title: t('add-subscription'),
                  // presentation: 'modal',
                }}
              />
              <ExpoStack.Screen
                name="add/[id]"
                options={
                  {
                    // presentation: 'modal',
                  }
                }
              />
            </ExpoStack>
          </TamaguiProvider>
        </RootSiblingParent>
      </QueryClientProvider>
      {showWebView && (
        <WebView
          source={{ html: HTML }}
          injectedJavaScript={JS}
          onMessage={handleMessage}
          style={{
            // display: 'none',
            opacity: 0,
            flex: 0,
            width: 0,
            height: 0,
            // @ts-expect-error
            ...StyleSheet.absoluteFill,
            zIndex: -1,
            position: 'absolute',
          }}
        />
      )}
    </View>
  );
}
