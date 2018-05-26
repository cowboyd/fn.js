import invariant from 'invariant';

const { keys, getOwnPropertyDescriptors, defineProperty } = Object;

export function type(Class) {

  invariant(Object.getOwnPropertyDescriptors, `funcadelic.js requires Object.getOwnPropertyDescriptors. See https://github.com/cowboyd/funcadelic.js#compatibility`)
  invariant("name" in Function.prototype && "name" in (function x() {}), `funcadelic.js requires Function.name. See https://github.com/cowboyd/funcadelic.js#compatibility`);

  let name = Class.name;

  if (!name) {
    throw new Error('invalid typeclass name: ' + name);
  }

  let symbol = `@@Funcadelic/${name}`;

  Class.for = function _for(value) {
    let i = value[symbol];
    if (!i) {
      throw new Error(`No instance found on ${value} of typeclass ${name}`);
    }
    return i;
  };

  Class.instance = function(constructor, methods) {
    defineProperty(constructor.prototype, symbol, {
      value: methods,
      enumerable: false,
      configurable: true
    });
  };

  Class.symbol = symbol;

  let properties = getOwnPropertyDescriptors(Class.prototype);
  keys(properties).filter(key => key != 'constructor').forEach(key => {
    Class.prototype[key] = Class.prototype[key].bind(Class.for);
  });

  return Class;
}
