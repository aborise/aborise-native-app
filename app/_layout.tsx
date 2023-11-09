import { Stack as ExpoStack } from 'expo-router/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useI18n } from '~/composables/useI18n';
import { RootSiblingParent } from 'react-native-root-siblings';
import { TamaguiProvider } from 'tamagui';
import config from '~/tamagui.config';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { useAsyncStateReadonly } from '~/composables/useAsyncState';
import { ensureDataLoaded } from '~/shared/ensureDataLoaded';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const queryClient = new QueryClient();
  const { t } = useI18n();
  const { loading } = useAsyncStateReadonly(ensureDataLoaded);
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

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
                  backgroundColor: 'fff',
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
    </View>
  );
}
