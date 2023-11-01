import CookieManager from '@react-native-cookies/cookies';
import React, { useState } from 'react';
import { View, Text, Switch, Button, Alert } from 'react-native';
import { clearConnectedServices } from '~/composables/useServiceData';
import { useStorage } from '~/composables/useStorage';
import { useServicesQuery } from '~/queries/useServicesQuery';

const Settings = () => {
  const { clearServicesMutation } = useServicesQuery();
  const { mutate: clearServices } = clearServicesMutation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleClearStorage = () => {
    Alert.alert('Clear Storage', 'Are you sure you want to clear all stored data?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => clearServices(),
      },
    ]);
  };

  const getCookies = async () => {
    CookieManager.get('https://asd1.netflix.com/nq/aasds/~2.8.0/pathEvaluator').then((res) => {
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
