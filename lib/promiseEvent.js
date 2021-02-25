export default function promiseEvent(target, event) {
  return new Promise((resolve, reject) => {
    function cleanup() {
      target.removeEventListener(event, onEvent);
      target.removeEventListener("error", onError);
    }
    function onEvent(event) {
      resolve(event);
      cleanup();
    }
    function onError(event) {
      reject(event);
      cleanup();
    }
    target.addEventListener(event, onEvent);
    target.addEventListener("error", onError);
  });
}
