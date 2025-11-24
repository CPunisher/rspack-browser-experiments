import { rspack, builtinMemFs, Stats } from "@rspack/browser";
import { files, config } from "./projects/ReactRefresh";

builtinMemFs.volume.fromJSON({
  ...files,
});

const callback = (err: Error | null, stats: Stats | undefined) => {
  if (err) {
    console.error(err);
  }
  console.log("Stats err: ", !!stats?.hasErrors());
  console.log("Stats warn: ", !!stats?.hasWarnings());
  console.log(stats?.toJson({ all: false, errors: true }));

  const json = builtinMemFs.volume.toJSON();
  console.log(json);
  console.log(json["/dist/main.js"] as string);
};

function run() {
  rspack(config, callback);
}

run();
