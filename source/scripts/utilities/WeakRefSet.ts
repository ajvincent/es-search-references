interface WeakRefSetInterface<T extends object> {
  /**
   * Add a weak reference to an object.
   * @param value - the object.
   */
  addReference(
    value: T
  ): void;

  /**
   * Report if this has a weak reference to an object.
   * @param value - the object.
   * @returns true if the weak reference exists.
   */
  hasReference(
    value: T
  ) : boolean;

  /**
   * Delete a reference, if the reference exists.
   * @param value - the object
   * @returns true if there was a deletion, false if the object was not held here.
   */
  deleteReference(
    value: T
  ) : boolean;

  /**
   * An iterator over all live objects the set references.
   *
   * @remarks
   *
   * This may iterate over objects which still exist, but are unreachable.
   * Objects are not necessarily deleted when their last reference is gone.
   */
  liveElements() : IterableIterator<T>;

  /** Clear all references. */
  clearReferences(): void;
}

export class WeakRefSet<T extends object>
implements WeakRefSetInterface<T>
{
  #valueToRef = new WeakMap<T, WeakRef<T>>();
  #references = new Set<WeakRef<T>>;

  readonly #callback = (ref: WeakRef<T>) => this.#references.delete(ref);
  #finalizer = new FinalizationRegistry<WeakRef<T>>(this.#callback);

  addReference(
    value: T
  ): void
  {
    let ref: WeakRef<T> | undefined = this.#valueToRef.get(value);
    if (!ref) {
      ref = new WeakRef(value);
      this.#valueToRef.set(value, ref);
      this.#finalizer.register(value, ref, ref);
      this.#references.add(ref);
    }
  }

  hasReference(
    value: T
  ) : boolean
  {
    return this.#valueToRef.has(value);
  }

  deleteReference(
    value: T
  ) : boolean
  {
    const ref = this.#valueToRef.get(value);
    if (!ref)
      return false;
    this.#valueToRef.delete(value);
    this.#references.delete(ref);
    this.#finalizer.unregister(ref);
    return true;
  }

  * liveElements() : IterableIterator<T>
  {
    for (const ref of this.#references.values()) {
      const value: T | undefined = ref.deref();
      if (value)
        yield value;
      else {
        this.#references.delete(ref);
        this.#finalizer.unregister(ref);
      }
    }
  }

  clearReferences(): void {
    this.#valueToRef = new WeakMap<T, WeakRef<T>>();
    this.#references = new Set<WeakRef<T>>;

    this.#finalizer = new FinalizationRegistry<WeakRef<T>>(this.#callback);
  }
}
