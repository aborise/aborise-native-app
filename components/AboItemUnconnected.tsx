import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Button } from 'react-native';

import { router } from 'expo-router';
import { Image } from 'expo-image';
import { getLogo } from '~/shared/logos';
import { useI18n } from '~/composables/useI18n';

const { t } = useI18n();

interface AboItemUnconnectedProps {
  title: string;
  styles?: any;
  className?: string;
  id: string; // or the specific type you use for `keyof AllServices`
  onContextMenu?: (event: any) => void;
}

export const AboItemUnconnected: React.FC<AboItemUnconnectedProps> = ({ title, id, styles, onContextMenu }) => {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const connect = useCallback(async () => {
    setButtonDisabled(true);
    // Replace with your createPending function
    const success = await Promise.resolve(true);
    if (success) {
      router.push(`/details/${id}`);
    } else {
      setButtonDisabled(false);
    }
  }, [id]);

  return (
    <TouchableOpacity onLongPress={onContextMenu}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          ...styles,
        }}
      >
        <Image source={getLogo(id)} style={{ width: 48, height: 48 }} className="rounded-xl" />
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 24 }}>{title}</Text>
          <Text style={{ fontSize: 12, color: 'gray' }}>{t('not-synced')}</Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <Button title="Connect Now" onPress={connect} disabled={buttonDisabled} />
        </View>
      </View>
    </TouchableOpacity>
  );
};
