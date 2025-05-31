import { JsonObject, ReadonlyDeep } from 'type-fest';
import { Graph } from '@dagrejs/graphlib';

interface GuestRealmInputs {
  readonly startingSpecifier: string;
  readonly contentsGetter: (specifier: string) => string;
  readonly resolveSpecifier: (targetSpecifier: string, sourceSpecifier: string) => string;
}

interface SearchConfiguration {
  /**
   * Callback for when a search starts.
   * @param sourceSpecifier - the location of the source file
   * @param resultKey - an unique string key so searches can be distinguished from one another.
   */
  beginSearch?(sourceSpecifier: string, resultsKey: string): void;

  /**
   * Callback for when a search ends.
   * @param sourceSpecifier - the location of the source file
   * @param resultKey - an unique string key so searches can be distinguished from one another.
   */
  endSearch?(sourceSpecifier: string, resultsKey: string): void;

  /** Ye olde log function. */
  log?(message: string, indentLevel?: number): void;

  enterNodeIdTrap?: (nodeId: string) => void;
  leaveNodeIdTrap?: (nodeId: string) => void;

  /**
   * A callback for when we attempt to define a node, even if the node already exists.
   * @param newWeakKey - the weak key we have.
   * @param details - contextual details as to why we tried to do this.
   */
  defineNodeTrap?: (parentKey: string, newWeakKey: string, details: string) => void;

  /**
   * A callback for when we actually build a weak key.
   * @param weakKey - the new weak key.
   */
  defineWeakKeyTrap?: (weakKey: string) => void;

  /**
   * A callback for defining a graph edge.
   * @param parentId - the parent node id.
   * @param edgeId - the edge id.
   * @param childId - the child node id.
   * @param secondParentId - a second parent node id, if available.
   * @param isStrongReference - true if the reference is a strong one.
   * @returns
   */
  defineEdgeTrap?: (
    parentId: string,
    edgeId: string,
    childId: string,
    secondParentId: string | undefined,
    isStrongReference: boolean
  ) => void;

  /**
   * Callback for when a searchReferences() call has an unexpected internal error.
   */
  internalErrorTrap?: () => void;

  markStrongNodeTrap?: (
    nodeId: string
  ) => void;

  /**
   * True if we should exclude values available to functions (this, super, arguments).
   * Usually you do not want this, but for internal development purposes (reducing noise
   * in search-references testcases) this can be very helpful.
   */
  noFunctionEnvironment?: boolean;
}

declare class LoggingConfiguration implements Required<SearchConfiguration> {
    #private;
    noFunctionEnvironment: boolean;
    beginSearch(sourceSpecifier: string, resultsKey: string): void;
    endSearch(sourceSpecifier: string, resultsKey: string): void;
    internalErrorTrap(): void;
    log(message: string, indentLevel?: number): void;
    enterNodeIdTrap(nodeId: string): void;
    leaveNodeIdTrap(nodeId: string): void;
    defineNodeTrap(parentId: string, weakKey: string, details: string): void;
    defineEdgeTrap(parentId: string, edgeId: string, childId: string, secondParentId: string | undefined, isStrongReference: boolean): void;
    defineWeakKeyTrap(weakKey: string): void;
    markStrongNodeTrap(nodeId: string): void;
    retrieveLogs(sourceSpecifier: string, resultsKey: string): readonly string[] | undefined;
}

declare function runSearchesInGuestEngine(inputs: GuestRealmInputs, searchConfiguration?: SearchConfiguration): Promise<ReadonlyMap<string, Graph | null>>;

declare enum ValueDiscrimant {
    NotApplicable = "NotApplicable",
    Object = "Object",
    Symbol = "Symbol",
    BigInt = "BigInt",
    Primitive = "Primitive"
}
declare enum BuiltInJSTypeName {
    Symbol = "Symbol",
    Object = "Object",
    Array = "Array",
    Function = "Function",
    AsyncFunction = "AsyncFunction",
    WeakRef = "WeakRef",
    WeakMap = "WeakMap",
    WeakSet = "WeakSet",
    Map = "Map",
    Set = "Set",
    Promise = "Promise",
    Proxy = "Proxy",
    FinalizationRegistry = "FinalizationRegistry",
    PrivateName = "#private",
    ArrayIterator = "ArrayIterator",
    MapIterator = "MapIterator",
    SetIterator = "SetIterator",
    Generator = "Generator",
    AsyncGenerator = "AsyncGenerator",
    IteratorHelper = "IteratorHelper"
}
declare enum NodePrefix {
    Object = "object",
    Symbol = "symbol",
    Target = "target",
    HeldValues = "heldValues",
    KeyValueTuple = "keyValueTuple",
    FinalizationTuple = "finalizationTuple",
    PrivateName = "privateName",
    PrivateFieldTuple = "privateFieldTuple"
}
declare enum ChildReferenceEdgeType {
    PropertyName = "PropertyName",
    ArrayIndex = "ArrayIndex",
    PropertySymbol = "PropertySymbol",
    SymbolKey = "SymbolKey",
    ScopeValue = "ScopeValue",
    PrivateClassKey = "PrivateClassKey",
    PrivateClassValue = "PrivateClassValue",
    InternalSlot = "InternalSlot",
    SetElement = "SetElement",
    MapKey = "MapKey",
    MapValue = "MapValue"
}
declare enum EdgePrefix {
    PropertyKey = "propertyKey",
    GetterKey = "getterKey",
    HasSymbolAsKey = "hasSymbolAsKey",
    ScopeValue = "scopeValue",
    InternalSlot = "internalSlot",
    MapToTuple = "mapToTuple",
    MapKey = "mapKey",
    MapKeyToTuple = "mapKeyToTuple",
    MapValue = "mapValue",
    SetValue = "setValue",
    FinalizationRegistryToTarget = "finalizationToTarget",
    FinalizationRegistryToTuple = "finalizationRegistryToTuple",
    FinalizationTargetToTuple = "finalizationTargetToTuple",
    FinalizationTupleToHeldValue = "finalizationTupleToHeldValue",
    FinalizationTupleToUnregisterToken = "finalizationTupleToUnregisterToken",
    ObjectToPrivateKey = "objectToPrivateKey",
    ObjectToPrivateTuple = "objectToPrivateTuple",
    PrivateKeyToTuple = "privateKeyToTuple",
    PrivateTupleToValue = "privateValue",
    PrivateTupleToGetter = "privateGetter"
}

type constants_BuiltInJSTypeName = BuiltInJSTypeName;
declare const constants_BuiltInJSTypeName: typeof BuiltInJSTypeName;
type constants_ChildReferenceEdgeType = ChildReferenceEdgeType;
declare const constants_ChildReferenceEdgeType: typeof ChildReferenceEdgeType;
type constants_EdgePrefix = EdgePrefix;
declare const constants_EdgePrefix: typeof EdgePrefix;
type constants_NodePrefix = NodePrefix;
declare const constants_NodePrefix: typeof NodePrefix;
type constants_ValueDiscrimant = ValueDiscrimant;
declare const constants_ValueDiscrimant: typeof ValueDiscrimant;
declare namespace constants {
  export {
    constants_BuiltInJSTypeName as BuiltInJSTypeName,
    constants_ChildReferenceEdgeType as ChildReferenceEdgeType,
    constants_EdgePrefix as EdgePrefix,
    constants_NodePrefix as NodePrefix,
    constants_ValueDiscrimant as ValueDiscrimant,
  };
}

type PrefixedNumber<Prefix extends string> = `${Prefix}:${number}`;

type ObjectId = PrefixedNumber<"object" | "target" | "heldValues">;
type SymbolId = PrefixedNumber<"symbol" | "target">;

interface NotApplicableValueDescription {
  readonly valueType: ValueDiscrimant.NotApplicable,
}

interface ObjectValueDescription {
  readonly valueType: ValueDiscrimant.Object,
  readonly objectId: ObjectId,
}

interface SymbolValueDescription {
  readonly valueType: ValueDiscrimant.Symbol;
  readonly symbolId: SymbolId,
}

interface BigIntValueDescription {
  readonly valueType: ValueDescription.BigInt;
  readonly bigintStringValue: string;
}

interface PrimitiveValueDescription {
  readonly valueType: ValueDiscrimant.Primitive;
  readonly primitiveValue: boolean | number | string | undefined | null;
}

type ValueDescription = (
  NotApplicableValueDescription |
  ObjectValueDescription |
  SymbolValueDescription |
  BigIntValueDescription |
  PrimitiveValueDescription
);

interface GraphNodeWithMetadata<ObjectMetadata extends JsonObject | null> {
  readonly metadata: ObjectMetadata,
}

interface GraphEdgeWithMetadata<RelationshipMetadata extends JsonObject | null> {
  label: string;
  readonly edgeType: EdgePrefix;
  description: ReadonlyDeep<ValueDescription>;
  readonly metadata: RelationshipMetadata;
  readonly isStrongReference: boolean;
}

interface GraphObjectMetadata extends JsonObject {
  readonly builtInJSTypeName: BuiltInJSTypeName;
  readonly derivedClassName: string;
  classSpecifier?: string;
  classLineNumber?: number;
}

interface GraphRelationshipMetadata extends JsonObject {
  parentToChildEdgeType: ChildReferenceEdgeType
}

type JSGraphNode = ReadonlyDeep<GraphNodeWithMetadata<GraphObjectMetadata>>;
type JSGraphEdge = ReadonlyDeep<GraphEdgeWithMetadata<GraphRelationshipMetadata>>;

export { constants as JSGraphConstants, LoggingConfiguration, runSearchesInGuestEngine };
export type { GuestRealmInputs, JSGraphEdge, JSGraphNode, SearchConfiguration };
