import { AllServices } from '~/shared/allServices';
import { useStorage } from './useStorage';
import CookieManager from '@react-native-cookies/cookies';

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
      return storage.set('connectedServices', [...connect, serviceId]);
    }
  });
};

export const deleteConnectedService = (serviceId: keyof AllServices) => {
  const storage = useStorage('local');
  return storage
    .get<Array<keyof AllServices>>('connectedServices', [])
    .then((connect) => {
      if (connect.includes(serviceId)) {
        return storage.set(
          'connectedServices',
          connect.filter((id) => id !== serviceId),
        );
      }
    })
    .then(() => storage.delete(`services/${serviceId}/data`))
    .then(() => storage.delete(`services/${serviceId}/cookies`));
};

export const clearConnectedServices = () => {
  const storage = useStorage('local');
  return storage
    .get('connectedServices', [])
    .then((connect) => {
      return Promise.all(
        connect.map(async (serviceId) => {
          await storage.delete(`services/${serviceId}/data`);
          await storage.delete(`services/${serviceId}/cookies`);
        }),
      );
    })
    .then(() => {
      return storage.delete('connectedServices');
    });
};
