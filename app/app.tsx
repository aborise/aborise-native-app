import { Image } from 'expo-image';
import { Stack as ExpoStack, Link, router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SizableText, Stack, XStack, YStack } from 'tamagui';
import { ActionResultActive } from '~/automations/helpers/helpers';
import AboCard from '~/components/AboCard';
import AboItem from '~/components/AboItem';
import { useI18n } from '~/composables/useI18n';
import { Service } from '~/realms/Service';
import { useQuery } from '~/realms/realm';
import { services } from '~/shared/allServices';

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

const factors: Record<ActionResultActive['billingCycle'], number> = {
  monthly: 1,
  annual: 12,
};

const App = () => {
  const connectedServices = useQuery(Service).sorted('id');

  const price = useMemo(() => {
    return connectedServices.reduce((acc, curr) => {
      return acc + curr.getMonthlyPrice();
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
      <YStack padding="$3" paddingBottom="$0" space fullscreen>
        <MonthlyExpenses amount={price} />

        {/* {isLoading && <ActivityIndicator />} */}

        {connectedServices && Object.keys(connectedServices).length ? (
          <YStack space="$2" flex={1}>
            <SizableText size="$6">{t('subscriptions')}</SizableText>
            <FlatList
              contentContainerStyle={{ gap: 8 }}
              data={connectedServices}
              keyExtractor={({ id }) => id}
              renderItem={({ item }) => <AboItem data={item} title={services[item.id].title} id={item.id} />}
            />
          </YStack>
        ) : null}

        {!connectedServices.length ? (
          <YStack alignItems="center">
            <Image source={require('../assets/no-subs.png')} className="w-full aspect-square" />
            <SizableText>{t('you-dont-have-any-subscriptions-yet')}</SizableText>
            <Link href="/add" asChild>
              <SizableText color="$blue10">{t('add-one')}</SizableText>
            </Link>
          </YStack>
        ) : null}
        <Link href="/add" asChild>
          <XStack
            position="absolute"
            bottom="$8"
            right="$5"
            elevation="$1"
            borderRadius="$12"
            height="$6"
            width="$6"
            backgroundColor="$blue9"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ backgroundColor: '$blue8' }}
          >
            <Icon name="plus" size={32} color="#fff" />
          </XStack>
        </Link>
      </YStack>
    </>
  );
};

export default App;
