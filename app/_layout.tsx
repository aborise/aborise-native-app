import { Stack } from 'expo-router/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useI18n } from '~/composables/useI18n';
import { RootSiblingParent } from 'react-native-root-siblings';

export default function Layout() {
  const queryClient = new QueryClient();
  const { t } = useI18n();
  return (
    <QueryClientProvider client={queryClient}>
      <RootSiblingParent>
        <Stack
          screenOptions={{
            // headerStyle: {
            //   backgroundColor: '#0000ff',
            // },
            headerTintColor: '#000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="add/index"
            options={{
              title: t('add-subscription'),
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="add/[id]"
            options={{
              presentation: 'modal',
            }}
          />
        </Stack>
      </RootSiblingParent>
    </QueryClientProvider>
  );
}
