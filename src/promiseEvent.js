export default function promiseEvent(target, event) {
  const controller = new AbortController();
  const { signal } = controller;
  return new Promise((resolve, reject) => {
    target.addEventListener(event, resolve, {
      signal,
    });
    target.addEventListener("error", reject, {
      signal,
    });
  }).finally(() => controller.abort());
}
