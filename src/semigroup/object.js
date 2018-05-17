import { Semigroup } from '../semigroup';
import { foldl } from '../foldable';
import stable from '../stable';

const { getPrototypeOf, getOwnPropertyDescriptors, getOwnPropertySymbols } = Object;

Semigroup.instance(Object, {
  append(o1, o2) {
    let properties = assign({}, getOwnPropertyDescriptors(o1), getOwnPropertyDescriptors(o2));
    return Object.create(getPrototypeOf(o1), stableize(properties));
  }
});

/**
 * Analogue of Object.assign(). Copies properties from one or more source objects to
 * a target object. Existing keys on the target object will be overwritten. 
 * Modified to support copying Symbols.
 * 
 * We need this to prevent append from breaking in React Native 
 * @see https://github.com/facebook/react-native/blob/master/Libraries/polyfills/Object.es6.js#L12
 */
function assign(target, a, b) {

  function copy(source) {    
    let keys = allKeys(source);
    let totalKeys = keys.length;
    for (let j = 0; j < totalKeys; j++) {
      let key = keys[j];
      target[key] = source[key];
    }
  }
  
  copy(a);
  copy(b);

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
  }, {}, allKeys(properties));
}

function allKeys(o) {
  return Object.keys(o).concat(getOwnPropertySymbols(o));
}