import { Stack } from 'expo-router/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Layout() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
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
            title: 'Add Subscription',
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
    </QueryClientProvider>
  );
}
