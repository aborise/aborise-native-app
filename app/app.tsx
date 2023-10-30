import { Image } from 'expo-image';
import { Link, Stack, router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AboItem from '~/components/AboItem';
import { AboItemUnconnected } from '~/components/AboItemUnconnected';
import { useServicesDataQuery } from '~/queries/useServicesDataQuery';
import { services } from '~/shared/allServices';
import { objectEntries } from '~/shared/typeHelpers';

const MonthlyExpenses: React.FC<{ amount: string }> = ({ amount }) => {
  return (
    <View className="p-4 bg-white border border-gray-300 rounded">
      <Text className="text-base font-medium">Monthly expenses</Text>
      <Text className="text-xl font-bold">{amount}€</Text>
    </View>
  );
};

const LogoTitle: React.FC = () => {
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
};

const App = () => {
  const { data: connectedServices } = useServicesDataQuery();
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
          headerTitle: () => <LogoTitle />,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Icon name="cog" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex flex-col grow p-4">
        <View className="flex flex-col grow" style={{ gap: 16 }}>
          <MonthlyExpenses amount="100" />
          {connectedServices && Object.keys(connectedServices).length ? (
            <>
              <Text className="text-xl font-bold">Subscriptions</Text>
              <FlatList
                data={objectEntries(connectedServices)}
                keyExtractor={([id]) => id}
                renderItem={({ item }) =>
                  item[1] ? (
                    <AboItem data={item[1]!} title={services[item[0]].title} id={item[0]} />
                  ) : (
                    <AboItemUnconnected id={item[0]} title={services[item[0]].title} />
                  )
                }
              />
            </>
          ) : (
            <View className="flex w-full items-center pt-10">
              <Text>You don't have any subscriptions yet</Text>
              <Link href="/add" asChild>
                <Text className="text-indigo-600">Add one</Text>
              </Link>
            </View>
          )}

          <Link href="/add" asChild>
            <Pressable
              style={{ elevation: 3 }}
              className="rounded-full absolute bottom-8 right-8 bg-indigo-600 text-white text-xl h-12 w-12 flex justify-center items-center active:bg-blue-600"
            >
              <Icon name="plus" size={24} color="#fff" />
            </Pressable>
          </Link>
        </View>
      </View>
    </>
  );
};

export default App;

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
        ) :*/
