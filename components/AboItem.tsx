import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Link } from 'expo-router/src/exports';
import React, { useMemo } from 'react';
import { Pressable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SizableText, Text, XStack, YStack, styled } from 'tamagui';
import { ActionReturn } from '~/automations/helpers/helpers';
import { useDayJs, useI18n } from '~/composables/useI18n';
import { AllServices } from '~/shared/allServices';
import { getLogo } from '~/shared/logos';
import AboCard from './AboCard';

const dayjs = useDayJs();
const { t } = useI18n();

interface AboItemProps {
  title: string;
  data: NonNullable<ActionReturn['data']>;
  styles?: any;
  className?: string;
  id: keyof AllServices;
  onContextMenu?: (event: any) => void; // Note: React Native doesn't have native context menu
}

const AboItem: React.FC<AboItemProps> = ({ title, data, onContextMenu, styles, id }) => {
  const nextPaymentRelativeDate = useMemo(
    () => (data.status === 'active' ? dayjs(data.nextPaymentDate).fromNow() : undefined),
    [data],
  );
  const renewsDate = useMemo(
    () => (data.status === 'active' ? dayjs(data.nextPaymentDate).format('MMM DD') : undefined),
    [data],
  );
  const expiresDate = useMemo(
    () => (data.status === 'canceled' ? dayjs(data.expiresAt).format('MMM DD') : undefined),
    [data],
  );

  const { integer, decimal } = useMemo<{
    integer?: number;
    decimal?: number;
  }>(() => {
    return data.status === 'active' ? data.planPrice ?? {} : {};
  }, [data]);

  return (
    <Link asChild href={`/details/${id}`}>
      <AboCard backgroundColor="$blue6" pressStyle={{ backgroundColor: '$blue5' }}>
        <Image source={getLogo(id)} style={{ width: 60, height: 60 }} className="rounded-xl" />
        <YStack flex={1}>
          <SizableText size="$6">{title}</SizableText>
          {renewsDate && (
            <SizableText theme="alt2" size="$2">
              {t('renews')} {renewsDate}
            </SizableText>
          )}
          {expiresDate && (
            <SizableText theme="alt2" size="$1">
              {t('expires')} {expiresDate}
            </SizableText>
          )}
          {data.status === 'inactive' && (
            <SizableText theme="alt2" size="$2">
              {t('inactive')}
            </SizableText>
          )}
        </YStack>

        {(data.status === 'active' || data.status === 'canceled') && !!data.planPrice && (
          <YStack alignItems="flex-end">
            <SizableText>EUR {(data.planPrice / 100).toFixed(2)}</SizableText>
            <SizableText theme="alt2" size="$1">
              {' '}
              / {data.billingCycle === 'monthly' ? t('month') : t('year')}
            </SizableText>
          </YStack>
        )}

        <Icon name="angle-right" size={24} color="#000000" />
      </AboCard>
    </Link>
  );
};

export default AboItem;
