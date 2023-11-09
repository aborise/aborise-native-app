import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack as ExpoStack, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button, ScrollView, SizableText, Stack, XStack, YStack } from 'tamagui';
import * as apis from '~/automations/api/index';
import * as webviews from '~/automations/webview/index';
import AboDetails from '~/components/details/AboDetails';
import { useDayJs, useI18n } from '~/composables/useI18n';
import { useServiceDataQuery } from '~/queries/useServiceDataQuery';
import { useServicesQuery } from '~/queries/useServicesQuery';
import { AllServices, services } from '~/shared/allServices';
import { getAction } from '~/shared/apis';
import { getUserId } from '~/shared/ensureDataLoaded';
import { ERROR_CODES } from '~/shared/errors';
import { getLogo } from '~/shared/logos';
import { Service } from '~/shared/validators';
import { useServiceLogin } from '~/composables/useServiceLogin';

const { t } = useI18n();
const dayjs = useDayJs();

type WebViewConfigKeys = keyof typeof webviews;
type WebViewConfigActionNames = keyof (typeof webviews)[WebViewConfigKeys];

type ActionsWithUrl<
  T extends AllServices[keyof AllServices]['actions'][number] = AllServices[keyof AllServices]['actions'][number],
> = T extends { url: string } ? T : never;

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

const confirmAction = (serviceTitle: string, action: string, cb: () => void) =>
  Alert.alert(t('confirm-X', [t(action)]), t('are-you-sure-you-want-to-X-Y', [t(action), serviceTitle]), [
    {
      text: t('cancel2'),
      style: 'cancel',
    },
    { text: t('confirm'), onPress: cb },
  ]);

const Details: React.FC = () => {
  const [executing, setExecuting] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>(undefined);

  const local = useLocalSearchParams<{ id: keyof AllServices }>();
  const service = useMemo(() => {
    return services[local.id!];
  }, [local.id]);

  const { t } = useI18n();

  const queryClient = useQueryClient();
  const { deleteServiceMutation } = useServicesQuery();
  const { mutateAsync: deleteConnectedService } = deleteServiceMutation();
  const { serviceDataQuery } = useServiceDataQuery(service.id);
  const { data: serviceData, isLoading, error } = serviceDataQuery();
  const { data: login } = useServiceLogin(service.id);
  const [menuVisible, setMenuVisible] = useState(false);
  const height = useHeaderHeight();

  const lastSyncDate = useMemo(
    () => dayjs(serviceData?.lastSyncedAt ?? new Date()).format('DD.MM.YYYY'),
    [serviceData?.lastSyncedAt],
  );

  const actions = useMemo(
    () =>
      service?.actions.filter(
        (action) =>
          action.states.includes(serviceData?.membershipStatus as never) ||
          process.env.EXPO_PUBLIC_SHOW_ALL_ACTIONS === 'true',
      ),
    [service?.actions, serviceData?.membershipStatus],
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    getAction(
      apis[service.id],
      'connect',
    )?.({
      type: 'connect',
      service: service.id,
      user: getUserId(),
      queueId: 'foo',
    })
      .then((res) => {
        if (res.ok) {
          Toast.show(t('updated'), { duration: Toast.durations.SHORT });
        } else {
          console.error(res.val);
          Toast.show(t('error-while-updating'), { duration: Toast.durations.SHORT });
        }
      })
      .finally(async () => {
        setRefreshing(false);
        await queryClient.invalidateQueries({ queryKey: ['services'] });
        await queryClient.invalidateQueries({ queryKey: ['servicesData'] });
      });
  }, []);

  const handleWebViewActions = async (serviceId: keyof AllServices, actionName: Service['actions'][number]['name']) => {
    router.push(`/details/${serviceId}/webview/${actionName}`);
  };

  const handleAction = (serviceId: keyof AllServices, action: Service['actions'][number]) => {
    confirmAction(service.title, action.name, async () => {
      if (action.type === 'api') return;

      if (action.webView) {
        return handleWebViewActions(serviceId, action.name);
      }

      setExecuting(true);

      const api = apis[serviceId];

      const actionHandler = getAction(
        api,
        action.name as import('~/shared/allServices').Service['actions'][number]['name'],
      );

      if (!actionHandler) return;

      const res = await actionHandler({
        queueId: 'foo',
        service: serviceId,
        type: action.name,
        user: getUserId(),
      });

      await queryClient.invalidateQueries({ queryKey: ['services'] });
      await queryClient.invalidateQueries({ queryKey: ['servicesData'] });

      setExecuting(false);

      if (res.ok) {
        return;
      }

      const err = res.val;

      // Special handling for inactive accounts that want to resume -> let them reactivate
      if (err.code === ERROR_CODES.INVALID_MEMBERSHIP_STATUS && action.name === 'resume') {
        return Alert.alert(
          t('invalid-membership-status'),
          t('it-seems-like-your-account-is-inactive-do-you-want-to-reactivate-it') + '?',
          [
            {
              text: t('cancel2'),
              style: 'cancel',
            },
            { text: t('confirm'), onPress: () => handleWebViewActions(serviceId, 'reactivate') },
          ],
        );
      }

      Toast.show(res.val.message, { duration: Toast.durations.LONG });
    });
  };

  const deleteSubscription = () => {
    confirmDelete(service.title, () => {
      deleteConnectedService(service.id).then(() => {
        router.push('/');
      });
    });
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

        <Stack p="$4" bg="white" borderRadius="$4">
          <AboDetails serviceData={serviceData} />
        </Stack>

        {/* Third Section */}
        <YStack space="$1">
          {actions.map((action, index) => (
            <Button key={index} size="$6" onPress={() => handleAction(service.id, action)} bg="$green7">
              <SizableText>{t(action.name)}</SizableText>
            </Button>
          ))}
        </YStack>

        {executing && (
          <View
            style={{
              // @ts-expect-error
              ...StyleSheet.absoluteFill,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        )}
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
