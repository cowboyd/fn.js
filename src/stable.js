const Stable = Symbol('Stable');

export default function stable(fn) {
  switch (fn.length) {
  case 0:
    return thunk(fn);
  case 1:
    return stableOne(fn);
  default:
    throw new Error(`Cannot (yet) make functions with ${fn.length} stable`);
  }
}

export function thunk(fn) {
  if (fn[Stable]) {
    return fn;
  }
  let evaluated = false;
  let result = undefined;
  function evaluate() {
    if (evaluated) {
      return result;
    } else {
      result = fn.call(this);
      evaluated = true;
      return result;
    }
  }
  evaluate[Stable] = true;
  return evaluate;
}

export function stableOne(fn) {
  if (fn[Stable]) {
    return fn;
  }
  let cache = new WeakMap();
  function stabilizedOne(argument) {
    if (!cache.has(argument)) {
      cache.set(argument, fn(argument));
    }
    return cache.get(argument);
  }

  stabilizedOne[Stable] = true;

  return stabilizedOne;
}