import CookieManager from '@react-native-cookies/cookies';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Button, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-root-toast';
import RNUxcam from 'react-native-ux-cam';
import { Input, SizableText, YStack } from 'tamagui';
import * as apis from '~/automations/api/index';
import { useI18n } from '~/composables/useI18n';
import { useOnline } from '~/composables/useOnline';
import { useServiceLogin } from '~/composables/useServiceLogin';
import { AllServices, services } from '~/shared/allServices';
import { getAction } from '~/shared/apis';
import { getActionDefinition, logEvent } from '~/shared/helpers';
import { getLogo } from '~/shared/logos';

const { t } = useI18n();

type ConnectProps = {
  id: keyof AllServices;
};

const Connect: React.FC = () => {
  const local = useLocalSearchParams<ConnectProps>();
  const service = useMemo(() => {
    return services[local.id!];
  }, [local.id]);

  const { data, setData, loading: loadingLoginData } = useServiceLogin(service.id);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const isOnline = useOnline();

  const hasRegisterApi = useMemo(() => !!getActionDefinition(service, 'register'), [service]);

  useEffect(() => {
    if (loadingLoginData) return;
    setEmail(data?.email || '');
    setPassword(data?.password || '');
  }, [loadingLoginData]);

  const doConnect = async () => {
    if (!isOnline) {
      return Toast.show(t('you-are-offline'), { duration: Toast.durations.SHORT });
    }

    logEvent('connect', {
      filledCredentials: !!email && !!password,
      partiallyFilledCredentials: !!email || !!password,
      service: service.id,
    });

    const actionDev = getActionDefinition(service, 'connect');

    if (actionDev.type === 'api') throw new Error('not implemented');

    if (actionDev.webView) {
      const v2 = actionDev.webView === 'v2';
      setLoading(true);
      await setData({
        email,
        password,
      });
      setLoading(false);
      return router.push(`/details/${service.id}/webview${v2 ? '2' : ''}/connect`);
    }

    const connect = getAction(apis[local.id!], 'connect');

    if (!connect) {
      return;
    }

    setLoading(true);

    await setData({
      email,
      password,
    });

    const res = await connect(service.id);

    setLoading(false);

    if (res.ok) {
      console.log(res.val.data);
      logEvent('connect_success', {
        filledCredentials: !!email && !!password,
        partiallyFilledCredentials: !!email || !!password,
        service: service.id,
        serviceData: JSON.stringify(res.val.data),
      });
      router.push(`/`);
    } else {
      logEvent('connect_error', {
        filledCredentials: !!email && !!password,
        partiallyFilledCredentials: !!email || !!password,
        service: service.id,
        error: res.val.message,
      });
      Toast.show(res.val.message, { duration: Toast.durations.LONG });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: service.title,
        }}
      />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <YStack alignItems="center" space={10}>
          <Image source={getLogo(service.id)} style={styles.image} className="rounded-3xl" />
          <YStack width="$20" space={8} mb="$2">
            <Input placeholder="Email" value={email} onChangeText={(val) => setEmail(val)} />
            <Input
              placeholder="Password"
              secureTextEntry={true}
              value={password}
              onChangeText={(val) => setPassword(val)}
            />
          </YStack>
          <Button title={t('connect')} onPress={doConnect} />
          {hasRegisterApi && (
            <>
              <SizableText mt="$4">{t('dont-have-an-account')}</SizableText>
              <Button
                title={t('register')}
                onPress={() => {
                  if (!isOnline) {
                    return Toast.show(t('you-are-offline'), { duration: Toast.durations.SHORT });
                  }

                  const def = getActionDefinition(service, 'register');
                  if (def.type === 'api') return;

                  const v2 = def.webView === 'v2';

                  logEvent('register', {
                    service: service.id,
                  });
                  CookieManager.clearAll().then(() =>
                    router.push(`/details/${service.id}/webview${v2 ? '2' : ''}/register`),
                  );
                }}
              />
            </>
          )}
        </YStack>
      </KeyboardAvoidingView>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
  );
};
// TODO: remove stlyes

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 50,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlay: {
    // @ts-expect-error
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Connect;
