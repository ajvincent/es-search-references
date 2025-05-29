import { LoggingConfiguration, } from "../../lib/packages/runSearchesInGuestEngine.js";
export class SearchLogsConfiguration extends LoggingConfiguration {
    logsMap = new Map;
    #currentLogs;
    beginSearch(sourceSpecifier, resultsKey) {
        this.#currentLogs = [];
        this.logsMap.set(resultsKey, this.#currentLogs);
    }
    endSearch(sourceSpecifier, resultsKey) {
        this.#currentLogs = undefined;
    }
    log(message, indentLevel = 2) {
        message = "  ".repeat(indentLevel - 1) + message;
        this.#currentLogs.push(message);
    }
}
