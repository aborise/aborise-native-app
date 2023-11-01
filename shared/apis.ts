import { RequestTypeDone } from '~/automations/playwright/setup/Runner';
import { AsyncResult } from './Result';
import { Service } from './allServices';
import { BaseQueueItem } from './validators/queueItem';
import { ApiError } from '~/automations/api/helpers/client';

type toActionFns<U extends string> = {
  [K in U]: (item: BaseQueueItem) => AsyncResult<Partial<RequestTypeDone>, ApiError>;
}[U];

type Values<T> = T[keyof T];

export const getAction = <
  T extends Values<typeof import('~/automations/api/index')>,
  U extends Service['actions'][number]['name'],
>(
  obj: T,
  key: U,
): toActionFns<U> | undefined => {
  if (!obj[key as unknown as keyof T]) {
    console.log(key, 'is not implemented in', obj);
    return;
  }

  return obj[key as unknown as keyof T] as toActionFns<U>;
};
