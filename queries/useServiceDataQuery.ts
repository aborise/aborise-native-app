import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
import { useStorage } from '~/composables/useStorage';

export const useServiceDataQuery = (serviceId: string) => {
  const storage = useStorage('local');
  const queryClient = useQueryClient();

  const serviceDataQuery = () =>
    useQuery({
      queryKey: ['servicesData', serviceId],
      queryFn: () => storage.get<FlowReturn['data']>(`services/${serviceId}/data`),
    });

  const serviceDataMutation = () =>
    useMutation({
      mutationFn: (val: FlowReturn['data']) => {
        return storage.set(`services/${serviceId}/data`, val);
      },
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: ['servicesData'],
        }),
    });

  return {
    serviceDataQuery,
    serviceDataMutation,
  };
};
