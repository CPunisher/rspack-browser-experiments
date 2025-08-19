import { rspack, builtinMemFs } from "@rspack/browser";
// import { BasicReact } from "./project";
// declare const NODE_MODULES: Record<string, string>;

builtinMemFs.volume.fromJSON({
  // ...NODE_MODULES,
  // ...BasicReact,
  // "/index.js": "1",
  "/index.js": `
  import a from "./aa.js"
  import b from "./b.js"
  console.log(a)
  console.log(b)`,
  "/a.js": `export default 2`,
  "/b.js": `export default 3`,
  "/loader.js": `export default function loader(content) { return "export default \\"111\\"" }`,
  // "/loader2.js": `module.exports = function loader(content) { return "export default \\"222\\"" }`,
  "/template.js":
    "module.exports = ({ htmlRspackPlugin }) => `<html><head><title>Hello</title></head><body></body></html>`",
});

function run() {
  rspack(
    {
      mode: "development",
      devtool: false,
      entry: "./index.js",
      module: {
        rules: [
          {
            test: /a\.js$/,
            loader: "./loader.js",
          },
          // {
          //   test: /b\.js$/,
          //   loader: "./loader2.js",
          // },
        ],
      },
      // plugins: [new rspack.HtmlRspackPlugin({ template: "./template.js" })],
    },
    (err, stats) => {
      if (err) {
        console.error(err);
      }
      console.log("Stats err: ", !!stats?.hasErrors());
      console.log("Stats warn: ", !!stats?.hasWarnings());
      console.log(stats?.toString({ all: false, errors: true }));

      const json = builtinMemFs.volume.toJSON();
      console.log(json);
      console.log(json["/dist/main.js"] as any);
    }
  );
}

run();
