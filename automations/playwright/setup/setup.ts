import { setCookies } from '~/automations/api/helpers/cookie';
import { setFlowData } from '~/automations/api/helpers/data';
import { getAuth } from '~/automations/helpers/auth';
// import { useFirebaseAdmin } from "~/server/useFirebaseAdmin";
import { Err, Result } from '~/shared/Result';
import { QueueItem, QueueItemAnswer, QueueItemCancel, QueueItemSchema } from '~/shared/validators/queueItem';
import { FlowReturn, RequestType, RequestTypeAsk, Runner, RunnerFn } from './Runner';
import { BaseError } from '~/automations/api/helpers/BaseError';

export const run = (runner: RunnerFn<FlowReturn, string>) => {
  return async (queueItem: QueueItem) => {
    const result = QueueItemSchema.safeParse(queueItem);

    if (result.success === false) {
      const error = new BaseError({
        message: 'Invalid Queue Item',
        cause: result.error,
        meta: { queueItem, issues: result.error.issues },
        name: 'ServerError',
      });
      return Err(error);
    }

    const item = result.data;

    const authResult = await getAuth(item);

    if (authResult.err) {
      return authResult;
    }

    const auth = authResult.val;

    const process = Runner.get(item.queueId, runner);

    // const db = useFirebaseAdmin().database();
    // const cookieRef = db.ref(
    //   `/users/${item.user}/services/${item.service}/cookies`
    // );

    // process.setCookies((await cookieRef.get()).val() ?? []);

    return toResponse(
      process.run(runner, item, auth, (flowReturn) => {
        setCookies(item.service, flowReturn.cookies ?? []);

        if (flowReturn.data) {
          setFlowData(item.service, flowReturn.data);
        }
      }),
    );
  };
};

// resume resumes a process that is currently waiting for an answer and hooks into the process promise to resolve the request
export const resume = async (queueItem: QueueItemAnswer | QueueItemCancel) => {
  const info = QueueItemSchema.parse(queueItem);

  if (info.status !== 'answer' && info.status !== 'canceled') {
    const error = new BaseError({
      message: 'Resume was called with wrong Status',
      name: 'ServerError',
    });

    return toResponse(Err(error));
  }

  const process = Runner.get(info.relatedItemId, null as unknown as RunnerFn<FlowReturn, unknown>);

  if (info.status === 'canceled') {
    return toResponse(process.cancel());
  }

  return toResponse(process.answer(info.answer));
};

type Awaitable<T> = T | Promise<T>;
const toResponse = async <T extends RequestTypeAsk | RequestType>(promise: Awaitable<Result<T, BaseError>>) => {
  let result = await promise;

  // this happens when there wasnt a process really running
  if (!result) {
    const error = new BaseError({
      message: 'No Process Found',
      name: 'ServerError',
    });
    result = Err(error);
  }

  return result;
};
