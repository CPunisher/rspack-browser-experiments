import { RspackOptions, BrowserHttpImportEsmPlugin } from "@rspack/browser";

export const files = {
  "/index.js": `import { pick } from "es-toolkit/compat"
  console.log(pick({ a: 1, b: 2 }, ["a"]))`,
};

export const config: RspackOptions = {
  mode: "production",
  devtool: false,
  entry: "/index.js",
  module: {
    rules: [
      {
        test: /es-toolkit/,
        sideEffects: false,
      },
    ],
  },
  plugins: [
    new BrowserHttpImportEsmPlugin({
      domain: "https://bytepack.bytedance.net",
    }),
  ],
  experiments: {
    buildHttp: {
      allowedUris: ["https://"],
    },
  },
};
