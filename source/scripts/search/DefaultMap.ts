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
    const hasKey = this.has(key);
    if (!hasKey) {
      this.set(key, this.#builder());
    }
    return this.get(key)!;
  }
}