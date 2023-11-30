import CookieManager from '@react-native-cookies/cookies';
import { Stack as ExpoStack } from 'expo-router/stack';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SizableText, YStack } from 'tamagui';
import { getCookies } from '~/automations/api/helpers/cookie';
import { useI18n } from '~/composables/useI18n';
import { Service } from '~/realms/Service';
import { useRealm } from '~/realms/realm';

const { t } = useI18n();

const Settings = () => {
  const realm = useRealm();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleClearStorage = () => {
    Alert.alert(t('clear-storage'), t('are-you-sure-you-want-to-clear-all-stored-data') + '?', [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('ok'),
        onPress: () => realm.delete(realm.objects(Service)),
      },
    ]);
  };

  const getCookies2 = async () => {
    CookieManager.get('https://tv.apple.com/').then(async (res) => {
      console.log('CookieManager.get =>', res);
      console.log('Cookies =>', await getCookies('apple'));
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
        onPress={getCookies2}
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
