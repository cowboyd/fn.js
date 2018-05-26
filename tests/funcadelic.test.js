import 'jest';

import { apply, map, append, foldr, foldl, filter, pure, reduce, flatMap, Monoid, Functor, type, stable } from 'funcadelic';
import {curry} from '../src/applicative';

function promise(result) {
  return Promise.resolve(result);
}

describe('typeclasses', function() {
  it('exports type function', function() {
    expect(type).toBeInstanceOf(Function);
  });
});

describe('Functor', function() {
  it('maps objects', function() {
    expect(map((i) => i * 2, {one: 1, two: 2})).toEqual({one: 2, two: 4});
  });
  it('maps objects, and maintains stability over its values.', function() {
    let objects =  map(i => ({}), {one: 1, two: 2});
    expect(objects.one).toBe(objects.one);
  });
  it('maps arrays', function() {
    expect(map(i => i * 2, [1, 2, 3])).toEqual([2,4,6]);
  });
  it('maps promises', function() {
    return map(i => i * 2, promise(5)).then((result) => {
      expect(result).toBe(10);
    });
  });
  it('passes the key to the mapping function for objects', function() {
    expect(map((_, name) => `hello ${name}`, {one: 1, two: 2})).toEqual({one: 'hello one', two: 'hello two'});
  });
});

describe('Semigroup', function() {
  it('appends objects', function() {
    expect(append({one: 1, two: 2}, {two: 'two', three: 3})).toEqual({one: 1, two: 'two', three: 3});
  });
  it('copies symbols', () => {
    let a1 = Symbol();
    let a2 = Symbol();
    let result = append({ [a1]: true }, { [a2]: 42 });
    expect(result[a1]).toBe(true);
    expect(result[a2]).toBe(42);
  });
  it('appends arrays', function() {
    expect(append([1,2,3], [4,4,4])).toEqual([1,2,3,4,4,4]);
  });
  it('maintains prototype', function() {
    class OneAndTwo {
      constructor() {
        this.one = 1;
        this.two = 2;
      }
    }
    expect(append(new OneAndTwo(), { two: 'two', three: 3 })).toBeInstanceOf(OneAndTwo);
  });
  it('stabilizes getters on appended object', () => {
    let result = append({ two: 2, three: 3 }, {
      get sum() {
        return new Number(this.two + this.three);
      }
    });
    expect(result.sum).toBe(result.sum);
  });
  it('stabilizes getters on initial object', () => {
    let result = append({
      get sum() {
        return new Number(this.two + this.three);
      }
    }, { two: 2, three: 3 });

    expect(result.sum).toBe(result.sum);
  });
  it('includes symbols', () => {
    let symbol = Symbol();
    let obj = {
      [symbol]: true
    };
    let result = append(obj, {});

    expect(obj[symbol]).toBe(true);
    expect(Object.getOwnPropertySymbols(obj)).toEqual([symbol]);

    expect(Object.getOwnPropertySymbols(result)).toEqual([symbol]);
    expect(result[symbol]).toBe(true);
  });
  it('caches getters per instance', () => {
    let numbers = append({ data: [1, 2, 3] }, {
      get upperCaseStrings() {
        return this.data.map(n => `${n}`.toUpperCase());
      }
    });
    expect(numbers.upperCaseStrings).toEqual(['1', '2', '3']);
    expect(numbers.upperCaseStrings).toBe(numbers.upperCaseStrings);

    let letters = append(numbers, { data: [ 'a', 'b', 'c']});
    expect(letters.upperCaseStrings).toEqual(['A', 'B', 'C']);
    expect(letters.upperCaseStrings).toBe(letters.upperCaseStrings);
  });
});

describe('Monoid', function () {
  it('reduces arrays', function() {
    expect(reduce(Array, [[1,2,3], [4,5,6]])).toEqual([1,2,3,4,5,6]);
  });
  it('reduces objects', function() {
    expect(reduce(Object, [{first: 'Charles'}, {last: 'Lowell'}])).toEqual({first: 'Charles', last: 'Lowell'});
  });

  it('Allows you to define one-off monoids for convenience', function() {
    let Sum = Monoid.create(class Sum {
      empty() { return 0; }
      append(a, b) {
        return a + b;
      }
    });
    expect(Sum.reduce([1,2,3,4])).toBe(10);
  });
});

describe('Foldable', function() {
  it('folds arrays', function() {
    expect(foldr((sum, i) => sum + i, 0, [1,2,3,4])).toBe(10);
    expect(foldl((sum, i) => sum + i, 0, [1,2,3,4])).toBe(10);
  });
  it('folds objects', function() {
    expect(foldl((reverse, entry) => append(reverse, {[entry.value]: entry.key}), {}, {
      one: 'won',
      two: 'two'
    })).toEqual({won: 'one', two: 'two'});
    expect(foldr((reverse, { key, value }) => append(reverse, {[value]: key}), {}, {
      one: 'won',
      two: 'two'
    })).toEqual({won: 'one', two: 'two'});
  });
});

describe('Filterable', function() {
  it('filters arrays', function() {
    expect(filter(x => x > 5, [10,3,10, 5])).toEqual([10,10]);
  });
  it('filters objects', function() {
    expect(filter(({key}) => key !== 'nope', {yes: 1, yep: 2, nope: 3, yup: 4}))
      .toEqual({yes: 1, yep: 2, yup: 4});
  });
  it('preserves prototype', function() {
    class MyClass {}
    expect(filter(memo => memo, new MyClass())).toBeInstanceOf(MyClass);
  });
});

describe('Applicative', function() {
  it('applies to promises', function() {
    let greeting = (say, to, isExcited) => `${say}, ${to}${isExcited ? '!!' : ''}`;

    return apply(Promise, greeting, [promise('Hello'), promise('World'), promise(true)])
      .then(result => expect(result).toBe('Hello, World!!'));
  });
  it('can invoke pure statically', function() {
    return pure(Promise, "now I'm in a promise").then(msg => {
      expect(msg).toBe("now I'm in a promise");
    });
  });
});

describe('Monad', function() {
  it('flatMaps arrays', function() {
    expect(flatMap(x => [x, -x], [1,2,3])).toEqual([1,-1, 2, -2, 3, -3]);
  });
  it('flatMaps promises', function() {
    return flatMap(str => Promise.resolve(`${str} World!`), pure(Promise, "Hello"))
      .then(result => expect(result).toBe("Hello World!"));
  });
});


describe('A Typeclass', function () {
  it('has an associated symbol', function() {
    expect(Functor.symbol).toBeDefined();
    expect(Object.getOwnPropertyNames(Object.prototype)).toContain(Functor.symbol);
  });
});

describe('stable function', () => {
  describe('thunk', () => {
    it('returns stabilized function when attempting to stabilize a thunk', () => {
      let stabilized = stable(() => {});
      expect(stable(stabilized)).toBe(stabilized);
    });
  });
  describe('stableOne', () => {
    it('caches result when passed an object', () => {
      let one = {};
      let two = {};
      let dateMaker = instance => new Date();
      let stableDateMaker = stable(dateMaker);
      expect(stableDateMaker(one)).toBe(stableDateMaker(one)); 
      expect(stableDateMaker(two)).toBe(stableDateMaker(two));
      expect(stableDateMaker(one)).not.toBe(stableDateMaker(two));
    });
    it('returns stabilized function when attempting to stabilize a function with one argument', () => {
      let stabilized = stable(arg => arg);
      expect(stable(stabilized)).toBe(stabilized);
    });
  });
});

describe('curry', () => {
  let curried = curry(function (x, y) { return [].slice.call(arguments)});
  let partial = curried(1);
  
  it('returns curried function when passing one argument', () => {
    expect(partial).toBeInstanceOf(Function);
  });
  it('receives all arguments when partial function receives all expected arguments', () => {
    expect(partial(2)).toEqual([1, 2]);
  });
  it('receives all arguments when partial function receives more than expected arguments', () => {
    expect(partial(2, 3)).toEqual([1, 2, 3]);
  });
  it('returns value when all arguments passed', () => {
    expect(curried(1, 2)).toEqual([1, 2]);
  });
  it('supports extra arguments', () => {
    expect(curried(1, 2, 3)).toEqual([1, 2, 3]);
  });
});