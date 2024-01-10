import { Image } from 'expo-image';
import { Link, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Pressable } from 'react-native';
import { Input, SizableText, Square, View, XStack } from 'tamagui';
import { useI18n } from '~/composables/useI18n';
import { Service, services } from '~/shared/allServices';
import { logEvent } from '~/shared/helpers';
import { getLogo } from '~/shared/logos';

const { t } = useI18n();

const image = require('../../assets/no-results.png');

const Item: React.FC<{ item: Service }> = ({ item }) => {
  return (
    <XStack padding="$2" width="50%" aspectRatio={1}>
      <Link
        v-for="logo in filteredLogos"
        href={`/add/${item.id}`}
        key={item.id}
        className="bg-white w-full h-full rounded-lg shadow border border-gray-300 active:bg-gray-100 cursor-pointer justify-center items-center"
        asChild
      >
        <Pressable>
          <Square size="$14" space={4}>
            <Image source={getLogo(item.id)} className="w-24 h-24 rounded-3xl" />
            <SizableText size="$4">{item.title}</SizableText>
          </Square>
        </Pressable>
      </Link>
    </XStack>
  );
};

const Add = () => {
  const [search, setSearch] = useState('');

  const selectedService = useMemo(() => {
    return Object.values(services).filter((service) => service.title.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('add-subscription'),
          // presentation: 'modal',
        }}
      />
      <KeyboardAvoidingView className="h-full">
        <XStack padding="$2" margin="$2" space>
          <Input
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              logEvent('search', { value });
            }}
            placeholder={t('search-for-a-service')}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            className="grow"
            // autoFocus
          />
        </XStack>

        {selectedService.length === 0 && (
          <XStack padding="$2">
            <Image source={image} className="w-full aspect-square" />
          </XStack>
        )}

        {selectedService.length > 0 && (
          <FlatList
            data={selectedService}
            numColumns={2}
            renderItem={({ item }) => <Item item={item} />}
            keyExtractor={(item) => item.id}
            style={{ flex: 1, paddingHorizontal: 4, paddingTop: 2 }}
            ListFooterComponent={<View marginVertical={50} />}
          />
        )}
      </KeyboardAvoidingView>
    </>
  );
};

export default Add;
