import { Cookies } from '@react-native-cookies/cookies';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import Toast from 'react-native-root-toast';
import { deviceCookiesToCookies, setCookies, setToken } from '~/automations/api/helpers/cookie';
import { ActionError, ActionReturn } from '~/automations/helpers/helpers';
import { WebViewConfig2 } from '~/automations/webview/webview.helpers';
import * as webviews from '~/automations/webview2/index';
import { useServiceRefresh } from '~/composables/useServiceRefresh';
import { Service } from '~/realms/Service';
import { Result } from '~/shared/Result';
import { AllServices, services } from '~/shared/allServices';
import AutomatedWebView from '../automatedWebView';
import { useI18n } from '~/composables/useI18n';

type WebViewConfigKeys = keyof typeof webviews;
type WebViewConfigActionNames = { [P in WebViewConfigKeys]: keyof (typeof webviews)[P] }[WebViewConfigKeys];

const { t } = useI18n();

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

  const config = useMemo<WebViewConfig2>(() => {
    // @ts-expect-error action can be different for each service
    return webviews[service.id as WebViewConfigKeys][local.action];
  }, [service, local.action]);

  const { onRefresh } = useServiceRefresh();

  const saveData = async (result: Result<ActionReturn, ActionError>, deviceCookies: Cookies) => {
    if (result.err) {
      Toast.show(result.val.message, { duration: Toast.durations.LONG });
      console.log(result.val);
      router.back();
      return;
    }

    const cooks = deviceCookiesToCookies(deviceCookies);

    if (cooks.length > 0) {
      await setCookies(local.id!, cooks);
    } else if (result.val.cookies?.length) {
      await setCookies(local.id!, result.val.cookies);
    }

    if (result.val.token) {
      await setToken(local.id!, result.val.token);
    }

    Service.recreateServiceFromActionResult(local.id!, result.val.data);

    if (!result.val.data && result.val.token) {
      await onRefresh(service);
    }

    Toast.show(result.val.message ?? t('success'), { duration: Toast.durations.LONG });
    router.push('/');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: service.title,
        }}
      />

      <AutomatedWebView
        title={service.title}
        statusBar={config.status}
        url={config.url}
        onSuccess={saveData}
        getCookies={config.getCookies}
        getHeaders={config.getHeaders}
        script={config.script}
      />
    </>
  );
};

export default ServiceWebView;
