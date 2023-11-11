import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { setFlowData } from '~/automations/api/helpers/data';
import { FlowResult } from '~/automations/playwright/helpers';
import { FlowReturn } from '~/automations/playwright/setup/Runner';
import { useStorage } from '~/composables/useStorage';
import { AllServices } from '~/shared/allServices';

export const useServiceDataQuery = (serviceId: keyof AllServices) => {
  const storage = useStorage('local');
  const queryClient = useQueryClient();

  const serviceDataQuery = () =>
    useQuery({
      queryKey: ['servicesData', serviceId],
      queryFn: () => storage.get<FlowResult>(`services/${serviceId}/data`),
    });

  const serviceDataMutation = () =>
    useMutation({
      mutationFn: (val: FlowResult | null | undefined) => {
        return setFlowData(serviceId, val);
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
