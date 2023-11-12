import CookieManager from '@react-native-cookies/cookies';
import { Stack as ExpoStack } from 'expo-router/stack';
import React, { useState } from 'react';
import { Alert, Button, Switch, Text, View } from 'react-native';
import { SizableText, YStack } from 'tamagui';
import { useI18n } from '~/composables/useI18n';
import { useServicesQuery } from '~/queries/useServicesQuery';

const { t } = useI18n();

const Settings = () => {
  const { clearServicesMutation } = useServicesQuery();
  const { mutate: clearServices } = clearServicesMutation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleClearStorage = () => {
    Alert.alert(t('clear-storage'), t('are-you-sure-you-want-to-clear-all-stored-data') + '?', [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('ok'),
        onPress: () => clearServices(),
      },
    ]);
  };

  const getCookies = async () => {
    CookieManager.get('https://www.amazon.de').then((res) => {
      console.log('CookieManager.get =>', res);
    });
  };

  return (
    <YStack padding="$4" space>
      <ExpoStack.Screen options={{ title: t('settings') }} />

      {/* <View>
        <Text>Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View> */}

      <SizableText size="$4" fontWeight="bold">
        This Screen is mostly for develeopment purposes. You better don't touch this!
      </SizableText>

      <YStack
        borderColor="black"
        borderRadius="$2"
        backgroundColor="$blue10"
        padding="$4"
        onPress={handleClearStorage}
        elevation="$1"
        pressStyle={{ backgroundColor: '$blue8' }}
      >
        <SizableText size="$6">Clear Storage</SizableText>
        <SizableText>Removes all data and all connected subscriptions from your device</SizableText>
      </YStack>

      <YStack
        borderColor="black"
        borderRadius="$2"
        backgroundColor="$blue10"
        padding="$4"
        onPress={() => CookieManager.clearAll()}
        elevation="$1"
        pressStyle={{ backgroundColor: '$blue8' }}
      >
        <SizableText size="$6">Clear Cookies</SizableText>
        <SizableText>Removes all device cookies from the CookieManager</SizableText>
      </YStack>

      <YStack
        borderColor="black"
        borderRadius="$2"
        backgroundColor="$blue10"
        padding="$4"
        onPress={getCookies}
        elevation="$1"
        pressStyle={{ backgroundColor: '$blue8' }}
      >
        <SizableText size="$6">Get Cookies</SizableText>
        <SizableText>Prints the amazon cookies to the console</SizableText>
      </YStack>
    </YStack>
  );
};

export default Settings;
