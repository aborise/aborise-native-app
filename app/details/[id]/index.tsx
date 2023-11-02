import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Cookie } from 'playwright-core';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/FontAwesome';
import WebView from 'react-native-webview';
import { cookiesToString, getCookies } from '~/automations/api/helpers/cookie';
import * as apis from '~/automations/api/index';
import { useServiceDataQuery } from '~/queries/useServiceDataQuery';
import { useServicesQuery } from '~/queries/useServicesQuery';
import { AllServices, Service, services } from '~/shared/allServices';
import { getAction } from '~/shared/apis';
import { getUserId } from '~/shared/ensureDataLoaded';
import { ERROR_CODES } from '~/shared/errors';
import { getLogo } from '~/shared/logos';

type ActionsWithUrl<
  T extends AllServices[keyof AllServices]['actions'][number] = AllServices[keyof AllServices]['actions'][number],
> = T extends { url: string } ? T : never;

const INJECTED_JAVASCRIPT = `(function() {
  window.ReactNativeWebView.postMessage(JSON.stringify(window.location));
})();`;

const confirmDelete = (serviceTitle: string, cb: () => void) =>
  Alert.alert(
    'Deleting ' + serviceTitle,
    `Are you sure you want to remove ${serviceTitle}? All data will be deleted and you will need to reconnect again.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'Confirm', onPress: cb },
    ],
  );

const confirmAction = (serviceTitle: string, action: string, cb: () => void) =>
  Alert.alert('Confirm ' + action, `Are you sure you want to ${action} ${serviceTitle}?`, [
    {
      text: 'Cancel',
      style: 'cancel',
    },
    { text: 'Confirm', onPress: cb },
  ]);

const Details: React.FC = () => {
  const [executing, setExecuting] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>(undefined);

  const local = useLocalSearchParams<{ id: keyof AllServices }>();
  const service = useMemo(() => {
    return services[local.id!];
  }, [local.id]);

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
    () => service?.actions.filter((action) => !['register', 'connect'].includes(action.name)),
    [service?.actions],
  );

  const [webviewUrl, setWebviewUrl] = useState<string>();
  const [webviewCookies, setWebviewCookies] = useState<Cookie[]>([]);

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
          Toast.show('Updated', { duration: Toast.durations.SHORT });
        } else {
          console.error(res.val);
          Toast.show('Error while updating', { duration: Toast.durations.SHORT });
        }
      })
      .finally(() => {
        setRefreshing(false);
        queryClient.invalidateQueries({ queryKey: ['servicesData', local.id!] });
      });
  }, []);

  const handleReactivate = async (serviceId: keyof AllServices) => {
    router.push(`/details/${serviceId}/webview`);
  };

  const handleWebViewMessage = (event: any) => {
    console.log('event', event.nativeEvent.data);
  };

  const handleAction = (serviceId: keyof AllServices, actionName: Service['actions'][number]['name']) => {
    confirmAction(service.title, actionName, async () => {
      if (actionName === 'reactivate') {
        return handleReactivate(serviceId);
      }

      setExecuting(true);

      const api = apis[serviceId];

      const action = getAction(api, actionName);

      if (!action) return;

      const res = await action({
        queueId: 'foo',
        service: serviceId,
        type: actionName,
        user: getUserId(),
      });

      await queryClient.invalidateQueries({ queryKey: ['services'] });

      setExecuting(false);

      if (res.ok) {
        console.log(res.val.data);
        return router.push(`/`);
      }

      const err = res.val;

      // Special handling for inactive accounts that want to resume -> let them reactivate
      if (err.code === ERROR_CODES.INVALID_MEMBERSHIP_STATUS && actionName === 'resume') {
        return Alert.alert(
          'Invalid membership status',
          'It seems like your account is inactive. Do you want to reactivate it?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            { text: 'Confirm', onPress: () => handleReactivate(serviceId) },
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
        <Text>Service not found</Text>
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
              <Text style={styles.syncText}>Connected</Text>
            </View>
            <Text style={styles.lastSyncDateText}>Last updated: {lastSyncDate}</Text>
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
                {serviceData.billingCycle ?? 'monthly'}
              </Text>
            </>
          ) : serviceData.membershipStatus === 'canceled' ? (
            <>
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>Canceled</Text>
              </View>
              <Text style={styles.priceText}>Expires {expiresRelativeDate}</Text>
            </>
          ) : (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>Inactive</Text>
            </View>
          )}
          <View style={styles.flexItemsCenter}>
            <Text style={styles.textBase}>Next Payment</Text>
            <Text style={[styles.textBase, styles.ml4]}>{nextPaymentDate}</Text>
          </View>
        </View>

        {/* Third Section */}
        <View style={[styles.flexContainer, styles.flexColumn]}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.btn, styles.btnResume, styles.mb2]}
              onPress={() => handleAction(service.id, action.name)}
            >
              <Text>{action.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.btn, styles.btnCancel, styles.mb2]} onPress={deleteSubscription}>
            <Text>Delete</Text>
          </TouchableOpacity>
          <View>
            <Text>{actionError}</Text>
          </View>
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
    marginTop: 16,
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
  ml4: {
    marginLeft: 16,
  },
  mb2: {
    marginBottom: 8,
  },
});

export default Details;
