export function DelayPromise(delay: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, delay);
  return promise;
}
