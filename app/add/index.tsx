import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Button, Pressable } from "react-native";

// import { useServices } from "@/composables/useService";
// import { useEncryptedAuth, useSecret } from "@/composables/useServiceAuth";
import { Link, Stack } from "expo-router";
import { Service, services } from "~/shared/allServices";
import { Image } from "expo-image";
import { FlatList } from "react-native";

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
            <Image
              source={{ uri: item.logo }}
              style={{ width: 100, height: 100 }}
            />
            <Text className="text-center">{item.title}</Text>
          </View>
        </Pressable>
      </Link>
    </View>
  );
};

const Add = () => {
  const addService = () => {};
  const [search, setSearch] = useState("");

  const selectedService = useMemo(() => {
    return Object.values(services).filter((service) =>
      service.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Subscription",
          presentation: "modal",
        }}
      />
      <View className="flex flex-col pt-4">
        <TextInput
          value={search}
          onChangeText={(value) => {
            setSearch(value);
          }}
          placeholder="Search for a service"
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
          className="px-4"
        />

        <View className="flex flex-row flex-wrap gap-4 grow overflow-auto px-4 justify-between">
          {selectedService.length === 0 && (
            <Text className="text-center text-gray-500">No services found</Text>
          )}

          {selectedService.length > 0 && (
            <FlatList
              data={selectedService}
              numColumns={2}
              renderItem={({ item }) => <Item item={item} />}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </View>
    </>
  );
};

export default Add;
