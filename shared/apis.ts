import { ApiError } from '~/automations/api/helpers/client';
import { AsyncResult } from './Result';
import { AllServices, Service } from './allServices';
import { ApiResult } from '~/automations/helpers/helpers';

type toActionFns<U extends string> = {
  [K in U]: (action: K, service: keyof AllServices) => AsyncResult<ApiResult, ApiError>;
}[U];

type Values<T> = T[keyof T];

export const getAction = <
  T extends Values<typeof import('~/automations/api/index')>,
  U extends Service['actions'][number]['name'],
>(
  obj: T,
  key: U,
) => {
  if (!obj || !obj[key as unknown as keyof T]) {
    console.log(key, 'is not implemented in', obj);
    return;
  }

  return (obj[key as unknown as keyof T] as toActionFns<U>).bind(null, key);
};
