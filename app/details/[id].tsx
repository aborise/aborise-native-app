import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useServiceData } from '~/composables/useServiceData';
import { AllServices, Service, services } from '~/shared/allServices';

const Details: React.FC = () => {
  const local = useLocalSearchParams<{ id: keyof AllServices }>();
  const service = useMemo(() => {
    return services[local.id!];
  }, [local.id]);

  const { value: serviceData, loading, error } = useServiceData(service.id);

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
    // handle action
  };

  const deleteSubscription = () => {
    // delete subscription logic
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
          <Image source={{ uri: service.logo }} style={styles.logo} />
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
      </View>
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
