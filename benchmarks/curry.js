const Benchmark = require("benchmark");
const compose = require('lodash.flow');

const lodashCurry = require('lodash.curry');

function curry(f) {
  return function curried(...t) {
      if (t.length === 0) return curried;
      if (t.length === f.length) return f(...t);
      return curried.bind(this, ...t);
  };
}

const fixedArityFns = [
  (a, b) => a + b,
  (a, b, c) => a + b + c,
  (a, b, c, d) => a + b + c + d,
  (a, b, c, d, e) => a + b + c + d + e,
  (a, b, c, d, e, f) => a + b + c + d + e + f,
  (a, b, c, d, e, f, g) => a + b + c + d + e + f + g,
  (a, b, c, d, e, f, g, h) => a + b + c + d + e + f + g + h,
  (a, b, c, d, e, f, g, h, i) => a + b + c + d + e + f + g + h + i,
  (a, b, c, d, e, f, g, h, i, j) => a + b + c + d + e + f + g + h + i + j
];

const values = [1, 23, 42, 67, 99, 112, 250, 667, 888, 1001];

function bench(name, curryFn) {
  return function(suite) {
    return fixedArityFns.reduce((memo, fn, length) => {
      let arity = length + 2;
      let args = values.slice(0, arity);
      let sum = curryFn(fn);
      return memo.add(`${name} function with ${arity} arity`, () => {
        args.reduce((acc, j) => acc(j), sum);
      });
    }, suite);
  }
}

module.exports = compose([bench('_.curry', lodashCurry), bench('curry', curry)])(new Benchmark.Suite());