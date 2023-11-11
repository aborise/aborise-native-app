import { Image } from 'expo-image';
import { Stack as ExpoStack, Link, router } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SizableText, Stack, XStack, YStack, styled } from 'tamagui';
import AboCard from '~/components/AboCard';
import AboItem from '~/components/AboItem';
import { AboItemUnconnected } from '~/components/AboItemUnconnected';
import { useI18n } from '~/composables/useI18n';
import { useServicesDataQuery } from '~/queries/useServicesDataQuery';
import { services } from '~/shared/allServices';
import { objectEntries } from '~/shared/typeHelpers';

const { t } = useI18n();

const LogoTitle: React.FC = () => {
  return (
    <>
      <Stack>
        <Image style={{ width: 32, height: 32 }} source={require('../assets/logo2.svg')} />
      </Stack>
    </>
  );
};

const MonthlyExpenses: React.FC<{ amount: number }> = ({ amount }) => {
  return (
    <AboCard backgroundColor="$yellow4" elevation="$1">
      <YStack>
        <SizableText size="$2">{t('monthly-expenses')}</SizableText>
        <SizableText size="$8">€{(amount / 100).toFixed(2)}</SizableText>
      </YStack>
    </AboCard>
  );
};

const App = () => {
  const { data: connectedServices, isLoading } = useServicesDataQuery();

  const price = useMemo(() => {
    return Object.values(connectedServices ?? {}).reduce((acc, curr) => {
      if (curr.membershipStatus === 'active') {
        return acc + (curr.nextPaymentPrice ?? 0);
      }
      return acc;
    }, 0);
  }, [connectedServices]);

  return (
    <>
      <ExpoStack.Screen
        options={{
          title: 'Home',
          headerTitle: () => <LogoTitle />,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Icon name="navicon" size={24} color="#000000" />
            </TouchableOpacity>
          ),
        }}
      />
      <YStack flex={1} padding="$3" space>
        <MonthlyExpenses amount={price} />

        {isLoading && <ActivityIndicator />}

        {connectedServices && Object.keys(connectedServices).length ? (
          <YStack space="$2">
            <SizableText size="$6">{t('active-subscriptions')}</SizableText>
            <FlatList
              contentContainerStyle={{ gap: 8 }}
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
          </YStack>
        ) : null}

        {!isLoading && (!connectedServices || !Object.keys(connectedServices).length) ? (
          <YStack alignItems="center">
            <Image source={require('../assets/no-subs.png')} className="w-full aspect-square" />
            <SizableText>{t('you-dont-have-any-subscriptions-yet')}</SizableText>
            <Link href="/add" asChild>
              <SizableText color="$blue10">{t('add-one')}</SizableText>
            </Link>
          </YStack>
        ) : null}
        <YStack fullscreen>
          <Link href="/add" asChild>
            <Pressable
              style={{ elevation: 3 }}
              className="rounded-full absolute right-5 bottom-8 bg-slate-500 text-black shadow-lg text-xl h-14 w-14 flex justify-center items-center active:bg-slate-600"
            >
              <Icon name="plus" size={32} color="#fff" />
            </Pressable>
          </Link>
        </YStack>
      </YStack>
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
