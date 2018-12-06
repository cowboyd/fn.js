const babel = require("rollup-plugin-babel");
const filesize = require("rollup-plugin-filesize");
const pkg = require("./package.json");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');

let external = ["invariant"];

let filesizePlugin = filesize();

module.exports = [
  {
    input: "src/funcadelic.js",
    output: {
      name: 'funcadelic',
      file: pkg.unpkg,
      format: "umd"
    },
    plugins: [
      replace({
        "process.env.NODE_ENV": JSON.stringify('production')
      }),
      resolve(),
      commonjs(),
      babel({
        babelrc: false,
        comments: false,
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                chrome: "58"
              },
              modules: false
            }
          ]
        ]
      }),
      filesizePlugin
    ]
  },
  {
    input: "src/funcadelic.js",
    external,
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    },
    plugins: [
      babel({
        babelrc: false,
        comments: false,
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                node: "6"
              },
              modules: false
            }
          ]
        ]
      }),
      filesizePlugin
    ]
  },
  {
    input: "src/funcadelic.js",
    external,
    output: { file: pkg.module, format: "es", sourcemap: true },
    plugins: [
      babel({
        babelrc: false,
        comments: false,
        presets: [
          [
            "@babel/preset-env",
            {
              modules: false
            }
          ]
        ]
      }),
      filesizePlugin
    ]
  }
];