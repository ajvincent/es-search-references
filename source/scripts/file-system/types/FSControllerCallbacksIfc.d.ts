/* This is for the context menu. */
export interface FSControllerCallbacksIfc {
  getTreeRowsElement(): HTMLElement;
  readonly isReadOnly: boolean;
  readonly clipBoardHasCopy: boolean;

  showFSContextMenu(
    event: MouseEvent,
    pathToFile: string,
    isDirectory: boolean
  ): Promise<void>;

  addNewFile(
    currentDirectory: string,
    leafName: string,
    isDirectory: boolean
  ): Promise<void>;

  addPackage(
    packageName: string
  ): Promise<void>;

  addProtocol(
    protocolName: `${string}://`
  ): Promise<void>;

  deleteFile(
    pathToFile: string
  ): Promise<void>;

  renameFile(
    currentPathToFile: string,
    newLeafName: string,
  ): Promise<void>;

  copyToClipboard(
    currentPathToFile: string,
    isCut: boolean
  ): Promise<void>;

  copyFromClipboard(
    currentDirectory: string,
    leafName: string,
    isDirectory: boolean,
  ): Promise<void>;
}
