import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import Toast from 'react-native-root-toast';
import { deviceCookiesToCookies, setCookies } from '~/automations/api/helpers/cookie';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
import * as webviews from '~/automations/webview/index';
import { WebViewConfig } from '~/automations/webview/webview.helpers';
import { useServiceDataQuery } from '~/queries/useServiceDataQuery';
import { useServicesQuery } from '~/queries/useServicesQuery';
import { Result } from '~/shared/Result';
import { AllServices, services } from '~/shared/allServices';
import GenericWebView from '../genericWebView';
import { Cookies } from '@react-native-cookies/cookies';
import { Cookie } from 'playwright-core';

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

  const { addServiceMutation } = useServicesQuery();
  const { mutateAsync: addService } = addServiceMutation();

  const saveData = async (result: Result<FlowReturn, any>, deviceCookies: Cookies) => {
    if (result.err) {
      console.error(result.err);
      return;
    }

    const cooks = deviceCookiesToCookies(deviceCookies);

    if (cooks.length > 0) {
      await setCookies(local.id!, cooks);
    } else if (result.val.cookies?.length) {
      await setCookies(local.id!, result.val.cookies);
    }

    await updateServiceData(result.val.data);

    if (local.action === 'connect') {
      await addService(local.id!);
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
        getHeaders={config.getHeaders}
      />
    </>
  );
};

export default ServiceWebView;
