import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Service, services } from '~/shared/allServices';
import { getLogo } from '~/shared/logos';

const Item: React.FC<{ item: Service }> = ({ item }) => {
  return (
    <View className="w-1/2 aspect-square p-2 ">
      <Link
        v-for="logo in filteredLogos"
        href={`/add/${item.id}`}
        key={item.id}
        className="bg-white w-full h-full rounded-lg shadow border border-gray-300 active:bg-gray-100 cursor-pointer justify-center items-center"
        asChild
      >
        <Pressable className="flex flex-col w-full h-full">
          <Image source={getLogo(item.id)} className="w-24 h-24 rounded-3xl" />
          <Text className="text-center mt-2">{item.title}</Text>
        </Pressable>
      </Link>
    </View>
  );
};

const Add = () => {
  const [search, setSearch] = useState('');

  const selectedService = useMemo(() => {
    return Object.values(services).filter((service) => service.title.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <>
      <View className="flex flex-col">
        <View className="w-full flex flex-row p-4  bg-white relative z-10" style={{ elevation: 10 }}>
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
            autoFocus
          />
        </View>

        <View className="flex grow flex-row justify-center">
          {selectedService.length === 0 && (
            <View className="flex flex-col grow items-center justify-center">
              <Image source={require('../../assets/no-results.png')} className="w-full aspect-square" />
            </View>
          )}

          {selectedService.length > 0 && (
            <FlatList
              data={selectedService}
              numColumns={2}
              renderItem={({ item }) => <Item item={item} />}
              keyExtractor={(item) => item.id}
              style={{ flex: 1, paddingHorizontal: 4, paddingTop: 2 }}
            />
          )}
        </View>
      </View>
    </>
  );
};

export default Add;
