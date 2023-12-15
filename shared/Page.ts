import WebView, { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { z } from 'zod';
import { javascript } from '~/automations/webview/webview.helpers';
import { tagScreen, uuid } from './helpers';
import { MutableRefObject, Ref, useRef } from 'react';
import { Result } from './Result';
import { ActionError, ActionReturn } from '~/automations/helpers/helpers';
import { Awaitable } from './typeHelpers';
import CookieManager, { Cookies } from '@react-native-cookies/cookies';
import { ApiError } from '~/automations/api/helpers/client';

interface AboriseWebViewApi {
  send(data: any): void;
  result<T = void>(id: string, data?: T): T;
  log(...args: any[]): void;
  error(...args: any[]): void;
  fill(id: string, selector: string, value: string, timeout?: number): Promise<void>;
  waitForElement(id: string, selector: string, timeout?: number): Promise<void>;
  click(id: string, selector: string, timeout?: number): Promise<void>;
  exists(id: string, selector: string, timeout?: number): Promise<boolean>;
  elementProxy<T extends HTMLInputElement, P extends keyof T>(
    id: string,
    selector: string,
    prop: P,
    timeout?: number,
  ): Promise<T[P]>;
}

type ElementsWithValue = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type EnhancedWindow = Window & { __aborise__: AboriseWebViewApi; ReactNativeWebView: WebView };
type OmitFirstArg<T> = T extends [arg: any, ...rest: infer U] ? U : never;

const initAborise = (window: EnhancedWindow, document: Document) => {
  'use webview';
  const nativeInputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

  const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
  function simulateMouseClick(element: Element) {
    mouseClickEvents.forEach((mouseEventType) =>
      element.dispatchEvent(
        new MouseEvent(mouseEventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1,
        }),
      ),
    );
  }

  const ensureElement = <T extends Element>(selector: string, timeout = 3000) => {
    return new Promise<T | null>((resolve, reject) => {
      const interval = setInterval(() => {
        const element = document.querySelector(selector) as T;
        if (element) {
          clearInterval(interval);
          resolve(element);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        const element = document.querySelector(selector) as T;
        resolve(element ?? null);
      }, timeout);
    });
  };

  function assertDefined(id: string, toAssert: any, error: string): asserts toAssert {
    if (!toAssert) {
      api.send({ type: 'reject', data: { id, error } });
      throw new Error(error);
    }
  }

  const api: AboriseWebViewApi = {
    send(data) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    },

    result<T = void>(id: string, data?: T): T {
      this.send({ type: 'result', data: { id, result: data } });
      return data!;
    },

    log(...args) {
      this.send({ type: 'log', data: args });
    },

    error(...args) {
      this.send({ type: 'error', data: args });
    },

    async fill(id, selector, value, timeout = 3000) {
      const element = await ensureElement<ElementsWithValue>(selector, timeout);
      assertDefined(id, element, 'Element not found after timeout');
      if (element instanceof HTMLInputElement) {
        nativeInputSetter.call(element, value);
      } else {
        element.value = value;
      }

      const event = new Event('input', { bubbles: true });
      element.dispatchEvent(event);
      return this.result(id);
    },

    async waitForElement(id, selector: string, timeout = 3000) {
      const element = await ensureElement(selector, timeout);
      assertDefined(id, element, 'Element not found after timeout');
      return this.result(id);
    },

    async click(id, selector: string, timeout = 3000) {
      const element = await ensureElement(selector, timeout);
      assertDefined(id, element, 'Element not found after timeout');
      simulateMouseClick(element);
      return this.result(id);
    },

    async exists(id, selector: string, timeout = 3000) {
      const element = await ensureElement(selector, timeout);
      return this.result(id, !!element);
    },

    async elementProxy<T extends HTMLInputElement, P extends keyof T>(
      id: string,
      selector: string,
      prop: P,
      timeout = 3000,
    ): Promise<T[P]> {
      const element = await ensureElement<T>(selector, timeout);
      assertDefined(id, element, 'Element not found after timeout');

      return this.result(id, element[prop]);
    },
  };

  if (document.readyState === 'interactive') {
    console.log('ready');
    api.send({ type: 'ready', data: document.location.href });
  } else {
    console.log('not ready');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('ready after load');
      api.send({ type: 'ready', data: document.location.href });
    });
  }

  // document.addEventListener('readystatechange', () => {
  //   api.log('state', document.readyState);
  // });

  console.log('aborise content script loaded');

  window.__aborise__ = api;
};

export const initAboriseScript = javascript`(${initAborise.toString()})(window, document)`;

export const getInitAboriseScript = () => initAboriseScript;

const dataValidator = z.object({
  type: z.enum(['result', 'log', 'error', 'ready', 'reject']),
  data: z.any().optional(),
});

export type AutomationScript = (page: Page) => Promise<Result<ActionReturn, ActionError>>;
export type EvaluatedScript<T, O extends Record<string, any>> = (
  window: EnhancedWindow,
  document: Document,
  options: O,
) => T | Promise<T>;

export type EvaluatedFetchScript<T, O extends Record<string, any>> = (doc: Document, options: O) => T | Promise<T>;

export class Page {
  private resolvers = new Map<string, (value: any) => void>();
  private rejecters = new Map<string, (error: any) => void>();
  private navTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
  private paused = true;
  private navigationResolver: () => void = () => {};
  private promptResolver: (value: string | null) => void = () => {};
  url = '';

  private pageReady = false;

  constructor(
    readonly wv: MutableRefObject<WebView | null>,
    readonly automationScript: AutomationScript,
    readonly onSuccess: (data: Result<ActionReturn, any>, deviceCookies: Cookies) => Awaitable<void>,
  ) {}

  // injectInitScript() {
  //   this.wv.current.injectJavaScript(initAboriseScript);
  // }

  _showWebView() {}
  _hideWebView() {}

  close(route = '/') {}

  reveal() {
    this._showWebView();
  }

  hide() {
    this._hideWebView();
  }

  loadingMessage(msg: string) {}
  statusMessage(msg: string) {}

  _onMessage(event: WebViewMessageEvent) {
    const result = dataValidator.safeParse(JSON.parse(event.nativeEvent.data));

    if (!result.success) {
      console.error(result.error);
      return;
    }

    const { type, data } = result.data;

    // console.log('message', type, data);

    switch (type) {
      case 'result': {
        const cb = this.resolvers.get(data.id);
        if (!cb) {
          console.error(`No callback found for id ${data.id}`);
          return;
        }
        this.resolvers.delete(data.id);
        this.rejecters.delete(data.id);
        return cb(data.result);
      }
      case 'log':
        return console.log(data);
      case 'error':
        return console.error(data);
      case 'ready':
        // this.injectInitScript();
        this.url = data;
        tagScreen(data);
        console.log('webview', data);
        this.navigationResolver();

        // only start the automation script once
        if (this.pageReady) return;

        this.pageReady = true;
        return this.automationScript(this)
          .then(async (result) => this.onSuccess(result, await CookieManager.get(this.url, true)))
          .then(() => this.close());
      case 'reject': {
        const cb = this.rejecters.get(data.id);
        if (!cb) {
          console.error(`No callback found for id ${data.id}`);
          return;
        }
        this.resolvers.delete(data.id);
        this.rejecters.delete(data.id);
        return cb(data.error);
      }
      default:
        return type satisfies never;
    }
  }

  waitForNavigation(timeout = 3000) {
    return new Promise<void>((resolve, reject) => {
      this.navigationResolver = resolve;
      this.navTimeout = setTimeout(() => {
        reject(new Error('Navigation timeout'));
      }, timeout);
    });
  }

  _onNavigationStateChange(navState: WebViewNavigation) {
    // this.navigationPromise = new Promise<void>((resolve) => {
    //   this.navigationResolver = resolve;
    // });
  }

  locator(selector: string): ElementHandle {
    return new ElementHandle(this, selector);
  }

  private runScript(script: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resolvers.set(id, resolve);
      this.rejecters.set(id, reject);
      this.wv.current!.injectJavaScript(script);
    });
  }

  callApi<T extends keyof AboriseWebViewApi>(
    method: T,
    ...args: OmitFirstArg<Parameters<AboriseWebViewApi[T]>>
  ): ReturnType<AboriseWebViewApi[T]> {
    const id = uuid();
    const stringifiedArgs = args.map((arg) => JSON.stringify(arg)).join(', ');
    const script = javascript`window.__aborise__.${method}('${id}', ${stringifiedArgs})`;
    // @ts-expect-error
    return this.runScript(script, id);
  }

  evaluate<T, const O extends Record<string, any> = never>(fn: EvaluatedScript<T, O>, options?: O): Promise<T> {
    const id = uuid();
    const stringifiedOptions = JSON.stringify(options ?? {});
    const script = javascript`
      console.log('evaluate ${id}');
      window.__aborise__.result('${id}', await (${fn.toString()})(window, document, ${stringifiedOptions}))
    `;
    return this.runScript(script, id);
  }

  fetch<T, const O extends Record<string, any> = never>(
    url: string,
    cb: EvaluatedFetchScript<T, O>,
    options?: O,
  ): Promise<T> {
    const id = uuid();
    const stringifiedOptions = JSON.stringify(options ?? {});
    const script = javascript`
      console.log('fetch ${id}');
      const doc = await fetch('${url}', {
        credentials: 'include',
        method: 'GET'
      })
        .then((res) => res.text())
        .then((text) => new DOMParser().parseFromString(text, 'text/html'))

      const result = await (${cb.toString()})(doc, ${stringifiedOptions})
      window.__aborise__.result('${id}', result)
    `;
    return this.runScript(script, id);
  }

  navigate(url: string) {
    const promise = this.waitForNavigation();
    const script = javascript`document.location.href = '${url}'`;
    this.wv.current!.injectJavaScript(script);
    return promise;
  }

  waitForCondition<T, const O extends Record<string, any> = never>(
    fn: EvaluatedScript<T, O>,
    options?: O,
    timeout = 3000,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const result = await this.evaluate(fn, options);
        if (result) {
          clearInterval(interval);
          resolve(result);
        }
      }, 100);

      setTimeout(async () => {
        clearInterval(interval);
        const result = await this.evaluate(fn, options);
        resolve(result);
      }, timeout);
    });
  }

  prompt(options: { title?: string; text: string; defaultValue?: string }) {
    return new Promise<string | null>((resolve) => {
      this.promptResolver = resolve;
      this._showPrompt(options);
    });
  }

  _showPrompt(options: { title?: string; text: string; defaultValue?: string }) {}
  _resolvePrompt(value: string | null) {
    this.promptResolver(value);
  }
}

class ElementHandle {
  constructor(readonly page: Page, readonly selector: string) {}

  async fill(value: string, timeout = 3000): Promise<void> {
    await this.page.callApi('fill', this.selector, value, timeout);
  }

  async click(timeout = 3000): Promise<void> {
    await this.page.callApi('click', this.selector, timeout);
  }

  async waitForElement(timeout = 3000): Promise<void> {
    await this.page.callApi('waitForElement', this.selector, timeout);
  }

  async exists(timeout = 3000) {
    return await this.page.callApi('exists', this.selector, timeout);
  }

  async textContent(timeout = 3000) {
    return ((await this.page.callApi('elementProxy', this.selector, 'textContent', timeout)) as string).trim();
  }

  async value(timeout = 3000) {
    return (await this.page.callApi('elementProxy', this.selector, 'value', timeout)) as string;
  }

  async checked(timeout = 3000) {
    return (await this.page.callApi('elementProxy', this.selector, 'checked', timeout)) as boolean;
  }

  async innerHTML() {
    return (await this.page.callApi('elementProxy', this.selector, 'innerHTML')) as string;
  }
}
