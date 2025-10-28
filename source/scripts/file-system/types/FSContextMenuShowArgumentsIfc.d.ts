export interface FSContextMenuShowArgumentsIfc {
  readonly event: MouseEvent;
  readonly pathToFile: string;
  readonly leafName: string;
  readonly isReservedName: boolean;
  readonly pathIsProtocol: boolean;
  readonly isDirectory: boolean;
  readonly currentChildren: ReadonlySet<string>;
  readonly currentSiblings: ReadonlySet<string>;
  readonly currentPackages: ReadonlySet<string>;
  readonly currentProtocols: ReadonlySet<string>;
}
