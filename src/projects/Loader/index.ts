import { RspackOptions, BrowserRequirePlugin } from "@rspack/browser";
import CustomLoader from "./custom-loader";

export const files = {
  "/index.js": `
  import a from "./a.js"
  console.log(a)`,
  "/a.js": `export default "a123"`,
  "/LOADER/custom-loader.js": ``,
};

export const config: RspackOptions = {
  mode: "development",
  devtool: false,
  entry: "./index.js",
  module: {
    rules: [
      {
        test: /a\.js$/,
        loader: "/LOADER/custom-loader.js",
      },
    ],
  },
  plugins: [
    new BrowserRequirePlugin({
      modules: {
        "/LOADER/custom-loader.js": CustomLoader,
      },
    }),
  ],
};
