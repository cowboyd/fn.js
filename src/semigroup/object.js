import { Semigroup } from '../semigroup';
import { foldl } from '../foldable';
import propertiesOf from 'object.getownpropertydescriptors';
import stable from '../stable';

const { getPrototypeOf } = Object;

Semigroup.instance(Object, {
  append(o1, o2) {
    let properties = assign({}, propertiesOf(o1), propertiesOf(o2));
    return Object.create(getPrototypeOf(o1), stableize(properties));
  }
});

/**
 * Analogue of Object.assign(). Copies properties from one or more source objects to
 * a target object. Existing keys on the target object will be overwritten. 
 * Modified to support copying Symbols.
 */
function assign(target) {
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

/**
 * Make all of the computed values in this set of property descriptors
 * stable.
 *
 * Funcadelic works on immutable data, and as such the value of a
 * property should not change in between acesseses. If any of the
 * property descriptors have a `get` function, then that function
 * stableized so that it returns the same value every time.
 */
function stableize(properties) {
  return foldl((descriptors, key) => {
    let descriptor = properties[key];
    if (!descriptor.get) {
      descriptors[key] = descriptor;
    } else {
      let getter = descriptor.get;
      let cached = stable(instance => getter.call(instance));
      descriptor.get = function() {
        return cached(this);
      };
      descriptors[key] = descriptor;
    }
    return descriptors;
  }, {}, Object.keys(properties).concat(Object.getOwnPropertySymbols(properties)));
}
