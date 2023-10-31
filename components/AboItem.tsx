import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
import { Image } from 'expo-image';
import { Link } from 'expo-router/src/exports';
import { AllServices } from '~/shared/allServices';
import { getLogo } from '~/shared/logos';
import Icon from 'react-native-vector-icons/FontAwesome';

dayjs.extend(relativeTime);

interface AboItemProps {
  title: string;
  data: NonNullable<FlowReturn['data']>;
  styles?: any;
  className?: string;
  id: keyof AllServices;
  onContextMenu?: (event: any) => void; // Note: React Native doesn't have native context menu
}

const AboItem: React.FC<AboItemProps> = ({ title, data, onContextMenu, styles, id }) => {
  const nextPaymentRelativeDate = useMemo(
    () => (data.membershipStatus === 'active' ? dayjs(data.nextPaymentDate).fromNow() : undefined),
    [data],
  );
  const renewsDate = useMemo(
    () => (data.membershipStatus === 'active' ? dayjs(data.nextPaymentDate).format('DD.MM.YYYY') : undefined),
    [data],
  );
  const expiresDate = useMemo(
    () => (data.membershipStatus === 'canceled' ? dayjs(data.expiresAt!).format('DD.MM.YYYY') : undefined),
    [data],
  );

  const { integer, decimal } = useMemo<{
    integer?: number;
    decimal?: number;
  }>(() => {
    return data.membershipStatus === 'active' ? data.nextPaymentPrice ?? {} : {};
  }, [data]);

  return (
    <Link asChild href={`/details/${id}`}>
      <TouchableOpacity onLongPress={onContextMenu}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderWidth: 2,
            borderColor: '#000',
            borderRadius: 16,
            gap: 16,
            marginBottom: 8,
            backgroundColor: '#fff',
            ...styles,
          }}
        >
          <Image source={getLogo(id)} style={{ width: 48, height: 48 }} className="rounded-xl" />
          <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 24 }}>{title}</Text>
            {renewsDate && <Text style={{ fontSize: 12, color: 'gray' }}>Renews {renewsDate}</Text>}
            {expiresDate && <Text style={{ fontSize: 12, color: 'gray' }}>Expires {expiresDate}</Text>}
            {data.membershipStatus === 'inactive' && <Text style={{ fontSize: 12, color: 'gray' }}>Expired</Text>}
          </View>
          <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
            {integer && (
              <>
                <Text style={{ fontSize: 24 }}>
                  <Text>{integer}</Text>
                  <Text style={{ fontSize: 8 }}>{decimal}</Text>
                </Text>
                <Text style={{ fontSize: 12, color: 'gray' }}>Next Payment</Text>
                <Text style={{ fontSize: 10, color: 'lightgray' }}>{nextPaymentRelativeDate}</Text>
              </>
            )}
          </View>
          <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
            <Icon name="angle-right" size={24} color="#000000" />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default AboItem;
