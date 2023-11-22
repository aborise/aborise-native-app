import { Service } from '~/realms/Service';
import { getRealm } from '~/realms/realm';
import { AllServices } from '~/shared/allServices';
import { useLargeUnsafeStorage, useStorage } from './useStorage';

export const getConnectedServiceIds = () => {
  const storage = useStorage('local');
  return storage.get<(keyof AllServices)[]>('connectedServices', []);
};

export const addConnectedService = (serviceId: keyof AllServices) => {
  return getRealm().write(() => {
    Service.create({
      id: serviceId,
    });
  });
};

export const deleteConnectedService = (serviceId: keyof AllServices) => {
  const largeStorage = useLargeUnsafeStorage();

  const service = getRealm().objectForPrimaryKey(Service, serviceId);

  getRealm().write(() => {
    service?.remove();
  });

  return Promise.all([
    largeStorage.delete(`services/${serviceId}/cookies`),
    largeStorage.delete(`services/${serviceId}/api`),
  ]);
};
