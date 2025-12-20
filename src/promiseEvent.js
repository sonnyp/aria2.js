export default function promiseEvent(target, event) {
  return new Promise((resolve, reject) => {
    function cleanup() {
      target.removeEventListener(event, onEvent);
      target.removeEventListener("error", onError);
    }
    function onEvent(data) {
      resolve(data);
      cleanup();
    }
    function onError(err) {
      reject(err);
      cleanup();
    }
    target.addEventListener(event, onEvent);
    target.addEventListener("error", onError);
  });
}
