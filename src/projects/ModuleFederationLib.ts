import {
  BrowserHttpImportEsmPlugin,
  HtmlRspackPlugin,
  RspackOptions,
  container,
} from "@rspack/browser";

export const files = {
  "/index.js": `import('./bootstrap');`,
  "/bootstrap.js": `import { createRoot } from 'react-dom/client';
import Component from './Component';
import { de } from 'date-fns/locale';

const el = document.createElement('main');
const root = createRoot(el);
root.render(
  <div>
    <h1>Lib 1</h1>
    <Component locale={de} />
  </div>,
);
document.body.appendChild(el);`,
  "/Component.js": `import { formatRelative, subDays } from 'date-fns';
import { useEffect, useState } from 'react';
// date-fns is a shared module, but used as usual
// exposing modules act as async boundary,
// so no additional async boundary need to be added here
// As data-fns is an shared module, it will be placed in a separate file
// It will be loaded in parallel to the code of this module

const Component = ({ locale }) => {
  let [cnt, setCnt] = useState(0);
  useEffect(() => {
    setInterval(() => {
      setCnt((x) => x + 1);
    }, 1000);
  }, []);
  return (
    <div style={{ border: '5px solid darkblue' }}>
      <div>cnt: {cnt}</div>
      <p>I'm a Component exposed from container B!</p>
      <p>
        Using date-fn in Remote: {formatRelative(subDays(new Date(), 2), new Date(), { locale })}
      </p>
    </div>
  );
};
export default Component;`,
};

export const config: RspackOptions = {
  entry: "./index.js",
  context: __dirname,
  output: {
    // set uniqueName explicitly to make react-refresh works
    uniqueName: "lib1",
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
                  refresh: true,
                },
              },
            },
          },
        },
      },
    ],
  },
  plugins: [
    // new BrowserRequirePlugin({ execute: BrowserRequirePlugin.unsafeExecute }),
    new BrowserHttpImportEsmPlugin({ domain: "https://esm.sh" }),
    new HtmlRspackPlugin({
      // exclude container entry from html, to use the correct HMR handler
      excludeChunks: ["mfeBBB"],
    }),
    new container.ModuleFederationPlugin({
      // A unique name
      name: "mfeBBB",
      // List of exposed modules
      exposes: {
        "./Component": "./Component",
      },

      // list of shared modules
      shared: [
        // date-fns is shared with the other remote, app doesn't know about that
        {
          "date-fns": {
            import: false,
          },
          react: {
            import: false,
            singleton: true, // must be specified in each config
          },
        },
      ],
    }),
  ],
  devServer: {
    port: 8081,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  experiments: {
    buildHttp: {
      allowedUris: ["https://"],
    },
  },
};
