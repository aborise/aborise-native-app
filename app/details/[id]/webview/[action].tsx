import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { setCookies } from '~/automations/api/helpers/cookie';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
import * as webviews from '~/automations/webview/index';
import { useServiceDataQuery } from '~/queries/useServiceDataQuery';
import { Result } from '~/shared/Result';
import { AllServices, services } from '~/shared/allServices';
import GenericWebView from '../genericWebView';
import Toast from 'react-native-root-toast';

type WebViewConfigKeys = keyof typeof webviews;
type WebViewConfigActionNames = keyof (typeof webviews)[WebViewConfigKeys];

export const ServiceWebView: React.FC = () => {
  const local = useLocalSearchParams<{ id: keyof AllServices; action: WebViewConfigActionNames }>();

  if (!webviews[local.id as WebViewConfigKeys]) {
    Toast.show('No webview found for this service', { duration: Toast.durations.LONG });
    router.push('/');
    return null;
  }

  const service = useMemo(() => {
    return services[local.id!];
  }, [local.id]);

  const config = useMemo(() => {
    return webviews[service.id as WebViewConfigKeys][local.action!];
  }, [service, local.action]);

  const { serviceDataMutation } = useServiceDataQuery(local.id!);
  const { mutateAsync: updateServiceData } = serviceDataMutation();

  const saveData = (result: Result<FlowReturn, any>) => {
    console.log('something came back from webview!');

    if (result.err) {
      console.error(result.err);
      return;
    }

    setCookies(local.id!, result.val.cookies);
    updateServiceData(result.val.data);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: service.title,
        }}
      />

      <GenericWebView
        title={service.title}
        url={config.url}
        sanityCheck={config.sanityCheck}
        targetUrl={config.targetUrl}
        targetCondition={config.targetCondition}
        dataExtractor={config.dataExtractor}
        dataConverter={config.dataConverter}
        onSuccess={saveData}
        getCookies={config.getCookies}
      />
    </>
  );
};

export default ServiceWebView;
