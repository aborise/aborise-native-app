import { getDatabase, ref, set, update } from 'firebase/database';
import { FlowResult } from '~/automations/playwright/helpers';
import { useFirebaseApp } from '~/composables/useFirebase';
import { Storage, useStorage } from '~/composables/useStorage';
import { AllServices } from '~/shared/allServices';
import { getUserId } from '~/shared/ensureDataLoaded';

export const setFlowData = (
  service: keyof AllServices,
  data: FlowResult,
  storage: Storage = useStorage('synced', getUserId()),
) => {
  return storage.set(`services/${service}/data`, data);
};
