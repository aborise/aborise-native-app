import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { setFlowData } from '~/automations/api/helpers/data';
import { ActionResult } from '~/automations/helpers/helpers';
import { ActionReturn } from '~/automations/helpers/helpers';
import { useStorage } from '~/composables/useStorage';
import { AllServices } from '~/shared/allServices';

export const useServiceDataQuery = (serviceId: keyof AllServices) => {
  const storage = useStorage('local');
  const queryClient = useQueryClient();

  const serviceDataQuery = () =>
    useQuery({
      queryKey: ['servicesData', serviceId],
      queryFn: () => storage.get<ActionResult>(`services/${serviceId}/data`),
    });

  const serviceDataMutation = () =>
    useMutation({
      mutationFn: (val: ActionResult | null | undefined) => {
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
