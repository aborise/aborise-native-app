import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Link } from 'expo-router/src/exports';
import React, { useMemo } from 'react';
import { Pressable, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SizableText, Text, XStack, YStack, styled } from 'tamagui';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
import { useDayJs, useI18n } from '~/composables/useI18n';
import { AllServices } from '~/shared/allServices';
import { getLogo } from '~/shared/logos';
import AboCard from './AboCard';

const dayjs = useDayJs();
const { t } = useI18n();

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
    () => (data.membershipStatus === 'active' ? dayjs(data.nextPaymentDate).format('MMM DD') : undefined),
    [data],
  );
  const expiresDate = useMemo(
    () => (data.membershipStatus === 'canceled' ? dayjs(data.expiresAt).format('MMM DD') : undefined),
    [data],
  );

  const { integer, decimal } = useMemo<{
    integer?: number;
    decimal?: number;
  }>(() => {
    return data.membershipStatus === 'active' ? data.nextPaymentPrice ?? {} : {};
  }, [data]);

  return (
    // <Link asChild href={`/details/${id}`}>
    <AboCard onPress={() => router.push(`/details/${id}`)} backgroundColor="$blue6">
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
        {data.membershipStatus === 'inactive' && <SizableText>{t('inactive')}</SizableText>}
      </YStack>

      {integer && (
        <>
          <SizableText>
            <SizableText size="$7">€{integer}.</SizableText>
            <SizableText size="$7">{decimal}</SizableText>
          </SizableText>
          <SizableText theme="alt2" size="$1">
            /month
          </SizableText>
          {/* <SizableText theme="alt2" size="$1">{t('next-payment')}</SizableText> */}
          {/* <SizableText theme="alt2" size="$1">{nextPaymentRelativeDate}</SizableText> */}
        </>
      )}

      <Icon name="angle-right" size={24} color="#000000" />
    </AboCard>
    // </Link>

    // <Link asChild href={`/details/${id}`}>
    //   <TouchableOpacity onLongPress={onContextMenu}>
    //     <View
    //       style={{
    //         flexDirection: 'row',
    //         justifyContent: 'space-between',
    //         alignItems: 'center',
    //         padding: 16,
    //         borderWidth: 2,
    //         borderColor: '#000',
    //         borderRadius: 16,
    //         gap: 16,
    //         marginBottom: 8,
    //         backgroundColor: '#fff',
    //         ...styles,
    //       }}
    //     >
    //       <Image source={getLogo(id)} style={{ width: 48, height: 48 }} className="rounded-xl" />
    //       <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
    //         <Text style={{ fontSize: 24 }}>{title}</Text>
    //         {renewsDate && (
    //           <Text style={{ fontSize: 12, color: 'gray' }}>
    //             {t('renews')}: {renewsDate}
    //           </Text>
    //         )}
    //         {expiresDate && (
    //           <Text style={{ fontSize: 12, color: 'gray' }}>
    //             {t('expires')}: {expiresDate}
    //           </Text>
    //         )}
    //         {data.membershipStatus === 'inactive' && (
    //           <Text style={{ fontSize: 12, color: 'gray' }}>{t('inactive')}</Text>
    //         )}
    //       </View>
    //       <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
    //         {integer && (
    //           <>
    //             <Text style={{ fontSize: 24 }}>
    //               <Text>€{integer}.</Text>
    //               <Text>{decimal}</Text>
    //             </Text>
    //             <Text style={{ fontSize: 12, color: 'gray' }}>{t('next-payment')}</Text>
    //             <Text style={{ fontSize: 10, color: 'gray' }}>{nextPaymentRelativeDate}</Text>
    //           </>
    //         )}
    //       </View>
    //       <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
    //         <Icon name="angle-right" size={24} color="#000000" />
    //       </View>
    //     </View>
    //   </TouchableOpacity>
    // </Link>
  );
};

export default AboItem;
