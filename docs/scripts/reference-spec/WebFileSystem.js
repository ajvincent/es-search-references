// This file is auto-generated.  Do not edit.
import {
  AwaitedMap
} from "../utilities/AwaitedMap.js";

const createOptions = { create: true };

export async function installReferenceSpecs(webFS) {
  {
    const referencesDir = await webFS.packagesDir.getDirectoryHandle("es-search-references", createOptions);
    const guestHandle = await referencesDir.getFileHandle("guest", createOptions);
    const contents = `
/*
declare function searchReferences(
  this: void,
  resultsKey: string,
  targetValue: WeakKey,
  heldValues: readonly WeakKey[],
  strongReferencesOnly: boolean,
): void;
*/
export {};
    `.trim() + "\n";
    const writable = await guestHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  }

  const urlsMap = new AwaitedMap();

  urlsMap.set("virtual", webFS.urlsDir.getDirectoryHandle("virtual", createOptions));

  addDirectory(urlsMap, "virtual", "home");

  addDirectory(urlsMap, "virtual/home", "fixtures");

  addDirectory(urlsMap, "virtual/home/fixtures", "OneToOneStrongMap");

  // virtual://home/fixtures/OneToOneStrongMap/OneToOneStrongMap.js
  {
    const contents = `
import WeakStrongMap from "./WeakStrongMap.js";
class InternalKey {
    doNotCallMe() {
        throw new Error("don't call me");
    }
}
Object.freeze(InternalKey);
Object.freeze(InternalKey.prototype);
export default class OneToOneStrongMap {
    #baseMap = new WeakStrongMap;
    #weakValueToInternalKeyMap = new WeakMap;
    /**
     * Bind two sets of keys and values together.
     *
     * @param strongKey_1 - The strongly held key.
     * @param value_1 - The first value.
     * @param strongKey_2 - The second key.
     * @param value_2 - The second value.
     */
    bindOneToOne(strongKey_1, value_1, strongKey_2, value_2) {
        let internalKey = this.#weakValueToInternalKeyMap.get(value_1);
        const __otherInternalKey__ = this.#weakValueToInternalKeyMap.get(value_2);
        if (!internalKey) {
            internalKey = __otherInternalKey__ || new InternalKey;
        }
        else if (__otherInternalKey__ && (__otherInternalKey__ !== internalKey)) {
            return this.#attemptMergeKeys(internalKey, __otherInternalKey__);
        }
        const __hasKeySet1__ = this.#baseMap.has(internalKey, strongKey_1);
        const __hasKeySet2__ = this.#baseMap.has(internalKey, strongKey_2);
        if (__hasKeySet1__ && (this.#baseMap.get(internalKey, strongKey_1) !== value_1))
            throw new Error("value_1 mismatch!");
        if (__hasKeySet2__ && (this.#baseMap.get(internalKey, strongKey_2) !== value_2))
            throw new Error("value_2 mismatch!");
        this.#weakValueToInternalKeyMap.set(value_1, internalKey);
        this.#weakValueToInternalKeyMap.set(value_2, internalKey);
        if (!__hasKeySet1__)
            this.#baseMap.set(internalKey, strongKey_1, value_1);
        if (!__hasKeySet2__)
            this.#baseMap.set(internalKey, strongKey_2, value_2);
    }
    #attemptMergeKeys(firstInternalKey, secondInternalKey) {
        const firstKeySet = this.#baseMap.strongKeysFor(firstInternalKey);
        const secondKeySet = this.#baseMap.strongKeysFor(secondInternalKey);
        const unionKeySet = new Set([
            ...firstKeySet, ...secondKeySet
        ]);
        if (unionKeySet.size < firstKeySet.size + secondKeySet.size)
            throw new Error("value_1 and value_2 have conflicting keys!");
        for (const strongKey of secondKeySet) {
            const value = this.#baseMap.get(secondInternalKey, strongKey);
            this.#baseMap.set(firstInternalKey, strongKey, value);
            this.#baseMap.delete(secondInternalKey, strongKey);
            this.#weakValueToInternalKeyMap.set(value, firstInternalKey);
        }
    }
    /** Clear all bindings. */
    clear() {
        this.#baseMap = new WeakStrongMap;
        this.#weakValueToInternalKeyMap = new WeakMap;
    }
    /**
     * Delete a target value.
     *
     * @param value -The value.
     * @param strongKey - The strongly held key.
     * @returns True if the target value was deleted.
     */
    delete(value, strongKey) {
        const weakKey = this.#weakValueToInternalKeyMap.get(value);
        if (!weakKey)
            return false;
        const __target__ = this.#baseMap.get(weakKey, strongKey);
        if (!__target__)
            return false;
        const __returnValue__ = this.#baseMap.delete(weakKey, strongKey);
        if (__returnValue__) {
            this.#weakValueToInternalKeyMap.delete(__target__);
            const remainingKeys = this.#baseMap.strongKeysFor(weakKey);
            if (remainingKeys.size < 2) {
                for (const otherStrongKey of remainingKeys) {
                    const otherTarget = this.#baseMap.get(weakKey, otherStrongKey);
                    this.#weakValueToInternalKeyMap.delete(otherTarget);
                    this.#baseMap.delete(weakKey, otherStrongKey);
                }
            }
        }
        return __returnValue__;
    }
    /**
     * Get a target value.
     *
     * @param value - The value.
     * @param strongKey - The strongly held key.
     * @returns The target value.
     */
    get(value, strongKey) {
        const weakKey = this.#weakValueToInternalKeyMap.get(value);
        return weakKey ? this.#baseMap.get(weakKey, strongKey) : undefined;
    }
    /**
     * Determine if a target value exists.
     *
     * @param value - The value.
     * @param strongKey - The strongly held key.
     * @returns True if the target value exists.
     */
    has(value, strongKey) {
        const weakKey = this.#weakValueToInternalKeyMap.get(value);
        return weakKey ? this.#baseMap.has(weakKey, strongKey) : false;
    }
    /**
     * Determine if a target value is an identity in this map.
     *
     * @param value - The value.
     * @param strongKey - The strongly held key.
     * @param allowNotDefined - If true, treat the absence of the value as an identity.
     * @returns True if the target value exists.
     * @public
     */
    hasIdentity(value, strongKey, allowNotDefined) {
        const weakKey = this.#weakValueToInternalKeyMap.get(value);
        if (!weakKey) {
            return allowNotDefined;
        }
        return this.#baseMap.get(weakKey, strongKey) === value;
    }
    [Symbol.toStringTag] = "OneToOneStrongMap";
}
Object.freeze(OneToOneStrongMap);
Object.freeze(OneToOneStrongMap.prototype);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/fixtures/OneToOneStrongMap",
      "OneToOneStrongMap.js",
      contents
    );
  }

  // virtual://home/fixtures/OneToOneStrongMap/WeakStrongMap.js
  {
    const contents = `
export default class WeakStrongMap {
    #root = new WeakMap;
    constructor(iterable) {
        if (iterable) {
            for (const [weakKey, strongKey, value] of iterable) {
                this.set(weakKey, strongKey, value);
            }
        }
    }
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param weakKey - The weakly held key.
     * @param strongKey - The strongly held key.
     * @returns True if we found the value and deleted it.
     */
    delete(weakKey, strongKey) {
        const innerMap = this.#root.get(weakKey);
        if (!innerMap)
            return false;
        const rv = innerMap.delete(strongKey);
        if (innerMap.size === 0) {
            this.#root.delete(weakKey);
        }
        return rv;
    }
    /**
     * Get a value for a key set.
     *
     * @param weakKey - The weakly held key.
     * @param strongKey - The strongly held key.
     * @returns The value.  Undefined if it isn't in the collection.
     */
    get(weakKey, strongKey) {
        return this.#root.get(weakKey)?.get(strongKey);
    }
    /**
     * Guarantee a value for a key set.
     *
     * @param weakKey - The weakly held key.
     * @param strongKey - The strongly held key.
     * @param defaultGetter - A function to provide a default value if necessary.
     * @returns The value.
     */
    getDefault(weakKey, strongKey, defaultGetter) {
        if (!this.has(weakKey, strongKey)) {
            const result = defaultGetter();
            this.set(weakKey, strongKey, result);
            return result;
        }
        return this.get(weakKey, strongKey);
    }
    strongKeysFor(weakKey) {
        const innerMap = this.#root.get(weakKey);
        return new Set(innerMap?.keys() ?? []);
    }
    /**
     * Report if the collection has a value for a key set.
     *
     * @param weakKey -The weakly held key.
     * @param strongKey - The strongly held key.
     * @returns True if the key set refers to a value in the collection.
     */
    has(weakKey, strongKey) {
        return this.#root?.get(weakKey)?.has(strongKey) ?? false;
    }
    /**
     * Set a value for a key set.
     *
     * @param weakKey - The weakly held key.
     * @param strongKey - The strongly held key.
     * @param value - The value.
     */
    set(weakKey, strongKey, value) {
        if (!this.#root.has(weakKey)) {
            this.#root.set(weakKey, new Map);
        }
        this.#root.get(weakKey).set(strongKey, value);
        return this;
    }
    [Symbol.toStringTag] = "WeakStrongMap";
}
Object.freeze(WeakStrongMap);
Object.freeze(WeakStrongMap.prototype);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/fixtures/OneToOneStrongMap",
      "WeakStrongMap.js",
      contents
    );
  }

  addDirectory(urlsMap, "virtual/home", "reference-spec");

  // virtual://home/reference-spec/OneToOneStrongMap.js
  {
    const contents = `
import "es-search-references/guest";
import OneToOneStrongMap from "../fixtures/OneToOneStrongMap/OneToOneStrongMap.js";
class DummyMembrane {
    static #INTERNAL_KEY = Symbol("Internal object graph");
    #map = new OneToOneStrongMap;
    addArray(firstKey, firstArray, secondKey, secondArray) {
        if (!this.#map.has(firstArray, firstKey)) {
            const internalArray = [];
            for (let index = 0; index < firstArray.length; index++) {
                internalArray.push({});
            }
            /* Now, here's where things might go wrong.  The internal key isn't supposed to be
            something we hold objects for.  But the OneToOneStrongMap has no way of knowing
            this...
            */
            this.#map.bindOneToOne(firstKey, firstArray, DummyMembrane.#INTERNAL_KEY, internalArray);
        }
        this.#map.bindOneToOne(firstKey, firstArray, secondKey, secondArray);
    }
}
{
    const membrane = new DummyMembrane;
    const redArray = [{ isRedObject: true }];
    const blueArray = [{ isBlueObject: true }];
    const { proxy: redArrayProxy, revoke: redArrayRevoke } = Proxy.revocable(redArray, Reflect);
    membrane.addArray("red", redArrayProxy, "blue", blueArray);
    const redOwner = [redArray];
    const blueOwner = [blueArray];
    const { proxy: redOwnerProxy, revoke: redOwnerRevoke } = Proxy.revocable(redOwner, Reflect);
    membrane.addArray("red", redOwnerProxy, "blue", blueOwner);
    /* redArray should still be reachable:
    - the OneToOneStrongMap bound the blue objects to red proxies.
    - the red proxies pointed to the red objects.
    */
    searchReferences("proxied redArray via blueOwner", redArray, [membrane, blueOwner], true);
    redArrayRevoke();
    redOwnerRevoke();
    /* This time the answer should be no:
    - we revoked the proxies, so the red objects aren't reachable that way.
    */
    searchReferences("revoked redArray via blueOwner", redArray, [membrane, blueOwner], true);
    /* but did we clean up the proxies? */
    searchReferences("redArrayProxy via blueOwner", redArrayProxy, [membrane, blueOwner], true);
    searchReferences("redOwnerProxy via blueOwner", redOwnerProxy, [membrane, blueOwner], true);
}

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec",
      "OneToOneStrongMap.js",
      contents
    );
  }

  addDirectory(urlsMap, "virtual/home/reference-spec", "classes");

  // virtual://home/reference-spec/classes/classAccessors.js
  {
    const contents = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
const vehicleToOwnerMap = new WeakMap;
class Vehicle {
    constructor(owner) {
        vehicleToOwnerMap.set(this, owner);
    }
    get owner() {
        return vehicleToOwnerMap.get(this);
    }
}
const Fred = new Person("Fred");
const hisCar = new Vehicle(Fred);
// \`hisCar.owner === Fred\`
searchReferences("reaching a value via a getter", Fred, [hisCar], true);
class Bicycle {
    constructor(rider) {
        vehicleToOwnerMap.set(this, rider);
    }
    set rider(newRider) {
        vehicleToOwnerMap.set(this, newRider);
    }
}
const Wilma = new Person("Wilma");
const herBike = new Bicycle(Wilma);
// this should come back null:  there's no way to get a rider from herBike.
searchReferences("unreachable values with only a setter route", Wilma, [herBike], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/classes",
      "classAccessors.js",
      contents
    );
  }

  // virtual://home/reference-spec/classes/classPrivateAccessors.js
  {
    const contents = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
const vehicleToOwnerMap = new WeakMap;
class Vehicle {
    constructor(owner) {
        vehicleToOwnerMap.set(this, owner);
        void (this.#owner);
    }
    get #owner() {
        return vehicleToOwnerMap.get(this);
    }
}
const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);
searchReferences("class private getter", Fred, [hisBike], true);
class Bicycle {
    constructor(rider) {
        this.#rider = rider;
    }
    set #rider(newRider) {
        vehicleToOwnerMap.set(this, newRider);
    }
}
const Wilma = new Person("Wilma");
const herBike = new Bicycle(Wilma);
// this should come back null:  there's no way to get a rider from herBike.
searchReferences("unreachable values with only a setter route", Wilma, [herBike], true);
// no need for subclass tests: private fields live with the instance directly

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/classes",
      "classPrivateAccessors.js",
      contents
    );
  }

  // virtual://home/reference-spec/classes/classPrivateFields.js
  {
    const contents = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
class Vehicle {
    #owner;
    constructor(owner) {
        this.#owner = owner;
        void (this.#owner);
    }
}
const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);
searchReferences("class private fields", Fred, [hisBike], true);
// no need for subclass tests: private fields live with the instance directly

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/classes",
      "classPrivateFields.js",
      contents
    );
  }

  // virtual://home/reference-spec/classes/classStaticAccessors.js
  {
    const contents = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
const vehicleToOwnerMap = new Map;
class Vehicle {
    static get owners() {
        return vehicleToOwnerMap;
    }
    constructor(owner) {
        vehicleToOwnerMap.set(this, owner);
    }
}
const Fred = new Person("Fred");
const hisCar = new Vehicle(Fred);
void (hisCar);
searchReferences("class static getters", Fred, [Vehicle], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/classes",
      "classStaticAccessors.js",
      contents
    );
  }

  // virtual://home/reference-spec/classes/classStaticFields.js
  {
    const contents = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
class Vehicle {
    static owners = [];
    constructor(owner) {
        Vehicle.owners.push(owner);
    }
}
const Fred = new Person("Fred");
const hisCar = new Vehicle(Fred);
searchReferences("class static fields", Fred, [hisCar], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/classes",
      "classStaticFields.js",
      contents
    );
  }

  // virtual://home/reference-spec/classes/classStaticPrivateAccessors.js
  {
    const contents = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
const vehicleToOwnerMap = new Map;
class Vehicle {
    static get #owners() {
        return vehicleToOwnerMap;
    }
    constructor(owner) {
        Vehicle.#owners.set(this, owner);
    }
}
const Fred = new Person("Fred");
const hisCar = new Vehicle(Fred);
void (hisCar);
searchReferences("class static getters", Fred, [Vehicle], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/classes",
      "classStaticPrivateAccessors.js",
      contents
    );
  }

  // virtual://home/reference-spec/classes/classStaticPrivateFields.js
  {
    const contents = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
class Vehicle {
    static #owners = [];
    constructor(owner) {
        Vehicle.#owners.push(owner);
    }
}
const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);
searchReferences("class private static fields", Fred, [hisBike], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/classes",
      "classStaticPrivateFields.js",
      contents
    );
  }

  // virtual://home/reference-spec/classes/classesExtendingBuiltins.js
  {
    const contents = `
import "es-search-references/guest";
class DefaultWeakMap extends WeakMap {
    getDefault(key, builder) {
        let value = this.get(key);
        if (!value) {
            value = builder();
            this.set(key, value);
        }
        return value;
    }
}
const map = new DefaultWeakMap;
const target = {};
map.set(target, true);
// this should come up empty:  I exclude edges to built-ins via the \`[[Prototype]]\` chain.
searchReferences("DefaultWeakMap extends WeakMap", WeakMap, [map], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/classes",
      "classesExtendingBuiltins.js",
      contents
    );
  }

  // virtual://home/reference-spec/classes/classesExtendingOtherClasses.js
  {
    const contents = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
class Vehicle {
    owner;
    constructor(owner) {
        this.owner = owner;
    }
}
class Bicycle extends Vehicle {
    driver;
    constructor(owner, driver) {
        super(owner);
        this.driver = driver;
    }
}
const Fred = new Person("Fred");
const Betty = new Person("Betty");
const hisBike = new Bicycle(Fred, Betty);
searchReferences("Bicycle extends Vehicle", Vehicle, [hisBike], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/classes",
      "classesExtendingOtherClasses.js",
      contents
    );
  }

  // virtual://home/reference-spec/classes/classesWithoutExtensions.js
  {
    const contents = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
class Vehicle {
    owner;
    constructor(owner) {
        this.owner = owner;
    }
}
const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);
searchReferences("instance to class", Vehicle, [hisBike], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/classes",
      "classesWithoutExtensions.js",
      contents
    );
  }

  addDirectory(urlsMap, "virtual/home/reference-spec", "collections");

  // virtual://home/reference-spec/collections/mapKeyIsTarget.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const value = { isValue: true };
const objectHoldingTarget = new Map([[target, value]]);
const heldValues = [
    objectHoldingTarget,
];
searchReferences("strongMapHoldsKeyStrongly", target, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/collections",
      "mapKeyIsTarget.js",
      contents
    );
  }

  // virtual://home/reference-spec/collections/mapValueIsTarget.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const key = { isKey: true };
const objectHoldingTarget = new Map([[key, target]]);
const heldValues = [
    objectHoldingTarget,
];
searchReferences("strongMapHoldsValueStrongly", target, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/collections",
      "mapValueIsTarget.js",
      contents
    );
  }

  // virtual://home/reference-spec/collections/setHoldsTarget.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const objectHoldingTarget = new Set([target]);
const heldValues = [
    objectHoldingTarget,
];
searchReferences("setHoldsTargetStrongly", target, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/collections",
      "setHoldsTarget.js",
      contents
    );
  }

  // virtual://home/reference-spec/collections/weakMapKeyIsTarget.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const objectHoldingTarget = new WeakMap([[target, true]]);
const heldValues = [
    objectHoldingTarget,
];
searchReferences("weakMapHoldsKeyStrongly", target, heldValues, true);
searchReferences("weakMapHoldsKeyWeakly", target, heldValues, false);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/collections",
      "weakMapKeyIsTarget.js",
      contents
    );
  }

  // virtual://home/reference-spec/collections/weakMapValueIsTarget.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const key = { isKey: true };
const objectHoldingTarget = new WeakMap([[key, target]]);
const heldValues = [
    objectHoldingTarget,
];
searchReferences("weakMapHoldsValueStrongly", target, heldValues, true);
searchReferences("weakMapHoldsValueWeakly", target, heldValues, false);
heldValues.push(key);
searchReferences("weakMapAndKeyJointlyHoldValue", target, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/collections",
      "weakMapValueIsTarget.js",
      contents
    );
  }

  // virtual://home/reference-spec/collections/weakSetHoldsTarget.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const objectHoldingTarget = new WeakSet([target]);
const heldValues = [
    objectHoldingTarget,
];
searchReferences("weakSetHoldsTargetStrongly", target, heldValues, true);
searchReferences("weakSetHoldsTargetWeakly", target, heldValues, false);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/collections",
      "weakSetHoldsTarget.js",
      contents
    );
  }

  addDirectory(urlsMap, "virtual/home/reference-spec", "functions");

  // virtual://home/reference-spec/functions/arrow.js
  {
    const contents = `
import "es-search-references/guest";
class PropertyKeySorter {
    #symbolMap = new Map;
    /*
    addSymbol(key: symbol) : void
    {
      if (!this.#symbolMap.has(key))
        this.#symbolMap.set(key, this.#symbolMap.size + 1);
    }
  
    sort(keys: propertyKey[]) : void
    {
      keys.forEach(key => {
        if (typeof key === "symbol")
          this.addSymbol(key);
      });
  
      keys.sort(this.compare);
    }
    */
    compare = (a, b) => {
        const tA = typeof a, tB = typeof b;
        if (tA === "string") {
            if (tB === "string")
                return tA.localeCompare(tB);
            return -1;
        }
        if (tB === "string")
            return +1;
        const sA = this.#symbolMap.get(a), sB = this.#symbolMap.get(b);
        return sA - sB;
    };
}
const sorter = new PropertyKeySorter;
searchReferences("this as part of an arrow function", sorter, [sorter.compare], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/functions",
      "arrow.js",
      contents
    );
  }

  // virtual://home/reference-spec/functions/arrowReturnValue.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const returnTarget = () => target;
searchReferences("return target", target, [returnTarget], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/functions",
      "arrowReturnValue.js",
      contents
    );
  }

  // virtual://home/reference-spec/functions/asyncArrow.js
  {
    const contents = `
import "es-search-references/guest";
class PropertyKeySorter {
    #symbolMap = new Map;
    compare = async (a, b) => {
        await Promise.resolve();
        const tA = typeof a, tB = typeof b;
        if (tA === "string") {
            if (tB === "string")
                return tA.localeCompare(tB);
            return -1;
        }
        if (tB === "string")
            return +1;
        const sA = this.#symbolMap.get(a), sB = this.#symbolMap.get(b);
        return sA - sB;
    };
}
const sorter = new PropertyKeySorter;
searchReferences("this as part of an arrow function", sorter, [sorter.compare], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/functions",
      "asyncArrow.js",
      contents
    );
  }

  // virtual://home/reference-spec/functions/asyncClosures.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const miscellaneous = { isSomeOtherObject: true };
function createShallowEnclosure(firstValue, secondValue) {
    return async function () {
        await Promise.resolve();
        void (secondValue);
        return firstValue;
    };
}
const oneLevelDeepEnclosure = createShallowEnclosure(miscellaneous, target);
searchReferences("targetNotDirectlyHeld", target, [oneLevelDeepEnclosure], true);
function createDeepEnclosure(firstValue, secondValue) {
    return function () {
        return async function () {
            await Promise.resolve();
            void (secondValue);
            return firstValue;
        };
    };
}
const outerEnclosure = createDeepEnclosure(miscellaneous, target);
searchReferences("outerEnclosure", target, [outerEnclosure], true);
const innerEnclosure = outerEnclosure();
searchReferences("innerEnclosure", target, [innerEnclosure], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/functions",
      "asyncClosures.js",
      contents
    );
  }

  // virtual://home/reference-spec/functions/bound.js
  {
    const contents = `
import "es-search-references/guest";
class Person {
    name;
    constructor(name) {
        this.name = name;
    }
}
const vehicleToOwnerMap = new WeakMap;
class Vehicle {
    constructor(owner) {
        vehicleToOwnerMap.set(this, owner);
    }
}
function getOwner(vehicle) {
    return this.get(vehicle);
}
const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);
const boundGetOwner = getOwner.bind(vehicleToOwnerMap, hisBike);
searchReferences("bound function to target", Fred, [boundGetOwner], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/functions",
      "bound.js",
      contents
    );
  }

  // virtual://home/reference-spec/functions/closures.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const miscellaneous = { isSomeOtherObject: true };
function createShallowEnclosure(firstValue, secondValue) {
    return function () {
        void (secondValue);
        return firstValue;
    };
}
const oneLevelDeepEnclosure = createShallowEnclosure(miscellaneous, target);
searchReferences("targetNotDirectlyHeld", target, [oneLevelDeepEnclosure], true);
function createDeepEnclosure(firstValue, secondValue) {
    return function () {
        return function () {
            void (secondValue);
            return firstValue;
        };
    };
}
const outerEnclosure = createDeepEnclosure(miscellaneous, target);
searchReferences("outerEnclosure", target, [outerEnclosure], true);
const innerEnclosure = outerEnclosure();
searchReferences("innerEnclosure", target, [innerEnclosure], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/functions",
      "closures.js",
      contents
    );
  }

  // virtual://home/reference-spec/functions/returnValue.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
function returnTarget() {
    return target;
}
searchReferences("return target", target, [returnTarget], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/functions",
      "returnValue.js",
      contents
    );
  }

  addDirectory(urlsMap, "virtual/home/reference-spec", "iterators");

  // virtual://home/reference-spec/iterators/array.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };
const iterator = ([firstValue, target, lastValue]).values();
searchReferences("before visiting any values", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the first value", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the target value", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the last value", target, [iterator], true);
void (iterator.next());
searchReferences("after completing the iterator", target, [iterator], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/iterators",
      "array.js",
      contents
    );
  }

  // virtual://home/reference-spec/iterators/helpers.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };
let iterator = ([firstValue, target, lastValue]).values();
//@ts-expect-error this isn't supported in TypeScript's ES2024... ES2025 may have it.
iterator = iterator.filter((p) => p !== lastValue);
searchReferences("before visiting any values", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the first value", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the target value", target, [iterator], true);
/* we're excluding the last value, so the next call will be { value: undefined, done: true }
void(iterator.next());
searchReferences("after visiting the last value", target, [iterator], true);
*/
void (iterator.next());
searchReferences("after completing the iterator", target, [iterator], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/iterators",
      "helpers.js",
      contents
    );
  }

  // virtual://home/reference-spec/iterators/map.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };
const iterator = new Map([
    [0, firstValue],
    [1, target,],
    [2, lastValue]
]).values();
searchReferences("before visiting any values", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the first value", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the target value", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the last value", target, [iterator], true);
void (iterator.next());
searchReferences("after completing the iterator", target, [iterator], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/iterators",
      "map.js",
      contents
    );
  }

  // virtual://home/reference-spec/iterators/regExpString.js
  {
    const contents = `
export {};
// nothing here yet, not sure we need this

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/iterators",
      "regExpString.js",
      contents
    );
  }

  // virtual://home/reference-spec/iterators/set.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };
const iterator = new Set([firstValue, target, lastValue]).values();
searchReferences("before visiting any values", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the first value", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the target value", target, [iterator], true);
void (iterator.next());
searchReferences("after visiting the last value", target, [iterator], true);
void (iterator.next());
searchReferences("after completing the iterator", target, [iterator], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/iterators",
      "set.js",
      contents
    );
  }

  // virtual://home/reference-spec/iterators/user-defined.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };
class ObjectIterator {
    #count = 0;
    next(...[value]) {
        void (value);
        if (this.#count === 0) {
            this.#count++;
            return { value: firstValue, done: false };
        }
        if (this.#count === 1) {
            this.#count++;
            return { value: target, done: false };
        }
        if (this.#count === 2) {
            this.#count++;
            return { value: lastValue, done: true };
        }
        return { value: undefined, done: true };
    }
}
const iter = new ObjectIterator;
searchReferences("no explicit hold", target, [iter], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/iterators",
      "user-defined.js",
      contents
    );
  }

  addDirectory(urlsMap, "virtual/home/reference-spec", "module-imports");

  // virtual://home/reference-spec/module-imports/exportAddProperty.js
  {
    const contents = `
import "es-search-references/guest";
import wrapObject from "./exportWrapObject.js";
export default function addProperty(value) {
    return {
        ...wrapObject(value),
        addedProperty: { isAddedProperty: true },
    };
}

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/module-imports",
      "exportAddProperty.js",
      contents
    );
  }

  // virtual://home/reference-spec/module-imports/exportWrapObject.js
  {
    const contents = `
import "es-search-references/guest";
export default function wrapObject(value) {
    return { value };
}

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/module-imports",
      "exportWrapObject.js",
      contents
    );
  }

  // virtual://home/reference-spec/module-imports/importWrapObject.js
  {
    const contents = `
import "es-search-references/guest";
import addProperty from "./exportAddProperty.js";
const target = { isTarget: true };
const objectHoldingTarget = addProperty(target);
const heldValues = [
    objectHoldingTarget,
];
searchReferences("importWrapObject", target, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/module-imports",
      "importWrapObject.js",
      contents
    );
  }

  addDirectory(urlsMap, "virtual/home/reference-spec", "simple");

  // virtual://home/reference-spec/simple/asyncGenerators.js
  {
    const contents = `
import "es-search-references/guest";
class IdObject {
    id;
    constructor(id) {
        this.id = id;
    }
}
const target = new IdObject("target");
const firstValue = new IdObject("firstValue");
const lastValue = new IdObject("lastValue");
async function* objectGenerator() {
    yield await Promise.resolve(firstValue);
    yield await Promise.resolve(target);
    yield await Promise.resolve(lastValue);
    return;
}
const generator = objectGenerator();
searchReferences("generator holds target strongly", target, [generator], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "asyncGenerators.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/finalizationRegistry.js
  {
    const contents = `
import "es-search-references/guest";
const foundHeldValues = new Set;
function callback(value) {
    foundHeldValues.add(value);
}
const registry = new FinalizationRegistry(callback);
searchReferences("callback", callback, [registry], true);
const target = { isTarget: true };
const registryHeld = { isRegistryHeld: true };
const token = { isToken: true };
registry.register(target, registryHeld, token);
searchReferences("target before unregistration (strong)", target, [registry], true);
searchReferences("target before unregistration (weak)", target, [registry], false);
searchReferences("heldValue before unregistration (strong)", registryHeld, [registry], true);
searchReferences("heldValue before unregistration (weak)", registryHeld, [registry], false);
searchReferences("heldValue before unregistration (joint)", registryHeld, [registry, target], true);
searchReferences("unregisterToken before unregistration (strong)", token, [registry], true);
searchReferences("unregisterToken before unregistration (weak)", token, [registry], false);
searchReferences("unregisterToken before unregistration (joint)", token, [registry, target], false);
registry.unregister(token);
searchReferences("target after unregistration", target, [registry], false);
searchReferences("heldValue after unregistration", registryHeld, [registry], true);
searchReferences("unregisterToken after unregistration", token, [registry], false);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "finalizationRegistry.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/generators.js
  {
    const contents = `
import "es-search-references/guest";
class IdObject {
    id;
    constructor(id) {
        this.id = id;
    }
}
const target = new IdObject("target");
const firstValue = new IdObject("firstValue");
const lastValue = new IdObject("lastValue");
function* objectGenerator() {
    yield firstValue;
    yield target;
    return lastValue;
}
const generator = objectGenerator();
searchReferences("generator holds target strongly", target, [generator], true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "generators.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/promises.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
{
    const { promise, resolve } = Promise.withResolvers();
    resolve(target);
    searchReferences("promise directly resolved to target", target, [promise], true);
}
{
    const { promise, reject } = Promise.withResolvers();
    reject(target);
    searchReferences("promise directly rejected to target", target, [promise], true);
    promise.catch(() => { void (null); });
}
//#region then, resolve()
{
    const { promise, resolve } = Promise.withResolvers();
    const afterPromise = promise.then(() => target);
    searchReferences("promise.then() to target, before resolve", target, [promise], true);
    searchReferences("promise.then() pending target, before resolve", target, [afterPromise], true);
    resolve();
    // this runs the jobs through promise and afterPromise.
    await Promise.resolve();
    searchReferences("promise.then() to target, after resolve", target, [promise], true);
    searchReferences("promise.then() resolved to target", target, [afterPromise], true);
}
//#endregion then, resolve()
//#region catch, resolve()
{
    const { promise, resolve } = Promise.withResolvers();
    const afterPromise = promise.catch(() => target);
    searchReferences("promise.catch() to target, before resolve", target, [promise], true);
    searchReferences("promise.catch() pending target, before resolve", target, [afterPromise], true);
    resolve();
    // this runs the jobs through promise and afterPromise.
    await Promise.resolve();
    searchReferences("promise.catch() to target, after resolve", target, [promise], true);
    searchReferences("promise.catch() resolved to target", target, [afterPromise], true);
}
//#endregion catch, resolve()
//#region finally, resolve()
{
    const { promise, resolve } = Promise.withResolvers();
    promise.finally(() => { return target; });
    searchReferences("promise.finally() to target, before resolve", target, [promise], true);
    resolve();
    // this runs the jobs through promise and afterPromise.
    await Promise.resolve();
    searchReferences("promise.finally() to target, after resolve", target, [promise], true);
}
//#endregion finally, resolve()
//#region then, reject()
{
    const { promise, reject } = Promise.withResolvers();
    const afterPromise = promise.then(() => target);
    afterPromise.catch(() => void (null));
    // no test before reject, as this duplicates the .then()/resolve() case above to this point
    reject();
    // this runs the jobs through promise and afterPromise.
    await Promise.resolve();
    searchReferences("promise.then() to target, after reject", target, [promise], true);
    searchReferences("promise.then() rejected to target", target, [afterPromise], true);
}
//#endregion then, reject()
//#region catch, reject()
{
    const { promise, reject } = Promise.withResolvers();
    const afterPromise = promise.catch(() => target);
    // no test before reject, as this duplicates the .catch()/resolve() case above to this point
    reject();
    // this runs the jobs through promise and afterPromise.
    await Promise.resolve();
    searchReferences("promise.catch() to target, after reject", target, [promise], true);
    searchReferences("promise.catch() rejected to target", target, [afterPromise], true);
}
//#region finally, reject()
{
    const { promise, reject } = Promise.withResolvers();
    promise.finally(() => target).catch(() => void (null));
    // no test before reject, as this duplicates the .finally()/resolve() case above to this point
    reject();
    // this runs the jobs through promise and afterPromise.
    await Promise.resolve();
    searchReferences("promise.finally() to target, after reject", target, [promise], true);
}
//#endregion finally, reject()
/*
  Promise.all, Promise.race, etc. do not hold references to their passed-in
  iterable's members.  Rather, each member holds a reference to the returned promise.

  So looking up references on a Promise.all call is useless.
*/

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "promises.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/proxies.js
  {
    const contents = `
import "es-search-references/guest";
const NotImplementedProxyHandler = {
    searchTarget: { searchTargetOf: "ProxyHandler" },
    apply(target, thisArg, argArray) {
        throw new Error("Method not implemented.");
    },
    construct(target, argArray, newTarget) {
        throw new Error("Method not implemented.");
    },
    defineProperty(target, property, attributes) {
        throw new Error("Method not implemented.");
    },
    deleteProperty(target, p) {
        throw new Error("Method not implemented.");
    },
    get(target, p, receiver) {
        throw new Error("Method not implemented.");
    },
    getOwnPropertyDescriptor(target, p) {
        throw new Error("Method not implemented.");
    },
    getPrototypeOf(target) {
        throw new Error("Method not implemented.");
    },
    has(target, p) {
        throw new Error("Method not implemented.");
    },
    isExtensible(target) {
        throw new Error("Method not implemented.");
    },
    ownKeys(target) {
        throw new Error("Method not implemented.");
    },
    preventExtensions(target) {
        throw new Error("Method not implemented.");
    },
    set(target, p, newValue, receiver) {
        throw new Error("Method not implemented.");
    },
    setPrototypeOf(target, v) {
        throw new Error("Method not implemented.");
    },
};
const shadowTarget = {
    searchTarget: {
        searchTargetOf: "shadowTarget"
    }
};
const { proxy, revoke } = Proxy.revocable(shadowTarget, NotImplementedProxyHandler);
searchReferences("shadow target held before revocation", shadowTarget, [proxy], true);
searchReferences("proxy handler held before revocation", NotImplementedProxyHandler, [proxy], true);
searchReferences("proxy held before revocation", proxy, [revoke], true);
searchReferences("revoke not held by proxy", revoke, [proxy], false);
// shadow targets shouldn't be searched
searchReferences("shadow search target", shadowTarget.searchTarget, [proxy], false);
// proxy handlers should be searched
searchReferences("proxy handler search target", NotImplementedProxyHandler.searchTarget, [proxy], true);
revoke();
searchReferences("shadow target held by proxy after revocation", shadowTarget, [proxy], false);
searchReferences("proxy handler held by proxy after revocation", NotImplementedProxyHandler, [proxy], false);
searchReferences("proxy held after revocation", proxy, [revoke], false);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "proxies.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/symbolKeyHoldsTarget.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const symbolKey = Symbol("This is a symbol");
const objectHoldingTarget = { [symbolKey]: target };
const heldValues = [
    objectHoldingTarget,
];
searchReferences("symbolKeyHoldsTarget", target, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "symbolKeyHoldsTarget.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/targetInHeldValuesArray.js
  {
    const contents = `
import "es-search-references/guest";
const objectTarget = { isTarget: true };
const differentTargetName = objectTarget;
const isFirstValue = { isFirstValue: true };
const symbolTarget = Symbol("is symbol target");
const heldValues = [
    isFirstValue,
    differentTargetName,
    symbolTarget,
];
searchReferences("target object in held values", objectTarget, heldValues, true);
searchReferences("target symbol in held values", symbolTarget, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "targetInHeldValuesArray.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/targetIsElementOfHeldArray.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const arrayHoldingTarget = [target];
const isFirstValue = { isFirstValue: true };
const isLastValue = { isLastValue: true };
const heldValues = [
    isFirstValue,
    arrayHoldingTarget,
    isLastValue,
];
searchReferences("targetIsElementOfHeldArray", target, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "targetIsElementOfHeldArray.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/targetIsElementOfHeldObject.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const objectHoldingTarget = { target };
const isFirstValue = { isFirstValue: true };
const isLastValue = { isLastValue: true };
const heldValues = [
    isFirstValue,
    objectHoldingTarget,
    isLastValue,
];
searchReferences("targetIsElementOfHeldObject", target, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "targetIsElementOfHeldObject.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/targetIsSymbolKeyOfHeldObject.js
  {
    const contents = `
import "es-search-references/guest";
const target = Symbol("is target");
const isTailValue = { isTailValue: true };
const objectHoldingTarget = { [target]: isTailValue };
const heldValues = [
    objectHoldingTarget,
];
searchReferences("target is symbol key of held object", target, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "targetIsSymbolKeyOfHeldObject.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/targetUnreachable.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const isFirstValue = { isFirstValue: true };
const isLastValue = { isLastValue: true };
const heldValues = [
    isFirstValue,
    isLastValue,
];
searchReferences("targetUnreachable", target, heldValues, true);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "targetUnreachable.js",
      contents
    );
  }

  // virtual://home/reference-spec/simple/weakRefToTarget.js
  {
    const contents = `
import "es-search-references/guest";
const target = { isTarget: true };
const weakRef = new WeakRef(target);
const heldValues = [
    weakRef,
];
searchReferences("WeakRef to target does not hold strongly", target, heldValues, true);
searchReferences("weakRef to target holds weakly", target, heldValues, false);

    `.trim() + "\n";
    addFile(
      urlsMap,
      "virtual/home/reference-spec/simple",
      "weakRefToTarget.js",
      contents
    );
  }

  await urlsMap.allResolved();
}

function addDirectory(urlsMap, parentDirectory, directoryName) {
  let promise = urlsMap.get(parentDirectory);
  promise = promise.then(
    dirHandle => dirHandle.getDirectoryHandle(directoryName, createOptions)
  );
  urlsMap.set(parentDirectory + "/" + directoryName, promise);
}

function addFile(urlsMap, parentDirectory, fileName, contents) {
  let promise = urlsMap.get(parentDirectory);
  promise = promise.then(async dirHandle => {
    const fileHandle = await dirHandle.getFileHandle(fileName, createOptions);
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  });

  urlsMap.set(parentDirectory + "/" + fileName, promise);
}
