import { runSearchesInGuestEngine, } from "../../lib/packages/runSearchesInGuestEngine.js";
import { AwaitedMap } from "../utilities/AwaitedMap.js";
import { DefaultMap } from "./DefaultMap.js";
import { SearchLogsConfiguration, } from "./LoggingConfiguration.js";
import { SearchResults, } from "./Results.js";
import { WebGuestRealmInputs } from "./WebGuestRealmInputs.js";
export class SearchDriver {
    #fileMap;
    constructor(fileMap) {
        this.#fileMap = fileMap;
    }
    async run(pathsToRun) {
        const map = new AwaitedMap(pathsToRun.map(pathToFile => [pathToFile, this.#runURL(pathToFile)]));
        try {
            return await map.allResolved();
        }
        catch (ex) {
            for (const [location, error] of ex.errorMap) {
                console.log("failed pathToRun: " + location);
                console.error(error);
            }
            throw ex;
        }
    }
    async #runURL(pathToFile) {
        const config = new SearchLogsConfiguration;
        const inputs = new WebGuestRealmInputs(pathToFile, this.#fileMap);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
