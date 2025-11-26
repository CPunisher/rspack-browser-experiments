import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import fs from "node:fs";

const REACT_REFRESH_RUNTIME = fs.readFileSync(
  "node_modules/react-refresh/cjs/react-refresh-runtime.development.js"
);
const RSPACK_REACT_REFRESH = fs.readFileSync(
  "node_modules/@rspack/plugin-react-refresh/client/reactRefresh.js"
);
const RSPACK_REACT_REFRESH_ENTRY = fs.readFileSync(
  "node_modules/@rspack/plugin-react-refresh/client/reactRefreshEntry.js"
);
const RSPACK_REACT_REFRESH_UTILS = fs.readFileSync(
  "node_modules/@rspack/plugin-react-refresh/client/refreshUtils.js"
);

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    define: {
      REACT_REFRESH_RUNTIME: JSON.stringify(REACT_REFRESH_RUNTIME),
      RSPACK_REACT_REFRESH: JSON.stringify(RSPACK_REACT_REFRESH),
      RSPACK_REACT_REFRESH_ENTRY: JSON.stringify(RSPACK_REACT_REFRESH_ENTRY),
      RSPACK_REACT_REFRESH_UTILS: JSON.stringify(RSPACK_REACT_REFRESH_UTILS),
    },
  },
  output: {
    minify: false,
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
