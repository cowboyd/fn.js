const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const filesize = require('rollup-plugin-filesize');
const pkg = require("./package.json");
const commonjs = require("rollup-plugin-commonjs");

const globals = {
  "lodash.curry": "_.curry",
  "object.getownpropertydescriptors": "Object.getOwnPropertyDescriptors"
};

let external = Object.keys(globals);

module.exports = {
  input: "src/funcadelic.js",
  output: [
    {
      name: "funcadelic",
      file: pkg.browser,
      globals,
      format: "umd"
    },
    { file: pkg.main, format: "cjs" },
    { file: pkg.module, format: "es" }
  ],
  external,
  plugins: [
    babel({
      runtimeHelpers: true,
      babelrc: false,
      comments: false,
      presets: [
        [
          "env",
          {
            modules: false
          }
        ]
      ],
      plugins: ["external-helpers"]
    }),
    resolve(),
    commonjs(),
    filesize({
      render(opt, size, gzip, bundle) {
        return `Built: ${bundle.file} ( size: ${size}, gzip: ${gzip})`;
      }
    })
  ]
};
