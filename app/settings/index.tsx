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

  return (
    <View>
      <Text>Settings</Text>
      <View>
        <Text>Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View>
      <Button title="Clear Storage" onPress={handleClearStorage} />
    </View>
  );
};

export default Settings;
