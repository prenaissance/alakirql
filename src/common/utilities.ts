export function choice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const identity = <T>(x: T): T => x;
