export type ResponseAsk = {
  status: "ask";
  id: string;
  key: string;
};

export type ResponseError = {
  status: "error";
  error: Error;
};

export type ResponseDone = {
  status: "done";
  value?: unknown;
};

export type ResponseSuccess = ResponseDone | ResponseAsk;
export type Response = ResponseSuccess | ResponseError;
