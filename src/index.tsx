import { rspack, builtinMemFs } from "@rspack/browser";
// import { BasicReact } from "./project";
// declare const NODE_MODULES: Record<string, string>;

builtinMemFs.volume.fromJSON({
  // ...NODE_MODULES,
  // ...BasicReact,
  "/index.js": "1",
  //   "/index.js": `
  // import a from "./a.js"
  // console.log(a)`,
  //   "/a.js": `export default 2`,
  //   "/loader.js": `
  //   function loader(content) {
  //     return "export default 1"
  //   }
  //   module.exports = loader;`,
});

rspack(
  {
    entry: "./index.js",
    module: {
      rules: [
        {
          test: /a\.js$/,
          loader: "./loader.js",
        },
      ],
    },
  },
  (err, stats) => {
    if (err) {
      console.error(err);
    }
    console.log("Stats err: ", !!stats?.hasErrors());
    console.log("Stats warn: ", !!stats?.hasWarnings());
    console.log(stats?.toJson());

    console.log(builtinMemFs.volume.toJSON());
  }
);
