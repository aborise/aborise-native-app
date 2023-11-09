import { useQueries, useQuery } from '@tanstack/react-query';
import { useServicesQuery } from './useServicesQuery';
import { useStorage } from '~/composables/useStorage';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
import { AllServices } from '~/shared/allServices';
import { useEffect } from 'react';

export const useServicesDataQuery = () => {
  const storage = useStorage('local');
  const { servicesQuery } = useServicesQuery();

  const { data: serviceIds } = servicesQuery();

  return useQuery({
    enabled: !!serviceIds,
    queryFn: async (query) => {
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
    },
    queryKey: ['servicesData', serviceIds],
  });
};
