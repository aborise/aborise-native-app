import CookieManager from '@react-native-cookies/cookies';
import React, { useState } from 'react';
import { Alert, Button, Switch, Text, View } from 'react-native';
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
    <View>
      <Text>Settings</Text>
      <View>
        <Text>Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View>
      <Button title="Clear Storage" onPress={handleClearStorage} />
      <Button title="Get Cookies" onPress={getCookies} />
      <Button title="Clear Cookies" onPress={() => CookieManager.clearAll()} />
    </View>
  );
};

export default Settings;
