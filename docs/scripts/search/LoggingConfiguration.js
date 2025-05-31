export class SearchLogsConfiguration {
    logsMap = new Map;
    #currentLogs;
    noFunctionEnvironment = false;
    internalErrorTrap() {
        // eslint-disable-next-line no-debugger
        debugger;
    }
    beginSearch(sourceSpecifier, resultsKey) {
        this.#currentLogs = [];
        this.logsMap.set(resultsKey, this.#currentLogs);
        this.log("enter " + sourceSpecifier + ": " + resultsKey, 0);
    }
    endSearch(sourceSpecifier, resultsKey) {
        this.log("leave " + sourceSpecifier + ": " + resultsKey, 0);
        this.#currentLogs = undefined;
    }
    enterNodeIdTrap(nodeId) {
        this.log("enter search nodeId: " + nodeId, 1);
    }
    leaveNodeIdTrap(nodeId) {
        this.log("leave search nodeId: " + nodeId, 1);
    }
    defineNodeTrap(parentId, weakKey, details) {
        this.log(`defineNode: parentId=${parentId} weakKeyId=${weakKey} ${details}`);
    }
    defineEdgeTrap(parentId, edgeId, childId, secondParentId, isStrongReference) {
        const secondIdPart = secondParentId ? " + " + secondParentId : "";
        this.log(`defineEdgeTrap: ${parentId}${secondIdPart} via ${edgeId} to ${childId}, isStrongReference: ${isStrongReference}`);
    }
    defineWeakKeyTrap(weakKey) {
        this.log("weak key defined: " + weakKey);
    }
    ;
    markStrongNodeTrap(nodeId) {
        this.log("mark strong node: " + nodeId);
    }
    ;
    log(message, indentLevel = 2) {
        message = "  ".repeat(indentLevel) + message;
        this.#currentLogs.push(message);
    }
}
