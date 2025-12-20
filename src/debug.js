export default function (aria2) {
  aria2.addEventListener("open", () => {
    console.log("aria2", "OPEN");
  });

  aria2.addEventListener("close", () => {
    console.log("aria2", "CLOSE");
  });

  aria2.addEventListener("error", ({ detail }) => {
    console.error(detail);
  });

  aria2.addEventListener("input", ({ detail }) => {
    console.log("aria2", "IN");
    console.dir(detail);
  });

  aria2.addEventListener("output", ({ detail }) => {
    console.log("aria2", "OUT");
    console.dir(detail);
  });
}
