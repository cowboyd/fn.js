const { keys, getOwnPropertyDescriptors } = Object;

export function type(Class) {

  let name = Class.name;

  if (!name) {
    throw new Error('invalid typeclass name: ' + name);
  }

  let symbol = Symbol(name);

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
