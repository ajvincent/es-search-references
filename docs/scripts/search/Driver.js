import { SearchLogsConfiguration, } from "./LoggingConfiguration.js";
import { SearchResults, } from "./Results.js";
import { WebGuestRealmInputs } from "./WebGuestRealmInputs.js";
import { runSearchesInGuestEngine, } from "../../lib/packages/runSearchesInGuestEngine.js";
import { AwaitedMap } from "./AwaitedMap.js";
import { DefaultMap } from "./DefaultMap.js";
export class SearchDriver {
    #fileMap;
    constructor(fileMap) {
        this.#fileMap = fileMap;
    }
    run(pathsToRun) {
        const map = new AwaitedMap(pathsToRun.map(pathToFile => [pathToFile, this.#runURL(pathToFile)]));
        return map.allResolved();
    }
    async #runURL(pathToFile) {
        const config = new SearchLogsConfiguration;
        const inputs = new WebGuestRealmInputs(pathToFile, this.#fileMap);
        const allSearches = await runSearchesInGuestEngine(inputs, config);
        const resultsMap = new DefaultMap(() => new SearchResults);
        allSearches.forEach((graphOrNull, key) => {
            resultsMap.getDefault(key).graph = graphOrNull;
        });
        config.logsMap.forEach((logs, key) => {
            resultsMap.getDefault(key).logs = logs;
        });
        return resultsMap;
    }
}
