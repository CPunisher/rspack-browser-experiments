import { RspackOptions } from "@rspack/browser";

export const files = {
  "/index.js": `import isOdd from "https://esm.sh/is-odd"
console.log(isOdd(1));
console.log(isOdd(2));`,
};

export const config: RspackOptions = {
  mode: "development",
  devtool: false,
  entry: "/index.js",
  experiments: {
    buildHttp: {
      allowedUris: ["https://"],
    },
  },
};
