import type {
  dagre
} from "../../lib/packages/dagre-imports.js";

import {
  runSearchesInGuestEngine,
} from "../../lib/packages/runSearchesInGuestEngine.js";

import {
  AwaitedMap
} from "../utilities/AwaitedMap.js";

import {
  DefaultMap
} from "./DefaultMap.js";

import {
  SearchLogsConfiguration,
} from "./LoggingConfiguration.js";

import {
  SearchResults,
} from "./Results.js";

import {
  WebGuestRealmInputs
} from "./WebGuestRealmInputs.js";

export class SearchDriver {
  #fileMap: ReadonlyMap<string, string>;
  constructor(
    fileMap: ReadonlyMap<string, string>
  )
  {
    this.#fileMap = fileMap;
  }

  run(
    pathsToRun: readonly string[]
  ): Promise<ReadonlyMap<string, ReadonlyMap<string, SearchResults>>>
  {
    const map = new AwaitedMap<string, ReadonlyMap<string, SearchResults>>(pathsToRun.map(
      pathToFile => [pathToFile, this.#runURL(pathToFile)]
    ));
    return map.allResolved();
  }

  async #runURL(pathToFile: string): Promise<ReadonlyMap<string, SearchResults>>
  {
    const config = new SearchLogsConfiguration;
    const inputs = new WebGuestRealmInputs(pathToFile, this.#fileMap);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const allSearches: ReadonlyMap<string, dagre.graphlib.Graph | null> = await runSearchesInGuestEngine(inputs, config);

    const resultsMap = new DefaultMap<string, SearchResults>(() => new SearchResults);
    allSearches.forEach((graphOrNull, key) => {
      resultsMap.getDefault(key).graph = graphOrNull;
    });
    config.logsMap.forEach((logs, key) => {
      resultsMap.getDefault(key).logs = logs;
    });

    return resultsMap;
  }
}
