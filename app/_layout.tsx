import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { useGlobalSearchParams, usePathname } from 'expo-router';
import { Stack as ExpoStack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-get-random-values';
import { RootSiblingParent } from 'react-native-root-siblings';
import RNUxcam, { UXCamConfiguration } from 'react-native-ux-cam';
import WebView from 'react-native-webview';
import { TamaguiProvider } from 'tamagui';
import { javascript } from '~/automations/webview/webview.helpers';
import { useAsyncStateReadonly } from '~/composables/useAsyncState';
import { useI18n } from '~/composables/useI18n';
import '~/realms/realmImpl';
import { ensureDataLoaded, getUserId } from '~/shared/ensureDataLoaded';
import { ParseResult, setParse } from '~/shared/parser';
import config from '~/tamagui.config';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

let resolve: (value: ParseResult<any>) => void;

RNUxcam.optIntoSchematicRecordings(); // Add this line to enable iOS screen recordings
const configuration: UXCamConfiguration = {
  userAppKey: '0jafriiqm6d04rt',
  enableAutomaticScreenNameTagging: false,
  // @ts-expect-error
  enableImprovedScreenCapture: true,
  enableAdvancedGestureRecognition: true,
  enableNetworkLogging: true,
};

if (Platform.OS === 'android') {
  // only supported on android
  RNUxcam.allowShortBreakForAnotherApp(1000 * 60);
} else {
  RNUxcam.allowShortBreakForAnotherApp(false);
}

RNUxcam.startWithConfiguration(configuration);

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

      return new Promise<ParseResult<any>>((res) => {
        resolve = res;
      });
    });
  }, []);

  const pathname = usePathname();
  const params = useGlobalSearchParams();

  // Track the location in your analytics provider here.
  useEffect(() => {
    RNUxcam.tagScreenName(pathname);
  }, [pathname, params]);

  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    const data = JSON.parse(event.nativeEvent.data) as
      | { type: 'result'; result: any }
      | { type: 'error'; data: string };
    setShowWebView(false);
    resolve?.(data);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (!loading && loaded) {
      await SplashScreen.hideAsync();
      RNUxcam.setUserIdentity(getUserId());
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
            zIndex: -1,
            position: 'absolute',
          }}
        />
      )}
    </View>
  );
}
