import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { serializeDirectoryToMemFS } from "./memfs";

const NODE_MODULES = {
  ...serializeDirectoryToMemFS("./node_modules/react"),
  ...serializeDirectoryToMemFS("./node_modules/react-dom"),
  ...serializeDirectoryToMemFS("./node_modules/scheduler"),
};

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    define: {
      NODE_MODULES: JSON.stringify(NODE_MODULES),
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
