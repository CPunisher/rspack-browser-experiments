import { rspack, builtinMemFs } from "@rspack/browser";
import { files, config } from "./projects/BasicReact";

builtinMemFs.volume.fromJSON({
  ...files,
});

function run() {
  rspack(config, (err, stats) => {
    if (err) {
      console.error(err);
    }
    console.log("Stats err: ", !!stats?.hasErrors());
    console.log("Stats warn: ", !!stats?.hasWarnings());
    console.log(stats?.toString({ all: false, errors: true }));

    const json = builtinMemFs.volume.toJSON();
    console.log(json);
    console.log(json["/dist/main.js"] as string);
    // eval(json["/dist/main.js"] as string);
  });
}

run();
