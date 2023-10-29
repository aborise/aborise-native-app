import { AllServices } from '~/shared/allServices';
import { useStorage } from './useStorage';
import { getUserId } from '~/shared/ensureDataLoaded';
import { useEffect, useState } from 'react';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
import { useAsyncState, useAsyncStateReadonly } from './useAsyncState';

export const useServiceData = <T extends keyof AllServices>(serviceId: T) => {
  const storage = useStorage('synced', getUserId());
  return useAsyncState(
    () => {
      return storage.get<FlowReturn['data']>(`services/${serviceId}/data`);
    },
    [serviceId],
    (val) => {
      return storage.set(`${serviceId}/data`, val);
    },
  );
};

export const getConnectedServiceIds = () => {
  const storage = useStorage('local');
  return storage.get<(keyof AllServices)[]>('connectedServices', []);
};

export const addConnectedService = (serviceId: keyof AllServices) => {
  // Always use local storage for this
  // We dont need to sync this
  const storage = useStorage('local');
  return storage.get<Array<keyof AllServices>>('connectedServices', []).then((connect) => {
    if (!connect.includes(serviceId)) {
      storage.set('connectedServices', [...connect, serviceId]);
    }
  });
};

export const clearConnectedServices = () => {
  const storage = useStorage('local');
  return storage.delete('connectedServices');
};

export const useConnectedServiceIds = () => {
  return useAsyncStateReadonly(getConnectedServiceIds, []);
};

export const useConnectedServiceData = () => {
  const { value: serviceIds } = useConnectedServiceIds();
  const storage = useStorage('local', getUserId());
  const loader = async () => {
    if (!serviceIds) return {};
    const entries = await Promise.all(
      serviceIds.map(async (serviceId) => [
        serviceId,
        await storage.get<FlowReturn['data']>(`services/${serviceId}/data`),
      ]),
    );

    const entriesFiltered = entries.filter(([, val]) => !!val);
    return Object.fromEntries(entriesFiltered) as Partial<{
      [K in keyof AllServices]: FlowReturn['data'];
    }>;
  };

  return useAsyncStateReadonly(loader, [serviceIds]);
};
