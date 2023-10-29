import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Template } from '~/components/Template';
import { useAsyncStateReadonly } from '~/composables/useAsyncState';
import { ensureDataLoaded } from '~/shared/ensureDataLoaded';
import App from './app';

const AppLoader = () => {
  const { loading, error } = useAsyncStateReadonly(ensureDataLoaded);

  return (
    <>
      <Template vif={loading}>
        <View>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      </Template>
      <Template vif={error}>
        <View>
          <Text>{error?.message}</Text>
        </View>
      </Template>
      <Template vif={!loading && !error}>
        <App />
      </Template>
    </>
  );
};

export default AppLoader;
