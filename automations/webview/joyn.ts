import { Ok, Result } from '~/shared/Result';
import { JoynSubConfig, JoynSubscriptions } from './validators/joyn';
import { WebViewConfig, javascript } from './webview.helpers';
import { FlowReturn } from '../playwright/setup/Runner';
import { useStorage } from '~/composables/useStorage';
import { getUserId } from '~/shared/ensureDataLoaded';
import { Response } from '~/app/details/[id]/genericWebView';
import { getCookies } from '../api/helpers/cookie';

const LOGIN_URL = 'https://www.joyn.de/mein-account';

const checkLoggedIn = (type: Response['type'], negative = false) => {
  return javascript`
    const data = !!JSON.parse(localStorage.getItem('meQuery')).account;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
    `;
};

type JoinExtractor = {
  access_token: string;
  refresh_token: string;
  client_id: string;
  config: JoynSubConfig;
  subs: JoynSubscriptions;
};

const dataConverter = (data: JoinExtractor): Result<FlowReturn, { data: any }> => {
  const { access_token, refresh_token, client_id, config, subs } = data;

  if (config.hasActivePlus) {
    const product = config.products.find((s) => s.id === 'deplus')!;
    const sub = subs.find((s) => s.productId === 'deplus')!;

    return Ok({
      token: {
        access_token,
        refresh_token,
        client_id,
        expires: Date.now() + 3600000,
      },
      data: {
        membershipStatus: 'active',
        billingCycle: 'monthly',
        membershipPlan: product.name,
        nextPaymentDate: new Date(sub.state.renewsOn * 1000).toISOString(),
        nextPaymentPrice: product.price,
        lastSyncedAt: new Date().toISOString(),
      },
    } satisfies FlowReturn);
  } else {
    return Ok({
      token: {
        access_token,
        refresh_token,
        client_id,
        expires: Date.now() + 3600000,
      },
      data: {
        membershipStatus: 'inactive',
        lastSyncedAt: new Date().toISOString(),
      },
    } satisfies FlowReturn);
  }
};

const dataExtractor = () => {
  return javascript`
    const tokenConfig = JSON.parse(localStorage.getItem('token'));
    const { access_token, refresh_token } = tokenConfig;
    const client_id = JSON.parse(localStorage.getItem('ajs_anonymous_id'));

    const config = JSON.parse(localStorage.meQuery).subscriptionsData.config
    const subs = JSON.parse(localStorage.meQuery).productSubscriptions

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'extract', data: { access_token, refresh_token, client_id, config, subs } }));
  `;
};

const fillInEmailAndPw = () => {
  return (data: Record<string, unknown> = {}) => {
    if (!data.email || !data.password) return undefined;
    return javascript`
      if (document.location.host !== 'signin.7pass.de') return
      
      const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
      function simulateMouseClick(element){
        mouseClickEvents.forEach(mouseEventType =>
          element.dispatchEvent(
            new MouseEvent(mouseEventType, {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1
            })
          )
        );
      }

      function fill() {
      
        const email = document.querySelector('input[name="email"]');
        const password = document.querySelector('input[name="password"]');
        const button = document.querySelector('button[type="submit"]');

        if (!email && !password) {
          setTimeout(() => {
            fill();
          }, 1000);
          return;
        }

        const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;

        if (email) {
          nativeInputSetter.call(email, '${data.email}');
          const event = new Event('input', { bubbles: true});
          email.dispatchEvent(event);
        }

        if (password) {
          nativeInputSetter.call(password, '${data.password}');
          const event = new Event('input', { bubbles: true});
          password.dispatchEvent(event);
        }

        if (button) {
          setTimeout(() => {
            simulateMouseClick(button);
          }, 1000);
        }
      }

      fill();
    `;
  };
};

export const connect: WebViewConfig = {
  url: LOGIN_URL,
  sanityCheck: () => checkLoggedIn('sanity', true),
  targetCondition: () => checkLoggedIn('condition'),
  dataExtractor,
  dataConverter,
  otherCode: [fillInEmailAndPw()],
  getAuth: () => {
    const storage = useStorage((process.env.STORAGE_TYPE as 'local') || 'local', getUserId());
    return storage.get<{ email: string; password: string }>(`services/joyn/login`);
  },
  getCookies: () => [], // getCookies('joyn'),
};
