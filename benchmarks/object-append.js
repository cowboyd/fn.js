const Benchmark = require("benchmark");

const { append } = require("../dist/funcadelic.cjs");

function likeAssign(target) {
  let totalArgs = arguments.length,
      source, i, totalKeys, keys, key, j;

  for (i = 1; i < totalArgs; i++) {
    source = arguments[i];
    keys = Object.keys(source).concat(Object.getOwnPropertySymbols(source));
    totalKeys = keys.length;
    for (j = 0; j < totalKeys; j++) {
      key = keys[j];
      target[key] = source[key];
    }
  }
  return target;
}

module.exports = new Benchmark.Suite()
  .add("append", () => {
    class Person {}
    for (let i = 0; i < 1000; i++) {
      append(new Person(), { firstName: 'Foo', lastName: 'Bar' });
    }
  })
  .add("likeAssign", () => {
    class Person {}
    for (let i = 0; i < 1000; i++) {
      likeAssign(new Person(), { firstName: 'Foo', lastName: 'Bar' });
    }
  })
  .add("Object.assign", () => {
    class Person {}
    for (let i = 0; i < 1000; i++) {
      Object.assign(new Person(), { firstName: 'Foo', lastName: 'Bar' });
    }
  })
  .add("for in", () => {
    class Person {}
    for (let i = 0; i < 1000; i++) {
      let person = new Person();
      let props = { firstName: 'Foo', lastName: 'Bar' };
      for (let prop in props) {
        person[prop] = props[prop];
      }
    }
  })