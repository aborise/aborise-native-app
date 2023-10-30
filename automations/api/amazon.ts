import { AsyncResult } from '~/shared/Result';
import { api } from './helpers/setup';

export const connect = api(() => {
  return AsyncResult.err({
    errorMessage: 'Not implemented yet',
    message: 'Not implemented yet',
    custom: 'Not implemented yet',
    statusCode: 500,
  });
});

export const resume = api(() => {
  return AsyncResult.err({
    errorMessage: 'Not implemented yet',
    message: 'Not implemented yet',
    custom: 'Not implemented yet',
    statusCode: 500,
  });
});

export const cancel = api(() => {
  return AsyncResult.err({
    errorMessage: 'Not implemented yet',
    message: 'Not implemented yet',
    custom: 'Not implemented yet',
    statusCode: 500,
  });
});
