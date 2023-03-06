export function choice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const identity = <T>(x: T): T => x;

type UnaryFunction<A, R> = (a: A) => R;

export function pipe<A, B>(a: A, ab: UnaryFunction<A, B>): B;
export function pipe<A, B, C>(
  a: A,
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
): C;
export function pipe<A, B, C, D>(
  a: A,
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
): D;
export function pipe<A, B, C, D, E>(
  a: A,
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
  de: UnaryFunction<D, E>,
): E;
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
  de: UnaryFunction<D, E>,
  ef: UnaryFunction<E, F>,
): F;
export function pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
  de: UnaryFunction<D, E>,
  ef: UnaryFunction<E, F>,
  fg: UnaryFunction<F, G>,
): G;
export function pipe<A>(argument: A, ...fns: UnaryFunction<any, any>[]) {
  return fns.reduce((acc, fn) => fn(acc), argument);
}

export function flow<A, B>(ab: UnaryFunction<A, B>): (a: A) => B;
export function flow<A, B, C>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
): (a: A) => C;
export function flow<A, B, C, D>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
): (a: A) => D;
export function flow<A, B, C, D, E>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
  de: UnaryFunction<D, E>,
): (a: A) => E;
export function flow<A, B, C, D, E, F>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
  de: UnaryFunction<D, E>,
  ef: UnaryFunction<E, F>,
): (a: A) => F;
export function flow<A, B, C, D, E, F, G>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
  de: UnaryFunction<D, E>,
  ef: UnaryFunction<E, F>,
  fg: UnaryFunction<F, G>,
): (a: A) => G;
export function flow<A>(...fns: UnaryFunction<any, any>[]) {
  return (argument: A) => fns.reduce((acc, fn) => fn(acc), argument);
}
