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
    log(message, noIndent) {
        this.#currentLogs.push(message);
    }
}
