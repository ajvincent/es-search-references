import type {
  SearchConfiguration,
} from "../../lib/packages/runSearchesInGuestEngine.js";

export class SearchLogsConfiguration implements Required<SearchConfiguration> {
  public logsMap = new Map<string, string[]>;
  #currentLogs: string[] | undefined;

  readonly noFunctionEnvironment = false;

  internalErrorTrap(): void {
    // eslint-disable-next-line no-debugger
    debugger;
  }

  beginSearch(sourceSpecifier: string, resultsKey: string): void {
    this.#currentLogs = [];
    this.logsMap.set(resultsKey, this.#currentLogs);
    this.log("enter " + sourceSpecifier + ": " + resultsKey, 0);
  }

  endSearch(sourceSpecifier: string, resultsKey: string): void {
    this.log("leave " + sourceSpecifier + ": " + resultsKey, 0);
    this.#currentLogs = undefined;
  }

  enterNodeIdTrap(nodeId: string): void {
    this.log("enter search nodeId: " + nodeId, 1);
  }

  leaveNodeIdTrap(nodeId: string): void {
    this.log("leave search nodeId: " + nodeId, 1);
  }

  defineNodeTrap(parentId: string, weakKey: string, details: string): void {
    this.log(`defineNode: parentId=${parentId} weakKeyId=${weakKey} ${details}`);
  }

  defineEdgeTrap(
    parentId: string,
    edgeId: string,
    childId: string,
    secondParentId: string | undefined,
    isStrongReference: boolean
  ): void
  {
    const secondIdPart = secondParentId ? " + " + secondParentId : "";
    this.log(
      `defineEdgeTrap: ${parentId}${secondIdPart} via ${edgeId} to ${childId}, isStrongReference: ${isStrongReference}`
    );
  }

  defineWeakKeyTrap(weakKey: string): void {
    this.log("weak key defined: " + weakKey);
  };

  markStrongNodeTrap(nodeId: string): void {
    this.log("mark strong node: " + nodeId);
  };

  log(message: string, indentLevel = 2): void {
    message = "  ".repeat(indentLevel) + message;
    this.#currentLogs!.push(message);
  }
}
