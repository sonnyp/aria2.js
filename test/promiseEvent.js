import { test, mock } from "node:test";

import promiseEvent from "../src/promiseEvent.js";

test("resolves", async (t) => {
  const foo = new EventTarget();

  const promise = promiseEvent(foo, "bar");
  const evt = new Event("bar");
  foo.dispatchEvent(evt);
  const result = await promise;

  t.assert.equal(result, evt);
});

test("rejects", async (t) => {
  const foo = new EventTarget();

  const promise = promiseEvent(foo, "bar");
  const evt = new Event("error");
  foo.dispatchEvent(evt);
  let result;

  try {
    await promise;
  } catch (err) {
    result = err;
  }

  t.assert.equal(result, evt);
});
