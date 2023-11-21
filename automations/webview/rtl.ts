import { Ok, Result } from '~/shared/Result';
import { JoynSubConfig, JoynSubscriptions } from './validators/joyn';
import { WebViewConfig, javascript } from './webview.helpers';
import { ActionReturn } from '../helpers/helpers';
import { useStorage } from '~/composables/useStorage';
import { getUserId } from '~/shared/ensureDataLoaded';
import { Response } from '~/app/details/[id]/genericWebView';
import { getCookies } from '../api/helpers/cookie';

const LOGIN_URL = 'https://my.plus.rtl.de/account';

const checkLoggedIn = (type: Response['type'], negative = false) => {
  return javascript`
    const data = location.host === 'my.plus.rtl.de' && location.pathname === '/account';
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${type}', data: ${negative ? '!data' : 'data'} }));
    `;
};

type RTLExtractor = {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_expires_in: number;
  refresh_token: string;
  client_id: 'rtlplus-web';
};

const dataConverter = (data: RTLExtractor): Result<ActionReturn, { data: any }> => {
  const { access_token, refresh_token, client_id, expires_in, refresh_expires_in } = data;

  return Ok({
    token: {
      access_token,
      refresh_token,
      client_id,
      expires: Date.now() + expires_in * 1000,
      refresh_expires: Date.now() + refresh_expires_in * 1000,
    },
  });
};

const dataExtractor = () => {
  return javascript`
    const { access_token, expires_in, id_token, refresh_expires_in, refresh_token } = JSON.parse(localStorage["0-rtlplus-ffc"]).authnResult 
    const client_id = 'rtlplus-web';

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'extract', data: { access_token, expires_in, id_token, refresh_expires_in, refresh_token, client_id } }));
  `;
};

const fillInEmailAndPw = () => {
  return (data: Record<string, unknown> = {}) => {
    if (!data.email || !data.password) return undefined;
    return javascript`
      if (document.location.host !== 'auth.rtl.de') return
      
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
      
        const email = document.querySelector('input[name="username"]');
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
    return storage.get<{ email: string; password: string }>(`services/rtl/login`);
  },
  getCookies: () => [], // getCookies('joyn'),
};
