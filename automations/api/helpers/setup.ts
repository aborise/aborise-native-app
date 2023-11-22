import { addConnectedService } from '~/composables/useServiceData';
import { getServiceLogin } from '~/composables/useServiceLogin';
import { Storage, useStorage } from '~/composables/useStorage';
import type { AsyncResult } from '~/shared/Result';
import { Session, type ApiError } from './client';
import { setCookies, setToken } from './cookie';
import { setFlowData } from './data';
import { ActionResult, ActionReturn, ApiResult } from '~/automations/helpers/helpers';
import { AllServices } from '~/shared/allServices';
import { Action } from '~/shared/validators';
import { Service } from '~/realms/Service';
import { getRealm } from '~/realms/realm';
import { Subscription } from '~/realms/Subscription';

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
  auth: Record<string, string>;
  client: Session;
  storage: Storage;
}) => AsyncResult<ActionReturn, ApiError>;

type ApiOptions = {
  storage?: Storage;
};

export const api = (
  cb: ApiCallback,
  { storage = useStorage('local') }: ApiOptions = {},
): ((action: Action, service: keyof AllServices) => AsyncResult<ApiResult, ApiError>) => {
  return (action: Action, service: keyof AllServices) => {
    return getServiceLogin(service)
      .andThen((login) => {
        const client = new Session();
        const result = cb({ auth: login, client, storage });

        return result.map(async ({ cookies, token, data }) => {
          if (cookies?.length) {
            await setCookies(service, cookies);
          }

          if (token) {
            await setToken(service, token);
          }

          Service.recreateServiceFromActionResult(service, data);

          const response: ApiResult = {
            history: client.toJSON(),
            data,
          };

          return response;
        });
      })
      .mapErr((err) => {
        if (err.userFriendly) {
          return err;
        }

        console.error(err);

        return {
          ...err,
          userFriendly: true,
          message: 'Something went wrong',
        };
      });
  };
};
