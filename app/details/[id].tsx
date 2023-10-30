import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as apis from '~/automations/api/index';
import { useServiceDataQuery } from '~/queries/useServiceDataQuery';
import { useServicesQuery } from '~/queries/useServicesQuery';
import { AllServices, Service, services } from '~/shared/allServices';
import { getUserId } from '~/shared/ensureDataLoaded';
import { getLogo } from '~/shared/logos';

const confirmDelete = (serviceTitle: string, cb: () => void) =>
  Alert.alert(
    'Deleting ' + serviceTitle,
    `Are you sure you want to remove ${serviceTitle}? All data will be deleted and you will need to reconnect again.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: 'OK', onPress: cb },
    ],
  );

const confirmAction = (serviceTitle: string, action: string, cb: () => void) =>
  Alert.alert('Confirm ' + action, `Are you sure you want to ${action} ${serviceTitle}?`, [
    {
      text: 'Cancel',
      style: 'cancel',
    },
    { text: 'OK', onPress: cb },
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

  const handleAction = (serviceId: keyof AllServices, action: Service['actions'][number]) => {
    confirmAction(service.title, action.name, () => {
      setExecuting(true);

      apis[serviceId][action.name]({
        queueId: 'foo',
        service: serviceId,
        type: action.name,
        user: getUserId(),
      })
        .then(async (res) => {
          await queryClient.invalidateQueries({ queryKey: ['services'] });
          setExecuting(false);
          if (res.ok) {
            if (res.val.data?.membershipStatus === 'active') {
              console.log(res.val.data.nextPaymentDate);
            } else if (res.val.data?.membershipStatus === 'canceled') {
              console.log(res.val.data.expiresAt);
            } else if (res.val.data?.membershipStatus === 'inactive') {
              console.log(res.val.data.membershipStatus);
            }
            router.push(`/`);
          } else {
            setActionError(res.val.message);
            console.log(res.val.history);
          }
        })
        .catch((err) => {
          setExecuting(false);
          console.log(err);
        });
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
      <View style={styles.flexContainer}>
        {/* First Column */}
        <View style={styles.firstColumn}>
          <Image source={getLogo(service.id)} style={styles.logo} className="rounded-3xl" />
          <View style={styles.syncBox}>
            <Text style={styles.syncText}>Synchronised</Text>
          </View>
          <Text style={styles.lastSyncDateText}>Last updated: {lastSyncDate}</Text>
        </View>
        {/* Second Column */}
        <View style={styles.secondColumn}>
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
        </View>
      </View>
      {/* Second Section */}
      <View style={[styles.flexContainer, styles.flexColumn]}>
        <View style={styles.flexItemsCenter}>
          <Text style={styles.textLg}>Next Payment</Text>
          <Text style={[styles.textBase, styles.ml4]}>{nextPaymentDate}</Text>
        </View>
      </View>

      {/* Third Section */}
      <View style={[styles.flexContainer, styles.flexColumn]}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.btn, styles.btnResume, styles.mb2]}
            onPress={() => handleAction(service.id, action)}
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
    </>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  firstColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  syncBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
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
