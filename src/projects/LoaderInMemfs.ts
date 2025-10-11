import { RspackOptions, BrowserRequirePlugin } from "@rspack/browser";

export const files = {
  "/index.js": `
  import a from "./a.js"
  import b from "./b.js"
  console.log(a)
  console.log(b)`,
  "/a.js": `export default "a"`,
  "/b.js": `export default "b"`,
  "/loader1.js": `import m from "./loader1-helper.js";
export default function loader(content) { return "export default " + m }`,
  "/loader1-helper.js": `export default "111"`,
  "/loader2.js": `const m = require("./loader2-helper.js"); 
module.exports = function loader(content) { return "export default " + m }`,
  "/loader2-helper.js": `module.exports = "222"`,
};

export const config: RspackOptions = {
  mode: "development",
  devtool: false,
  entry: "./index.js",
  module: {
    rules: [
      {
        test: /a\.js$/,
        loader: "./loader1.js",
      },
      {
        test: /b\.js$/,
        loader: "./loader2.js",
      },
    ],
  },
  plugins: [
    new BrowserRequirePlugin({ execute: BrowserRequirePlugin.unsafeExecute }),
  ],
};
