import type { FlowReturn, RequestTypeDone } from '~/automations/playwright/setup/Runner';
import { getServiceLogin } from '~/composables/useServiceLogin';
import { Storage, useStorage } from '~/composables/useStorage';
import type { AsyncResult } from '~/shared/Result';
import { AllServices } from '~/shared/allServices';
import type { BaseQueueItem } from '~/shared/validators/queueItem';
import { BaseError } from './BaseError';
import { Session, type ApiError } from './client';
import { setCookies } from './cookie';
import { setFlowData } from './data';
import { addConnectedService } from '~/composables/useServiceData';

// globalThis.process = globalThis.process ?? {};

const sanitizeDebug = (debug: Record<string, unknown> = {}) => {
  // loop recursively through the object and sanitize all keys
  // they cant contain ".", "#", "$", "/", "[", or "]"

  const keys = Object.keys(debug);
  for (const key of keys) {
    const sanitized = key.replace(/\.|#|\$|\/|\[|\]/g, '_');
    if (key !== sanitized) {
      debug[sanitized] = debug[key];
      delete debug[key];
    }

    debug[sanitized] = debug[sanitized] ?? null;

    if (typeof debug[sanitized] === 'object' && debug[sanitized] !== null) {
      debug[sanitized] = sanitizeDebug(debug[sanitized] as Record<string, unknown>);
    }
  }

  return debug;
};

type ApiCallback = (options: {
  item: BaseQueueItem;
  auth: Record<string, string>;
  client: Session;
  storage: Storage;
}) => AsyncResult<Partial<FlowReturn>, ApiError>;

type ApiOptions = {
  storage?: Storage;
};

export const api = (
  cb: ApiCallback,
  { storage = useStorage('local') }: ApiOptions = {},
): ((item: BaseQueueItem) => AsyncResult<Partial<RequestTypeDone>, BaseError>) => {
  return (item: BaseQueueItem) => {
    return getServiceLogin(item.service).andThen((login) => {
      const client = new Session();
      const result = cb({ item, auth: login, client, storage });

      return result
        .map(async (flowReturn) => {
          if (flowReturn.cookies) {
            await setCookies(item.service, flowReturn.cookies, storage);
          }

          if (flowReturn.data) {
            await setFlowData(item.service, flowReturn.data);
          }

          if (item.type === 'connect') {
            await addConnectedService(item.service);
          }

          const response: RequestTypeDone = {
            status: 'done',
            debug: flowReturn.debug,
            history: client.toJSON(),
            data: flowReturn.data,
          };

          return response;
        })
        .mapErr((error) => {
          console.log(JSON.stringify(error, null, 2), error.response?.data);
          return new BaseError({
            message: error.message,
            meta: error,
            history: client.toJSON(),
            name: 'ApiError',
          });
        });
    });
  };
};
