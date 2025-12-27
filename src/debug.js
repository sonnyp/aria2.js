export default function (aria2) {
  // emitted when the WebSocket is open.
  aria2.addEventListener("open", () => {
    console.log("aria2", "OPEN");
  });

  // emitted when the WebSocket is closed.
  aria2.addEventListener("close", () => {
    console.log("aria2", "CLOSE");
  });

  // emitted when error occur.
  aria2.addEventListener("error", ({ error }) => {
    console.error("aria2", "error", error);
  });

  // emitted for every data sent.
  aria2.addEventListener("input", ({ data }) => {
    console.log("aria2", "IN");
    console.dir(data);
  });

  // emitted for every data received.
  aria2.addEventListener("output", ({ data }) => {
    console.log("aria2", "OUT");
    console.dir(data);
  });

  // emitted for every notification received.
  aria2.addEventListener("notification", ({ method, params }) => {
    console.log("aria2", "notification", { method, params });
  });
}
