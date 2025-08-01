import { AppProvider, UserProvider, useApp } from '@realm/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { useGlobalSearchParams, usePathname } from 'expo-router';
import { Stack as ExpoStack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-get-random-values';
import { RootSiblingParent } from 'react-native-root-siblings';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RNUxcam, { UXCamConfiguration } from 'react-native-ux-cam';
import WebView from 'react-native-webview';
import { OpenRealmBehaviorType, setLogLevel } from 'realm';
import { TamaguiProvider } from 'tamagui';
import { javascript } from '~/automations/webview/webview.helpers';
import Login from '~/components/Login';
import { useAsyncStateReadonly } from '~/composables/useAsyncState';
import { useI18n } from '~/composables/useI18n';
import { OnlineProvider } from '~/composables/useOnline';
import { Service } from '~/realms/Service';
import { Subscription } from '~/realms/Subscription';
import { RealmProvider } from '~/realms/realm';
import '~/realms/realmImpl';
import { ensureDataLoaded, getUserId } from '~/shared/ensureDataLoaded';
import { shouldLog, tagScreen } from '~/shared/helpers';
import { ParseResult, setParse } from '~/shared/parser';
import config from '~/tamagui.config';
import { appId, baseUrl } from '../atlasConfig.json';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

let resolve: (value: ParseResult<any>) => void;

if (shouldLog()) {
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
    RNUxcam.allowShortBreakForAnotherApp(true);
  }

  RNUxcam.startWithConfiguration(configuration);
}

export default function Layout() {
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
    tagScreen(pathname);
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

  // setLogLevel('trace');

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <QueryClientProvider client={queryClient}>
          <RootSiblingParent>
            <TamaguiProvider config={config}>
              <OnlineProvider>
                <AppProvider id={appId} baseUrl={baseUrl}>
                  <UserProvider fallback={Login}>
                    <RealmProvider
                      schema={[Service, Subscription]}
                      deleteRealmIfMigrationNeeded
                      // sync={{
                      //   newRealmFileBehavior: { type: OpenRealmBehaviorType.DownloadBeforeOpen },
                      //   flexible: true,
                      //   initialSubscriptions: {
                      //     update(subs, realm) {
                      //       subs.add(realm.objects(Service));
                      //       // subs.add(realm.objects(Subscription));
                      //     },
                      //   },
                      //   onError: (_session, error) => {
                      //     console.error(error);
                      //   },

                      //   existingRealmFileBehavior: {
                      //     type: OpenRealmBehaviorType.DownloadBeforeOpen,
                      //     // timeOut: 0,
                      //     // timeOutBehavior: OpenRealmTimeOutBehavior.OpenLocalRealm,
                      //   },
                      // }}
                    >
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
                      ></ExpoStack>
                    </RealmProvider>
                  </UserProvider>
                </AppProvider>
              </OnlineProvider>
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
    </SafeAreaProvider>
  );
}
