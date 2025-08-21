import { RspackOptions } from "@rspack/browser";

export const files = {
  "/index.js": `console.log(0)`,
};

export const config: RspackOptions = {
  mode: "development",
  devtool: false,
  entry: "/index.js",
  watch: true,
  lazyCompilation: true,
};
