import type { dagre } from "../../lib/packages/dagre-imports.js";

export class SearchResults {
  logs: string[] = [];
  graph: dagre.graphlib.Graph<{}> | null = null;
  layoutGraph: dagre.graphlib.Graph<{}> | null = null;
}
