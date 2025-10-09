import { rspack, builtinMemFs, Stats } from "@rspack/browser";
import { files, config } from "./projects/BasicReact";

builtinMemFs.volume.fromJSON({
  ...files,
});

const callback = (err: Error | null, stats: Stats | undefined) => {
  if (err) {
    console.error(err);
  }
  console.log("Stats err: ", !!stats?.hasErrors());
  console.log("Stats warn: ", !!stats?.hasWarnings());
  // console.log(stats?.toJson());

  const json = builtinMemFs.volume.toJSON();
  console.log(json);
  console.log(json["/dist/main.js"] as string);
  // eval(json["/dist/main.js"] as string);
};

function runWatch() {
  const compiler = rspack(config);
  compiler?.watch(
    {
      // 示例
      aggregateTimeout: 300,
      poll: undefined,
    },
    callback
  );

  let count = 1;
  setInterval(() => {
    builtinMemFs.volume.writeFileSync("/index.js", `console.log(${count++})`);
    console.log("file changed");
  }, 2000);
}

function run() {
  rspack(config, callback);
}

run();
