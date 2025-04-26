export class DefaultMap<K, V> extends Map<K, V>
{
  readonly #builder: () => V;

  constructor(
    builder: () => V
  )
  {
    super();
    this.#builder = builder;
  }

  getDefault(key: K): V {
    let value = this.get(key);
    if (!value) {
      value = this.#builder();
      this.set(key, value);
    }
    return value;
  }
}