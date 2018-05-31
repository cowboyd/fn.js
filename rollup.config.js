const babel = require("rollup-plugin-babel");
const filesize = require("rollup-plugin-filesize");
const pkg = require("./package.json");

let external = ["invariant"];

let filesizePlugin = filesize({
  render(opt, size, gzip, bundle) {
    return `Built: ${bundle.file} ( size: ${size}, gzip: ${gzip})`;
  }
});

module.exports = [
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