import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import AboItem from '~/components/AboItem';
import { Link, Stack, router } from 'expo-router';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useConnectedServiceData } from '~/composables/useServiceData';
import { Template } from '~/components/Template';
import { ActivityIndicator } from 'react-native';
import { services } from '~/shared/allServices';
import { objectEntries } from '~/shared/typeHelpers';
import { AboItemUnconnected } from '~/components/AboItemUnconnected';
import { getUserId } from '~/shared/ensureDataLoaded';

function LogoTitle() {
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Image style={{ width: 32, height: 32 }} source={require('../assets/logo.svg')} />
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#fff',
          }}
        >
          aborise
        </Text>
      </View>
    </>
  );
}

const App = () => {
  const { value: connectedServices, error, loading } = useConnectedServiceData();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => <LogoTitle />,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Icon name="cog" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={{ flex: 1 }}>
        <Template vif={loading}>
          <ActivityIndicator size="small" color="#0000ff" />
        </Template>
        <Template vif={error}>
          <Text>{error?.message}</Text>
        </Template>
        <Template vif={connectedServices}>
          {
            /* {!user || user?.isAnonymous ? (
          <View className="h-72 bg-blue-200 text-white flex flex-col items-center justify-center mt-4">
            <Text className="text-2xl font-bold">Join Aborise!</Text>
            <Text className="text-md mt-2">
              Get access to exclusive content.
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="text-indigo-600">Create an account</Text>
            </TouchableOpacity>
            <Text className="mt-4">Already got an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text className="text-indigo-600">Login</Text>
            </TouchableOpacity>
          </View>
        ) :*/ connectedServices && Object.keys(connectedServices).length ? (
              <FlatList
                data={objectEntries(connectedServices)}
                keyExtractor={([id]) => id}
                renderItem={({ item }) => (
                  <>
                    <Template vif={item[1]}>
                      <AboItem
                        data={item[1]!}
                        className="hover:bg-slate-100 cursor-pointer"
                        logo={services[item[0]].logo}
                        title={services[item[0]].title}
                        id={item[0]}
                      />
                    </Template>
                    <Template vif={!item[1]}>
                      <AboItemUnconnected
                        id={item[0]}
                        className="hover:bg-slate-100 cursor-pointer"
                        logo={services[item[0]].logo}
                        title={services[item[0]].title}
                      />
                    </Template>
                  </>
                )}
              />
            ) : (
              <View className="flex w-full items-center pt-10">
                <Text>You don't have any subscriptions yet</Text>
                <Link href="/add" asChild>
                  <Text className="text-indigo-600">Add one</Text>
                </Link>
              </View>
            )
          }
        </Template>

        <Link href="/add" asChild>
          <Pressable
            style={{ elevation: 3 }}
            className="rounded-full absolute bottom-8 right-8 bg-indigo-600 text-white text-xl h-12 w-12 flex justify-center items-center active:bg-blue-600"
          >
            <Icon name="plus" size={24} color="#fff" />
          </Pressable>
        </Link>
      </View>
    </>
  );
};

export default App;
