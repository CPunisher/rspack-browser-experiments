import { RspackOptions, BrowserHttpImportEsmPlugin } from "@rspack/browser";

export const files = {
  "/index.js": `
import * as compiler from "@vue/compiler-core";
import * as util from "@/util.js";
console.log(compiler, util)`,
  "/src/util.js": `export function f() { return 1; }`,
};

export const config: RspackOptions = {
  mode: "development",
  devtool: false,
  entry: "/index.js",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
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
      domain: "https://esm.sh",
      dependencyUrl(resolvedRequest) {
        console.log(resolvedRequest);
        if (resolvedRequest.request.startsWith("@/")) {
          return resolvedRequest.request;
        }
      },
    }),
  ],
  experiments: {
    buildHttp: {
      allowedUris: ["https://"],
    },
  },
};
