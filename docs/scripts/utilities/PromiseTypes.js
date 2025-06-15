export function DelayPromise(delay) {
    const { promise, resolve } = Promise.withResolvers();
    setTimeout(resolve, delay);
    return promise;
}
