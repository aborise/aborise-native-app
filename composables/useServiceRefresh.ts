import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-root-toast';
import { getAction } from '~/shared/apis';
import { getUserId } from '~/shared/ensureDataLoaded';
import { useI18n } from './useI18n';
import { AllServices, Service } from '~/shared/allServices';
import { useCallback } from 'react';
import * as apis from '~/automations/api/index';

const { t } = useI18n();

export const useServiceRefresh = () => {
  const onRefresh = async (service: Service) => {
    return getAction(apis[service.id], 'connect')!(service.id);
  };

  return {
    onRefresh,
  };
};
