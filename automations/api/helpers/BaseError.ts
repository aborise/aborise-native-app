import { type ApiError, type ApiResponse } from "./client";

export type ErrorOptions = {
  code?: string;
  message: string;
  cause?: Error;
  meta?: Record<string, any>;
  name?:
    | "BaseError"
    | "ServerError"
    | "FlowError"
    | "PlaywrightError"
    | "UserError"
    | "ApiError";
  history?: Array<ApiResponse<any> | ApiError>;
};

export class BaseError extends Error {
  public name: NonNullable<ErrorOptions["name"]>;
  public meta: Record<string, any> = {};
  public history?: Array<ApiResponse<any> | ApiError>;
  public code?: string;
  constructor(options: ErrorOptions) {
    super(options.message);
    this.name = options.name ?? "BaseError";
    this.meta = options.meta ?? {};
    this.stack = options.cause?.stack ?? this.stack;
    this.history = options.history;
    this.code = options.code;
  }
}
