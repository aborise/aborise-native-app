import { Image } from 'expo-image';
import { Link } from 'expo-router/src/exports';
import React, { useMemo } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SizableText, YStack } from 'tamagui';
import { useI18n } from '~/composables/useI18n';
import { Service } from '~/realms/Service';
import { AllServices } from '~/shared/allServices';
import { getLogo } from '~/shared/logos';
import AboCard from './AboCard';

const { t } = useI18n();

interface AboItemProps {
  title: string;
  data: Service;
  className?: string;
  id: keyof AllServices;
}

const AboItem: React.FC<AboItemProps> = ({ title, data, id }) => {
  const renewsDate = useMemo(() => data.getPaymentDate(), [data]);
  const expiresDate = useMemo(() => data.getExpirationDate(), [data]);

  return (
    <Link asChild href={`/details/${id}`}>
      <AboCard backgroundColor="$blue6" pressStyle={{ backgroundColor: '$blue5' }}>
        <Image source={getLogo(id)} style={{ width: 60, height: 60 }} className="rounded-xl" />
        <YStack flex={1}>
          <SizableText size="$6">{title}</SizableText>
          {data.hasSubscriptions() && !data.areSomeCanceled() && (
            <SizableText theme="alt2" size="$2">
              {t('renews')} {renewsDate}
            </SizableText>
          )}
          {data.hasSubscriptions() && !data.areSomeActive() && (
            <SizableText theme="alt2" size="$1">
              {t('expires')} {expiresDate}
            </SizableText>
          )}
          {data.hasOnlyInactive() && (
            <SizableText theme="alt2" size="$2">
              {t('inactive')}
            </SizableText>
          )}
        </YStack>

        {data.hasSubscriptions() && !data.hasOnlyInactive() && (
          <YStack alignItems="flex-end">
            <SizableText>EUR {(data.getSubscriptionPrice() / 100).toFixed(2)}</SizableText>
            <SizableText theme="alt2" size="$1">
              {' '}
              / {t('month')}
            </SizableText>
          </YStack>
        )}

        <Icon name="angle-right" size={24} color="#000000" />
      </AboCard>
    </Link>
  );
};

export default AboItem;
