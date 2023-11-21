import { ActionResult } from '~/automations/helpers/helpers';
import { Storage, useStorage } from '~/composables/useStorage';
import { AllServices } from '~/shared/allServices';
import { getUserId } from '~/shared/ensureDataLoaded';

export const setFlowData = (
  service: keyof AllServices,
  data: ActionResult | undefined | null,
  storage: Storage = useStorage('synced', getUserId()),
) => {
  return storage.set(`services/${service}/data`, data);
};
