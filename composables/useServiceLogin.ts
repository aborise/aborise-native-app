import { useEffect, useState } from 'react';
import { ApiError } from '~/automations/api/helpers/client';
import { AsyncResult, Err, Ok, wrapAsync } from '~/shared/Result';
import { AllServices, Service, services } from '~/shared/allServices';
import { getUserId } from '~/shared/ensureDataLoaded';
import { ERROR_CODES } from '~/shared/errors';
import { Storage, useStorage } from './useStorage';
import { useI18n } from './useI18n';

const dataIsValid = (data: any, service: Service): data is ArrayToRecord<(typeof service)['auth']> => {
  return data && typeof data === 'object' && service.auth.every((key) => data[key] !== '');
};

const { t } = useI18n();

type ArrayToRecord<T extends string[]> = { [K in T[number]]: string };

export const getServiceLogin = <T extends keyof AllServices>(
  serviceId: T,
  storage: Storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId()),
): AsyncResult<ArrayToRecord<AllServices[T]['auth']>, ApiError> => {
  const service = services[serviceId];

  return wrapAsync(
    storage
      .get(`services/${serviceId}/login`)
      .then((data) => {
        if (dataIsValid(data, service)) {
          return Ok(data);
        }

        return Err({
          custom: 'No login found',
          errorMessage: 'No login found',
          code: ERROR_CODES.NO_LOGIN_DATA,
          userFriendly: true,
          message: t('no-login-credentials-were-found-for-this-service-please-add-them-by-reconnecting-the-service'),
          statusCode: 400,
        } satisfies ApiError);
      })
      .catch((err) => {
        return Err({
          custom: 'Could not load login data',
          errorMessage: err.message,
          code: ERROR_CODES.LOAD_LOGIN_DATA_ERROR,
          userFriendly: true,
          message: t('there-was-an-error-loading-your-login-credentials-please-try-again'),
          statusCode: 500,
          stack: err.stack,
        } satisfies ApiError);
      }),
  );
};

export const useServiceLogin = <T extends keyof AllServices>(
  serviceId: T,
  storage: Storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId()),
) => {
  const service = services[serviceId];

  const [data, setData] = useState<{ [K in (typeof service.auth)[number]]: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    storage.get(`services/${serviceId}/login`).then((data) => {
      if (dataIsValid(data, service)) {
        setData(data);
      }
      setLoading(false);
    });
  }, []);

  const setLogin = (data: { [K in (typeof service.auth)[number]]: string }) => {
    setSaving(true);
    return storage.set(`services/${serviceId}/login`, data).then(() => {
      setData(data);
      setSaving(false);
    });
  };

  return { data, loading, saving, setData: setLogin };
};
