import CookieManager from '@react-native-cookies/cookies';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { SizableText } from 'tamagui';
import * as apis from '~/automations/api/index';
import { useServiceLogin } from '~/composables/useServiceLogin';
import { AllServices, services } from '~/shared/allServices';
import { getAction } from '~/shared/apis';
import { getUserId } from '~/shared/ensureDataLoaded';
import { getActionDefinition } from '~/shared/helpers';
import { getLogo } from '~/shared/logos';

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
  const [error, setError] = React.useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    if (loadingLoginData) return;
    setEmail(data?.email || '');
    setPassword(data?.password || '');
  }, [loadingLoginData]);

  const doConnect = async () => {
    const actionDev = getActionDefinition(service, 'connect');

    if (actionDev.type === 'api') throw new Error('not implemented');

    if (actionDev.webView) {
      return router.push(`/details/${service.id}/webview/connect`);
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

    const res = await connect({
      user: getUserId(),
      queueId: '123',
      service: service.id,
      type: 'connect',
    });

    await queryClient.invalidateQueries({ queryKey: ['services'] });

    setLoading(false);

    if (res.ok) {
      console.log(res.val.data);
      router.push(`/`);
    } else {
      setError(res.val.message);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: service.title,
          // animation: 'fade',
        }}
      />
      <View style={styles.container}>
        <Image source={getLogo(service.id)} style={styles.image} className="rounded-3xl" />
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={(val) => setEmail(val)} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={(val) => setPassword(val)}
          />
        </View>
        <Button title="Connect" onPress={doConnect} />
        <SizableText mt="$4">Don't have an account?</SizableText>
        <Button
          title="register"
          onPress={() => CookieManager.clearAll().then(() => router.push(`/details/${service.id}/webview/register`))}
        />

        <View>
          <Text>{error}</Text>
        </View>
      </View>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
  );
};

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
