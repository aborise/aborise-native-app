import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Button, Pressable } from 'react-native';

// import { useServices } from "@/composables/useService";
// import { useEncryptedAuth, useSecret } from "@/composables/useServiceAuth";
import { Link, Stack } from 'expo-router';
import { Service, services } from '~/shared/allServices';
import { Image } from 'expo-image';
import { FlatList } from 'react-native';

const Item: React.FC<{ item: Service }> = ({ item }) => {
  return (
    <View className="w-1/2 aspect-square p-2">
      <Link
        v-for="logo in filteredLogos"
        href={`/add/${item.id}`}
        key={item.id}
        className="w-full h-full rounded-lg shadow-md border border-gray-300 active:bg-gray-100 cursor-pointer m-0 justify-center items-center"
        asChild
      >
        <Pressable className="flex flex-col gap-2 w-full h-full">
          <View className="relative -left-1 -top-1">
            <Image source={item.logo} className="w-24 h-24" />
            <Text className="text-center">{item.title}</Text>
          </View>
        </Pressable>
      </Link>
    </View>
  );
};

const Add = () => {
  const addService = () => {};
  const [search, setSearch] = useState('');

  const selectedService = useMemo(() => {
    return Object.values(services).filter((service) => service.title.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <>
      <View className="flex flex-col">
        <View className="w-full flex flex-row p-4 shadow shadow-black bg-white">
          <TextInput
            value={search}
            onChangeText={(value) => {
              setSearch(value);
            }}
            placeholder="Search for a service"
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            className="grow"
          />
        </View>

        <View className="flex grow flex-row justify-center">
          {selectedService.length === 0 && (
            <View className="flex flex-col gap-4 grow items-center justify-center py-4">
              {/* <Image source={require('../../assets/no-results.png')} className="w-4/5 h-4/5" /> */}
              <Text className="text-center text-gray-500">No services found</Text>
            </View>
          )}

          {selectedService.length > 0 && (
            <FlatList
              data={selectedService}
              numColumns={2}
              renderItem={({ item }) => <Item item={item} />}
              keyExtractor={(item) => item.id}
              style={{ flex: 1, paddingHorizontal: 4 }}
            />
          )}
        </View>
      </View>
    </>
  );
};

export default Add;
