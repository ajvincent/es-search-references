export class ThrottleTimer {
  readonly #delay: number;
  readonly #clientCallback: (this: void) => void;
  #timeout?: number;
  #isRunning: boolean;

  constructor(
    delay: number,
    clientCallback: (this: void) => void
  )
  {
    this.#delay = delay;
    this.#clientCallback = clientCallback;
    this.#isRunning = false;
  }

  start = (): void => {
    if (this.#isRunning)
      window.clearTimeout(this.#timeout);
    this.#timeout = window.setTimeout(this.#handleTimeout, this.#delay);
    this.#isRunning = true;
  }

  flush(): void {
    if (this.#isRunning)
      this.#handleTimeout();
  }

  clear(): void {
    if (this.#isRunning)
      window.clearTimeout(this.#timeout);
    this.#isRunning = false;
  }

  #handleTimeout = () => {
    this.#isRunning = false;
    this.#clientCallback();
  }
}
