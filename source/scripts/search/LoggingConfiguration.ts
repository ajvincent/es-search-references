import {
  LoggingConfiguration,
} from "../../lib/packages/runSearchesInGuestEngine.js";

export class SearchLogsConfiguration extends LoggingConfiguration {
  public logsMap = new Map<string, string[]>;
  #currentLogs: string[] | undefined;

  beginSearch(sourceSpecifier: string, resultsKey: string): void {
    this.#currentLogs = [];
    this.logsMap.set(resultsKey, this.#currentLogs);
  }

  endSearch(sourceSpecifier: string, resultsKey: string): void {
    this.#currentLogs = undefined;
  }

  log(message: string, indentLevel = 2): void {
    message = "  ".repeat(indentLevel - 1) + message;
    this.#currentLogs!.push(message);
  }
}
