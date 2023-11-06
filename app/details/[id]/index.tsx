import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as apis from '~/automations/api/index';
import * as webviews from '~/automations/webview/index';
import { useI18n, useDayJs } from '~/composables/useI18n';
import { useServiceDataQuery } from '~/queries/useServiceDataQuery';
import { useServicesQuery } from '~/queries/useServicesQuery';
import { AllServices, services } from '~/shared/allServices';
import { getAction } from '~/shared/apis';
import { getUserId } from '~/shared/ensureDataLoaded';
import { ERROR_CODES } from '~/shared/errors';
import { getLogo } from '~/shared/logos';
import { billingCycle } from '~/shared/translationMapping';
import { Service, State } from '~/shared/validators';

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

  const lastSyncDate = useMemo(
    () => dayjs(serviceData?.lastSyncedAt ?? new Date()).format('DD.MM.YYYY'),
    [serviceData?.lastSyncedAt],
  );

  const nextPaymentDate = useMemo(() => {
    if (serviceData?.membershipStatus !== 'active') return;
    return dayjs(serviceData.nextPaymentDate ?? 0).format('DD.MM.YYYY');
  }, [serviceData?.membershipStatus === 'active' && serviceData.nextPaymentDate]);

  const expiresRelativeDate = useMemo(() => {
    if (serviceData?.membershipStatus !== 'canceled') return;
    return dayjs(serviceData.expiresAt ?? 0).fromNow();
  }, [serviceData?.membershipStatus === 'canceled' && serviceData.expiresAt]);

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

      setActionError(res.val.message);
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
      <View>
        <Text>{t('service-not-found')}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: service.title,
        }}
      />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.flexContainer}>
          {/* First Column */}
          <View style={styles.firstColumn}>
            <Image source={getLogo(service.id)} style={styles.logo} className="rounded-3xl" />
          </View>
          {/* Second Column */}
          <View style={styles.secondColumn}>
            <View style={styles.syncBox}>
              <Text style={styles.syncText}>{t('connected')}</Text>
            </View>
            <Text style={styles.lastSyncDateText}>
              {t('last-updated')}: {lastSyncDate}
            </Text>
          </View>
          <View style={styles.thirdColumn}>
            <Icon name="edit" size={24} color="#667160" />
            <Icon name="refresh" size={24} color="#667160" />
            <Icon name="unlink" size={24} color="#667160" />
          </View>
        </View>
        {/* Second Section */}
        <View style={[styles.flexContainer, styles.flexColumn]}>
          {/* Render based on membershipStatus */}
          {serviceData.membershipStatus === 'active' ? (
            <>
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>Plan: {serviceData.membershipPlan ?? 'Basic'}</Text>
              </View>
              <Text style={styles.priceText}>
                {serviceData.nextPaymentPrice?.integer}.
                <Text style={styles.decimalText}>{serviceData.nextPaymentPrice?.decimal}</Text> /{' '}
                {billingCycle[serviceData.billingCycle ?? 'monthly']}
              </Text>
            </>
          ) : serviceData.membershipStatus === 'canceled' ? (
            <>
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>
                  {t('canceled')}: {serviceData.membershipPlan ?? 'Basic'}
                </Text>
              </View>
              <Text style={styles.priceText}>
                {serviceData.nextPaymentPrice?.integer}.
                <Text style={styles.decimalText}>{serviceData.nextPaymentPrice?.decimal}</Text> /{' '}
                {billingCycle[serviceData.billingCycle ?? 'monthly']}
              </Text>
              <Text style={styles.flexItemsCenter}>
                {t('expires')} {expiresRelativeDate}
              </Text>
            </>
          ) : (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>{t('inactive')}</Text>
            </View>
          )}
          {serviceData.membershipStatus === 'active' ? (
            <View style={styles.flexItemsCenter}>
              <Text style={styles.textBase}>{t('next-payment')}:</Text>
              <Text style={[styles.textBase, styles.ml2]}>{nextPaymentDate}</Text>
            </View>
          ) : null}
        </View>

        {/* Third Section */}
        <View style={[styles.flexContainer, styles.flexColumn]}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.btn, styles.btnResume, styles.mb2]}
              onPress={() => handleAction(service.id, action)}
            >
              <Text>{t(action.name)}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.btn, styles.btnCancel, styles.mb2]} onPress={deleteSubscription}>
            <Text>{t('delete')}</Text>
          </TouchableOpacity>
          {actionError ? (
            <View>
              <Text>{actionError}</Text>
            </View>
          ) : null}
        </View>
        {/* Fourth Section */}

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
});

export default Details;
