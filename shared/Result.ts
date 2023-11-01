interface BaseResult<T, E> {
  /** `true` when the result is Ok */ readonly ok: boolean;
  /** `true` when the result is Err */ readonly err: boolean;

  /**
   * Calls `mapper` if the result is `Ok`, otherwise returns the `Err` value of self.
   * This function can be used for control flow based on `Result` values.
   */
  andThen<T2>(mapper: (val: T) => OkType<T2>): Result<T2, E>;
  andThen<E2>(mapper: (val: T) => ErrType<E2>): Result<T, E | E2>;
  andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T2, E | E2>;
  andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T2, E | E2>;
  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
   * leaving an `Err` value untouched.
   *
   * This function can be used to compose the results of two functions.
   */
  map<U>(mapper: (val: T) => U): Result<U, E>;
  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value,
   * leaving an `Ok` value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   */
  mapErr<F>(mapper: (val: E) => F): Result<T, F>;
}

export class OkType<T> implements BaseResult<T, never> {
  public readonly ok: true = true;
  public readonly err: false = false;

  constructor(public readonly val: T) {}
  map<U>(mapper: (value: T) => U): OkType<U> {
    return new OkType(mapper(this.val));
  }
  andThen<T2>(mapper: (val: T) => OkType<T2>): OkType<T2>;
  andThen<E2>(mapper: (val: T) => ErrType<E2>): Result<T, E2>;
  andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T2, E2> {
    return mapper(this.val);
  }
  mapErr(_mapper: unknown): OkType<T> {
    return this;
  }
}

export class ErrType<T> implements BaseResult<never, T> {
  public readonly ok: false = false;
  public readonly err: true = true;

  constructor(public readonly val: T) {}

  mapErr<U>(mapper: (value: T) => U): ErrType<U> {
    return new ErrType(mapper(this.val));
  }

  map(_mapper: unknown): ErrType<T> {
    return this;
  }

  andThen(op: unknown): ErrType<T> {
    return this;
  }
}

export type Result<T, U> = OkType<T> | ErrType<U>;

// let a: AsyncResult<1, 2>;

// a.andThen((a) => Err(3));

export function Ok<T>(val: T): OkType<T> {
  return new OkType(val);
}

export function Err<T>(val: T): ErrType<T> {
  return new ErrType(val);
}

type Asyncs<T, E> = AsyncResult<T, E> | Promise<Result<T, E>> | Result<T, E>;

export class AsyncResult<T, E> extends Promise<Result<T, E>> {
  // private result: Promise<Result<T, E>>;

  constructor(cb: ConstructorParameters<typeof Promise<Result<T, E>>>[0]) {
    // (result: Promise<Result<T, E>> | Result<T, E> | (() => Promise<Result<T, E>> | Result<T, E>)) {
    // super((resolve) => resolve(typeof result === 'function' ? result() : result));
    super(cb);
    // this.result = Promise.resolve(result).catch((err) => Err(err));
  }

  static ok<T, E>(value: T | Promise<T>): AsyncResult<T, E> {
    return wrapAsync(Promise.resolve(value).then((val) => Ok(val)));
  }

  static err<T, E>(error: E | Promise<E>): AsyncResult<T, E> {
    return wrapAsync(Promise.resolve(error).then((err) => Err(err)));
  }

  map<U>(mapper: (value: T) => U | Promise<U>): AsyncResult<U, E> {
    const mappedResult = this.then(async (result) => {
      if (result.ok) {
        return Ok(await mapper(result.val));
      } else {
        return Err(result.val);
      }
    });

    return wrapAsync(mappedResult);
  }

  andThen<T2>(mapper: (val: T) => Asyncs<T2, never>): AsyncResult<T2, E>;
  andThen<E2>(mapper: (val: T) => Asyncs<never, E2>): AsyncResult<never, E | E2>;
  andThen<T2, E2>(mapper: (val: T) => Asyncs<T2, E2>): AsyncResult<T2, E | E2>;
  andThen<T2, E2>(mapper: (val: T) => Asyncs<T2, E2>): AsyncResult<T2, E | E2> {
    const mappedResult: Promise<Result<T2, E2 | E>> = this.then(async (result) => {
      if (result.ok) {
        return wrapAsync(mapper(result.val));
      } else {
        return Err(result.val);
      }
    });

    return wrapAsync(mappedResult);
  }

  mapErr<F>(mapper: (error: E) => F | Promise<F>): AsyncResult<T, F> {
    const mappedResult = this.then(async (result) => {
      if (result.err) {
        return Err(await mapper(result.val));
      } else {
        return Ok(result.val);
      }
    });
    return wrapAsync(mappedResult);
  }

  get ok(): Promise<boolean> {
    return this.then((res) => res.ok);
  }

  get err(): Promise<boolean> {
    return this.then((res) => res.err);
  }

  async unwrap(): Promise<T> {
    const result = await this;
    if (result.ok) {
      return result.val;
    } else {
      throw result.val;
    }
  }

  async unwrapErr(): Promise<E> {
    const result = await this;
    if (result.err) {
      return result.val;
    } else {
      throw result.val;
    }
  }

  async expect(message: string): Promise<T> {
    const result = await this;
    if (result.ok) {
      return result.val;
    } else {
      throw new Error(message);
    }
  }

  async expectErr(message: string): Promise<E> {
    const result = await this;
    if (result.err) {
      return result.val;
    } else {
      throw new Error(message);
    }
  }

  async unwrapOr(defaultValue: T): Promise<T> {
    const result = await this;
    if (result.ok) {
      return result.val;
    } else {
      return defaultValue;
    }
  }

  async unwrapOrElse(defaultValue: (error: E) => T | Promise<T>): Promise<T> {
    const result = await this;
    if (result.ok) {
      return result.val;
    } else {
      return defaultValue(result.val);
    }
  }

  log(msg: string): AsyncResult<T, E> {
    return this.map((val) => {
      console.log(msg);
      return val;
    });
  }

  logData(): AsyncResult<T, E> {
    return this.map((val) => {
      console.log(JSON.stringify(val, null, 2));
      return val;
    });
  }

  // async unwrapErrOr(defaultValue: E): Promise<E> {
  //   const result = await this.result;
  //   if (result.err) {
  //     return result.val;
  //   } else {
  //     return defaultValue;
  //   }
  // }

  // async unwrapErrOrElse(defaultValue: (value: T) => E | Promise<E>): Promise<E> {
  //   const result = await this.result;
  //   if (result.err) {
  //     return result.val;
  //   } else {
  //     return defaultValue(result.val);
  //   }
  // }
}

export const wrapAsync = <T, E>(
  result: Promise<Result<T, E>> | Result<T, E> | (() => Promise<Result<T, E>> | Result<T, E>),
) =>
  typeof result === 'function'
    ? new AsyncResult<T, E>((resolve) => resolve(result()))
    : new AsyncResult<T, E>((resolve) => resolve(result));

export const fromPromise = <T, E = any>(promise: Promise<T>) =>
  wrapAsync(
    promise.then(
      (val) => Ok(val),
      (val) => Err(val as E),
    ),
  );
