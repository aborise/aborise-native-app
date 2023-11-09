import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addConnectedService,
  clearConnectedServices,
  deleteConnectedService,
  getConnectedServiceIds,
} from '~/composables/useServiceData';

export const useServicesQuery = () => {
  const queryClient = useQueryClient();

  const servicesQuery = () => useQuery({ queryKey: ['services'], queryFn: getConnectedServiceIds });

  const deleteServiceMutation = () =>
    useMutation({
      mutationFn: deleteConnectedService,
      onSuccess: () =>
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['services'] }),
          queryClient.invalidateQueries({ queryKey: ['servicesData'] }),
        ]),
    });

  const addServiceMutation = () =>
    useMutation({
      mutationFn: addConnectedService,
      onSuccess: () =>
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['services'] }),
          // queryClient.invalidateQueries({ queryKey: ['servicesData'] }),
        ]),
    });

  const clearServicesMutation = () =>
    useMutation({
      mutationFn: clearConnectedServices,
      onSuccess: () =>
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['services'] }),
          // queryClient.invalidateQueries({ queryKey: ['servicesData'] }),
        ]),
    });

  return {
    servicesQuery,
    deleteServiceMutation,
    addServiceMutation,
    clearServicesMutation,
  };
};
