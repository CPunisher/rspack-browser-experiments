import {
  RspackOptions,
  HtmlRspackPlugin,
  container,
  BrowserHttpImportEsmPlugin,
} from "@rspack/browser";

export const files = {
  "/runtimePlugins/logger.js": `export default function () {
  return {
    name: 'logger',
    beforeInit(args) {
      console.log('beforeInit: ', args);
      return args;
    },
    beforeLoadShare(args) {
      console.log('beforeLoadShare: ', args);
      return args;
    },
  };
}`,
  "/App.js": `import React from 'react';
import ComponentB from 'mfe-b/Component'; // <- these are remote modules,
import { de } from 'date-fns/locale';

const App = () => (
  <article>
    <header>
      <h1></h1>
    </header>
    <p>This component is from a remote container:</p>
    <ComponentB locale={de} />
    <p>And this component is from another remote container:</p>
  </article>
);
export default App;`,
  "/bootstrap.js": `import { createRoot } from 'react-dom/client'; // <- this is a shared module, but used as usual
import App from './App';

// load app
const el = document.createElement('main');
const root = createRoot(el);
root.render(<App />);
document.body.appendChild(el); `,
  "/index.js": `import('./bootstrap');`,
};

export const config: RspackOptions = {
  mode: "development",
  devtool: false,
  entry: "./index.js",
  output: {
    // set uniqueName explicitly to make react-refresh works
    uniqueName: "app",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "ecmascript",
                jsx: true,
              },
              transform: {
                react: {
                  runtime: "automatic",
                },
              },
            },
          },
        },
      },
    ],
  },
  plugins: [
    new BrowserHttpImportEsmPlugin({
      domain: "https://esm.sh",
      dev: ["@module-federation/webpack-bundler-runtime", "react-dom"],
      externals: ["react"],
    }),
    new HtmlRspackPlugin(),
    new container.ModuleFederationPlugin({
      name: "app",
      // List of remotes with URLs
      remotes: {
        "mfe-b": "mfeBBB@http://localhost:8081/mfeBBB.js",
      },

      // list of shared modules with optional options
      shared: {
        // specifying a module request as shared module
        // will provide all used modules matching this name (version from package.json)
        // and consume shared modules in the version specified in dependencies from package.json
        // (or in dev/peer/optionalDependencies)
        // So it use the highest available version of this package matching the version requirement
        // from package.json, while providing it's own version to others.
        react: {
          import: false,
          singleton: true, // make sure only a single react module is used
        },
      },

      // list of runtime plugin modules (feature of MF1.5)
      runtimePlugins: ["./runtimePlugins/logger.js"],
    }),
  ],
  experiments: {
    buildHttp: {
      allowedUris: ["https://"],
    },
  },
};
