import { Functor } from '../functor';
import { append } from '../semigroup';
import { foldr } from '../foldable';
import stable from '../stable';

const { getPrototypeOf } = Object;

Functor.instance(Object, {
  map(fn, object) {
    let properties = foldr(function(properties, entry) {
      return append(properties, {
        [entry.key]: {
          enumerable: true,
          get: stable(() => fn(entry.value, entry.key))
        }
      });
    }, {}, object);
    let prototype = getPrototypeOf(object);
    return Object.create(prototype, properties);
  }
});
