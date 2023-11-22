import * as apis from '~/automations/api/index';
import { Service } from '~/shared/allServices';
import { getAction } from '~/shared/apis';
import { useI18n } from './useI18n';

const { t } = useI18n();

export const useServiceRefresh = () => {
  const onRefresh = async (service: Service) => {
    return getAction(apis[service.id], 'connect')!(service.id);
  };

  return {
    onRefresh,
  };
};
