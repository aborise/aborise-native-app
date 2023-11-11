import { FlowResult } from '~/automations/playwright/helpers';
import { Storage, useStorage } from '~/composables/useStorage';
import { AllServices } from '~/shared/allServices';
import { getUserId } from '~/shared/ensureDataLoaded';

export const setFlowData = (
  service: keyof AllServices,
  data: FlowResult | undefined | null,
  storage: Storage = useStorage('synced', getUserId()),
) => {
  return storage.set(`services/${service}/data`, data);
};
