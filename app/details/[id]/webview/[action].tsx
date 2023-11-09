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
import { WebViewConfig } from '~/automations/webview/webview.helpers';
import { useServiceLogin } from '~/composables/useServiceLogin';
import { addConnectedService } from '~/composables/useServiceData';
import { useQueryClient } from '@tanstack/react-query';

type WebViewConfigKeys = keyof typeof webviews;
type WebViewConfigActionNames = { [P in WebViewConfigKeys]: keyof (typeof webviews)[P] }[WebViewConfigKeys];

export const ServiceWebView: React.FC = () => {
  const local = useLocalSearchParams<{ id: keyof AllServices; action: WebViewConfigActionNames }>();

  if (!webviews[local.id as WebViewConfigKeys]) {
    console.log('no webview found for this service');
    Toast.show('No webview found for this service', { duration: Toast.durations.LONG });
    router.push('/');
    return null;
  }

  // @ts-expect-error action can be different for each service
  if (!webviews[local.id as WebViewConfigKeys][local.action]) {
    console.log('no webview action found for this service');
    Toast.show('No webview action found for this service', { duration: Toast.durations.LONG });
    router.push('/');
    return null;
  }

  const service = useMemo(() => {
    return services[local.id!];
  }, [local.id]);

  const config = useMemo<WebViewConfig>(() => {
    // @ts-expect-error action can be different for each service
    return webviews[service.id as WebViewConfigKeys][local.action];
  }, [service, local.action]);

  const { serviceDataMutation } = useServiceDataQuery(local.id!);
  const { mutateAsync: updateServiceData } = serviceDataMutation();

  const queryClient = useQueryClient();

  const saveData = async (result: Result<FlowReturn, any>) => {
    if (result.err) {
      console.error(result.err);
      return;
    }

    await setCookies(local.id!, result.val.cookies);
    await updateServiceData(result.val.data);

    if (local.action === 'connect') {
      await addConnectedService(local.id!);
      await queryClient.invalidateQueries({ queryKey: ['services'] });
      await queryClient.invalidateQueries({ queryKey: ['servicesData', local.id!] });
    }
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
        getAuth={config.getAuth}
        otherCode={config.otherCode}
      />
    </>
  );
};

export default ServiceWebView;
