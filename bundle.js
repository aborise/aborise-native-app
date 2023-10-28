import { build } from "esbuild";
import { polyfillNode } from "esbuild-plugin-polyfill-node";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

build({
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "dist/bundle.js",
  plugins: [
    polyfillNode({
      // Options (optional)
    }),
    NodeModulesPolyfillPlugin({}),
  ],
});
