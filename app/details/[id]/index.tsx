import { useHeaderHeight } from '@react-navigation/elements';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack as ExpoStack, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button, ScrollView, SizableText, Stack, XStack, YStack } from 'tamagui';

import AboDetails from '~/components/details/AboDetails';
import { toDisplayDate, useDayJs, useI18n } from '~/composables/useI18n';
import { useServiceLogin } from '~/composables/useServiceLogin';
import { AllServices, services } from '~/shared/allServices';
import { getLogo } from '~/shared/logos';

import { useServiceRefresh } from '~/composables/useServiceRefresh';
import { Service } from '~/realms/Service';
import { useObject, useQuery } from '~/realms/realm';
import { getAction } from '~/shared/apis';

import * as apis from '~/automations/api/index';
import { Service as ServiceDefinition } from '~/shared/validators';

import analytics from '@react-native-firebase/analytics';
import Feedback from '~/components/Feedback';

const { t } = useI18n();
const dayjs = useDayJs();

const confirmDelete = (serviceTitle: string, cb: () => void) =>
  Alert.alert(
    t('deleting-X', [serviceTitle]),
    t('are-you-sure-you-want-to-remove-X-all-data-will-be-deleted-and-you-will-need-to-reconnect-again', [
      serviceTitle,
    ]),
    [
      {
        text: t('cancel2'),
        style: 'cancel',
      },
      { text: t('confirm'), onPress: cb },
    ],
  );

const Details: React.FC = () => {
  const [actionError, setActionError] = useState<string | undefined>(undefined);

  const local = useLocalSearchParams<{ id: keyof AllServices }>();
  const service = useMemo(() => {
    return services[local.id!];
  }, [local.id]);

  const { t } = useI18n();

  const queryClient = useQueryClient();
  // const serviceData = useObject(Service, local.id!);

  const serviceData: Service | null = useQuery(Service).filtered('id == $0', local.id)[0];

  const { data: login } = useServiceLogin(service.id);
  const [menuVisible, setMenuVisible] = useState(false);
  const height = useHeaderHeight();

  const lastSyncDate = useMemo(() => toDisplayDate(serviceData?.lastSyncedAt), [serviceData?.lastSyncedAt]);

  const [refreshing, setRefreshing] = useState(false);

  const { onRefresh: onRefreshBase } = useServiceRefresh();

  const onRefresh = useCallback(() => {
    analytics().logEvent('refresh', { service: local.id });
    setRefreshing(true);
    onRefreshBase(service)
      .then((res) => {
        if (res.ok) {
          Toast.show(t('updated'), { duration: Toast.durations.SHORT });
        } else {
          console.log(res.val);
          Toast.show(t('error-while-updating') + ' / ' + res.val.message, { duration: Toast.durations.SHORT });
        }
      })
      .finally(async () => {
        setRefreshing(false);
        await queryClient.invalidateQueries({ queryKey: ['services'] });
        await queryClient.invalidateQueries({ queryKey: ['servicesData'] });
      });
  }, []);

  const deleteSubscription = () => {
    confirmDelete(service.title, () => {
      analytics().logEvent('delete', { service: local.id });
      serviceData?.$remove();
      router.push('/');
    });
  };

  const reactivate = async () => {
    analytics().logEvent('reactivate', { service: local.id });

    const action = service.actions.find((a) => a.name === 'reactivate') as ServiceDefinition['actions'][number];

    if (action.type === 'api') return;

    if (action.webView) {
      return router.push(`/details/${local.id}/webview/${action.name}`);
    }

    const api = apis[service.id];
    const actionHandler = getAction(
      api,
      'reactivate' as import('~/shared/allServices').Service['actions'][number]['name'],
    );
    actionHandler?.(service.id);
  };

  if (!service || !serviceData) {
    return (
      <Stack>
        <SizableText>{t('service-not-found')}</SizableText>
      </Stack>
    );
  }

  return (
    <>
      <ExpoStack.Screen
        options={{
          title: service.title,
          headerRight: () => (
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <View style={{ aspectRatio: '1/1', justifyContent: 'center', alignItems: 'center' }}>
                <Icon name="ellipsis-h" size={24} color="#000000" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} px="$4" space>
        <Modal
          animationType="fade"
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <Stack onPress={() => setMenuVisible(false)} flex={1}>
            <YStack pos="absolute" t={height / 2} r="$1" bc="white" br="$1" elevation={4}>
              <TouchableOpacity onPress={() => (onRefresh(), setMenuVisible(false))}>
                <SizableText style={styles.menuItem}>Refresh</SizableText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => (deleteSubscription(), setMenuVisible(false))}>
                <SizableText style={styles.menuItem}>Delete</SizableText>
              </TouchableOpacity>
            </YStack>
          </Stack>
        </Modal>

        <XStack flex={1} space borderRadius="$4">
          <YStack>
            <Image source={getLogo(service.id)} style={styles.logo} className="rounded-3xl"></Image>
          </YStack>
          <YStack ai="flex-start" gap="$1" jc="center">
            <Stack bg="$green8" px="$2" br="$1">
              <SizableText size="$6">{t('connected')}</SizableText>
            </Stack>

            {login?.email ? (
              <SizableText>
                {t('account')}: {login.email}
              </SizableText>
            ) : null}

            <SizableText size={'$2'} color="$gray10">
              {t('last-updated')}: {lastSyncDate}
            </SizableText>
          </YStack>
        </XStack>

        <Feedback />

        <YStack space>
          {serviceData.subscriptions.map((sub) => (
            <AboDetails subscription={sub} key={sub.id} />
          ))}

          {!serviceData.subscriptions.length && (
            <>
              <SizableText>You dont have an active subscription at {service.title}</SizableText>
              {service.actions.some((a) => a.name === 'reactivate') && <Button onPress={reactivate}>Activate</Button>}
            </>
          )}
        </YStack>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    margin: 16,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  firstColumn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  syncBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4e4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  syncText: {
    fontSize: 12,
  },
  lastSyncDateText: {
    fontSize: 12,
    marginTop: 8,
  },
  secondColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  thirdColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-evenly',
  },
  statusBox: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFF',
  },
  priceText: {
    fontSize: 16,
    marginTop: 8,
    paddingTop: 4,
  },
  decimalText: {
    fontSize: 12,
    lineHeight: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  btnCancel: {
    backgroundColor: '#f44336',
    color: '#FFF',
  },
  btnResume: {
    backgroundColor: '#4caf50',
    color: '#FFF',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexItemsCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textLg: {
    fontSize: 18,
  },
  textBase: {
    fontSize: 16,
  },
  ml2: {
    marginLeft: 8,
  },
  mb2: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menu: {
    width: 150,
    backgroundColor: 'white',
    borderRadius: 5,
    overflow: 'hidden',
    elevation: 5, // for android shadow
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
});

export default Details;
