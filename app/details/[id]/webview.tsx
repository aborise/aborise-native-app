import { Stack, useLocalSearchParams } from 'expo-router';
import { Cookie } from 'playwright-core';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import { cookiesToString, getCookies } from '~/automations/api/helpers/cookie';
import { AllServices, services } from '~/shared/allServices';

type ActionsWithUrl<
  T extends AllServices[keyof AllServices]['actions'][number] = AllServices[keyof AllServices]['actions'][number],
> = T extends { url: string } ? T : never;

const INJECTED_JAVASCRIPT = `(function() {-
  window.ReactNativeWebView.postMessage(JSON.stringify(window.location));
  
  document.addEventListener('click', () => {
    window.ReactNativeWebView.postMessage('click');
  })
})();`;

export const ServiceWebView: React.FC = () => {
  const local = useLocalSearchParams<{ id: keyof AllServices }>();
  const service = useMemo(() => {
    return services[local.id!];
  }, [local.id]);

  const [webviewUrl, setWebviewUrl] = useState<string>();
  const [webviewCookies, setWebviewCookies] = useState<Cookie[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCookies(local.id!).then((cookies) => {
      setWebviewCookies(cookies);
      setWebviewUrl(
        (services[local.id!].actions.find((action) => action.name === 'reactivate') as ActionsWithUrl)?.url!,
      );
    });
  }, []);

  const handleWebViewMessage = (event: any) => {
    console.log('event', event.nativeEvent.data);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: service.title,
        }}
      />
      {loading && (
        <View
          style={{
            // @ts-expect-error
            ...StyleSheet.absoluteFill,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      )}
      {webviewUrl && (
        <WebView
          source={{
            uri: webviewUrl,
            headers: {
              Cookie: cookiesToString(webviewCookies),
            },
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          injectedJavaScript={INJECTED_JAVASCRIPT}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={(navState) => {
            console.log('onNavigationChange', navState);
          }}
          onLoadEnd={() => setLoading(false)}
          style={{ opacity: loading ? 0 : 1 }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    margin: 16,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    // backgroundColor: '#f0f0f0',
    // borderRadius: 4,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
  },
  firstColumn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  syncBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4e4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  syncText: {
    fontSize: 12,
  },
  lastSyncDateText: {
    fontSize: 12,
    marginTop: 8,
  },
  secondColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  thirdColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-evenly',
  },
  statusBox: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFF',
  },
  priceText: {
    fontSize: 16,
    marginTop: 16,
    paddingTop: 4,
  },
  decimalText: {
    fontSize: 12,
    lineHeight: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  btnCancel: {
    backgroundColor: '#f44336',
    color: '#FFF',
  },
  btnResume: {
    backgroundColor: '#4caf50',
    color: '#FFF',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexItemsCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textLg: {
    fontSize: 18,
  },
  textBase: {
    fontSize: 16,
  },
  ml4: {
    marginLeft: 16,
  },
  mb2: {
    marginBottom: 8,
  },
});

export default ServiceWebView;
