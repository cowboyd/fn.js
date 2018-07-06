import invariant from 'invariant';

const { keys, getOwnPropertyDescriptors } = Object;

invariant(getOwnPropertyDescriptors, `funcadelic.js requires Object.getOwnPropertyDescriptors. See https://github.com/cowboyd/funcadelic.js#compatibility`)
invariant("name" in Function.prototype && "name" in (function x() {}), `funcadelic.js requires Function.name. See https://github.com/cowboyd/funcadelic.js#compatibility`);

const VERSION = 0;

// A function that exists to check if the compiler is crushing
// function names. If it is we need to use `uniqueTag` to make sure
// there's no collisions when looking up `symbolNames`
function isCrushed() {}
let hasBeenMangled = typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed';
let uniqueTag = 0;

export function type(Class) {

  let name = Class.name;

  if (!name) {
    throw new Error('invalid typeclass name: ' + name);
  }

  let symbolName = `@@funcadelic-${VERSION}/${name}`;

  if (hasBeenMangled) {
    symbolName = symbolName.concat(`/${uniqueTag++}`);
  }

  let symbol = Symbol[symbolName] ? Symbol[symbolName] : Symbol[symbolName] = Symbol(symbolName);

  Class.for = function _for(value) {
    let i = value[symbol];
    if (!i) {
      throw new Error(`No instance found on ${value} of typeclass ${name}`);
    }
    return i;
  };

  Class.instance = function(constructor, methods) {
    constructor.prototype[symbol] = methods;
  };

  Class.symbol = symbol;

  let properties = getOwnPropertyDescriptors(Class.prototype);
  keys(properties).filter(key => key != 'constructor').forEach(key => {
    Class.prototype[key] = Class.prototype[key].bind(Class.for);
  });

  return Class;
}
