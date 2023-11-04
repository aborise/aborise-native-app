import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { setCookies } from '~/automations/api/helpers/cookie';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
import * as webviews from '~/automations/webview/index';
import { useServiceDataQuery } from '~/queries/useServiceDataQuery';
import { Result } from '~/shared/Result';
import { AllServices, services } from '~/shared/allServices';
import GenericWebView from '../genericWebView';

type WebViewConfigKeys = keyof typeof webviews;
type WebViewConfigActionNames = keyof (typeof webviews)[WebViewConfigKeys];

export const ServiceWebView: React.FC = () => {
  const local = useLocalSearchParams<{ id: keyof AllServices; action: WebViewConfigActionNames }>();
  const service = useMemo(() => {
    return services[local.id!];
  }, [local.id]);

  console.log(local.id, local.action);

  const config = useMemo(() => {
    return webviews[service.id as WebViewConfigKeys][local.action!];
  }, [service, local.action]);

  console.log(config);

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
