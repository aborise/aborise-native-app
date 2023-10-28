export class CancelToken {
  promise: Promise<void>;
  resolve: () => void;

  constructor() {
    this.resolve = () => {};
    this.promise = new Promise<void>((resolve) => (this.resolve = resolve));
  }

  revoke() {
    this.resolve();
  }

  onRevoke(cb: () => void | Promise<void>) {
    return this.promise.then(cb);
  }
}
