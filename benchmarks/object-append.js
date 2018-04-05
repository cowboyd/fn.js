const Benchmark = require("benchmark");

const { append } = require("../dist/funcadelic.cjs");

module.exports = new Benchmark.Suite()
  .add("append", () => {
    class Person {}
    for (let i = 0; i < 1000; i++) {
      append(new Person(), { firstName: 'Foo', lastName: 'Bar' });
    }
  })
  .add("assign", () => {
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