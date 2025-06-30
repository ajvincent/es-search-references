import type {
  Simplify,
  SimplifyDeep
} from "type-fest";

import type {
  OPFSFileSystemIfc
} from "./file-system.d.ts";

export type UUID = ReturnType<Crypto["randomUUID"]>;

interface MethodMessageBase<ServiceName extends string> {
  readonly serviceName: ServiceName;
  readonly uuid: UUID;
}

interface MethodParametersMessage<
  ServiceName extends string,
  Method extends (...args: Jsonifiable[]) => Promise<Jsonifiable>
> extends MethodMessageBase<ServiceName>
{
  readonly parameters: Parameters<Method>;
}

interface MethodFulfilledMessage<
    ServiceName extends string, 
    Method extends (...args: Jsonifiable[]) => Jsonifiable
> extends MethodMessageBase<ServiceName>
{
  readonly isSuccess: true;
  readonly result: Awaited<ReturnType<Method>>;
}

export interface MethodRejectedMessage<
  ServiceName extends string
> extends MethodMessageBase<ServiceName> 
{
  readonly isSuccess: false;
  readonly exception: unknown;
}

type RequestMessageUnion<Type> = {
  [key in keyof Type]: Type[key] extends (...args: any[]) => any ? key extends string ? MethodParametersMessage<key, Type[key]> : never : never;
}[keyof Type];

type FulfillMessageUnion<Type> = {
  [key in keyof Type]: Type[key] extends (...args: any[]) => any ? key extends string ? MethodFulfilledMessage<key, Type[key]> : never : never;
}[keyof Type];

type RejectMessageUnion<Type> = {
  [key in keyof Type]: Type[key] extends (...args: any[]) => any ? key extends string ? MethodRejectedMessage<key> : never : never;
}[keyof Type];

export type OPFSRequestMessageUnion = SimplifyDeep<RequestMessageUnion<OPFSFileSystemIfc>>;
export type OPFSFulfillMessageUnion = SimplifyDeep<FulfillMessageUnion<OPFSFileSystemIfc>>;
export type OPFSRejectMessageUnion = SimplifyDeep<RejectMessageUnion<OPFSFileSystemIfc>>;

export type OPFSExtract<
  UnionType extends OPFSRequestMessageUnion | OPFSFulfillMessageUnion,
  ServiceName extends UnionType["serviceName"]
> = Extract<
  UnionType, { serviceName: ServiceName }
>;
