import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { AllServices, services } from '~/shared/allServices';
import * as apis from '~/automations/api/index';
import { ActivityIndicator } from 'react-native';
import { useServiceLogin } from '~/composables/useServiceLogin';
import { getUserId } from '~/shared/ensureDataLoaded';
import { Image } from 'expo-image';
import { getLogo } from '~/shared/logos';
import { useQueryClient } from '@tanstack/react-query';

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
    const fn = (apis[local.id as keyof typeof apis] as (typeof apis)['netflix'])
      ?.connect as (typeof apis)['netflix']['connect'];
    if (fn) {
      setLoading(true);
      await setData({
        email,
        password,
      });
      fn({
        user: getUserId(),
        queueId: '123',
        service: service.id,
        type: 'connect',
      })
        .then(async (res) => {
          await queryClient.invalidateQueries({ queryKey: ['services'] });
          setLoading(false);
          if (res.ok) {
            if (res.val.data?.membershipStatus === 'active') {
              console.log(res.val.data.nextPaymentDate);
            } else if (res.val.data?.membershipStatus === 'canceled') {
              console.log(res.val.data.expiresAt);
            } else if (res.val.data?.membershipStatus === 'inactive') {
              console.log(res.val.data.membershipStatus);
            }
            router.push(`/`);
          } else {
            setError(res.val.message);
            console.log(res.val.history);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
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
