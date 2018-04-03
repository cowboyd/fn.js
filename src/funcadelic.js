export { type } from "./typeclasses";

export { Semigroup, append } from './semigroup';
import './semigroup/object';
import './semigroup/array';

export { Monoid, reduce } from './monoid';
import './monoid/object';
import './monoid/array';

export { Functor, map } from './functor';
import './functor/object';
import './functor/array';
import './functor/promise';

export { Applicative, pure, apply } from './applicative';
import './applicative/promise';

export { Monad, flatMap } from './monad';
import './monad/array';
import './monad/promise';

export { Foldable, foldr, foldl } from './foldable'
import './foldable/array';
import './foldable/object';

export { Filterable, filter } from './filterable'
import './filterable/object';
import './filterable/array';

export { default as stable } from './stable';
