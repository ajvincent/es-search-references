export type UUID = ReturnType<Crypto["randomUUID"]>;
export type FileSystemsRecords = { [ key: UUID ]: string };

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

interface MethodRejectedMessage<
  ServiceName extends string
> extends MethodMessageBase<ServiceName> 
{
  readonly isSuccess: false;
  readonly exception: unknown;
}

export type RequestMessageUnion<Type> = {
  [key in keyof Type]: Type[key] extends (...args: any[]) => any ? key extends string ? MethodParametersMessage<key, Type[key]> : never : never;
}[keyof Type];

export type FulfillMessageUnion<Type> = {
  [key in keyof Type]: Type[key] extends (...args: any[]) => any ? key extends string ? MethodFulfilledMessage<key, Type[key]> : never : never;
}[keyof Type];

export type RejectMessageUnion<Type> = {
  [key in keyof Type]: Type[key] extends (...args: any[]) => any ? key extends string ? MethodRejectedMessage<key> : never : never;
}[keyof Type];

export type WorkerUnionExtract<
  Type,
  UnionType extends RequestMessageUnion<Type> | FulfillMessageUnion<Type>,
  ServiceName extends keyof Type
> = Extract<UnionType, { serviceName: ServiceName } >;
