import { rspack, volume } from "@rspack/browser";
import { BasicReact } from "./project";

declare const NODE_MODULES: Record<string, string>;
volume.fromJSON({
  ...NODE_MODULES,
  ...BasicReact,
});

rspack(
  {
    entry: "./src/main.jsx",
    resolve: {
      extensions: ["...", ".ts", ".tsx", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          type: "asset",
        },
        {
          test: /\.(jsx?|tsx?)$/,
          use: [
            {
              loader: "builtin:swc-loader",
              options: {
                jsc: {
                  parser: {
                    syntax: "typescript",
                    tsx: true,
                  },
                  transform: {
                    react: {
                      runtime: "automatic",
                      development: false,
                      refresh: false,
                    },
                  },
                },
                env: {
                  targets: [
                    "last 2 versions",
                    "> 0.2%",
                    "not dead",
                    "Firefox ESR",
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    experiments: {
      css: true,
    },
  },
  (err, stats) => {
    console.log(`Err: ${!!err}`);
    console.log(`Stats: ${stats?.hasErrors()}`);
    if (err || stats?.hasErrors()) {
      console.error(err);
      console.log(stats?.toJson());
    }
    console.log(volume.toJSON());
  }
);
