import nodePolyfills from "rollup-plugin-polyfill-node";

export default [
  {
    input: "src/Aria2.js",
    output: {
      file: "bundle.js",
      format: "iife",
      name: "Aria2",
    },
    // Still needed?
    plugins: [nodePolyfills()],
  },
];
