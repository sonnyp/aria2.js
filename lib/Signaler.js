export default class Signaler {
  constructor() {
    this._queue = [];
    this._pending = null;
  }

  signal(value) {
    if (this._pending) {
      this._pending(value);
      this._pending = null;
    } else {
      this._queue.push(value);
    }
  }

  async *[Symbol.asyncIterator]() {
    while (true) {
      yield new Promise((resolve) => {
        if (this._queue.length > 0) {
          resolve(this._queue.shift());
        } else {
          this._pending = resolve;
        }
      });
    }
  }
}
