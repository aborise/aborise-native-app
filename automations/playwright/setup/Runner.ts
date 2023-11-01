import { Cookie, Page } from 'playwright-core';
import { Err, Ok, Result } from '~/shared/Result';
import { QueueItem } from '~/shared/validators/queueItem';
import { FlowResult } from '../helpers';
import { CancelToken } from './CancelToken';
import { launchBrowser } from './createBrowser';
import { ApiError, ApiResponse } from '~/automations/api/helpers/client';
import { BaseError } from '~/automations/api/helpers/BaseError';

const runners = new Map<string, Runner<any>>();

export type RunnerFn<T, U> = (options: {
  page: Page;
  item: QueueItem;
  info: Record<string, string>;
  ask: (key: string) => Promise<string>;
  Ok: typeof Ok;
  Err: typeof Err;
}) => Promise<Result<T, U>>;

export type FlowReturn = {
  cookies: Cookie[];
  data?: FlowResult;
  debug?: Record<string, any>;
  token?: string;
};

export type RequestTypeAsk = { status: 'ask'; key: string; id: string };
export type RequestTypeCanceled = { status: 'canceled' };
export type RequestTypeDone = {
  status: 'done';
  debug?: Record<string, any>;
  history?: Array<ApiResponse<any> | ApiError>;
  data?: FlowReturn['data'];
};
export type RequestType =
  | RequestTypeDone
  // | { status: 'ask'; key: string; id: string }
  | RequestTypeCanceled;

export type StripAsk<T> = T extends { status: 'ask'; key: string; id: string } ? never : T;

export class Runner<T> {
  private requestPromise!: Promise<Result<RequestType | RequestTypeAsk, BaseError>>;
  private requestResolve!: (value: Result<RequestType | RequestTypeAsk, BaseError>) => void;

  private responseResolve: (value: string) => void;

  private runnerPromise!: Promise<Result<{ status: 'done' }, BaseError>>;

  private cancelToken: CancelToken;

  private cookies: Cookie[] = [];

  constructor(public id: string) {
    this.setupRequestPromise();

    this.responseResolve = () => {};

    this.cancelToken = new CancelToken();
  }

  public async run(
    runner: RunnerFn<T, string>,
    item: QueueItem,
    info: Record<string, string>,
    callback: (value: T) => Promise<void> | void,
  ) {
    return new Promise<Result<RequestType | RequestTypeAsk, BaseError>>((resolve) => {
      launchBrowser(
        async ({ page }) => {
          this.runnerPromise = runner({
            info,
            page,
            item,
            Err,
            Ok,
            ask: this.ask.bind(this),
          })
            .then(async (result) => {
              if (result.err) {
                const error = new BaseError({
                  message: result.val as string,
                  name: 'UserError',
                });

                return Err(error);
              }

              await callback(result.val);

              return Ok({ status: 'done' } as const);
            })
            .catch((err) => {
              // This is an error in the flow. Also a server error but in our control

              const error = new BaseError({
                message: 'An unexpected error happened in a flow',
                cause: err,
                name: 'FlowError',
              });

              return Err(error);
            });

          resolve(Promise.race([this.requestPromise, this.runnerPromise]));

          await this.runnerPromise;
        },
        this.cookies,
        this.cancelToken,
      )
        .then(() => {
          console.log('Browser closed');
        })
        .catch((err) => {
          // The browser crashed. This is a server error but not in our control (playwright)
          // We have to check if we achieved the goal or not and restart if needed
          // For now, we log the error and notify the user that something went wrong

          const error = new BaseError({
            message: 'Playwright crashed',
            cause: err,
            name: 'PlaywrightError',
          });

          resolve(Err(error));
        });
    });
  }

  public async answer(value: string) {
    this.responseResolve(value);
    return Promise.race([this.requestPromise, this.runnerPromise]);
  }

  public async ask(key: string) {
    return new Promise<string>((resolve) => {
      this.resolveRequestPromise(Ok({ status: 'ask', key, id: this.id } as const));
      this.responseResolve = resolve;
    });
  }

  public cancel() {
    this.cancelToken.revoke();
    this.requestResolve(Ok({ status: 'canceled' as const }));
    return this.requestPromise; // as Promise<Ok<RequestTypeCanceled>>;
  }

  private resolveRequestPromise(value: Result<RequestType | RequestTypeAsk, BaseError>) {
    this.requestResolve(value);
    this.setupRequestPromise();
  }

  private setupRequestPromise() {
    this.requestPromise = new Promise((resolve) => {
      this.requestResolve = resolve;
    });
  }

  public setCookies(cookies: Cookie[]) {
    this.cookies = cookies;
  }

  static get<T, U>(id: string, _fn: RunnerFn<T, U>) {
    const runner = (runners.get(id) as Runner<T>) ?? new Runner<T>(id);
    runners.set(id, runner);
    return runner;
  }
}
