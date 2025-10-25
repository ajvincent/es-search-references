/* This is for the context menu. */
export interface FSControllerCallbacksIfc {
  getTreeRowsElement(): HTMLElement;
  readonly isReadOnly: boolean;
  readonly clipBoardHasCopy: boolean;

  showFSContextMenu(
    event: MouseEvent,
    pathToFile: string,
    isDirectory: boolean
  ): void;
}
