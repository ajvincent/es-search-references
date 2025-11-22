export class ThrottleTimer {
    #delay;
    #clientCallback;
    #timeout;
    #isRunning;
    constructor(delay, clientCallback) {
        this.#delay = delay;
        this.#clientCallback = clientCallback;
        this.#isRunning = false;
    }
    start = () => {
        if (this.#isRunning)
            window.clearTimeout(this.#timeout);
        this.#timeout = window.setTimeout(this.#handleTimeout, this.#delay);
        this.#isRunning = true;
    };
    flush() {
        if (this.#isRunning)
            this.#handleTimeout();
    }
    clear() {
        if (this.#isRunning)
            window.clearTimeout(this.#timeout);
        this.#isRunning = false;
    }
    #handleTimeout = () => {
        this.#isRunning = false;
        this.#clientCallback();
    };
}
