import { Functor } from './functor';
import { foldl } from './foldable';
import { type } from './typeclasses';
import curry from 'fk';

export const Applicative = type(class Applicative extends Functor {
  pure(Type, value) {
    return this(Type.prototype).pure(value);
  }

  apply(Type, fn, list) {
    let { pure, applyOne } = this(Type.prototype);
    let initial = pure(curry(fn));
    return foldl((left, right) => applyOne(left, right), initial, list);
  }

  applyOne(left, right) {
    this(left).applyOne(right);
  }
});

export const { pure, apply, applyOne } = Applicative.prototype;
